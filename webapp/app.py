"""
A Flask application for ubuntu.com
"""

import os

import requests
import flask
import talisker.requests
from canonicalwebteam.blog import BlogAPI, BlogViews, build_blueprint
from canonicalwebteam.discourse import (
    DiscourseAPI,
    DocParser,
    Docs,
    EngagePages,
    TutorialParser,
    Tutorials,
)
from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.search import build_search_view
from canonicalwebteam.templatefinder import TemplateFinder

from webapp.certified.views import certified_routes
from webapp.handlers import init_handlers
from webapp.login import login_handler, logout
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
)
from webapp.shop.advantage.views import (
    accept_renewal,
    activate_magic_attach,
    advantage_account_users_view,
    advantage_shop_view,
    advantage_thanks_view,
    advantage_view,
    blender_shop_view,
    blender_thanks_view,
    cancel_advantage_subscriptions,
    cancel_trial,
    delete_account_user_role,
    get_account_offers,
    get_account_users,
    get_activate_view,
    get_advantage_offers,
    get_annotated_subscriptions,
    get_contract_token,
    get_renewal,
    get_user_subscriptions,
    magic_attach_view,
    post_account_user_role,
    post_advantage_purchase,
    post_advantage_subscriptions,
    post_auto_renewal_settings,
    post_offer,
    pro_activate_activation_key,
    pro_page_view,
    put_account_user_role,
    put_contract_entitlements,
)
from webapp.shop.cred.views import (
    activate_activation_key,
    cred_assessments,
    cred_beta_activation,
    cred_cancel_exam,
    cred_exam,
    cred_home,
    cred_redeem_code,
    cred_schedule,
    cred_self_study,
    cred_shop,
    cred_sign_up,
    cred_submit_form,
    cred_syllabus_data,
    cred_your_exams,
    get_activation_keys,
    get_cue_products,
    get_filtered_webhook_responses,
    get_issued_badges,
    get_my_issued_badges,
    get_webhook_response,
    issue_badges,
    rotate_activation_key,
)
from webapp.shop.views import (
    account_view,
    checkout,
    download_invoice,
    ensure_purchase_account,
    get_customer_info,
    get_last_purchase_ids,
    get_purchase,
    get_purchase_account_status,
    get_purchase_v2,
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
    appliance_install,
    appliance_portfolio,
    build_engage_index,
    build_engage_page,
    build_tutorials_index,
    build_tutorials_query,
    download_server_steps,
    download_thank_you,
    engage_thank_you,
    french_why_openstack,
    german_why_openstack,
    get_user_country_by_ip,
    json_asset_query,
    marketo_submit,
    mirrors_query,
    openstack_engage,
    openstack_install,
    releasenotes_redirect,
    show_template,
    sitemap_index,
    sixteen_zero_four,
    spanish_why_openstack,
    subscription_centre,
    thank_you,
    unlisted_engage_page,
    build_engage_pages_sitemap,
)

DISCOURSE_API_KEY = os.getenv("DISCOURSE_API_KEY")
DISCOURSE_API_USERNAME = os.getenv("DISCOURSE_API_USERNAME")

CHARMHUB_DISCOURSE_API_KEY = os.getenv("CHARMHUB_DISCOURSE_API_KEY")
CHARMHUB_DISCOURSE_API_USERNAME = os.getenv("CHARMHUB_DISCOURSE_API_USERNAME")

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
charmhub_session = requests.Session()
talisker.requests.configure(charmhub_session)

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

init_handlers(app, sentry)

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
app.add_url_rule("/pro/dashboard", view_func=advantage_view)
app.add_url_rule("/pro/user-subscriptions", view_func=get_user_subscriptions)
app.add_url_rule(
    "/pro/subscriptions.json", view_func=get_annotated_subscriptions
)
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
    "/account/<marketplace>/purchase-account-status",
    view_func=get_purchase_account_status,
    methods=["GET"],
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
        request_limit="2000/day",
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
    "/engage/sitemap.xml",
    view_func=build_engage_pages_sitemap(engage_pages),
)

