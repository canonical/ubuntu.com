# Resources

**Import:** `{% from "_macros/vf_resources.jinja" import vf_resources %}`

```jinja
{% call(slot) vf_resources(title={}, blocks=[], padding="default") %}
{% endcall %}
```

- `title` required: `{text, link_attrs?}`.
- `blocks` required: `description`, `cta-block`, and `resources`.
- `padding`: `default`, `deep`, or `shallow`.
- Description: `{type: "description", item: {type: "text"|"html", content}}`.
- CTA uses the Basic section CTA structure.
- Resources: `{type: "resources", render_images: bool, render_categories: bool, categories: [...]}`; render flags default true.
- Category has `title` and `items`. Each item requires `title: {text, link_attrs?, attrs?}` and may have `image: {type: "image"|"logo", attrs}`, `description: {text, attrs?, class?}`, and `metadata: {authors: [{text, link_attrs?}], date: {text, attrs?}}`.

There are no content slots; official examples use an empty wrapper. If the installed macro assumes both a `description` and `cta-block` entry exist, include empty-safe entries when absent even when current docs describe them as optional.
