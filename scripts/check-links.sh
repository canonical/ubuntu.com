#!/usr/bin/env bash
# check-links.sh — run LinkChecker with retry logic for transient failures.
#
# Usage:
#   ./scripts/check-links.sh <linkchecker-config> <URL> [URL...]
#
# Links that fail on the first pass are rechecked on their own (no
# recursion) up to 3 times with an exponential backoff, since some links
# are fickle and return a transient error rather than being truly broken.
#
# Examples:
#   ./scripts/check-links.sh .linkchecker/live-links/linkcheckerrc https://ubuntu.com
#   ./scripts/check-links.sh .linkchecker/blog-links/linkcheckerrc https://ubuntu.com/blog

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <linkchecker-config> <URL> [URL...]" >&2
  exit 2
fi

CONFIG="$1"
shift
TARGET_URLS=("$@")

runtime_error() {
  echo "LinkChecker failed unexpectedly. See the output above for details." >&2
  exit 2
}

# Print the unique failed URLs (valid=False) from a linkchecker CSV.
extract_failed() {
  python3 - "$1" <<'PY'
import csv
import sys

seen = set()
with open(sys.argv[1], newline="") as f:
    rows = (line for line in f if not line.startswith("#"))
    for row in csv.DictReader(rows, delimiter=";"):
        if row.get("valid", "").strip().lower() == "false":
            url = (row.get("url") or "").strip()
            if url and url not in seen:
                seen.add(url)
                print(url)
PY
}

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

if linkchecker \
    --config "$CONFIG" \
    --no-warning \
    -F "csv/${WORK_DIR}/failed-links.csv" \
    "${TARGET_URLS[@]}"; then
  echo "No broken links found."
  exit 0
else
  checker_status=$?
fi

[ "$checker_status" -eq 1 ] || runtime_error
extract_failed "${WORK_DIR}/failed-links.csv" > "${WORK_DIR}/current-urls.txt" || runtime_error
[ -s "${WORK_DIR}/current-urls.txt" ] || runtime_error

attempt=1
max_attempts=3
delay=60

# Re-check only the previously failed links
while [ "$attempt" -le "$max_attempts" ] && [ -s "${WORK_DIR}/current-urls.txt" ]; do
  echo "Attempt $attempt/$max_attempts: rechecking $(wc -l < "${WORK_DIR}/current-urls.txt") link(s) after ${delay}s"
  sleep "$delay"

  mapfile -t urls < "${WORK_DIR}/current-urls.txt"
  retry_csv="${WORK_DIR}/retry-${attempt}.csv"
  if linkchecker \
      --config "$CONFIG" \
      --no-warning \
      --recursion-level=0 \
      --timeout=30 \
      -F "csv/${retry_csv}" \
      "${urls[@]}"; then
    echo "All remaining links resolved on attempt $attempt."
    exit 0
  else
    checker_status=$?
  fi

  [ "$checker_status" -eq 1 ] || runtime_error
  extract_failed "$retry_csv" > "${WORK_DIR}/next-urls.txt" || runtime_error
  [ -s "${WORK_DIR}/next-urls.txt" ] || runtime_error
  mv "${WORK_DIR}/next-urls.txt" "${WORK_DIR}/current-urls.txt"
  attempt=$((attempt + 1))
  delay=$((delay * 2))
done

echo "Links still broken after $max_attempts attempts:"
cat "${WORK_DIR}/current-urls.txt"
exit 1