app.add_url_rule(
    "/openstack/resources", view_func=openstack_engage(engage_pages)
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

# Data Platform Spark on K8s docs
data_spark_k8s_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=8963,
        url_prefix="/data/docs/spark/k8s",
    ),
    document_template="/data/docs/spark/k8s/document.html",
    url_prefix="/data/docs/spark/k8s",
    blueprint_name="data-docs-spark-k8s",
)
app.add_url_rule(
    "/data/docs/spark/k8s/search",
    "data-docs-spark-k8s-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/spark/k8s",
        template_path="/data/docs/spark/k8s/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_spark_k8s_docs.init_app(app)

# Data Platform MySQL on IAAS docs
data_mysql_iaas_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=9925,
        url_prefix="/data/docs/mysql/iaas",
    ),
    document_template="/data/docs/mysql/iaas/document.html",
    url_prefix="/data/docs/mysql/iaas",
    blueprint_name="data-docs-mysql-iaas",
)
app.add_url_rule(
    "/data/docs/mysql/iaas/search",
    "data-docs-mysql-iaas-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/mysql/iaas",
        template_path="/data/docs/mysql/iaas/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_mysql_iaas_docs.init_app(app)

# Data Platform MySQL on K8s docs
data_mysql_k8s_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=9680,
        url_prefix="/data/docs/mysql/k8s",
    ),
    document_template="/data/docs/mysql/k8s/document.html",
    url_prefix="/data/docs/mysql/k8s",
    blueprint_name="data-docs-mysql-k8s",
)
app.add_url_rule(
    "/data/docs/mysql/k8s/search",
    "data-docs-mysql-k8s-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/mysql/k8s",
        template_path="/data/docs/mysql/k8s/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_mysql_k8s_docs.init_app(app)

# Data Platform MongoDB on IaaS docs
data_mongodb_iaas_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=7663,
        url_prefix="/data/docs/mongodb/iaas",
    ),
    document_template="/data/docs/mongodb/iaas/document.html",
    url_prefix="/data/docs/mongodb/iaas",
    blueprint_name="data-docs-mongodb-iaas",
)
app.add_url_rule(
    "/data/docs/mongodb/iaas/search",
    "data-docs-mongodb-vm-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/mongodb/iaas",
        template_path="/data/docs/mongodb/iaas/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_mongodb_iaas_docs.init_app(app)

# Data Platform MongoDB on K8s docs
data_mongodb_k8s_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=10265,
        url_prefix="/data/docs/mongodb/k8s",
    ),
    document_template="/data/docs/mongodb/k8s/document.html",
    url_prefix="/data/docs/mongodb/k8s",
    blueprint_name="data-docs-mongodb-k8s",
)
app.add_url_rule(
    "/data/docs/mongodb/k8s/search",
    "data-docs-mongodb-k8s-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/mongodb/k8s",
        template_path="/data/docs/mongodb/k8s/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_mongodb_k8s_docs.init_app(app)

# Data Platform PostgreSQL on K8s docs
data_postgresql_k8s_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=9307,
        url_prefix="/data/docs/postgresql/k8s",
    ),
    document_template="/data/docs/postgresql/k8s/document.html",
    url_prefix="/data/docs/postgresql/k8s",
    blueprint_name="data-docs-postgresql-k8s",
)
app.add_url_rule(
    "/data/docs/postgresql/k8s/search",
    "data-docs-postgresql-k8s-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/postgresql/k8s",
        template_path="/data/docs/postgresql/k8s/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_postgresql_k8s_docs.init_app(app)

# Data Platform PostgreSQL on IaaS docs
data_postgresql_iaas_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=9710,
        url_prefix="/data/docs/postgresql/iaas",
    ),
    document_template="/data/docs/postgresql/iaas/document.html",
    url_prefix="/data/docs/postgresql/iaas",
    blueprint_name="data-docs-postgresql-iaas",
)
app.add_url_rule(
    "/data/docs/postgresql/iaas/search",
    "data-docs-postgresql-iaas-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/postgresql/iaas",
        template_path="/data/docs/postgresql/iaas/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_postgresql_iaas_docs.init_app(app)

# Data Platform OpenSearch on IaaS docs
data_opensearch_iaas_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=9729,
        url_prefix="/data/docs/opensearch/iaas",
    ),
    document_template="/data/docs/opensearch/iaas/document.html",
    url_prefix="/data/docs/opensearch/iaas",
    blueprint_name="data-docs-opensearch-iaas",
)
app.add_url_rule(
    "/data/docs/opensearch/iaas/search",
    "data-docs-opensearch-iaas-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/opensearch/iaas",
        template_path="/data/docs/opensearch/iaas/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_opensearch_iaas_docs.init_app(app)

# Data Platform Kafka on IaaS docs
data_kafka_iaas_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=10288,
        url_prefix="/data/docs/kafka/iaas",
    ),
    document_template="/data/docs/kafka/iaas/document.html",
    url_prefix="/data/docs/kafka/iaas",
    blueprint_name="data-docs-kafka-iaas",
)
app.add_url_rule(
    "/data/docs/kafka/iaas/search",
    "data-docs-kafka-iaas-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/kafka/iaas",
        template_path="/data/docs/kafka/iaas/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_kafka_iaas_docs.init_app(app)

# Data Platform Kafka on K8s docs
data_kafka_k8s_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=10296,
        url_prefix="/data/docs/kafka/k8s",
    ),
    document_template="/data/docs/kafka/k8s/document.html",
    url_prefix="/data/docs/kafka/k8s",
    blueprint_name="data-docs-kafka-k8s",
)
app.add_url_rule(
    "/data/docs/kafka/k8s/search",
    "data-docs-kafka-k8s-search",
    build_search_view(
        session=session,
        site="ubuntu.com/data/docs/kafka/k8s",
        template_path="/data/docs/kafka/k8s/search-results.html",
        search_engine_id=search_engine_id,
    ),
)
data_kafka_k8s_docs.init_app(app)

