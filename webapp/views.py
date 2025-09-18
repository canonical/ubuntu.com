# Standard library
import html
import json
import math
import os
import re
import logging
from urllib.parse import quote, unquote, urlparse
from datetime import datetime

# Packages
import dateutil
import feedparser
import flask
import jinja2
import talisker.requests
import yaml
from bs4 import BeautifulSoup
from canonicalwebteam.discourse import DiscourseAPI, DocParser, Docs
from canonicalwebteam.search.models import get_search_results
from canonicalwebteam.search.views import NoAPIKeyError
from canonicalwebteam.directory_parser import generate_sitemap
from geolite2 import geolite2
from requests import Session
from requests.exceptions import HTTPError
from ubuntu_release_info.data import Data
from werkzeug.exceptions import BadRequest
from canonicalwebteam.flask_base.env import get_flask_env

# Local
from webapp.login import user_info
from webapp.marketo import MarketoAPI
from webapp.utils import format_community_event_time
from webapp.constants import ENGAGE_UI_TRANSLATIONS

ip_reader = geolite2.reader()
session = talisker.requests.get_session()

marketo_session = Session()
talisker.requests.configure(marketo_session)
marketo_api = MarketoAPI(
    get_flask_env("MARKETO_API_URL"),
    get_flask_env("MARKETO_API_CLIENT"),
    get_flask_env("MARKETO_API_SECRET"),
    marketo_session,
)


def _build_mirror_list(local=False, country_code=None):
    # Build mirror list
    mirrors = []
    mirror_list = []

    try:
        with open(f"{os.getcwd()}/etc/ubuntu-mirrors-rss.xml") as rss:
            mirrors = feedparser.parse(rss.read()).entries
    except IOError:
        pass

    # get all mirrors
    if not local:
        for mirror in mirrors:
            mirror_list.append(
                {
                    "link": mirror["link"],
                    "bandwidth": mirror["mirror_bandwidth"],
                }
            )
        return mirror_list

    # get local mirrors based on IP location
    if country_code:
        for mirror in mirrors:
            is_local_mirror = mirror["mirror_countrycode"] == country_code
            is_https = mirror["link"].startswith("https")

            if is_local_mirror and is_https:
                mirror_list.append(
                    {
                        "link": mirror["link"],
                        "bandwidth": mirror["mirror_bandwidth"],
                    }
                )

    return mirror_list


def show_template(filename):
    try:
        template_content = flask.render_template(f"templates/{filename}.html")
    except jinja2.exceptions.TemplateNotFound:
        flask.abort(404)

    return (
        template_content,
        {"Access-Control-Allow-Origin": "*"},
    )


def download_server_steps():
    templates = {
        "server": "download/server/manual.html",
        "multipass": "download/server/_multipass.html",
        "choose": "download/server/_choose.html",
    }
    context = {}
    step = flask.request.form.get("next-step") or "server"

    if step not in templates:
        flask.abort(400)

    return flask.render_template(templates[step], **context)


def download_thank_you(category):
    version = flask.request.args.get("version", "")
    architecture = flask.request.args.get("architecture", "").replace(" ", "+")
    lts = flask.request.args.get("lts", "")

    if version and not architecture:
        flask.abort(400)

    return (
        flask.render_template(
            f"download/{category}/thank-you.html",
            version=version,
            architecture=architecture,
            lts=lts,
        ),
        {"Cache-Control": "no-cache"},
    )


def appliance_install(appliance, device):
    with open("appliances.yaml") as appliances:
        appliances = yaml.load(appliances, Loader=yaml.FullLoader)

    return flask.render_template(
        f"appliance/{appliance}/{device}.html",
        http_host=flask.request.host,
        appliance=appliances["appliances"][appliance],
    )


def releasenotes_redirect():
    """
    View to redirect to https://wiki.ubuntu.com/ URLs for release notes.

    This used to be done in the Apache frontend, but that is going away
    to be replace by the content-cache.

    Old apache redirects: https://pastebin.canonical.com/p/3TXyyNkWkg/
    """

    version = flask.request.args.get("ver", "")[:5]

    for codename, release in Data().releases.items():
        short_version = ".".join(release.version.split(".")[:2])
        if version == short_version:
            release_slug = release.full_codename.replace(" ", "")

            return flask.redirect(
                f"https://wiki.ubuntu.com/{release_slug}/ReleaseNotes"
            )

    return flask.redirect("https://wiki.ubuntu.com/Releases")


def account_query():
    """
    A JSON endpoint to request login status
    """

    return flask.jsonify(
        {
            "account": user_info(flask.session),
        }
    )


def json_asset_query(file_name):
    """
    A JSON endpoint to request JSON assets from the asset manager
    """
    try:
        response = session.request(
            method="GET",
            url=f"https://assets.ubuntu.com/v1/{file_name}",
        )
        json = response.json()
    except HTTPError:
        flask.current_app.extensions["sentry"].captureException()

    return flask.jsonify(json)


def mirrors_query():
    """
    A JSON endpoint to request list of Ubuntu mirrors
    """
    local = flask.request.args.get("local", default=False)
    country = flask.request.args.get("country_code", default=None)

    if not local or local.lower() != "true":
        local = False
    else:
        local = True

    return (
        flask.jsonify(_build_mirror_list(local, country)),
        {"Cache-Control": "private"},
    )


