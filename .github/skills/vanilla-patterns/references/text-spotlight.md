# Text Spotlight

**Import:** `{% from "_macros/vf_text-spotlight.jinja" import vf_text_spotlight %}`

```jinja
{% call(slot) vf_text_spotlight(title_text, item_heading_level=2, list_items=[]) %}
{% endcall %}
```

- `title_text` required.
- `list_items` required: 2-7 text or HTML strings.
- `item_heading_level`: 2 or 4; default 2.

There are no documented content slots, but official examples use an empty call wrapper.
