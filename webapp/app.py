"""
A Flask application for ubuntu.com
"""

# Standard library
import json
import os
import re
from urllib.parse import quote

# Packages
import flask
import requests
from canonicalwebteam.blog import BlogViews
from canonicalwebteam.blog.flask import build_blueprint
from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.templatefinder import TemplateFinder
from canonicalwebteam.search import build_search_view
from canonicalwebteam import image_template
from feedparser import parse
from flask_openid import OpenID
from pymacaroons import Macaroon

# Local
from webapp.macaroon import MacaroonRequest, MacaroonResponse
from webapp.context import (
    current_year,
    descending_years,
    format_date,
    get_json_feed,
    modify_query,
    month_name,
    months_list,
    navigation,
    releases,
)


app = FlaskBase(
    __name__,
    "ubuntu.com",
    template_folder="../templates",
    static_folder="../static",
)

# Blog
blog_views = BlogViews(excluded_tags=[3184, 3265, 3408])


@app.route("/blog/topics/<regex('maas|design|juju|robotics|snapcraft'):slug>")
def custom_topic(slug):
    page_param = flask.request.args.get("page", default=1, type=int)
    context = blog_views.get_topic(slug, page_param)

    return flask.render_template(f"blog/topics/{slug}.html", **context)


@app.route("/blog/<regex('cloud-and-server|desktop|internet-of-things'):slug>")
def custom_group(slug):
    page_param = flask.request.args.get("page", default=1, type=int)
    category_param = flask.request.args.get("category", default="", type=str)
    context = blog_views.get_group(slug, page_param, category_param)

    return flask.render_template(f"blog/{slug}.html", **context)


@app.route("/blog/press-centre")
def press_centre():
    page_param = flask.request.args.get("page", default=1, type=int)
    category_param = flask.request.args.get("category", default="", type=str)
    context = blog_views.get_group(
        "canonical-announcements", page_param, category_param
    )

    return flask.render_template("blog/press-centre.html", **context)


app.register_blueprint(build_blueprint(blog_views), url_prefix="/blog")


# Template finder
template_finder_view = TemplateFinder.as_view("template_finder")
app.add_url_rule("/", view_func=template_finder_view)
app.add_url_rule("/<path:subpath>", view_func=template_finder_view)

# Search
app.add_url_rule(
    "/search", "search", build_search_view(template_path="search.html")
)


@app.errorhandler(404)
def not_found_error(error):
    return flask.render_template("404.html"), 404


@app.errorhandler(500)
def internal_error(error):
    return flask.render_template("500.html"), 500


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
        "navigation": navigation,
        "product": flask.request.args.get("product", ""),
        "request": flask.request,
        "releases": releases(),
        "utm_campaign": flask.request.args.get("utm_campaign", ""),
        "utm_medium": flask.request.args.get("utm_medium", ""),
        "utm_source": flask.request.args.get("utm_source", ""),
    }


@app.route("/download/<regex('server|desktop|cloud'):category>/thank-you")
def download_thank_you(category):
    context = {"http_host": flask.request.host}

    version = flask.request.args.get("version", "")
    architecture = flask.request.args.get("architecture", "")

    # Sanitise for paths
    # (https://bugs.launchpad.net/ubuntu-website-content/+bug/1586361)
    version_pattern = re.compile(r"(\d+(?:\.\d+)+).*")
    architecture = architecture.replace("..", "")
    architecture = architecture.replace("/", "+").replace(" ", "+")

    if architecture and version_pattern.match(version):
        context["start_download"] = version and architecture
        context["version"] = version
        context["architecture"] = architecture

    # Add mirrors
    mirrors_path = os.path.join(os.getcwd(), "etc/ubuntu-mirrors-rss.xml")

    try:
        with open(mirrors_path) as rss:
            mirrors = parse(rss.read()).entries
    except IOError:
        mirrors = []

    mirror_list = [
        {"link": mirror["link"], "bandwidth": mirror["mirror_bandwidth"]}
        for mirror in mirrors
        if mirror["mirror_countrycode"]
        == flask.request.args.get("country", "NO_COUNTRY_CODE")
    ]
    context["mirror_list"] = json.dumps(mirror_list)

    return flask.render_template(
        f"download/{category}/thank-you.html", **context
    )


@app.context_processor
def utility_processor():
    return {"image": image_template}


# Login
LOGIN_URL = os.getenv("LOGIN_URL", "https://login.ubuntu.com")
def login_required(func):
    """
    Decorator that checks if a user is logged in, and redirects
    to login page if not.
    """

    @functools.wraps(func)
    def is_user_logged_in(*args, **kwargs):
        if not authentication.is_authenticated(flask.session):
            return flask.redirect("/login?next=" + flask.request.path)

        return func(*args, **kwargs)

    return is_user_logged_in


@app.route("/advantage")
def advantage():
    return flask.render_template(
        "advantage.html", openid=flask.session.get("openid")
    )


open_id = OpenID(
    stateless=True, safe_roots=[], extension_responses=[MacaroonResponse]
)


@app.route("/login", methods=["GET", "POST"])
@open_id.loginhandler
def login_handler():
    if "openid" in flask.session:
        return flask.redirect(open_id.get_next_url())

    root = requests.get(
        "https://contracts.canonical.com/v1/canonical-sso-macaroon"
    ).json()["macaroon"]

    for caveat in Macaroon.deserialize(root).third_party_caveats():
        if caveat.location == "login.ubuntu.com":
            openid_macaroon = MacaroonRequest(caveat_id=caveat.caveat_id)
            break

    flask.session["macaroon_root"] = root

    return open_id.try_login(
        "https://login.ubuntu.com",
        ask_for=["email", "nickname", "image"],
        ask_for_optional=["fullname"],
        extensions=[openid_macaroon],
    )


@open_id.after_login
def after_login(resp):
    flask.session["macaroon_discharge"] = resp.extensions["macaroon"].discharge

    if not resp.nickname:
        return flask.redirect("https://login.ubuntu.com")

    flask.session["openid"] = {
        "identity_url": resp.identity_url,
        "nickname": resp.nickname,
        "fullname": resp.fullname,
        "image": resp.image,
        "email": resp.email,
    }

    return flask.redirect(open_id.get_next_url())


@app.route("/logout")
def logout():
    no_redirect = flask.request.args.get("no_redirect", default="false")

    if "openid" in flask.session:
        flask.session.pop("macaroon_root", None)
        flask.session.pop("macaroon_discharge", None)
        flask.session.pop("openid", None)
        flask.session.pop("user_shared_snaps", None)

    if no_redirect == "true":
        return flask.redirect("/")
    else:
        redirect_url = quote(flask.request.url_root, safe="")
        return flask.redirect(
            "https://login.ubuntu.com/+logout"
            f"?return_to={redirect_url}&return_now=True"
        )
