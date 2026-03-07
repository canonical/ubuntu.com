"""
A Flask application for ubuntu.com
"""

import math
import os

import flask
import requests
from jinja2 import ChoiceLoader, FileSystemLoader
import yaml
import sentry_sdk
from werkzeug.exceptions import HTTPException
from urllib3.exceptions import MaxRetryError
from requests.exceptions import (
    RetryError,
    ConnectionError as RequestsConnectionError,
)
import random

from sentry_sdk.integrations.flask import FlaskIntegration
from canonicalwebteam.blog import BlogAPI, BlogViews, build_blueprint
from canonicalwebteam.discourse import (
    DiscourseAPI,
    DocParser,
    Docs,
    EngagePages,
    TutorialParser,
    Tutorials,
    CategoryParser,
    Category,
    EventsParser,
    Events,
)
from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.flask_base.env import get_flask_env
from pathlib import Path
import canonicalwebteam.directory_parser as directory_parser
from canonicalwebteam.search import build_search_view
from canonicalwebteam.templatefinder import TemplateFinder
from canonicalwebteam.form_generator import FormGenerator

from webapp.certified.views import certified_routes
from webapp.handlers import init_handlers
from webapp.login import login_handler, logout, user_info
from webapp.decorators import login_required
from webapp.security.views import (
    cve,
    cve_index,
    cves_sitemap,
    notice,
    notices,
    notices_feed,
    notices_sitemap,
    single_cves_sitemap,
    single_notices_sitemap,
    vulnerabilities_sitemap,
)
from webapp.shop.advantage.views import (
    accept_renewal,
    activate_magic_attach,
    advantage_account_users_view,
    advantage_shop_view,
    advantage_view,
    blender_shop_view,
    cancel_advantage_subscriptions,
    cancel_trial,
    delete_account_user_role,
    get_account_offers,
    get_account_users,
    get_activate_view,
    get_advantage_offers,
    get_annotated_subscriptions,
    get_channel_offers,
    get_contract_token,
    get_distributor_thank_you_view,
    get_distributor_view,
    get_renewal,
    get_user_subscriptions,
    magic_attach_view,
    post_account_user_role,
    post_advantage_purchase,
    post_auto_renewal_settings,
    post_offer,
    pro_activate_activation_key,
    pro_get_request_attributes,
    pro_page_view,
    put_account_user_role,
    put_contract_entitlements,
)
from webapp.shop.cred.views import (
    activate_activation_key,
    confidentiality_agreement_webhook,
    cred_assessments,
    cred_beta_activation,
    cred_cancel_exam,
    cred_dashboard,
    cred_dashboard_upcoming_exams,
    cred_dashboard_exam_results,
    cred_dashboard_system_statuses,
    cred_exam,
    cred_home,
    cred_manage_shop,
    cred_redeem_code,
    cred_schedule,
    cred_self_study,
    cred_shop,
    cred_shop_keys,
    cred_shop_thank_you,
    cred_shop_webhook_responses,
    cred_sign_up,
    cred_thank_you,
    cred_submit_form,
    cred_syllabus_data,
    cred_your_exams,
    get_activation_key_info,
    cred_user_ban,
    get_activation_keys,
    get_cue_products,
    get_issued_badges,
    get_issued_badges_bulk,
    get_test_taker_stats,
    issue_credly_badge,
    get_cred_user_permissions,
    get_my_issued_badges,
    get_webhook_response,
    issue_badges,
    rotate_activation_key,
    cancel_scheduled_exam,
    cred_faq,
)
from webapp.shop.views import (
    account_view,
    checkout,
    delete_payment_method,
    download_invoice,
    ensure_purchase_account,
    get_customer_info,
    get_last_purchase_ids,
    get_purchase,
    get_purchase_account_status,
    get_shop_status_page,
    invoices_view,
    maintenance_check,
    payment_methods_view,
    post_anonymised_customer_info,
    post_customer_info,
    post_payment_methods,
    post_purchase_calculate,
    post_retry_purchase,
    support,
)
from webapp.views import (
    BlogCustomGroup,
    BlogCustomTopic,
    BlogRedirects,
    BlogSitemapIndex,
    BlogSitemapPage,
    account_query,
    append_utms_cookie_to_canonical_links,
    appliance_install,
    build_vulnerabilities,
    build_vulnerabilities_list,
    build_release_cycle_view,
    process_active_vulnerabilities,
    process_local_communities,
    process_community_events,
    community_landing_page,
    build_ubuntu_weekly_newsletter,
    build_engage_index,
    build_engage_page,
    build_engage_pages_sitemap,
    build_engage_pages_metadata,
    build_tutorials_index,
    build_tutorials_query,
    download_server_steps,
    download_thank_you,
    engage_thank_you,
    french_why_openstack,
    german_why_openstack,
    get_user_country_by_tz,
    json_asset_query,
    marketo_submit,
    mirrors_query,
    navigation_nojs,
    releasenotes_redirect,
    show_template,
    sitemap_index,
    spanish_why_openstack,
    wsl_install_redirect,
    subscription_centre,
    thank_you,
    unlisted_engage_page,
    build_sitemap_tree,
)

