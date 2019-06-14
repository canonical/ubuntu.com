from django.conf import settings
from copy import deepcopy
import yaml


def _remove_hidden(pages):
    filtered_pages = []

    # Filter out hidden pages
    for child in pages:
        if not child.get("hidden"):
            filtered_pages.append(child)

    return filtered_pages


def navigation(request):
    """
    Set "nav_sections" and "breadcrumbs" dictionaries
    as global template variables
    """

    path = request.path
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


def releases(request):
    """
    Read releases as a dictionary from releases.yaml,
    and provide the contents as a dictionary in the global
    template context
    """

    with open("releases.yaml") as releases:
        return {"releases": yaml.load(releases, Loader=yaml.FullLoader)}
