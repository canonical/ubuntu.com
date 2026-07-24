import logging
import secrets
import time
from typing import List
from urllib.parse import urlparse

import flask
import sentry_sdk
from canonicalwebteam import image_template
from canonicalwebteam.discourse import RateLimitedError
from slugify import slugify

from webapp.constants import (
    CSP,
    CSP_REPORT_DEDUP_WINDOW,
    CSP_REPORT_IGNORED_HOSTS,
    CSP_REPORT_MAX_BYTES,
    CSP_REPORT_ONLY,
    CSP_REPORT_PATH,
    NONCED_DIRECTIVES,
)
from webapp.context import (
    current_year,
    date_has_passed,
    descending_years,
    format_date,
    format_to_id,
    get_careers_role_counts,
    get_json_feed,
    get_navigation,
    get_secondary_navigation,
    modify_query,
    month_name,
    months_list,
    products,
    releases,
    schedule_banner,
    sort_by_key_and_ordered_list,
    split_list,
)
from webapp.login import empty_session, user_info
from webapp.security.api import SecurityAPIError
from webapp.shop.api.ua_contracts.api import (
    UAContractsAPIError,
    UAContractsAPIErrorView,
    UnauthorizedError,
    UnauthorizedErrorView,
)
from webapp.shop.flaskparser import UAContractsValidationError
from webapp.certified.helpers import convert_markdown_to_html
from canonicalwebteam.flask_base.env import get_flask_env

logger = logging.getLogger(__name__)

# Cache Discourse-backed pages longer than the 60s flask-base default;
# our after_request runs first so this max-age wins.
LONG_CACHE_SECONDS = 10800  # 3 hours

# Community pages degrade to an empty 200 on Discourse error, so cache
# them shorter to avoid freezing a degraded page (docs 503 instead).
COMMUNITY_CACHE_SECONDS = 300

# Serve the last good copy during an origin outage (flask-base default 300s).
LONG_CACHE_STALE_IF_ERROR = 3600

# Exact paths (no trailing segment) that should get the longer cache.
LONG_CACHE_EXACT = frozenset(
    {
        "/engage",
        "/takeovers",
        "/tutorials",
        "/tutorials.json",
        "/community",
        "/community/docs",
        "/community/events",
        "/community/circles",
        "/community/uwn",
        "/openstack/install",
        "/ceph/docs",
        "/openstack/docs",
        "/security/livepatch/docs",
        "/security/certifications/docs",
    }
)

# Path prefixes whose sub-pages should get the longer cache.
LONG_CACHE_PREFIXES = (
    "/engage/",
    "/tutorials/",
    "/community/docs/",
    "/community/uwn/",
    "/ceph/docs/",
    "/openstack/docs/",
    "/security/livepatch/docs/",
    "/security/certifications/docs/",
)


def _should_long_cache(path):
    return path in LONG_CACHE_EXACT or path.startswith(LONG_CACHE_PREFIXES)


def _long_cache_seconds(path):
    if (
        path == "/community" or path.startswith("/community/")
    ) and not path.startswith("/community/docs"):
        return COMMUNITY_CACHE_SECONDS
    return LONG_CACHE_SECONDS


# ---------------------------------------------------------------------------
# CSP violation report throttling
# ---------------------------------------------------------------------------
# CSP violation reports arrive on nearly every page load, so forwarding them
# verbatim would flood Sentry and burn the event budget. Two layers protect
# us:
#   1. An ignore-list of hosts already triaged as pure noise; their reports
#      are dropped entirely (no log, no Sentry event).
#   2. Per-signature de-duplication: for everything else we forward at most
#      one event per (disposition, directive, host) per dedup window,
#      keeping visibility of each distinct violation without the volume.


def _csp_blocked_host(blocked_uri):
    """
    Reduce a blocked-uri to a stable host so query strings / cache-busters
    don't explode the cardinality. Non-URL tokens such as "inline", "eval"
    or "data" are returned as-is.
    """
    if not blocked_uri:
        return ""
    host = urlparse(blocked_uri).hostname
    if host:
        return host
    return blocked_uri.split(":", 1)[0]


