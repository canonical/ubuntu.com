# Basic Section

**Import:** `{% from "_macros/vf_basic-section.jinja" import vf_basic_section %}`

```jinja
{{ vf_basic_section(title={}, label_text="", subtitle={}, items=[], padding="default", is_split_on_medium=false, top_rule_variant="default", override_last_item_padding=false, attrs={}) }}
```

- `title` (required): `{text, link_attrs?}`.
- `label_text`: Muted label. Default `""`.
- `subtitle`: `{text, heading_level: 4|5}`; level defaults to 4.
- `items`: Content blocks. Default `[]`.
- `padding`: `default`, `deep`, or `shallow`.
- `is_split_on_medium`: Split 50/50 on medium screens. Default `false`.
- `top_rule_variant`: `default`, `muted`, `highlighted`, or `none`.
- `override_last_item_padding`: Default `false`.
- `attrs`: Section attributes.

## Item Types

- `description`: `{type: "text"|"html", content: "..."}`
- `image`: `{aspect_ratio: "16-9"|"3-2"|"2-3"|"cinematic"|"", is_highlighted: bool, is_cover: bool, caption_html: "...", attrs: {...}}`; highlighted defaults true, cover false.
- `video`: `{attrs: {...}}`
- `notification`: `{type: "information"|"caution"|"negative"|"positive", title, content}`
- `list`: `{list_items: [{list_item_type: "bullet"|"tick"|"cross"|"number"|"", content, sublist?}]}`
- `code-block`: `{content, is_code_snippet}`
- `logo-block`, `linked-logo-block`, `cta-block`: shared structured block APIs.
