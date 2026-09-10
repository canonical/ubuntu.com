"""Build the LLM-friendly site index served at /llms.txt.

``templates/llms.txt`` is hand-written and committed to git; it is the
single source of truth for https://ubuntu.com/llms.txt (see
https://llmstxt.org/) - add or edit links directly in that file.

``templates/llms-full.txt``, served at /llms-full.txt, is also hand-written
and committed to git - see webapp/app.py.

CLI usage:
    task lint-llms       # check llms.txt formatting
"""

import logging
import os
import re
import sys

logger = logging.getLogger(__name__)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_LLMS_TXT_PATH = os.path.join(REPO_ROOT, "templates", "llms.txt")


def build_llms_txt(llms_txt_path):
    """Return the /llms.txt body, read straight from *llms_txt_path*.

    If the file can't be read, this degrades to a minimal header rather
    than raising - this is called at app import time (see webapp/app.py),
    so an unhandled error here would crash the whole app.
    """
    try:
        with open(llms_txt_path) as llms_txt_file:
            return llms_txt_file.read().rstrip("\n") + "\n"
    except (OSError, UnicodeDecodeError):
        logger.exception("Failed to read %s", llms_txt_path)
        return "# Ubuntu\n"


def lint_llms_txt(llms_txt_path=DEFAULT_LLMS_TXT_PATH):
    """Return (errors, warnings) checking templates/llms.txt's formatting.

    Errors: missing "# Title"/"> description" header; missing a "## Main
    pages" section; a section with no links; a malformed or non-absolute
    link. Warnings: a url repeated across sections.
    """
    link_re = re.compile(r"^-\s+\[(?P<title>[^\]]+)\]\((?P<url>[^)]+)\)")
    url_re = re.compile(r"^https?://")

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
        errors.append("llms.txt: missing a '## Main pages' section")

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

        link_match = link_re.match(stripped)
        if not link_match:
            errors.append(
                f"llms.txt: malformed link bullet under "
                f"'{section}': {stripped!r}"
            )
            continue

        section_links += 1
        url = link_match.group("url")
        if not url_re.match(url):
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
    """Lint templates/llms.txt; errors fail the build."""
    errors, warnings = lint_llms_txt()

    for warning in warnings:
        logger.warning(warning)
    for error in errors:
        logger.error(error)

    if errors:
        logger.error("llms lint: %d error(s)", len(errors))
        return 1

    logger.info(
        "llms lint: OK%s",
        f" ({len(warnings)} warning(s))" if warnings else "",
    )
    return 0


def main():
    logging.basicConfig(
        level=logging.INFO, format="%(levelname)s: %(message)s"
    )
    if len(sys.argv) != 2 or sys.argv[1] != "lint":
        logger.error("usage: python3 webapp/llms.py lint")
        return 1
    return _lint()


if __name__ == "__main__":
    sys.exit(main())
