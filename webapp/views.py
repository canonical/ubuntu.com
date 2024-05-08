# Standard library
import datetime
import html
import math
import os
import re
import json

# Packages
import dateutil
import feedparser
import flask
import talisker.requests
import yaml
import jinja2
from ubuntu_release_info.data import Data
from geolite2 import geolite2
from requests import Session
from requests.exceptions import HTTPError
from urllib.parse import quote

from canonicalwebteam.search.models import get_search_results
from canonicalwebteam.search.views import NoAPIKeyError
from bs4 import BeautifulSoup
from werkzeug.exceptions import BadRequest
from canonicalwebteam.discourse import (
    DiscourseAPI,
    Docs,
    DocParser,
)


# Local
from webapp.login import user_info
from webapp.marketo import MarketoAPI

ip_reader = geolite2.reader()
session = talisker.requests.get_session()

marketo_session = Session()
talisker.requests.configure(marketo_session)
marketo_api = MarketoAPI(
    "https://066-EOV-335.mktorest.com",
    os.getenv("MARKETO_API_CLIENT"),
    os.getenv("MARKETO_API_SECRET"),
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


def sixteen_zero_four():
    total_notices_issued = "0"
    latest_notices = []

    try:
        response = session.request(
            method="GET",
            url=(
                "https://ubuntu.com/security/"
                "notices.json?release=xenial&limit=5"
            ),
        )

        total_notices_issued = response.json().get("total_results")
        latest_notices = [
            {
                "id": notice.get("id"),
                "title": notice.get("title"),
                "date": dateutil.parser.parse(
                    notice.get("published")
                ).strftime("%d %B %Y"),
                "summary": notice.get("summary"),
            }
            for notice in response.json().get("notices")
        ]
    except HTTPError:
        flask.current_app.extensions["sentry"].captureException()

    # Can only assume there were 1477 notices before ESM
    notices_since_esm = total_notices_issued - 1477
    context = {
        "latest_notices": latest_notices,
        "notices_since_esm": notices_since_esm,
    }

    return flask.render_template("16-04/index.html", **context)


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
        "multipass": "download/server/multipass.html",
        "choose": "download/server/choose.html",
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


def appliance_portfolio():
    with open("appliances.yaml") as appliances:
        appliances = yaml.load(appliances, Loader=yaml.FullLoader)

    return flask.render_template(
        "appliance/portfolio.html",
        http_host=flask.request.host,
        appliances=appliances["appliances"],
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
        search_api_key = os.getenv("SEARCH_API_KEY")

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
        posts_per_page = 15
        metadata = engage_docs.get_index()

        resource_types = []
        tags_list = set()
        for item in metadata:
            if "type" in item and item["type"] not in resource_types:
                resource_types.append(item["type"])
            if "tags" in item and item["tags"] != "":
                # Join 2 lists of tags without duplicates
                tags_list = tags_list | set(
                    item["tags"].replace(" ", "").split(",")
                )

        tags_list = sorted(list(tags_list))

        if preview is None:
            metadata = [
                item
                for item in metadata
                if "active" in item and item["active"] == "true"
            ]

        if language:
            new_metadata = []
            for item in metadata:
                if "language" in item:
                    if item["language"] == language:
                        new_metadata.append(item)
                    elif language == "en" and item["language"] == "":
                        new_metadata.append(item)
                else:
                    break
            metadata = new_metadata

        if resource:
            metadata = [
                item
                for item in metadata
                if "type" in item and item["type"] == resource
            ]

        if tag:
            metadata = [
                element
                for element in metadata
                if "tags" in element
                and tag in element["tags"].replace(" ", "").split(",")
            ]

        total_pages = math.ceil(len(metadata) / posts_per_page)

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
            posts_per_page=posts_per_page,
            total_pages=total_pages,
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
            return flask.render_template(
                "engage/base.html",
                forum_url=engage_pages.api.base_url,
                metadata=metadata,
                language=metadata["language"],
                resource=metadata["type"],
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
        metadata = engage_pages.get_index()
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


def openstack_engage(engage_pages):
    def openstack_resource_data():
        metadata = engage_pages.get_index()

        resource_tags = [
            "openstack",
            "OpenStack",
            "Openstack",
            "charmedopenstack",
            "privatecloud",
        ]

        # filter for language, tags, publish_date
        filtered_metadata = []
        for item in metadata:
            if (
                "tags" in item
                and any(tag in item["tags"] for tag in resource_tags)
                and "en" in item["language"]
                and item["publish_date"] != ""
            ):
                filtered_metadata.append(item)

        # filter and seperate by type
        whitepapers_metadata = []
        webinars_metadata = []
        casestudies_metadata = []

        for item in filtered_metadata:
            if "whitepaper" in item["type"]:
                whitepapers_metadata.append(item)
            elif "webinar" in item["type"]:
                webinars_metadata.append(item)
            elif "case study" in item["type"]:
                casestudies_metadata.append(item)

        # only show the latest three
        whitepapers_metadata = whitepapers_metadata[:3]
        webinars_metadata = webinars_metadata[:3]
        casestudies_metadata = casestudies_metadata[:3]

        return flask.render_template(
            "openstack/resources.html",
            metadata=metadata,
            whitepapers_metadata=whitepapers_metadata,
            webinars_metadata=webinars_metadata,
            casestudies_metadata=casestudies_metadata,
        )

    return openstack_resource_data


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
            if topic in doc["categories"]
        ]

        tutorials = sorted(
            tutorials, key=lambda k: k["difficulty"], reverse=True
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

        date_now = datetime.datetime.now()

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
        values = flask.request.form.getlist(key)
        value = ", ".join(values)
        if value:
            form_fields[key] = value
            if "utm_content" in form_fields:
                form_fields["utmcontent"] = form_fields.pop("utm_content")
    # Check honeypot values are not set
    honeypots = {}
    honeypots["name"] = flask.request.form.get("name")
    honeypots["website"] = flask.request.form.get("website")

    # There is logically difference between None and empty string here.
    # 1. The first if check, we are working with a form that contains honeypots
    # or the legacy ones using recaptcha.
    # 2. The second that checks for empty string is actually testing if the
    # honeypots have been triggered

    if honeypots["name"] is not None and honeypots["website"] is not None:
        if honeypots["name"] != "" and honeypots["website"] != "":
            raise BadRequest("Unexpected honeypot fields (name, website)")
        else:
            form_fields["grecaptcharesponse"] = "no-recaptcha"
            form_fields.pop("website", None)
            form_fields.pop("name", None)

    form_fields.pop("thankyoumessage", None)
    form_fields.pop("g-recaptcha-response", None)
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
    referrer = flask.request.referrer
    client_ip = flask.request.headers.get(
        "X-Real-IP", flask.request.remote_addr
    )

    if client_ip and ":" not in client_ip:
        visitor_data["leadClientIpAddress"] = client_ip

    enrichment_fields = None

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

    try:
        ip_location = ip_reader.get(client_ip)
        if ip_location and "country" in ip_location:
            enrichment_fields["country"] = ip_location["country"]["iso_code"]
    except Exception:
        pass

    enriched_payload = {
        "formId": "4198",
        "input": [{"leadFormFields": enrichment_fields}],
    }

    try:
        # Send form data
        r = marketo_api.submit_form(payload)
        data = r.json()

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
        marketo_api.submit_form(enriched_payload).json()
    except Exception:
        pass

    if return_url:
        # Personalize thank-you page
        flask.session["form_details"] = {
            "name": flask.request.form.get("firstName"),
            "email": flask.request.form.get("email"),
        }
        return flask.redirect(return_url)

    if referrer:
        return flask.redirect(f"/thank-you?referrer={referrer}")
    else:
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

    _country = timezones[timezone]["c"][0]
    country = countries[_country]
    return flask.jsonify(
        {
            "country": country,
            "country_code": _country,
        }
    )


def get_user_country_by_ip():
    x_forwarded_for = flask.request.headers.get("X-Forwarded-For")

    if x_forwarded_for:
        client_ip = x_forwarded_for.split(",")[0]
    else:
        client_ip = flask.request.remote_addr

    ip_location = ip_reader.get(client_ip)

    try:
        country_code = ip_location["country"]["iso_code"]
    except KeyError:
        # geolite2 can't identify IP address
        country_code = None
    except Exception as error:
        # Errors not documented in the geolite2 module
        country_code = None
        flask.current_app.extensions["sentry"].captureException(
            extra={"ip_location object": ip_location, "error": error}
        )

    response = flask.jsonify(
        {
            "client_ip": client_ip,
            "country_code": country_code,
        }
    )
    response.cache_control.private = True

    return response


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
    return flask.render_template("templates/meganav/navigation-nojs.html")
