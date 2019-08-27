import feedparser
import logging
import time

from canonicalwebteam.http import CachedSession
from datetime import datetime


logger = logging.getLogger(__name__)

api_session = CachedSession(fallback_cache_duration=3600)


def _get(url):
    try:
        response = api_session.get(url, timeout=10)
        response.raise_for_status()
    except Exception as request_error:
        logger.debug(
            "Attempt to get feed failed: {}".format(str(request_error))
        )
        return False

    return response


def get_rss_feed(url, offset=0, limit=None, exclude_items_in=None):
    """
    Get the entries from an RSS feed
    """

    end = limit + offset if limit is not None else None

    response = _get(url)

    try:
        feed_data = feedparser.parse(response.text)
        if not feed_data.feed:
            logger.debug("No valid feed data found at {}".format(url))
            return False
        content = feed_data.entries
    except Exception as parse_error:
        logger.debug(
            "Failed to parse feed from {}: {}".format(url, str(parse_error))
        )
        return False

    if exclude_items_in:
        exclude_ids = [item["guid"] for item in exclude_items_in]
        content = [item for item in content if item["guid"] not in exclude_ids]

    content = content[offset:end]

    for item in content:
        updated_time = time.mktime(item["updated_parsed"])
        item["updated_datetime"] = datetime.fromtimestamp(updated_time)

    return content
