# Tab Section

**Import:** `{% from "_macros/vf_tab-section.jinja" import vf_tab_section %}`

```jinja
{{- vf_tab_section(title={}, description={}, cta={}, layout="50-50", padding="default", top_rule_variant="default", tabs=[], attrs={}) -}}
```

- `title` required: `{text, heading_level: 2|3|4?, link_attrs?}`.
- `description`: `{type: "text"|"html", content}`.
- `cta`: Structured primary, secondaries, and link.
- `layout`: `full-width`, `50-50`, or `25-75`; default `50-50`.
- `padding`: `default`, `deep`, or `shallow`.
- `top_rule_variant`: `default`, `muted`, or `none`.
- Each tab requires `type`, `item`, and `tab_html`.

## Layout Support

- `full-width`: `quote`, `linked-logo`, `logo-block`, `blog`
- `50-50`: `linked-logo`, `logo-block`, `divided-section`, `blog`, `basic-section`
- `25-75`: `linked-logo`, `logo-block`, `blog`

Unsupported block types are silently skipped. Load and initialize Vanilla's tabs JavaScript module.
