# Equal Heights

**Import:** `{% from "_macros/vf_equal-heights.jinja" import vf_equal_heights %}`

```jinja
{% call(slot) vf_equal_heights(title_text, attrs={}, subtitle_text="", subtitle_heading_level=5, highlight_images=false, image_aspect_ratio_small="square", image_aspect_ratio_medium="square", image_aspect_ratio_large="2-3", items=[]) %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
{% endcall %}
```

- `title_text` required; `subtitle_heading_level` is 4 or 5.
- Responsive image ratios: `square`, `2-3`, `3-2`, `16-9`, `cinematic`, `auto`.
- `items` required. Each item: `title_text`, optional `title_link_attrs`, `description_html`, `image_html`, `cta_html`.
- Slots: optional `description` and required `cta`.
- Grid: four items use four columns; three or six use three; two use two.
