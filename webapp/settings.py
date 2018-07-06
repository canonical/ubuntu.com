"""
Django settings for ubuntu project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

import os
import socket
import yaml

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

SECRET_KEY = os.environ.get('SECRET_KEY', 'no_secret')

# Google custom search settings
# https://cse.google.co.uk/cse/setup/basic?cx=009048213575199080868:i3zoqdwqk8o
SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1"
SEARCH_API_KEY = os.environ.get('SEARCH_API_KEY', None)
SEARCH_CACHE_EXPIRY_SECONDS = 600  # 10 minutes
CUSTOM_SEARCH_ID = "009048213575199080868:i3zoqdwqk8o"

# See https://docs.djangoproject.com/en/dev/ref/contrib/
INSTALLED_APPS = [
    'canonicalwebteam',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',  # Needed for STATICFILES_DIRS to work
]

WHITENOISE_MAX_AGE = 31557600
WHITENOISE_ALLOW_ALL_ORIGINS = False

FEED_TIMEOUT = 1.2

ALLOWED_HOSTS = ['*']
DEBUG = os.environ.get('DJANGO_DEBUG', 'false').lower() == 'true'

CUSTOM_HEADERS = {
    'X-Commit-ID': os.getenv('COMMIT_ID'),
    'X-Hostname': socket.gethostname()
}

USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
ROOT_URLCONF = 'webapp.urls'
WSGI_APPLICATION = 'webapp.wsgi.application'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = False
USE_L10N = False
USE_TZ = False
STATIC_URL = '/static/'
STATIC_ROOT = "static"
APPEND_SLASH = False
REMOVE_SLASH = True

# Use the IP address for now, as Docker doesn't use the
# VPN DNS server
# @TODO: Once Docker sorts this out, go back to using butlerov
# https://github.com/docker/docker/issues/23910

# SEARCH_SERVER_URL = 'http://butlerov.internal/search'
SEARCH_SERVER_URL = 'http://10.22.112.8/search'
SEARCH_TIMEOUT = 10

MIDDLEWARE_CLASSES = [
    'canonicalwebteam.custom_response_headers.Middleware',
    'unslashed.middleware.RemoveSlashMiddleware',
]

# Prometheus
if not DEBUG:
    INSTALLED_APPS.append('django_prometheus')
    MIDDLEWARE_CLASSES.insert(
        0,
        'django_prometheus.middleware.PrometheusBeforeMiddleware'
    )
    MIDDLEWARE_CLASSES.append(
        'django_prometheus.middleware.PrometheusAfterMiddleware'
    )
    # Run the prometheus exporters on a range of ports
    PROMETHEUS_METRICS_EXPORT_PORT_RANGE = range(9990, 9999)


STATICFILES_FINDERS = [
    'django_static_root_finder.finders.StaticRootFinder'
]

# Read navigation.yaml
with open('navigation.yaml') as navigation_file:
    NAV_SECTIONS = yaml.load(navigation_file.read())

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'builtins': [
                'canonicalwebteam.get_feeds.templatetags',
                'webapp.templatetags.utils',
            ],
            'context_processors': [
                'django_asset_server_url.asset_server_url',
                'webapp.context_processors.navigation',
                'django.template.context_processors.request',
            ],
        },
    },
]

ASSET_SERVER_URL = 'https://assets.ubuntu.com/v1/'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'error_file': {
            'level': 'WARNING',
            'filename': os.path.join(BASE_DIR, 'django-error.log'),
            'class': 'logging.handlers.RotatingFileHandler',
            'maxBytes': 1 * 1024 * 1024,
            'backupCount': 2
        }
    },
    'loggers': {
        'django': {
            'handlers': ['error_file'],
            'level': 'WARNING',
            'propagate': True
        }
    }
}
