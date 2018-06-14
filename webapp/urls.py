# Third party modules
from django.conf.urls import include, url
from django_yaml_redirects import load_redirects
from canonicalwebteam import yaml_deleted_paths
from canonicalwebteam.gsa.views import SearchView

# Local code
from .views import UbuntuTemplateFinder, DownloadView, ResourcesView


urlpatterns = load_redirects()
urlpatterns += yaml_deleted_paths.create_views()
urlpatterns += [
    url('', include('django_prometheus.urls')),
    url(
        r'^(?P<template>download/(desktop|server|cloud)/thank-you)$',
        DownloadView.as_view()
    ),
    url(r'^resources', ResourcesView.as_view()),
    url(r'^search$', SearchView.as_view(template_name='search.html')),
    url(r'^(?P<template>.*)[^\/]$', UbuntuTemplateFinder.as_view()),
    url(r'$^', UbuntuTemplateFinder.as_view()),
]
