# Third party modules
from django.conf.urls import url, include
from django.urls import path
from canonicalwebteam.yaml_responses.django_helpers import (
    create_deleted_views,
    create_redirect_views,
)
from canonicalwebteam.blog.django.views import group, topic

# Local code
from .views import UbuntuTemplateFinder, DownloadView, ResourcesView, search


urlpatterns = create_redirect_views()
urlpatterns += create_deleted_views()
urlpatterns += [
    path(
        "blog/cloud-and-server",
        group,
        {
            "slug": "cloud-and-server",
            "template_path": "blog/cloud-and-server.html",
        },
        name="group",
    ),
    path(
        "blog/desktop",
        group,
        {"slug": "desktop", "template_path": "blog/desktop.html"},
        name="group",
    ),
    path(
        "blog/press-centre",
        group,
        {
            "slug": "canonical-announcements",
            "template_path": "blog/press-centre.html",
        },
        name="group",
    ),
    path(
        "blog/internet-of-things",
        group,
        {
            "slug": "internet-of-things",
            "template_path": "blog/internet-of-things.html",
        },
        name="group",
    ),
    path(
        "blog/topics/maas",
        topic,
        {"slug": "maas", "template_path": "blog/topics/maas.html"},
        name="topic",
    ),
    path(
        "blog/topics/design",
        topic,
        {"slug": "design", "template_path": "blog/topics/design.html"},
        name="topic",
    ),
    path(
        "blog/topics/juju",
        topic,
        {"slug": "juju", "template_path": "blog/topics/juju.html"},
        name="topic",
    ),
    path(
        "blog/topics/robotics",
        topic,
        {"slug": "robotics", "template_path": "blog/topics/robotics.html"},
        name="topic",
    ),
    path("blog", include("canonicalwebteam.blog.django.urls")),
    url("", include("django_prometheus.urls")),
    url(
        r"^(?P<template>download/(desktop|server|cloud)/thank-you)$",
        DownloadView.as_view(),
    ),
    url(r"^resources", ResourcesView.as_view()),
    url(r"^search$", search),
    url(r"^(?P<template>.*)[^\/]$", UbuntuTemplateFinder.as_view()),
    url(r"$^", UbuntuTemplateFinder.as_view()),
]
