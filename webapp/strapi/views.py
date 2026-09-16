"""
The views that put CMS pages on the site.

`CMSTemplateFinder` replaces the plain templatefinder as the catch-all
view: a path that has no template but does have a page in Strapi is
rendered from the CMS instead of 404ing.
"""

# Standard library
import json
import logging
import os
import re
import secrets
import tempfile
import time

# Packages
import flask
from canonicalwebteam.flask_base.env import get_flask_env
from canonicalwebteam.templatefinder import TemplateFinder

# Local
from webapp.strapi.content import normalise_page
from webapp.strapi.routing import (
    cms_route,
    matching_template,
    normalise_path,
    resolve,
)

logger = logging.getLogger(__name__)

PAGE_TEMPLATE = "_cms/page.html"
COMPARE_TEMPLATE = "_cms/compare.html"

# Unsaved drafts posted from the CMS while someone is typing.
#
# Kept on disk rather than in memory: the site runs under gunicorn with
# several workers, and the worker that stores a draft is rarely the one
# asked to render it. Files are small, short-lived, and pruned on write.
DRAFT_TTL = 300
MAX_DRAFTS = 50
DRAFT_DIR = os.path.join(tempfile.gettempdir(), "ubuntu-com-cms-drafts")


def _draft_path(key):
    # The key is generated here, but never trust it off the wire.
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", key or ""):
        return None

    return os.path.join(DRAFT_DIR, f"{key}.json")


def _prune_drafts():
    now = time.time()

    try:
        entries = sorted(
            (
                (os.path.getmtime(os.path.join(DRAFT_DIR, name)), name)
                for name in os.listdir(DRAFT_DIR)
                if name.endswith(".json")
            ),
            reverse=True,
        )
    except OSError:
        return

    for index, (modified, name) in enumerate(entries):
        if now - modified > DRAFT_TTL or index >= MAX_DRAFTS:
            try:
                os.remove(os.path.join(DRAFT_DIR, name))
            except OSError:
                pass


def _store_draft(document):
    """Keep a posted draft briefly and return the key to fetch it with."""
    os.makedirs(DRAFT_DIR, exist_ok=True)
    _prune_drafts()

    key = secrets.token_urlsafe(12)
    path = _draft_path(key)

    # Written then moved, so a reader never sees half a file.
    with tempfile.NamedTemporaryFile(
        "w", dir=DRAFT_DIR, suffix=".tmp", delete=False
    ) as handle:
        json.dump(document, handle)
        temporary = handle.name

    os.replace(temporary, path)

    return key


def _read_draft(key):
    path = _draft_path(key)

    if not path or not os.path.exists(path):
        return None

    if time.time() - os.path.getmtime(path) > DRAFT_TTL:
        try:
            os.remove(path)
        except OSError:
            pass

        return None

    try:
        with open(path) as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return None


def cms_takes_priority():
    """
    Off by default: a template in the repo wins over a CMS page at the same
    path, so nothing already on the site can be replaced by accident. Turn
    on to migrate a page into the CMS without deleting its template first.
    """
    setting = get_flask_env("STRAPI_OVERRIDE_TEMPLATES", "false")

    return str(setting).lower() == "true"


def preview_frame_ancestors():
    """
    Who may frame a preview: the Strapi admin, so its preview panel
    works, and the site itself, for the compare view. Only ever applied
    to preview responses, never to a published page.
    """
    origins = ["'self'"]
    cms_origin = get_flask_env("STRAPI_ADMIN_URL") or get_flask_env(
        "STRAPI_API_URL"
    )

    if cms_origin:
        origins.append(cms_origin.rstrip("/"))

    return origins


def has_preview_token():
    """
    True when the request carries the preview token, which lets an editor
    see an unpublished page from Strapi's preview button.
    """
    token = get_flask_env("STRAPI_PREVIEW_TOKEN")

    if not token:
        return False

    return flask.request.args.get("preview") == token


def is_preview_request():
    """
    True when the draft should be shown. A token holder can ask for the
    published version instead with `version=published`, which the compare
    view uses for its left-hand pane: same content as the live page, but
    in a response the compare page is allowed to frame.
    """
    if not has_preview_token():
        return False

    return flask.request.args.get("version") != "published"


