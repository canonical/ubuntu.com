from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

Limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@limiter.error_handler
def ratelimit_exceeded(e):
    return {"error": "Too many searches. Please try again later."}, 429