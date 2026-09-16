"""
Deciding who serves a path.

ubuntu.com resolves a request in this order, and both the request handler
and the /_cms/route-check endpoint the Strapi admin calls share the answer:

1. a URL rule registered by the app (a blueprint, a view function)
2. a redirect or deletion declared in redirects.yaml / deleted.yaml
3. a Jinja template on disk, via templatefinder
4. a page in the CMS
5. nothing, which is a 404
"""

# Standard library
import os
import re
from functools import lru_cache

# Packages
import flask
import yaml
from canonicalwebteam.yaml_responses.flask_helpers import YamlRegexMap
from jinja2.exceptions import TemplateNotFound
from werkzeug.exceptions import MethodNotAllowed, NotFound
from werkzeug.routing import RequestRedirect

# The view that catches everything not claimed by a more specific rule.
# A match on this endpoint means "no view owns this path".
CATCH_ALL_ENDPOINT = "template_finder"

REDIRECT_FILES = ("redirects.yaml", "permanent-redirects.yaml")
DELETED_FILE = "deleted.yaml"


class Resolution:
    """Who serves `path`, and why."""

    def __init__(self, path, source, detail=None):
        self.path = path
        self.source = source
        self.detail = detail

    @property
    def is_available(self):
        """True when nothing outside the CMS claims this path."""
        return self.source in ("none", "cms")

    def as_dict(self):
        return {
            "path": self.path,
            "available": self.is_available,
            "served_by": self.source,
            "detail": self.detail,
        }


def normalise_path(path):
    """
    The canonical form of a path: leading slash, no trailing slash. Case is
    left alone — templates on disk are matched case-sensitively, and
    lowercasing here would start serving paths that 404 today.
    """
    if not path:
        return ""

    path = str(path).strip().split("?")[0].split("#")[0]

    if not path.startswith("/"):
        path = f"/{path}"

    while "//" in path:
        path = path.replace("//", "/")

    if len(path) > 1:
        path = path.rstrip("/")

    return path


def cms_route(path):
    """
    The form the CMS stores routes in. Strapi lowercases on save, so a
    request for /Foo can still reach the page published at /foo.
    """
    return normalise_path(path).lower()


@lru_cache(maxsize=None)
def _regex_map(filename):
    """
    redirects.yaml and friends, parsed once. They only change on deploy.
    """
    return YamlRegexMap(os.path.join(os.getcwd(), filename))


@lru_cache(maxsize=None)
def _deleted_patterns():
    """
    The patterns in deleted.yaml, compiled the way flask-base compiles
    them. It does not use YamlRegexMap for this file, because some keys
    (like `1710`) parse as numbers rather than strings.
    """
    path = os.path.join(os.getcwd(), DELETED_FILE)

    if not os.path.isfile(path):
        return ()

    with open(path) as deleted_file:
        entries = yaml.load(deleted_file, Loader=yaml.FullLoader) or {}

    patterns = []

    for url_match in entries:
        url_match = str(url_match)

        if not url_match.startswith("/"):
            url_match = f"/{url_match}"

        patterns.append(re.compile(url_match))

    return tuple(patterns)


def matching_url_rule(path):
    """
    The endpoint of the URL rule that would handle `path`, or None when the
    only match is the catch-all template finder.
    """
    adapter = flask.current_app.url_map.bind(
        flask.request.host if flask.has_request_context() else "ubuntu.com"
    )

    try:
        endpoint, _ = adapter.match(path, method="GET")
    except RequestRedirect as redirect:
        return f"redirect to {redirect.new_url}"
    except (NotFound, MethodNotAllowed):
        return None

    if endpoint == CATCH_ALL_ENDPOINT:
        return None

    return endpoint


def matching_yaml_response(path):
    """A redirect or a deletion declared in YAML, or None."""
    for filename in REDIRECT_FILES:
        target = _regex_map(filename).get_target(path)

        if target:
            return f"{filename} redirects to {target}"

    for pattern in _deleted_patterns():
        if pattern.fullmatch(path):
            return f"{DELETED_FILE} marks this path as deleted"

    return None


def template_exists(template):
    loader = flask.current_app.jinja_loader

    try:
        loader.get_source({}, template=template)
    except TemplateNotFound:
        return False

    return True


def matching_template(path):
    """
    The template templatefinder would render for `path`, or None. Mirrors
    canonicalwebteam.templatefinder so both agree on what exists.
    """
    url_path = path.lstrip("/")

    if not url_path:
        url_path = "index"

    for part in url_path.split("/"):
        if part.startswith("_"):
            return None

    candidates = (
        f"{url_path}.html",
        os.path.join(url_path, "index.html"),
        f"{url_path}.md",
        os.path.join(url_path, "index.md"),
    )

    for candidate in candidates:
        if template_exists(candidate):
            return candidate

    return None


def resolve(path, strapi_api=None, preview=False):
    """
    Work out who owns `path`. Used both to serve a request and to tell the
    CMS whether a route is free.
    """
    path = normalise_path(path)

    if not path:
        return Resolution(path, "invalid", "A path is required")

    endpoint = matching_url_rule(path)

    if endpoint:
        return Resolution(path, "flask", endpoint)

    yaml_response = matching_yaml_response(path)

    if yaml_response:
        return Resolution(path, "yaml", yaml_response)

    template = matching_template(path)

    if template:
        return Resolution(path, "template", template)

    if strapi_api and strapi_api.has_route(cms_route(path), preview=preview):
        return Resolution(path, "cms", "A page in the CMS")

    return Resolution(path, "none", None)
