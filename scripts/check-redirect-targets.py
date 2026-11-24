#!/usr/bin/env python3
"""
Check where the internal redirect targets in redirects.yaml and
permanent-redirects.yaml actually go.

A target that returns 404 sends visitors and crawlers to a dead page; a
target that is itself a redirect makes a chain, which wastes a hop (and, if
the first hop is a 302, delays consolidation in search engines).

Targets with {placeholders} are skipped, as they depend on the request.

Usage:
    python3 scripts/check-redirect-targets.py [BASE_URL]

BASE_URL defaults to https://ubuntu.com. Exits 1 if any target is broken
(4xx/5xx or unreachable); chains are only reported.
"""

import re
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urljoin

import requests
import yaml

ROOT = Path(__file__).resolve().parent.parent
FILES = ("redirects.yaml", "permanent-redirects.yaml")
EXTERNAL = re.compile(r"^(https?:)?//")


def internal_targets():
    targets = set()

    for filename in FILES:
        path = ROOT / filename

        if not path.is_file():
            continue

        for target in (yaml.safe_load(path.read_text()) or {}).values():
            if isinstance(target, str) and "{" not in target:
                if not EXTERNAL.match(target):
                    targets.add(target)

    return sorted(targets)


def check(base_url, target):
    url = urljoin(base_url, target)

    try:
        response = requests.head(url, allow_redirects=False, timeout=20)
    except requests.RequestException as error:
        return target, None, str(error)

    return target, response.status_code, response.headers.get("Location", "")


def main():
    base_url = sys.argv[1] if len(sys.argv) > 1 else "https://ubuntu.com"
    broken = []
    chains = []

    with ThreadPoolExecutor(max_workers=8) as pool:
        for target, status, detail in pool.map(
            lambda target: check(base_url, target), internal_targets()
        ):
            if status is None or status >= 400:
                broken.append((target, status, detail))
            elif 300 <= status < 400:
                chains.append((target, status, detail))

    for target, status, detail in broken:
        print(f"BROKEN {status} {target} {detail}")

    for target, status, detail in chains:
        print(f"CHAIN  {status} {target} -> {detail}")

    print(f"{len(broken)} broken, {len(chains)} chained")

    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
