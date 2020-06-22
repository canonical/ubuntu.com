#! /usr/bin/env python3

# Standard library
import argparse
import os
from http.cookiejar import MozillaCookieJar

# Packages
from macaroonbakery import httpbakery


parser = argparse.ArgumentParser(description="Helper script to delete USNs")
parser.add_argument("usn_ids", action="store", nargs="+", type=str)
parser.add_argument(
    "--host", action="store", type=str, default="http://localhost:8001"
)
args = parser.parse_args()


client = httpbakery.Client(cookies=MozillaCookieJar(".login"))

if os.path.exists(client.cookies.filename):
    client.cookies.load(ignore_discard=True)

base_endpoint = f"{args.host}/security/notices"

# Make a first call to make sure we are logged in
response = client.request("POST", url=base_endpoint)
client.cookies.save(ignore_discard=True)

# Delete each of the USN's
for usn_id in args.usn_ids:
    response = client.request(
        method="DELETE",
        url=f"{base_endpoint}/{usn_id}",
    )

    print(response, response.text)
