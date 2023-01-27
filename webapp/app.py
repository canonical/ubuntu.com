"""
A Flask application for ubuntu.com
"""

# Packages
from distutils.util import strtobool
import os
import talisker.requests
import flask
from datetime import datetime
from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.templatefinder import TemplateFinder

from canonicalwebteam.search import build_search_view
from canonicalwebteam import image_template
from canonicalwebteam.blog import build_blueprint, BlogViews, BlogAPI
from canonicalwebteam.discourse import (
    DiscourseAPI,
    Docs,
    DocParser,
    EngagePages,
    Tutorials,
    TutorialParser,
)

# Local
from webapp.shop.api.ua_contracts.api import (
    UAContractsAPIError,
    UAContractsAPIErrorView,
    UnauthorizedError,
    UnauthorizedErrorView,
)
from webapp.security.api import SecurityAPIError
from webapp.context import (
    current_year,
    descending_years,
    format_date,
    get_json_feed,
    modify_query,
    month_name,
    months_list,
    get_navigation,
    releases,
)

from webapp.shop.flaskparser import UAContractsValidationError
from webapp.shop.cred.views import (
    cred_self_study,
    cred_submit_form,
    cred_syllabus_data,
    cred_sign_up,
    cred_home,
    cred_schedule,
    cred_your_exams,
    cred_cancel_exam,
    cred_assessments,
    cred_exam,
    cred_provision,
)

from webapp.views import (
    BlogCustomGroup,
    BlogCustomTopic,
    BlogRedirects,
    BlogSitemapIndex,
    BlogSitemapPage,
    build_engage_page,
    build_tutorials_index,
    download_server_steps,
    download_thank_you,
    appliance_install,
    appliance_portfolio,
    releasenotes_redirect,
    show_template,
    build_engage_index,
    engage_thank_you,
    unlisted_engage_page,
    sitemap_index,
    account_query,
    json_asset_query,
    sixteen_zero_four,
    openstack_install,
    marketo_submit,
    thank_you,
    mirrors_query,
    build_tutorials_query,
    openstack_engage,
    get_user_country_by_ip,
    subscription_centre,
)

from webapp.shop.views import (
    account_view,
    invoices_view,
    download_invoice,
    payment_methods_view,
    post_payment_methods,
    ensure_purchase_account,
    get_customer_info,
    post_customer_info,
    post_anonymised_customer_info,
    get_purchase,
    get_purchase_v2,
    post_stripe_invoice_id,
    get_last_purchase_ids,
    post_purchase_calculate,
    support,
)

from webapp.shop.advantage.views import (
    accept_renewal,
    activate_magic_attach,
    advantage_view,
    advantage_account_users_view,
    advantage_shop_view,
    advantage_thanks_view,
    get_renewal,
    magic_attach_view,
    post_advantage_subscriptions,
    post_auto_renewal_settings,
    cancel_advantage_subscriptions,
    get_account_offers,
    get_user_subscriptions,
    get_contract_token,
    cancel_trial,
    get_account_users,
    delete_account_user_role,
    post_account_user_role,
    pro_page_view,
    put_account_user_role,
    put_contract_entitlements,
    blender_thanks_view,
    blender_shop_view,
    post_offer,
    get_advantage_offers,
    post_advantage_purchase,
)

from webapp.login import login_handler, logout, user_info, empty_session
from webapp.security.views import (
    notice,
    notices,
    notices_feed,
    cve_index,
    cve,
    single_notices_sitemap,
    notices_sitemap,
    single_cves_sitemap,
    cves_sitemap,
)

from webapp.certified.views import (
    certified_home,
    certified_model_details,
    certified_hardware_details,
    certified_component_details,
    certified_vendors,
    certified_desktops,
    certified_laptops,
    certified_servers,
    certified_devices,
    certified_socs,
    certified_why,
)


