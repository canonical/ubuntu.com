import json
import os
import re

from canonicalwebteam.get_feeds import (
    get_json_feed_content
)
from collections import OrderedDict
from copy import copy
from django.views.generic.base import TemplateView
from django_template_finder_view import TemplateFinder
from django.conf import settings
from django.shortcuts import render
from feedparser import parse
from canonicalwebteam.http import CachedSession

try:
    from urllib.parse import urlencode
except ImportError:
    from urllib import urlencode


# Search service
if settings.SEARCH_API_KEY:
    search_session = CachedSession(
        expire_after=settings.SEARCH_CACHE_EXPIRY_SECONDS
    )


def search(request):
    """
    Get search results from Google Custom Search
    """

    query = request.GET.get('q')
    num = int(request.GET.get('num', '10'))
    start = int(request.GET.get('start', '1'))

    context = {
        'query': query,
        'start': start,
        'num': num
    }

    if query:
        if not settings.SEARCH_API_KEY:
            raise Exception('Unable to search: No API key provided')

        results = search_session.get(
            settings.SEARCH_API_URL,
            params={
                'key': settings.SEARCH_API_KEY,
                'cx': settings.CUSTOM_SEARCH_ID,
                'q': query,
                'start': start,
                'num': num
            }
        ).json()

        if 'items' in results:
            for item in results['items']:
                item['htmlSnippet'] = item['htmlSnippet'].replace('<br>\n', '')

        context['query'] = query
        context['estimatedTotal'] = int(
            results['searchInformation']['totalResults']
        )
        context['results'] = results

    return render(request, 'search.html', context)


class UbuntuTemplateFinder(TemplateFinder):
    def get_context_data(self, **kwargs):
        """
        Get context data fromt the database for the given page
        """

        # Get any existing context
        context = super(UbuntuTemplateFinder, self).get_context_data(**kwargs)

        # Add common URL query params to context
        context['product'] = self.request.GET.get('product')
        context['utm_source'] = self.request.GET.get('utm_source')
        context['utm_campaign'] = self.request.GET.get('utm_campaign')
        context['utm_medium'] = self.request.GET.get('utm_medium')

        # Add level_* context variables
        clean_path = self.request.path.strip('/')
        for index, path, in enumerate(clean_path.split('/')):
            context["level_" + str(index + 1)] = path

        return context


