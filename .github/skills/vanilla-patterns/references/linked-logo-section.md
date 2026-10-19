# Linked Logo Section

**Import:** `{% from "_macros/vf_linked-logo-section.jinja" import vf_linked_logo_section %}`

```jinja
{{ vf_linked_logo_section(title_text="", links=[], layout="full-width", top_rule_variant="default", padding="default") }}
```

- `title_text` optional.
- `links` required. Each link requires `href`, `text`, `label`, and either `image_attrs` or `image_html`. Prefer `image_attrs`; it wins if both are supplied and receives the image class automatically. Raw HTML must include the required class.
- `layout`: `full-width` (8 max), `50-50` (6 max), or `25-75` (9 max). `50/50` is normalized.
- `top_rule_variant`: `default`, `muted`, `highlighted`, or `none`.
- `padding`: `default`, `deep`, `shallow`, or `none`.
