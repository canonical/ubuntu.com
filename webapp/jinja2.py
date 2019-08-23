import datetime
import calendar

import yaml
import dateutil
from django.conf import settings
from copy import deepcopy
from canonicalwebteam.templatetags.versioned_static import versioned_static
from canonicalwebteam.get_feeds import get_json_feed_content
from jinja2 import Environment


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


def _remove_hidden(pages):
    filtered_pages = []

    # Filter out hidden pages
    for child in pages:
        if not child.get("hidden"):
            filtered_pages.append(child)

    return filtered_pages


def navigation(path):
    """
    Set "nav_sections" and "breadcrumbs" dictionaries
    as global template variables
    """

    breadcrumbs = {}
    nav_sections = deepcopy(settings.NAV_SECTIONS)
    is_topic_page = path.startswith("/blog/topics/")

    for nav_section_name, nav_section in nav_sections.items():
        # Persist parent navigation on child pages in certain cases
        if nav_section.get("persist") and path.startswith(nav_section["path"]):
            breadcrumbs["section"] = nav_section
            breadcrumbs["children"] = nav_section.get("children", [])

        for child in nav_section["children"]:
            if is_topic_page and child["path"] == "/blog/topics":
                # always show "Topics" as active on child topic pages
                child["active"] = True
                break
            elif child["path"] == path:
                child["active"] = True
                nav_section["active"] = True
                breadcrumbs["section"] = nav_section

                grandchildren = breadcrumbs["grandchildren"] = _remove_hidden(
                    child.get("children", [])
                )

                # Build up siblings
                if child.get("hidden") or grandchildren:
                    # Hidden nodes appear alone
                    breadcrumbs["children"] = [child]
                else:
                    # Otherwise, include all siblings
                    breadcrumbs["children"] = _remove_hidden(
                        nav_section.get("children", [])
                    )
                break
            else:
                for grandchild in child.get("children", []):
                    if grandchild["path"] == path:
                        grandchild["active"] = True
                        nav_section["active"] = True
                        breadcrumbs["section"] = nav_section
                        breadcrumbs["children"] = [child]

                        if grandchild.get("hidden"):
                            # Hidden nodes appear alone
                            breadcrumbs["grandchildren"] = [grandchild]
                        else:
                            # Otherwise, include all siblings
                            breadcrumbs["grandchildren"] = _remove_hidden(
                                child.get("children", [])
                            )
                        break

    return {"nav_sections": nav_sections, "breadcrumbs": breadcrumbs}


# Helper functions
# ===


def current_year():
    return datetime.datetime.now().year


def format_date(datestring):
    date = dateutil.parser.parse(datestring)
    return date.strftime("%-d %B %Y")


def build_path_with_params(request):
    query_params = request.GET.copy()
    query_string = "?"

    if "page" in query_params:
        query_params.pop("page")

    if len(query_params) > 0:
        query_string += query_params.urlencode()

    return request.path + query_string


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


def has_attr(obj, property_name):
    return hasattr(obj, property_name)


def environment(**options):
    env = Environment(**options)

    env.globals.update(
        {
            "get_json_feed": get_json_feed_content,
            "versioned_static": versioned_static,
            "current_year": current_year,
            "format_date": format_date,
            "build_path_with_params": build_path_with_params,
            "months_list": months_list,
            "month_name": month_name,
            "descending_years": descending_years,
            "has_attr": has_attr,
            "navigation": navigation,
            "releases": releases(),
        }
    )

    return env