DISCOURSE_API_KEY = get_flask_env("DISCOURSE_API_KEY")
DISCOURSE_API_USERNAME = get_flask_env("DISCOURSE_API_USERNAME")

CHARMHUB_DISCOURSE_API_KEY = get_flask_env("CHARMHUB_DISCOURSE_API_KEY")
CHARMHUB_DISCOURSE_API_USERNAME = get_flask_env(
    "CHARMHUB_DISCOURSE_API_USERNAME"
)
WORDPRESS_USERNAME = get_flask_env("WORDPRESS_USERNAME")
WORDPRESS_APPLICATION_PASSWORD = get_flask_env(
    "WORDPRESS_APPLICATION_PASSWORD"
)

# Sitemaps that are already generated and don't need to be updated.
# Can be seen on sitemap_index.xml
DYNAMIC_SITEMAPS = [
    "templates",
    "tutorials",
    "engage",
    "ceph/docs",
    "community/docs",
    "openstack/docs",
    "blog",
    "security/notices",
    "security/cves",
    "security/vulnerabilities",
    "security/certifications/docs",
    "security/livepatch/docs",
    "robotics/docs",
]

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

# ChoiceLoader attempts loading templates from each path in successive order
directory_parser_templates = (
    Path(directory_parser.__file__).parent / "templates"
)
loader = ChoiceLoader(
    [
        FileSystemLoader("templates"),
        FileSystemLoader("node_modules/vanilla-framework/templates/"),
        FileSystemLoader("static/js/modules/vanilla-framework/"),
        FileSystemLoader(str(directory_parser_templates)),
    ]
)

app.jinja_loader = loader

session = requests.Session()
charmhub_session = requests.Session()

discourse_api = DiscourseAPI(
    base_url="https://discourse.ubuntu.com/",
    session=session,
    api_key=DISCOURSE_API_KEY,
    api_username=DISCOURSE_API_USERNAME,
    get_topics_query_id=2,
)

charmhub_discourse_api = DiscourseAPI(
    base_url="https://discourse.charmhub.io/",
    session=charmhub_session,
    api_key=CHARMHUB_DISCOURSE_API_KEY,
    api_username=CHARMHUB_DISCOURSE_API_USERNAME,
    get_topics_query_id=2,
)

# Web tribe websites custom search ID
search_engine_id = "adb2397a224a1fe55"

# Sentry setup
sentry_dsn = get_flask_env("SENTRY_DSN")
environment = get_flask_env("FLASK_ENV", "production")


def sentry_before_send(event, hint):
    """
    Filter Sentry events.
    Excludes all 4xx errors.
    Samples MaxRetryError from security API calls to reduce quota usage.
    """
    if "exc_info" in hint:
        _, exc_value, _ = hint["exc_info"]

        # Check if the exception is an HTTPException
        # (which includes 4xx errors)
        if (
            isinstance(exc_value, HTTPException)
            and 400 <= exc_value.code < 500
        ):
            # return None to discard the event
            return None

        # Sample MaxRetryError from security API calls
        if isinstance(
            exc_value, (MaxRetryError, RetryError, RequestsConnectionError)
        ):
            error_msg = str(exc_value)
            # Check for security API URLs and 500/502/503/504 errors
            if "/security/" in error_msg and any(
                f"{code} error" in error_msg
                for code in ["500", "502", "503", "504"]
            ):
                if (
                    random.random() > 0.05
                ):  # Drop 95% of security API retry errors
                    return None

    return event