def _is_ignored_csp_host(host):
    """True if `host` is, or is a subdomain of, an ignored host."""
    return any(
        host == ignored or host.endswith("." + ignored)
        for ignored in CSP_REPORT_IGNORED_HOSTS
    )


class _CSPReportThrottler:
    """
    In-memory, per-worker de-duplication for CSP violation reports.

    Remembers the signature of each violation it has forwarded and
    suppresses repeats within `window` seconds. The cache is bounded to
    `max_entries`; when full it evicts stale entries first, then the
    oldest half as a last resort so the expensive sort runs rarely.
    """

    def __init__(self, window, max_entries=1000):
        self._window = window
        self._max_entries = max_entries
        # signature tuple -> monotonic timestamp it was last forwarded.
        self._seen = {}

    def should_report(self, signature):
        """Return True only the first time a signature is seen per window."""
        now = time.monotonic()
        last_sent = self._seen.get(signature)
        if last_sent is not None and now - last_sent < self._window:
            return False
        if len(self._seen) >= self._max_entries:
            self._evict(now)
        self._seen[signature] = now
        return True

    def _evict(self, now):
        """Drop entries past the window, then the oldest half if still full."""
        for signature, last_sent in list(self._seen.items()):
            if now - last_sent >= self._window:
                del self._seen[signature]
        if len(self._seen) >= self._max_entries:
            oldest = sorted(self._seen, key=self._seen.get)
            for signature in oldest[: self._max_entries // 2]:
                del self._seen[signature]


_csp_throttler = _CSPReportThrottler(CSP_REPORT_DEDUP_WINDOW)


def _forward_csp_violation(violation, host, directive, disposition):
    """
    Log a concise line and send a trimmed payload to Sentry. The raw
    report is dropped on the floor - notably its huge "original-policy"
    field, which is pure noise in the trace.
    """
    blocked_uri = violation.get("blocked-uri", "")
    document_uri = violation.get("document-uri", "")
    target = host or blocked_uri or "unknown"

    logger.warning(
        "CSP [%s] %s blocked %s (%s)",
        disposition,
        directive,
        target,
        document_uri or "unknown",
    )

    with sentry_sdk.new_scope() as scope:
        scope.set_extra(
            "csp-report",
            {
                "disposition": disposition,
                "violated-directive": directive,
                "blocked-uri": blocked_uri,
                "document-uri": document_uri,
                "line-number": violation.get("line-number"),
                "column-number": violation.get("column-number"),
            },
        )
        scope.fingerprint = ["csp-violation", directive, host or "unknown"]
        sentry_sdk.capture_message(
            f"CSP violation ({disposition}): {directive} blocked {target}",
            level="warning",
        )


def init_handlers(app):
    @app.route(CSP_REPORT_PATH, methods=["POST"])
    def csp_report():
        """
        Browsers POST violations here for both the enforced CSP and the
        Content-Security-Policy-Report-Only header (report bodies include
        a "disposition" field of "enforce" or "report" to tell them apart).

        This endpoint is unauthenticated by necessity (browsers send these
        reports with no credentials), so it's a public write target: we cap
        the body size and only forward reports whose document-uri names
        this host, then drop known-noisy hosts outright and de-duplicate
        everything else before forwarding to Sentry.
        """
        content_length = flask.request.content_length
        if (
            content_length is not None
            and content_length > CSP_REPORT_MAX_BYTES
        ):
            return "", 413

        report = flask.request.get_json(silent=True, force=True) or {}
        violation = report.get("csp-report")
        if not violation:
            return "", 204

        document_host = urlparse(violation.get("document-uri", "")).hostname
        if document_host != flask.request.host.split(":")[0]:
            return "", 204

        host = _csp_blocked_host(violation.get("blocked-uri", ""))
        directive = violation.get("violated-directive", "unknown")
        disposition = violation.get("disposition", "enforce")
        signature = (disposition, directive, host)

        if _is_ignored_csp_host(host):
            return "", 204
        if not _csp_throttler.should_report(signature):
            return "", 204

        _forward_csp_violation(violation, host, directive, disposition)
        return "", 204

    @app.after_request
    def cache_headers(response):
        """
        Adjust Cache-Control for specific routes
        """

        disable_cache_on = (
            "/account",
            "/advantage",
            "/pro",
            "/core/build",
            "/account.json",
        )

        if flask.request.path.startswith(disable_cache_on):
            response.cache_control.no_store = True

        # Prevent XSS
        if flask.request.path.startswith("/certified"):
            response.headers["X-Frame-Options"] = "DENY"

        # Longer cache for Discourse-backed pages. Skip previews and
        # thank-you (personalised), and defer to any view's own headers.
        path = flask.request.path
        if (
            response.status_code == 200
            and flask.request.method == "GET"
            and not flask.request.args.get("preview")
            and not path.endswith("/thank-you")
            # Docs blueprints expose Google-backed search under their
            # prefix (e.g. /ceph/docs/search); those are not Discourse.
            and not path.endswith("/search")
            and not response.cache_control.no_store
            and not response.cache_control.no_cache
            and not response.cache_control.private
            and response.cache_control.max_age is None
            and _should_long_cache(path)
        ):
            response.cache_control.public = True
            response.cache_control.max_age = _long_cache_seconds(path)
            response.cache_control._set_cache_value(
                "stale-if-error", str(LONG_CACHE_STALE_IF_ERROR), int
            )

        return response

    # Error pages
    @app.errorhandler(400)
    def bad_request_error(error):
        return (
            flask.render_template("400.html", message=error.description),
            400,
        )

    @app.errorhandler(403)
    def forbidden_error(error):
        return (
            flask.render_template("403.html", message=error.description),
            403,
        )

    @app.errorhandler(410)
    def deleted_error(error):
        return (
            flask.render_template("410.html", message=error.description),
            410,
        )

    @app.errorhandler(429)
    def too_many_requests(error):
        """
        Endpoint abuse error
        """
        custom_error = f"{error.description}. Please try again tomorrow."
        return flask.render_template("429.html", message=custom_error), 429

    @app.errorhandler(503)
    def service_unavailable(error):
        """
        Rendered when an upstream API (e.g. Discourse) is rate-limiting
        us and there is no cached response to fall back on. Reuses the
        styled 500 template (the directory_parser sitemap excludes it,
        and it is the app's standard "couldn't load this page" error)
        rather than leaking the internal reason to users.

        JSON endpoints get a JSON body so their fetch() consumers don't
        choke on HTML, and Retry-After tells well-behaved clients and
        crawlers when to come back.
        """
        accepts = flask.request.accept_mimetypes
        wants_json = flask.request.path.endswith(".json") or (
            accepts.accept_json and not accepts.accept_html
        )
        if wants_json:
            response = flask.make_response(
                flask.jsonify(error="Service temporarily unavailable"),
                503,
            )
        else:
            response = flask.make_response(
                flask.render_template("500.html"), 503
            )

        retry_after = getattr(error, "retry_after", None)
        response.headers["Retry-After"] = str(retry_after or 60)
        return response

    @app.errorhandler(RateLimitedError)
    def discourse_rate_limited(error):
        """
        The discourse package raises RateLimitedError when Discourse
        returns 429 and no cached response is available; serve the same
        503 as any other upstream outage.
        """
        return service_unavailable(error)

    @app.errorhandler(SecurityAPIError)
    def security_api_error(error):
        message = "An error occurred while fetching security data"
        try:
            response_data = error.response.json()
            message = response_data.get("message", message)
        except (ValueError, AttributeError):
            pass

        return (
            flask.render_template(
                "security-error-500.html",
                message=message,
            ),
            500,
        )

    @app.errorhandler(UAContractsValidationError)
    def ua_contracts_validation_error(error):
        return flask.jsonify({"errors": error.response.messages}), 422

    @app.errorhandler(UAContractsAPIError)
    @app.errorhandler(UnauthorizedError)
    def ua_contracts_api_error(error):
        if error.response.status_code == 401:
            empty_session(flask.session)

        return (
            flask.jsonify({"errors": error.response.json()["message"]}),
            error.response.status_code or 500,
        )

    @app.errorhandler(UAContractsAPIErrorView)
    @app.errorhandler(UnauthorizedErrorView)
    def ua_contracts_api_error_view(error):
        if error.response.status_code == 401:
            empty_session(flask.session)

            return flask.redirect(flask.request.url)

        return flask.render_template("500.html"), 500

    # Template context
    @app.context_processor
    def context():
        return {
            "current_year": current_year,
            "descending_years": descending_years,
            "format_date": format_date,
            "get_json_feed": get_json_feed,
            "modify_query": modify_query,
            "month_name": month_name,
            "months_list": months_list,
            "get_secondary_navigation": get_secondary_navigation,
            "get_stripe_publishable_key": get_flask_env(
                "STRIPE_PUBLISHABLE_KEY",
                "pk_live_68aXqowUeX574aGsVck8eiIE",
            ),
            "product": flask.request.args.get("product", ""),
            "products_yaml": products(),
            "request": flask.request,
            "releases_yaml": releases(),
            "user_info": user_info(flask.session),
            "utm_campaign": flask.request.args.get("utm_campaign", ""),
            "utm_content": flask.request.args.get("utm_content", ""),
            "utm_medium": flask.request.args.get("utm_medium", ""),
            "utm_source": flask.request.args.get("utm_source", ""),
            "CAPTCHA_TESTING_API_KEY": get_flask_env(
                "CAPTCHA_TESTING_API_KEY",
                "6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if",
            ),
            "http_host": flask.request.host,
            "schedule_banner": schedule_banner,
            "get_navigation": get_navigation,
            "split_list": split_list,
            "format_to_id": format_to_id,
            "get_careers_role_counts": get_careers_role_counts,
        }

    def get_countries_list() -> List[dict]:
        """
        Get a list of countries in a standard format
        """
        from pycountry import countries

        countries = [
            {
                "alpha2": country.alpha_2,
                "name": getattr(country, "common_name", country.name),
            }
            for country in list(countries)
        ]
        return sorted(countries, key=lambda x: x["name"])

    @app.context_processor
    def utility_processor():
        return {
            "image": image_template,
            "get_countries_list": get_countries_list,
        }

    @app.before_request
    def set_csp_nonce():
        flask.g.csp_nonce = secrets.token_urlsafe(16)

    @app.context_processor
    def inject_csp_nonce():
        return {"csp_nonce": getattr(flask.g, "csp_nonce", "")}

    @app.after_request
    def add_headers(response):
        """
        Generic rules for headers to add to all requests
        - Content-Security-Policy: Restrict resources (e.g., JavaScript, CSS,
        Images) and URLs
        - Content-Security-Policy-Report-Only: A stricter, non-blocking
        variant used to bake in the removal of suspected-stale CSP sources
        (see CSP_REPORT_ONLY in webapp.constants) before dropping them from
        the enforced policy above
        - Referrer-Policy: Limit referrer data for security while preserving
        full referrer for same-origin requests
        - Cross-Origin-Embedder-Policy: allows embedding cross-origin
        resources
        - Cross-Origin-Opener-Policy: enable the page to open pop-ups while
        maintaining same-origin policy
        - Cross-Origin-Resource-Policy: allowing cross-origin requests to
        access the resource
        - X-Permitted-Cross-Domain-Policies: disallows cross-domain access to
        resources.
        - X-Robots-Tag: prevents search engines from indexing the page
        """

        def get_csp_as_str(csp={}, nonce=None):
            csp_str = ""
            for key, values in csp.items():
                directive_values = list(values)
                if nonce and key in NONCED_DIRECTIVES:
                    directive_values.append(f"'nonce-{nonce}'")
                csp_value = " ".join(directive_values)
                csp_str += f"{key} {csp_value}; "
            return csp_str.strip()

        nonce = getattr(flask.g, "csp_nonce", None)
        response.headers["Content-Security-Policy"] = get_csp_as_str(
            CSP, nonce=nonce
        )
        response.headers["Content-Security-Policy-Report-Only"] = (
            get_csp_as_str(CSP_REPORT_ONLY, nonce=nonce)
        )

        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"
        response.headers["Cross-Origin-Opener-Policy"] = (
            "same-origin-allow-popups"
        )
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        if get_flask_env("FLASK_ENV", "production") != "production":
            response.headers["X-Robots-Tag"] = "none"
        return response

    app.add_template_filter(date_has_passed)

    app.add_template_filter(sort_by_key_and_ordered_list)

    app.add_template_filter(convert_markdown_to_html)

    @app.template_filter()
    def slug(text):
        return slugify(text)
