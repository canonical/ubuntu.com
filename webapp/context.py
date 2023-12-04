# Standard library
import copy
import datetime
import calendar
import logging
import json
import numpy
from urllib.parse import parse_qs, urlencode

# Packages
import flask
import requests
import yaml
import dateutil.parser
from slugify import slugify
from canonicalwebteam.http import CachedSession


logger = logging.getLogger(__name__)

api_session = CachedSession(fallback_cache_duration=3600)

# Read navigation.yaml
with open("navigation.yaml") as navigation_file:
    nav_sections = yaml.load(navigation_file.read(), Loader=yaml.FullLoader)

# Read meganav.yaml
with open("meganav.yaml") as meganav_file:
    meganav = yaml.load(meganav_file.read(), Loader=yaml.FullLoader)


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


def get_meganav(section):
    """
    Set "meganav_section" as global template variable
    """
    sections = {}
    meganav_sections = copy.deepcopy(meganav)

    if section == "all":
        return meganav_sections

    for section_name, meganav_section in meganav_sections.items():
        if section_name == section:
            sections = meganav_section

    return {"sections": sections}


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


def split_list(array, parts):
    return numpy.array_split(array, parts)


def format_to_id(string):
    return slugify(string)


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


def schedule_banner(start_date: str, end_date: str):
    try:
        end = datetime.datetime.strptime(end_date, "%Y-%m-%d")
        start = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        present = datetime.datetime.now()
        return start <= present < end
    except ValueError:
        return False


def date_has_passed(date_str):
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
        present = datetime.now()
        return present > date
    except ValueError:
        return False


def sort_by_key_and_ordered_list(list_to_sort, obj_key, ordered_list):
    return sorted(
        list_to_sort, key=lambda item: ordered_list.index(item[obj_key])
    )
