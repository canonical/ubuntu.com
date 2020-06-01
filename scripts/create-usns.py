#! /usr/bin/env python3

# Standard library
import argparse
import json
import os
from datetime import datetime
from http.cookiejar import MozillaCookieJar

# Packages
from macaroonbakery import httpbakery


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

        response = client.request(
            http_method,
            url=notice_endpoint,
            json={
                "id": notice["id"],
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
