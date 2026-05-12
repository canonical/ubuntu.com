# AGENTS.md

## Overview

- `canonical/ubuntu.com` is the Flask-based source for the public `ubuntu.com` website.
- The backend is a server-rendered Python app (`webapp/` + `templates/`) with no local database; many pages are static or API-backed.
- Frontend assets are built from SCSS and JavaScript/TypeScript/React sources in `static/`.
- Prefer these instructions first. Only search the repo if this file is missing something you need or if a command here no longer matches the repository.

## Code layout

### Core application

- `/app.py`: thin top-level entrypoint that wires the application together.
- `/webapp/app.py`: main Flask app setup and route registration.
- `/webapp/views.py`: primary view functions for most routes.
- `/webapp/context.py`: shared template context, including navigation loading.
- `/webapp/security/`: security/CVE/API-backed pages.
- `/webapp/shop/`: shop and subscription flows.
- `/webapp/certified/`: certified hardware pages and helpers.
- `/webapp/login.py`, `/webapp/macaroons.py`, `/webapp/marketo.py`: authentication and integration code.

### Templates and content

- `/templates/`: Jinja templates. For many simple pages, adding or editing a template is enough because `templatefinder` serves templates by path.
- `/navigation.yaml`: primary nav tree used by header, footer, breadcrumbs, and mobile nav.
- `/secondary-navigation.yaml`: section-specific secondary navigation.
- `/redirects.yaml`, `/deleted.yaml`: redirect and gone-page rules.
- `/releases.yaml`, `/appliances.yaml`, `/subscriptions.yaml`: structured content that drives download/appliance/subscription pages.

### Frontend assets

- `/static/sass/`: SCSS sources. `yarn build-css` compiles these into `/static/css/`.
- `/static/js/src/`: browser JS plus React/TypeScript entrypoints and tests.
- `/build.js`: JS build entrypoint.
- `/scripts/build-modules.sh`: copies required vendor/browser assets from `node_modules` into tracked static locations.
- `/playwright.config.ts`: Playwright config; tests live in `/tests/playwright/tests/`.

### Tests and validation

- `/tests/`: Python `unittest` suite.
- `/tests/cassettes/`: VCR recordings used by several Python tests; re-record only when intentionally updating external API interactions.
- `/tests/setupTests.ts`: Jest setup.
- `/tests/playwright/tests/`: browser smoke/regression tests.

### Tooling and CI

- `/taskfile.yaml`: preferred local workflow. Installs Python 3.10 and Node 20 via `mise`, creates `.venv`, and wraps build/lint/test/start commands.
- `/package.json`: authoritative list of Yarn scripts for build, lint, and tests.
- `/requirements.txt`: pinned Python dependencies.
- `/.env`: checked-in local development defaults. The app will not boot via `./entrypoint` unless these variables are exported first.
- `/.github/workflows/pr-with-task.yaml`: current Taskfile-based CI checks (`task start`, `task build`, `task test`, `task lint`).
- `/.github/workflows/pr.yaml`: legacy but still informative CI checks, including `lint-jinja`, `test-python`, `test-js`, deploy validation, and inclusive naming.
- `/.github/workflows/playwright.yaml`: Playwright CI flow.
- `/konf/site.yaml`: deployment manifest.

## Running the code

### Preferred path: Taskfile

1. Install Taskfile first. The repository expects the external `task` binary; it was **not** preinstalled in this environment.
2. Run:

   ```bash
   task install
   task start
   ```

3. Open `http://127.0.0.1:8001`.

Why this is the safest path:

- `taskfile.yaml` pins Python `3.10` and Node `20`.
- It creates `.venv`, runs `yarn install`, and loads `.env.local`/`.env`.
- It matches the new CI workflow in `pr-with-task.yaml`.

### Validated manual fallback (works without `task`)

Use this when you cannot install Taskfile locally:

```bash
cd /home/runner/work/ubuntu.com/ubuntu.com
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
yarn install --immutable
export PATH="$PWD/.venv/bin:$PATH"
set -a && source .env && set +a
yarn build
./entrypoint 127.0.0.1:8001
```

Important notes from validation:

- `yarn build` succeeded after Python + Node dependencies were installed.
- Running `./entrypoint` **without** `set -a && source .env && set +a` failed immediately with `KeyError: "Environment variable 'SECRET_KEY' not found."`
- Starting the app after sourcing `.env` returned `HTTP/1.1 200 OK`.
- Build output currently includes non-fatal warnings:
  - Yarn warns that the `license` field is not SPDX-formatted.
  - Sass emits many deprecation warnings around `@import` and global built-ins.

### Playwright / browser testing setup

- `playwright.config.ts` loads `.env.local`.
- If you need local overrides for browser tests, copy `.env` to `.env.local` and edit the copy.
- The config excludes `tests/playwright/tests/pro/**` by default, and also excludes `forms/**` unless `INCLUDE_FORMS` is set.

## Running the tests

Prefer Taskfile when possible:

```bash
task lint
task test
```

Validated Yarn-level commands:

```bash
export PATH="$PWD/.venv/bin:$PATH"
yarn lint-python
yarn lint-ts
yarn lint-js
yarn lint-scss
yarn test-js --coverage
```

Observed behavior:

- All four lint commands completed successfully.
- `yarn lint-js` currently reports 6 existing warnings in:
  - `static/js/src/cve/cve.js`
  - `static/js/src/cve/notices-landing.js`
- `yarn lint-scss` currently prints a deprecation warning for the `scss/at-import-partial-extension` rule but still passes.
- `yarn test-js --coverage` passed, but Jest printed existing console warnings from some React tests plus `Browserslist: caniuse-lite is outdated`; neither blocked the run.

### Python test caveat

- CI and `taskfile.yaml` expect Python **3.10**.
- In this environment, running the full Python suite from a manual Python **3.12** venv caused import-time failures in app-loading tests with:

  ```text
  ModuleNotFoundError: No module named 'pkg_resources'
  ```

- A small subset of non-app-loading tests (`tests.test_releases_yaml`, `tests.test_context`) passed under Python 3.12, but the full suite did not.
- If you need reliable Python test results, use the Taskfile path so `mise` provisions Python 3.10, or otherwise match CI's Python version manually.

### Jinja and Playwright checks

- If you change templates, also run:

  ```bash
  djlint templates/<changed-file>.html --lint --profile=jinja
  ```

  CI only lints changed template files.

- Playwright is optional for most changes, but use it for navigation/forms/pro flows:

  ```bash
  yarn playwright install --with-deps
  yarn playwright test
  ```

## Upgrading Python dependencies

This repo does **not** use `uv`, `pip-tools`, or `poetry`. `requirements.txt` is the source of truth.

To upgrade one dependency:

1. Edit its pinned version in `/requirements.txt`.
2. Reinstall:

   ```bash
   . .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Re-run the relevant lint/tests.

If you are using Taskfile, `task install` will recreate the expected environment after the pin change.

## Practical agent guidance

- Always prefer `task` commands first; they are the closest match to current CI.
- If you fall back to manual commands, always:
  - create/activate `.venv`
  - run `yarn install --immutable`
  - export `.venv/bin` onto `PATH`
  - source `.env` before starting the app
- Do not treat the current Yarn license warning, Sass deprecation warnings, ESLint warnings in `static/js/src/cve/*`, or Jest console warnings as regressions unless your change affects them.
- For navigation/header/footer/breadcrumb changes, inspect `navigation.yaml`, `secondary-navigation.yaml`, and `webapp/context.py` before searching more broadly.
- For page-only changes, check whether the route is served directly from `templates/` before editing Python.
- For API/VCR-backed Python tests, review `tests/cassettes/` and `HACKING.md` before re-recording cassettes.
- Trust this file first and only perform extra repo-wide searches when these instructions are incomplete or no longer accurate.