if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        send_default_pii=True,
        environment=environment,
        integrations=[FlaskIntegration()],
        before_send=sentry_before_send,
    )

init_handlers(app)


# Prepare forms
def init_forms():
    form_template_path = "shared/forms/form-template.html"

    try:
        template_full_path = (
            Path(app.root_path).parent / "templates" / form_template_path
        )
        if not template_full_path.exists():
            raise FileNotFoundError(
                f"Form template not found: {template_full_path}"
            )

        form_loader = FormGenerator(app, form_template_path)
        form_loader.load_forms()

    except Exception as e:
        print(f"There was an error loading forms: {e}")
        raise e


init_forms()

# Routes
# ===

# Simple routes
app.add_url_rule("/asset/<file_name>", view_func=json_asset_query)
app.add_url_rule("/sitemap.xml", view_func=sitemap_index)
app.add_url_rule("/account.json", view_func=account_query)
app.add_url_rule("/mirrors.json", view_func=mirrors_query)
app.add_url_rule("/marketo/submit", view_func=marketo_submit, methods=["POST"])
app.add_url_rule("/thank-you", view_func=thank_you)
app.add_url_rule("/pro/activate", view_func=get_activate_view)
app.add_url_rule(
    "/pro/activate",
    view_func=pro_activate_activation_key,
    methods=["POST"],
)
app.add_url_rule("/navigation", view_func=navigation_nojs)
app.add_url_rule("/pro/dashboard", view_func=advantage_view)
app.add_url_rule("/pro/user-subscriptions", view_func=get_user_subscriptions)
app.add_url_rule(
    "/pro/subscriptions.json", view_func=get_annotated_subscriptions
)
app.add_url_rule(
    "/pro/contracts/<contract_id>/token", view_func=get_contract_token
)
app.add_url_rule("/pro/users", view_func=advantage_account_users_view)
app.add_url_rule(
    "/pro/distributor/users", view_func=advantage_account_users_view
)
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
app.add_url_rule(
    "/pro/subscribe",
    view_func=cancel_advantage_subscriptions,
    methods=["DELETE"],
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
    "/pro/offers",
    view_func=get_advantage_offers,
    methods=["GET"],
)

app.add_url_rule(
    "/pro/offers.json",
    view_func=get_account_offers,
    methods=["GET"],
)

