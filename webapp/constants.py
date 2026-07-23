import logging

import requests

logger = logging.getLogger(__name__)


# Centralised UI translations for Engage pages and other shared constants

# Default time-to-live for ResponseCache instances, in seconds (24 hours)
CACHE_TTL = 60 * 60 * 24

ENGAGE_UI_TRANSLATIONS = {
    "additional_resources": {
        "en": "Additional Resources",
        "es": "Recursos adicionales",
        "fr": "Ressources supplémentaires",
        "pt": "Recursos adicionais",
        "de": "Zusätzliche Ressourcen",
        "tr": "Ek Kaynaklar",
        "it": "Risorse aggiuntive",
    }
}

# Substrings that indicate a Marketo form submission is a script/command
# injection attempt (path traversal, SSRF, command/header injection probes,
# etc.) rather than a genuine lead. Matched case-insensitively against every
# submitted field value in webapp.views.marketo_submit. HTML/XSS payloads
# are detected separately and more robustly via nh3.is_html().
MARKETO_INJECTION_PATTERNS = [
    "etc/passwd",
    "%2fetc%2f",
    "../",
    "..%2f",
    "md5(",
    "nslookup",
    "curl",
    "esi:include",
    "bcc:",
    "to@example.com",
    "%2527",
    "%2522",
    # Known automated-scanner tokens/domains (blind XSS callbacks, scanner
    # fingerprints) reported against public Marketo forms.
    "bxss.me",
    "virustester",
    "h9e6.top",
    "wordpressbin",
]


# Used if the live fetch from Google fails at startup. Covers the regions
# we've historically seen in CSP reports.
_GOOGLE_DOMAINS_FALLBACK = [
    "www.google.com",
    # Europe
    "www.google.at",
    "www.google.be",
    "www.google.ch",
    "www.google.co.uk",
    "www.google.cz",
    "www.google.de",
    "www.google.dk",
    "www.google.es",
    "www.google.fi",
    "www.google.fr",
    "www.google.gr",
    "www.google.hu",
    "www.google.ie",
    "www.google.it",
    "www.google.nl",
    "www.google.no",
    "www.google.pl",
    "www.google.pt",
    "www.google.ro",
    "www.google.se",
    # Americas
    "www.google.ca",
    "www.google.cl",
    "www.google.co",
    "www.google.com.ar",
    "www.google.com.br",
    "www.google.com.mx",
    "www.google.com.pe",
    # Asia & Pacific
    "www.google.co.id",
    "www.google.co.in",
    "www.google.co.jp",
    "www.google.co.kr",
    "www.google.co.nz",
    "www.google.co.th",
    "www.google.com.au",
    "www.google.com.hk",
    "www.google.com.my",
    "www.google.com.ph",
    "www.google.com.sg",
    "www.google.com.tw",
    "www.google.com.vn",
]


def _fetch_google_supported_domains():
    """
    Fetch Google's published list of regional search domains so GTM can
    reach the user's local google.<tld>. Falls back to a hardcoded list
    if the request fails so CSP remains valid.
    """
    try:
        response = requests.get(
            "https://www.google.com/supported_domains", timeout=5
        )
        response.raise_for_status()
        domains = [
            "www" + line.strip()
            for line in response.text.splitlines()
            if line.strip().startswith(".google.")
        ]
        if domains:
            return domains
        logger.warning("Google supported_domains response was empty")
    except requests.RequestException as exc:
        logger.warning("Failed to fetch Google supported_domains: %s", exc)
    return _GOOGLE_DOMAINS_FALLBACK


GOOGLE_DOMAINS = _fetch_google_supported_domains()

# Same-origin endpoint registered in webapp.handlers.init_handlers();
# browsers send CSP violation reports here for both the enforced CSP and
# the report-only CSP below, regardless of the page's own connect-src.
CSP_REPORT_PATH = "/csp-report"


