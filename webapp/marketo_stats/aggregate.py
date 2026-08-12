"""Turn raw Marketo activity records into countable rows."""

from dataclasses import dataclass
from urllib.parse import urlparse

from webapp.marketo_stats import php_serialize

KNOWN_SITES = ("ubuntu.com", "canonical.com")
OTHER_SITE = "other"

ENRICHMENT_FORM_ID = "4198"
FORM_FIELDS_ATTRIBUTE = "Form Fields"


@dataclass(frozen=True)
class SubmissionRow:
    """One submission, reduced to only non-personal dimensions."""

    date: str
    form_id: str
    referrer: str
    site: str


def normalise_referrer(url):
    """Reduce an acquisition URL to scheme://host/path.

    Query strings are dropped so that the same page does not fragment
    into dozens of separate rows. shorten_acquisition_url() in
    webapp/views.py only strips parameters once a URL exceeds 255
    characters, so raw URLs arrive here with their parameters intact.
    """
    if not url:
        return ""

    try:
        parsed = urlparse(url)
    except ValueError:
        return ""

    if not parsed.scheme or not parsed.hostname:
        return ""

    path = parsed.path or "/"
    if len(path) > 1:
        path = path.rstrip("/") or "/"

    return f"{parsed.scheme}://{parsed.hostname.lower()}{path}"


def classify_site(url):
    """Map an acquisition URL to the site that produced it."""
    if not url:
        return OTHER_SITE

    try:
        hostname = urlparse(url).hostname
    except ValueError:
        return OTHER_SITE

    if not hostname:
        return OTHER_SITE

    hostname = hostname.lower()
    for site in KNOWN_SITES:
        if hostname == site or hostname.endswith(f".{site}"):
            return site
    return OTHER_SITE


def row_from_activity(activity):
    """Reduce a form-4198 activity to a SubmissionRow.

    Returns None for anything else, including records whose blob cannot
    be read. The blob holds names, emails and phone numbers; nothing
    from it reaches the returned row except the form id and the URL.
    """
    primary_id = activity.get("primaryAttributeValueId")
    if str(primary_id) != ENRICHMENT_FORM_ID:
        return None

    blob = None
    for attribute in activity.get("attributes") or []:
        if attribute.get("name") == FORM_FIELDS_ATTRIBUTE:
            blob = attribute.get("value")
            break

    if not blob:
        return None

    try:
        fields = php_serialize.loads(blob)
    except ValueError:
        return None

    url = str(fields.get("acquisition_url") or "")
    form_id = fields.get("original_form_id")

    return SubmissionRow(
        date=str(activity.get("activityDate") or "")[:10],
        form_id=str(form_id) if form_id else "unknown",
        referrer=normalise_referrer(url),
        site=classify_site(url),
    )
