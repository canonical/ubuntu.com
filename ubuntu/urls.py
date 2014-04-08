from django.conf.urls import patterns, url
from fenchurch import TemplateFinder

urlpatterns = patterns('',
    url(r'^(?P<template>.*)$', TemplateFinder.as_view()),
)
