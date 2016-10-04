from django import template
from webapp.lib import feeds

register = template.Library()


@register.simple_tag
def get_feed(feed_url, offset=0, limit=None, **kwargs):
    limit = limit + offset if limit is not None else None
    return feeds.get_feed(feed_url, **kwargs).entries[offset:limit]
