# Hero Pattern

**Purpose:** Create a prominent banner section with a title (h1), optional subtitle, description, call-to-action, and images. Typically used for page headers.

**Jinja import:**
```jinja
{% from "_macros/vf_hero.jinja" import vf_hero %}
```

**Preferred invocation:**
```jinja
{% call(slot) vf_hero(
  title_text,
  subtitle_text='',
  chip_text='',
  chip_aria_label='',
  layout='fallback',
  is_split_on_medium=false,
  display_blank_signpost_image_space=false,
  blocks=[]
) %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): The H1 heading text.
- `subtitle_text` (string, optional): Optional H2-styled subtitle. Default: "".
- `chip_text` (string, optional): Text for a branded Ubuntu Pro chip. Default: "".
- `chip_aria_label` (string, optional): Accessible label for an icon-only branded chip. Default: "".
- `layout` (string, optional): Layout variant. Options: 'fallback' (default), '50/50', '50/50-full-width-image', '75/25', '25/75'.
- `is_split_on_medium` (boolean, optional): Whether to split layout on tablet screens. Default: false.
- `display_blank_signpost_image_space` (boolean, optional): For 25/75 layout, indent content to leave signpost space. Default: false.
- `blocks` (array, optional): Array of content blocks with `type`, `item`, and optional `padding` fields. Default: [].

**Content block types:**
- `description`: {type: "description", item: {type: "text"|"html", content: "..."}}
- `cta-block`: CTA with primary, secondary buttons and links
- `image`: {type: "image", item: {aspect_ratio: "...", attrs: {src, alt, ...}}}
- `signpost_image`: Small icon/logo for 25/75 layout

**Notes:**
- `layout` uses forward slash in user input ('25/75') but normalizes internally to dash ('25-75')
- For 25/75 layout with signpost images, `display_blank_signpost_image_space` should be false (default)
- The legacy `description`, `cta`, `image`, and `signpost_image` caller slots are deprecated. Do not use them in new implementations; use `blocks` instead.
- If the installed macro invokes `caller()` internally, retain the empty `{% call(slot) %}...{% endcall %}` wrapper even though no slot content is supplied.
