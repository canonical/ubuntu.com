"""Build the LLM-friendly site index served at /llms.txt and /llms-full.txt.

``templates/llms.txt`` is hand-written and committed to git; it is the
source of truth for https://ubuntu.com/llms.txt (see https://llmstxt.org/).
``llms.yaml`` (repo root) lets the docs team bolt on extra curated link
sections - e.g. product docs sites that live outside this repo's own
template tree - without touching the manual file directly.

``llms-full.txt`` concatenates the full Markdown content (``?format=md``) of
every same-site page linked from llms.txt. It is generated at build time
(see ``_generate`` below, run in the ``pack-rock`` job of
``.github/workflows/deploy.yaml``) because rendering every page is too slow
to redo on every app worker's cold start.

CLI usage:
    python3 webapp/llms.py generate   # write templates/llms-full.txt
    python3 webapp/llms.py lint       # check llms.txt/llms.yaml formatting
"""

import logging
import os
import re
import sys

import yaml

logger = logging.getLogger(__name__)

BASE_URL = "https://ubuntu.com"
BASE_URL_LEN = len(BASE_URL)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_LLMS_TXT_PATH = os.path.join(REPO_ROOT, "templates", "llms.txt")
DEFAULT_LLMS_YAML_PATH = os.path.join(REPO_ROOT, "llms.yaml")
LLMS_FULL_TXT_PATH = os.path.join(REPO_ROOT, "templates", "llms-full.txt")

URL_RE = re.compile(r"^https?://")

# Path prefixes served live from Discourse (docs, tutorials, community and
# engage pages - see the Docs/Tutorials/Category/Events/EngagePages
# blueprint registrations in webapp/app.py) or from the security API
# (CVEs and USNs, which SecurityAPI fetches from ubuntu.com itself - see
# webapp/security/api.py), plus the Pro dashboard, which renders a
# logged-in account view and needs a real session. llms-full.txt must not
# fetch any of these: the build environment has no Discourse API
# keys/allowlisting, hitting the live security API mid-build is slow and
# flaky, and there's no logged-in session to render the dashboard with.
EXCLUDED_PATH_PREFIXES = (
    "/community",
    "/tutorials",
    "/ceph/docs",
    "/openstack/docs",
    "/security/livepatch/docs",
    "/security/certifications/docs",
    "/security/vulnerabilities",
    "/security/notices",
    "/security/cves",
    "/engage",
    "/takeovers",
    "/pro/dashboard",
)


def _clean(text):
    """Collapse whitespace in a title or description to a single line."""
    return re.sub(r"\s+", " ", text or "").strip()


def _load_extra_sections(llms_yaml_path):
    """Load curated extra link sections from llms.yaml.

    Returns a list of ``(heading, [links])`` tuples, where each link is a
    dict with ``title``, ``url`` and ``description``. Returns an empty list
    if the file is absent, empty or malformed - extras are purely additive,
    so a bad config never breaks the base llms.txt.
    """
    try:
        with open(llms_yaml_path) as config_file:
            config = yaml.load(config_file.read(), Loader=yaml.FullLoader)
    except (OSError, yaml.YAMLError):
        logger.exception("Failed to read %s", llms_yaml_path)
        return []

    sections = []
    for section in (config or {}).get("extra") or []:
        heading = _clean(section.get("heading"))
        links = []
        for link in section.get("links") or []:
            title = _clean(link.get("title"))
            url = (link.get("url") or "").strip()
            if title and url:
                links.append(
                    {
                        "title": title,
                        "url": url,
                        "description": _clean(link.get("description")),
                    }
                )
        if heading and links:
            sections.append((heading, links))
    return sections


def _render_sections(sections):
    """Render ``(heading, [links])`` tuples as llms.txt markdown lines."""
    lines = []
    for heading, links in sections:
        lines.append(f"## {heading}")
        lines.append("")
        for link in links:
            line = f"- [{link['title']}]({link['url']})"
            if link["description"]:
                line += f": {link['description']}"
            lines.append(line)
        lines.append("")
    return lines


def _insert_after_section(base, heading, extra):
    """Insert *extra* markdown right after the named ``##`` section.

    Falls back to appending at the end if *heading* isn't found in *base*.
    """
    extra = extra.rstrip("\n")

    heading_match = re.search(
        rf"^## {re.escape(heading)}\s*$", base, re.MULTILINE
    )
    if not heading_match:
        stripped_base = base.rstrip("\n")
        return f"{stripped_base}\n\n{extra}\n"

    after_heading = heading_match.end()
    next_heading = re.search(r"^## ", base[after_heading:], re.MULTILINE)
    if not next_heading:
        stripped_base = base.rstrip("\n")
        return f"{stripped_base}\n\n{extra}\n"

    insert_at = heading_match.end() + next_heading.start()
    before, after = base[:insert_at], base[insert_at:]
    return f"{before}{extra}\n\n{after}"