def build_tutorials_index(session, tutorials_docs):
    def tutorials_index():
        page = flask.request.args.get("page", default=1, type=int)
        topic = flask.request.args.get("topic", default=None, type=str)
        sort = flask.request.args.get("sort", default=None, type=str)
        query = flask.request.args.get("q", default=None, type=str)
        posts_per_page = 15

        """
        Get search results from Google Custom Search
        """

        # Web tribe websites custom search ID
        search_engine_id = "adb2397a224a1fe55"

        # API key should always be provided as an environment variable
        search_api_key = get_flask_env("SEARCH_API_KEY")

        if query and not search_api_key:
            raise NoAPIKeyError("Unable to search: No API key provided")

        results = None

        if query:
            results = get_search_results(
                session=session,
                api_key=search_api_key,
                search_engine_id=search_engine_id,
                siteSearch="ubuntu.com/tutorials",
                query=query,
                site_restricted_search=False,
            )

        tutorials_docs.parser.parse()
        tutorials_docs.parser.parse_topic(tutorials_docs.parser.index_topic)

        if not topic:
            tutorials = tutorials_docs.parser.tutorials
        else:
            tutorials = [
                doc
                for doc in tutorials_docs.parser.tutorials
                if topic in doc["categories"]
            ]

        # Create list of topics
        topics_list = {}
        for item in tutorials_docs.parser.tutorials:
            if "categories" in item:
                for cat in item["categories"].split(", "):
                    cat_value = cat
                    cat = cat.strip().capitalize()
                    if cat == "Ua":
                        cat = "Ubuntu advantage"
                        cat_value = "ua"
                    if cat == "Iot":
                        cat = "IoT"
                    if cat == "Aws":
                        cat = "AWS"
                    if cat not in topics_list.keys():
                        topics_list[cat] = cat_value

        if query:
            temp_metadata = []
            if results.get("entries"):
                for result in results["entries"]:
                    start = result["link"].find("tutorials/")
                    end = len(result["link"])
                    identifier = result["link"][start:end]
                    if start != -1:
                        for doc in tutorials:
                            if identifier in doc["link"]:
                                temp_metadata.append(doc)
            tutorials = temp_metadata

        if sort == "difficulty-desc":
            tutorials = sorted(
                tutorials, key=lambda k: k["difficulty"], reverse=True
            )

        if sort == "difficulty-asc" or not sort:
            tutorials = sorted(
                tutorials, key=lambda k: k["difficulty"], reverse=False
            )

        total_results = len(tutorials)
        total_pages = math.ceil(total_results / posts_per_page)

        return flask.render_template(
            "tutorials/index.html",
            forum_url=tutorials_docs.parser.api.base_url,
            tutorials=tutorials,
            page=page,
            topic=topic,
            topics_list=dict(
                sorted(topics_list.items(), key=lambda key: key[0])
            ),
            sort=sort,
            query=query,
            posts_per_page=posts_per_page,
            total_results=total_results,
            total_pages=total_pages,
        )

    return tutorials_index


def build_engage_index(engage_docs):
    def engage_index():
        page = flask.request.args.get("page", default=1, type=int)
        preview = flask.request.args.get("preview")
        language = flask.request.args.get("language", default=None, type=str)
        resource = flask.request.args.get("resource", default=None, type=str)
        tag = flask.request.args.get("tag", default=None, type=str)
        limit = 21  # adjust as needed
        offset = (page - 1) * limit

        if tag or resource or language:
            (
                metadata,
                count,
                active_count,
                current_total,
            ) = engage_docs.get_index(
                limit,
                offset,
                tag_value=tag,
                key="type",
                value=resource,
                second_key="language",
                second_value=language,
            )
        else:
            (
                metadata,
                count,
                active_count,
                current_total,
            ) = engage_docs.get_index(
                limit, offset, key="is_static", value=None
            )

        # Fixed so that engage page authors don't create random resource types
        resource_types = [
            "Blog",
            "Case Study",
            "Webinar",
            "Whitepaper",
            "Form",
            "Event",
        ]
        tags_list = engage_docs.get_engage_pages_tags()
        tags_list = sorted(set(tags_list), key=str.lower)
        total_pages = math.ceil(current_total / limit)

        return flask.render_template(
            "engage/index.html",
            forum_url=engage_docs.api.base_url,
            metadata=metadata,
            page=page,
            preview=preview,
            language=language,
            resource=resource,
            resource_types=sorted(resource_types),
            tags=tags_list,
            posts_per_page=limit,
            total_pages=total_pages,
            current_page=page,
        )

    return engage_index


def build_engage_page(engage_pages):
    def engage_page(language, page):
        if language:
            path = f"/engage/{language}/{page}"
        else:
            path = f"/engage/{page}"
        metadata = engage_pages.get_engage_page(path)
        if not metadata:
            flask.abort(404)
        else:
            related_pages_metadata = []
            if "related_urls" in metadata:
                if metadata["related_urls"].strip() != "":
                    related_urls = metadata["related_urls"].split(",")
                    # Only show maximum of 3 related pages
                    for url in related_urls[:3]:
                        page_metadata = engage_pages.get_engage_page(
                            url.strip()
                        )
                        if page_metadata is not None:
                            related_pages_metadata.append(page_metadata)

            # Generate translated UI strings for template
            lang_raw = (metadata.get("language") or "en").strip()
            lang_base = lang_raw.split("-")[0].lower()
            translations = ENGAGE_UI_TRANSLATIONS["additional_resources"]
            additional_resources_text = translations.get(
                lang_base, translations["en"]
            )

            return flask.render_template(
                "engage/base.html",
                forum_url=engage_pages.api.base_url,
                metadata=metadata,
                language=metadata["language"],
                resource=metadata["type"],
                related_pages_metadata=related_pages_metadata,
                additional_resources_text=additional_resources_text,
            )

    return engage_page


