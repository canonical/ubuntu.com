import logging

# Suppress noisy VCR cassette debug output in test runs
logging.getLogger("vcr.cassette").setLevel(logging.WARNING)
logging.getLogger("vcr.request").setLevel(logging.WARNING)
