import json
import os
import re

from feedparser import parse
from django.views.generic.base import TemplateView
from django_template_finder_view import TemplateFinder
from canonicalwebteam.get_feeds import (
    get_json_feed_content
)


class UbuntuTemplateFinder(TemplateFinder):
    def get_context_data(self, **kwargs):
        """
        Get context data fromt the database for the given page
        """

        # Get any existing context
        context = super(UbuntuTemplateFinder, self).get_context_data(**kwargs)

        # Add product query param to context
        context['product'] = self.request.GET.get('product')

        # Add level_* context variables
        clean_path = self.request.path.strip('/')
        for index, path, in enumerate(clean_path.split('/')):
            context["level_" + str(index + 1)] = path

        return context


class ResourcesView(TemplateView):
    template_name = 'resources/index.html'

    INSIGHTS_URL = 'https://insights.ubuntu.com'
    API_URL = INSIGHTS_URL + '/wp-json/wp/v2'
    RESOURCE_FILTER = 'categories=1172,1509,1187'
    GROUPS = {
        'cloud-and-server': {'id': 1706, 'name': 'Cloud and server'},
        'desktop': {'id': 1479, 'name': 'Desktop'},
        'internet-of-things': {'id': 1666, 'name': 'Internet of things'},
    }

    def _get_categories_by_slug(self, slugs=[]):
        if slugs:
            if isinstance(slugs, list):
                slugs = ','.join(slugs)
        api_url = '{api_url}/posts?category={slug}'.format(
            api_url=self.API_URL,
            slug=slugs,
        )
        response = get_json_feed_content(api_url)
        return response

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
        return resources

    def _get_resources(self):
        topic = self.request.GET.get('topic')
        feed_items = {}
        if topic:
            category_id = str(self.GROUPS[topic]['id'])
            api_url = (
                '{api_url}/posts?_embed&group={category_id}&{resource_filter}'
            )
            api_url = api_url.format(
                api_url=self.API_URL,
                category_id=category_id,
                resource_filter=self.RESOURCE_FILTER,
            )
            feed_items[topic] = {}
            feed_items[topic]['items'] = get_json_feed_content(api_url)
            feed_items[topic]['group_name'] = self.GROUPS[topic]['name']
        else:
            for group_name, group in self.GROUPS.items():
                api_url = '{api_url}/posts?category={group_id}'.format(
                    api_url=self.API_URL,
                    group_id=group['id'],
                )
                feed_items[group_name] = {}
                feed_items[group_name]['items'] = get_json_feed_content(
                    api_url,
                    limit=3,
                )
                feed_items[group_name]['group_name'] = group['name']
        return feed_items

    def get_context_data(self, **kwargs):
        """
        Get the context from insights for the resources page
        """

        # Get any existing context
        context = super(ResourcesView, self).get_context_data(**kwargs)
        context['items'] = self._get_resources()
        context['slug'] = self.request.GET.get('topic')
        return context


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
