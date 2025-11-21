# Canonical Cookie Service Integration

A Flask extension for integrating with the Canonical shared cookie consent service. This package handles user consent preferences, session management, and synchronization with a central cookie service.

## Installation

```bash
pip install canonicalwebteam.cookie_service
```

Or add to your `requirements.txt`:
```
canonicalwebteam.cookie_service
```

### Frontend Dependency

This package requires the [cookie-policy](https://github.com/canonical/cookie-policy/) npm package (version 4.8.0 or above) for client-side cookie management:

## Quick Start

```python
from flask import Flask
from canonicalwebteam.cookie_service import CookieConsent

app = Flask(__name__)

# Required: Configure Flask session
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=365)
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True
# Set to false for local development (or just use dynamic app.debug)
app.config["SESSION_COOKIE_SECURE"] = True

# Required: Set up cache functions (see Cache Integration section)
def get_cache(key):
    return your_cache.get(key)

def set_cache(key, value, timeout):
    your_cache.set(key, value, timeout)

# Initialize the cookie consent service
cookie_service = CookieConsent().init_app(
    app,
    get_cache_func=get_cache,
    set_cache_func=set_cache,
    start_health_check=True,  # Optional: default True
    auto_register_hooks=True,  # Optional: default True
)
```

## Configuration

### Required Environment Variables

```bash
export COOKIE_SERVICE_API_KEY="your-api-key-here"
```

### Optional Configuration

These can be set in your Flask app config and have the following defaults:

```python
# URL of the central cookie service (default: production)
app.config["CENTRAL_COOKIE_SERVICE_URL"] = "https://cookies.canonical.com"

# Number of days before preference cookies expire (default: 365)
app.config["PREFERENCES_COOKIE_EXPIRY_DAYS"] = 365
```

## Cache Integration

The package requires integration with a caching system to store the health check status of the cookie service. This prevents excessive API calls and improves performance.

### Cache Function Requirements

You must provide two functions:

#### `get_cache_func(key)`
Retrieves a value from the cache.
- **Parameters:** `key` (str) - The cache key
- **Returns:** The cached value or `None` if not found

#### `set_cache_func(key, value, timeout)`
Stores a value in the cache with a timeout.
- **Parameters:**
  - `key` (str) - The cache key
  - `value` (any) - The value to cache
  - `timeout` (int) - TTL in seconds

#### Using Flask-Caching:
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

def get_cache(key):
    return cache.get(key)

def set_cache(key, value, timeout):
    cache.set(key, value, timeout=timeout)
```

## Initialization Parameters

### `init_app(app, get_cache_func, set_cache_func, start_health_check=True, auto_register_hooks=True)`

#### Required Parameters:
- **`app`**: Flask application instance
- **`get_cache_func`**: Function to retrieve cached values (see Cache Integration)
- **`set_cache_func`**: Function to store cached values (see Cache Integration)

#### Optional Parameters:
- **`start_health_check`** (bool, default: `True`)
  - Starts a background thread that pings the cookie service every 15 seconds
  - The health status is cached and used to determine whether to redirect users to the service
  - Set to `False` to disable health checks (not recommended for production)
  - Common pattern: `start_health_check=not app.debug` (only run in production)

- **`auto_register_hooks`** (bool, default: `True`)
  - Automatically registers Flask `@before_request` and `@after_request` hooks
  - When `True`, the package handles session checks and cookie synchronization automatically
  - Set to `False` if you need manual control over the request/response cycle (advanced use case)

## How It Works

The system works by creating a session within the central service with an ID. This same session is created on each site the user visits, creating an association. This ID can then be used to fetch preferences.

### 1. Session Creation Flow

1. User visits your site
2. The `@before_request` hook checks if the cookie service is health and a session exists
3. If no session exists, user is redirected to the central cookie service
4. The cookie service creates a session and redirects back to `/cookies/callback?code=...`
5. The callback exchanges the code for a `user_uuid` and stores it in the session
6. User is redirected back to their original destination

### 2. Preference Synchronization

The `@after_request` hook:
1. Checks if the `_cookies_accepted_ts` is over 1 day old
1. If it is, fetches the user's consent preferences from the service
2. Syncs preferences to local cookies (`_cookies_accepted`)

## Routes Provided

The package automatically registers the following routes under `/cookies`:

- **`/cookies/callback`** - Handles OAuth-style callback from the central service
- **`/cookies/get-preferences`** - API endpoint to fetch current user's preferences
- **`/cookies/set-preferences`** - API endpoint to update current user's preferences (called by cookie-policy package)

## Cookies Set by This Package

| Cookie Name | Purpose | Lifetime | Attributes |
|-------------|---------|----------|------------|
| `session` | Flask session containing `user_uuid` | 365 days | HttpOnly, Secure, SameSite=Lax |
| `_cookies_accepted` | User's consent preferences | 365 days | Secure, SameSite=Lax |
| `_cookies_accepted_ts` | Timestamp of last preference update | 365 days | Secure, SameSite=Lax |
| `_cookies_service_up` | Indicates if service is healthy | Session | Secure, SameSite=Lax |
| `_cookies_redirect_completed` | Prevents redirect loops | Session | Secure, SameSite=Lax |

## Advanced Usage

### Manual Hook Registration

If you need more control over the request/response cycle, you can set `auto_register_hooks=False`.
This allows you to define custom cycle hooks:

```python
from canonicalwebteam.cookie_service.helpers import (
    check_session_and_redirect,
    sync_preferences_cookie,
)

@app.before_request
def my_before_request():
    # Your custom logic here
    response = check_session_and_redirect()
    if response:
        return response

@app.after_request
def my_after_request(response):
    # Your custom logic here
    response = sync_preferences_cookie(response)
    return response
```

## Support

- Report issues: [GitHub Issues](https://github.com/canonical/canonicalwebteam.cookie_service/issues)
- Reach out to Web Engineering.

