"""
Django settings for ubuntu project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Keep it secret, keep it safe!
SECRET_KEY = 'g@=8y0p%v6hsk6n1p*^tqb@)g1#v7r!#e1x5^x!$bvm#u9hal4'

# See https://docs.djangoproject.com/en/dev/ref/contrib/
INSTALLED_APPS = [
    'django.contrib.staticfiles',  # Needed for STATICFILES_DIRS to work
    'django_versioned_static_url'
]

WHITENOISE_MAX_AGE = 31557600
WHITENOISE_ALLOW_ALL_ORIGINS = False

ALLOWED_HOSTS = ['*']
DEBUG = False
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

MIDDLEWARE_CLASSES = [
    'unslashed.middleware.RemoveSlashMiddleware',
]

STATICFILES_FINDERS = [
    'django_static_root_finder.finders.StaticRootFinder'
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'builtins': [
                'webapp.templatetags.feeds',
                'webapp.templatetags.utils',
            ],
            'context_processors': [
                'django_asset_server_url.asset_server_url',
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
