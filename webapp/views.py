import json
import sys
import os
from urllib2 import URLError

from feedparser import parse
from django_template_finder_view import TemplateFinder

from lib.gsa import GSAParser


class UbuntuTemplateFinder(TemplateFinder):
    def get_context_data(self, **kwargs):
        """
        Get context data fromt the database for the given page
        """

        # Get any existing context
        context = super(UbuntuTemplateFinder, self).get_context_data(**kwargs)

        # Add level_* context variables
        clean_path = self.request.path.strip('/')
        for index, path, in enumerate(clean_path.split('/')):
            context["level_" + str(index + 1)] = path

        return context


class DownloadView(UbuntuTemplateFinder):

    def get_context_data(self, **kwargs):
        """
        Load mirrors data from RSS file
        and return the list as context
        """

        context = super(DownloadView, self).get_context_data(**kwargs)

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


class SearchView(UbuntuTemplateFinder):
    '''
    Return search results from the Google Search Appliance

    Requests should be formatted: <url>?q=<string>&offset=<num>&limit=<num>

    I've used "offset" and "limit" for pagination,
    following the "Web API Design" standard:
    https://pages.apigee.com/web-api-design-ebook.html

    This gets results from Canonical's Google Search Appliance,
    currently located at: tupilaq.internal (10.22.112.9)

    Developing
    ===

    When running on the development server (runserver),
    self.gsa_domain will be replaced with "localhost:2000"
    because unfortunately, development machines won't have
    permissions to talk to the GSA directly.

    Get SSH access to 10.55.60.86, which does have GSA access
    and then create a localhost tunnel:

    ssh -f 10.55.60.86 -L 2000:tupilaq.internal:80 -N
    '''

    def get_context_data(self, **kwargs):
        """
        Extend CMSPageView.get_context_data to parse query parameters
        and return search results from the Google Search Appliance (GSA)

        E.g.: http://example.com/search?q=juju&limit=10&offset=10

        Query parameters:
        - q: the search query to be passed to the GSA
        - limit: number of results to return, "page size" (default: 10)
        - offset: where to start results at (default: 0)
        """

        # On live the GSA domain will be tupilaq.internal
        # but on dev, we need to access GSA through localhost
        # (see GSASearchView docstring above)
        gsa_domain = 'tupilaq.internal'

        if 'runserver' in sys.argv:
            gsa_domain = 'localhost:2000'

        parser = GSAParser(gsa_domain)

        # Import context from parent
        context = super(SearchView, self).get_context_data(**kwargs)

        # defaults + GET params
        context.update({
            'query': self.request.GET.get('q', ''),
            'results': [],
            'request_succeeded': True,
            'parse_succeeded': True,
            'start': 0,
            'end': 0,
            'limit': int(self.request.GET.get('limit', '10')),
            'offset': int(self.request.GET.get('offset', '0')),
            'total': 0,
            'nav_items': []
        })

        # return self.context
        try:
            gsa_results = parser.fixed_results(
                context['query'],
                start=context['offset'],
                num=context['limit']
            )

            nav_url = "{path}?q={query}".format(
                path=self.request.path,
                query=context['query']
            )

            results = self.parse_gsa_results(gsa_results)
            context.update(results)

            context['nav_items'] = self.build_nav_items(
                context,
                nav_url
            )

        except URLError:
            context['request_succeeded'] = False
        except ValueError:
            context['parse_succeeded'] = False

        return context

    def parse_gsa_results(self, gsa_results):

        results_meta = gsa_results['results_nav']

        data = {}

        # Parse data
        if 'results' in gsa_results:
            data['results'] = gsa_results['results']

        if results_meta['total_results'].isdigit():
            data['total'] = int(results_meta['total_results'])

        if results_meta['results_start'].isdigit():
            data['start'] = int(results_meta['results_start'])

        if results_meta['results_end'].isdigit():
            data['end'] = int(results_meta['results_end'])

        data['have_next'] = bool(results_meta.get('have_next', '0'))

        return data

    def build_nav_items(self, data, url):
        """
        Create an array of navigational items
        from results data
        """

        items = []

        first_offset = 0
        offset = data['start'] - 1
        previous_offset = offset - data['limit']
        next_offset = data['end']

        remainder = data['total'] % data['limit']

        if remainder == 0:
            last_offset = data['total'] - data['limit']
        else:
            last_offset = data['total'] - remainder

        base_item = {
            "url": url + '&limit=' + str(data['limit'])
        }

        if first_offset < offset:
            first = self.build_item(base_item, 'First', first_offset, 'back')
            first['class'] = 'item-extreme'
            items.append(first)

        if previous_offset > first_offset and previous_offset < offset:
            items.append(self.build_item(
                base_item,
                'Previous',
                previous_offset,
                'back'
            ))

        if data['have_next'] and next_offset < last_offset:
            items.append(self.build_item(
                base_item,
                'Next',
                next_offset,
                'forward'
            ))

        if data['have_next'] and offset < last_offset:
            last = self.build_item(base_item, 'Last', last_offset, 'forward')
            last['class'] = 'item-extreme'
            items.append(last)

        return items

    def build_item(self, base_item, name, offset, direction):
        """
        Build one navigational item
        """

        item = base_item.copy()
        item['name'] = name
        item['url'] = item['url'] + '&offset=' + str(offset)
        item['direction'] = direction

        return item
