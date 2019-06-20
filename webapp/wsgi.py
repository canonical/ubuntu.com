"""
WSGI config for ubuntu project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
"""

# Core
import os

# Modules
import talisker.logs
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webapp.settings")

talisker.logs.set_global_extra({"service": "ubuntu.com"})
application = get_wsgi_application()
