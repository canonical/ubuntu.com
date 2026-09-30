# Rich List (Horizontal)

**Import:** `{% from "macros/_vf_rich-horizontal-list.jinja" import vf_rich_horizontal_list %}`

Use this repository-specific compatibility macro while
`templates/macros/_vf_rich-horizontal-list.jinja` exists. Do not import
`_macros/vf_rich-horizontal-list.jinja`: that bypasses the repository override
for [Vanilla issue #5544](https://github.com/canonical/vanilla-framework/issues/5544).

```jinja
{% call(slot) vf_rich_horizontal_list(title_text, layout="full-width", list_item_style="") %}
  {% if slot == 'list_item_1' %}...{% endif %}
{% endcall %}
```

- `title_text` required.
- `layout`: `full-width` or `50-50`.
- `list_item_style`: `bullet`, `tick`, `number`, or empty.
- Slots: optional `image`, `description`, `logo_section_items`, and `cta`; required `list_item_[1-12]` with at least four list items.