def build_llms_txt(llms_txt_path, llms_yaml_path):
    """Return the full /llms.txt body: manual base plus curated extras.

    Extra sections are inserted right after "Main pages" so they stay near
    the top, ahead of context-limited crawlers that read from the top. If
    the base file itself can't be read, this degrades to a minimal header
    rather than raising - this is called at app import time (see
    webapp/app.py), so an unhandled error here would crash the whole app.
    """
    try:
        with open(llms_txt_path) as llms_txt_file:
            base = llms_txt_file.read().rstrip("\n") + "\n"
    except OSError:
        logger.exception("Failed to read %s", llms_txt_path)
        base = "# Ubuntu\n"

    sections = _load_extra_sections(llms_yaml_path)
    if not sections:
        return base

    extra = "\n".join(_render_sections(sections)).rstrip("\n") + "\n"
    return _insert_after_section(base, "Main pages", extra)


_LINK_RE = re.compile(r"^-\s+\[(?P<title>[^\]]+)\]\((?P<url>[^)]+)\)")


def _iter_links(llms_txt_content):
    """Yield (title, url) for every markdown link bullet in *content*."""
    for line in llms_txt_content.splitlines():
        match = _LINK_RE.match(line.strip())
        if match:
            yield match.group("title"), match.group("url")


def _is_renderable(url):
    """True if *url* is safe to fetch for llms-full.txt.

    Must be a ``?format=md`` link on this site (the manual llms.txt already
    only marks a link that way when it renders from our own templates) and
    must not fall under a Discourse- or security-API-backed path - see
    EXCLUDED_PATH_PREFIXES.
    """
    if not url.startswith(BASE_URL) or "?format=md" not in url:
        return False
    path = url[BASE_URL_LEN:].split("?", 1)[0]
    return not any(
        path == prefix or path.startswith(prefix + "/")
        for prefix in EXCLUDED_PATH_PREFIXES
    )


def build_llms_full_txt(app, llms_txt_content):
    """Render every renderable page linked from *llms_txt_content* to Markdown.

    Pages on other domains, without ``?format=md``, or served live from
    Discourse or the security API (docs, tutorials, community, engage,
    CVEs, USNs) are skipped - see _is_renderable. A page that fails to
    render is skipped with a warning rather than failing the whole build.
    """
    client = app.test_client()
    parts = [
        "# Ubuntu",
        "",
        "> Full Markdown content of the pages listed in "
        f"{BASE_URL}/llms.txt. Product documentation, tutorials, community "
        "and engage pages, and the CVE/USN trackers are omitted here "
        "(follow their links in llms.txt instead) since they are served "
        "live from Discourse or the security API.",
    ]

    seen_urls = set()
    for title, url in _iter_links(llms_txt_content):
        if url in seen_urls or not _is_renderable(url):
            continue
        seen_urls.add(url)

        path = url[BASE_URL_LEN:]
        try:
            response = client.get(path, base_url=BASE_URL)
        except Exception:
            logger.exception("Skipping %s in llms-full.txt", path)
            continue

        if response.status_code != 200 or "markdown" not in (
            response.content_type or ""
        ):
            logger.warning(
                "Skipping %s in llms-full.txt (status %s)",
                path,
                response.status_code,
            )
            continue

        body = response.get_data(as_text=True).strip()
        if not body:
            continue

        parts.extend(
            ["", "---", "", f"# {title}", "", f"Source: {url}", "", body]
        )

    return "\n".join(parts).rstrip() + "\n"


def _generate():
    """Pre-generate llms-full.txt at build time.

    Renders every renderable page linked from llms.txt, which is too slow
    to redo on every app worker's cold start. Invoked from
    .github/workflows/deploy.yaml before `rockcraft pack`, so the file is
    baked into the image (it lives under templates/, which the rock
    primes).
    """
    # Imported lazily: webapp.app imports this module at startup, so
    # importing it back here at module load time would be circular. A
    # direct `python3 webapp/llms.py generate` invocation only puts
    # webapp/ itself on sys.path, not the repo root, so `webapp` isn't
    # importable as a package without this.
    sys.path.insert(0, REPO_ROOT)
    from webapp.app import LLMS_TXT, app

    content = build_llms_full_txt(app, LLMS_TXT)
    with open(LLMS_FULL_TXT_PATH, "w") as f:
        f.write(content)
    print(f"generated {LLMS_FULL_TXT_PATH} ({len(content)} bytes)")
    return 0


