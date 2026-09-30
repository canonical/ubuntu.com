# Quote Wrapper

**Import:** `{% from "_macros/vf_quote-wrapper.jinja" import vf_quote_wrapper %}`

```jinja
{% call(slot) vf_quote_wrapper(quote_text="Quote text", title_text="", quote_size="medium", citation_source_name_text="", citation_source_title_text="", citation_source_organisation_text="", is_shallow=false) %}
  {% if slot == 'heading_link' %}...{% endif %}
  {% if slot == 'signpost_image' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
  {% if slot == 'image' %}...{% endif %}
{% endcall %}
```

- `quote_text` required.
- `quote_size`: `small`, `medium`, or `large`.
- Optional citation name, title, and organization strings.
- `is_shallow` defaults false.
- Slots: `heading_link`, `signpost_image`, `cta`, and `image`.