def render_cms_page(
    strapi_api, route, preview=False, framable=False, document=None
):
    """
    Render the page at `route`. `preview` picks the draft over the
    published version; `framable` relaxes frame-ancestors so the CMS and
    the compare view can show it in an iframe.

    `document` renders the page from content supplied by the caller
    instead of anything stored — that is how the CMS shows edits that
    have not been saved yet.
    """
    if framable:
        # Read by the CSP builder in webapp.handlers.
        flask.g.cms_frame_ancestors = preview_frame_ancestors()

    if document is None:
        document = strapi_api.get_page(route, preview=preview)

    if not document:
        flask.abort(404, f"Can't find page for: {route}")

    page = normalise_page(document, media_url=strapi_api.media_url)
    # Only a framed preview loads the Strapi handshake script.
    page["is_preview"] = framable

    response = flask.make_response(
        flask.render_template(
            PAGE_TEMPLATE,
            page=page,
            # base.html reads these from the context, not from the page.
            hide_nav=page["hide_nav"],
            hide_footer=page["hide_footer"],
        )
    )

    if preview or framable or page["is_draft"]:
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
    elif page["seo"]["no_index"]:
        response.headers["X-Robots-Tag"] = "noindex"

    return response


class CMSTemplateFinder(TemplateFinder):
    """
    templatefinder, with the CMS as a second place to look.

    Templates win by default, so this cannot change what an existing page
    on the site serves; it only fills in paths that would have 404ed.
    """

    def __init__(self, strapi_api=None):
        super().__init__()
        self.strapi_api = strapi_api

    def _cms_route_for(self, path, preview):
        if not self.strapi_api:
            return None

        route = cms_route(path)

        if not self.strapi_api.has_route(route, preview=preview):
            return None

        return route

    def dispatch_request(self, *args, **kwargs):
        path = normalise_path(flask.request.path)
        preview = is_preview_request()
        framable = has_preview_token()

        # An unsaved draft posted by the CMS wins over anything stored,
        # so the preview can show edits as they are typed. Needs the same
        # token as any other preview.
        draft_key = flask.request.args.get("draft")

        if framable and draft_key:
            document = _read_draft(draft_key)

            if document is not None:
                return render_cms_page(
                    self.strapi_api,
                    cms_route(path),
                    preview=True,
                    framable=True,
                    document=document,
                )

        if cms_takes_priority():
            route = self._cms_route_for(path, preview)

            if route:
                return render_cms_page(
                    self.strapi_api, route, preview, framable
                )

        if matching_template(path):
            return super().dispatch_request(*args, **kwargs)

        route = self._cms_route_for(path, preview)

        if route:
            return render_cms_page(self.strapi_api, route, preview, framable)

        flask.abort(404, f"Can't find page for: {path}")


def build_route_check_view(strapi_api):
    """
    GET /_cms/route-check?path=/some-page

    Strapi calls this before saving a page so an editor finds out that a
    route is taken while they are still editing, rather than by publishing
    a page nobody can reach.
    """

    def route_check():
        path = flask.request.args.get("path", "")

        if not path:
            return (
                flask.jsonify(
                    {"error": "A 'path' query parameter is required"}
                ),
                400,
            )

        resolution = resolve(path, strapi_api=strapi_api)
        payload = resolution.as_dict()

        if not resolution.is_available:
            payload["reason"] = {
                "flask": (
                    "ubuntu.com already serves this path "
                    f"({resolution.detail})"
                ),
                "yaml": resolution.detail,
                "template": (
                    "A template already exists at "
                    f"templates/{resolution.detail}"
                ),
                "invalid": resolution.detail,
            }.get(resolution.source, "This path is already in use")

        return flask.jsonify(payload)

    return route_check


def build_sitemap_view(strapi_api):
    """
    GET /_cms/sitemap.xml

    CMS pages are not on disk, so the template-tree sitemap cannot see
    them. This one is listed in templates/sitemap_index.xml.
    """

    def cms_sitemap():
        pages = strapi_api.get_route_entries() if strapi_api else []

        xml = flask.render_template(
            "_cms/sitemap.xml",
            pages=pages,
            base_url="https://ubuntu.com",
        )
        response = flask.make_response(xml)
        response.headers["Content-Type"] = "application/xml"

        return response

    return cms_sitemap


