#!/usr/bin/env bash
# notify-dead-links.sh — send the check-links.sh report to webbot, so that the
# page owners are told about the broken links on their pages.
#
# Needs LINK_REPORT_PATH (the report written by check-links.sh),
# BOT_DEAD_LINKS_URL and BOT_DEAD_LINKS_TOKEN. Does nothing if any is missing.
#
# Direct messages are opt-in: unless LINK_CHECKER_NOTIFY_PAGE_OWNERS is exactly
# "true" (a repository variable, so it can be changed in the GitHub settings),
# webbot is asked for a dry run. It then sends no direct messages but still
# lists the copydocs whose owner it could not find.
#
# The CI logs are public, so no owner or secret is printed, only counts. The
# one other line is link_report.py's note about a page it could not fetch,
# which shows the page URL without its query string.

set -euo pipefail

if [ -z "${BOT_DEAD_LINKS_URL:-}" ] || [ -z "${BOT_DEAD_LINKS_TOKEN:-}" ]; then
  echo "Webbot is not configured, not notifying page owners."
  exit 0
fi

if [ ! -s "${LINK_REPORT_PATH:-}" ]; then
  echo "No link report found, not notifying page owners."
  exit 0
fi

payload="$(mktemp)"
response="$(mktemp)"
trap 'rm -f "$payload" "$response"' EXIT

args=()
if [ "${LINK_CHECKER_NOTIFY_PAGE_OWNERS:-}" != "true" ]; then
  args+=(--dry-run)
fi

python3 "$(dirname "$0")/link_report.py" "$LINK_REPORT_PATH" \
  ${args[@]+"${args[@]}"} > "$payload"

curl --fail --silent --show-error -X POST \
  -H "Authorization: Bearer ${BOT_DEAD_LINKS_TOKEN}" \
  -H "Content-Type: application/json" \
  --data @"$payload" \
  --output "$response" \
  "$BOT_DEAD_LINKS_URL"

python3 - "$response" <<'PY'
import json
import sys

with open(sys.argv[1]) as f:
    result = json.load(f)

note = " (dry run, no direct messages sent)" if result["dry_run"] else ""
print(
    f"Webbot sent {len(result['sent'])} direct message(s); "
    f"{result['resolved_owners']} owner(s) found, "
    f"{len(result['unresolved'])} copydoc(s) without a reachable owner{note}."
)
PY
