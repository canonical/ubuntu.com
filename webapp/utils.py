from urllib.parse import urlsplit

import dateutil.parser
import flask
import pytz

# Canonical sites whose pages post forms to, or link back through,
# ubuntu.com. Redirects may go to these domains and their subdomains.
REDIRECT_ALLOWED_DOMAINS = (
    "ubuntu.com",
    "canonical.com",
    "anbox-cloud.io",
    "canonical.design",
    "charmed-kubeflow.io",
    "maas.io",
    "microk8s.io",
    "multipass.run",
    "snapcraft.io",
)

# Browsers strip these from both ends of a URL before parsing it.
_C0_CONTROL_OR_SPACE = "".join(chr(code) for code in range(0x21))


def _is_allowed_redirect_host(netloc, hostname):
    if flask.has_request_context() and netloc == flask.request.host:
        return True
    return any(
        hostname == domain or hostname.endswith(f".{domain}")
        for domain in REDIRECT_ALLOWED_DOMAINS
    )


def safe_redirect_url(url, default="/"):
    """
    Return `url` if it is safe to redirect to, otherwise `default`.

    Relative URLs always stay on this site: tricks like "//evil.com" or
    "/\\evil.com" collapse to a single leading slash. Absolute URLs must
    be http(s) on the current host or a REDIRECT_ALLOWED_DOMAINS site.
    """
    if not url:
        return default

    # Browsers ignore tabs and newlines inside URLs and read backslashes
    # as slashes, so normalise those before parsing.
    url = url.strip(_C0_CONTROL_OR_SPACE).replace("\\", "/")
    for char in "\t\r\n":
        url = url.replace(char, "")

    try:
        parts = urlsplit(url)
    except ValueError:
        return default

    path = parts.path
    if parts.query:
        path += "?" + parts.query
    if parts.fragment:
        path += "#" + parts.fragment

    if not parts.scheme and not parts.netloc:
        return "/" + path.lstrip("/")

    hostname = (parts.hostname or "").rstrip(".")
    if (
        parts.scheme not in ("http", "https")
        or "@" in parts.netloc
        or not _is_allowed_redirect_host(parts.netloc, hostname)
    ):
        return default

    scheme = "https://" if parts.scheme == "https" else "http://"
    return scheme + parts.netloc + path


def strtobool(value):
    # distutils.util.strtobool was removed in Python 3.12
    value = str(value).strip().lower()
    if value in ("y", "yes", "t", "true", "on", "1"):
        return True
    if value in ("n", "no", "f", "false", "off", "0"):
        return False
    raise ValueError(f"invalid truth value {value!r}")


def format_community_event_time(event):
    """
    Format event start and end times with timezone conversion.
    ex. 25 Jan, 10:00 AM - 12:00 PM (UTC)
    """
    start_dt = dateutil.parser.parse(event["starts_at"])
    end_dt = (
        dateutil.parser.parse(event["ends_at"])
        if event.get("ends_at")
        else None
    )
    timezone_name = event.get("timezone", "")

    try:
        tz = pytz.timezone(timezone_name)
        start_dt = start_dt.astimezone(tz)
        if end_dt:
            end_dt = end_dt.astimezone(tz)
        tz_abbr = start_dt.strftime("%Z")
    except pytz.UnknownTimeZoneError:
        tz_abbr = timezone_name

    if not end_dt:
        start_time = start_dt.strftime("%d %b, %I:%M%p").lstrip("0")
        start_time = start_time.replace(
            start_dt.strftime("%b"), start_dt.strftime("%b").capitalize()
        )
        event["formatted_time"] = f"{start_time} ({tz_abbr})"
        return

    # If same date, only show date once
    if start_dt.date() == end_dt.date():
        date_part = start_dt.strftime("%d %b,").replace(
            start_dt.strftime("%b"), start_dt.strftime("%b").capitalize()
        )
        start_time_part = start_dt.strftime("%I:%M").lstrip("0")
        end_time_part = end_dt.strftime("%I:%M").lstrip("0")
        start_period = start_dt.strftime("%p")
        end_period = end_dt.strftime("%p")

        # If same AM/PM period, only show it once at the end
        if start_period == end_period:
            event["formatted_time"] = (
                f"{date_part} {start_time_part}-"
                f"{end_time_part} {end_period} ({tz_abbr})"
            )
        else:
            event["formatted_time"] = (
                f"{date_part} {start_time_part} {start_period}-"
                f"{end_time_part} {end_period} ({tz_abbr})"
            )
    else:
        start_time = start_dt.strftime("%d %b, %I:%M%p")
        end_time = end_dt.strftime("%d %b, %I:%M%p")
        start_time = start_time.replace(
            start_dt.strftime("%b"), start_dt.strftime("%b").capitalize()
        )
        end_time = end_time.replace(
            end_dt.strftime("%b"), end_dt.strftime("%b").capitalize()
        )
        event["formatted_time"] = f"{start_time} - {end_time} ({tz_abbr})"
