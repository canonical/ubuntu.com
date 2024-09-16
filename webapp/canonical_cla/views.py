# Standard library
import base64
import os
import urllib.parse as urlparse
import requests

# Packages
import flask

CANONICAL_CLA_API_URL = os.getenv("CANONICAL_CLA_API_URL")


def canonical_cla_api_github_login():
    """
    The Canonical CLA API will redirect the user to this view once the OAuth2 flow is complete.
    """
    url_parts = list(urlparse.urlparse(flask.request.url))
    url_queries = dict(urlparse.parse_qs(url_parts[4]))

    if url_queries.get("access_token") and url_queries.get("agreement_url"):
        access_token = url_queries.get("access_token")
        access_token = (
            access_token[0] if isinstance(access_token, list) else access_token
        )
        encoded_agreement_url = (
            url_queries.get("agreement_url")[0]
            if isinstance(url_queries.get("agreement_url"), list)
            else url_queries.get("agreement_url")
        )
        agreement_url = base64.b64decode(encoded_agreement_url).decode("utf-8")
        response = flask.redirect(agreement_url)
        response.set_cookie(
            "github_oauth2_session", access_token, httponly=True
        )
        response.cache_control.no_store = True
        return response
    else:
        return flask.redirect("/legal/contributors/agreement")


def canonical_cla_api_github_logout():
    """
    The Canonical CLA API will redirect the user to this view once the cookie session is cleared.
    """
    encoded_agreement_url = (
        flask.request.args.get("agreement_url")[0]
        if isinstance(flask.request.args.get("agreement_url"), list)
        else flask.request.args.get("agreement_url")
    )
    agreement_url = base64.b64decode(encoded_agreement_url).decode("utf-8")
    response = flask.redirect(agreement_url)
    response.delete_cookie("github_oauth2_session", httponly=True)
    response.cache_control.no_store = True
    return response


def canonical_cla_api_launchpad_login():
    """
    The Canonical CLA API will redirect the user to this view once the OAuth2 flow is complete.
    """
    url_parts = list(urlparse.urlparse(flask.request.url))
    url_queries = dict(urlparse.parse_qs(url_parts[4]))

    if url_queries.get("access_token") and url_queries.get("agreement_url"):
        access_token = url_queries.get("access_token")
        access_token = (
            access_token[0] if isinstance(access_token, list) else access_token
        )
        encoded_agreement_url = (
            url_queries.get("agreement_url")[0]
            if isinstance(url_queries.get("agreement_url"), list)
            else url_queries.get("agreement_url")
        )
        agreement_url = base64.b64decode(encoded_agreement_url).decode("utf-8")
        response = flask.redirect(agreement_url)
        response.set_cookie(
            "launchpad_oauth_session", access_token, httponly=True
        )
        response.cache_control.no_store = True
        return response
    else:
        return flask.redirect("/legal/contributors/agreement")


def canonical_cla_api_launchpad_logout():
    """
    The Canonical CLA API will redirect the user to this view once the cookie session is cleared.
    """
    encoded_agreement_url = (
        flask.request.args.get("agreement_url")[0]
        if isinstance(flask.request.args.get("agreement_url"), list)
        else flask.request.args.get("agreement_url")
    )
    agreement_url = base64.b64decode(encoded_agreement_url).decode("utf-8")
    response = flask.redirect(agreement_url)
    response.delete_cookie("launchpad_oauth_session", httponly=True)
    response.cache_control.no_store = True
    return response


def canonical_cla_api_proxy():
    """
    Proxy requests to the Canonical CLA API with the same headers and cookies.
    This is necessary to because of different domains and CORS restrictions.
    """
    encoded_request_url = flask.request.args.get("request_url")
    if encoded_request_url is None:
        return flask.abort(400)
    request_url = base64.b64decode(encoded_request_url).decode("utf-8")
    api_service_response = requests.request(
        method=flask.request.method,
        url=urlparse.urljoin(CANONICAL_CLA_API_URL, request_url),
        headers={"X-Forwarded-For": flask.request.remote_addr},
        cookies=flask.request.cookies,
        data=flask.request.data,
    )
    response = flask.make_response(api_service_response.content)
    response.headers["Content-Type"] = api_service_response.headers[
        "Content-Type"
    ]
    response.status_code = api_service_response.status_code
    response.cache_control.no_store = True
    return response
