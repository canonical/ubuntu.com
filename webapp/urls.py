# Third party modules
from django.conf.urls import include, url
from canonicalwebteam.yaml_responses.django_helpers import (
    create_deleted_views,
    create_redirect_views,
)

# Local code
from .views import UbuntuTemplateFinder, DownloadView, ResourcesView, search


urlpatterns = create_redirect_views()
urlpatterns += create_deleted_views()
urlpatterns += [
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
