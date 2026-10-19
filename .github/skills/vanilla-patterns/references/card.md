# Card

**Import:** `{% from "_macros/vf_card.jinja" import vf_card %}`

```jinja
<div class="grid-row">
  {{ vf_card(
    columns="4",
    link="/resource",
    heading="Resource title",
    image={"src": "...", "alt": "..."},
    author="Canonical",
    date="30 September 2026",
    description="Resource summary",
    footer={
      "resource_type": {"icon": "topic", "text": "Whitepaper"},
      "content_type": ["Developers", "Cloud"]
    },
    stacked_image=false
  ) }}
</div>
```

- `link` and `heading` are required. The link makes the entire card clickable; the heading renders as an `h4` and is truncated at three lines.
- `columns`: `"2"`, `"4"`, `"6"`, or `"8"`; default `"2"`.
- `image`: `{src, alt}` for a 16:9 image. It is optional for 2- and 4-column cards and required for 6- and 8-column cards. In repository templates, the shared `image()` global with `output_mode="attrs"` can produce this dictionary.
- `author` and `date`: Optional strings shown only when an image is present. For 8-column cards they are hidden below the large breakpoint.
- `description`: Optional text. Its visibility and truncation respond to the selected layout.
- `footer.resource_type`: Optional `{icon, text}`. Use a valid Vanilla icon name without the `p-icon--` prefix.
- `footer.content_type`: Optional string or list of strings, rendered as read-only chips.
- `stacked_image`: Default `false`. When true, places the image above the content at every breakpoint instead of using the horizontal layout for wider cards.

Cards must be direct children of an element with the `grid-row` class. Check the [current pattern status](https://vanillaframework.io/docs/whats-new) before relying on work-in-progress behavior.
