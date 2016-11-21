import feedparser
import logging
import json
from datetime import datetime
from requests.exceptions import Timeout
from requests_cache import CachedSession
from time import mktime

from django.conf import settings


logger = logging.getLogger(__name__)
requests_timeout = getattr(settings, 'FEED_TIMEOUT', 60)
expiry_seconds = getattr(settings, 'FEED_EXPIRY', 300)

cached_request = CachedSession(
    expire_after=expiry_seconds,
)


def get_json_feed_content(url, offset=0, limit=None):
    """
    Get the entries in a JSON feed
    """

    end = limit + offset if limit is not None else None

    try:
        response = cached_request.get(url, timeout=requests_timeout)
        content = json.loads(response.text)
    except Timeout as timeout_error:
        logger.warning(
            'Attempt to get feed timed out after {}. Message: {}'.format(
                requests_timeout,
                str(timeout_error)
            )
        )
        content = []  # Empty response

    return content[offset:end]


def get_rss_feed_content(url, offset=0, limit=None, exclude_items_in=None):
    """
    Get the entries from an RSS feed
    """

    end = limit + offset if limit is not None else None

    try:
        response = cached_request.get(url, timeout=requests_timeout)
        content = feedparser.parse(response.text).entries
    except Timeout as timeout_error:
        logger.warning(
            'Attempt to get feed timed out after {}. Message: {}'.format(
                requests_timeout,
                str(timeout_error)
            )
        )
        content = []  # Empty response

    if exclude_items_in:
        exclude_ids = [item['guid'] for item in exclude_items_in]
        content = [item for item in content if item['guid'] not in exclude_ids]

    content = content[offset:end]
    for item in content:
        updated_time = mktime(item['updated_parsed'])
        item['updated_datetime'] = datetime.fromtimestamp(updated_time)

    return content
