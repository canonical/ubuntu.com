from django import template
from webapp.lib import feeds

register = template.Library()


@register.simple_tag
def get_feed(feed_url):
    return feeds.get_feed(feed_url).entries
