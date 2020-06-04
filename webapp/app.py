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
    accept_renewal,
    advantage_view,
    blog_blueprint,
    blog_custom_group,
    blog_custom_topic,
    blog_press_centre,
    build,
    build_tutorials_index,
    download_thank_you,
    get_renewal,
    post_customer_info,
    post_stripe_invoice_id,
    post_build,
    releasenotes_redirect,
    search_snaps,
    notify_build,
)
from webapp.login import login_handler, logout, user_info
from webapp.security.database import db_session
from webapp.security.views import (
    create_notice,
    notice,
    notices,
    notices_feed,
    update_notice,
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

# Settings
app.config["CONTRACTS_API_URL"] = os.getenv(
    "CONTRACTS_API_URL", "https://contracts.staging.canonical.com"
).rstrip("/")
app.config["CANONICAL_LOGIN_URL"] = os.getenv(
    "CANONICAL_LOGIN_URL", "https://login.ubuntu.com"
).rstrip("/")

session = talisker.requests.get_session()
talisker.requests.configure(api_session)
discourse_api = DiscourseAPI(
    base_url="https://discourse.ubuntu.com/", session=session
)


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
        "user_info": user_info(flask.session),
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
    "/advantage/customer-info", view_func=post_customer_info, methods=["POST"],
)
app.add_url_rule(
    "/advantage/renewals/<renewal_id>/invoices/<invoice_id>",
    view_func=post_stripe_invoice_id,
    methods=["POST"],
)
app.add_url_rule(
    "/advantage/renewals/<renewal_id>", view_func=get_renewal, methods=["GET"]
)

app.add_url_rule(
    "/advantage/renewals/<renewal_id>/process-payment",
    view_func=accept_renewal,
    methods=["POST"],
)
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
app.add_url_rule(
    "/security/notices", view_func=create_notice, methods=["POST"]
)
app.add_url_rule("/security/notices", view_func=update_notice, methods=["PUT"])
app.add_url_rule("/security/notices/<notice_id>", view_func=notice)

# Login
app.add_url_rule("/login", methods=["GET", "POST"], view_func=login_handler)
app.add_url_rule("/logout", view_func=logout)

# All other routes
template_finder_view = TemplateFinder.as_view("template_finder")
app.add_url_rule("/", view_func=template_finder_view)
app.add_url_rule("/snaps", view_func=search_snaps)
app.add_url_rule("/core/build", view_func=build)
app.add_url_rule("/core/build", view_func=post_build, methods=["POST"])
app.add_url_rule(
    "/core/build/notify", view_func=notify_build, methods=["POST"]
)
app.add_url_rule("/<path:subpath>", view_func=template_finder_view)

url_prefix = "/server/docs"
server_docs = DiscourseDocs(
    parser=DocParser(
        api=discourse_api,
        category_id=26,
        index_topic_id=11322,
        url_prefix=url_prefix,
    ),
    document_template="/docs/document.html",
    url_prefix=url_prefix,
)
server_docs.init_app(app)

# Allow templates to be queried from discourse.ubuntu.com
app.add_url_rule(
    "/templates/<filename>",
    "templates",
    lambda filename: (
        flask.render_template(f"templates/{filename}.html"),
        {"Access-Control-Allow-Origin": "https://discourse.ubuntu.com"},
    ),
)

tutorials_path = "/tutorials"
tutorials_docs = DiscourseDocs(
    parser=DocParser(
        api=discourse_api,
        category_id=34,
        index_topic_id=13611,
        url_prefix=tutorials_path,
    ),
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


@app.teardown_appcontext
def remove_db_session(response):
    db_session.remove()
    return response
