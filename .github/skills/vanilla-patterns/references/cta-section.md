# CTA Section

**Import:** `{% from "_macros/vf_cta-section.jinja" import vf_cta_section %}`

```jinja
{% call(slot) vf_cta_section(title_text='', variant='default', layout='100', attrs={}, blocks=[]) %}
{% endcall %}
```

- `title_text` is required for the `block` variant.
- `variant`: `default` or `block`.
- `layout`: `100` or `25-75`.
- `blocks`: Structured `description` and `cta` blocks.
- `attrs`: Section attributes.

Do not use deprecated `description` or `cta` caller content. Installed 4.58.1 still calls `caller()`, so retain the empty call wrapper.
