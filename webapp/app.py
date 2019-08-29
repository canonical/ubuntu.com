"""
A Flask application for maas.io
"""

# Standard library
import flask

# Packages
from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.templatefinder import TemplateFinder
from canonicalwebteam.search import build_search_view

# Local
from webapp.context import (
    build_path_with_params,
    current_year,
    descending_years,
    format_date,
    get_json_feed,
    month_name,
    months_list,
    navigation,
    releases,
)


app = FlaskBase(
    __name__,
    "maas.io",
    template_folder="../templates",
    static_folder="../static",
)

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
        "build_path_with_params": build_path_with_params,
        "current_year": current_year,
        "descending_years": descending_years,
        "format_date": format_date,
        "get_json_feed": get_json_feed,
        "month_name": month_name,
        "months_list": months_list,
        "navigation": navigation,
        "releases": releases(),
    }
