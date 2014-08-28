from django.conf.urls import patterns, url
from fenchurch import TemplateFinder

from ubuntu.views import DownloadView

urlpatterns = patterns('',
	url(r'^download/desktop/thank-you$', DownloadView.as_view()),
    url(r'^(?P<template>.*)$', TemplateFinder.as_view()),
)
