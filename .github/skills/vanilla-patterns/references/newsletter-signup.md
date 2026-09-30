# Newsletter Signup

**Import:** `{% from "_macros/vf_newsletter-signup.jinja" import vf_newsletter_signup %}`

```jinja
{% call(slot) vf_newsletter_signup(form_id, return_url, title_text, form_action="https://ubuntu.com/marketo/submit", input_label="Work email", checkbox_id="canonicalUpdatesOptIn", checkbox_label="I agree...", layout="25-75", top_rule_variant="default", hide_newsletter_block_rule=false, submit_btn_class="js-submit-button") %}
  {% if slot == 'description' %}...{% endif %}
{% endcall %}
```

- Required: `form_id`, `return_url`, `title_text`. Current docs also require `input_label` and `checkbox_label`; the installed macro may default them, but pass them explicitly.
- `layout`: `25-75`, `50-50`, `2-col`, or `4-col`.
- `top_rule_variant`: `default`, `muted`, `highlighted`, or `none`.
- `hide_newsletter_block_rule` applies to grid variants; default false.
- Slots: required `description`; optional `addendum`, `hidden_fields`, `honeypot_fields`; `col_1`-`col_3` for `2-col`, `col_1`-`col_2` for `4-col`.