CAPTCHA_TESTING_API_KEY = os.getenv(
    "CAPTCHA_TESTING_API_KEY", "6LfYBloUAAAAAINm0KzbEv6TP0boLsTEzpdrB8if"
)
DISCOURSE_API_KEY = os.getenv("DISCOURSE_API_KEY")
DISCOURSE_API_USERNAME = os.getenv("DISCOURSE_API_USERNAME")

# Set up application
# ===

app = FlaskBase(
    __name__,
    "ubuntu.com",
    template_folder="../templates",
    template_404="404.html",
    template_500="500.html",
    static_folder="../static",
)

sentry = app.extensions["sentry"]

session = talisker.requests.get_session()
discourse_api = DiscourseAPI(
    base_url="https://discourse.ubuntu.com/",
    session=session,
    api_key=DISCOURSE_API_KEY,
    api_username=DISCOURSE_API_USERNAME,
    get_topics_query_id=2,
)

# Web tribe websites custom search ID
search_engine_id = "adb2397a224a1fe55"


# Error pages
@app.errorhandler(400)
def bad_request_error(error):
    return flask.render_template("400.html", message=error.description), 400


@app.errorhandler(403)
def forbidden_error(error):
    return flask.render_template("403.html", message=error.description), 403


@app.errorhandler(410)
def deleted_error(error):
    return flask.render_template("410.html", message=error.description), 410


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
        "CAPTCHA_TESTING_API_KEY": CAPTCHA_TESTING_API_KEY,
        "http_host": flask.request.host,
        "is_maintenance": strtobool(os.getenv("STORE_MAINTENANCE", "false")),
    }


@app.context_processor
def utility_processor():
    return {"image": image_template}


# Routes
# ===

# Simple routes
app.add_url_rule("/asset/<file_name>", view_func=json_asset_query)
app.add_url_rule("/sitemap.xml", view_func=sitemap_index)
app.add_url_rule("/account.json", view_func=account_query)
app.add_url_rule("/mirrors.json", view_func=mirrors_query)
app.add_url_rule("/marketo/submit", view_func=marketo_submit, methods=["POST"])
app.add_url_rule("/thank-you", view_func=thank_you)
app.add_url_rule("/pro/dashboard", view_func=advantage_view)
app.add_url_rule("/pro/user-subscriptions", view_func=get_user_subscriptions)
app.add_url_rule(
    "/pro/contracts/<contract_id>/token", view_func=get_contract_token
)
app.add_url_rule("/pro/users", view_func=advantage_account_users_view)
app.add_url_rule("/pro/account-users", view_func=get_account_users)
app.add_url_rule(
    "/pro/accounts/<account_id>/user",
    view_func=post_account_user_role,
    methods=["POST"],
)
app.add_url_rule(
    "/pro/accounts/<account_id>/user",
    view_func=put_account_user_role,
    methods=["PUT"],
)
app.add_url_rule(
    "/pro/accounts/<account_id>/user",
    view_func=delete_account_user_role,
    methods=["DELETE"],
)
app.add_url_rule("/pro/subscribe", view_func=advantage_shop_view)
app.add_url_rule("/pro/subscribe/blender", view_func=blender_shop_view)
app.add_url_rule("/pro/subscribe/thank-you", view_func=advantage_thanks_view)
app.add_url_rule(
    "/pro/subscribe",
    view_func=post_advantage_subscriptions,
    methods=["POST"],
    defaults={"preview": False},
)
app.add_url_rule(
    "/pro/subscribe",
    view_func=cancel_advantage_subscriptions,
    methods=["DELETE"],
)
app.add_url_rule(
    "/pro/subscribe/preview",
    view_func=post_advantage_subscriptions,
    methods=["POST"],
    defaults={"preview": True},
)
app.add_url_rule("/pro/offer", view_func=post_offer, methods=["POST"])
app.add_url_rule(
    "/pro/set-auto-renewal",
    view_func=post_auto_renewal_settings,
    methods=["POST"],
)
app.add_url_rule(
    "/pro/renewals/<renewal_id>", view_func=get_renewal, methods=["GET"]
)
app.add_url_rule(
    "/pro/trial/<account_id>",
    view_func=cancel_trial,
    methods=["DELETE"],
)

