# Standard library
import copy
import datetime
import calendar
import logging
import json
from urllib.parse import parse_qs, urlencode
from geolite2 import geolite2

# Packages
import flask
import requests
import yaml
import dateutil.parser
from canonicalwebteam.http import CachedSession


logger = logging.getLogger(__name__)

api_session = CachedSession(fallback_cache_duration=3600)
ip_reader = geolite2.reader()

# Read navigation.yaml
with open("navigation.yaml") as navigation_file:
    nav_sections = yaml.load(navigation_file.read(), Loader=yaml.FullLoader)


# Process data from YAML files
# ===


def releases():
    """
    Read releases as a dictionary from releases.yaml,
    and provide the contents as a dictionary in the global
    template context
    """

    with open("releases.yaml") as releases:
        return yaml.load(releases, Loader=yaml.FullLoader)


def get_navigation(path):
    """
    Set "nav_sections" and "breadcrumbs" dictionaries
    as global template variables
    """

    breadcrumbs = {}

    sections = copy.deepcopy(nav_sections)

    for nav_section_name, nav_section in sections.items():
        longest_match_path = 0
        child_to_set_active = None

        for child in nav_section["children"]:
            if (
                child["path"] == path and path.startswith(nav_section["path"])
            ) or (path.startswith(child["path"])):
                # look for the closest patch match
                if len(child["path"]) > longest_match_path:
                    longest_match_path = len(child["path"])
                    child_to_set_active = child

                nav_section["active"] = True
                breadcrumbs["section"] = nav_section

                # Include all siblings
                breadcrumbs["children"] = nav_section.get("children", [])

        # set the child most closely matching the current path as active
        if child_to_set_active:
            child_to_set_active["active"] = True

    return {"nav_sections": sections, "breadcrumbs": breadcrumbs}


# Helper functions
# ===


def current_year():
    return datetime.datetime.now().year


def format_date(datestring):
    date = dateutil.parser.parse(datestring)
    return date.strftime("%-d %B %Y")


def modify_query(params):
    query_params = parse_qs(
        flask.request.query_string.decode("utf-8"), keep_blank_values=True
    )
    query_params.update(params)

    return urlencode(query_params, doseq=True)


def months_list(year):
    months = []
    now = datetime.datetime.now()
    for i in range(1, 13):
        date = datetime.date(year, i, 1)
        if date < now.date():
            months.append({"name": date.strftime("%b"), "number": i})
    return months


def month_name(string):
    month = int(string)
    return calendar.month_name[month]


def descending_years(end_year):
    now = datetime.datetime.now()
    return range(now.year, end_year, -1)


def get_json_feed(url, offset=0, limit=None):
    """
    Get the entries in a JSON feed
    """

    end = limit + offset if limit is not None else None

    try:
        response = api_session.get(url, timeout=10)
        content = json.loads(response.text)
    except (
        json.JSONDecodeError,
        requests.exceptions.RequestException,
    ) as fetch_error:
        logger.warning(
            "Error getting feed from {}: {}".format(url, str(fetch_error))
        )
        return False

    return content[offset:end]


def get_user_country_by_ip():
    client_ip = flask.request.headers.get(
        "X-Real-IP", flask.request.remote_addr
    )
    ip_location = ip_reader.get(client_ip)
    if not ip_location:
        return None
    return ip_location["country"]["iso_code"]
