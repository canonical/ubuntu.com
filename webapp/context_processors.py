from django.conf import settings
from copy import deepcopy


def navigation(request):
    """
    Set any context that we want to pass to all pages
    """

    path = request.path
    nav_sections = deepcopy(settings.NAV_SECTIONS)

    for nav_section_name, nav_section in nav_sections.items():
        for child in nav_section['children']:
            if child['path'] == path:
                nav_section['active'] = True
            else:
                for grandchild in child.get('children', []):
                    if grandchild['path'] == path:
                        nav_section['active'] = True

    return {
        'nav_sections': nav_sections,
    }
