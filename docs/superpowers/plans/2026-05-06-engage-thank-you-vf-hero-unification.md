# Engage thank-you vf_hero unification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated `vf_hero` + `<section class="p-strip">` markup in `templates/engage/thank-you.html` with a single `vf_hero` call whose blocks adapt to all three thank-you cases.

**Architecture:** Hoist case-specific values (`description_text`, the optional CTA block) into `{% set %}` statements above the macro call. The `blocks=` array embeds `{% if … %}` directives that include or omit the CTA block. Macro title, layout, and image block stay constant.

**Tech Stack:** Jinja2 templates, Flask, the `vf_hero` macro at `templates/_macros/vf_hero.jinja`.

---

### Task 1: Refactor `thank-you.html` to a single `vf_hero` call

**Files:**
- Modify: `templates/engage/thank-you.html` (full template, ~98 lines)

**Spec reference:** `docs/superpowers/specs/2026-05-06-engage-thank-you-vf-hero-unification-design.md`

- [ ] **Step 1: Read the current template to confirm baseline**

Read `/Users/benjo/Sublime/canonical/ubuntu.com/templates/engage/thank-you.html` end-to-end. Confirm it currently has:
- An unconditional `vf_hero` call with the email-confirmation copy
- A `<section class="p-strip">` block with three conditional branches
- `{{ load_form("/contact-us") | safe }}` between them

- [ ] **Step 2: Replace the `{% block content %}` body with the unified version**

Replace the entire body of `{% block content %}` (everything between `{% block content %}` and `{% endblock content %}`) with:

```jinja
{% block content %}

  {% set is_form_submission = form_details and "access_to_content" in metadata and metadata.access_to_content == "true" %}
  {% set show_download = metadata.resource_url and metadata.resource_url != "" and ("contact_form_only" not in metadata or metadata.contact_form_only != "true") %}

  {% if is_form_submission %}
    {% set description_text = "We've emailed a copy of " ~ resource_name ~ " to " ~ form_details.email ~ ". Didn&rsquo;t get it? Check your spam folder and that you&rsquo;ve used the right email address." %}
  {% elif "thank_you_text" in metadata %}
    {% set description_text = metadata["thank_you_text"] %}
  {% else %}
    {% set description_text = "The " ~ resource_name ~ " is now ready to download." %}
  {% endif %}

  {% call(slot) vf_hero(
    title_text='Thank you',
    layout='50/50',
    is_split_on_medium=true,
    blocks=[
      {
        "type": "description",
        "padding": "shallow",
        "item": {
          "type": "text",
          "content": description_text
        }
      },
      {%- if is_form_submission %}
      {
        "type": "cta-block",
        "padding": "shallow",
        "item": {
          "primary": {
            "content_html": "Go back",
            "attrs": {
              "href": engage_path
            }
          },
          "secondaries": [
            {
              "content_html": "Contact us",
              "attrs": {
                "href": "/contact-us#get-in-touch",
                "class": "js-invoke-modal"
              }
            }
          ]
        }
      },
      {%- elif show_download %}
      {
        "type": "cta-block",
        "padding": "shallow",
        "item": {
          "primary": {
            "content_html": "Download",
            "attrs": {
              "href": resource_url
            }
          }
        }
      },
      {%- endif %}
      {
        "type": "image",
        "item": {
          "aspect_ratio": "3-2",
          "is_highlighted": false,
          "is_cover": true,
          "attrs": image(url="https://assets.ubuntu.com/v1/661334bc-image_container.png",
              alt="",
              width="1200",
              height="800",
              hi_def=True,
              loading="auto",
              output_mode="attrs"
          )
        }
      },
    ]
  ) -%}
  {% endcall -%}

  {{ load_form("/contact-us") | safe }}

{% endblock content %}
```

What this removes:
- The duplicated `vf_hero` call that was hardcoding the email-confirmation message
- The whole `<section class="p-strip"> … </section>` block

What this keeps:
- `{% extends "engage/base_engage.html" %}`
- `{% set hide_nav = False %}`
- `{% from "_macros/vf_hero.jinja" import vf_hero %}`
- `{% block title %}` and `{% block head_extra %}`
- `{{ load_form("/contact-us") | safe }}` (needed for the `js-invoke-modal` CTA)

- [ ] **Step 3: Verify the resulting file is syntactically valid Jinja**

Run from repo root:

```bash
python -c "from jinja2 import Environment, FileSystemLoader; Environment(loader=FileSystemLoader('templates')).get_template('engage/thank-you.html')"
```

Expected: no output (template parses). If it errors with `TemplateSyntaxError`, re-read the file and fix the syntax issue before proceeding.

- [ ] **Step 4: Manually trace each case through the template**

Read the modified file once more and walk through each scenario, confirming the rendered output matches the spec's case table:

1. `form_details` set, `metadata.access_to_content == "true"` → description = "We've emailed…", primary CTA = "Go back" → `engage_path`, secondary CTA = "Contact us"
2. `"thank_you_text" in metadata`, no form submission → description = `metadata["thank_you_text"]`, CTA = Download (only if `resource_url` present and `contact_form_only != "true"`)
3. neither of the above → description = "The {resource_name} is now ready to download.", CTA = Download (same condition)

If any branch produces the wrong output, fix and re-verify.

- [ ] **Step 5: Run the dev server and view each case in the browser**

Start the dev server (per the project's normal flow — typically `./run` or `dotrun` for canonical web team projects). Then visit an engage thank-you URL in the browser, e.g. `/engage/<some-page>/thank-you`, for each scenario the metadata enables.

If you cannot enumerate all three scenarios (e.g. no `thank_you_text` in any test page), state that explicitly rather than claiming success.

- [ ] **Step 6: Commit**

```bash
git add templates/engage/thank-you.html docs/superpowers/specs/2026-05-06-engage-thank-you-vf-hero-unification-design.md docs/superpowers/plans/2026-05-06-engage-thank-you-vf-hero-unification.md
git commit -m "refactor: unify engage thank-you template into single vf_hero call"
```

(Branch already prefixed with `WD-36406/` per repo convention; nothing to do at branch level.)

---

## Self-Review

**Spec coverage:** All three cases from the spec table are implemented in Steps 2 and 4. The "Go back" CTA stays scoped to case 1 only (per user direction). The `<section class="p-strip">` removal and `load_form` retention are both reflected.

**Placeholder scan:** None. Every code block is concrete.

**Type consistency:** `is_form_submission`, `show_download`, `description_text` are defined and used consistently. `engage_path`, `resource_name`, `resource_url`, `form_details`, `metadata` are all view-provided context (verified earlier in the conversation: see `webapp/views.py:626-634`).

**Out of scope (intentionally not in this plan):**
- Localized templates under `templates/engage/shared/_<lang>_thank-you.html`
- The `engage_path` view change (already merged earlier in this branch)
