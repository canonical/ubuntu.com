"""
WSGI config for ubuntu project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
"""

# Core
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webapp.settings")

# Modules
from django.core.wsgi import get_wsgi_application  # noqa
from whitenoise.django import DjangoWhiteNoise  # noqa

application = DjangoWhiteNoise(get_wsgi_application())
