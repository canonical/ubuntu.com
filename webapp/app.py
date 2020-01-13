"""
A Flask application for ubuntu.com
"""

# Packages
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
    advantage,
    blog_blueprint,
    blog_custom_group,
    blog_custom_topic,
    blog_press_centre,
    download_thank_you,
    releasenotes_redirect,
)
from webapp.login import login_handler, logout


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
        "utm_campaign": flask.request.args.get("utm_campaign", ""),
        "utm_medium": flask.request.args.get("utm_medium", ""),
        "utm_source": flask.request.args.get("utm_source", ""),
    }


@app.context_processor
def utility_processor():
    return {"image": image_template}


# Routes
# ===

# Simple routes
app.add_url_rule("/advantage", view_func=advantage)
app.add_url_rule(
    "/download/<regex('server|desktop|cloud'):category>/thank-you",
    view_func=download_thank_you,
)
app.add_url_rule("/getubuntu/releasenotes", view_func=releasenotes_redirect)
app.add_url_rule(
    "/search", "search", build_search_view(template_path="search.html")
)

# /blog section
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

# Login
app.add_url_rule("/login", methods=["GET", "POST"], view_func=login_handler)
app.add_url_rule("/logout", view_func=logout)

# All other routes
template_finder_view = TemplateFinder.as_view("template_finder")
app.add_url_rule("/", view_func=template_finder_view)
app.add_url_rule("/<path:subpath>", view_func=template_finder_view)

url_prefix = "/server/docs"
server_docs_parser = DocParser(
    api=DiscourseAPI(base_url="https://discourse.ubuntu.com/"),
    index_topic_id=11322,
    url_prefix=url_prefix,
)
server_docs = DiscourseDocs(
    parser=server_docs_parser,
    category_id=26,
    document_template="/docs/document.html",
    url_prefix=url_prefix,
)

server_docs.init_app(app)

url_prefix = "/tutorials"
tutorials_docs_parser = DocParser(
    api=DiscourseAPI(base_url="https://discourse.ubuntu.com/"),
    index_topic_id=13611,
    url_prefix=url_prefix,
)
tutorials_docs = DiscourseDocs(
    parser=tutorials_docs_parser,
    category_id=34,
    document_template="/tutorials/tutorial.html",
    url_prefix=url_prefix,
    blueprint_name="tutorials",
)


@app.route(url_prefix)
def index():
    page = flask.request.args.get("page", default=1, type=int)
    topic = flask.request.args.get("topic", default=None, type=str)
    tutorials_docs.parser.parse()
    if not topic:
        metadata = tutorials_docs.parser.metadata
    else:
        metadata = [
            doc
            for doc in tutorials_docs.parser.metadata
            if doc["categories"] == topic
        ]

    return flask.render_template(
        "tutorials/index.html",
        navigation=tutorials_docs.parser.navigation,
        forum_url=tutorials_docs.parser.api.base_url,
        metadata=metadata,
        page=page,
        topic=topic,
    )


tutorials_docs.init_app(app)