# Data Platform index docs
data_docs = Docs(
    parser=DocParser(
        api=charmhub_discourse_api,
        index_topic_id=10863,
        url_prefix="/data/docs/",
    ),
    document_template="/data/docs/document.html",
    url_prefix="/data/docs/",
    blueprint_name="data_docs",
)

data_docs.init_app(app)

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
        request_limit="2000/day",
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
        request_limit="2000/day",
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
        request_limit="2000/day",
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
app.add_url_rule("/credentials/shop/<p>", view_func=cred_shop)
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
    "/credentials/beta/activation",
    view_func=cred_beta_activation,
    methods=["GET", "POST"],
)
app.add_url_rule(
    "/credentials/get_filtered_webhook_responses",
    view_func=get_filtered_webhook_responses,
    methods=["GET"],
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
    "/credentials/get_issued_badges",
    view_func=get_issued_badges,
    methods=["GET"],
)

app.add_url_rule(
    "/credentials/your-badges",
    view_func=get_my_issued_badges,
    methods=["GET"],
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
        request_limit="2000/day",
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
        request_limit="2000/day",
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
        request_limit="2000/day",
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
        request_limit="2000/day",
    ),
)

landscape_docs.init_app(app)

# Robotics docs
robotics_docs = Docs(
    parser=DocParser(
        api=discourse_api,
        index_topic_id=34683,
        url_prefix="/robotics/docs",
    ),
    document_template="/robotics/docs/document.html",
    url_prefix="/robotics/docs",
    blueprint_name="robotics-docs",
)

# Robotics search
app.add_url_rule(
    "/robotics/docs/search",
    "robotics-docs-search",
    build_search_view(
        session=session,
        site="ubuntu.com/robotics/docs",
        template_path="/robotics/docs/search-results.html",
        search_engine_id=search_engine_id,
    ),
)

robotics_docs.init_app(app)

certified_routes(app)

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


# HPE blog section
def render_blogs():
    blogs = BlogViews(
        api=BlogAPI(
            session=session, thumbnail_width=555, thumbnail_height=311
        ),
        tag_ids=[4307],
        per_page=3,
        blog_title="HPE blogs",
    )
    hpe_articles = blogs.get_tag("hpe")
    return flask.render_template(
        "/hpe/index.html", blogs=hpe_articles["articles"]
    )


app.add_url_rule("/hpe", view_func=render_blogs)
