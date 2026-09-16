"""
The views that put CMS pages on the site.

`CMSTemplateFinder` replaces the plain templatefinder as the catch-all
view: a path that has no template but does have a page in Strapi is
rendered from the CMS instead of 404ing.
"""

# Standard library
import logging

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


def cms_takes_priority():
    """
    Off by default: a template in the repo wins over a CMS page at the same
    path, so nothing already on the site can be replaced by accident. Turn
    on to migrate a page into the CMS without deleting its template first.
    """
    setting = get_flask_env("STRAPI_OVERRIDE_TEMPLATES", "false")

    return str(setting).lower() == "true"


def is_preview_request():
    """
    True when the request carries the preview token, which lets an editor
    see an unpublished page from Strapi's preview button.
    """
    token = get_flask_env("STRAPI_PREVIEW_TOKEN")

    if not token:
        return False

    return flask.request.args.get("preview") == token


def render_cms_page(strapi_api, route, preview=False):
    document = strapi_api.get_page(route, preview=preview)

    if not document:
        flask.abort(404, f"Can't find page for: {route}")

    page = normalise_page(document, media_url=strapi_api.media_url)

    response = flask.make_response(
        flask.render_template(
            PAGE_TEMPLATE,
            page=page,
            # base.html reads these from the context, not from the page.
            hide_nav=page["hide_nav"],
            hide_footer=page["hide_footer"],
        )
    )

    if preview or page["is_draft"]:
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

        if cms_takes_priority():
            route = self._cms_route_for(path, preview)

            if route:
                return render_cms_page(self.strapi_api, route, preview)

        if matching_template(path):
            return super().dispatch_request(*args, **kwargs)

        route = self._cms_route_for(path, preview)

        if route:
            return render_cms_page(self.strapi_api, route, preview)

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
        "/_cms/sitemap.xml",
        view_func=build_sitemap_view(strapi_api),
        endpoint="cms_sitemap",
    )

    view = CMSTemplateFinder.as_view("template_finder", strapi_api=strapi_api)
    view._exclude_xframe_options_header = True

    return view