def match_tags(tags_1, tags_2):
    for tag_1 in tags_1:
        for tag_2 in tags_2:
            if tag_1.strip().lower() == tag_2.strip().lower():
                return True
            else:
                continue

    return False


def engage_thank_you(engage_pages):
    """
    Renders an engage pages thank-you page
    i.e. whitepapers, pdfs

    If there is no current topic it can't render the page
    e.g. accessing directly

    @parameters: language (optional) and page path name
    e.g. /cloud-init-whitepaper
    @returns: a function that renders a template
    """

    def render_template(language, page):
        if language:
            path = f"/engage/{language}/{page}"
        else:
            path = f"/engage/{page}"

        metadata = engage_pages.get_engage_page(path)
        if not metadata:
            flask.abort(404)

        # Stop potential spamming of /engage/<engage-page>/thank-you
        if (
            "resource_url" not in metadata or metadata["resource_url"] == ""
        ) and (
            "contact_form_only" not in metadata
            or metadata["contact_form_only"] != "true"
        ):
            return flask.abort(404)

        language = metadata["language"]
        if language and language != "en":
            template_language = f"engage/shared/_{language}_thank-you.html"
        else:
            template_language = "engage/thank-you.html"

        try:
            form_details = flask.session["form_details"]
        except KeyError:
            form_details = None

        return flask.render_template(
            template_language,
            request_url=flask.request.referrer,
            metadata=metadata,
            resource_name=metadata["type"],
            resource_url=metadata["resource_url"],
            form_details=form_details,
        )

    return render_template


def unlisted_engage_page(slug):
    """
    Renders an engage page that is separate from the
    discourse implementation
    """
    try:
        return flask.render_template(f"engage/unlisted/{slug}.html")
    except jinja2.exceptions.TemplateNotFound:
        return flask.abort(404)


def build_engage_pages_sitemap(engage_pages):
    """
    Create sitemaps for each engage page
    """

    def ep_sitemap():
        links = []
        (
            metadata,
            count,
            active_count,
            current_total,
        ) = engage_pages.get_index()

        if len(metadata) == 0:
            flask.abort(404)

        for page in metadata:
            links.append(
                {
                    "url": f'https://ubuntu.com{page["path"]}',
                    "last_updated": page["updated"].strftime(
                        "%Y-%m-%dT%H:%M:%SZ"
                    ),
                }
            )

        xml_sitemap = flask.render_template("sitemap.xml", links=links)

        response = flask.make_response(xml_sitemap)
        response.headers["Content-Type"] = "application/xml"
        response.headers["Cache-Control"] = "public, max-age=43200"

        return response

    return ep_sitemap


def build_engage_pages_metadata(engage_pages):
    """
    Retrieve a all engage pages metadata as a single JSON structure.
    The data is cached and refreshed once per day.
    """
    _cache = {"data": None, "last_update_date": None}

    def get_metadata():
        today = datetime.now().replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        if _cache["last_update_date"] != today or _cache["data"] is None:
            all_pages = []
            limit = 100
            offset = 0
            current_total = 1

            while offset < current_total:
                pages_list, total_count, active_count, current_total = (
                    engage_pages.get_index(limit=limit, offset=offset)
                )

                for page in pages_list:
                    if "path" in page and page["path"]:
                        sanitized_page = {
                            "topic_name": str(page.get("topic_name", "")),
                            "path": str(page.get("path", "")),
                            "form_id": str(page.get("form_id", "")),
                            "webinar_code": str(page.get("webinar_code", "")),
                            "resource_url": str(page.get("resource_url", "")),
                            "author": str(
                                page.get("author", "")
                            ),  # Author doesn't exist yet
                            "active": str(page.get("active", "")),
                            "tags": str(page.get("tags", "")),
                            "type": str(page.get("type", "")),
                        }
                        all_pages.append(sanitized_page)

                offset += limit

            all_pages_metadata = {
                "total_count": total_count,
                "pages": all_pages,
            }

            _cache["data"] = all_pages_metadata
            _cache["last_update_date"] = today

        response = flask.jsonify(_cache["data"])
        response.headers["Cache-Control"] = "public, max-age=86400"

        return response

    return get_metadata


def openstack_install():
    """
    OpenStack install docs
    Instructions for OpenStack installation pulled from Discourse
    """
    discourse_api = DiscourseAPI(
        base_url="https://discourse.ubuntu.com/", session=session
    )
    openstack_install_parser = DocParser(
        api=discourse_api,
        index_topic_id=23346,
        url_prefix="/openstack/install",
    )
    openstack_install_docs = Docs(
        parser=openstack_install_parser,
        document_template="/openstack/install.html",
        url_prefix="/openstack/install",
        blueprint_name="openstack-install-docs",
    )

    singlenode_topic = openstack_install_docs.parser.api.get_topic(35230)
    singlenode_topic_soup = BeautifulSoup(
        singlenode_topic["post_stream"]["posts"][0]["cooked"],
        features="html.parser",
    )
    singlenode_content = openstack_install_parser._process_topic_soup(
        singlenode_topic_soup
    )
    openstack_install_docs.parser._replace_lightbox(singlenode_topic_soup)

    multinode_topic = openstack_install_docs.parser.api.get_topic(35727)
    multinode_topic_soup = BeautifulSoup(
        multinode_topic["post_stream"]["posts"][0]["cooked"],
        features="html.parser",
    )
    multinode_content = openstack_install_docs.parser._process_topic_soup(
        multinode_topic_soup
    )
    openstack_install_docs.parser._replace_lightbox(multinode_topic_soup)

    return flask.render_template(
        "openstack/install.html",
        single_node=str(singlenode_content),
        multi_node=str(multinode_content),
    )


