from django.conf import settings
from copy import deepcopy


def _remove_hidden(pages):
    pages = deepcopy(pages)

    # Filter out hidden pages
    for child in pages:
        if child.get('hidden'):
            pages.remove(child)

    return pages


def navigation(request):
    """
    Set any context that we want to pass to all pages
    """

    path = request.path
    breadcrumbs = {}
    nav_sections = deepcopy(settings.NAV_SECTIONS)

    for nav_section_name, nav_section in nav_sections.items():
        for child in nav_section['children']:
            if child['path'] == path:
                child['active'] = True
                nav_section['active'] = True
                breadcrumbs['section'] = nav_section

                grandchildren = breadcrumbs['grandchildren'] = _remove_hidden(
                    child.get('children', [])
                )

                # Build up siblings
                if child.get('hidden') or grandchildren:
                    # Hidden nodes appear alone
                    breadcrumbs['children'] = [child]
                else:
                    # Otherwise, include all siblings
                    breadcrumbs['children'] = _remove_hidden(
                        nav_section.get('children', [])
                    )
            else:
                for grandchild in child.get('children', []):
                    if grandchild['path'] == path:
                        grandchild['active'] = True
                        nav_section['active'] = True
                        breadcrumbs['section'] = nav_section
                        breadcrumbs['children'] = [child]

                        if grandchild.get('hidden'):
                            # Hidden nodes appear alone
                            breadcrumbs['grandchildren'] = [grandchild]
                        else:
                            # Otherwise, include all siblings
                            breadcrumbs['grandchildren'] = _remove_hidden(
                                child.get('children', [])
                            )

    return {
        'nav_sections': nav_sections,
        'breadcrumbs': breadcrumbs,
    }