app.add_url_rule("/pro/distributor", view_func=get_distributor_view)
app.add_url_rule("/pro/distributor/shop", view_func=get_distributor_view)
app.add_url_rule(
    "/pro/distributor/thank-you", view_func=get_distributor_thank_you_view
)
app.add_url_rule(
    "/pro/channel-offers.json",
    view_func=get_channel_offers,
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
    "/account/<marketplace>/purchase-account-status",
    view_func=get_purchase_account_status,
    methods=["GET"],
)
app.add_url_rule(
    "/account/invoices",
    view_func=invoices_view,
)
app.add_url_rule("/pro/distributor/invoice", view_func=invoices_view)
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
    "/account/payment-methods",
    view_func=delete_payment_method,
    methods=["DELETE"],
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
    "/account/purchases/<purchase_id>/retry",
    view_func=post_retry_purchase,
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
    "/account/checkout",
    view_func=checkout,
    methods=["GET"],
)
app.add_url_rule(
    "/account/<marketplace>/purchase/calculate",
    view_func=post_purchase_calculate,
    methods=["POST"],
)
app.add_url_rule(
    "/pro/status",
    view_func=get_shop_status_page,
    methods=["GET"],
)
app.add_url_rule(
    "/pro/maintenance-check",
    view_func=maintenance_check,
    methods=["GET"],
)
app.add_url_rule(
    "/pro/request/attributes",
    view_func=pro_get_request_attributes,
    methods=["GET"],
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

app.add_url_rule("/desktop/wsl/install", view_func=wsl_install_redirect)

app.add_url_rule("/getubuntu/releasenotes", view_func=releasenotes_redirect)

with open("navigation.yaml") as navigation_file:
    navigation = yaml.load(navigation_file.read(), Loader=yaml.FullLoader)

app.add_url_rule(
    "/search",
    "search",
    build_search_view(
        app,
        session=session,
        template_path="search.html",
        search_engine_id=search_engine_id,
        featured=navigation,
    ),
)

app.add_url_rule(
    (
        "/appliance/<regex('[a-z-]+'):appliance>/"
        "<regex('(raspberry-pi2?|intel-nuc|vm)'):device>"
    ),
    view_func=appliance_install,
)

# blog section

blog_views = BlogViews(
    api=BlogAPI(session=session, thumbnail_width=555, thumbnail_height=311),
    excluded_tags=[3184, 3265, 3408, 3960, 4491],
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
    "/security/notices/<notice_id>",
    view_func=notice,
)

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

# Security vulnerabilities
security_vulnerabilities = Category(
    parser=CategoryParser(
        api=discourse_api,
        index_topic_id=53193,
        url_prefix="/security/vulnerabilities",
    ),
    category_id=308,
)

app.add_url_rule(
    "/security/vulnerabilities/sitemap.xml",
    view_func=vulnerabilities_sitemap(security_vulnerabilities),
)


app.add_url_rule(
    "/security",
    view_func=process_active_vulnerabilities(security_vulnerabilities),
)

app.add_url_rule(
    "/security/vulnerabilities",
    endpoint="vulnerabilities_list",
    view_func=build_vulnerabilities_list(security_vulnerabilities),
)

app.add_url_rule(
    "/security/vulnerabilities/view-all",
    endpoint="vulnerabilities_list-all",
    view_func=build_vulnerabilities_list(
        security_vulnerabilities, "/view-all"
    ),
)

app.add_url_rule(
    "/security/vulnerabilities/<path:path>",
    view_func=build_vulnerabilities(security_vulnerabilities),
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
    "/engage/sitemap.xml",
    view_func=build_engage_pages_sitemap(engage_pages),
)

app.add_url_rule(
    "/engage/metadata.json",
    view_func=build_engage_pages_metadata(engage_pages),
)

# Custom engage page in German
app.add_url_rule(
    "/engage/de/warum-openstack",
    view_func=german_why_openstack,
)
app.add_url_rule(
    "/engage/fr/pourquoi-openstack",
    view_func=french_why_openstack,
)
app.add_url_rule(
    "/engage/es/por-que-openstack",
    view_func=spanish_why_openstack,
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
    response = flask.jsonify(active_takeovers)
    response.cache_control.max_age = "300"

    return response


def takeovers_index():
    page = flask.request.args.get("page", default=1, type=int)
    limit = 50
    offset = (page - 1) * limit
    (
        all_takeovers,
        count,
        active_count,
        total_current,
    ) = discourse_takeovers.get_index(limit=limit, offset=offset)
    total_pages = math.ceil(count / limit)

    return flask.render_template(
        "takeovers/index.html",
        takeovers=all_takeovers,
        active_count=active_count,
        total_count=total_current,
        total_pages=total_pages,
        current_page=page,
    )


app.add_url_rule("/takeovers.json", view_func=takeovers_json)
app.add_url_rule("/takeovers", view_func=takeovers_index)
app.add_url_rule("/user-country-tz.json", view_func=get_user_country_by_tz)

# All other routes
template_finder_view = TemplateFinder.as_view("template_finder")
template_finder_view._exclude_xframe_options_header = True
app.add_url_rule("/", view_func=template_finder_view)
app.add_url_rule("/<path:subpath>", view_func=template_finder_view)

# Community docs
url_prefix = "/community/docs"
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
        app,
        session=session,
        site="ubuntu.com/community",
        template_path="/community/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

community_docs.init_app(app)

# Community Portal
local_communities = Category(
    parser=CategoryParser(
        api=discourse_api,
        index_topic_id=62344,
        url_prefix="/community",
    ),
    category_id=129,
)

community_events = Events(
    parser=EventsParser(
        api=discourse_api, index_topic_id=60, url_prefix="/community/events"
    ),
    category_id=11,
)

ubuntu_weekly_newsletter = Category(
    parser=CategoryParser(
        api=discourse_api,
        index_topic_id=40911,
        url_prefix="/community",
    ),
    category_id=419,
    exclude_topics=[64651],
)

app.add_url_rule(
    "/community/circles",
    view_func=process_local_communities(local_communities),
)

app.add_url_rule(
    "/community/events",
    view_func=process_community_events(community_events),
)

app.add_url_rule(
    "/community",
    view_func=community_landing_page(
        community_events, local_communities, ubuntu_weekly_newsletter
    ),
)

app.add_url_rule(
    "/community/uwn",
    view_func=build_ubuntu_weekly_newsletter(ubuntu_weekly_newsletter),
    endpoint="uwn_index",
)

app.add_url_rule(
    "/community/uwn/<path:path>",
    view_func=build_ubuntu_weekly_newsletter(ubuntu_weekly_newsletter),
    endpoint="uwn_page",
)


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
        app,
        session=session,
        site="ubuntu.com/ceph/docs",
        template_path="ceph/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

# Credentials
app.add_url_rule("/credentials", view_func=cred_home)
app.add_url_rule("/credentials/self-study", view_func=cred_self_study)
app.add_url_rule("/credentials/exam-content", view_func=cred_syllabus_data)
app.add_url_rule("/credentials/faq", view_func=cred_faq)
app.add_url_rule(
    "/credentials/sign-up", view_func=cred_sign_up, methods=["GET", "POST"]
)
app.add_url_rule(
    "/credentials/thank-you", view_func=cred_thank_you, methods=["GET"]
)
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
    "/credentials/<string:type>/products",
    view_func=get_cue_products,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/exit-survey",
    view_func=cred_submit_form,
    methods=["GET", "POST"],
)
app.add_url_rule("/credentials/shop/", view_func=cred_shop)
app.add_url_rule(
    "/credentials/shop/manage/", view_func=cred_manage_shop, methods=["GET"]
)
app.add_url_rule("/credentials/shop/<p>", view_func=cred_shop)
app.add_url_rule("/credentials/shop/keys", view_func=cred_shop_keys)
app.add_url_rule(
    "/credentials/shop/order-thank-you", view_func=cred_shop_thank_you
)
app.add_url_rule(
    "/credentials/shop/webhook_responses",
    view_func=cred_shop_webhook_responses,
)
app.add_url_rule(
    "/credentials/redeem", view_func=cred_redeem_code, methods=["GET", "POST"]
)
app.add_url_rule(
    "/credentials/redeem/<code>",
    view_func=cred_redeem_code,
    methods=["GET", "POST"],
)
app.add_url_rule(
    "/credentials/keys/list",
    view_func=get_activation_keys,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/keys/rotate/<activation_key>",
    view_func=rotate_activation_key,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/keys/activate",
    view_func=activate_activation_key,
    methods=["POST"],
)
app.add_url_rule(
    "/credentials/keys/<key_id>",
    view_func=get_activation_key_info,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/beta/activation",
    view_func=cred_beta_activation,
    methods=["GET", "POST"],
)
app.add_url_rule(
    "/credentials/get_webhook_response",
    view_func=get_webhook_response,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/assessment_passed",
    view_func=issue_badges,
    methods=["POST"],
)
app.add_url_rule(
    "/credentials/dashboard",
    view_func=cred_dashboard,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/dashboard/<path:path>",
    view_func=cred_dashboard,
    methods=["GET"],
    defaults={"path": ""},
)
app.add_url_rule(
    "/credentials/api/upcoming-exams",
    view_func=cred_dashboard_upcoming_exams,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/api/exam-results",
    view_func=cred_dashboard_exam_results,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/api/system-statuses",
    view_func=cred_dashboard_system_statuses,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/api/issued-badges",
    view_func=get_issued_badges,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/api/issued-badges-bulk",
    view_func=get_issued_badges_bulk,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/api/test-taker-stats",
    view_func=get_test_taker_stats,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/api/issue-credly-badge",
    view_func=issue_credly_badge,
    methods=["POST"],
)
app.add_url_rule(
    "/credentials/api/user-permissions",
    view_func=get_cred_user_permissions,
    methods=["GET"],
)
app.add_url_rule(
    "/credentials/api/cancel-scheduled-exam/<reservation_id>",
    view_func=cancel_scheduled_exam,
    methods=["DELETE"],
)
app.add_url_rule(
    "/credentials/api/user-bans",
    view_func=cred_user_ban,
    methods=["GET", "PUT"],
)

app.add_url_rule(
    "/credentials/your-badges",
    view_func=get_my_issued_badges,
    methods=["GET"],
)

app.add_url_rule(
    "/credentials/confidentiality-agreement",
    view_func=confidentiality_agreement_webhook,
    methods=["POST"],
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
        app,
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
        app,
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
        app,
        session=session,
        site="ubuntu.com/security/certifications/docs",
        template_path="/security/certifications/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

security_certs_docs.init_app(app)

certified_routes(app)

# Subscription centre
app.add_url_rule(
    "/subscription-centre",
    view_func=subscription_centre,
    methods=["GET", "POST"],
)


# HPE blog section
def render_blogs():
    blogs = BlogViews(
        api=BlogAPI(
            session=session, thumbnail_width=555, thumbnail_height=311
        ),
        excluded_tags=[3184, 3265, 3408, 3960, 4491, 3599],
        tag_ids=[4307],
        per_page=3,
        blog_title="HPE blogs",
    )
    hpe_articles = blogs.get_tag("hpe")
    return flask.render_template(
        "/hpe/index.html", blogs=hpe_articles["articles"]
    )


app.add_url_rule("/hpe", view_func=render_blogs)


draft_blogs = BlogViews(
    api=BlogAPI(
        session=session,
        thumbnail_width=555,
        thumbnail_height=311,
        wordpress_username=WORDPRESS_USERNAME,
        wordpress_password=WORDPRESS_APPLICATION_PASSWORD,
    ),
    excluded_tags=[],
    tag_ids=[4794],
    per_page=3,
    blog_title="Draft blogs",
    status="draft",
)


draft_blogs_blueprint = build_blueprint(draft_blogs)


@draft_blogs_blueprint.before_request
def require_login():
    if not user_info(flask.session):
        return flask.redirect("/login?next=" + flask.request.path)


@login_required
def render_draft_blogs():
    email = user_info(flask.session).get("email", "").lower()
    if not email.endswith("@canonical.com"):
        return flask.abort(403)

    test_blogs = draft_blogs.get_tag("staging-blogs")
    return flask.render_template(
        "/blog/draft-blogs.html", articles=test_blogs["articles"]
    )


app.register_blueprint(
    draft_blogs_blueprint, url_prefix="/blog/draft-blogs", name="draft_blogs"
)
app.add_url_rule("/blog/draft-blogs", view_func=render_draft_blogs)


# Public-cloud blog section
# tag_ids:
# public-cloud - 1350, aws - 1205, azure - 1748, google-cloud - 4191,
# ubuntu-on-aws - 4478, ubuntu-on-gcp - 4387, ubuntu-on-azure - 4540
def render_public_cloud_blogs():
    blogs = BlogViews(
        api=BlogAPI(
            session=session, thumbnail_width=1000, thumbnail_height=700
        ),
        excluded_tags=[3184, 3265, 3408, 3960, 4491, 3599],
        tag_ids=[1205, 1350, 1748, 4191, 4478, 4540, 4387],
        per_page=3,
        blog_title="Public-cloud blogs",
    )
    public_cloud_articles = blogs.get_index()["articles"]
    sorted_articles = sorted(public_cloud_articles, key=lambda x: x["date"])
    return flask.render_template(
        "/cloud/public-cloud.html", blogs=sorted_articles
    )


app.add_url_rule("/cloud/public-cloud", view_func=render_public_cloud_blogs)


# Security standards resources blogs tab
def render_security_standards_blogs():
    blogs = BlogViews(
        api=BlogAPI(
            session=session, thumbnail_width=640, thumbnail_height=340
        ),
        tag_ids=[
            3829,
            2562,
            4063,
            3903,
            4468,
            4464,
            4392,
            1228,
            4417,
            4391,
            3830,
            4632,
            4633,
            4749,
        ],
        excluded_tags=[3184, 3265],
        per_page=4,
        blog_title="Security standards blogs",
    )
    sorted_articles = sorted(
        blogs.get_index()["articles"], key=lambda x: x["date"]
    )
    return flask.render_template(
        "/security/standards/index.html", blogs=sorted_articles
    )


app.add_url_rule(
    "/security/security-standards", view_func=render_security_standards_blogs
)


# Security FIPS resources blogs tab
def render_security_fips_blogs():
    blogs = BlogViews(
        api=BlogAPI(
            session=session, thumbnail_width=640, thumbnail_height=340
        ),
        tag_ids=[
            3829,
            2562,
            4063,
            3903,
            4468,
            4464,
            4392,
            1228,
            4417,
            4391,
            3830,
            4632,
            4633,
            4749,
        ],
        excluded_tags=[3184, 3265],
        per_page=4,
        blog_title="Security FIPS blogs",
    )
    sorted_articles = sorted(
        blogs.get_index()["articles"], key=lambda x: x["date"]
    )
    return flask.render_template("/security/fips.html", blogs=sorted_articles)


app.add_url_rule("/security/fips", view_func=render_security_fips_blogs)

app.add_url_rule(
    "/about/release-cycle",
    view_func=build_release_cycle_view(),
    endpoint="release_cycle",
)


def render_security_pci_dds_blogs():
    blogs = BlogViews(
        api=BlogAPI(
            session=session, thumbnail_width=640, thumbnail_height=340
        ),
        tag_ids=[
            4787,
            3829,
            2562,
            4063,
            3903,
            4468,
            4464,
            4392,
            1228,
            4417,
            4391,
            3830,
            4632,
            4633,
            4749,
        ],
        excluded_tags=[3184, 3265],
        per_page=4,
        blog_title="Security standards blogs",
    )
    sorted_articles = sorted(
        blogs.get_index()["articles"], key=lambda x: x["date"]
    )
    return flask.render_template(
        "/security/standards/pci-dss.html", blogs=sorted_articles
    )


app.add_url_rule(
    "/security/standards/pci-dss", view_func=render_security_pci_dds_blogs
)
app.add_url_rule("/security/pci-dss", view_func=render_security_pci_dds_blogs)


# CMMC resources blogs tab
def render_cmmc_blogs():
    blogs = BlogViews(
        api=BlogAPI(
            session=session, thumbnail_width=640, thumbnail_height=340
        ),
        tag_ids=[
            3829,
            2562,
            4063,
            3903,
            4468,
            4464,
            4392,
            1228,
            4417,
            4391,
            3830,
            4632,
            4633,
            4749,
        ],
        excluded_tags=[3184, 3265],
        per_page=4,
        blog_title="CMMC blogs",
    )
    sorted_articles = sorted(
        blogs.get_index()["articles"], key=lambda x: x["date"]
    )
    return flask.render_template("/security/cmmc.html", blogs=sorted_articles)


app.add_url_rule("/security/cmmc", view_func=render_cmmc_blogs)


# Supermicro blog section
def render_supermicro_blogs():
    blogs = BlogViews(
        api=BlogAPI(
            session=session, thumbnail_width=555, thumbnail_height=311
        ),
        tag_ids=[2247],
        excluded_tags=[3184, 3265, 3408, 3960, 4491, 3599],
        per_page=3,
        blog_title="Supermicro blogs",
    )
    supermicro_articles = blogs.get_tag("supermicro")
    return flask.render_template(
        "/supermicro/index.html", blogs=supermicro_articles["articles"]
    )


app.add_url_rule("/supermicro", view_func=render_supermicro_blogs)


# Endpoint for retrieving parsed directory tree
def get_sitemaps_tree():
    try:
        tree = directory_parser.scan_directory(
            os.getcwd() + "/templates", exclude_paths=DYNAMIC_SITEMAPS
        )
    except Exception as e:
        return {"Error:": str(e)}, 500
    return tree


app.add_url_rule("/sitemap_parser", view_func=get_sitemaps_tree)
app.add_url_rule(
    "/sitemap_tree.xml",
    view_func=build_sitemap_tree(DYNAMIC_SITEMAPS),
    methods=["GET", "POST"],
)


# Create endpoints for testing environment only
if app.config.get("TESTING") or os.getenv("TESTING") or app.debug:

    @app.route("/tests/<path:subpath>")
    def tests(subpath):
        """
        Expose all routes under templates/tests if in development/testing mode.
        """
        return flask.render_template(f"tests/{subpath}.html")


if environment != "production":

    @app.route("/sentry-debug")
    def trigger_error():
        """Endpoint to trigger a Sentry error for testing purposes."""
        1 / 0
        return "This won't be reached"


# Append utms cookie to canonical.com links in HTML responses
@app.after_request
def append_utms_to_canonical_links(response):
    return append_utms_cookie_to_canonical_links(response)