app.add_url_rule(
    "/pro/renewals/<renewal_id>/process-payment",
    view_func=accept_renewal,
    methods=["POST"],
)

app.add_url_rule(
    "/pro/contracts/<contract_id>/entitlements",
    view_func=put_contract_entitlements,
    methods=["PUT"],
)

app.add_url_rule(
    "/pro/subscribe/blender/thank-you",
    view_func=blender_thanks_view,
)

app.add_url_rule(
    "/pro/offers",
    view_func=get_advantage_offers,
    methods=["GET"],
)

app.add_url_rule(
    "/pro/offers.json",
    view_func=get_account_offers,
    methods=["GET"],
)

app.add_url_rule(
    "/pro/attach", view_func=activate_magic_attach, methods=["POST"]
)
app.add_url_rule("/pro/attach", view_func=magic_attach_view, methods=["GET"])
# shop
app.add_url_rule(
    "/account",
    view_func=account_view,
)
app.add_url_rule(
    "/account/invoices",
    view_func=invoices_view,
)
app.add_url_rule(
    "/account/invoices/download/<purchase_id>",
    view_func=download_invoice,
)
app.add_url_rule(
    "/account/payment-methods",
    view_func=payment_methods_view,
)
app.add_url_rule(
    "/account/payment-methods",
    view_func=post_payment_methods,
    methods=["POST"],
)
app.add_url_rule(
    "/account/purchase-account",
    view_func=ensure_purchase_account,
    methods=["POST"],
)
app.add_url_rule(
    "/account/customer-info/<account_id>",
    view_func=get_customer_info,
    methods=["GET"],
)
app.add_url_rule(
    "/account/customer-info",
    view_func=post_customer_info,
    methods=["POST"],
)
app.add_url_rule(
    "/account/customer-info-anon",
    view_func=post_anonymised_customer_info,
    methods=["POST"],
)
app.add_url_rule(
    "/account/purchases/<purchase_id>",
    view_func=get_purchase,
    methods=["GET"],
)
app.add_url_rule(
    "/account/purchases_v2/<purchase_id>",
    view_func=get_purchase_v2,
    methods=["GET"],
)
app.add_url_rule(
    "/account/<tx_type>/<tx_id>/invoices/<invoice_id>",
    view_func=post_stripe_invoice_id,
    methods=["POST"],
)
app.add_url_rule("/support", view_func=support)
app.add_url_rule(
    "/account/last-purchase-ids/<account_id>",
    view_func=get_last_purchase_ids,
)
app.add_url_rule(
    "/pro",
    view_func=pro_page_view,
    methods=["GET"],
)
app.add_url_rule(
    "/pro/purchase",
    view_func=post_advantage_purchase,
    methods=["POST"],
    defaults={"preview": False},
)
app.add_url_rule(
    "/pro/purchase/preview",
    view_func=post_advantage_purchase,
    methods=["POST"],
    defaults={"preview": True},
)
app.add_url_rule(
    "/account/<marketplace>/purchase/calculate",
    view_func=post_purchase_calculate,
    methods=["POST"],
)
# end of shop

app.add_url_rule(
    (
        "/download"
        "/<regex('server|desktop|cloud|raspberry-pi'):category>"
        "/thank-you"
    ),
    view_func=download_thank_you,
)

app.add_url_rule(
    "/download/server",
    methods=["GET", "POST"],
    view_func=download_server_steps,
)

app.add_url_rule("/getubuntu/releasenotes", view_func=releasenotes_redirect)
app.add_url_rule(
    "/search",
    "search",
    build_search_view(
        session=session,
        template_path="search.html",
        search_engine_id=search_engine_id,
    ),
)
app.add_url_rule(
    (
        "/appliance/<regex('[a-z-]+'):appliance>/"
        "<regex('(raspberry-pi2?|intel-nuc|vm)'):device>"
    ),
    view_func=appliance_install,
)
app.add_url_rule(
    "/appliance/portfolio",
    view_func=appliance_portfolio,
)

