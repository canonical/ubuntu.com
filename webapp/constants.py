import logging

import requests

logger = logging.getLogger(__name__)


# Centralised UI translations for Engage pages and other shared constants

# Default time-to-live for ResponseCache instances, in seconds (24 hours)
CACHE_TTL = 60 * 60 * 24

# Shorter TTL for the Engage/Takeovers app cache. EngagePages has no
# freshness probe (unlike Docs/Category), so nothing invalidates its
# cache when an editor changes a page — the only thing that bounds how
# long a stale copy is served is this TTL. Keep it short so edits appear
# without waiting out the 24h default. Tunable: lower = fresher, but more
# query-16 calls against the shared Discourse rate limit.
ENGAGE_CACHE_TTL = 60 * 30  # 30 minutes

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
        "*.g.doubleclick.net",
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
        "*.g.doubleclick.net",
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
}


# CSP directives that receive the per-request nonce. With 'strict-dynamic' in
# script-src-elem, the nonce authorises page scripts (and scripts they load),
# replacing the removed 'unsafe-inline'.
NONCED_DIRECTIVES = ("script-src", "script-src-elem")
