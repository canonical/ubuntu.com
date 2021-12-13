# Standard library
import math
import os
import re
import html

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


def _build_mirror_list(local=False):
    # Build mirror list
    mirrors = []
    mirror_list = []

    try:
        with open(f"{os.getcwd()}/etc/ubuntu-mirrors-rss.xml") as rss:
            mirrors = feedparser.parse(rss.read()).entries
    except IOError:
        pass

    ip_location = ip_reader.get(
        flask.request.headers.get("X-Real-IP", flask.request.remote_addr)
    )

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
    if ip_location and "country" in ip_location:
        country_code = ip_location["country"]["iso_code"]

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
    host = "https://ubuntu.com"
    total_notices_issued = "-"
    total_cves_issued = "-"
    latest_notices = []

    try:
        response = session.request(
            method="GET",
            url=f"{host}/security/notices.json?release=xenial&limit=1",
        )

        total_notices_issued = response.json().get("total_results")
    except HTTPError:
        flask.current_app.extensions["sentry"].captureException()

    try:
        response = session.request(
            method="GET",
            url=(
                f"{host}/security/cves.json"
                f"?version=xenial&status=released&limit=1"
            ),
        )

        total_cves_issued = response.json().get("total_results")
    except HTTPError:
        flask.current_app.extensions["sentry"].captureException()

    try:
        response = session.request(
            method="GET",
            url=f"{host}/security/notices.json?release=xenial&limit=5",
        )

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

    notices_since_esm = total_notices_issued - 1477
    context = {
        "total_patches_applied": 69,  # hard-coded for now
        "total_notices_issued": f"{total_notices_issued:,}",
        "total_cves_issued": f"{total_cves_issued:,}",
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
        "step1": "download/server/step1.html",
        "step2": "download/server/step2.html",
        "choose": "download/server/choose.html",
        "download": "download/server/download.html",
    }
    context = {}
    step = flask.request.form.get("next-step") or "step1"

    if step not in templates:
        flask.abort(400)

    if step == "download":
        version = flask.request.form.get("version")

        if not version:
            flask.abort(400)

        context = {"version": version}

    return flask.render_template(templates[step], **context)


def download_thank_you(category):
    version = flask.request.args.get("version", "")
    architecture = flask.request.args.get("architecture", "").replace(" ", "+")

    if version and not architecture:
        flask.abort(400)

    return (
        flask.render_template(
            f"download/{category}/thank-you.html",
            version=version,
            architecture=architecture,
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


def mirrors_query():
    """
    A JSON endpoint to request list of Ubuntu mirrors
    """
    local = flask.request.args.get("local", default=False)

    if not local or local.lower() != "true":
        local = False
    else:
        local = True

    return (
        flask.jsonify(_build_mirror_list(local)),
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

        # The webteam's default custom search ID
        search_engine_id = "009048213575199080868:i3zoqdwqk8o"

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
        engage_docs.parser.parse()
        metadata = engage_docs.parser.metadata

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
            forum_url=engage_docs.parser.api.base_url,
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
        engage_pages.parser.parse()
        page_url = f"/engage/{page}"
        if language:
            page_url = f"/engage/{language}/{page}"
        index_topic_data = next(
            (x for x in engage_pages.parser.metadata if x["path"] == page_url),
            None,
        )

        if index_topic_data:
            topic_id = engage_pages.parser.url_map[page_url]
            engage_page_data = engage_pages.parser.get_topic(topic_id)
            request_url = flask.request.referrer
            resource_name = index_topic_data["type"]
            resource_url = engage_page_data["metadata"]["resource_url"]
            language = index_topic_data["language"]
            # Filter related engage pages by language
            related = [
                item
                for item in engage_page_data["related"]
                if item["language"] == language
            ]
            template_language = "engage/thank-you.html"
            if language and language != "en":
                template_language = f"engage/shared/_{language}_thank-you.html"

            return flask.render_template(
                template_language,
                request_url=request_url,
                resource_name=resource_name,
                resource_url=resource_url,
                related=related,
            )
        else:
            return flask.abort(404)

    return render_template


def openstack_install():
    """
    Openstack install docs
    Instructions for openstack installation pulled from Discourse
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

    singlenode_topic = openstack_install_docs.parser.api.get_topic(21427)
    singlenode_topic_soup = BeautifulSoup(
        singlenode_topic["post_stream"]["posts"][0]["cooked"],
        features="html.parser",
    )
    singlenode_content = openstack_install_parser._process_topic_soup(
        singlenode_topic_soup
    )
    openstack_install_docs.parser._replace_lightbox(singlenode_topic_soup)

    multinode_topic = openstack_install_docs.parser.api.get_topic(18259)
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


# Blog
# ===
class BlogView(flask.views.View):
    def __init__(self, blog_views):
        self.blog_views = blog_views


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


class BlogPressCentre(BlogView):
    def dispatch_request(self):
        page_param = flask.request.args.get("page", default=1, type=int)
        category_param = flask.request.args.get(
            "category", default="", type=str
        )
        context = self.blog_views.get_group(
            "canonical-announcements", page_param, category_param
        )

        return flask.render_template("blog/press-centre.html", **context)


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


def marketo_submit():
    form_fields = {}
    for key, value in flask.request.form.items():
        if value:
            form_fields[key] = value
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

    if "Comments_from_lead__c" in form_fields:
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

    payload = {
        "formId": form_fields.pop("formid"),
        "input": [
            {"leadFormFields": form_fields, "visitorData": visitor_data}
        ],
    }

    # Enrichment data for global enrichment form (id:4198)
    enrichment_fields = {"email": form_fields["email"]}
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
        data = marketo_api.submit_form(payload).json()

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
        return flask.redirect(return_url)

    if referrer:
        return flask.redirect(f"/thank-you?referrer={referrer}")
    else:
        return flask.redirect("/thank-you")


def thank_you():
    return flask.render_template(
        "thank-you.html", referrer=flask.request.args.get("referrer")
    )