# Content Security Policy configuration
CSP = {
    "default-src": ["'self'"],
    "img-src": [
        "data: blob:",
        # This is needed to allow images from
        # https://www.google.*/ads/ga-audiences to load.
        "*",
    ],
    "script-src-elem": [
        "'self'",
        "'strict-dynamic'",
        "assets.ubuntu.com",
        "www.google-analytics.com",
        "www.googletagmanager.com",
        "dev.visualwebsiteoptimizer.com",
        "www.youtube.com",
        "asciinema.org",
        "player.vimeo.com",
        "script.crazyegg.com",
        "w.usabilla.com",
        "munchkin.marketo.net",
        "serve.nrich.ai",
        "ml314.com",
        "scout-cdn.salesloft.com",
        "snippet.maze.co",
        "www.googleadservices.com",
        "js.zi-scripts.com",
        "*.g.doubleclick.net",
        "www.google.com",
        "www.gstatic.com",
        "*.googlesyndication.com",
        "js.stripe.com",
        "d3js.org",
        "www.brighttalk.com",
        "cdnjs.cloudflare.com",
        "static.ads-twitter.com",
        "*.cdn.digitaloceanspaces.com",
        "www.redditstatic.com",
        "snap.licdn.com",
        "connect.facebook.net",
        "cdn.livechatinc.com",
        "api.livechatinc.com",
        "secure.livechatinc.com",
        "www.tfaforms.com",
        "api.usabilla.com",
        "*.cloudfront.net",
        "cdn.jsdelivr.net",
        "extend.vimeocdn.com",
        "tracking-api.g2.com",
    ],
    "font-src": [
        "'self'",
        "assets.ubuntu.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "fonts.google.com",
    ],
    "script-src": [
        "'self'",
        "blob:",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
        "*.livechat-static.com",
        "'unsafe-eval'",
    ],
    "connect-src": [
        "'self'",
        "*.googlesyndication.com",
        "www.google.com",
        "ubuntu.com",
        "analytics.google.com",
        "www.googletagmanager.com",
        "sentry.is.canonical.com",
        "www.google-analytics.com",
        "*.crazyegg.com",
        "scout.salesloft.com",
        "*.g.doubleclick.net",
        "js.zi-scripts.com",
        "*.mktoresp.com",
        "prompts.maze.co",
        "*.google-analytics.com",
        "pixel-config.reddit.com",
        "www.redditstatic.com",
        "conversions-config.reddit.com",
        "px.ads.linkedin.com",
        "ws.zoominfo.com",
        "youtube.com",
        "google.com",
        # Regional google.<tld> domains used by GTM's ads / ga-audiences
        # pixel, sourced live from https://www.google.com/supported_domains
        # at app startup. Plain *.google.com does NOT cover other TLDs.
        *GOOGLE_DOMAINS,
        "fonts.google.com",
        "api.text.com",
        "raw.githubusercontent.com",
        "*.analytics.google.com",
        "ad.doubleclick.net",
        "www.googleadservices.com",
        "www.facebook.com",
        "*.livechatinc.com",
        "*.text.com",
        "*.youtube.com",
        "*.google.com",
        "cdn.jsdelivr.net",
        "bat.bing.com",
        "*.clarity.ms",
    ],
    "frame-src": [
        "'self'",
        "*.doubleclick.net",
        "www.youtube.com/",
        "asciinema.org",
        "player.vimeo.com",
        "js.stripe.com",
        "www.googletagmanager.com",
        "www.google.com",
        "www.brighttalk.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "cdn.livechat-static.com",
        "*.cloudfront.net",
        "app3.trueability.com",
        "app.trueability.com",
        "pay.stripe.com",
        "www.facebook.com",
    ],
    "style-src": [
        "*.cloudfront.net",
        "cdn.jsdelivr.net",
        "'self'",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
        "'unsafe-inline'",
    ],
    "media-src": [
        "'self'",
        "res.cloudinary.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "cdn.livechat-static.com",
        "images.zenhubusercontent.com",
        "assets.ubuntu.com",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
        "*.livechat-static.com",
        "ubuntu.com",
    ],
    "child-src": [
        "api.livechatinc.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "youtube.com",
        "google.com",
        "fonts.google.com",
        "'self'",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
        "blob:",
    ],
    "object-src": [
        "'self'",
        "*.livechatinc.com",
        "*.youtube.com",
        "*.google.com",
    ],
    "frame-ancestors": [
        "https://edge-billing.stripe.com",
        "https://edge-connect.stripe.com",
        "https://edge-dashboard-admin.stripe.com",
        "https://edge-dashboard.stripe.com",
        "https://edge-docs.stripe.com",
        "https://edge-marketplace.stripe.com",
        "https://edge-support.stripe.com",
        "https://billing.stripe.com",
        "https://connect.stripe.com",
        "https://dashboard-admin.stripe.com",
        "https://dashboard.stripe.com",
        "https://docs.stripe.com",
        "https://edge-support-conversations.stripe.com",
        "https://edge.stripe.com",
        "https://marketplace.stripe.com",
        "https://stripe.com",
        "https://support-admin.corp.stripe.com",
        "https://support-conversations.stripe.com",
        "https://support.stripe.com",
    ],
    "report-uri": [CSP_REPORT_PATH],
}