def german_why_openstack():
    return flask.render_template("engage/de_why-openstack.html")


def french_why_openstack():
    return flask.render_template("engage/fr_why-openstack.html")


def spanish_why_openstack():
    return flask.render_template("engage/es_why-openstack.html")


def build_tutorials_query(tutorials_docs):
    def tutorials_query():
        topic = flask.request.args.get("topic", default="", type=str)

        tutorials_docs.parser.parse()
        tutorials_docs.parser.parse_topic(tutorials_docs.parser.index_topic)

        tutorials = [
            doc
            for doc in tutorials_docs.parser.tutorials
            if topic in doc.get("categories", [])
        ]

        tutorials = sorted(
            tutorials,
            key=lambda k: k.get("difficulty", 1),
            reverse=True,
        )

        return flask.jsonify(tutorials)

    return tutorials_query


# Blog
# ===
class BlogView(flask.views.View):
    def __init__(self, blog_views):
        self.blog_views = blog_views


class BlogRedirects(BlogView):
    def dispatch_request(self, slug):
        slug = quote(slug, safe="/:?&")
        context = self.blog_views.get_article(slug)

        if "article" not in context:
            return flask.abort(404)

        # Redirect canonical announcements
        group = context["article"].get("group")
        if isinstance(group, dict) and group["id"] == 2100:
            redirect_url = f"https://canonical.com/blog/{slug}"
            # Append the original query string to the redirect URL
            original_query_string = flask.request.query_string.decode("utf-8")
            if original_query_string:
                redirect_url += f"?{original_query_string}"
            return flask.redirect(redirect_url)

        # Set blog notice date
        blog_notice = {}
        created_at, updated_at = dateutil.parser.parse(
            context["article"]["date_gmt"]
        ), dateutil.parser.parse(context["article"]["modified_gmt"])

        date_now = datetime.now()

        created_at_difference = dateutil.relativedelta.relativedelta(
            date_now, created_at
        ).years

        updated_at_difference = dateutil.relativedelta.relativedelta(
            date_now, updated_at
        ).years

        # Check if date was published or updated over a year
        if created_at_difference >= 1 and updated_at_difference >= 1:
            #  Decide whether to show updated or published date difference
            if (
                updated_at
                > dateutil.relativedelta.relativedelta(days=+1) + created_at
            ):
                blog_notice["updated"] = True
                blog_notice["difference_in_years"] = updated_at_difference
            else:
                blog_notice["updated"] = False
                blog_notice["difference_in_years"] = created_at_difference

        context["blog_notice"] = blog_notice

        return flask.render_template("blog/article.html", **context)


class BlogCustomTopic(BlogView):
    def dispatch_request(self, slug):
        page_param = flask.request.args.get("page", default=1, type=int)
        context = self.blog_views.get_topic(slug, page_param)

        return flask.render_template(f"blog/topics/{slug}.html", **context)


class BlogCustomGroup(BlogView):
    def dispatch_request(self, slug):
        page_param = flask.request.args.get("page", default=1, type=int)
        category_param = flask.request.args.get(
            "category", default="", type=str
        )
        context = self.blog_views.get_group(slug, page_param, category_param)

        return flask.render_template(f"blog/{slug}.html", **context)


class BlogSitemapIndex(BlogView):
    def dispatch_request(self):
        response = session.get(
            "https://admin.insights.ubuntu.com/sitemap_index.xml"
        )

        xml = response.text.replace(
            "https://admin.insights.ubuntu.com/",
            "https://ubuntu.com/blog/sitemap/",
        )
        xml = re.sub(r"<\?xml-stylesheet.*\?>", "", xml)

        response = flask.make_response(xml)
        response.headers["Content-Type"] = "application/xml"
        return response


class BlogSitemapPage(BlogView):
    def dispatch_request(self, slug):
        response = session.get(f"https://admin.insights.ubuntu.com/{slug}.xml")

        if response.status_code == 404:
            return flask.abort(404)

        xml = response.text.replace(
            "https://admin.insights.ubuntu.com/", "https://ubuntu.com/blog/"
        )
        xml = re.sub(r"<\?xml-stylesheet.*\?>", "", xml)

        response = flask.make_response(xml)
        response.headers["Content-Type"] = "application/xml"
        return response


def sitemap_index():
    xml_sitemap = flask.render_template("sitemap_index.xml")
    response = flask.make_response(xml_sitemap)

    response.headers["Content-Type"] = "application/xml"
    return response


def shorten_acquisition_url(acquisition_url):
    """
    Shorten the acquisition URL sent when submitting forms
    """

    if len(acquisition_url) > 255:
        url_without_params = acquisition_url.split("?")[0]
        url_params_string = acquisition_url.split("?")[1]
        url_params_list = url_params_string.split("&")
        url_params_to_remove = []

        # Check for and remove fbclid and gclid parameters
        for param in url_params_list:
            if param.startswith("fbclid") or param.startswith("gclid"):
                url_params_to_remove.append(param)

        for param in url_params_to_remove:
            url_params_list.remove(param)

        new_acquisition_url = (
            url_without_params + "?" + "&".join(url_params_list)
        )

        # If the URL is still too long, remove all parameters
        if len(new_acquisition_url) > 255:
            return new_acquisition_url.split("?")[0]

        return new_acquisition_url
    return acquisition_url


