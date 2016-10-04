from django import template
from webapp.lib.feeds import get_json_feed_content, get_rss_feed_content

register = template.Library()


@register.simple_tag
def get_json_feed(feed_url, **kwargs):
    return get_json_feed_content(feed_url, **kwargs)


@register.simple_tag
def get_rss_feed(feed_url, **kwargs):
    return get_rss_feed_content(feed_url, **kwargs)