def build_draft_preview_view():
    """
    POST /_cms/preview

    Takes a page as it currently stands in the CMS form — including edits
    that have not been saved — and keeps it just long enough to render.
    Answers with a key the preview URL carries as `?draft=`.

    Called cross-origin from the CMS, so it answers a preflight too.
    """

    def draft_preview():
        origins = preview_frame_ancestors()
        allowed = [origin for origin in origins if origin != "'self'"]
        cors = {
            "Access-Control-Allow-Origin": allowed[0] if allowed else "null",
            "Access-Control-Allow-Headers": "content-type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Max-Age": "600",
        }

        if flask.request.method == "OPTIONS":
            return flask.make_response("", 204, cors)

        token = get_flask_env("STRAPI_PREVIEW_TOKEN")

        if not token or flask.request.args.get("preview") != token:
            return flask.jsonify({"error": "A preview token is required"}), 403

        document = flask.request.get_json(silent=True)

        if not isinstance(document, dict):
            return flask.jsonify({"error": "A page document is required"}), 400

        response = flask.jsonify({"draft": _store_draft(document)})
        response.headers.extend(cors)
        response.headers["Cache-Control"] = "no-store"

        return response

    return draft_preview


def build_compare_view(strapi_api):
    """
    GET /_cms/compare?path=/some-page

    The published page and the draft, in two panes, so an editor can see
    what a change does before publishing it. Requires the preview token,
    the same as viewing a draft directly.
    """

    def compare():
        token = get_flask_env("STRAPI_PREVIEW_TOKEN")

        if not token:
            return (
                flask.jsonify({"error": "Previewing is not enabled"}),
                404,
            )

        if flask.request.args.get("preview") != token:
            return flask.jsonify({"error": "A preview token is required"}), 403

        if not strapi_api:
            return flask.jsonify({"error": "No CMS is configured"}), 404

        route = cms_route(flask.request.args.get("path", ""))

        if not route:
            return (
                flask.jsonify(
                    {"error": "A 'path' query parameter is required"}
                ),
                400,
            )

        if not strapi_api.has_route(route, preview=True):
            flask.abort(404, f"The CMS has no page at {route}")

        flask.g.cms_frame_ancestors = preview_frame_ancestors()

        response = flask.make_response(
            flask.render_template(
                COMPARE_TEMPLATE,
                route=route,
                draft_url=f"{route}?preview={token}",
                published_url=f"{route}?preview={token}&version=published",
                is_published=strapi_api.has_route(route),
            )
        )
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Robots-Tag"] = "noindex, nofollow"

        return response

    return compare


def build_cache_purge_view(strapi_api):
    """
    POST /_cms/cache/purge

    Called by Strapi when a page is saved, so an edit is live immediately
    instead of at the end of the cache TTL.
    """

    def purge_cache():
        secret = get_flask_env("CMS_PURGE_SECRET")

        if not secret:
            return (
                flask.jsonify({"error": "Cache purging is not enabled"}),
                404,
            )

        if flask.request.headers.get("x-cms-secret") != secret:
            return flask.jsonify({"error": "Invalid secret"}), 403

        if not strapi_api:
            return flask.jsonify({"error": "No CMS is configured"}), 404

        payload = flask.request.get_json(silent=True) or {}
        route = payload.get("route")

        strapi_api.purge(cms_route(route) if route else None)

        logger.info("Purged the CMS cache for %s", route or "all routes")

        return flask.jsonify({"purged": route or "all"})

    return purge_cache


def init_cms(app, strapi_api):
    """
    Register the CMS views. Returns the catch-all view function, which the
    caller binds to "/" and "/<path:subpath>" in place of templatefinder's.
    """
    app.add_url_rule(
        "/_cms/route-check",
        view_func=build_route_check_view(strapi_api),
        endpoint="cms_route_check",
    )
    app.add_url_rule(
        "/_cms/cache/purge",
        view_func=build_cache_purge_view(strapi_api),
        endpoint="cms_cache_purge",
        methods=["POST"],
    )
    app.add_url_rule(
        "/_cms/preview",
        view_func=build_draft_preview_view(),
        endpoint="cms_draft_preview",
        methods=["POST", "OPTIONS"],
    )
    app.add_url_rule(
        "/_cms/compare",
        view_func=build_compare_view(strapi_api),
        endpoint="cms_compare",
    )
    app.add_url_rule(
        "/_cms/sitemap.xml",
        view_func=build_sitemap_view(strapi_api),
        endpoint="cms_sitemap",
    )

    view = CMSTemplateFinder.as_view("template_finder", strapi_api=strapi_api)
    view._exclude_xframe_options_header = True

    return view
