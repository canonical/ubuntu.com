# Deploy Sitewide Organization JSON-LD Schema (WD-36480)

## Context

AI search engines and knowledge graphs rely on the JSON-LD `@id` entity model to
understand who is behind a site. Currently **ubuntu.com emits zero JSON-LD
Organization schema** — there is no sitewide structured-data block identifying the
Ubuntu organization, its logo, or its verified social/identity profiles.

This task adds a single, static `Organization` JSON-LD block to the base template so
it renders on **every** page, giving crawlers a stable entity (`@id`) with `name`,
`url`, `logo`, and a curated `sameAs` array of verified profiles. Other schemas
(e.g. the existing `Article` schema in `templates/blog/article.html`, whose
`publisher` is currently a bare inline `Organization`) can later reference this
canonical entity by `@id`.

## Key findings from exploration

- Injection point is `templates/templates/base.html:80` — `{%- block head_extra %}{% endblock %}`.
- **`head_extra` is NOT safe for "every page" content.** ~93 child templates override
  `head_extra` and *none* call `{{ block.super }}`, so anything placed inside that
  block is silently dropped on those pages. **Decision: place the JSON-LD as a static
  block directly in `<head>`, just outside `head_extra`,** so it is unconditional and
  guaranteed on every render.
- CSP (`webapp/constants.py`) currently allows inline scripts, but it does not matter:
  `<script type="application/ld+json">` is a non-executable data block that CSP
  `script-src`/`script-src-elem` do not govern. **No nonce is required**, and the block
  survives the in-progress CSP `'unsafe-inline'` removal work.
- Existing JSON-LD precedent: `templates/blog/article.html:33-57` (an `Article` block in
  `extra_metatags`). Confirms the `<script type="application/ld+json">` pattern is already
  used on the site.

## Change

Edit **one file**: `templates/templates/base.html`.

Insert the block immediately **after** line 80 (`{%- block head_extra %}{% endblock %}`)
and **before** the `<meta name="description" ...>` at line 82 — outside any Jinja block,
so it is fully static and renders on every page:

```html
{%- block head_extra %}{% endblock %}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://ubuntu.com/#organization",
  "name": "Ubuntu",
  "url": "https://ubuntu.com/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://assets.ubuntu.com/v1/c55060fd-COF%20android-chrome-512x512.png",
    "width": 512,
    "height": 512
  },
  "sameAs": [
    "https://x.com/ubuntu",
    "https://www.linkedin.com/company/234280",
    "https://www.youtube.com/user/celebrateubuntu",
    "https://www.facebook.com/ubuntulinux/",
    "https://www.instagram.com/ubuntu_os/",
    "https://www.tiktok.com/@canonical_ubuntu",
    "https://ubuntu.social/@ubuntu",
    "https://github.com/canonical",
    "https://launchpad.net/ubuntu",
    "https://www.wikidata.org/wiki/Q381"
  ]
}
</script>

<meta name="description" content="...">
```

### Field rationale
- `@id: https://ubuntu.com/#organization` — stable entity node for the `@id` graph
  model (the core point of the ticket); reusable by other schemas' `publisher`/`author`.
- `name: "Ubuntu"` / `url: https://ubuntu.com/` — matches `og:site_name` "Ubuntu"
  (`base.html:90`) and the canonical domain.
- `logo` — 512×512 Circle of Friends mark
  (`https://assets.ubuntu.com/v1/c55060fd-COF%20android-chrome-512x512.png`, from
  `static/files/site.webmanifest`); square with documented dimensions, expressed as
  `ImageObject` with `width`/`height` per the ticket's "CDN URL with dimensions".
- `sameAs` — full curated set. In-repo verified profiles: X, LinkedIn
  (`footer.html:183`), YouTube (`footer.html:218`), Facebook (`footer.html:169`),
  Instagram (`footer.html:197`), TikTok (`footer.html:233`), Mastodon
  (`footer.html:155`), GitHub `canonical` (matches codebase usage). Plus the two
  identity sources named in the ticket that are **not** in the codebase and were
  compiled manually — **please confirm these before merge**:
  - Launchpad: `https://launchpad.net/ubuntu`
  - Wikidata: `https://www.wikidata.org/wiki/Q381` (the "Ubuntu" entity)

## Verification

1. **Renders on a normal page:** run the site locally (`dotrun`), open any page (e.g.
   `http://0.0.0.0:8001/`), View Source, and confirm the `application/ld+json`
   Organization block is present in `<head>`.
2. **Renders on a `head_extra`-overriding page (the whole point of the placement
   decision):** load a page whose template overrides `head_extra` — e.g.
   `/account` (`templates/account/index.html`) or an `/engage/...` page — and confirm
   the JSON-LD block is **still present**.
3. **Schema validity:** paste the page URL/source into the
   [Schema Markup Validator](https://validator.schema.org/) and Google's
   [Rich Results Test](https://search.google.com/test/rich-results) — expect **0 errors**
   (Organization itself isn't a rich-result type, but the logo should be detected and
   no parse/validation errors should appear).
4. **CSP / console:** confirm no Content-Security-Policy violation in the browser
   console (none expected — JSON-LD is not script-executed).

## Out of scope (note for follow-up)
- Repointing `templates/blog/article.html`'s `Article.publisher` to reference
  `{"@id": "https://ubuntu.com/#organization"}` — a natural next step but not part of
  this ticket.