def marketo_submit():
    form_fields = {}
    for key in flask.request.form:
        # Skip keys that start with '_radio_' to avoid marketo errors
        if key.startswith("_radio_"):
            continue
        values = flask.request.form.getlist(key)
        value = ", ".join(values)
        if value:
            form_fields[key] = value
            if "utm_content" in form_fields:
                form_fields["utmcontent"] = form_fields.pop("utm_content")

    # Check honeypot values are not set
    # There is logically difference between None and empty string here.
    # 1. The first if check, we are working with a form that contains honeypots
    # 2. The second that checks for empty string is actually testing if the
    # honeypots have been triggered

    honeypot_name = flask.request.form.get("name")
    honeypot_website = flask.request.form.get("website")

    if honeypot_name is not None and honeypot_website is not None:
        if honeypot_name != "" or honeypot_website != "":
            raise BadRequest("Unexpected honeypot fields (name, website)")
        else:
            form_fields.pop("website", None)
            form_fields.pop("name", None)

    form_fields.pop("thankyoumessage", None)
    return_url = form_fields.pop("returnURL", None)

    encode_lead_comments = (
        form_fields.pop("Encode_Comments_from_lead__c", "yes") == "yes"
    )
    if encode_lead_comments and "Comments_from_lead__c" in form_fields:
        encoded_comment = html.escape(form_fields["Comments_from_lead__c"])
        form_fields["Comments_from_lead__c"] = encoded_comment

    visitor_data = {
        "userAgentString": flask.request.headers.get("User-Agent"),
    }
    referrer = (
        flask.request.referrer
        if flask.request.referrer
        else "https://ubuntu.com"
    )
    client_ip = flask.request.headers.get(
        "X-Real-IP", flask.request.remote_addr
    )

    if client_ip and ":" not in client_ip:
        visitor_data["leadClientIpAddress"] = client_ip

    enrichment_fields = {}

    # Enrichment data for global enrichment form (id:4198)
    if "email" in form_fields:
        enrichment_fields = {
            "email": form_fields["email"],
        }

    if "acquisition_url" in form_fields:
        shortened_url = shorten_acquisition_url(form_fields["acquisition_url"])
        form_fields["acquisition_url"] = shortened_url
        enrichment_fields["acquisition_url"] = shortened_url
    else:
        shortened_url = shorten_acquisition_url(referrer)
        enrichment_fields["acquisition_url"] = shortened_url

    if "preferredLanguage" in form_fields:
        enrichment_fields["preferredLanguage"] = form_fields[
            "preferredLanguage"
        ]
        form_fields.pop("preferredLanguage")

    if "country" in form_fields:
        enrichment_fields["country"] = form_fields["country"]
        form_fields.pop("country")
    else:
        try:
            ip_location = ip_reader.get(client_ip)
            if ip_location and "country" in ip_location:
                enrichment_fields["country"] = ip_location["country"][
                    "iso_code"
                ]
        except Exception:
            pass

    user_id = flask.request.cookies.get("user_id") or flask.request.form.get(
        "user_id"
    )
    if user_id:
        enrichment_fields["Google_Analytics_User_ID__c"] = user_id
        form_fields.pop("user_id", None)

    consent_info = flask.request.cookies.get(
        "consent_info"
    ) or flask.request.form.get("consent_info")
    if consent_info:
        enrichment_fields["Google_Consent_Mode__c"] = consent_info
        form_fields.pop("consent_info", None)

    original_form_id = form_fields.get("formid", 4198)
    enrichment_fields["original_form_id"] = original_form_id

    if "formid" not in form_fields:
        flask.flash(
            "There was a problem submitting your form.",
            "contact-form-fail",
        )
        flask.current_app.extensions["sentry"].captureMessage(
            "Marketo form ID missing",
            extra={"enrichment_fields": enrichment_fields},
        )
        return flask.redirect(f"{referrer}#contact-form-fail")

    payload = {
        "formId": form_fields.pop("formid"),
        "input": [
            {
                "leadFormFields": form_fields,
                "visitorData": visitor_data,
                "cookie": flask.request.args.get("mkt"),
            }
        ],
    }

    encoded_utms = flask.request.cookies.get("utms") or flask.request.form.get(
        "utms"
    )
    if encoded_utms:
        form_fields.pop("utms", None)
        utms = unquote(encoded_utms)
        utm_dict = dict(i.split(":", 1) for i in utms.split("&"))
        approved_utms = [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_content",
            "utm_term",
        ]
        for k, v in utm_dict.items():
            if k in approved_utms:
                if k == "utm_content":
                    k = "utmcontent"
                enrichment_fields[k] = v

    enriched_payload = {
        "formId": "4198",
        "input": [{"leadFormFields": enrichment_fields}],
    }

    try:
        # Send form data
        r = marketo_api.submit_form(payload)
        data = r.json()

        if "errors" in data and data["errors"][0]["code"] == "609":
            return flask.render_template(
                "/400.html",
                error_msg="Please ensure the form exists and try again.",
            )

        if "result" not in data:
            flask.current_app.extensions["sentry"].captureMessage(
                "Marketo form API Issue",
                extra={"payload": payload, "response": data},
            )

            return (
                flask.jsonify(
                    {"error": "There was an issue submitting the form."}
                ),
                400,
            )

        if data["result"][0]["status"] == "skipped":
            flask.current_app.extensions["sentry"].captureMessage(
                f"Marketo form {payload['formId']} failed to submit",
                extra={"payload": payload, "response": data},
            )

    except Exception:
        flask.current_app.extensions["sentry"].captureException(
            extra={"payload": payload}
        )

        return (
            flask.jsonify(
                {"error": "There was an issue submitting the form."}
            ),
            400,
        )

    # Send enrichment data
    try:
        enrichment_submission = marketo_api.submit_form(
            enriched_payload
        ).json()
    except Exception:
        pass

    # Redirect to success page only if both submissions were successful
    payload_status = data["result"][0]["status"]
    if (
        enrichment_submission["success"] is True
        and payload_status == "updated"
    ):
        flask.flash(
            "Your form was submitted successfully.", "contact-form-success"
        )

        if return_url:
            # Personalize thank-you page
            flask.session["form_details"] = {
                "name": flask.request.form.get("firstName"),
                "email": flask.request.form.get("email"),
            }

            if return_url.startswith("http://") or return_url.startswith(
                "https://"
            ):
                return flask.redirect(return_url)

            if referrer:
                parsed_return_url = urlparse(return_url)
                parsed_referrer = urlparse(referrer)

                return flask.redirect(
                    f"{parsed_referrer.scheme}://{parsed_referrer.netloc}"
                    f"{parsed_return_url.path}#{parsed_return_url.fragment}"
                )

            return flask.redirect(return_url)
    else:
        # Log failed form submissions to Sentry and display error notification
        if (
            payload_status == "skipped"
            and enrichment_submission["success"] is False
        ):
            flask.current_app.extensions["sentry"].captureMessage(
                (
                    f"Marketo form {payload['formId']} and enrichment payload "
                    "failed to submit"
                ),
                extra={
                    "payload": payload,
                    "enriched_payload": enriched_payload,
                },
            )
            flask.flash(
                (
                    "There was an issue submitting the form contact details "
                    "and payload."
                ),
                "contact-form-fail",
            )
        elif payload_status == "skipped":
            flask.current_app.extensions["sentry"].captureMessage(
                f"Marketo form {payload['formId']} payload failed to submit",
                extra={
                    "payload": payload,
                    "response": data,
                    "enrichment_fields": enrichment_fields,
                },
            )
            flask.flash(
                "There was an issue submitting the form payload.",
                "contact-form-fail",
            )

        if return_url:
            # Remove anchor from url
            parsed_return_url = urlparse(return_url)
            parsed_referrer = urlparse(referrer)
            return flask.redirect(
                f"{parsed_referrer.scheme}://{parsed_referrer.netloc}"
                f"{parsed_return_url.path}#contact-form-fail"
            )
        return flask.redirect("/#contact-form-fail")

    if referrer:
        return flask.redirect(f"/thank-you?referrer={referrer}")

    return flask.redirect("/thank-you")


