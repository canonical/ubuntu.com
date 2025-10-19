from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address
)

search_limit = limiter.shared_limit(
    ["10 per minute", "500 per hour"],
    scope="search"
)

@limiter.error_handler
def ratelimit_exceeded(e):
    return {"error": "Too many searches. Please try again later."}, 429