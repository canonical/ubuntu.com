# ubuntu.com — Agent Guide

## Project Overview

Ubuntu.com is Canonical's main web presence — a high-traffic informational and e-commerce site built with a Flask backend and React frontend. It pulls content from Discourse, WordPress, and various APIs, and handles Ubuntu Pro subscriptions via Stripe.

## Tech Stack

- **Backend:** Python 3.10+, Flask, Jinja2 templates
- **Frontend:** React 18, TypeScript 5.5, Redux Toolkit, React Query, Vanilla Framework 4.x
- **Styling:** SCSS → Sass + PostCSS
- **Build:** esbuild (JS), Sass (CSS), Yarn, Taskfile
- **Testing:** unittest + VCR (Python), Jest (JS), Playwright (E2E), pa11y-ci (a11y), Percy (visual regression)
- **Deployment:** Docker → OCI Rock → Kubernetes via Juju charms

## Local Development

```bash
task              # Install deps + start dev server (http://127.0.0.1:8001)
task install      # Install Python venv and Node dependencies only
task shell        # Open shell with venv activated
yarn run watch    # Watch SCSS + JS for changes (separate terminal)
```

Dependencies: Python venv in `.venv/`, Node modules via Yarn.

Copy `.env` values to `.env.local` for local overrides (git-ignored).

## Build

```bash
yarn run build      # Build CSS and JS for production
yarn run build-css  # SCSS → static/css/
yarn run build-js   # TS/JS → static/js/dist/
```

## Testing

```bash
task test             # All Python + JS tests with coverage

yarn test-python      # Python unittest + VCR cassettes
yarn test-js          # Jest (TZ=UTC NODE_ICU_DATA=node_modules/full-icu jest)

# E2E (Playwright) — tests in tests/playwright/tests/
# Visual regression — Percy (percy snapshot snapshots.js)
# Accessibility — pa11y-ci
```

To re-record VCR HTTP cassettes: set `VCR_RECORD_MODE=all` in `.env.local`.

## Linting & Formatting

```bash
yarn run lint-python     # flake8 + black --check (line-length 79)
yarn run lint-js         # ESLint
yarn run lint-scss       # stylelint
yarn run lint-ts         # tsc --noEmit

yarn run format-python   # black --line-length 79
yarn run format-js       # prettier
```

All CI checks run on PRs via GitHub Actions (`.github/workflows/`).

## Key Files & Directories

| Path                | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `webapp/app.py`     | Flask app init, route registration (~1545 lines)   |
| `webapp/views.py`   | Core view functions (~2210 lines)                  |
| `webapp/`           | Python application modules                         |
| `webapp/certified/` | Ubuntu certification system                        |
| `webapp/shop/`      | Ubuntu Pro / Advantage subscriptions (Stripe)      |
| `webapp/security/`  | CVEs, security notices, Security API               |
| `templates/`        | Jinja2 HTML templates (72+ subdirectories)         |
| `static/js/src/`    | React components and TypeScript source             |
| `static/sass/`      | SCSS source files                                  |
| `static/css/`       | Built CSS (do not edit directly)                   |
| `static/js/dist/`   | Built JS (do not edit directly)                    |
| `tests/`            | Python unittests + VCR cassettes, Jest, Playwright |
| `navigation.yaml`   | Site nav structure and breadcrumbs                 |
| `releases.yaml`     | Ubuntu release metadata                            |
| `redirects.yaml`    | HTTP 302 URL redirects                             |
| `deleted.yaml`      | HTTP 310 deleted responses                         |
| `konf/site.yaml`    | Kubernetes deployment manifests                    |
| `charm/`            | Juju/Kubernetes charm config                       |

## External Service Dependencies

| Service                      | Purpose                          | Key Env Vars                                           |
| ---------------------------- | -------------------------------- | ------------------------------------------------------ |
| Discourse API                | Blog, takeovers, docs, tutorials | `DISCOURSE_API_KEY`, `DISCOURSE_API_USERNAME`          |
| WordPress/Insights           | Blog content                     | `WORDPRESS_USERNAME`, `WORDPRESS_APPLICATION_PASSWORD` |
| Google Programmable Search   | Site search                      | `SEARCH_API_KEY`                                       |
| Google Cloud Datastore       | Data storage                     | `GOOGLE_CLOUD_*`                                       |
| Stripe                       | Subscriptions / Ubuntu Pro       | `STRIPE_PUBLISHABLE_KEY`                               |
| Marketo                      | Marketing / lead gen             | `MARKETO_API_*`                                        |
| TrueAbility / Badgr / Credly | Badges and credentials           | `TRUEABILITY_*`, `BADGR_*`, `CREDLY_URL`               |
| Contracts API                | Canonical contracts              | `CONTRACTS_API_URL`                                    |
| Security API                 | Ubuntu CVE/notice data           | `SECURITY_API_URL`                                     |
| Sentry                       | Error tracking                   | auto-configured                                        |

No traditional database — content is largely API-driven or static YAML.

## Architecture Notes

- **Templatefinder** maps URL paths to Jinja2 templates automatically (no explicit route needed for pure-content pages).
- **Discourse integration** drives most editorial content — blog, engage/takeover pages, tutorials, and documentation sections each have dedicated Flask blueprints in `webapp/`.
- **`?format=md` query parameter** returns pages as Markdown (for LLM/crawler consumption). Only 200 OK HTML responses are returned. JSON endpoints, redirects, and error pages are explicitly excluded.
- **Macaroon-based auth** is used for Ubuntu Pro / Advantage account features.
- **React islands** coexist with Jinja2 — individual page sections are hydrated as React apps rather than a full SPA.
- Python formatting enforces **79-character line length** (not the default 88) — always pass `--line-length 79` to black.

## CI/CD

- **PRs:** lint (SCSS, Python, JS, TS, Jinja), unittest, Jest, inclusive-language check, k8s validation.
- **Merge to main:** build Rock (OCI image) → push to GHCR → deploy staging (Juju) → deploy production.
- Secrets managed via Vault; deployments use self-hosted GitHub Actions runners.

## Docs

- `README.md` — local dev setup overview
- `HACKING.md` — detailed dev guide (credentials, VCR cassettes, navigation system, editor config)
- `ARCHITECTURE.md` — high-level architecture and major site sections