def thank_you():
    return flask.render_template(
        "thank-you.html", referrer=flask.request.args.get("referrer")
    )


def get_user_country_by_tz():
    """
    Get user country by timezone using ISO 3166 country codes.
    We store the country codes and timezones as static JSON files in the
    static/files directory.

    Eventually we plan to merge this function with the one below, once we
    are confident that takeovers won't be broken.
    """
    APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    timezone = flask.request.args.get("tz")

    with open(
        os.path.join(APP_ROOT, "static/files/timezones.json"), "r"
    ) as file:
        timezones = json.load(file)

    with open(
        os.path.join(APP_ROOT, "static/files/countries.json"), "r"
    ) as file:
        countries = json.load(file)

    # Fallback to GB if timezone is invalid
    try:
        country_tz = timezones[timezone]
    except KeyError:
        country_tz = timezones["Europe/London"]

    # Check timezone of country alias if country code not found
    try:
        _country = country_tz["c"][0]
        country = countries[_country]
    except KeyError:
        try:
            alias = country_tz["a"]
            alias_tz = timezones[alias]
            _country = alias_tz["c"][0]
            country = countries[_country]
        except KeyError:
            country = "United Kingdom"
            _country = "GB"

    return flask.jsonify(
        {
            "country": country,
            "country_code": _country,
        }
    )


def subscription_centre():
    sfdcLeadId = flask.request.args.get("id")
    return_url = flask.request.form.get("returnURL")

    if sfdcLeadId is None:
        return flask.redirect("/blog")

    if flask.request.method == "POST":
        if not return_url:
            subscription_centre_submit(sfdcLeadId, False)
            return flask.redirect(
                f"{flask.request.path}?id={sfdcLeadId}#updated"
            )
        else:
            subscription_centre_submit(sfdcLeadId, True)
            return flask.redirect(f"/{return_url}")

    with open("subscriptions.yaml") as subscriptions:
        subscriptions = yaml.load(subscriptions, Loader=yaml.FullLoader)

    try:
        response = marketo_api.request(
            "GET",
            "/rest/v1/leads.json",
            {
                "filterType": "sfdcLeadId",
                "filterValues": sfdcLeadId,
                "fields": "prototype_interests,canonicalUpdatesOptIn",
            },
        )
        data = response.json()
    except HTTPError:
        flask.current_app.extensions["sentry"].captureException()

    return flask.render_template(
        "subscription-centre/index.html",
        categories=subscriptions,
        interests=data["result"][0]["prototype_interests"],
        updatesOptIn=data["result"][0]["canonicalUpdatesOptIn"],
    )


def subscription_centre_submit(sfdcLeadId, unsubscribe):
    updatesOptIn = flask.request.form.get("generalUpdates") or False
    tagListArray = flask.request.form.getlist("tags")
    tagListString = ",".join(tagListArray)

    payload = {
        "lookupField": "sfdcLeadId",
        "input": [
            {
                "sfdcLeadId": sfdcLeadId,
                "prototype_interests": tagListString,
                "canonicalUpdatesOptIn": updatesOptIn,
                "unsubscribed": unsubscribe,
            }
        ],
    }

    try:
        response = marketo_api.request(
            "POST", "/rest/v1/leads.json", json=payload
        )
        return response
    except HTTPError:
        flask.current_app.extensions["sentry"].captureException()


