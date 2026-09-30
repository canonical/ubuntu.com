---
name: vanilla-patterns
description: Reference guide for correctly implementing Vanilla Framework Jinja macro patterns. Use whenever creating or editing any of the following patterns in a Jinja template - hero, basic section, equal heights, blog, data spotlight, divided section, tiered list, text spotlight, logo section, linked logo section, quote wrapper, pricing block, CTA section, tab section, newsletter signup, resources, rich list (horizontal), rich list (vertical) - to confirm the correct macro import, required parameters, structured blocks, and any caller slots that are still required, or to check a pattern's structure/macro signature hasn't been changed during review.
---

# Vanilla Patterns - LLM Agent Guide

This document serves as a reference for implementing Vanilla Framework patterns as Jinja macros. It is cross-checked against the official Vanilla Framework 4.59.0 pattern documentation and the 4.58.1 macros installed in this repository.

**Important:** Prefer structured parameters and block arrays wherever they are available. Use caller slots only for patterns explicitly listed as slot-based in this guide. Where the live documentation and the installed package differ, this guide calls out the 4.58.1 compatibility requirement.

## Overview

Vanilla Framework provides reusable Jinja macros that render common content layout patterns. These patterns are designed to work together and help maintain consistency across web applications built with Vanilla.

**Table of contents:**
- [Hero pattern](#hero-pattern)
- [Basic section](#basic-section)
- [Equal heights](#equal-heights)
- [Blog](#blog)
- [Data spotlight](#data-spotlight)
- [Divided section](#divided-section)
- [Tiered list](#tiered-list)
- [Text spotlight](#text-spotlight)
- [Logo section](#logo-section)
- [Linked logo section](#linked-logo-section)
- [Quote wrapper](#quote-wrapper)
- [Pricing block](#pricing-block)
- [CTA section](#cta-section)
- [Tab section](#tab-section)
- [Newsletter signup](#newsletter-signup)
- [Resources](#resources)
- [Rich list (horizontal)](#rich-list-horizontal)
- [Rich list (vertical)](#rich-list-vertical)

---

## Hero pattern

**Purpose:** Create a prominent banner section with a title (h1), optional subtitle, description, call-to-action, and images. Typically used for page headers.

**Jinja import:**
```jinja
{% from "_macros/vf_hero.jinja" import vf_hero %}
```

**Preferred invocation:**
```jinja
{% call(slot) vf_hero(
  title_text,                              # (required) H1 title text
  subtitle_text='',                        # (optional) Subtitle text
  chip_text='',                            # (optional) Branded chip text
  chip_aria_label='',                      # (optional) Label for icon-only chip
  layout='fallback',                       # (optional) Layout: '50/50', '50/50-full-width-image', '75/25', '25/75', 'fallback'
  is_split_on_medium=false,                # (optional) Layout split on medium screens
  display_blank_signpost_image_space=false,# (optional) For 25/75 layout
  blocks=[]                                # (optional) Array of content blocks
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
- Vanilla Framework 4.58.1 still invokes `caller()` internally, so retain the empty `{% call(slot) %}...{% endcall %}` wrapper even though no slot content is supplied.

---

## Basic section

**Purpose:** Create structured content sections with a title, subtitle, and flexible content blocks for text, images, videos, lists, code blocks, logos, and CTAs.

**Jinja import:**
```jinja
{% from "_macros/vf_basic-section.jinja" import vf_basic_section %}
```

**Macro signature:**
```jinja
{{ vf_basic_section(
  title={},                              # (required) Title dict with 'text' and optional 'link_attrs'
  label_text="",                         # (optional) Muted label above title
  subtitle={},                           # (optional) Subtitle dict with 'text' and 'heading_level'
  items=[],                              # (optional) Array of content block objects
  padding="default",                     # (optional) 'default', 'deep', or 'shallow'
  is_split_on_medium=false,              # (optional) 50/50 grid on medium+ screens
  top_rule_variant="default",            # (optional) 'default', 'muted', 'highlighted', or 'none'
  override_last_item_padding=false,      # (optional) Add padding to last item
  attrs={}                               # (optional) HTML attributes for section
) }}
```

**Parameters:**
- `title` (object, required): {text: "title" (required), link_attrs: {...} (optional)}
- `label_text` (string, optional): Muted heading above title. Default: "".
- `subtitle` (object, optional): {text: "subtitle", heading_level: 4|5}. The heading level defaults to 4.
- `items` (array, optional): Content blocks. Each has `type` and `item`. Default: [].
- `is_split_on_medium` (boolean, optional): Splits 50/50 on medium screens. Default: false (splits only on large).
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', or 'none'. Default: 'default'.
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.
- `override_last_item_padding` (boolean, optional): Override no-padding on last item. Default: false.
- `attrs` (object, optional): HTML attributes for section element.

**Supported item types:**
- `description`: {type: "text"|"html", content: "..."}
- `image`: {aspect_ratio: "16-9"|"3-2"|"2-3"|"cinematic"|"", is_highlighted: bool, is_cover: bool, caption_html: "...", attrs: {...}}. `is_highlighted` defaults to true and `is_cover` to false.
- `video`: {attrs: {for iframe}}
- `notification`: {type: "information"|"caution"|"negative"|"positive", title: "...", content: "..."}
- `list`: {list_items: [{list_item_type: "bullet"|"tick"|"cross"|"number"|"", content: "...", sublist: {list_items: [...]}}]}
- `code-block`: {content: "...", is_code_snippet: bool}
- `logo-block`: Rendered via shared macro
- `linked-logo-block`: Rendered via shared macro
- `cta-block`: Rendered via shared macro

**Example:**
```jinja
{% from "_macros/vf_basic-section.jinja" import vf_basic_section %}

{{ vf_basic_section(
  title={"text": "Feature Overview"},
  subtitle={"text": "Key capabilities", "heading_level": 4},
  items=[
    {
      "type": "description",
      "item": {"type": "html", "content": "<p>Enterprise solution.</p>"}
    },
    {
      "type": "image",
      "item": {"aspect_ratio": "16-9", "attrs": {"src": "image.jpg", "alt": "Feature"}}
    }
  ]
) }}
```

---

## Equal heights

**Purpose:** Display multiple items in a responsive grid with consistent card heights.

**Jinja import:**
```jinja
{% from "_macros/vf_equal-heights.jinja" import vf_equal_heights %}
```

**Macro signature:**
```jinja
{% call(slot) vf_equal_heights(
  title_text,                            # (required) H2 title
  attrs={},                              # (optional) HTML attributes for wrapper
  subtitle_text="",                      # (optional) Subtitle text
  subtitle_heading_level=5,              # (optional) 4 or 5
  highlight_images=false,                # (optional) Add grey background to images
  image_aspect_ratio_small="square",     # (optional) 'square', '2-3', '3-2', '16-9', 'cinematic', 'auto'
  image_aspect_ratio_medium="square",    # (optional) Same options
  image_aspect_ratio_large="2-3",        # (optional) Same options
  items=[]                               # (required) Array of item objects
) %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title.
- `subtitle_text` (string, optional): Subtitle for right column. Default: "".
- `subtitle_heading_level` (int, optional): 4 or 5. Default: 5.
- `highlight_images` (boolean, optional): Add grey background. Default: false.
- `image_aspect_ratio_*` (string, optional): Aspect ratios for responsive images.
- `items` (array, required): Each item has: `title_text`, `title_link_attrs` (optional), `description_html`, `image_html`, `cta_html`.
- `attrs` (object, optional): HTML attributes.

**Grid layout:** Automatically determined by item count:
- 4 items → 4 columns
- 3 or 6 items → 3 columns
- 2 items → 2 columns

**Slots:**
- `description`: Right-column content for the title area
- `cta`: Right-column CTA area

---

## Blog

**Purpose:** Display blog articles in a grid layout with metadata and optional dynamic loading.

**Jinja import:**
```jinja
{% from "_macros/vf_blog.jinja" import vf_blog %}
```

**Macro signature:**
```jinja
{{ vf_blog(
  title={},                              # (required) Title object with 'text' and optional 'link_attrs'
  articles=[],                           # (optional) Array of article objects (static mode)
  template_config={},                    # (optional) Config for dynamic mode
  padding="default",                     # (optional) 'default', 'deep', or 'shallow'
  top_rule_variant="default",            # (optional) 'default' or 'muted'
  fallback_image_url="..."               # (optional) Default image if not provided
) }}
```

**Parameters:**
- `title` (object, optional): {text: "...", link_attrs: {...} (optional)}. Default: {}.
- `articles` (array, optional): Static articles. Default: [].
  - `title` (required): `{text, link_attrs?, attrs?, heading_level?}`; heading level is 3 or 4 and defaults to 3.
  - `image` (optional): `{attrs: {src, alt, ...}}`.
  - `description` (optional): `{text, attrs?, class?}`.
  - `metadata` (optional): `{authors: [{text, link_attrs?}], date: {text, attrs?}}`.
- `template_config` (object, optional): For dynamic loading.
  - enabled (bool): true to enable template mode
  - layout (string): "3-blocks" or "4-blocks"
  - template_container_id (string): Container ID
  - template_id (string): Template ID
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.
- `top_rule_variant` (string, optional): 'default' or 'muted'. Default: 'default'.
- `fallback_image_url` (string, optional): Image used when an article has no image. Defaults to Vanilla's blog fallback image.

**Layout:** Automatically inferred from article count (3 → 3-blocks, 4 → 4-blocks).

---

## Data spotlight

**Purpose:** Display key statistics with headlines and optional descriptions.

**Jinja import:**
```jinja
{% from "_macros/vf_data-spotlight.jinja" import vf_data_spotlight %}
```

**Macro signature:**
```jinja
{{ vf_data_spotlight(
  title={},                              # (required) Title with 'text' and optional 'link_attrs'
  blocks=[]                              # (required) Array of stat blocks
) }}
```

**Parameters:**
- `title` (object, required): {text: "...", link_attrs: {...} (optional)}
- `blocks` (array, required): Each block has:
  - `stat` (string, required): The statistic/number
  - `headline` (string, optional): Headline text
  - `description` (string, optional): Description text
  - `link` (object, optional): {url: "...", text: "..."}

**Layout:** Automatically determined:
- 4 blocks → 4 columns
- 3 blocks → 3 columns
- 2 blocks → 2 columns

---

## Divided section

**Purpose:** Structured content sections with divided blocks for complex layouts.

**Jinja import:**
```jinja
{% from "_macros/vf_divided-section.jinja" import vf_divided_section %}
```

**Macro signature:**
```jinja
{{ vf_divided_section(
  title,                                 # (required) Title dict with 'text'
  blocks=[],                             # (required) Array of block objects
  padding="default",                     # (optional) 'default', 'deep', or 'shallow'
  is_split_on_medium=false,              # (optional) 50/50 on medium+
  top_rule_variant="default"             # (optional) 'default', 'muted', 'highlighted', or 'none'
) }}
```

**Parameters:**
- `title` (object, required): {text: "...", link_attrs: {...} (optional)}
- `blocks` (array, required): `description-block` and `divided-block` objects. Default: [].
  - `description-block`: `{type: "description-block", items: [basic-section content blocks]}`.
  - `divided-block`: `{type: "divided-block", bullet_type: "number"|"bullet"|"status"|"none", items: [{title_text?, contents: [basic-section content blocks]}]}`.
  - Prefer one description block and 1-9 divided blocks; each divided item supports 1-5 content entries.
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.
- `is_split_on_medium` (boolean, optional): 50/50 split on medium+. Default: false.
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', or 'none'. Default: 'default'.

---

## Tiered list

**Purpose:** Display paired titles and descriptions in a tiered list format.

**Jinja import:**
```jinja
{% from "_macros/vf_tiered-list.jinja" import vf_tiered_list %}
```

**Macro signature:**
```jinja
{% call(slot) vf_tiered_list(
  padding="default",                     # (optional) 'default', 'deep', or 'shallow'
  is_description_full_width_on_desktop=true,  # (optional) Full-width description
  is_list_full_width_on_tablet=true,     # (optional) Full-width list on tablet
  top_rule_variant="default",            # (optional) 'default', 'muted', 'highlighted', 'none'
  img_attrs={},                           # (optional) Image attributes
  video_attrs={},                         # (optional) Iframe or lite-youtube attributes
  is_media_full_width=false,              # (optional) Put media in its own row
  media_placement="after_cta",            # (optional) Placement relative to description/CTA
  media_aspect_ratio="3-2",               # (optional) '3-2' or '16-9' for images
  hide_media_on_small_medium_breakpoints=false,
  is_media_highlighted=false
) %}
  {% if slot == 'title' %}...{% endif %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'list_item_title_1' %}...{% endif %}
  {% if slot == 'list_item_description_1' %}...{% endif %}
  {# ... list_item_title_N through list_item_description_N (supports up to 25 items) #}
  {% if slot == 'cta' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.
- `is_description_full_width_on_desktop` (boolean, optional): Description full-width on desktop. Default: true.
- `is_list_full_width_on_tablet` (boolean, optional): List full-width on tablet. Default: true.
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', 'none'. Default: 'default'.
- `img_attrs` (object, optional): Attributes for an image displayed near the description. Default: {}.
- `video_attrs` (object, optional): Use `src` for an iframe, or `video_id` and preferably `video_title` for `lite-youtube`. Default: {}. If supplied, video takes precedence over image.
- `is_media_full_width` (boolean, optional): Render media in a full-width row. Default: false. Full-width images use a cinematic ratio; videos remain 16:9.
- `media_placement` (string, optional): 'before_description', 'after_description', or 'after_cta'. The 4.59.0 docs default to 'after_cta'; installed 4.58.1 defaults to 'after_description', so pass this explicitly.
- `media_aspect_ratio` (string, optional): '3-2' or '16-9' for non-full-width images. Default: '3-2'.
- `hide_media_on_small_medium_breakpoints` (boolean, optional): Hide media below large screens. Default: false.
- `is_media_highlighted` (boolean, optional): Highlight the image container. Default: false; images only.

**Slots (up to 25 list items):**
- `title`: Top-level title (h2)
- `description`: Top-level description
- `list_item_title_N`: Title for item N
- `list_item_description_N`: Description for item N
- `cta`: Bottom CTA

---

## Text spotlight

**Purpose:** Highlight key benefits or features in a list with horizontal dividers.

**Jinja import:**
```jinja
{% from "_macros/vf_text-spotlight.jinja" import vf_text_spotlight %}
```

**Macro signature:**
```jinja
{% call(slot) vf_text_spotlight(
  title_text,                            # (required) H2 title
  item_heading_level=2,                  # (optional) 2 or 4
  list_items=[]                          # (required) Array of text/HTML strings (2-7 items)
) %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title.
- `list_items` (array, required): Text or HTML strings. Must have 2-7 items.
- `item_heading_level` (int, optional): 2 or 4. Default: 2.

**Notes:** Items are rendered with the specified heading level and separated by horizontal rules. The macro has no documented slots, but official examples use an empty call wrapper.

---

## Logo section

**Purpose:** Display logos with title, description, CTAs, and flexible layout.

**Jinja import:**
```jinja
{% from "_macros/vf_logo-section.jinja" import vf_logo_section %}
```

**Macro signature:**
```jinja
{% call(slot) vf_logo_section(
  title,                                 # (required) Title dict with 'text' and optional 'link_attrs'
  padding="default",                     # (optional) 'default', 'deep', or 'none'
  blocks=[],                             # (required) Array of block objects
  top_rule_variant="default",            # (optional) 'default' or 'none'
  mode="default",                        # (optional) 'default' or 'minimal'
  caller=None                            # Internal parameter
) %}
  {% if slot == 'description' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title` (object, required): {text: "...", link_attrs: {...} (optional)}
- `padding` (string, optional): 'default', 'deep', or 'none'. Default: 'default'.
- `blocks` (array, required): Block objects.
  - `cta-block`: {type: "cta-block", item: {primary: {...}, secondaries: [...], link: {...}}}
  - `logo-block`: {type: "logo-block", item: {logos: [{src: "...", alt: "..."}]}}

The Logo section's installed 4.58.1 macro forwards each logo dictionary directly to `<img>`. This differs from Basic section and Tab section logo blocks, which nest image attributes under `attrs`.
- `top_rule_variant` (string, optional): 'default' or 'none'. Default: 'default'.
- `mode` (string, optional): 'default' (renders section tag, includes title) or 'minimal' (renders div, no title). Default: 'default'.

**Slots:**
- `description`: Description content in right column (for default mode only)

---

## Linked logo section

**Purpose:** Display logos as clickable links with optional title.

**Jinja import:**
```jinja
{% from "_macros/vf_linked-logo-section.jinja" import vf_linked_logo_section %}
```

**Macro signature:**
```jinja
{{ vf_linked_logo_section(
  title_text="",                         # (optional) H2 title
  links=[],                              # (required) Array of link objects
  layout="full-width",                   # (optional) 'full-width', '50-50', or '25-75'
  top_rule_variant="default",            # (optional) 'default', 'muted', 'highlighted', 'none'
  padding="default"                      # (optional) 'default', 'deep', 'shallow', 'none'
) }}
```

**Parameters:**
- `title_text` (string, optional): H2 title text. Default: "".
- `links` (array, required): Each link has:
  - `href` (string, required): Link URL
  - `text` (string, required): Link text
  - `label` (string, required): aria-label
  - `image_attrs` or `image_html` (required): Prefer an image attribute dictionary; raw image HTML is also accepted. If both are supplied, `image_attrs` wins.
- `layout` (string, optional): 'full-width' (8 max), '50-50' (6 max), '25-75' (9 max). Default: 'full-width'.
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', 'none'. Default: 'default'.
- `padding` (string, optional): 'default', 'deep', 'shallow', 'none'. Default: 'default'.

**Layout:** Accepts both '50-50' and '50/50' format (normalized internally).

---

## Quote wrapper

**Purpose:** Display a prominent quotation with optional citation, image, and CTA.

**Jinja import:**
```jinja
{% from "_macros/vf_quote-wrapper.jinja" import vf_quote_wrapper %}
```

**Macro signature:**
```jinja
{% call(slot) vf_quote_wrapper(
  title_text="",                         # (optional) Header title
  quote_size="medium",                   # (optional) 'small', 'medium', or 'large'
  quote_text,                            # (required) The quote text
  citation_source_name_text="",          # (optional) Person's name
  citation_source_title_text="",         # (optional) Job title
  citation_source_organisation_text="",  # (optional) Company/organization
  is_shallow=false                       # (optional) Use shallow padding
) %}
  {% if slot == 'heading_link' %}...{% endif %}
  {% if slot == 'signpost_image' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
  {% if slot == 'image' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `quote_text` (string, required): The quotation text.
- `title_text` (string, optional): Header title. Default: "".
- `quote_size` (string, optional): 'small' (h6), 'medium' (h4), 'large' (h2). Default: 'medium'.
- `citation_source_name_text` (string, optional): Person's name. Default: "".
- `citation_source_title_text` (string, optional): Job title. Default: "".
- `citation_source_organisation_text` (string, optional): Organization. Default: "".
- `is_shallow` (boolean, optional): Use shallow padding. Default: false.

**Slots:**
- `heading_link`: Content to display in heading row
- `signpost_image`: Small logo/icon (typically company logo)
- `cta`: Call-to-action area
- `image`: Associated image

---

## Pricing block

**Purpose:** Display pricing tiers in card format with features and CTAs.

**Jinja import:**
```jinja
{% from "_macros/vf_pricing-block.jinja" import vf_pricing_block %}
```

**Macro signature:**
```jinja
{% call(slot) vf_pricing_block(
  top_rule_variant="default",            # (optional) 'default', 'muted', 'highlighted', 'none'
  title_text="",                         # (required) H2 title
  attrs={},                              # (optional) HTML attributes
  tiers=[]                               # (required) Array of tier objects
) %}
  {% if slot == 'section_description' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title.
- `tiers` (array, required): Each tier has:
  - `tier_name_text` (string, optional): Tier name
  - `tier_price_text` (string, required): Price
  - `tier_price_explanation` (string, required): Price details
  - `tier_description_html` (string, optional): Tier description
  - `tier_label_text` (string, required): Label text
  - `tier_offerings` (array, required): Features list
    - Each item: {list_item_style: "ticked"|"crossed"|undefined, list_item_content_html: "..."}
  - `cta_html` (string, optional): CTA button HTML
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', 'none'. Default: 'default'.
- `attrs` (object, optional): HTML attributes.

**Layout:** Determined by tier count:
- 1 tier → single column
- 2 tiers → 50-50 split
- 3 tiers → 25-75 split
- 4+ tiers → equal columns

**Slots:**
- `section_description`: Description text below title. The 4.59.0 API table calls this slot `description`, but both its official examples and the installed 4.58.1 macro use `section_description`; use the runtime-compatible name shown here.

---

## CTA section

**Purpose:** Call-to-action section with title, description, and action buttons.

**Jinja import:**
```jinja
{% from "_macros/vf_cta-section.jinja" import vf_cta_section %}
```

**Preferred invocation:**
```jinja
{% call(slot) vf_cta_section(
  title_text='',                         # required only for the 'block' variant
  variant='default',                     # (optional) 'default' or 'block'
  layout='100',                          # (optional) '100' or '25-75'
  attrs={},                              # (optional) HTML attributes
  blocks=[]                              # (optional) Array of blocks
) %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, conditionally required): H2 title; required for the 'block' variant.
- `variant` (string, optional): 'default' (title + link) or 'block' (title + description + CTA). Default: 'default'.
- `layout` (string, optional): '100' (full-width) or '25-75' (split). Default: '100'.
- `blocks` (array, optional): Content blocks. Supported types are `description` and `cta`.
- `attrs` (object, optional): HTML attributes.

**Notes:**
- The legacy `description` and `cta` caller slots are deprecated. Do not use them in new implementations; use `blocks` instead.
- Vanilla Framework 4.58.1 still invokes `caller()` internally, so retain the empty `{% call(slot) %}...{% endcall %}` wrapper even though no slot content is supplied.

---

## Tab section

**Purpose:** Tabbed interface with various content block types.

**Jinja import:**
```jinja
{% from "_macros/vf_tab-section.jinja" import vf_tab_section %}
```

**Macro signature:**
```jinja
{{ vf_tab_section(
  title={},                              # (required) Title object
  description={},                        # (optional) Description config
  cta={},                                # (optional) CTA config
  layout="50-50",                        # (optional) 'full-width', '50-50', '25-75'
  padding="default",                     # (optional) 'deep', 'shallow', 'default'
  top_rule_variant="default",            # (optional) 'default', 'muted', 'none'
  tabs=[],                               # (required) Array of tab objects
  attrs={}                               # (optional) HTML attributes
) }}
```

**Parameters:**
- `title` (object, required): {text: "...", heading_level: 2|3|4 (optional), link_attrs: {...} (optional)}
- `description` (object, optional): {type: "text"|"html", content: "..."}
- `cta` (object, optional): CTA configuration
- `layout` (string, optional): 'full-width', '50-50', '25-75'. Default: '50-50'.
- `padding` (string, optional): 'deep', 'shallow', 'default'. Default: 'default'.
- `top_rule_variant` (string, optional): 'default', 'muted', 'none'. Default: 'default'.
- `tabs` (array, required): Each tab has:
  - `type` (string, required): "quote", "linked-logo", "logo-block", "divided-section", "blog", or "basic-section"
  - `item` (object, required): Type-specific configuration
  - `tab_html` (string, required): HTML for tab label
- `attrs` (object, optional): HTML attributes.

**Layout support:**
- `full-width`: `quote`, `linked-logo`, `logo-block`, `blog`
- `50-50`: `linked-logo`, `logo-block`, `divided-section`, `blog`, `basic-section`
- `25-75`: `linked-logo`, `logo-block`, `blog`

Unsupported block types are silently skipped. The tabs JavaScript module must be loaded and initialized for the interface to function.

---

## Newsletter signup

**Purpose:** Newsletter subscription form with email input, checkbox, and submission button.

**Jinja import:**
```jinja
{% from "_macros/vf_newsletter-signup.jinja" import vf_newsletter_signup %}
```

**Macro signature:**
```jinja
{% call(slot) vf_newsletter_signup(
  form_id,                               # (required) Form ID
  return_url,                            # (required) Return URL after submission
  title_text,                            # (required) H2/H3 title
  form_action="https://ubuntu.com/marketo/submit",  # (optional) Form endpoint
  input_label="Work email",              # required by docs; 4.58.1 defaults to 'Work email'
  checkbox_id="canonicalUpdatesOptIn",   # (optional) Checkbox name
  checkbox_label="I agree...",           # (optional) Checkbox label
  layout="25-75",                        # (optional) '50-50', '25-75', '2-col', '4-col'
  top_rule_variant="default",            # (optional) 'default', 'muted', 'highlighted', 'none'
  hide_newsletter_block_rule=false,      # (optional) Hide rule on small screens
  submit_btn_class="js-submit-button",   # (optional) CSS classes for submit button
  caller=None                            # Internal parameter
) %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'addendum' %}...{% endif %}
  {% if slot == 'hidden_fields' %}...{% endif %}
  {% if slot == 'honeypot_fields' %}...{% endif %}
  {# For 2-col/4-col layouts #}
  {% if slot == 'col_1' %}...{% endif %}
  {% if slot == 'col_2' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `form_id` (string, required): Form element ID.
- `return_url` (string, required): URL to return to after submission.
- `title_text` (string, required): Form title (H2 for section layout, H3 for grid).
- `form_action` (string, optional): Form submission endpoint. Default: "https://ubuntu.com/marketo/submit".
- `input_label` (string, required by the 4.59.0 docs): Email input label. The installed 4.58.1 macro defaults to "Work email"; pass it explicitly for forward compatibility.
- `checkbox_id` (string, optional): Checkbox field name. Default: "canonicalUpdatesOptIn".
- `checkbox_label` (string, required by the 4.59.0 docs): Checkbox label text. The installed 4.58.1 macro supplies a default.
- `layout` (string, optional): '50-50', '25-75' (section layouts), '2-col', '4-col' (grid layouts). Default: '25-75'.
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', 'none'. Default: 'default'.
- `hide_newsletter_block_rule` (boolean, optional): Hide divider on small screens. Default: false.
- `submit_btn_class` (string, optional): CSS classes for button. Default: "js-submit-button".

**Slots:**
- `description`: Description text
- `addendum`: Additional content (disclaimer, etc.)
- `hidden_fields`: Extra hidden form fields
- `honeypot_fields`: Spam-prevention honeypot fields
- `col_N`: Column content for grid layouts: `col_1` through `col_3` for `2-col`, and `col_1` through `col_2` for `4-col`.

---

## Resources

**Purpose:** Display resources with images, descriptions, and CTAs using basic section patterns.

**Jinja import:**
```jinja
{% from "_macros/vf_resources.jinja" import vf_resources %}
```

**Macro signature:**
```jinja
{% call(slot) vf_resources(
  title={},                              # (required) {text, link_attrs?}
  blocks=[],                             # (required) Content blocks
  padding="default"                      # (optional) 'default', 'deep', 'shallow'
) %}
{% endcall %}
```

**Parameters:**
- `title` (object, required): `{text, link_attrs?}`.
- `blocks` (array, required): Supports `description`, `cta-block`, and `resources`.
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.

**Block configuration:**
- `description`: `{type: "description", item: {type: "text"|"html", content: "..."}}`.
- `cta-block`: Uses the Basic section CTA block structure.
- `resources`: `{type: "resources", render_images: bool, render_categories: bool, categories: [...]}`. Both render flags default to true.
- Each category has a `title` and `items`.
- Each item has required `title: {text, link_attrs?, attrs?}` and optional `image`, `description`, and `metadata`.
- `image`: `{type: "image"|"logo", attrs: {...}}`; `image` is the default type and uses a 16:9 container.
- `description`: `{text, attrs?, class?}`.
- `metadata`: `{authors: [{text, link_attrs?}], date: {text, attrs?}}`.

The official examples use an empty call wrapper, but there are no documented content slots; all content belongs in `blocks`. Installed 4.58.1 also assumes both a `description` and a `cta-block` entry exist, so include empty-safe entries when either has no content; 4.59.0 documents those blocks as optional.

---

## Rich list (horizontal)

**Purpose:** Horizontal list of items with optional image, description, logo section, and CTA.

**Jinja import:**
```jinja
{% from "_macros/vf_rich-horizontal-list.jinja" import vf_rich_horizontal_list %}
```

**Macro signature:**
```jinja
{% call(slot) vf_rich_horizontal_list(
  title_text,                            # (required) Title text
  layout="full-width",                   # (optional) 'full-width' or '50-50'
  list_item_style=""                     # (optional) 'bullet', 'tick', 'number'
) %}
  {% if slot == 'image' %}...{% endif %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'logo_section_items' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
  {% if slot == 'list_item_1' %}...{% endif %}
  {# ... list_item_N (up to 8 items) #}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): Title text.
- `layout` (string, optional): 'full-width' or '50-50'. Default: 'full-width'.
- `list_item_style` (string, optional): 'bullet', 'tick', or 'number'. Default: "".

**Slots:**
- `image`: Top image
- `description`: Description text
- `logo_section_items`: Logo section content
- `cta`: CTA area
- `list_item_N`: List items (1-8); at least four are required.

---

## Rich list (vertical)

**Purpose:** Vertical list with alternating content and media (image or video).

**Jinja import:**
```jinja
{% from "_macros/vf_rich-vertical-list.jinja" import vf_rich_vertical_list %}
```

**Macro signature:**
```jinja
{{ vf_rich_vertical_list(
  title={},                              # (required) Title dict
  items=[],                              # (optional) Content blocks array
  media={},                              # (required) Media configuration
  is_flipped=false,                      # (optional) Swap content/media columns
  padding="default",                     # (optional) 'default', 'deep', 'shallow'
  top_rule_variant="default",            # (optional) 'default' or 'muted'
  attrs={}                               # (optional) HTML attributes
) }}
```

**Parameters:**
- `title` (object, required): {text: "...", link_attrs: {...} (optional)}
- `items` (array, optional): Content blocks. Allowed types: description, list, code-block, logo-block, cta-block. Default: [].
- `media` (object, required): Media configuration:
  - `type` (string, optional): 'image' or 'video'. Default: 'image'.
  - `ratio.large` (string, optional): '16-9', '3-2', '1-1', '2-3', 'auto-height'. Default: '3-2'.
  - `ratio.medium_small` (string, optional): '16-9', '3-2', '1-1'. Default: '3-2'.
  - `fit` (string, optional): 'cover' or 'contain'. Default: 'cover'.
  - `attrs` (object, optional): HTML attributes for img/iframe. Default: {}.
- `is_flipped` (boolean, optional): Swap content/media order. Default: false.
- `padding` (string, optional): 'default', 'deep', 'shallow'. Default: 'default'.
- `top_rule_variant` (string, optional): 'default' or 'muted'. Default: 'default'.
- `attrs` (object, optional): HTML attributes for section.

**Notes:**
- 'auto-height' ratio is only valid for large screens (side-by-side layout)
- Media types must match their corresponding attributes (image requires img attrs, video requires iframe attrs)
- Videos render as 16:9 iframe embeds; `media.ratio` and `media.fit` are ignored for video

---

## Implementation Notes

### General Guidelines
1. **Always import from `_macros/`** directory at template start
2. **Parameter types matter**: strings vs objects vs arrays
3. **Required parameters**: Will error if omitted
4. **Optional parameters**: Have documented defaults
5. **Prefer structured APIs**: Use direct parameters and block arrays unless the pattern is listed below as slot-based

### Caller/Slot Patterns
Only these documented patterns still require caller slots for some or all content:
- Equal heights
- Tiered list
- Logo section
- Quote wrapper
- Pricing block
- Newsletter signup
- Rich list (horizontal)

For these slot-based patterns, provide caller content via `{% if slot == 'name' %}...{% endif %}`. Hero and CTA section are not on this list because their content should use `blocks`; however, Vanilla Framework 4.58.1 still requires an empty `{% call(slot) %}` wrapper around them for compatibility with the deprecated slots.

### Block Arrays
Patterns using blocks arrays expect: `{type: "...", item: {...}, padding: "shallow" (optional)}`

### Responsive Classes
Most patterns use Vanilla's grid system: `grid-row--50-50-on-large`, `grid-col`, etc.

### HTML Safety
Content marked `html` is rendered with `| safe` filter. Ensure all user input is sanitized before passing.

---

**Last updated:** 2026-09-30 (cross-checked against the Vanilla Framework 4.59.0 documentation and the repository's installed 4.58.1 macros)
