# Divided Section

**Import:** `{% from "_macros/vf_divided-section.jinja" import vf_divided_section %}`

```jinja
{{ vf_divided_section(title, blocks=[], padding="default", is_split_on_medium=false, top_rule_variant="default") }}
```

- `title` required: `{text, link_attrs?}`.
- `blocks` required:
  - `description-block`: `{type: "description-block", items: [basic-section blocks]}`.
  - `divided-block`: `{type: "divided-block", bullet_type: "number"|"bullet"|"status"|"none", items: [{title_text?, contents: [basic-section blocks]}]}`.
- Prefer one description block and 1-9 divided blocks; each divided item supports 1-5 content entries.
- `padding`: `default`, `deep`, or `shallow`.
- `is_split_on_medium`: Default `false`.
- `top_rule_variant`: `default`, `muted`, `highlighted`, or `none`.