def navigation_nojs():
    return flask.render_template("templates/navigation/navigation-nojs.html")


def process_active_vulnerabilities(security_vulnerabilities):
    """
    Takes a list of security vulnerabilities and filters out the ones where
    the 'Display until' date is in the past.
    """

    def security_index():
        try:
            vulnerabilities_metadata = (
                security_vulnerabilities.get_category_index_metadata(
                    "vulnerabilities"
                )
            )
            vulnerability_topics_array = (
                security_vulnerabilities.get_topics_in_category()
            )

            # Convert array of topic objects to dict for quick lookup
            vulnerability_topics = {
                str(topic["id"]): topic["slug"]
                for topic in vulnerability_topics_array
            }
            current_date = datetime.now()

            # Filter out vulnerabilities that should not be displayed
            filtered_vulnerabilities = [
                {
                    **vulnerability,
                    "slug": vulnerability_topics.get(str(vulnerability["id"])),
                }
                for vulnerability in vulnerabilities_metadata
                if vulnerability.get("display-until")
                and datetime.strptime(
                    vulnerability["display-until"], "%d/%m/%Y"
                )
                > current_date
            ]
            return flask.render_template(
                "security/index.html",
                active_vulnerabilities=filtered_vulnerabilities,
            )
        except (HTTPError, TypeError) as e:
            flask.current_app.extensions["sentry"].captureException(
                f"Error processing vulnerabilities: {e}"
            )
            return flask.render_template(
                "security/index.html",
                active_vulnerabilities=[],
            )

    return security_index


def build_vulnerabilities_list(security_vulnerabilities, path=None):
    def vulnerabilities_list():
        try:
            template_path = "security/vulnerabilities/view-all.html"
            topics_array = security_vulnerabilities.get_topics_in_category()
            # Convert array of topic objects to dict for quick lookup
            topics = {
                str(topic["id"]): topic["slug"] for topic in topics_array
            }
            vulnerabilities = (
                security_vulnerabilities.get_category_index_metadata(
                    "vulnerabilities"
                )
            )
            for vuln in vulnerabilities:
                # Add slug
                vuln_id = str(vuln["id"])
                if vuln_id in topics:
                    vuln["slug"] = topics[vuln_id]
                # Add year
                dt = datetime.strptime(vuln["published"], "%d/%m/%Y")
                vuln["year"] = dt.year

            # Make sure they are in order of published date
            vulnerabilities.sort(
                key=lambda item: datetime.strptime(
                    item["published"], "%d/%m/%Y"
                ),
                reverse=True,
            )

            # If not /view-all we only need the most recent 3 years
            if path != "/view-all":
                template_path = "security/vulnerabilities/index.html"
                unique_years = {v["year"] for v in vulnerabilities}
                sorted_years = sorted(unique_years, reverse=True)
                top_years = sorted_years[:3]
                vulnerabilities = [
                    v for v in vulnerabilities if v["year"] in top_years
                ]

            return flask.render_template(
                template_path,
                topics=topics,
                vulnerabilities=vulnerabilities,
            )
        except HTTPError as e:
            flask.current_app.extensions["sentry"].captureException(
                f"Error fetching vulnerabilities: {e}"
            )

    return vulnerabilities_list


def build_vulnerabilities(security_vulnerabilities):
    def vulnerability(path):
        try:
            document = security_vulnerabilities.get_topic(path)
            metadata_table = (
                security_vulnerabilities.get_category_index_metadata(
                    "vulnerabilities"
                )
            )

            for item in metadata_table:
                if str(item["id"]) == str(document["topic_id"]):
                    document_metadata = item
                    break

            return flask.render_template(
                "security/vulnerabilities/vulnerability-detailed.html",
                metadata=document_metadata,
                document=document,
            )
        except HTTPError as e:
            flask.current_app.extensions["sentry"].captureException(
                f"Error fetching vulnerabilities: {e}"
            )

    return vulnerability


def build_sitemap_tree(exclude_paths=None):
    def create_sitemap(sitemap_path):
        directory_path = os.getcwd() + "/templates"
        base_url = "https://ubuntu.com"
        try:
            xml_sitemap = generate_sitemap(
                directory_path, base_url, exclude_paths=exclude_paths
            )
            if xml_sitemap:
                with open(sitemap_path, "w") as f:
                    f.write(xml_sitemap)
                logging.info(f"Sitemap saved to {sitemap_path}")

                return xml_sitemap
            else:
                logging.warning("Sitemap is empty")
                return {"error:", "Sitemap is empty"}, 400

        except Exception as e:
            logging.error(f"Error generating sitemap: {e}")
            return f"Generate_sitemap error: {e}", 500

    def serve_sitemap():
        """
        Generate and serve the sitemap_tree.xml file.
        This sitemap tracks changes in the template files and is generated
        dynamically on every new push to main.
        """
        sitemap_path = os.getcwd() + "/templates/sitemap_tree.xml"

        # Validate the secret if its a POST request
        if flask.request.method == "POST":
            expected_secret = get_flask_env("SITEMAP_SECRET")
            provided_secret = flask.request.headers.get(
                "Authorization", ""
            ).replace("Bearer ", "")

            if provided_secret != expected_secret:
                logging.warning("Invalid secret provided")
                return {"error": "Unauthorized"}, 401

            xml_sitemap = create_sitemap(sitemap_path)
            return {
                "message": (
                    f"Sitemap successfully generated at {sitemap_path}"
                )
            }, 200

        # Generate sitemap if update request or if it doesn't exist
        if not os.path.exists(sitemap_path):
            xml_sitemap = create_sitemap(sitemap_path)

        # Serve the existing sitemap
        with open(sitemap_path, "r") as f:
            xml_sitemap = f.read()

        response = flask.make_response(xml_sitemap)
        response.headers["Content-Type"] = "application/xml"
        return response

    return serve_sitemap