def lint_llms_yaml(llms_yaml_path=DEFAULT_LLMS_YAML_PATH):
    """Return (errors, warnings) checking llms.yaml's formatting.

    Errors: invalid YAML; a section missing its heading or links; a link
    missing a title, absolute url or description; two links sharing a url
    or description (usually a copy-paste slip).
    """
    if not os.path.exists(llms_yaml_path):
        return [f"{llms_yaml_path}: not found"], []

    with open(llms_yaml_path) as config_file:
        try:
            config = yaml.load(config_file.read(), Loader=yaml.FullLoader)
        except yaml.YAMLError as error:
            return [f"llms.yaml: invalid YAML ({error})"], []

    extra = (config or {}).get("extra")
    if extra is None:
        return [], []
    if not isinstance(extra, list):
        return ["llms.yaml: 'extra' must be a list of sections"], []

    errors = []
    seen_urls = {}
    seen_descriptions = {}
    for i, section in enumerate(extra):
        heading = (section.get("heading") or "").strip()
        prefix = f"llms.yaml: extra[{i}] ({heading or '?'})"
        if not heading:
            errors.append(f"{prefix}: missing heading")

        links = section.get("links") or []
        if not links:
            errors.append(f"{prefix}: no links")

        for j, link in enumerate(links):
            label = f"{prefix}[{j}]"
            title = (link.get("title") or "").strip()
            url = (link.get("url") or "").strip()
            description = (link.get("description") or "").strip()

            if not title:
                errors.append(f"{label}: missing title")
            if not url:
                errors.append(f"{label}: missing url")
            elif not URL_RE.match(url):
                errors.append(f"{label}: url must be absolute ({url})")
            if not description:
                errors.append(f"{label}: missing description")

            if url:
                if url in seen_urls:
                    errors.append(
                        f"{label}: url duplicated from {seen_urls[url]}"
                    )
                else:
                    seen_urls[url] = label

            if description:
                key = description.lower()
                if key in seen_descriptions:
                    errors.append(
                        f"{label}: description duplicated from "
                        f"{seen_descriptions[key]}"
                    )
                else:
                    seen_descriptions[key] = label

    return errors, []


def lint_llms_txt(llms_txt_path=DEFAULT_LLMS_TXT_PATH):
    """Return (errors, warnings) checking templates/llms.txt's formatting.

    Errors: missing "# Title"/"> description" header; missing a "## Main
    pages" section (build_llms_txt inserts llms.yaml's extra sections
    right after it, so a missing heading means they silently end up at
    the bottom instead); a section with no links; a malformed or
    non-absolute link. Warnings: a url repeated across sections.
    """
    if not os.path.exists(llms_txt_path):
        return [f"{llms_txt_path}: not found"], []

    with open(llms_txt_path) as llms_txt_file:
        content = llms_txt_file.read()

    errors = []
    warnings = []

    non_empty = [line for line in content.splitlines() if line.strip()]
    if not non_empty or not non_empty[0].startswith("# "):
        errors.append("llms.txt: must start with a '# Title' heading")
    if len(non_empty) < 2 or not non_empty[1].startswith(">"):
        errors.append(
            "llms.txt: must have a '> description' line after the title"
        )
    if not re.search(r"^## Main pages\s*$", content, re.MULTILINE):
        errors.append(
            "llms.txt: missing a '## Main pages' section - extra links "
            "from llms.yaml are inserted right after it"
        )

    section = None
    section_links = 0
    seen_urls = {}

    def close_section():
        if section is not None and section_links == 0:
            errors.append(f"llms.txt: '## {section}' has no links")

    for line in content.splitlines():
        heading_match = re.match(r"^## (.+)$", line)
        if heading_match:
            close_section()
            section = heading_match.group(1).strip()
            section_links = 0
            continue

        stripped = line.strip()
        if not stripped.startswith("- "):
            continue

        link_match = _LINK_RE.match(stripped)
        if not link_match:
            errors.append(
                f"llms.txt: malformed link bullet under "
                f"'{section}': {stripped!r}"
            )
            continue

        section_links += 1
        url = link_match.group("url")
        if not URL_RE.match(url):
            errors.append(
                f"llms.txt: url must be absolute under '{section}' ({url})"
            )
        elif url in seen_urls:
            warnings.append(
                f"llms.txt: url repeated in '{section}' and "
                f"'{seen_urls[url]}' ({url})"
            )
        else:
            seen_urls[url] = section

    close_section()

    return errors, warnings


def _lint():
    """Lint templates/llms.txt and llms.yaml; errors fail the build."""
    errors = []
    warnings = []

    for lint in (lint_llms_yaml, lint_llms_txt):
        file_errors, file_warnings = lint()
        errors.extend(file_errors)
        warnings.extend(file_warnings)

    for warning in warnings:
        print(f"warning: {warning}")
    for error in errors:
        print(f"error: {error}")

    if errors:
        print(f"\nllms lint: {len(errors)} error(s)")
        return 1

    suffix = f" ({len(warnings)} warning(s))" if warnings else ""
    print(f"llms lint: OK{suffix}")
    return 0


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("generate", "lint"):
        print("usage: python3 webapp/llms.py {generate|lint}", file=sys.stderr)
        return 1
    return _generate() if sys.argv[1] == "generate" else _lint()


if __name__ == "__main__":
    sys.exit(main())
