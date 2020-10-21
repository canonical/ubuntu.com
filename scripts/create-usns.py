#! /usr/bin/env python3

# Standard library
import argparse
import json
import os
from datetime import datetime
from http.cookiejar import MozillaCookieJar

# Packages
from macaroonbakery import httpbakery


def guess_binary_links(binary, version, sources):
    """Guess links to the source package based on binary package and version.

    Keyword Arguments:
    binary -- the name of the binary
    version -- the version of the binary
    sources -- a dictionary of source package names to source package versions
    """
    match_first = False
    source_match = None
    version_match = None
    source_link = None
    version_link = None

    if not sources:
        # Old USNs may not have any sources listed. We can't make any sort of a
        # guess in this situation.
        return (None, None)
    if len(sources) == 1:
        # There's a many-to-one mapping of binaries to a source package. Use
        # the only possible source package for all binaries.
        match_first = True
    elif not version:
        # There are multiple combinations of possible binary to source package
        # mappings. We can't make an educated guess if we don't have a valid
        # binary package version so don't attempt to construct a link.
        return (None, None)

    for source in sources:
        source_version = sources[source].get("version")
        if match_first or version == source_version:
            source_match = source
            version_match = source_version
            break

    if source_match:
        source_link = "https://launchpad.net/ubuntu/+source/" + source_match
        if version_match:
            # Be certain to use the source package version rather than the
            # binary package version here or the link will be broken for
            # certain packages
            version_link = source_link + "/" + version_match

    return (source_link, version_link)


parser = argparse.ArgumentParser(description="CLI to post USNs")
parser.add_argument("file_path", action="store", type=str)
parser.add_argument("--update", action="store_true", default=False)
parser.add_argument(
    "--host", action="store", type=str, default="http://localhost:8001"
)
args = parser.parse_args()


client = httpbakery.Client(cookies=MozillaCookieJar(".login"))

if os.path.exists(client.cookies.filename):
    client.cookies.load(ignore_discard=True)

notice_endpoint = f"{args.host}/security/notices"
http_method = "PUT" if args.update else "POST"

# Make a first call to make sure we are logged in
response = client.request(http_method, url=notice_endpoint)
client.cookies.save(ignore_discard=True)


with open(args.file_path) as usn_json:
    payload = json.load(usn_json).items()

    for notice_id, notice in payload:
        # format release_packages
        release_packages = {}

        for codename, packages in notice["releases"].items():
            release_packages[codename] = []
            for name, info in packages["sources"].items():
                release_packages[codename].append(
                    {
                        "name": name,
                        "version": info["version"],
                        "description": info["description"],
                        "is_source": "true",
                    }
                )

            for name, info in packages["binaries"].items():
                source_link, version_link = guess_binary_links(
                    name, info["version"], packages["sources"]
                )
                release_packages[codename].append(
                    {
                        "name": name,
                        "version": info["version"],
                        "is_source": "false",
                        "source_link": source_link,
                        "version_link": version_link,
                    }
                )
        # format CVEs and references
        cves = []
        references = []
        for reference in notice["cves"]:
            if reference.startswith("CVE-"):
                cves.append(reference)
            else:
                references.append(reference)

        # Build endpoint
        endpoint = notice_endpoint
        if http_method == "PUT":
            endpoint = f"{notice_endpoint}/USN-{notice['id']}"

        response = client.request(
            http_method,
            url=endpoint,
            json={
                "id": f"USN-{notice['id']}",
                "description": notice["description"],
                "references": references,
                "cves": cves,
                "release_packages": release_packages,
                "title": notice["title"],
                "published": datetime.fromtimestamp(
                    notice["timestamp"]
                ).isoformat(),
                "summary": notice["summary"],
                "instructions": notice.get("action"),
            },
        )
        print(response, response.text)