# blog section

blog_views = BlogViews(
    api=BlogAPI(session=session, thumbnail_width=555, thumbnail_height=311),
    excluded_tags=[3184, 3265, 3408, 3960],
    per_page=11,
    blog_title="Ubuntu blog",
)
app.add_url_rule(
    "/blog/topics/<regex('maas|design|juju|robotics|snapcraft'):slug>",
    view_func=BlogCustomTopic.as_view("blog_topic", blog_views=blog_views),
)
app.add_url_rule(
    "/blog/<regex('cloud-and-server|desktop|internet-of-things|people-and-culture'):slug>",  # noqa: E501
    view_func=BlogCustomGroup.as_view("blog_group", blog_views=blog_views),
)
app.add_url_rule(
    "/blog/sitemap.xml",
    view_func=BlogSitemapIndex.as_view("sitemap", blog_views=blog_views),
)
app.add_url_rule(
    "/blog/sitemap/<regex('.+'):slug>.xml",
    view_func=BlogSitemapPage.as_view("sitemap_page", blog_views=blog_views),
)
app.add_url_rule(
    "/blog/<slug>",
    view_func=BlogRedirects.as_view("blog_redirects", blog_views=blog_views),
)
app.register_blueprint(build_blueprint(blog_views), url_prefix="/blog")

# usn section
app.add_url_rule("/security/notices", view_func=notices)

app.add_url_rule(
    r"/security/notices/<regex('(lsn-|LSN-|usn-|USN-)\d{1,10}-\d{1,2}'):notice_id>",  # noqa: E501
    view_func=notice,
)

app.add_url_rule("/security/notices/<feed_type>.xml", view_func=notices_feed)

app.add_url_rule(
    "/security/notices/sitemap-<regex('[0-9]*'):offset>.xml",
    view_func=single_notices_sitemap,
)

app.add_url_rule("/security/notices/sitemap.xml", view_func=notices_sitemap)

app.add_url_rule(
    "/security/cves/sitemap-<regex('[0-9]*'):offset>.xml",
    view_func=single_cves_sitemap,
)

app.add_url_rule("/security/cves/sitemap.xml", view_func=cves_sitemap)

# cve section
app.add_url_rule("/security/cves", view_func=cve_index)

app.add_url_rule(
    r"/security/<regex('(cve-|CVE-)\d{4}-\d{4,7}'):cve_id>", view_func=cve
)

# Login
app.add_url_rule("/login", methods=["GET", "POST"], view_func=login_handler)
app.add_url_rule("/logout", view_func=logout)

# Engage pages and takeovers from Discourse
# This section needs to provide takeover data for /
engage_pages_discourse_api = DiscourseAPI(
    base_url="https://discourse.ubuntu.com/",
    session=session,
    get_topics_query_id=14,
    api_key=DISCOURSE_API_KEY,
    api_username=DISCOURSE_API_USERNAME,
)
takeovers_path = "/takeovers"
discourse_takeovers = EngagePages(
    api=engage_pages_discourse_api,
    page_type="takeovers",
    category_id=106,
    exclude_topics=[28426, 17250],
)

engage_path = "/engage"
engage_pages = EngagePages(
    api=engage_pages_discourse_api,
    category_id=51,
    page_type="engage-pages",
    exclude_topics=[17229, 18033, 17250],
)

