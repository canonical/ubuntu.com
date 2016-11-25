from django.conf.urls import patterns, url

from django_yaml_redirects import load_redirects
from .views import UbuntuTemplateFinder, DownloadView, SearchView, ContactView, ContactThankYouView

urlpatterns = load_redirects()
urlpatterns += patterns(
    '',
    url(
        r'^(?P<template>download/(desktop|server|cloud)/thank-you)$',
        DownloadView.as_view()
    ),
    url(
        r'^(?P<template>download/desktop/contribute)$',
        DownloadView.as_view()
    ),
    url(r'^(?P<template>search)$', SearchView.as_view()),
    url(r'^(?P<template>.*/contact-us)$', ContactView.as_view()),
    url(r'^(?P<template>(?!download).*/thank-you)$', ContactThankYouView.as_view()),
    url(r'^(?P<template>.*)[^\/]$', UbuntuTemplateFinder.as_view()),
    url(r'$^', UbuntuTemplateFinder.as_view()),
)
