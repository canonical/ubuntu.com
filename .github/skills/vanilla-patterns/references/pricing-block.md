# Pricing Block

**Import:** `{% from "_macros/vf_pricing-block.jinja" import vf_pricing_block %}`

```jinja
{% call(slot) vf_pricing_block(top_rule_variant="default", title_text="", attrs={}, tiers=[]) %}
  {% if slot == 'section_description' %}...{% endif %}
{% endcall %}
```

- `title_text` and `tiers` required.
- Tier fields: optional `tier_name_text`; required `tier_price_text`, `tier_price_explanation`, `tier_label_text`, and `tier_offerings`; optional `tier_description_html` and `cta_html`.
- Offering: `{list_item_style: "ticked"|"crossed"|undefined, list_item_content_html: "..."}`.
- `top_rule_variant`: `default`, `muted`, `highlighted`, or `none`; default `default`.
- Layout: one tier single column; two 50/50; three 25/75; four equal columns.
- Slot: `section_description`. If the current API table calls it `description`, verify the discrepancy against the official examples and installed macro; use the runtime-compatible name.
