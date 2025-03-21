import html
import bleach
import markdown
from markupsafe import Markup


def get_download_url(model_details):
    """
    Return the appropriate ubuntu models.com/download url for the model
    :param model: a certifiedmodel resource
    :param model_details: a certifiedmodeldetails resource
    :return: appropriate ubuntu.com/download url
    """
    platform_category = model_details.get("category", "").lower()
    architecture = model_details.get("architecture", "").lower()
    make = model_details.get("make", "").lower()
    configuration_name = model_details.get("model", "").lower()

    if model_details.get("level") == "Enabled":
        # Enabled systems use oem images without download links.
        return

    if platform_category in ["desktop", "laptop"]:
        return "https://ubuntu.com/download/desktop"

    if make == "nvidia" and "jetson" in configuration_name:
        return "https://ubuntu.com/download/nvidia-jetson"

    if "core" in platform_category:
        if make == "xilinx":
            return "https://ubuntu.com/download/amd"

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
