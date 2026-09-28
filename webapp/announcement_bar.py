"""
Sticky site-wide announcement bar, shown below the main navigation.

Content and path exclusions are configured in announcement-bar.yaml so
copy changes don't need a code deploy. Dismissal is remembered per
announcement "id" (not just a boolean), so bumping the id in the YAML
re-surfaces the bar to everyone who already dismissed the previous one.
"""

import flask
import yaml

# Must match the cookie name used in static/js/src/announcement-bar.js
DISMISS_COOKIE_NAME = "_announcement_bar_dismissed"

with open("announcement-bar.yaml") as announcement_bar_file:
    _config = yaml.load(announcement_bar_file.read(), Loader=yaml.FullLoader)


def should_show_announcement_bar(path):
    """
    Whether the bar is allowed to show on this path, ignoring dismissal.
    Opt-out: shows everywhere except a hardcoded "docs" exclusion and the
    top-level path segments listed in exclude_paths (which also covers
    every child page under that segment).
    """

    if not _config.get("enabled"):
        return False

    segments = [segment for segment in path.split("/") if segment]

    if "docs" in segments:
        return False

    top_level_segment = segments[0] if segments else ""

    return top_level_segment not in _config.get("exclude_paths", [])


def is_announcement_dismissed():
    """
    True only if the visitor dismissed this exact announcement id.
    """

    dismissed_id = flask.request.cookies.get(DISMISS_COOKIE_NAME)

    return dismissed_id == _config.get("id")


def get_announcement_bar_context():
    """
    "announcement_bar" template context: the YAML content plus a "show"
    flag combining path eligibility and dismissal state.
    """

    # Some templates are rendered outside of a request (e.g. sitemap
    # generation), where there's no path or cookies to check against.
    if not flask.has_request_context():
        return {"show": False, **_config}

    show = (
        should_show_announcement_bar(flask.request.path)
        and not is_announcement_dismissed()
    )

    return {"show": show, **_config}
