---
name: vanilla-patterns
description: Reference guide for correctly implementing Vanilla Framework Jinja macro patterns. Use whenever creating or editing any of the following patterns in a Jinja template - hero, basic section, equal heights, blog, data spotlight, divided section, tiered list, text spotlight, logo section, linked logo section, quote wrapper, pricing block, CTA section, tab section, newsletter signup, resources, rich list (horizontal), rich list (vertical) - to confirm the correct macro import, required parameters, and slot usage, or to check a pattern's structure/macro signature hasn't been changed during review.
---

# Vanilla Patterns - LLM Agent Guide

This document serves as a comprehensive reference for implementing Vanilla Framework patterns as Jinja macros, derived from the actual macro implementations. Each pattern is documented with its precise macro signature, parameters, and usage.

**Important:** This guide is auto-generated from actual macro code. When reviewing code, use this as the authoritative reference for macro signatures, required parameters, and correct usage patterns.

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

**Macro signature:**
```jinja
{% call(slot) vf_hero(
  title_text,                              # (required) H1 title text
  subtitle_text='',                        # (optional) Subtitle text
  layout='fallback',                       # (optional) Layout: '50/50', '50/50-full-width-image', '75/25', '25/75', 'fallback'
  is_split_on_medium=false,                # (optional) Layout split on medium screens
  display_blank_signpost_image_space=false,# (optional) For 25/75 layout
  blocks=[]                                # (optional) Array of content blocks
) %}
  {# Deprecated: These slots are no longer preferred. Use blocks array instead. #}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
  {% if slot == 'image' %}...{% endif %}
  {% if slot == 'signpost_image' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): The H1 heading text.
- `subtitle_text` (string, optional): Optional H2-styled subtitle. Default: "".
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
- Use blocks array instead of deprecated caller slots

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
  top_rule_variant="default",            # (optional) 'default' or 'muted'
  override_last_item_padding=false,      # (optional) Add padding to last item
  attrs={}                               # (optional) HTML attributes for section
) }}
```

**Parameters:**
- `title` (object, required): {text: "title" (required), link_attrs: {...} (optional)}
- `label_text` (string, optional): Muted heading above title. Default: "".
- `subtitle` (object, optional): {text: "subtitle", heading_level: 4|5}. Default: {}.
- `items` (array, optional): Content blocks. Each has `type` and `item`. Default: [].
- `is_split_on_medium` (boolean, optional): Splits 50/50 on medium screens. Default: false (splits only on large).
- `top_rule_variant` (string, optional): 'default' or 'muted'. Default: 'default'.
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.
- `override_last_item_padding` (boolean, optional): Override no-padding on last item. Default: false.
- `attrs` (object, optional): HTML attributes for section element.

**Supported item types:**
- `description`: {type: "text"|"html", content: "..."}
- `image`: {aspect_ratio: "16-9"|"3-2"|"2-3"|"cinematic", is_highlighted: bool, is_cover: bool, caption_html: "...", attrs: {...}}
- `video`: {attrs: {for iframe}}
- `notification`: {type: "information"|"caution"|"negative"|"positive", title: "...", content: "..."}
- `list`: {list_items: [{list_item_type: "bullet"|"tick"|"cross"|"number", content: "..."}]}
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
- `title` (object, required): {text: "...", link_attrs: {...} (optional)}
- `articles` (array, optional): Static articles. Default: [].
  - Each: {title: {text, link_attrs?}, description: {text}, image: {attrs: {src, alt}}, metadata: {authors: [...], date: {text}}}
