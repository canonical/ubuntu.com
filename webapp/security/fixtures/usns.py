#! /usr/bin/env python3

# Standard library
import argparse
import json

# Packages
from macaroonbakery import httpbakery


parser = argparse.ArgumentParser(description="CLI to post USNs")
parser.add_argument("file_path", action="store", type=str)
parser.add_argument(
    "--host", action="store", type=str, default="http://localhost:8001"
)
args = parser.parse_args()


client = httpbakery.Client()
notice_endpoint = f"{args.host}/security/notices"
# Make a first call to make sure we are logged in
response = client.request("POST", url=notice_endpoint)


with open(args.file_path) as usn_json:
    payload = json.load(usn_json).items()
    for notice_id, notice in payload:
        response = client.request("POST", url=notice_endpoint, json=notice)
        print(response, response.text)
