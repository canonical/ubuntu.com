# Blog

**Import:** `{% from "_macros/vf_blog.jinja" import vf_blog %}`

```jinja
{{ vf_blog(title={}, articles=[], template_config={}, padding="default", top_rule_variant="default", fallback_image_url="...") }}
```

- `title` optional: `{text, link_attrs?}`.
- `articles`: Static articles. Each has required `title: {text, link_attrs?, attrs?, heading_level?}`; heading level 3 or 4 defaults to 3. Optional `image: {attrs}`, `description: {text, attrs?, class?}`, and `metadata: {authors: [{text, link_attrs?}], date: {text, attrs?}}`.
- `template_config`: Dynamic mode fields `enabled`, `layout` (`3-blocks` or `4-blocks`), `template_container_id`, and `template_id`.
- `padding`: `default`, `deep`, or `shallow`.
- `top_rule_variant`: `default` or `muted`.
- `fallback_image_url`: Defaults to Vanilla's fallback image.

Layout is inferred from article count: three articles use `3-blocks`; four use `4-blocks`.
