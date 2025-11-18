# routes.py
import flask
from flask import request, session, jsonify, redirect, Blueprint
from .helpers import set_cookie_accepted_with_ts, get_client
from .exceptions import UserNotFoundException


consent_bp = Blueprint("cookie_consent", __name__)


@consent_bp.route("/callback")
def callback():
    """
    - Handles the redirect from the central service.
    - Exchanges the code for a user_uuid.
    - Stores the user_uuid in the secure HttpOnly session.
    """
    code = request.args.get("code")
    return_uri = request.args.get("return_uri") or "/"

    if not code:
        return jsonify({"error": "No code provided"}), 400

    client = get_client()
    data = client.exchange_code_for_uuid(code)

    if data is None:
        return jsonify({"error": "Failed to exchange code"}), 500

    user_uuid = data.get("user_uuid")

    if not user_uuid:
        return jsonify({"error": "No user_uuid in response"}), 500

    session.permanent = True
    session["user_uuid"] = str(user_uuid)

    response = flask.make_response(redirect(return_uri))

    try:
        preferences = client.fetch_preferences(user_uuid).get("preferences").get("consent")
    except UserNotFoundException:
        session.pop("user_uuid", None)
    if preferences:
        set_cookie_accepted_with_ts(
            response, "_cookies_accepted", preferences
        )

    return response


@consent_bp.route("/get-preferences", methods=["GET"])
def get_preferences():
    """
    Retrieves the user's ID from their session and fetches their preferences.
    """
    user_uuid = session.get("user_uuid")
    if not user_uuid:
        return jsonify({"error": "Not authenticated"}), 401

    preferences = get_client().fetch_preferences(user_uuid) 
    return jsonify(preferences), 200


@consent_bp.route("/set-preferences", methods=["POST"])
def set_preferences():
    """
    Retrieves the user's ID from their session and sets new preferences.
    """
    user_uuid = session.get("user_uuid")
    if not user_uuid:
        return jsonify({"error": "Not authenticated"}), 401

    data = request.json
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    print("Setting preferences for user_uuid:", user_uuid, "with data:", data)
    result = get_client().post_preferences(user_uuid, data)
    if result is None:
        return jsonify({"error": "Failed to save preferences"}), 500

    return jsonify({"message": "Preferences saved"}), 200
