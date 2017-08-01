# Third party modules
from django.conf.urls import url
from canonicalwebteam import yaml_deleted_paths
from canonicalwebteam import yaml_redirects
from ubuntudesign.gsa.views import SearchView

# Local code
from .views import UbuntuTemplateFinder, DownloadView


urlpatterns = yaml_redirects.create_views()
urlpatterns += yaml_deleted_paths.create_views()
urlpatterns += [
    url(
        r'^(?P<template>download/(desktop|server|cloud)/thank-you)$',
        DownloadView.as_view()
    ),
    url(
        r'^(?P<template>download/desktop/contribute)$',
        DownloadView.as_view()
    ),
    url(r'^search$', SearchView.as_view(template_name='search.html')),
    url(r'^(?P<template>.*)[^\/]$', UbuntuTemplateFinder.as_view()),
    url(r'$^', UbuntuTemplateFinder.as_view()),
]
