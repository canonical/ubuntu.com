# In-Page Navigation

**Import:** `{% from "_macros/vf_in-page-navigation.jinja" import vf_in_page_navigation %}`

## Manual Mode

```jinja
{% set navigation_items = [
  {"id": "overview", "text": "Overview"},
  {
    "id": "details",
    "text": "Details",
    "children": [
      {"id": "requirements", "text": "Requirements"}
    ]
  }
] %}

<div class="grid-row">
  <div class="grid-col-2 grid-col-medium-4 grid-col-small-4">
    {{ vf_in_page_navigation(
      title="On this page",
      navigation_items=navigation_items,
      scope="manual"
    ) }}
  </div>
</div>
```

## Full-Page Mode

```jinja
{{ vf_in_page_navigation(
  scope="full-page",
  primary_heading="h2",
  secondary_heading="h3",
  excludes=["#newsletter", "text:Related content"]
) }}
```

- `title`: Optional heading above the navigation.
- `navigation_items`: Manual-mode list in display order. Each item requires `id` and `text` and may contain `children` with the same shape. Maximum depth is two levels.
- `scope`: `full-page` or `manual`; default `full-page`. Full-page mode generates links and heading IDs with JavaScript and supports at most one navigation per page. Manual mode requires `navigation_items` and supports multiple navigations.
- `primary_heading`: `h2` or `h3`; default `h2`. Used only in full-page mode.
- `secondary_heading`: `h3` or `h4`. Keep it one level below `primary_heading` for semantic heading order.
- `excludes`: Full-page list of CSS selectors or case-insensitive text matches prefixed with `text:`.

The macro cannot be a standalone section. Place it in the default grid with a grid column as its direct parent, preferably two columns on large screens and four on medium and small screens. Load the associated in-page-navigation JavaScript for active-item highlighting and full-page generation. Check the [current pattern status](https://vanillaframework.io/docs/whats-new) before relying on work-in-progress behavior.
