import feedparser
import logging
import json
from requests.exceptions import Timeout
from requests_cache import CachedSession

from django.conf import settings


logger = logging.getLogger(__name__)
requests_timeout = getattr(settings, 'FEED_TIMEOUT', 30)
expiry_seconds = getattr(settings, 'FEED_EXPIRY', 300)

cached_request = CachedSession(
    expire_after=expiry_seconds,
)


def get_feed(feed_url):
    """
    Return feed parsed feed
    """

    try:
        response = cached_request.get(feed_url, timeout=requests_timeout)

        content_type = response.headers['Content-Type']

        if 'rss' in content_type.lower():
            content = feedparser.parse(response.text)
        elif 'json' in content_type.lower():
            content = json.loads(response.text)
        else:
            raise TypeError('Unknown content type: {}'.format(content_type))

    except Timeout as timeout_error:
        logger.warning(
            'Attempt to get feed timed out after {}. Message: {}'.format(
                requests_timeout,
                str(timeout_error)
            )
        )
        content = []  # Empty response

    return content