app.add_url_rule(
    "/openstack/resources", view_func=openstack_engage(engage_pages)
)
app.add_url_rule(engage_path, view_func=build_engage_index(engage_pages))
app.add_url_rule(
    "/engage/<page>",
    defaults={"language": None},
    view_func=build_engage_page(engage_pages),
)
app.add_url_rule(
    "/engage/<language>/<page>",
    endpoint="language-engage-page",
    view_func=build_engage_page(engage_pages),
)
app.add_url_rule(
    "/engage/<page>/thank-you",
    defaults={"language": None},
    view_func=engage_thank_you(engage_pages),
)
app.add_url_rule(
    "/engage/<language>/<page>/thank-you",
    endpoint="alternative_thank-you",
    view_func=engage_thank_you(engage_pages),
)
app.add_url_rule(
    "/engage/unlisted/<slug>",
    view_func=unlisted_engage_page,
)


def takeovers_json():
    active_takeovers = discourse_takeovers.parse_active_takeovers()
    takeovers = sorted(
        active_takeovers,
        key=lambda takeover: takeover["publish_date"],
        reverse=True,
    )
    response = flask.jsonify(takeovers)
    response.cache_control.max_age = "300"

    return response


def takeovers_index():
    all_takeovers = discourse_takeovers.get_index()
    all_takeovers.sort(
        key=lambda takeover: takeover["active"] == "true", reverse=True
    )
    active_count = len(
        [
            takeover
            for takeover in all_takeovers
            if takeover["active"] == "true"
        ]
    )

    return flask.render_template(
        "takeovers/index.html",
        takeovers=all_takeovers,
        active_count=active_count,
    )


app.add_url_rule("/16-04", view_func=sixteen_zero_four)
app.add_url_rule("/takeovers.json", view_func=takeovers_json)
app.add_url_rule("/takeovers", view_func=takeovers_index)


core_services_guide_url = "/core/services/guide"
core_services_guide = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=27473,
        url_prefix=core_services_guide_url,
    ),
    document_template="core/services/guide/document.html",
    url_prefix=core_services_guide_url,
    blueprint_name="core-services-guide",
)

app.add_url_rule(
    "/core/services/guide/search",
    "core-services-guide-search",
    build_search_view(
        session=session,
        site="ubuntu.com/core/services/guide",
        template_path="core/services/guide/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

core_services_guide.init_app(app)


app.add_url_rule("/user-country.json", view_func=get_user_country_by_ip)

# All other routes
template_finder_view = TemplateFinder.as_view("template_finder")
template_finder_view._exclude_xframe_options_header = True
app.add_url_rule("/", view_func=template_finder_view)
app.add_url_rule("/<path:subpath>", view_func=template_finder_view)

# Server docs
url_prefix = "/server/docs"
server_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=11322,
        url_prefix=url_prefix,
    ),
    document_template="/server/docs/document.html",
    url_prefix=url_prefix,
    blueprint_name="server-docs",
)

# Server docs search
app.add_url_rule(
    "/server/docs/search",
    "server-docs-search",
    build_search_view(
        session=session,
        site="ubuntu.com/server/docs",
        template_path="/server/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

server_docs.init_app(app)

# Community docs
url_prefix = "/community"
community_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=33115,
        url_prefix=url_prefix,
    ),
    document_template="/community/docs/document.html",
    url_prefix=url_prefix,
    blueprint_name="community-docs",
)

