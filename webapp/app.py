"""
A Flask application for ubuntu.com
"""

# Packages
import os
import talisker.requests
import flask
from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.templatefinder import TemplateFinder
from canonicalwebteam.search import build_search_view
from canonicalwebteam import image_template
from canonicalwebteam.blog.wordpress_api import api_session
from werkzeug.middleware.proxy_fix import ProxyFix
from canonicalwebteam.discourse_docs import (
    DiscourseAPI,
    DiscourseDocs,
    DocParser,
)

# Local
from webapp.context import (
    current_year,
    descending_years,
    format_date,
    get_json_feed,
    modify_query,
    month_name,
    months_list,
    get_navigation,
    releases,
)
from webapp.views import (
    advantage_view,
    blog_blueprint,
    blog_custom_group,
    blog_custom_topic,
    blog_press_centre,
    download_thank_you,
    releasenotes_redirect,
    search_snaps,
    build_tutorials_index,
)
from webapp.login import login_handler, logout
from webapp.security.views import (
    # api_create_notice,
    notice,
    notices,
    notices_feed,
)


CAPTCHA_TESTING_API_KEY = os.getenv(
    "CAPTCHA_TESTING_API_KEY", "6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if"
)

# Set up application
# ===

app = FlaskBase(
    __name__,
    "ubuntu.com",
    template_folder="../templates",
    static_folder="../static",
)

app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=2, x_host=2, x_prefix=2, x_port=2, x_proto=2
)

talisker.requests.configure(api_session)

# Error pages
@app.errorhandler(404)
def not_found_error(error):
    return flask.render_template("404.html"), 404


@app.errorhandler(500)
def internal_error(error):
    return flask.render_template("500.html"), 500


# Template context
@app.context_processor
def context():
    return {
        "current_year": current_year,
        "descending_years": descending_years,
        "format_date": format_date,
        "get_json_feed": get_json_feed,
        "modify_query": modify_query,
        "month_name": month_name,
        "months_list": months_list,
        "get_navigation": get_navigation,
        "product": flask.request.args.get("product", ""),
        "request": flask.request,
        "releases": releases(),
        "openid": flask.session.get("openid"),
        "utm_campaign": flask.request.args.get("utm_campaign", ""),
        "utm_medium": flask.request.args.get("utm_medium", ""),
        "utm_source": flask.request.args.get("utm_source", ""),
        "CAPTCHA_TESTING_API_KEY": CAPTCHA_TESTING_API_KEY,
    }


@app.context_processor
def utility_processor():
    return {"image": image_template}


# Routes
# ===

# Simple routes
app.add_url_rule("/advantage", view_func=advantage_view)
app.add_url_rule(
    (
        "/download"
        "/<regex('server|desktop|cloud|raspberry-pi'):category>"
        "/thank-you"
    ),
    view_func=download_thank_you,
)
app.add_url_rule("/getubuntu/releasenotes", view_func=releasenotes_redirect)
app.add_url_rule(
    "/search", "search", build_search_view(template_path="search.html")
)

# blog section
app.add_url_rule(
    "/blog/topics/<regex('maas|design|juju|robotics|snapcraft'):slug>",
    view_func=blog_custom_topic,
)
app.add_url_rule(
    "/blog/<regex('cloud-and-server|desktop|internet-of-things'):slug>",
    view_func=blog_custom_group,
)
app.add_url_rule("/blog/press-centre", view_func=blog_press_centre)
app.register_blueprint(blog_blueprint, url_prefix="/blog")

# usn section
app.add_url_rule("/security/notices", view_func=notices)
app.add_url_rule("/security/notices/<feed_type>.xml", view_func=notices_feed)
# app.add_url_rule(
#     "/security/notices", view_func=api_create_notice, methods=["POST"]
# )
app.add_url_rule("/security/notices/<notice_id>", view_func=notice)


# Login
app.add_url_rule("/login", methods=["GET", "POST"], view_func=login_handler)
app.add_url_rule("/logout", view_func=logout)

# All other routes
template_finder_view = TemplateFinder.as_view("template_finder")
app.add_url_rule("/", view_func=template_finder_view)
app.add_url_rule("/snaps", view_func=search_snaps)
app.add_url_rule("/<path:subpath>", view_func=template_finder_view)

url_prefix = "/server/docs"
server_docs_parser = DocParser(
    api=DiscourseAPI(base_url="https://discourse.ubuntu.com/"),
    category_id=26,
    index_topic_id=11322,
    url_prefix=url_prefix,
)
server_docs = DiscourseDocs(
    parser=server_docs_parser,
    document_template="/docs/document.html",
    url_prefix=url_prefix,
)

server_docs.init_app(app)

tutorials_path = "/tutorials"
tutorials_docs_parser = DocParser(
    api=DiscourseAPI(base_url="https://discourse.ubuntu.com/"),
    category_id=34,
    index_topic_id=13611,
    url_prefix=tutorials_path,
)
tutorials_docs = DiscourseDocs(
    parser=tutorials_docs_parser,
    document_template="/tutorials/tutorial.html",
    url_prefix=tutorials_path,
    blueprint_name="tutorials",
)
app.add_url_rule(
    tutorials_path, view_func=build_tutorials_index(tutorials_docs)
)
tutorials_docs.init_app(app)


@app.after_request
def cache_headers(response):
    """
    Set cache expiry to 60 seconds for homepage and blog page
    """

    if flask.request.path in ["/core/build", "/advantage"]:
        response.cache_control.private = True

    if flask.request.path in ["/", "/blog"]:
        response.headers[
            "Cache-Control"
        ] = "max-age=61, stale-while-revalidate=90"

    return response
