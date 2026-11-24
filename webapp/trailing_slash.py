"""
Trailing-slash normalisation.

canonicalwebteam.flask_base strips trailing slashes with a 302. A 302 tells
search engines the move is temporary, so they keep indexing the slashed URL
and don't consolidate signals onto the canonical one. This module replaces
that handler with the same logic but a 301.

Redirects that intentionally *add* a trailing slash (for example
`server/docs: /server/docs/` in redirects.yaml) are left alone: stripping the
slash again would make the two redirects loop.
"""

import os
from urllib.parse import unquote, urlparse, urlunparse

import flask
from canonicalwebteam.flask_base.context import clear_trailing_slash
from canonicalwebteam.yaml_responses.flask_helpers import YamlRegexMap

# Same files, and same precedence, as the redirects flask_base registers
REDIRECT_FILES = ("redirects.yaml", "permanent-redirects.yaml")


def _load_redirect_maps(root_path):
    return [
        YamlRegexMap(os.path.join(root_path, "..", filename))
        for filename in REDIRECT_FILES
    ]


def _redirect_target_path(redirect_maps, path):
    """
    Return the path the redirect files send `path` to, or None for no
    redirect or one to another host. As in flask_base, the first matching
    rule wins.
    """

    for redirect_map in redirect_maps:
        for match, target in redirect_map.matches:
            result = match.fullmatch(path)

            if result:
                parts = {
                    name: value or ""
                    for name, value in result.groupdict().items()
                }
                parsed_target = urlparse(target.format(**parts))

                return None if parsed_target.netloc else parsed_target.path

    return None


def init_trailing_slash_redirects(app):
    redirect_maps = _load_redirect_maps(app.root_path)

    def permanent_clear_trailing_slash():
        """
        Remove trailing slashes from all routes with a permanent redirect
        """

        parsed_url = urlparse(unquote(flask.request.url))
        path = parsed_url.path

        if path == "/" or not path.endswith("/"):
            return None

        # `/x` is redirected to `/x/` on purpose
        if _redirect_target_path(redirect_maps, path[:-1]) == path:
            return None

        new_uri = urlunparse(parsed_url._replace(path=path[:-1]))

        return flask.redirect(new_uri, code=301)

    funcs = app.before_request_funcs.setdefault(None, [])

    if clear_trailing_slash in funcs:
        funcs[funcs.index(clear_trailing_slash)] = (
            permanent_clear_trailing_slash
        )
    else:
        funcs.insert(0, permanent_clear_trailing_slash)
