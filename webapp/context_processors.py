from django.conf import settings
from copy import deepcopy


def _remove_hidden(pages):
    filtered_pages = []

    # Filter out hidden pages
    for child in pages:
        if not child.get('hidden'):
            filtered_pages.append(child)

    return filtered_pages


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
                break
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
                        break

    return {
        'nav_sections': nav_sections,
        'breadcrumbs': breadcrumbs,
    }
