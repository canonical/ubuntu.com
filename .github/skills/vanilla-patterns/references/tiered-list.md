# Tiered List

**Import:** `{% from "_macros/vf_tiered-list.jinja" import vf_tiered_list %}`

```jinja
{%- call(slot) vf_tiered_list(padding="default", is_description_full_width_on_desktop=true, is_list_full_width_on_tablet=true, top_rule_variant="default", img_attrs={}, video_attrs={}, is_media_full_width=false, media_placement="after_cta", media_aspect_ratio="3-2", hide_media_on_small_medium_breakpoints=false, is_media_highlighted=false) -%}
  {% if slot == 'title' %}...{% endif %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'list_item_title_1' %}...{% endif %}
  {% if slot == 'list_item_description_1' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
{%- endcall -%}
```

- `padding`: `default`, `deep`, or `shallow`.
- `top_rule_variant`: `default`, `muted`, `highlighted`, or `none`.
- `img_attrs`: Image attributes. `video_attrs`: use `src` for iframe or `video_id` and preferably `video_title` for `lite-youtube`; video wins over image.
- `is_media_full_width`: Full-width row; images become cinematic and videos remain 16:9.
- `media_placement`: `before_description`, `after_description`, or `after_cta`. Documentation and installed-macro defaults may differ, so pass this explicitly.
- `media_aspect_ratio`: `3-2` or `16-9` for non-full-width images.
- `hide_media_on_small_medium_breakpoints` and `is_media_highlighted` default false.
- Slots: `title`, optional `description`, `list_item_title_[1-25]`, `list_item_description_[1-25]`, optional `cta`. At least one title/description item pair is required.
