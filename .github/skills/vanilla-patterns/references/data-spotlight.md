# Data Spotlight

**Import:** `{% from "_macros/vf_data-spotlight.jinja" import vf_data_spotlight %}`

```jinja
{{ vf_data_spotlight(title={}, blocks=[]) }}
```

- `title` required: `{text, link_attrs?}`.
- `blocks` required. Each block has required `stat`, optional `headline`, optional `description`, and optional `link: {url, text}`.
- Four blocks use four columns, three use three, and two use two.