def process_local_communities(local_communities):
    def display_local_communities():
        metadata_table = local_communities.get_category_index_metadata("locos")

        # Group communities by continent
        valid_continents = [
            "africa",
            "asia",
            "europe",
            "north america",
            "south america",
            "oceania",
        ]
        communities_by_continent = {}
        for community in metadata_table:
            continent = community.get("continent")
            if continent and continent.lower() in valid_continents:
                if continent not in communities_by_continent:
                    communities_by_continent[continent] = []
                communities_by_continent[continent].append(community)
        communities_by_continent = dict(
            sorted(communities_by_continent.items())
        )

        # Extract lat/lon from coordinates string for each community
        map_markers = []
        for community in metadata_table:
            community["lat"] = None
            community["lon"] = None

            if "coordinates" in community and community["coordinates"]:
                try:
                    # Replace Unicode minus sign (−) with ASCII hyphen (-)
                    coordinates = community["coordinates"].replace("−", "-")
                    lat_str, lon_str = coordinates.split(",")
                    lat = float(lat_str.strip())
                    lon = float(lon_str.strip())
                    community["lat"] = lat
                    community["lon"] = lon

                    map_markers.append(
                        {
                            "lat": lat,
                            "lon": lon,
                            "name": community.get("name", ""),
                        }
                    )
                except (ValueError, AttributeError) as e:
                    logging.error(
                        f"Error parsing coordinates "
                        f"'{community['coordinates']}': {e}"
                    )

        return flask.render_template(
            "community/local-communities.html",
            communities_by_continent=communities_by_continent,
            map_markers=map_markers,
        )

    return display_local_communities


def process_community_events(community_events):
    def display_community_events():
        featured_events = community_events.get_featured_events()

        filtered_events = []
        for event in featured_events:
            full_event = community_events.parser.api.get_topic(
                event["post"]["topic"]["id"]
            )
            parsed_event = community_events.parser.parse_topic(full_event)

            if len(parsed_event["sections"]) > 0:
                event["description"] = parsed_event["sections"][0]["content"]
                format_community_event_time(event)
                filtered_events.append(event)

        # Get all events
        events = community_events.get_events()

        for event in events:
            format_community_event_time(event)

        events.sort(key=lambda x: x.get("starts_at", ""))

        return flask.render_template(
            "community/events.html",
            featured_events=filtered_events[:2],  # Limit to 2 featured events
            events=events,
        )

    return display_community_events


def community_landing_page(
    community_events, local_communities, ubuntu_weekly_newsletter
):
    def display_community_landing_page():
        featured_events = community_events.get_featured_events()
        events_to_display = []

        # If there are less than 4 featured events,
        # fill the rest with regular events
        if len(featured_events) < 4:
            events_data = community_events.get_events()
            needed_events = 4 - len(featured_events)
            events_to_display.extend(featured_events)

            featured_event_ids = {event.get("id") for event in featured_events}
            regular_events = [
                event
                for event in events_data
                if event.get("id") not in featured_event_ids
            ]

            events_to_display.extend(regular_events[:needed_events])
            events_to_display.sort(key=lambda x: x.get("starts_at", ""))
        else:
            events_to_display = featured_events[:4]

        for event in events_to_display:
            format_community_event_time(event)

        communities_data = local_communities.get_category_index_metadata(
            "locos"
        )
        newsletter_data = ubuntu_weekly_newsletter.get_topics_in_category()

        return flask.render_template(
            "community/index.html",
            featured_events=events_to_display,
            communities=communities_data,
            newsletters=newsletter_data[:3],  # Limit to 3 newsletters
        )

    return display_community_landing_page


def build_ubuntu_weekly_newsletter(ubuntu_weekly_newsletter):
    def display_ubuntu_weekly_newsletter(path=None):
        """
        Display the Ubuntu Weekly Newsletter.
        """
        newsletter_list = ubuntu_weekly_newsletter.get_topics_in_category()

        # Clean up newsletter titles and filter out non UWN issues
        filtered_newsletters = []
        for newsletter in newsletter_list:
            if newsletter.get("title", "").startswith(
                "Ubuntu Weekly Newsletter Issue"
            ):
                modified_newsletter = {
                    **newsletter,
                    "title": newsletter["title"]
                    .replace("Ubuntu Weekly Newsletter", "UWN", 1)
                    .strip(),
                }
                filtered_newsletters.append(modified_newsletter)

        # Handle the landing page
        if path is None:
            path = "/"

        # Handle pages from different categories
        # We hardcode the topic ID as the path e.g. /t/12345
        if path.startswith("t/"):
            topic_id = path.split("t/")[1]
            target_page = ubuntu_weekly_newsletter.get_topic_by_id(topic_id)
        else:
            target_page = ubuntu_weekly_newsletter.get_topic(path)

        return flask.render_template(
            "community/uwn.html",
            newsletters_list=filtered_newsletters[
                :20
            ],  # Limit to 20 newsletters
            newsletter_data=target_page,
        )

    return display_ubuntu_weekly_newsletter
