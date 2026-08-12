"""Turn raw Marketo activity records into countable rows."""

from urllib.parse import urlparse

KNOWN_SITES = ("ubuntu.com", "canonical.com")
OTHER_SITE = "other"


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
