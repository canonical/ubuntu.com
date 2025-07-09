from os import environ


def get_flask_env(key: str, default=None) -> str:
    """Return the value of KEY or FLASK_KEY."""
    return environ.get(key, environ.get(f"FLASK_{key}", default))


STORE_MAINTENANCE = get_flask_env("STORE_MAINTENANCE", True)
STORE_MAINTENANCE_START = get_flask_env(
    "STORE_MAINTENANCE_START", "2024-03-27 03:00:00+00:00"
)
STORE_MAINTENANCE_END = get_flask_env(
    "STORE_MAINTENANCE_END", "2024-03-27 05:00:00+00:00"
)

CRED_MAINTENANCE = get_flask_env("CRED_MAINTENANCE", True)
CRED_MAINTENANCE_START = get_flask_env(
    "CRED_MAINTENANCE_START", "2024-09-28 11:00:00+00:00"
)
CRED_MAINTENANCE_END = get_flask_env(
    "CRED_MAINTENANCE_END", "2024-09-28 15:00:00+00:00"
)

SEARCH_API_KEY = get_flask_env(
    "GOOGLE_API_GOOGLE_CUSTOM_SEARCH_KEY"
)  # google-api is secret name

DISCOURSE_API_KEY = get_flask_env(
    "DISCOURSE_API_UBUNTU_API_KEY"
)  # discourse-api is secret name
DISCOURSE_API_USERNAME = get_flask_env(
    "DISCOURSE_API_UBUNTU_API_USERNAME"
)  # discourse-api is secret name

LAUNCHPAD_IMAGE_BUILD_USER = get_flask_env(
    "LAUNCHPAD_IMAGEBUILD_USER"
)  # launchpad-imagebuild is secret name
LAUNCHPAD_IMAGE_BUILD_TOKEN = get_flask_env(
    "LAUNCHPAD_IMAGEBUILD_TOKEN"
)  # launchpad-imagebuild is secret name
LAUNCHPAD_IMAGE_BUILD_SECRET = get_flask_env(
    "LAUNCHPAD_IMAGEBUILD_SECRET"
)  # launchpad-imagebuild is secret name
LAUNCHPAD_IMAGE_BUILD_AUTH_CONSUMER = get_flask_env(
    "LAUNCHPAD_IMAGEBUILD_AUTH_CONSUMER"
)  # launchpad-imagebuild is secret name

MARKETO_API_CLIENT = get_flask_env(
    "MARKETO_API_CLIENT"
)  # marketo-api is secret name
MARKETO_API_SECRET = get_flask_env(
    "MARKETO_API_SECRET"
)  # marketo-api is secret name

GOOGLE_SERVICE_ACCOUNT_EMAIL = get_flask_env(
    "GOOGLE_SERVICE_ACCOUNT_EMAIL"
)  # google-service-account is secret name
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = get_flask_env(
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
)  # google-service-account is secret name

GOOGLE_DATASTORE_PROJECT_ID = get_flask_env(
    "UBUNTU_GOOGLE_DATASTORE_PROJECT_ID"
)  # ubuntu-google-datastore is secret name
GOOGLE_DATASTORE_EMAIL = get_flask_env(
    "UBUNTU_GOOGLE_DATASTORE_EMAIL"
)  # ubuntu-google-datastore is secret name
GOOGLE_DATASTORE_PRIVATE_KEY = get_flask_env(
    "UBUNTU_GOOGLE_DATASTORE_PRIVATE_KEY"
)  # ubuntu-google-datastore is secret name

CONFIDENTIALITY_AGREEMENT_WEBHOOK_USERNAME = get_flask_env(
    "CONFIDENTIALITY_WEBHOOK_USERNAME"
)  # confidentiality-webhook is secret name
CONFIDENTIALITY_AGREEMENT_WEBHOOK_PASSWORD = get_flask_env(
    "CONFIDENTIALITY_WEBHOOK_PASSWORD"
)  # confidentiality-webhook is secret name

SENTRY_DSN = get_flask_env(
    "SENTRY_DSN",
    "https://0293bb7fc3104e56bafd2422e155790c@sentry.is.canonical.com//13",
)

BADGR_URL = get_flask_env("BADGR_URL", "https://api.eu.badgr.io")
BADGR_USER = get_flask_env("BADGR_USER")  # badgr is secret name
BADGR_PASSWORD = get_flask_env("BADGR_QA_PASSWORD")  # badgr is secret name
BADGR_ISSUER = get_flask_env("BADGR_ISSUER", "badgr_issuer")

CANONICAL_CLA_API_URL = get_flask_env(
    "CANONICAL_CLA_API_URL", "https://cla.canonical.com"
)

CERTIFIED_BADGE = get_flask_env("CERTIFIED_BADGE", "certified_badge")

CONTRACTS_API_URL = get_flask_env(
    "CONTRACTS_API_URL", "https://contracts.canonical.com/"
)
SECURITY_API_URL = get_flask_env(
    "SECURITY_API_URL", "https://ubuntu.com/security/"
)
STRIPE_PUBLISHABLE_KEY = get_flask_env("STRIPE_PUBLISHABLE_KEY")
TRUEABILITY_URL = get_flask_env(
    "TRUEABILITY_URL", "https://app.trueability.com"
)
TRUEABILITY_API_KEY = get_flask_env(
    "TRUEABILITY_API_KEY"
)  # trueability is secret name
PROCTOR360_BASE_URL = get_flask_env(
    "PROCTOR360_BASE_URL", "https://prod1ext.proctor360.com"
)
PROCTOR360_APP_SECRET = get_flask_env(
    "PROCTOR360_APP_SECRET"
)  # proctor360 is secret name
PROCTOR360_APP_ID = get_flask_env(
    "PROCTOR360_APP_ID"
)  # proctor360 is secret name

TA_WEBHOOK_API_KEY = get_flask_env(
    "TRUEABILITY_WEBHOOK_SECRET"
)  # trueability is secret name
CREDLY_URL = get_flask_env("CREDLY_URL", "https://api.credly.com/v1")
CREDLY_TOKEN = get_flask_env("CREDLY_TOKEN")  # credly is secret name
CREDLY_ORGANIZATION_ID = get_flask_env(
    "CREDLY_ORGANIZATION"
)  # credly is secret name
CANONICAL_LOGIN_URL = get_flask_env(
    "CANONICAL_LOGIN_URL", "https://login.ubuntu.com/"
)
CHARMHUB_DISCOURSE_API_KEY = get_flask_env(
    "DISCOURSE_API_CHARMHUB_API_KEY"
)  # discourse-api is secret name
CHARMHUB_DISCOURSE_API_USERNAME = get_flask_env(
    "DISCOURSE_API_CHARMHUB_API_USERNAME"
)  # discourse-api is secret name
MAAS_DISCOURSE_API_KEY = get_flask_env(
    "DISCOURSE_API_MAAS_API_KEY"
)  # discourse-api is secret name
MAAS_DISCOURSE_API_USERNAME = get_flask_env(
    "DISCOURSE_API_MAAS_API_USERNAME"
)  # discourse-api is secret name


SITEMAPS_SECRET = get_flask_env("SITEMAPS_SECRET")  # sitemaps is secret name
