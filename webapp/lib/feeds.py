import feedparser
import logging
import requests
from cachecontrol import CacheControlAdapter
from cachecontrol.caches import FileCache
from cachecontrol.heuristics import ExpiresAfter
from django.conf import settings


logger = logging.getLogger(__name__)


def get_feed(feed_url):
    """
    Return feed parsed feed
    """
    requests_timeout = getattr(settings, 'FEED_TIMOUT', 1)

    cache_adapter = CacheControlAdapter(
        cache=FileCache('.web_cache'),
        heuristic=ExpiresAfter(hours=1),
    )

    session = requests.Session()
    session.mount('http://', cache_adapter)
    session.mount('https://', cache_adapter)

    show_exceptions = getattr(settings, 'DEBUG', True)

    feed_request = session.get(
        feed_url,
        timeout=requests_timeout
    )

    return feedparser.parse(feed_request.text)
