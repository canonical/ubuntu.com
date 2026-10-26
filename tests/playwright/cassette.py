"""
Serve the Discourse data-explorer requests behind /engage from a recorded
VCR.py cassette, so the Playwright tests can drive a real server without
Discourse credentials. The data-explorer endpoint is the only Discourse
endpoint that needs an admin API key; requests to any other endpoint or
host go to the network as normal.

One file, two roles:

* Playback: a gunicorn config file. With
  GUNICORN_CMD_ARGS="-c tests/playwright/cassette.py" in the environment
  (the Playwright CI job writes it to .env.local), every worker replays
  the cassette for the life of the process.

* Recording: a script. `dotrun exec python3 -m tests.playwright.cassette`
  serves the site single-process on port 8001 inside a recording cassette
  and writes it on Ctrl+C. See "Playwright cassette" in HACKING.md.
"""

import os

CASSETTE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "cassettes", "engage.yaml"
)
DATA_EXPLORER_HOST = "discourse.ubuntu.com"
DATA_EXPLORER_PATH = "/admin/plugins/explorer/"
SCRUBBED_RESPONSE_HEADERS = ("set-cookie", "x-discourse-username")


def data_explorer_only(request):
    """
    before_record_request hook. Returning None makes VCR ignore the
    request entirely: it is neither recorded nor replayed.
    """
    if request.host == DATA_EXPLORER_HOST and request.path.startswith(
        DATA_EXPLORER_PATH
    ):
        return request
    return None


def scrub_response(response):
    """
    before_record_response hook. Transient failures (rate limiting, server
    errors) are skipped so they never end up in the recording; otherwise
    response headers that identify the API user or its session are
    dropped before the interaction is written to disk.
    """
    code = response.get("status", {}).get("code", 0)
    if code == 429 or code >= 500:
        return None
    headers = response.get("headers", {})
    for name in list(headers):
        if name.lower() in SCRUBBED_RESPONSE_HEADERS:
            del headers[name]
    return response


def cassette(record_mode):
    # Imported here, not at module level: gunicorn executes this file in
    # the master before the gevent worker monkey-patches ssl, and vcr
    # pulls in urllib3 and ssl
    import vcr

    recorder = vcr.VCR(
        record_mode=record_mode,
        # The data-explorer endpoint is a single POST URL whose filters
        # live in the body, so the body has to take part in matching
        match_on=["method", "uri", "body"],
        filter_headers=[
            "Authorization",
            "Cookie",
            "Api-Key",
            "X-Discourse-Username",
            "Api-Username",
        ],
        filter_query_parameters=["key", "api_key", "api_username"],
        before_record_request=data_explorer_only,
        before_record_response=scrub_response,
    )
    return recorder.use_cassette(CASSETTE, allow_playback_repeats=True)


def post_worker_init(worker):
    # Playback writes nothing, so the cassette is never exited. The
    # context object owns vcr's patches and must outlive this call, or
    # the garbage collector unwinds them mid-run, so it lives on the
    # worker.
    worker.cassette = cassette("none")
    worker.cassette.__enter__()


if __name__ == "__main__":
    from webapp.app import app

    with cassette("all"):
        app.run(host="0.0.0.0", port=8001)
