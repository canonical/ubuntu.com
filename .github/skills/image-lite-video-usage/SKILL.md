---
name: image-lite-video-usage
description: Checks that Jinja templates use the shared `image()` template global for images and the `lite_video` macro / `<lite-youtube>` element for YouTube embeds, instead of hand-written `<img>`, `<iframe>`, or `<video>` tags. Use when the changed file path is under templates/ (a Jinja template), or when a diff adds/edits an image or video embed on a page.
---

# Image and lite-video usage in templates

## When to run this check

Only applies when the file being created, edited, or reviewed is a Jinja template (path under `templates/`, extension `.html` or `.jinja`). Skip this check for Python, JS/TS, or SCSS files.

## Images: use the `image()` global

`image` is registered as a Flask/Jinja context processor global (see `webapp/handlers.py`, backed by the `canonicalwebteam.image_template` package) — it's available in every template with no `{% from %}` import needed.

Signature: `image(url, alt, width, height=None, hi_def=False, fill=False, e_sharpen=False, loading="lazy", attrs={})`

- `url` (required): full `https://` asset URL (usually an `assets.ubuntu.com` Cloudinary-backed URL).
- `alt` (required): alt text (`""` is acceptable for decorative images).
- `width` (required): target width in px.
- `height` (optional): target height in px.
- `hi_def` (optional, bool): also serve a 2x resolution source for high-DPI screens.
- `fill` / `e_sharpen` (optional): Cloudinary crop-to-fill / sharpen options.
- `loading` (optional): defaults to `"lazy"`; use `"auto"` for above-the-fold hero images.
- `attrs` (optional dict): extra HTML attributes, e.g. `{"class": "p-image-container__image"}`.

It renders responsive markup with Cloudinary optimisation (`f_auto,q_auto,fl_sanitize`) and lazy loading, so it should be used for standard content images (hero images, article/blog images, screenshots, diagrams) instead of a hand-written `<img>` tag.

**Flag** a raw `<img ...>` tag added or edited in a template, and suggest replacing it with `{{ image(url="...", alt="...", width=...) }}`, UNLESS it falls into one of these accepted exceptions:

- Analytics/conversion tracking pixels (typically `height="1" width="1" style="border-style:none;"` images pointing at an ad/analytics domain, as seen on most `*/thank-you.html` pages).
- Files under `templates/_image-testing/` (intentional test fixtures for image rendering).
- Inline HTML strings passed as data into a Vanilla pattern (e.g. `image_html`, `logo.src`/`logo.alt` in a `logo-block`, `articles[].image_url` — see the `vanilla-patterns` skill), or small fixed-size logos/icons where the pattern macro itself expects a literal `<img>` string rather than a call to `image()`.
- Dynamic/data-driven `src` attributes sourced from an API or CMS field that isn't a plain asset URL (e.g. `src="{{ vendor_data.logo }}"`).

## Video: use the lite-video pattern

YouTube videos should be embedded with the Lite YouTube player, not a raw `<iframe src="https://www.youtube.com/embed/...">` tag — the lite player defers loading the full YouTube iframe until interaction, which is much lighter for page performance.

Preferred, for new video embeds: import and call the shared macro:

```jinja
{% from "macros/_macro-lite-video.jinja" import lite_video with context %}
...
{{ lite_video(video_id="VIDEO_ID", video_title="Accessible, descriptive title") }}
```

If the macro isn't used, at minimum the page must use the `<lite-youtube videoid="..." videotitle="..." posterquality="maxresdefault">` custom element together with its script include, matching the pattern already used across the codebase (e.g. `templates/core/index.html`, `templates/openstack/index.html`):

```html
<script nonce="{{ csp_nonce }}" type="module"
        src="https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@1.9.0/lite-youtube.min.js"
        integrity="sha384-krUlgvxdz2iSLnbpvxj8zLWWUCa3QxzwLbW3EXmbzXCoAQ+ANH1cWJYRMc/TErh+"
        crossorigin="anonymous"></script>
```

**Flag**:

- A raw `<iframe ...src="https://www.youtube.com/embed/...">` embed — recommend converting to `lite_video()` or a `<lite-youtube>` element.
- A `<lite-youtube>` embed missing `videotitle` (accessibility) or missing `nonce="{{ csp_nonce }}"` on its script tag (breaks CSP).
- For a *new* video embed, prefer the shared `lite_video` macro over hand-rolling the `<lite-youtube>` + script boilerplate, to avoid duplicating the script-include logic. Don't require rewriting pre-existing raw `<lite-youtube>` usages elsewhere on the page unless they're part of the change being reviewed.

## Reporting

When flagging an issue, cite the offending line, which accepted exception (if any) was checked and ruled out, and the exact replacement snippet using `image()` or `lite_video()` so the fix can be applied directly.
