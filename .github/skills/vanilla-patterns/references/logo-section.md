# Logo Section

**Import:** `{% from "_macros/vf_logo-section.jinja" import vf_logo_section %}`

```jinja
{% call(slot) vf_logo_section(title, padding="default", blocks=[], top_rule_variant="default", mode="default") %}
  {% if slot == 'description' %}...{% endif %}
{% endcall %}
```

- `title` required: `{text, link_attrs?}`.
- `padding`: `default`, `deep`, or `none`.
- `blocks` required: `cta-block` and `logo-block`.
- Installed-macro logo shape: `{type: "logo-block", item: {logos: [{src, alt}]}}`; attributes are forwarded directly. Recheck this against the installed macro after a Vanilla upgrade. Basic and Tab logo blocks instead nest attributes under `attrs`.
- `top_rule_variant`: `default` or `none`.
- `mode`: `default` renders a section with title/description/CTA; `minimal` renders a compact div with only logos.
- Slot: optional `description` in default mode.
