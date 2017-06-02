import json
import os
import re
from copy import deepcopy

from feedparser import parse
from django_template_finder_view import TemplateFinder
from django.conf import settings


def _find_page_by_path(path, pages):
    """
    Locate a page from within a tree pages and children
    of any depth.
    """

    current_page = None

    for page in pages:
        if path == page['url_path']:
            current_page = page
            break
        elif 'children' in page:
            current_page = _find_page_by_path(path, page['children'])

    return current_page


def _find_page_section(path, sections):
    """
    Given a tree of sections with child pages,
    Return the page and its section.

    If the path matches the section itself,
    return a page with the title of "Overview"
    """

    matching_page = None
    matching_section = None

    for section in sections:
        if path == section['url_path']:
            matching_section = section
            matching_page = deepcopy(section)
            matching_page['title'] = 'Overview'
            break
        elif 'children' in section:
            page = _find_page_by_path(path, section['children'])

            if page:
                matching_section = section
                matching_page = page
                break

    return matching_section, matching_page


def _common_context(path):
    """
    Set any context that we want to pass to all pages
    """

    common_context = {}

    # Get breadcrumb information and pass to template
    section, page = _find_page_section(path, settings.NAV_ITEMS)
    if section and page:
        common_context['section_path'] = section.get('url_path')
        common_context['section_title'] = section.get('title')
        common_context['page_path'] = page.get('url_path')
        common_context['page_title'] = page.get('title')
        common_context['page_children'] = page.get('children')

    # Pass menu items to template
    common_context['menu_items'] = settings.MENU_ITEMS

    return common_context


class UbuntuTemplateFinder(TemplateFinder):
    def get_context_data(self, **kwargs):
        """
        Get context data fromt the database for the given page
        """

        # Get any existing context
        context = super(UbuntuTemplateFinder, self).get_context_data(**kwargs)

        # Add common context items
        context.update(_common_context(self.request.path))

        # Add product query param to context
        context['product'] = self.request.GET.get('product')

        return context


class DownloadView(UbuntuTemplateFinder):

    def get_context_data(self, **kwargs):
        """
        Load mirrors data from RSS file
        and return the list as context
        """

        context = super(DownloadView, self).get_context_data(**kwargs)

        # Add common context items
        context.update(_common_context(self.request.path))

        context['http_host'] = self.request.META.get('HTTP_HOST', '')

        version = self.request.GET.get('version', '')
        architecture = self.request.GET.get('architecture', '')

        # Sanitise for paths
        # (https://bugs.launchpad.net/ubuntu-website-content/+bug/1586361)
        version_pattern = re.compile(r'(\d+(?:\.\d+)+).*')
        architecture = architecture.replace('..', '')
        architecture = architecture.replace('/', '+').replace(' ', '+')

        if architecture and version_pattern.match(version):
            context['start_download'] = version and architecture
            context['version'] = version
            context['architecture'] = architecture

        # Add mirrors
        mirrors_path = os.path.join(
            os.getcwd(),
            'etc/ubuntu-mirrors-rss.xml'
        )

        try:
            with open(mirrors_path) as rss:
                mirrors = parse(rss).entries
        except IOError:
            mirrors = []

        mirror_list = [
            {'link': mirror['link'], 'bandwidth': mirror['mirror_bandwidth']}
            for mirror in mirrors
            if mirror['mirror_countrycode'] == self.request.GET.get(
                'country', "NO_COUNTRY_CODE"
            )
        ]
        context['mirror_list'] = json.dumps(mirror_list)
        return context
