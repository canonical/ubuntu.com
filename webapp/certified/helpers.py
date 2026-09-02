import html
import bleach
import markdown
from markupsafe import Markup


def get_download_url(model_details):
    """
    Return the appropriate ubuntu models.com/download url for the model
    :param model_details: a certifiedmodeldetails resource
    :return: appropriate ubuntu.com/download url
    """
    platform_category = model_details.get("category", "").lower()
    architecture = model_details.get("architecture", "").lower()

    if model_details.get("download_instructions_url"):
        return model_details.get("download_instructions_url")

    if model_details.get("level") == "Enabled":
        # Enabled systems use oem images without download links.
        return

    if platform_category in ["desktop", "laptop"]:
        return "https://ubuntu.com/download/desktop"

    if "core" in platform_category:
        return "https://ubuntu.com/download/iot/"

    if "server" in platform_category:
        # Server platforms have special landing pages based on architecture.
        arch = ""
        if "arm" in architecture:
            arch = "arm"
        elif "ppc" in architecture:
            arch = "power"
        elif "s390x" in architecture:
            arch = "s390x"
        else:
            return "https://ubuntu.com/download/server/"

        return f"https://ubuntu.com/download/server/{arch}"

    return "https://ubuntu.com/download"


def convert_markdown_to_html(text):
    """
    Convert markdown to HTML while ensuring security by sanitizing
    the output.  Only pure Markdown is allowed, raw HTML is escaped
    and displayed as code.  Tables and images are not supported.
    """
    if not text:
        return ""

    escaped_text = html.escape(text)

    html_content = markdown.markdown(
        escaped_text,
        extensions=[
            "markdown.extensions.fenced_code",
            "markdown.extensions.nl2br",
        ],
    )

    allowed_tags = [
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "br",
        "ul",
        "ol",
        "li",
        "blockquote",
        "pre",
        "code",
        "em",
        "strong",
        "a",
    ]
    allowed_attrs = {
        "a": ["href", "title"],
        "code": ["class"],
        "pre": ["class"],
    }

    clean_html = bleach.clean(
        html_content, tags=allowed_tags, attributes=allowed_attrs, strip=True
    )
    return Markup(clean_html)


def _get_clean_in_filter(filter_in):
    """
    Return a clean comma-separated values string from a list of values
    This is required for the in filter query parameter in the API

    :return: comma separated value of a list or the parameter itself
    """

    if isinstance(filter_in, list):
        return ",".join(filter_in)
    return filter_in


def _get_category_pathname(form_factor):
    if form_factor == "Ubuntu Core":
        return "iot"
    elif form_factor == "Server SoC":
        return "socs"
    else:
        return form_factor.lower() + "s"


# Single source of truth for the categories where our own /certified/search
# URLs use a friendlier value than the certification API's own category.
_CATEGORY_URL_ALIASES = {
    "Ubuntu Core": "IoT",
    "Server SoC": "SoC",
}


def _get_category_url_value(category):
    """
    Convert a certification API category value to the value used in our
    own /certified/search URLs (e.g. "Ubuntu Core" -> "IoT").
    """
    return _CATEGORY_URL_ALIASES.get(category, category)


def _normalize_categories(categories):
    """
    Map legacy category aliases (old pathname slugs, UX-only labels,
    and our own /certified/search URL values) to the certification
    API's own category vocabulary.
    """
    aliases = {
        # Legacy spellings from before the /certified/search unification -
        # unrelated to the URL-naming choice above, kept for old bookmarks
        "laptop": "Laptop",
        "laptops": "Laptop",
        "desktop": "Desktop",
        "desktops": "Desktop",
        "server": "Server",
        "servers": "Server",
        "socs": "Server SoC",
        "server soc": "Server SoC",
        "device": "Ubuntu Core",
        "ubuntu core": "Ubuntu Core",
    }
    for api_value, url_value in _CATEGORY_URL_ALIASES.items():
        aliases[url_value.lower()] = api_value

    normalized = []
    for category in categories:
        value = aliases.get(category.lower(), category)
        if value not in normalized:
            normalized.append(value)

    return normalized