# Community docs search
app.add_url_rule(
    "/community/search",
    "community-search",
    build_search_view(
        session=session,
        site="ubuntu.com/community",
        template_path="/community/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

community_docs.init_app(app)

# Allow templates to be queried from discourse.ubuntu.com
app.add_url_rule(
    "/templates/<filename>",
    "templates",
    view_func=show_template,
)

tutorials_path = "/tutorials"
tutorials_docs = Tutorials(
    parser=TutorialParser(
        api=discourse_api,
        index_topic_id=13611,
        url_prefix=tutorials_path,
    ),
    document_template="/tutorials/tutorial.html",
    url_prefix=tutorials_path,
    blueprint_name="tutorials",
)
app.add_url_rule(
    tutorials_path,
    view_func=build_tutorials_index(session, tutorials_docs),
)
tutorials_docs.init_app(app)

app.add_url_rule(
    "/tutorials.json", view_func=build_tutorials_query(tutorials_docs)
)

# Ceph docs
ceph_docs = Docs(
    parser=DocParser(
        api=discourse_api, index_topic_id=17250, url_prefix="/ceph/docs"
    ),
    document_template="/ceph/docs/document.html",
    url_prefix="/ceph/docs",
    blueprint_name="ceph",
)
ceph_docs.init_app(app)

# Ceph docs search
app.add_url_rule(
    "/ceph/docs/search",
    "ceph-docs-search",
    build_search_view(
        session=session,
        site="ubuntu.com/ceph/docs",
        template_path="ceph/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

# Core docs
core_docs = Docs(
    parser=DocParser(
        api=discourse_api, index_topic_id=19764, url_prefix="/core/docs"
    ),
    document_template="/core/docs/document.html",
    url_prefix="/core/docs",
    blueprint_name="core",
)
# Core docs search
app.add_url_rule(
    "/core/docs/search",
    "core-docs-search",
    build_search_view(
        session=session,
        site="ubuntu.com/core/docs",
        template_path="/core/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
core_docs.init_app(app)

# Core docs - Modem Manager
core_modem_manager_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=19901,
        url_prefix="/core/docs/modem-manager",
    ),
    document_template="/core/docs/document.html",
    url_prefix="/core/docs/modem-manager",
    blueprint_name="modem-manager",
)
core_modem_manager_docs.init_app(app)

# Core docs - Bluetooth (bluez) docs
core_bluetooth_docs = Docs(
    parser=DocParser(
        api=discourse_api, index_topic_id=19971, url_prefix="/core/docs/bluez"
    ),
    document_template="/core/docs/document.html",
    url_prefix="/core/docs/bluez",
    blueprint_name="bluez",
)
core_bluetooth_docs.init_app(app)

# Core docs - NetworkManager
core_network_manager_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=19917,
        url_prefix="/core/docs/networkmanager",
    ),
    document_template="/core/docs/document.html",
    url_prefix="/core/docs/networkmanager",
    blueprint_name="networkmanager",
)
core_network_manager_docs.init_app(app)

# Core docs - wp-supplicant
core_wpa_supplicant_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=19943,
        url_prefix="/core/docs/wpa-supplicant",
    ),
    document_template="/core/docs/document.html",
    url_prefix="/core/docs/wpa-supplicant",
    blueprint_name="wpa-supplicant",
)
core_wpa_supplicant_docs.init_app(app)

# Core docs - easy-openvpn
core_easy_openvpn_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=19950,
        url_prefix="/core/docs/easy-openvpn",
    ),
    document_template="/core/docs/document.html",
    url_prefix="/core/docs/easy-openvpn",
    blueprint_name="easy-openvpn",
)
core_easy_openvpn_docs.init_app(app)

# Core docs - wifi-ap
core_wifi_ap_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=19959,
        url_prefix="/core/docs/wifi-ap",
    ),
    document_template="/core/docs/document.html",
    url_prefix="/core/docs/wifi-ap",
    blueprint_name="wifi-ap",
)
core_wifi_ap_docs.init_app(app)

# Core docs - alsa-utils
core_als_autils_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=19995,
        url_prefix="/core/docs/alsa-utils",
    ),
    document_template="/core/docs/document.html",
    url_prefix="/core/docs/alsa-utils",
    blueprint_name="alsa-utils",
)
core_als_autils_docs.init_app(app)

# Credentials
app.add_url_rule("/credentials", view_func=cred_home)
app.add_url_rule("/credentials/self-study", view_func=cred_self_study)
app.add_url_rule("/credentials/syllabus", view_func=cred_syllabus_data)
app.add_url_rule("/credentials/sign-up", view_func=cred_sign_up)
app.add_url_rule(
    "/credentials/schedule",
    view_func=cred_schedule,
    methods=["GET", "POST"],
)
app.add_url_rule("/credentials/your-exams", view_func=cred_your_exams)
app.add_url_rule("/credentials/cancel-exam", view_func=cred_cancel_exam)
app.add_url_rule("/credentials/assessments", view_func=cred_assessments)
app.add_url_rule("/credentials/exam", view_func=cred_exam)
app.add_url_rule(
    "/credentials/exit-survey",
    view_func=cred_submit_form,
    methods=["GET", "POST"],
)
app.add_url_rule(
    "/credentials/provision",
    view_func=cred_provision,
    methods=["GET", "POST"],
)

