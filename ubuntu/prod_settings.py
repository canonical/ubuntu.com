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

DEBUG = True
TEMPLATE_DEBUG = True
ALLOWED_HOSTS = []

# See https://docs.djangoproject.com/en/dev/ref/contrib/
INSTALLED_APPS = (
    'django.contrib.staticfiles',  # Needed for STATICFILES_DIRS to work
)

ROOT_URLCONF = 'ubuntu.urls'
WSGI_APPLICATION = 'ubuntu.wsgi.application'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]
TEMPLATE_DIRS = [BASE_DIR + "/templates"]

# See http://tinyurl.com/django-context-processors
TEMPLATE_CONTEXT_PROCESSORS = (
    "django.core.context_processors.static",  # Provides {{ STATIC_URL }}
    "django.core.context_processors.request"  # Provides {{ request }} object
)
