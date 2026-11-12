#!/usr/bin/env bash
# Smoke test for scripts/notify-dead-links.sh.
#
# Puts a fake `curl` on PATH so webbot is never contacted. The report's parent
# page is an unreachable local port, so link_report.py makes no network calls.
# Run with: bash tests/shell/test-notify-dead-links.sh

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TARGET="${REPO_ROOT}/scripts/notify-dead-links.sh"

STUB_DIR="$(mktemp -d)"
trap 'rm -rf "$STUB_DIR"' EXIT

# Records the arguments and request body, and answers like webbot does.
cat > "${STUB_DIR}/curl" <<'STUB'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$STUB_LOG"
out=""
prev=""
for arg in "$@"; do
  [ "$prev" = "--output" ] && out="$arg"
  [ "$prev" = "--data" ] && cp "${arg#@}" "$STUB_PAYLOAD"
  prev="$arg"
done
[ "${STUB_CURL_EXIT:-0}" -ne 0 ] && exit "$STUB_CURL_EXIT"
printf '{"sent":[{"username":"someone","pages":1,"links":1}],"unresolved":[],"resolved_owners":1,"widespread_links":%s,"dry_run":%s}' \
  "${STUB_WIDESPREAD:-0}" "${STUB_DRY_RUN:-false}" > "$out"
STUB
chmod +x "${STUB_DIR}/curl"

export STUB_LOG="${STUB_DIR}/log"
export STUB_PAYLOAD="${STUB_DIR}/payload.json"
REPORT="${STUB_DIR}/report.json"
echo '[{"url":"https://dead.example/x","result":"404 Not Found","parents":["http://127.0.0.1:9/page"]}]' > "$REPORT"

failures=0
status=0
output=""

run_notify() {
  : > "$STUB_LOG"
  rm -f "$STUB_PAYLOAD"
  output="$(PATH="${STUB_DIR}:${PATH}" bash "$TARGET" 2>&1)"
  status=$?
}

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "ok   - ${name}"
  else
    echo "FAIL - ${name}: expected '${expected}', got '${actual}'"
    printf '%s\n' "$output" | sed 's/^/       | /'
    failures=$((failures + 1))
  fi
}

contains() {
  local name="$1" haystack="$2" needle="$3"
  case "$haystack" in
    *"$needle"*) echo "ok   - ${name}" ;;
    *)
      echo "FAIL - ${name}: missing '${needle}'"
      printf '%s\n' "$haystack" | sed 's/^/       | /'
      failures=$((failures + 1))
      ;;
  esac
}

unset BOT_DEAD_LINKS_URL BOT_DEAD_LINKS_TOKEN LINK_CHECKER_NOTIFY_PAGE_OWNERS LINK_REPORT_PATH
export LINK_REPORT_PATH="$REPORT"

# 1. Without the webbot settings nothing is sent and the step still passes.
run_notify
check "unconfigured run exits 0" 0 "$status"
contains "unconfigured run says so" "$output" "not configured"
check "unconfigured run does not call curl" 0 "$(wc -l < "$STUB_LOG" | tr -d ' ')"

export BOT_DEAD_LINKS_URL="https://webbot.example/webhooks/dead-links"
export BOT_DEAD_LINKS_TOKEN="s3cret-token"

# 2. No report means there is nothing to send.
LINK_REPORT_PATH="${STUB_DIR}/missing.json" run_notify
check "missing report exits 0" 0 "$status"
contains "missing report says so" "$output" "No link report"
check "missing report does not call curl" 0 "$(wc -l < "$STUB_LOG" | tr -d ' ')"

# 3. With LINK_CHECKER_NOTIFY_PAGE_OWNERS=true a report is posted with the
# bearer token,
# without asking for a dry run.
export LINK_CHECKER_NOTIFY_PAGE_OWNERS=true
run_notify
check "successful run exits 0" 0 "$status"
contains "request goes to the webbot URL" "$(cat "$STUB_LOG")" "$BOT_DEAD_LINKS_URL"
contains "request carries the bearer token" "$(cat "$STUB_LOG")" "Authorization: Bearer s3cret-token"
contains "request has a time limit" "$(cat "$STUB_LOG")" "--max-time 60"
case "$output" in
  *"broken on many pages"*) check "no widespread line without widespread links" absent present ;;
  *) check "no widespread line without widespread links" absent absent ;;
esac
STUB_WIDESPREAD=2 run_notify
contains "widespread links are counted" "$output" "2 link(s) broken on many pages"
contains "payload names the broken page" "$(cat "$STUB_PAYLOAD")" "http://127.0.0.1:9/page"
contains "payload defaults to web-alerts" "$(cat "$STUB_PAYLOAD")" '"room":"web-alerts"'
contains "run prints the counts" "$output" "Webbot sent 1 direct message(s)"
case "$output" in
  *someone*|*s3cret-token*) check "output has no usernames or secrets" clean leaked ;;
  *) check "output has no usernames or secrets" clean clean ;;
esac
case "$(cat "$STUB_PAYLOAD")" in
  *dry_run*) check "enabled run is not a dry run" absent present ;;
  *) check "enabled run is not a dry run" absent absent ;;
esac

# 4. Direct messages are opt-in: anything but "true" asks for a dry run.
for value in "" false TRUE 1 yes; do
  LINK_CHECKER_NOTIFY_PAGE_OWNERS="$value" run_notify
  contains "LINK_CHECKER_NOTIFY_PAGE_OWNERS='${value}' asks for a dry run" "$(cat "$STUB_PAYLOAD")" '"dry_run":true'
done
unset LINK_CHECKER_NOTIFY_PAGE_OWNERS
STUB_DRY_RUN=true run_notify
contains "unset LINK_CHECKER_NOTIFY_PAGE_OWNERS asks for a dry run" "$(cat "$STUB_PAYLOAD")" '"dry_run":true'
contains "a dry run is reported" "$output" "no direct messages sent"

# 5. A failing request fails the step.
STUB_CURL_EXIT=22 run_notify
check "failed request exits non-zero" 1 "$([ "$status" -ne 0 ] && echo 1 || echo 0)"

echo
if [ "$failures" -eq 0 ]; then
  echo "All notify-dead-links.sh tests passed."
else
  echo "${failures} test(s) failed."
fi
exit $(( failures > 0 ))
