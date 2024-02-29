import os

import flask
from canonicalwebteam import image_template

from webapp.context import (
    current_year,
    date_has_passed,
    descending_years,
    format_date,
    get_json_feed,
    get_navigation,
    modify_query,
    month_name,
    months_list,
    releases,
    schedule_banner,
    get_meganav,
    split_list,
    format_to_id,
    sort_by_key_and_ordered_list,
    get_meganav,
    split_list,
    format_to_id,
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
        return (
            flask.render_template(
                "security-error-500.html",
                message=error.response.json().get("message"),
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
            "get_navigation": get_navigation,
            "get_stripe_publishable_key": os.getenv(
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
            "CAPTCHA_TESTING_API_KEY": os.getenv(
                "CAPTCHA_TESTING_API_KEY",
                "6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if",
            ),
            "http_host": flask.request.host,
            "schedule_banner": schedule_banner,
            "get_meganav": get_meganav,
            "split_list": split_list,
            "format_to_id": format_to_id,
        }

    @app.context_processor
    def utility_processor():
        return {"image": image_template}

    app.add_template_filter(date_has_passed)

    app.add_template_filter(sort_by_key_and_ordered_list)