# These sources have no remaining reference anywhere in this repo, but
# marketing/analytics tags can be injected at runtime via Google Tag
# Manager, whose container config lives outside this repo, so static
# analysis alone can't prove they're unused. We put them in a report-only CSP
# so we can watch Sentry for violations (see webapp.handlers.csp_report)
# during a bake-in period before removing them from the enforced CSP above.
_CSP_REPORT_ONLY_REMOVALS = {
    "script-src-elem": [
        "script.crazyegg.com",
        "js.zi-scripts.com",
        "snap.licdn.com",
        "munchkin.marketo.net",
        "ml314.com",
        "scout-cdn.salesloft.com",
        "snippet.maze.co",
        "*.cdn.digitaloceanspaces.com",
        "tracking-api.g2.com",
        "extend.vimeocdn.com",
        "d3js.org",
        "www.tfaforms.com",
    ],
    "connect-src": [
        "*.crazyegg.com",
        "js.zi-scripts.com",
        "ws.zoominfo.com",
        "px.ads.linkedin.com",
        "scout.salesloft.com",
        "prompts.maze.co",
        "pixel-config.reddit.com",
        "www.redditstatic.com",
        "conversions-config.reddit.com",
        "*.clarity.ms",
    ],
}


def _build_csp_report_only(csp):
    stricter = {directive: list(values) for directive, values in csp.items()}
    for directive, stale_values in _CSP_REPORT_ONLY_REMOVALS.items():
        stricter[directive] = [
            value for value in stricter[directive] if value not in stale_values
        ]
    return stricter


CSP_REPORT_ONLY = _build_csp_report_only(CSP)

# Hosts already triaged as noise get added here so their reports are
# dropped outright rather than forwarded to Sentry. Starts empty: we have
# no real violation traffic yet to triage against.
CSP_REPORT_IGNORED_HOSTS = frozenset()

# Forward at most one Sentry event per unique violation signature per window.
CSP_REPORT_DEDUP_WINDOW = 3600  # seconds (1 hour)

# Real CSP violation reports are a few hundred bytes; /csp-report is
# unauthenticated, so reject anything wildly larger before parsing it.
CSP_REPORT_MAX_BYTES = 8192


# CSP directives that receive the per-request nonce. With 'strict-dynamic' in
# script-src-elem, the nonce authorises page scripts (and scripts they load),
# replacing the removed 'unsafe-inline'.
NONCED_DIRECTIVES = ("script-src", "script-src-elem")
