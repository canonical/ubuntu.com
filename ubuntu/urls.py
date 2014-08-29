from django.conf.urls import patterns, url
from fenchurch import TemplateFinder

from ubuntu.views import DownloadView, SearchView

urlpatterns = patterns('',
    url(r'^(?P<template>download/(desktop|server|cloud)/thank-you)/?$',
        DownloadView.as_view()),
    url('^(?P<template>search)/?$', SearchView.as_view()),
    url(r'^(?P<template>.*)$', TemplateFinder.as_view()),
)
