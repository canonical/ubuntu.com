from typing import List

import flask
from canonicalwebteam import image_template
from slugify import slugify

from webapp.context import (
    current_year,
    date_has_passed,
    descending_years,
    format_date,
    format_to_id,
    get_json_feed,
    get_navigation,
    get_secondary_navigation,
    modify_query,
    month_name,
    months_list,
    releases,
    schedule_banner,
    sort_by_key_and_ordered_list,
    split_list,
)
from webapp.login import empty_session, user_info
from webapp.security.api import SecurityAPIError
from webapp.shop.api.ua_contracts.api import (
    UAContractsAPIError,
    UAContractsAPIErrorView,
    UnauthorizedError,
    UnauthorizedErrorView,
)
from webapp.shop.flaskparser import UAContractsValidationError
from webapp.certified.helpers import convert_markdown_to_html
from canonicalwebteam.flask_base.env import get_flask_env

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
        "jspm.dev",
        "cdn.livechatinc.com",
        "api.livechatinc.com",
        "secure.livechatinc.com",
        "www.tfaforms.com",
        "api.usabilla.com",
        "*.cloudfront.net",
        "cdn.jsdelivr.net",
        "*.g.doubleclick.net",
        # This is necessary for Google Tag Manager to function properly.
        "'unsafe-inline'",
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
        "'unsafe-eval'",
        "'unsafe-hashes'",
        "'unsafe-inline'",
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
        "api.livechatinc.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "youtube.com",
        "google.com",
        "fonts.google.com",
        "api.text.com",
        "raw.githubusercontent.com",
        "*.analytics.google.com",
        "*.g.doubleclick.net",
        "ad.doubleclick.net",
        "www.googleadservices.com",
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
    ],
    "child-src": [
        "api.livechatinc.com",
        "cdn.livechatinc.com",
        "secure.livechatinc.com",
        "youtube.com",
        "google.com",
        "fonts.google.com",
        "'self'",
        "blob:",
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


def init_handlers(app, sentry):
    @app.after_request
    def cache_headers(response):
        """
        Set cache expiry to 60 seconds for homepage and blog page
        """

        disable_cache_on = (
            "/account",
            "/advantage",
            "/pro",
            "/credentials",
            "/core/build",
            "/account.json",
        )

        if flask.request.path.startswith(disable_cache_on):
            response.cache_control.no_store = True

        # Prevent XSS
        if flask.request.path.startswith("/certified"):
            response.headers["X-Frame-Options"] = "DENY"

        return response

    # Error pages
    @app.errorhandler(400)
    def bad_request_error(error):
        return (
            flask.render_template("400.html", message=error.description),
            400,
        )

    @app.errorhandler(403)
    def forbidden_error(error):
        return (
            flask.render_template("403.html", message=error.description),
            403,
        )

    @app.errorhandler(410)
    def deleted_error(error):
        return (
            flask.render_template("410.html", message=error.description),
            410,
        )

    @app.errorhandler(429)
    def too_many_requests(error):
        """
        Endpoint abuse error
        """
        custom_error = f"{error.description}. Please try again tomorrow."
        return flask.render_template("429.html", message=custom_error), 429

    @app.errorhandler(SecurityAPIError)
    def security_api_error(error):
        message = "An error occurred while fetching security data"
        try:
            response_data = error.response.json()
            message = response_data.get("message", message)
        except (ValueError, AttributeError):
            pass

        return (
            flask.render_template(
                "security-error-500.html",
                message=message,
            ),
            500,
        )

    @app.errorhandler(UAContractsValidationError)
    def ua_contracts_validation_error(error):
        sentry.captureException(
            extra={
                "user_info": user_info(flask.session),
                "request_url": error.request.url,
                "request_body": error.request.json,
                "response_body": error.response.messages,
            }
        )

        return flask.jsonify({"errors": error.response.messages}), 422

    @app.errorhandler(UAContractsAPIError)
    @app.errorhandler(UnauthorizedError)
    def ua_contracts_api_error(error):
        sentry.captureException(
            extra={
                "user_info": user_info(flask.session),
                "request_url": error.request.url,
                "request_headers": error.request.headers,
                "response_headers": error.response.headers,
                "response_body": error.response.json(),
            }
        )

        if error.response.status_code == 401:
            empty_session(flask.session)

        return (
            flask.jsonify({"errors": error.response.json()["message"]}),
            error.response.status_code or 500,
        )

    @app.errorhandler(UAContractsAPIErrorView)
    @app.errorhandler(UnauthorizedErrorView)
    def ua_contracts_api_error_view(error):
        sentry.captureException(
            extra={
                "user_info": user_info(flask.session),
                "request_url": error.request.url,
                "request_headers": error.request.headers,
                "response_headers": error.response.headers,
                "response_body": error.response.json(),
            }
        )

        if error.response.status_code == 401:
            empty_session(flask.session)

            return flask.redirect(flask.request.url)

        return flask.render_template("500.html"), 500

    # Template context
    @app.context_processor
    def context():
        return {
            "current_year": current_year,
            "descending_years": descending_years,
            "format_date": format_date,
            "get_json_feed": get_json_feed,
            "modify_query": modify_query,
            "month_name": month_name,
            "months_list": months_list,
            "get_secondary_navigation": get_secondary_navigation,
            "get_stripe_publishable_key": get_flask_env(
                "STRIPE_PUBLISHABLE_KEY",
                "pk_live_68aXqowUeX574aGsVck8eiIE",
            ),
            "product": flask.request.args.get("product", ""),
            "request": flask.request,
            "releases": releases(),
            "user_info": user_info(flask.session),
            "utm_campaign": flask.request.args.get("utm_campaign", ""),
            "utm_content": flask.request.args.get("utm_content", ""),
            "utm_medium": flask.request.args.get("utm_medium", ""),
            "utm_source": flask.request.args.get("utm_source", ""),
            "CAPTCHA_TESTING_API_KEY": get_flask_env(
                "CAPTCHA_TESTING_API_KEY",
                "6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if",
            ),
            "http_host": flask.request.host,
            "schedule_banner": schedule_banner,
            "get_navigation": get_navigation,
            "split_list": split_list,
            "format_to_id": format_to_id,
        }

    def get_countries_list() -> List[dict]:
        """
        Get a list of countries in a standard format
        """
        from pycountry import countries

        countries = [
            {
                "alpha2": country.alpha_2,
                "name": getattr(country, "common_name", country.name),
            }
            for country in list(countries)
        ]
        return sorted(countries, key=lambda x: x["name"])

    @app.context_processor
    def utility_processor():
        return {
            "image": image_template,
            "get_countries_list": get_countries_list,
        }

    @app.after_request
    def add_headers(response):
        """
        Generic rules for headers to add to all requests
        - Content-Security-Policy: Restrict resources (e.g., JavaScript, CSS,
        Images) and URLs
        - Referrer-Policy: Limit referrer data for security while preserving
        full referrer for same-origin requests
        - Cross-Origin-Embedder-Policy: allows embedding cross-origin
        resources
        - Cross-Origin-Opener-Policy: enable the page to open pop-ups while
        maintaining same-origin policy
        - Cross-Origin-Resource-Policy: allowing cross-origin requests to
        access the resource
        - X-Permitted-Cross-Domain-Policies: disallows cross-domain access to
        resources.
        - X-Robots-Tag: prevents search engines from indexing the page
        """

        def get_csp_as_str(csp={}):
            csp_str = ""
            for key, values in csp.items():
                csp_value = " ".join(values)
                csp_str += f"{key} {csp_value}; "
            return csp_str.strip()

        response.headers["Content-Security-Policy"] = get_csp_as_str(CSP)

        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"
        response.headers["Cross-Origin-Opener-Policy"] = (
            "same-origin-allow-popups"
        )
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        if get_flask_env("FLASK_ENV", "production") != "production":
            response.headers["X-Robots-Tag"] = "none"
        return response

    app.add_template_filter(date_has_passed)

    app.add_template_filter(sort_by_key_and_ordered_list)

    app.add_template_filter(convert_markdown_to_html)

    @app.template_filter()
    def slug(text):
        return slugify(text)
