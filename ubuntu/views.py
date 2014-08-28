import json

from django.views.decorators.cache import cache_control
from django.conf import settings
from feedparser import parse
from fenchurch import TemplateFinder

class DownloadView(TemplateFinder):
    def get_context_data(self, **kwargs):
        context = super(DownloadView, self).get_context_data(**kwargs)
        with open('/tmp/mirrors.rss') as rss:
            mirrors = parse(rss).entries
        mirror_list = [
            {'link': mirror['link'], 'bandwidth': mirror['mirror_bandwidth']}
            for mirror in mirrors
            if mirror['mirror_countrycode'] == "GB"
            #self.request.GET.get('country', "NO_COUNTRY_CODE")
        ]
        context['mirror_list'] = json.dumps(mirror_list)
        return context

    @cache_control(public=True, max_age=settings.CACHE_MAX_AGE)
    def get(self, request, *args, **kwargs):
        return super(DownloadView, self).get(
            request,
            *args,
            template='download/desktop/thank-you',
            **kwargs)