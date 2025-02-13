import base64
import os
from typing import Optional
import urllib.parse as urlparse
import requests
import flask

CANONICAL_CLA_API_URL = os.getenv("CANONICAL_CLA_API_URL")


def get_query_param(url, key, is_base64=False) -> Optional[str]:
    url_parts = list(urlparse.urlparse(url))
    queries = dict(urlparse.parse_qs(url_parts[4]))

    value = queries.get(key)
    if value:
        value = value[0] if isinstance(value, list) else value
        if is_base64:
            value = base64.b64decode(value).decode("utf-8")
    return value


def update_query_params(url: str, **params) -> str:
    url_parts = list(urlparse.urlparse(url))
    query = dict(urlparse.parse_qsl(url_parts[4]))
    query.update(params)
    url_parts[4] = urlparse.urlencode(query)
    return urlparse.urlunparse(url_parts)


def canonical_cla_api_github_login():
    """
    The Canonical CLA API will redirect the user to
    this view once the OAuth2 flow is complete.
    """
    agreement_url = get_query_param(
        flask.request.url, "agreement_url", is_base64=True
    )
    if not agreement_url:
        return flask.redirect("/legal/contributors/agreement")

    access_token = get_query_param(flask.request.url, "access_token")
    github_error = get_query_param(flask.request.url, "github_error")
    if github_error:
        agreement_url = update_query_params(
            agreement_url, github_error=github_error
        )
    else:
        agreement_url = update_query_params(agreement_url, github_error="")
    response = flask.redirect(agreement_url)
    if access_token:
        response.set_cookie(
            "github_oauth2_session", access_token, httponly=True
        )
    response.cache_control.no_store = True
    return response


def canonical_cla_api_github_logout():
    """
    The Canonical CLA API will redirect the user
    to this view once the cookie session is cleared.
    """
    agreement_url = (
        get_query_param(flask.request.url, "agreement_url", is_base64=True)
        or "/legal/contributors/agreement"
    )
    response = flask.redirect(agreement_url)
    response.delete_cookie("github_oauth2_session", httponly=True)
    response.cache_control.no_store = True
    return response


def canonical_cla_api_launchpad_login():
    """
    The Canonical CLA API will redirect the user
    to this view once the OAuth2 flow is complete.
    """
    agreement_url = get_query_param(
        flask.request.url, "agreement_url", is_base64=True
    )
    if not agreement_url:
        return flask.redirect("/legal/contributors/agreement")

    response = flask.redirect(agreement_url)

    access_token = get_query_param(flask.request.url, "access_token")
    launchpad_error = get_query_param(flask.request.url, "launchpad_error")
    if launchpad_error:
        agreement_url = update_query_params(
            agreement_url, launchpad_error=launchpad_error
        )
    else:
        agreement_url = update_query_params(agreement_url, launchpad_error="")
    response = flask.redirect(agreement_url)
    if access_token:
        response.set_cookie(
            "launchpad_oauth_session", access_token, httponly=True
        )
    response.cache_control.no_store = True
    return response


def canonical_cla_api_launchpad_logout():
    """
    The Canonical CLA API will redirect the user
    to this view once the cookie session is cleared.
    """
    agreement_url = (
        get_query_param(flask.request.url, "agreement_url", is_base64=True)
        or "/legal/contributors/agreement"
    )
    response = flask.redirect(agreement_url)
    response.delete_cookie("launchpad_oauth_session", httponly=True)
    response.cache_control.no_store = True
    return response


def canonical_cla_api_proxy():
    """
    Proxy requests to the Canonical CLA API with the same headers and cookies.
    This is necessary because of different domains and CORS restrictions.
    """
    encoded_request_url = flask.request.args.get("request_url")
    if encoded_request_url is None:
        return flask.abort(400)
    request_url = base64.b64decode(encoded_request_url).decode("utf-8")
    client_ip = flask.request.headers.get(
        "X-Real-IP", flask.request.remote_addr
    )
    try:
        api_service_response = requests.request(
            timeout=10,
            method=flask.request.method,
            url=urlparse.urljoin(CANONICAL_CLA_API_URL, request_url),
            headers={
                "X-Custom-Forwarded-For": client_ip,
            },
            cookies=flask.request.cookies,
            data=flask.request.data,
        )
    except requests.exceptions.ConnectionError:
        error_response = flask.make_response(
            {"detail": "CLA Service is unavailable, please try again later"}
        )
        error_response.headers["Content-Type"] = "application/json"
        error_response.status_code = 503
        error_response.cache_control.no_store = True
        return error_response

    if (
        api_service_response.headers["Content-Type"] != "application/json"
        and api_service_response.status_code != 200
    ):
        error_response = flask.make_response(
            {"detail": "Internal server error"}
        )
        error_response.headers["Content-Type"] = "application/json"
        error_response.status_code = 500
        error_response.cache_control.no_store = True
        return error_response
    else:
        response = flask.make_response(api_service_response.content)
        response.headers["Content-Type"] = api_service_response.headers[
            "Content-Type"
        ]
        response.status_code = api_service_response.status_code
        response.cache_control.no_store = True
        return response
