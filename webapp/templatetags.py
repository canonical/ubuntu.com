# Packages
import dateutil.parser
from canonicalwebteam import image_template
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

# Tags
# ===


@register.simple_tag
def image(url, alt, width, height, **kwargs):
    return mark_safe(
        image_template(url, alt, width, height, attributes=kwargs)
    )


# Filters
# ===


@register.filter
def truncate_chars(value, max_length):
    length = len(value)
    if length > max_length:
        truncated = value[:max_length]
        if not length == (max_length + 1) and value[max_length + 1] != " ":
            truncated = truncated[: truncated.rfind(" ")]
        return truncated + "&hellip;"
    return value


@register.filter
def format_date(date):
    date_formatted = dateutil.parser.parse(date)
    return date_formatted.strftime("%-d %B %Y")


@register.filter
def replace_admin(url):
    return url.replace("admin.insights.ubuntu.com", "blog.ubuntu.com")