- `template_config` (object, optional): For dynamic loading.
  - enabled (bool): true to enable template mode
  - layout (string): "3-blocks" or "4-blocks"
  - template_container_id (string): Container ID
  - template_id (string): Template ID
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.
- `top_rule_variant` (string, optional): 'default' or 'muted'. Default: 'default'.

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
  blocks=[],                             # (optional) Array of block objects
  padding="default",                     # (optional) 'default', 'deep', or 'shallow'
  is_split_on_medium=false,              # (optional) 50/50 on medium+
  top_rule_variant="default"             # (optional) 'default' or 'muted'
) }}
```

**Parameters:**
- `title` (object, required): {text: "...", link_attrs: {...} (optional)}
- `blocks` (array, optional): Content blocks (same structure as basic section).
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.
- `is_split_on_medium` (boolean, optional): 50/50 split on medium+. Default: false.
- `top_rule_variant` (string, optional): 'default' or 'muted'. Default: 'default'.

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
  top_rule_variant="default"             # (optional) 'default', 'muted', 'highlighted', 'none'
) %}
  {% if slot == 'title' %}...{% endif %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'description_cta' %}...{% endif %}
  {% if slot == 'list_item_title_1' %}...{% endif %}
  {% if slot == 'list_item_description_1' %}...{% endif %}
  {% if slot == 'list_item_cta_1' %}...{% endif %}
  {# ... list_item_title_N through list_item_description_N (supports up to 25 items) #}
  {% if slot == 'cta' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.
- `is_description_full_width_on_desktop` (boolean, optional): Description full-width on desktop. Default: true.
- `is_list_full_width_on_tablet` (boolean, optional): List full-width on tablet. Default: true.
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', 'none'. Default: 'default'.

**Slots (up to 25 list items):**
- `title`: Top-level title (h2)
- `description`: Top-level description
- `description_cta`: CTA in description area
- `list_item_title_N`: Title for item N
- `list_item_description_N`: Description for item N
- `list_item_cta_N`: CTA for item N
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

**Notes:** Items are rendered with specified heading level and separated by horizontal rules.

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
  padding="default",                     # (optional) 'default' or 'deep'
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
- `padding` (string, optional): 'default' or 'deep'. Default: 'default'.
- `blocks` (array, required): Block objects.
  - `cta-block`: {type: "cta-block", item: {primary: {...}, secondaries: [...], link: {...}}}
  - `logo-block`: {type: "logo-block", item: {logos: [{src: "...", alt: "..."}]}}
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
  - `image_html` (string, required): Logo image HTML
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
  - `tier_price_explanation` (string, optional): Price details
  - `tier_description_html` (string, optional): Tier description
  - `tier_label_text` (string, optional): Label text
  - `tier_offerings` (array, required): Features list
    - Each item: {list_item_style: "ticked"|"crossed"|undefined, list_item_content_html: "..."}
  - `cta_html` (string, optional): CTA button HTML
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', 'none'. Default: 'highlighted'.
- `attrs` (object, optional): HTML attributes.

**Layout:** Determined by tier count:
- 1 tier → single column
- 2 tiers → 50-50 split
- 3 tiers → 25-75 split
- 4+ tiers → equal columns

**Slots:**
- `section_description`: Description text below title

---

## CTA section

**Purpose:** Call-to-action section with title, description, and action buttons.

**Jinja import:**
```jinja
{% from "_macros/vf_cta-section.jinja" import vf_cta_section %}
```

**Macro signature:**
```jinja
{% call(slot) vf_cta_section(
  title_text,                            # (required) H2 title
  variant='default',                     # (optional) 'default' or 'block'
  layout='100',                          # (optional) '100' or '25-75'
  caller=None,                           # Internal parameter
  attrs={},                              # (optional) HTML attributes
  blocks=[]                              # (optional) Array of blocks
) %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title.
- `variant` (string, optional): 'default' (title + link) or 'block' (title + description + CTA). Default: 'default'.
- `layout` (string, optional): '100' (full-width) or '25-75' (split). Default: '100'.
- `blocks` (array, optional): Content blocks (description, cta types).
- `attrs` (object, optional): HTML attributes.

**Slots:**
- `description`: Description content
- `cta`: CTA content/buttons

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
  input_label="Work email",              # (optional) Email input label
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
- `input_label` (string, optional): Email input label. Default: "Work email".
- `checkbox_id` (string, optional): Checkbox field name. Default: "canonicalUpdatesOptIn".
- `checkbox_label` (string, optional): Checkbox label text.
- `layout` (string, optional): '50-50', '25-75' (section layouts), '2-col', '4-col' (grid layouts). Default: '25-75'.
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', 'none'. Default: 'default'.
- `hide_newsletter_block_rule` (boolean, optional): Hide divider on small screens. Default: false.
- `submit_btn_class` (string, optional): CSS classes for button. Default: "js-submit-button".

**Slots:**
- `description`: Description text
- `addendum`: Additional content (disclaimer, etc.)
- `hidden_fields`: Extra hidden form fields
- `honeypot_fields`: Spam-prevention honeypot fields
- `col_N`: Column content for grid layouts (2-col, 4-col)

---

## Resources

**Purpose:** Display resources with images, descriptions, and CTAs using basic section patterns.

**Jinja import:**
```jinja
{% from "_macros/vf_resources.jinja" import vf_resources %}
```

**Note:** This pattern uses internal helper macros and the basic section structure. Refer to basic section for parameter details.

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
- `list_item_N`: List items (1-8)

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
  - `attrs` (object, optional): HTML attributes for img/iframe.
- `is_flipped` (boolean, optional): Swap content/media order. Default: false.
- `padding` (string, optional): 'default', 'deep', 'shallow'. Default: 'default'.
- `top_rule_variant` (string, optional): 'default' or 'muted'. Default: 'default'.
- `attrs` (object, optional): HTML attributes for section.

**Notes:**
- 'auto-height' ratio is only valid for large screens (side-by-side layout)
- Media types must match their corresponding attributes (image requires img attrs, video requires iframe attrs)

---

## Implementation Notes

### General Guidelines
1. **Always import from `_macros/`** directory at template start
2. **Parameter types matter**: strings vs objects vs arrays
3. **Required parameters**: Will error if omitted
4. **Optional parameters**: Have documented defaults
5. **Slots vs. direct params**: Each pattern uses one approach; review carefully

### Caller/Slot Patterns
Patterns using `{% call(slot) %}` must provide all required slots via `{% if slot == 'name' %}...{% endif %}`.

### Block Arrays
Patterns using blocks arrays expect: `{type: "...", item: {...}, padding: "shallow" (optional)}`

### Responsive Classes
Most patterns use Vanilla's grid system: `grid-row--50-50-on-large`, `grid-col`, etc.

### HTML Safety
Content marked `html` is rendered with `| safe` filter. Ensure all user input is sanitized before passing.

---

**Last updated:** 2025-09-28 (derived from actual macro implementations)
