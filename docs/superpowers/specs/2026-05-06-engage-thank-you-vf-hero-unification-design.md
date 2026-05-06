# Engage thank-you template — vf_hero unification

## Background

`templates/engage/thank-you.html` currently has two visually-distinct sections:

1. A `vf_hero` macro call at the top, which unconditionally renders a "We've emailed a copy…" message — even when the user did not submit a form. This is incorrect for cases where the user just wants the download.
2. A `<section class="p-strip">` block below it with three conditional branches that produce raw HTML for the actual thank-you content.

The two sections produce overlapping content and the top one ignores conditions, so users in the "ready to download" path see a confusing duplicate message.

## Goal

Replace both sections with **a single `vf_hero` call** whose blocks adapt to the page state, so each user sees one coherent thank-you panel.

## Cases

| # | Condition | Description text | CTA |
|---|---|---|---|
| 1 | `form_details and metadata.access_to_content == "true"` | "We've emailed a copy of {{ resource_name }} to {{ form_details.email }}. Didn't get it? Check your spam folder and that you've used the right email address." | Primary: "Go back" → `engage_path`; Secondary: "Contact us" (modal) |
| 2 | `"thank_you_text" in metadata` | `metadata["thank_you_text"]` | Download (only if `metadata.resource_url` and `metadata.contact_form_only != "true"`) |
| 3 | otherwise | "The {{ resource_name }} is now ready to download." | Same as case 2 |

The "Go back" CTA stays scoped to case 1 only (per user direction — not added to other cases for now).

## Design

### Approach

Hoist the case-specific values (`description_text`, the CTA block) into `{% set %}` statements above the `vf_hero` call. This keeps the macro call clean and readable while avoiding duplication of the title, layout, and image blocks.

### Sketch

```jinja
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
    { "type": "description", "padding": "shallow",
      "item": { "type": "text", "content": description_text } },
    {%- if is_form_submission %}
    { "type": "cta-block", "padding": "shallow",
      "item": {
        "primary": { "content_html": "Go back", "attrs": { "href": engage_path } },
        "secondaries": [
          { "content_html": "Contact us",
            "attrs": { "href": "/contact-us#get-in-touch", "class": "js-invoke-modal" } }
        ]
      } },
    {%- elif show_download %}
    { "type": "cta-block", "padding": "shallow",
      "item": {
        "primary": { "content_html": "Download", "attrs": { "href": resource_url } }
      } },
    {%- endif %}
    { "type": "image", "item": { ... existing image block ... } },
  ]
) -%}
{% endcall -%}

{{ load_form("/contact-us") | safe }}
```

### Removals

- The entire `<section class="p-strip"> … </section>` block (lines 69-95 currently) is deleted; its logic moves into the `vf_hero` blocks above.

### Kept

- `{{ load_form("/contact-us") | safe }}` — the "Contact us" CTA uses `js-invoke-modal` and depends on this form being loaded.

## Out of scope

- Localized variants in `templates/engage/shared/_<lang>_thank-you.html` — same refactor would apply but is not part of this change.
- The `engage_path` view change — already done in `webapp/views.py` as part of an earlier task in this branch.