# Charmed OpenStack docs
openstack_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=20991,
        url_prefix="/openstack/docs",
    ),
    document_template="openstack/docs/document.html",
    url_prefix="/openstack/docs",
    blueprint_name="openstack-docs",
)

# Charmed OpenStack docs search
app.add_url_rule(
    "/openstack/docs/search",
    "openstack-docs-search",
    build_search_view(
        session=session,
        site="ubuntu.com/openstack/docs",
        template_path="openstack/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

openstack_docs.init_app(app)

# Security Livepatch docs
security_livepatch_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=22723,
        url_prefix="/security/livepatch/docs",
    ),
    document_template="/security/livepatch/docs/document.html",
    url_prefix="/security/livepatch/docs",
    blueprint_name="security-livepatch-docs",
)

# Security Livepatch search
app.add_url_rule(
    "/security/livepatch/docs/search",
    "security-livepatch-docs-search",
    build_search_view(
        session=session,
        site="ubuntu.com/security/livepatch/docs",
        template_path="/security/livepatch/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

security_livepatch_docs.init_app(app)

# Security Certifications docs
security_certs_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=22810,
        url_prefix="/security/certifications/docs",
    ),
    document_template="/security/certifications/docs/document.html",
    url_prefix="/security/certifications/docs",
    blueprint_name="security-certs-docs",
)

# Security Certifications search
app.add_url_rule(
    "/security/certifications/docs/search",
    "security-certs-docs-search",
    build_search_view(
        session=session,
        site="ubuntu.com/security/certifications/docs",
        template_path="/security/certifications/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

security_certs_docs.init_app(app)

# Landscape docs
landscape_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=23070,
        url_prefix="/landscape/docs",
    ),
    document_template="/landscape/docs/document.html",
    url_prefix="/landscape/docs",
    blueprint_name="landscape-docs",
)

# Landscape search
app.add_url_rule(
    "/landscape/docs/search",
    "landscape-docs-search",
    build_search_view(
        session=session,
        site="ubuntu.com/landscape/docs",
        template_path="/landscape/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

landscape_docs.init_app(app)

app.add_url_rule("/certified", view_func=certified_home)
app.add_url_rule(
    "/certified/<canonical_id>",
    view_func=certified_model_details,
)
app.add_url_rule(
    "/certified/<canonical_id>/<release>",
    view_func=certified_hardware_details,
)
app.add_url_rule(
    "/certified/component/<component_id>",
    view_func=certified_component_details,
)
app.add_url_rule(
    "/certified/vendors/<vendor>",
    view_func=certified_vendors,
)
app.add_url_rule(
    "/certified/desktops",
    view_func=certified_desktops,
)
app.add_url_rule(
    "/certified/laptops",
    view_func=certified_laptops,
)
app.add_url_rule(
    "/certified/servers",
    view_func=certified_servers,
)
app.add_url_rule(
    "/certified/devices",
    view_func=certified_devices,
)
app.add_url_rule(
    "/certified/socs",
    view_func=certified_socs,
)
app.add_url_rule(
    "/certified/why-certify",
    view_func=certified_why,
)

# Override openstack/install
app.add_url_rule(
    "/openstack/install",
    view_func=openstack_install,
)

# Subscription centre
app.add_url_rule(
    "/subscription-centre",
    view_func=subscription_centre,
    methods=["GET", "POST"],
)


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

    return response


def date_has_passed(date_str):
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
        present = datetime.now()
        return present > date
    except ValueError:
        return False


app.add_template_filter(date_has_passed)