class ResourcesView(TemplateView):
    template_name = 'resources/index.html'

    INSIGHTS_URL = 'https://admin.insights.ubuntu.com'
    API_URL = INSIGHTS_URL + '/wp-json/wp/v2'
    RESOURCE_FILTER = 'categories=1172,1509,1187,1485'
    PER_PAGE = 9
    GROUPS = OrderedDict((
        ('cloud-and-server', {'id': 1706, 'name': 'Cloud and server'}),
        ('internet-of-things', {'id': 1666, 'name': 'Internet of things'}),
        ('desktop', {'id': 1479, 'name': 'Desktop'}),
    ))
    GROUPBYID = {
        1706: {'slug': 'cloud-and-server', 'name': 'Cloud and server'},
        1666: {'slug': 'internet-of-things', 'name': 'Internet of things'},
        1479: {'slug': 'desktop', 'name': 'Desktop'},
    }
    CATEGORIES = {
        'case-studies': {'id': 1172, 'name': 'Case studies'},
        'videos': {'id': 1509, 'name': 'Videos'},
        'webinars': {'id': 1187, 'name': 'Webinars'},
        'whitepapers': {'id': 1485, 'name': 'Whitepapers'},
    }
    CATEGORIESBYID = {
        1172: {'slug': 'case-studies', 'name': 'Case Study'},
        1509: {'slug': 'videos', 'name': 'Video'},
        1187: {'slug': 'webinars', 'name': 'Webinar'},
        1485: {'slug': 'whitepapers', 'name': 'Whitepaper'},
    }

    def _embed_resource_data(self, resource):
        if '_embedded' not in resource:
            return resource
        embedded = resource['_embedded']
        if 'wp:featuredmedia' not in embedded:
            return resource
        resource['featuredmedia'] = embedded['wp:featuredmedia'][0]
        return resource

    def _normalise_resources(self, resources):
        for resource in resources:
            resource = self._embed_resource_data(resource)
            for group in resource['group']:
                if group in self.GROUPBYID:
                    resource['group'] = {
                        'name': self.GROUPBYID[group]['name'],
                        'slug': self.GROUPBYID[group]['slug'],
                    }
                    break
            for category in resource['categories']:
                if category in self.CATEGORIESBYID:
                    resource['category'] = {
                        'name': self.CATEGORIESBYID[category]['name'],
                        'slug': self.CATEGORIESBYID[category]['slug'],
                    }
                    break

        return resources

    def _generate_pagination_queries(self, index, posts_length):
        previous_payload = copy(self.request.GET)
        previous_index = index - 1
        previous_payload['page'] = previous_index
        previous_link = '?{query}'.format(
            query=urlencode(previous_payload),
        )
        previous_enable = True
        if (index == 1):
            previous_enable = False

        next_payload = copy(self.request.GET)
        next_index = index + 1
        next_payload['page'] = next_index
        next_link = '?{query}'.format(
            query=urlencode(next_payload),
        )
        next_enable = True
        if (posts_length <= self.PER_PAGE):
            next_enable = False

        return {
            'next_link': next_link,
            'previous_link': previous_link,
            'next_index': next_index,
            'previous_index': previous_index,
            'previous_enable': previous_enable,
            'next_enable': next_enable
        }

    def _get_resources(self):
        topic = self.request.GET.get('topic')
        content = self.request.GET.get('content')
        page = int(self.request.GET.get('page', 1))
        offset = (page - 1) * self.PER_PAGE
        search = self.request.GET.get('q')
        feed_items = {}
        posts_length = 0
        if search:
            api_url = (
                '{api_url}/posts?_embed'
                '&search={search}&{resource_filter}'
            ).format(
                api_url=self.API_URL,
                search=search,
                resource_filter=self.RESOURCE_FILTER,
            )
            group_name = 'search'
            feed_items['posts'] = {}
            feed_items['posts'][group_name] = {}
            feed_items['posts'][group_name]['posts'] = get_json_feed_content(
                api_url,
            )
            group_title = 'Search results for "{search}"'.format(
                search=search,
            )
            feed_items['posts'][group_name]['group_name'] = group_title
            return feed_items
        if topic or content:
            if not content:
                category_id = str(self.GROUPS[topic]['id'])
                api_url = (
                    '{api_url}/posts?_embed'
                    '&group={category_id}'
                    '&{resource_filter}'
                    '&per_page={per_page}'
                    '&offset={offset}'
                ).format(
                    api_url=self.API_URL,
                    category_id=category_id,
                    resource_filter=self.RESOURCE_FILTER,
                    per_page=self.PER_PAGE + 1,
                    offset=offset,
                )
                feed_content = get_json_feed_content(api_url)

                if feed_content is False:
                    raise IOError('Failed to get feed: ' + api_url)

                posts = self._normalise_resources(feed_content)
                posts_length = len(posts)
                name = self.GROUPS[topic]['name']
                slug = topic
                feed_items['topic'] = {'name': name, 'slug': slug}
                feed_items['posts'] = {}
                feed_items['posts'][topic] = {}
                feed_items['posts'][topic]['posts'] = posts[:self.PER_PAGE]
                feed_items['posts'][topic]['group_name'] = name
            elif not topic:
                content_id = str(self.CATEGORIES[content]['id'])
                api_url = (
                    '{api_url}/posts?_embed'
                    '&categories={content_id}'
                    '&per_page={per_page}'
                    '&offset={offset}'
                ).format(
                    api_url=self.API_URL,
                    content_id=content_id,
                    per_page=self.PER_PAGE + 1,
                    offset=offset,
                )
                feed_content = get_json_feed_content(api_url)

                if feed_content is False:
                    raise IOError('Failed to get feed: ' + api_url)

                posts = self._normalise_resources(feed_content)
                posts_length = len(posts)
                title = 'All {name}'.format(
                    name=self.CATEGORIES[content]['name']
                )
                feed_items['posts'] = {}
                feed_items['posts'][content] = {}
                feed_items['posts'][content]['posts'] = posts[:self.PER_PAGE]
                feed_items['posts'][content]['group_name'] = title
            else:
                category_id = str(self.GROUPS[topic]['id'])
                content_id = str(self.CATEGORIES[content]['id'])
                api_url = (
                    '{api_url}/posts?_embed'
                    '&group={category_id}'
                    '&categories={content_id}'
                    '&per_page={per_page}'
                    '&offset={offset}'
                ).format(
                    api_url=self.API_URL,
                    category_id=category_id,
                    content_id=content_id,
                    per_page=self.PER_PAGE + 1,
                    offset=offset,
                )
                feed_content = get_json_feed_content(api_url)

                if feed_content is False:
                    raise IOError('Failed to get feed: ' + api_url)

                posts = self._normalise_resources(feed_content)
                posts_length = len(posts)
                title = '{topic} {content}'.format(
                    topic=self.GROUPS[topic]['name'],
                    content=self.CATEGORIES[content]['name'],
                )
                name = self.GROUPS[topic]['name']
                slug = topic
                feed_items['topic'] = {'name': name, 'slug': slug}
                feed_items['posts'] = {}
                feed_items['posts'][topic] = {}
                feed_items['posts'][topic]['posts'] = posts[:self.PER_PAGE]
                feed_items['posts'][topic]['group_name'] = title
        else:
            api_url = (
                '{api_url}/posts?_embed'
                '&{resource_filter}'
                '&per_page={per_page}'
                '&offset={offset}'
            ).format(
                api_url=self.API_URL,
                resource_filter=self.RESOURCE_FILTER,
                per_page=self.PER_PAGE + 1,
                offset=offset,
            )
            feed_content = get_json_feed_content(api_url)

            if feed_content is False:
                raise IOError('Failed to get feed: ' + api_url)

            posts = self._normalise_resources(feed_content)

            if posts:
                posts_length = len(posts)
                if 'posts' not in feed_items.keys():
                    feed_items['posts'] = OrderedDict()
                topic = 'All topics'
                feed_items['posts'][topic] = {}
                feed_items['posts'][topic]['posts'] = posts[:self.PER_PAGE]
                feed_items['posts'][topic]['group_name'] = topic
        feed_items['posts_length'] = posts_length
        feed_items['pagination'] = self._generate_pagination_queries(
            page,
            posts_length
        )
        return feed_items

    def get_context_data(self, **kwargs):
        """
        Get the context from insights for the resources page
        """

        # Get any existing context
        context = super(ResourcesView, self).get_context_data(**kwargs)
        try:
            context.update(self._get_resources())
        except IOError:
            context['posts'] = False

        context['topic_slug'] = self.request.GET.get('topic')
        context['content_slug'] = self.request.GET.get('content')
        context['page_index'] = int(self.request.GET.get('page', 1))
        context['search_slug'] = self.request.GET.get('q', '')
        return context

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        status = 503 if context.get('posts') is False else 200

        return self.render_to_response(context, status=status)


class DownloadView(UbuntuTemplateFinder):

    def get_context_data(self, **kwargs):
        """
        Load mirrors data from RSS file
        and return the list as context
        """

        context = super(DownloadView, self).get_context_data(**kwargs)
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
