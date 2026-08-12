"""Read-only client for Marketo's Activities API.

These are the same credentials the live site uses to submit forms, and
Marketo's rate limit is per-instance, not per-consumer. A greedy loop
here starves the production submission endpoint. Requests are therefore
strictly sequential with a deliberate pause between pages, and the walk
is capped so a runaway window cannot burn the daily quota.
"""

import json
import time
import urllib.error
import urllib.parse
import urllib.request

FILL_OUT_FORM_ACTIVITY_ID = 2
DEFAULT_SLEEP_SECONDS = 0.5
DEFAULT_MAX_PAGES = 50


class MarketoError(Exception):
    """Marketo reported a failure, or returned something unusable."""


def _http_get_json(url):
    """Fetch and decode JSON, raising MarketoError on any failure.

    A raise here throws away every page already paid for, so the caller
    gets one line naming the cause rather than a raw traceback: a
    transient 502 on page 40 of 50 should read as a Marketo failure,
    not as a crash. The URL is never quoted back -- it carries the
    client secret and the access token in its query string. HTTPError
    subclasses URLError, so it has to be caught first.
    """
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as error:
        raise MarketoError(
            f"HTTP {error.code} from Marketo ({error.reason})"
        ) from error
    except urllib.error.URLError as error:
        raise MarketoError(
            f"could not reach Marketo ({error.reason})"
        ) from error
    except json.JSONDecodeError as error:
        raise MarketoError(
            f"Marketo returned a body that is not JSON ({error})"
        ) from error


class MarketoActivityClient:
    def __init__(
        self,
        base_url,
        client_id,
        client_secret,
        fetch=None,
        sleeper=None,
        sleep_seconds=DEFAULT_SLEEP_SECONDS,
    ):
        self.base_url = base_url.rstrip("/")
        self.client_id = client_id
        self.client_secret = client_secret
        self.fetch = fetch or _http_get_json
        self.sleeper = sleeper or time.sleep
        self.sleep_seconds = sleep_seconds
        self.token = None
        self.pages_fetched = 0
        self.hit_page_cap = False

    def _get(self, path, params):
        url = f"{self.base_url}{path}?{urllib.parse.urlencode(params)}"
        payload = self.fetch(url)
        errors = payload.get("errors")
        if errors:
            detail = ", ".join(
                f"{error.get('code')}: {error.get('message')}"
                for error in errors
            )
            raise MarketoError(f"{path} failed -- {detail}")
        return payload

    def authenticate(self):
        payload = self.fetch(
            f"{self.base_url}/identity/oauth/token?"
            + urllib.parse.urlencode(
                {
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                }
            )
        )
        token = payload.get("access_token")
        if not token:
            raise MarketoError("authentication returned no access token")
        self.token = token
        return token

    def _paging_token(self, since):
        payload = self._get(
            "/rest/v1/activities/pagingtoken.json",
            {
                "sinceDatetime": since.strftime("%Y-%m-%dT%H:%M:%S%z"),
                "access_token": self.token,
            },
        )
        token = payload.get("nextPageToken")
        if not token:
            raise MarketoError("no paging token returned")
        return token

    def iter_activities(
        self,
        since,
        until,
        activity_type_id=FILL_OUT_FORM_ACTIVITY_ID,
        max_pages=DEFAULT_MAX_PAGES,
    ):
        """Yield activity records between since and until.

        Sets hit_page_cap when max_pages stopped the walk before Marketo
        said there was nothing left. Callers must surface that.
        """
        self.pages_fetched = 0
        self.hit_page_cap = False

        if not self.token:
            self.authenticate()

        page_token = self._paging_token(since)
        until_stamp = until.strftime("%Y-%m-%dT%H:%M:%SZ")

        while True:
            if self.pages_fetched >= max_pages:
                self.hit_page_cap = True
                return

            if self.pages_fetched:
                self.sleeper(self.sleep_seconds)

            payload = self._get(
                "/rest/v1/activities.json",
                {
                    "nextPageToken": page_token,
                    "activityTypeIds": activity_type_id,
                    "access_token": self.token,
                },
            )
            self.pages_fetched += 1

            for record in payload.get("result") or []:
                activity_date = record.get("activityDate")
                if not activity_date:
                    # Marketo's schema guarantees activityDate on every
                    # activity, so this should never fire. If it does,
                    # the data is genuinely wrong -- silently folding an
                    # unknown-date record into a windowed count would be
                    # quiet corruption of the reported stats, so raise
                    # instead of guessing whether it belongs in range.
                    raise MarketoError("activity record missing activityDate")
                if activity_date > until_stamp:
                    return
                yield record

            if not payload.get("moreResult"):
                return

            next_token = payload.get("nextPageToken")
            if not next_token:
                # Reusing the current token would silently re-fetch the
                # same page up to max_pages times, multiplying every
                # activity on it. An overcount nobody notices is worse
                # than a loud stop.
                raise MarketoError(
                    "Marketo reported more results but returned no "
                    "nextPageToken; stopping rather than re-fetching "
                    "the same page and double-counting"
                )
            page_token = next_token
