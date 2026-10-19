# Rich List (Vertical)

**Import:** `{% from "_macros/vf_rich-vertical-list.jinja" import vf_rich_vertical_list %}`

```jinja
{{ vf_rich_vertical_list(title={}, items=[], media={}, is_flipped=false, padding="default", top_rule_variant="default", attrs={}) }}
```

- `title` required: `{text, link_attrs?}`.
- `items` supports `description`, `list`, `code-block`, `logo-block`, and `cta-block`; unsupported types are dropped.
- `media` required:
  - `type`: `image` or `video`; default image.
  - `ratio.large`: `16-9`, `3-2`, `1-1`, `2-3`, or `auto-height`; default `3-2`.
  - `ratio.medium_small`: `16-9`, `3-2`, or `1-1`; default `3-2`.
  - `fit`: `cover` or `contain`; default cover.
  - `attrs`: Image/iframe attributes.
- `is_flipped` swaps columns.
- `padding`: `default`, `deep`, or `shallow`.
- `top_rule_variant`: `default` or `muted`.

`auto-height` is large-only. Videos are fixed 16:9 iframe embeds; ratio and fit are ignored.
