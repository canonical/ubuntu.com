---
name: vanilla-patterns
description: Reference guide for correctly implementing Vanilla Framework Jinja macro patterns. Use whenever creating or editing any of the following patterns in a Jinja template - hero, basic section, equal heights, blog, data spotlight, divided section, tiered list, text spotlight, logo section, linked logo section, quote wrapper, pricing block, CTA section, tab section, newsletter signup, resources, rich list (horizontal), rich list (vertical) - to confirm the correct macro import, required parameters, and slot usage, or to check a pattern's structure/macro signature hasn't been changed during review.
---

# Vanilla Patterns - LLM Agent Guide

This document serves as a comprehensive guide for Copilot agents to understand and implement Vanilla Framework patterns as Jinja macros. Each pattern is documented with its use case, parameters, structure, and practical examples.

## Overview

Vanilla Framework provides reusable Jinja macros that render common content layout patterns. These patterns are designed to work together and help maintain consistency across web applications built with Vanilla.

You should import all required macros at the beginning of the Jinja template before using them. Most patterns accept a combination of required and optional parameters that control their appearance and behavior.

**When to use this skill:** whenever a template change adds, edits, or reviews one of the patterns listed in the table of contents below. Jump to the matching section and follow its macro import, macro signature, parameters, and slots exactly - do not invent parameters or slot names that aren't documented here.

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

**Purpose:** Create a prominent banner section with a title (h1), optional subtitle, description, call-to-action, and images. Typically used for page headers to quickly capture user attention.

**Key points:**
- Required param: `title_text` (renders as `h1`).
- Layouts: `'50/50'`, `'50/50-full-width-image'`, `'75/25'`, `'25/75'`, `'fallback'`.
- Supports blocks array for flexible content organization (description, cta-block, image, etc.)
- Responsive: stacks on small/medium, splits on large screens.

**Jinja import:**
```jinja
{% from "_macros/vf_hero.jinja" import vf_hero %}
```

**Macro signature:**
```jinja
{% call(slot) vf_hero(
  title_text='H1 heading text' (required),
  subtitle_text='Optional subtitle',
  layout='50/50',  # or '50/50-full-width-image', '75/25', '25/75', 'fallback'
  blocks=[...]     # Array of content blocks
) %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
  {% if slot == 'image' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H1 title text.
- `subtitle_text` (string, optional): H2-styled subtitle. Default: "".
- `layout` (string, optional): Control layout variant. Options: '50/50', '50/50-full-width-image', '75/25', '25/75', 'fallback'. Default: 'fallback'.
- `is_split_on_medium` (boolean, optional): Whether layout is split on medium (tablet) screens. If false, layout stacks on tablet. Default: false.
- `display_blank_signpost_image_space` (boolean, optional): For 25/75 layout, indent content to leave space for signpost image on large screens. Default: false.
- `blocks` (`Array<Object>`, optional): Array of content blocks (description, cta-block, image, signpost_image). Default: [].

**Content blocks structure:**
```json
{
  "type": "description|cta-block|image",
  "padding": "shallow",
  "item": {
    "type": "text|html",
    "content": "Block content here",
    "aspect_ratio": "16-9|3-2|etc",
    "attrs": {"src": "...", "alt": "..."}
  }
}
```

**Example usage:**
```jinja
{% from "_macros/vf_hero.jinja" import vf_hero %}

{% call(slot) vf_hero(
  title_text='Welcome to our product',
  subtitle_text='Short subtitle',
  layout='50/50',
  blocks=[
    {
      "type": "description",
      "padding": "shallow",
      "item": {
        "type": "text",
        "content": "Short description about the product."
      }
    },
    {
      "type": "cta-block",
      "padding": "shallow",
      "item": {
        "primary": {
          "content_html": "Get started",
          "attrs": {"href": "/signup"}
        },
        "link": {
          "content_html": "Learn more ›",
          "attrs": {"href": "/about"}
        }
      }
    },
    {
      "type": "image",
      "item": {
        "aspect_ratio": "3-2",
        "attrs": {
          "src": "/assets/hero.jpg",
          "alt": "Hero image"
        }
      }
    }
  ]
) %}
{% endcall %}
```

**Notes:**
- Use `'50/50-full-width-image'` layout for hero images that should span full width.
- For 25/75 signpost layout, provide a small icon/logo image.
- Import full Vanilla SCSS for consistent styling.

---

## Basic section

**Purpose:** Create structured content sections with a title, subtitle, and flexible content blocks. Provides layout system for text, images, videos, lists, code blocks, logos, and CTAs.

**Key points:**
- Required param: `title` (renders as `h2`).
- Flexible item array for mixed content types.
- Default: 50/50 grid layout splitting on large screens.
- Supports label (muted heading above title).
- Customizable padding and top rule variants.

**Jinja import:**
```jinja
{% from "_macros/vf_basic-section.jinja" import vf_basic_section %}
```

**Macro signature:**
```jinja
{{ vf_basic_section(
  title={'text': 'Section title'} (required),
  label_text='Optional label',
  subtitle={'text': 'Optional subtitle'},
  items=[...]  # Array of content blocks
) }}
```

**Parameters:**
- `title` (Object, required): Title object with required `text` property (renders as h2) and optional `link_attrs` (Object) to make title clickable.
- `title.text` (string, required): The main title text.
- `title.link_attrs` (Object, optional): Anchor element attributes to make title a link.
- `label_text` (string, optional): Muted heading text displayed above the title. Default: "".
- `subtitle` (Object, optional): Subtitle object with required `text` property and optional `heading_level` (4 or 5). Default: {}.
- `subtitle.text` (string, required if subtitle provided): Subtitle text.
- `subtitle.heading_level` (number, optional): Heading level for subtitle (4-5). Default: 4.
- `items` (`Array<Object>`, optional): Array of content block objects. Default: [].
- `is_split_on_medium` (boolean, optional): 50/50 grid layout on medium+ screens. Default: false.
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', or 'none'. Default: 'default'.
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Controls section padding. Default: 'default'.
- `attrs` (Object, optional): Attributes to apply to the basic section wrapper.
- `override_last_item_padding` (boolean, optional): Override no-padding on last item. Default: false.

**Content blocks structure:**
```json
{
  "type": "description|image|list|code|logo-block|video|cta-block",
  "item": {
    "type": "text|html",
    "content": "Content here",
    "aspect_ratio": "16-9",
    "list_items": [{"list_item_type": "tick", "content": "..."}],
    "caption_html": "Optional caption",
    "attrs": {"src": "...", "alt": "..."}
  }
}
```

**Example usage:**
```jinja
{% from "_macros/vf_basic-section.jinja" import vf_basic_section %}

{{ vf_basic_section(
  label_text="Product Overview",
  title={"text": "Ubuntu Server"},
  subtitle={"text": "The world's most popular Linux server platform"},
  items=[
    {
      "type": "description",
      "item": {
        "type": "html",
        "content": "<p>Ubuntu Server provides the best value scale-out performance.</p>"
      }
    },
    {
      "type": "image",
      "item": {
        "aspect_ratio": "16-9",
        "caption_html": "Ubuntu Server in production",
        "attrs": {
          "src": "https://assets.ubuntu.com/server.png",
          "alt": "Ubuntu Server"
        }
      }
    },
    {
      "type": "list",
      "item": {
        "list_items": [
          {"list_item_type": "tick", "content": "Enhanced security"},
          {"list_item_type": "tick", "content": "Optimized performance"}
        ]
      }
    }
  ]
) }}
```

**Notes:**
- Items support various content types: descriptions, images, videos, lists, code blocks, logos.
- Use `is_split_on_medium=true` for two-column layout on medium+ screens.
- Each item can have independent padding configuration.
- Default section padding applies automatically.

---

## Equal heights

**Purpose:** Display multiple items in a responsive grid with consistent heights. Useful for features, services, or card-based layouts.

**Key points:**
- Required params: `title_text`, `items` array.
- Responsive grid: 4 columns (if divisible by 4), 3 columns (if divisible by 3), or 2 columns.
- Item fields: `title_text`, `description_html`, `image_html`, `cta_html`.
- Supports highlighted images for illustrations.
- Customizable image aspect ratios.

**Jinja import:**
```jinja
{% from "_macros/vf_equal-heights.jinja" import vf_equal_heights %}
```

**Macro signature:**
```jinja
{% call(slot) vf_equal_heights(
  title_text='Section title' (required),
  items=[...]  # Array of item objects
) %}
  {% if slot == 'description' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title text.
- `attrs` (Object, optional): Attributes to apply to the equal heights pattern wrapper.
- `subtitle_text` (string, optional): H4 or H5 subtitle text.
- `subtitle_heading_level` (number, optional): 4 or 5. Default: 5.
- `highlight_images` (boolean, optional): Whether to highlight images within the pattern. Default: false.
- `image_aspect_ratio_small` (string, optional): Aspect ratio on small screens. Default: 'square'.
- `image_aspect_ratio_medium` (string, optional): Aspect ratio on medium screens. Default: 'square'.
- `image_aspect_ratio_large` (string, optional): Aspect ratio on large screens. Default: '2-3'.
- `items` (`Array<Object>`, required): Array of item objects.
  - `items[].title_text` (string, required): Item title.
  - `items[].title_link_attrs` (Object, optional): Anchor element attributes to make item title a link.
  - `items[].description_html` (string, optional): Item description HTML.
  - `items[].image_html` (string, optional): Item image HTML.
  - `items[].cta_html` (string, optional): Call-to-action HTML.

**Slots:**
- `description` (optional): Description content displayed on the right side for the title area.

**Example usage:**
```jinja
{% from "_macros/vf_equal-heights.jinja" import vf_equal_heights %}

{% call(slot) vf_equal_heights(
  title_text="Our Services",
  subtitle_text="What we offer",
  attrs={"id": "services-section"},
  items=[
    {
      "title_text": "Cloud Solutions",
      "image_html": "<img src='cloud.png' alt='Cloud' />",
      "description_html": "<p>Enterprise-grade cloud infrastructure.</p>",
      "cta_html": "<a href='#'>Learn more ›</a>"
    },
    {
      "title_text": "DevOps Tools",
      "image_html": "<img src='devops.png' alt='DevOps' />",
      "description_html": "<p>Streamline your deployment pipeline.</p>",
      "cta_html": "<a href='#'>Explore tools ›</a>"
    },
    {
      "title_text": "Security",
      "image_html": "<img src='security.png' alt='Security' />",
      "description_html": "<p>Advanced threat protection.</p>",
      "cta_html": "<a href='#'>Get started ›</a>"
    },
    {
      "title_text": "Support",
      "image_html": "<img src='support.png' alt='Support' />",
      "description_html": "<p>24/7 dedicated support team.</p>",
      "cta_html": "<a href='#'>Contact us ›</a>"
    }
  ]
) %}
  {% if slot == "description" %}
    <p>Enterprise-grade solutions for your business needs.</p>
  {% endif %}
{% endcall %}
```

**Notes:**
- Number of items determines grid layout: 4 items = 4 columns, 6 items = 3 columns, 2 items = 2 columns.
- Parameter consistency: if one item has a description, all should have one for visual rhythm.
- Use `highlight_images=true` for illustration-based items.

---

## Blog

**Purpose:** Display a collection of blog articles in a grid layout. Articles include title, image, description, authors, and publication date.

**Key points:**
- Required param: `title` object with text.
- Two strategies: static content (articles array) or dynamic content (template mode for async loading).
- Layout variants: 4-block (default) or 3-block.
- Each article has: title, description, metadata (authors, date), and cover image.

**Jinja import:**
```jinja
{% from "_macros/vf_blog.jinja" import vf_blog %}
```

**Macro signature:**
```jinja
{{ vf_blog(
  title={'text': 'Blog title'} (required),
  articles=[...],  # Array of article objects (static mode)
  template_config={...}  # Config for dynamic mode
) }}
```

**Parameters (Static mode):**
- `title` (Object, required): Title configuration with required `text` property and optional `link_attrs` (Object) to make title clickable.
  - `title.text` (string, required): The main title text.
  - `title.link_attrs` (Object, optional): Anchor element attributes to make title a link.
- `articles` (`Array<Object>`, optional): Array of article objects for static content. Default: [].
  - `articles[].title` (Object, required): Article title with `text` and optional `link_attrs`.
    - `title.text` (string, required): Article title text.
    - `title.link_attrs` (Object, optional): Article link attributes.
  - `articles[].description` (Object, required): Description with `text`.
    - `description.text` (string, required): Article description text.
  - `articles[].image` (Object, optional): Image object with `attrs` containing `src` and `alt`.
  - `articles[].metadata` (Object, optional): Article metadata.
    - `metadata.authors` (Array, optional): Array of author objects with `text` and optional `link_attrs`.
    - `metadata.date` (Object, optional): Date object with `text`.

**Parameters (Dynamic mode):**
- `title` (Object, required): Title configuration (same as static mode).
- `template_config` (Object): Configuration for async content loading.
  - `enabled` (boolean): Enable template mode (for @canonical/latest-news module).
  - `layout` (string, required if enabled): "3-blocks" or "4-blocks".
  - `template_container_id` (string): Container ID for articles. Default: "articles".
  - `template_id` (string): Template ID for article template. Default: "template".

**Additional Parameters (both modes):**
- `padding` (string, optional): Section padding variant ('default', 'deep', 'shallow'). Default: 'default'.
- `top_rule_variant` (string, optional): Top rule style ('default', 'muted'). Default: 'default'.
- `fallback_image_url` (string, optional): Default image URL when article image not provided. Default: Ubuntu blog fallback image.

**Example usage (Static):**
```jinja
{% from "_macros/vf_blog.jinja" import vf_blog %}

{{ vf_blog(
  title={"text": "Latest from our blog"},
  articles=[
    {
      "title": {
        "text": "How to enable Real-time Ubuntu",
        "link_attrs": {"href": "/article-1"}
      },
      "description": {
        "text": "Learn how to optimize Ubuntu for real-time workloads."
      },
      "metadata": {
        "authors": [
          {"text": "John Doe", "link_attrs": {"href": "/author/john"}}
        ],
        "date": {"text": "15 March 2025"}
      }
    },
    {
      "title": {
        "text": "Ubuntu in the Cloud",
        "link_attrs": {"href": "/article-2"}
      },
      "description": {
        "text": "Discover the benefits of running Ubuntu in cloud environments."
      },
      "metadata": {
        "authors": [
          {"text": "Jane Smith"}
        ],
        "date": {"text": "10 March 2025"}
      }
    },
    {
      "title": {
        "text": "Security Best Practices",
        "link_attrs": {"href": "/article-3"}
      },
      "description": {
        "text": "Essential security tips for production systems."
      },
      "metadata": {
        "authors": [
          {"text": "Bob Wilson"}
        ],
        "date": {"text": "5 March 2025"}
      }
    },
    {
      "title": {
        "text": "Container Orchestration",
        "link_attrs": {"href": "/article-4"}
      },
      "description": {
        "text": "Master Kubernetes on Ubuntu for enterprise deployments."
      },
      "metadata": {
        "authors": [
          {"text": "Alice Johnson"}
        ],
        "date": {"text": "1 March 2025"}
      }
    }
  ]
) }}
```

**Example usage (Dynamic with @canonical/latest-news):**
```jinja
{% from "_macros/vf_blog.jinja" import vf_blog %}

{{ vf_blog(
  title={"text": "Latest from our blog"},
  template_config={
    "enabled": true,
    "layout": "4-blocks",
    "template_container_id": "articles",
    "template_id": "article-template"
  }
) }}

<script>
// JavaScript to populate the template
canonicalLatestNews.fetchLatestNews({
  imageClasses: ["p-image-container__image"],
  limit: "4",
  articlesContainerSelector: "#articles",
  articleTemplateSelector: "#article-template",
  excerptLength: 180
});
</script>
```

**Notes:**
- Use 4-block layout for maximum 4 articles, 3-block for 3 articles.
- Dynamic mode requires @canonical/latest-news v2.1.0+.
- Each article must include title, description, and at least one author/date in metadata.

---

## Data spotlight

**Purpose:** Display key statistics as the main content, supported by headlines and optional descriptions. Used to highlight important metrics or achievements.

**Key points:**
- Required params: `title`, `blocks` array.
- Each block has: `stat` (required), `headline`, `description`, `link`.
- Variants based on block count: 4-blocks, 3-blocks, 2-blocks.
- Responsive layout that adapts to screen size.

**Jinja import:**
```jinja
{% from "_macros/vf_data-spotlight.jinja" import vf_data_spotlight %}
```

**Macro signature:**
```jinja
{{ vf_data_spotlight(
  title={'text': 'Section title'} (required),
  blocks=[...]  # Array of data spotlight blocks
) }}
```

**Parameters:**
- `title` (Object, required): Title configuration with required `text` property and optional `link_attrs` (Object) to make title clickable.
  - `title.text` (string, required): The main title text (rendered as h2).
  - `title.link_attrs` (Object, optional): Anchor element attributes to make title a link.
- `blocks` (`Array<Object>`, required): Array of data spotlight block objects.
  - `blocks[].stat` (string, required): The statistic/number to display.
  - `blocks[].headline` (string, optional): Headline for the stat.
  - `blocks[].description` (string, optional): Description text.
  - `blocks[].link` (Object, optional): Link object with `url` and `text` properties.

**Example usage:**
```jinja
{% from "_macros/vf_data-spotlight.jinja" import vf_data_spotlight %}

{{ vf_data_spotlight(
  title={"text": "Canonical in numbers"},
  blocks=[
    {
      "stat": "100+",
      "headline": "Happy customers",
      "description": "Trusted by enterprises worldwide",
      "link": {"url": "#", "text": "Learn more ›"}
    },
    {
      "stat": "500+",
      "headline": "Cloud deployments",
      "description": "In production globally",
      "link": {"url": "#", "text": "See case studies ›"}
    },
    {
      "stat": "~30 min",
      "headline": "Setup time",
      "description": "Fast deployment of solutions",
      "link": {"url": "#", "text": "Get started ›"}
    },
    {
      "stat": "24/7",
      "headline": "Customer support",
      "description": "Always available for you",
      "link": {"url": "#", "text": "Contact support ›"}
    }
  ]
) }}
```

**Notes:**
- Grid layout automatically adjusts: 4 items = 4 columns, 3 items = 3 columns, 2 items = 2 columns.
- All optional fields can be omitted, showing only stats if needed.
- Responsive design ensures readability on all screen sizes.

---

## Divided section

**Purpose:** Create structured content sections with divided blocks for complex layouts. Similar to basic section but with support for grouped content and different block types.

**Key points:**
- Required param: `title`.
- Supports two block types: `description-block` and `divided-block`.
- Flexible content organization within blocks.
- Default: 50/50 grid layout splitting on large screens.
- Uses same content blocks as basic section.

**Jinja import:**
```jinja
{% from "_macros/vf_divided-section.jinja" import vf_divided_section %}
```

**Macro signature:**
```jinja
{{ vf_divided_section(
  title={'text': 'Section title'} (required),
  blocks=[...]  # Array of block objects
) }}
```

**Parameters:**
- `title` (Object, required): Title object with `text` property.
- `title_link_attrs` (Object, optional): Makes title clickable.
- `blocks` (`Array<Object>`, required): Array of block objects.
  - Block type `description-block`:
    - `type`: "description-block"
    - `items`: Array of content blocks (same as basic section)
  - Block type `divided-block`:
    - `type`: "divided-block"
    - `bullet_type`: "number" | "bullet" | "status" | "none"
    - `items`: Array of divided items with `title_text` and `contents` array

**Example usage:**
```jinja
{% from "_macros/vf_divided-section.jinja" import vf_divided_section %}

{{ vf_divided_section(
  title={"text": "Product Features"},
  blocks=[
    {
      "type": "description-block",
      "items": [
        {
          "type": "description",
          "item": {
            "type": "html",
            "content": "<p>Our product offers comprehensive solutions.</p>"
          }
        }
      ]
    },
    {
      "type": "divided-block",
      "bullet_type": "number",
      "items": [
        {
          "title_text": "Easy Setup",
          "contents": [
            {
              "type": "description",
              "item": {
                "type": "text",
                "content": "Get started in minutes."
              }
            }
          ]
        },
        {
          "title_text": "Scalable",
          "contents": [
            {
              "type": "description",
              "item": {
                "type": "text",
                "content": "Grows with your business."
              }
            }
          ]
        }
      ]
    }
  ]
) }}
```

**Notes:**
- Description block typically appears first to provide context.
- Divided blocks can use bullet_type: number, bullet, status, or none.
- Reuses content block structure from basic section pattern.

---

## Tiered list

**Purpose:** Display a list of paired titles and descriptions underneath a top-level title and description. Useful for feature lists, partnership tiers, or service descriptions.

**Key points:**
- Required param: `title` (renders as h2).
- Supports multiple layout variants (50/50 on desktop/tablet, full-width).
- Optional CTA blocks at pattern, description, and item levels.
- Uses Jinja call syntax with slots for content.

**Jinja import:**
```jinja
{% from "_macros/vf_tiered-list.jinja" import vf_tiered_list %}
```

**Macro signature:**
```jinja
{% call(slot) vf_tiered_list(
  is_description_full_width_on_desktop=false,
  is_list_full_width_on_tablet=false
) %}
  {% if slot == 'title' %}...{% endif %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'description_cta' %}...{% endif %}
  {% if slot == 'list_item_title_N' %}...{% endif %}
  {% if slot == 'list_item_description_N' %}...{% endif %}
  {% if slot == 'list_item_cta_N' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `is_description_full_width_on_desktop` (boolean, optional): Make description full-width on desktop. Default: true.
- `is_list_full_width_on_tablet` (boolean, optional): Make list full-width on tablet. Default: true.

**Slots:**
- `title`: Top-level h2 title
- `description`: Top-level description text
- `description_cta`: CTA block within description
- `list_item_title_N`: Title for list item N (1-based, supports up to 9 items)
- `list_item_description_N`: Description for list item N
- `list_item_cta_N`: CTA block for list item N
- `cta`: CTA block at bottom of pattern

**Example usage:**
```jinja
{% from "_macros/vf_tiered-list.jinja" import vf_tiered_list %}

{% call(slot) vf_tiered_list(
  is_description_full_width_on_desktop=false,
  is_list_full_width_on_tablet=true
) %}
  {% if slot == 'title' %}
    <h2>Partner Program Tiers</h2>
  {% endif %}

  {% if slot == 'description' %}
    <p>Choose the partnership tier that best fits your business.</p>
  {% endif %}

  {% if slot == 'list_item_title_1' %}
    <h3 class="p-heading--5">Silver Partner</h3>
  {% endif %}

  {% if slot == 'list_item_description_1' %}
    <p>Gain access to partner resources and certification programs.</p>
  {% endif %}

  {% if slot == 'list_item_title_2' %}
    <h3 class="p-heading--5">Gold Partner</h3>
  {% endif %}

  {% if slot == 'list_item_description_2' %}
    <p>Premium support, dedicated account manager, and co-marketing opportunities.</p>
  {% endif %}

  {% if slot == 'list_item_title_3' %}
    <h3 class="p-heading--5">Platinum Partner</h3>
  {% endif %}

  {% if slot == 'list_item_description_3' %}
    <p>Full suite of services, strategic planning, and revenue sharing benefits.</p>
  {% endif %}

  {% if slot == 'cta' %}
    <a class="p-button--positive" href="/contact">Apply now</a>
  {% endif %}
{% endcall %}
```

**Notes:**
- Use slots to provide content for each section.
- Supports optional CTA blocks at description and item levels.
- Multiple layout variants available (50/50 desktop, full-width, etc.).

---

## Text spotlight

**Purpose:** Create a prominent section with a title and list of items separated by horizontal rules. Typically used to highlight key benefits, features, or action items.

**Key points:**
- Required params: `title_text`, `list_items` array.
- List items are text or HTML strings (2-7 items).
- Can apply h2 or h4 styling to items.
- Responsive with horizontal dividers between items.

**Jinja import:**
```jinja
{% from "_macros/vf_text-spotlight.jinja" import vf_text_spotlight %}
```

**Macro signature:**
```jinja
{% call(slot) vf_text_spotlight(
  title_text='Section title' (required),
  list_items=[...],  # Array of text/HTML strings
  item_heading_level=2  # 2 or 4, default: 2
) %}
  {% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title text.
- `list_items` (Array<string>, required): Array of text or HTML strings (minimum 2, maximum 7).
- `item_heading_level` (number, optional): Heading level for items: 2 or 4. Default: 2.

**Example usage:**
```jinja
{% from "_macros/vf_text-spotlight.jinja" import vf_text_spotlight %}

{% call(slot) vf_text_spotlight(
  title_text='Why choose our Data Science Stack?',
  list_items=[
    'Improve developer productivity',
    'Easy to use on any AI workstation',
    'Run your ML workloads in a secure environment',
    'Begin your AI journey on Ubuntu',
    'One vendor to support your AI stack',
    'Enterprise-grade support and SLAs'
  ]
) %}
{% endcall %}
```

**Example with H4 styling:**
```jinja
{% from "_macros/vf_text-spotlight.jinja" import vf_text_spotlight %}

{% call(slot) vf_text_spotlight(
  title_text='Key Benefits',
  item_heading_level=4,
  list_items=[
    'Faster deployment times',
    'Reduced operational costs',
    'Improved security posture'
  ]
) %}
{% endcall %}
```

**Example with links:**
```jinja
{% from "_macros/vf_text-spotlight.jinja" import vf_text_spotlight %}

{% call(slot) vf_text_spotlight(
  title_text='Resource Center',
  list_items=[
    '<a href="/docs">Read documentation</a>',
    '<a href="/tutorials">View tutorials</a>',
    '<a href="/api">API reference</a>'
  ]
) %}
{% endcall %}
```

**Notes:**
- Each item is separated by a horizontal rule.
- Items can be plain text or HTML strings (for links, styling, etc.).
- Default h2 styling, optional h4 styling via `item_heading_level=4`.

---

## Logo section

**Purpose:** Display logos alongside a title and optional description, with support for CTAs and flexible block arrangements.

**Key points:**
- Required param: `title` object.
- Flexible blocks array supporting `cta-block` and `logo-block` types.
- CTA blocks can have primary, secondary buttons, and links.
- Logo blocks contain arrays of logo objects with src, alt, and optional link attributes.

**Jinja import:**
```jinja
{% from "_macros/vf_logo-section.jinja" import vf_logo_section %}
```

**Macro signature:**
```jinja
{% call(slot) vf_logo_section(
  title={'text': 'Section title'},
  blocks=[...]  # Array of cta-block and logo-block objects
) %}
{% endcall %}
```

**Parameters:**
- `title` (Object, required): Title object with `text` property.
- `title_link_attrs` (Object, optional): Makes title clickable.
- `blocks` (`Array<Object>`, required): Array of block objects.
  - CTA block structure:
    ```json
    {
      "type": "cta-block",
      "item": {
        "primary": {"content_html": "Button text", "attrs": {"href": "..."}},
        "secondaries": [...],
        "link": {"content_html": "Link text", "attrs": {"href": "..."}}
      }
    }
    ```
  - Logo block structure:
    ```json
    {
      "type": "logo-block",
      "item": {
        "logos": [
          {"src": "logo.png", "alt": "Company"},
          {"src": "logo2.png", "alt": "Partner"}
        ]
      }
    }
    ```
- `padding` (string, optional): 'default' or 'deep'. Default: 'default'.

**Example usage:**
```jinja
{% from "_macros/vf_logo-section.jinja" import vf_logo_section %}

{% call(slot) vf_logo_section(
  title={"text": "Trusted by industry leaders"},
  blocks=[
    {
      "type": "cta-block",
      "item": {
        "link": {
          "content_html": "Become a partner ›",
          "attrs": {"href": "/partnerships"}
        }
      }
    },
    {
      "type": "logo-block",
      "item": {
        "logos": [
          {"src": "https://assets.ubuntu.com/v1/dell-logo.png", "alt": "Dell"},
          {"src": "https://assets.ubuntu.com/v1/hp-logo.png", "alt": "HP"},
          {"src": "https://assets.ubuntu.com/v1/lenovo-logo.png", "alt": "Lenovo"},
          {"src": "https://assets.ubuntu.com/v1/aws-logo.png", "alt": "AWS"},
          {"src": "https://assets.ubuntu.com/v1/ibm-logo.png", "alt": "IBM"},
          {"src": "https://assets.ubuntu.com/v1/azure-logo.png", "alt": "Azure"}
        ]
      }
    }
  ]
) %}
{% endcall %}
```

**Notes:**
- CTA block supports primary buttons, secondary buttons, and links.
- Logo blocks contain arrays of logo objects.
- Use `padding="deep"` for increased spacing.

---

## Linked logo section

**Purpose:** Display logos as clickable links to external pages or resources. Simpler than logo section with focus on linked logos.

**Key points:**
- Required param: `links` array.
- Each link has: `href`, `text`, `label` (aria-label), `image_html`.
- Layout options: `full-width` (default, 8 logos max), `50-50` (6 logos max), `25-75` (9 logos max).
- Optional title.

**Jinja import:**
```jinja
{% from "_macros/vf_linked-logo-section.jinja" import vf_linked_logo_section %}
```

**Macro signature:**
```jinja
{{ vf_linked_logo_section(
  title_text='Optional title',
  layout='full-width',  # or '50-50', '25-75'
  links=[...]  # Array of link objects
) }}
```

**Parameters:**
- `title_text` (string, optional): H2 title text.
- `layout` (string, optional): 'full-width', '50-50', or '25-75'. Default: 'full-width'.
- `links` (`Array<Object>`, required): Array of link objects.
  - `links[].href` (string, required): Link URL.
  - `links[].text` (string, required): Link text.
  - `links[].label` (string, required): aria-label for accessibility.
  - `links[].image_html` (string, required): Logo image HTML.

**Example usage:**
```jinja
{% from "_macros/vf_linked-logo-section.jinja" import vf_linked_logo_section %}

{{ vf_linked_logo_section(
  title_text="Our partners",
  layout="full-width",
  links=[
    {
      "href": "https://dell.com",
      "text": "Dell Technologies",
      "label": "Dell Technologies",
      "image_html": "<img src='dell-logo.png' alt='Dell' />"
    },
    {
      "href": "https://hp.com",
      "text": "Hewlett Packard",
      "label": "HP Enterprise",
      "image_html": "<img src='hp-logo.png' alt='HP' />"
    },
    {
      "href": "https://lenovo.com",
      "text": "Lenovo",
      "label": "Lenovo",
      "image_html": "<img src='lenovo-logo.png' alt='Lenovo' />"
    },
    {
      "href": "https://aws.amazon.com",
      "text": "Amazon Web Services",
      "label": "AWS",
      "image_html": "<img src='aws-logo.png' alt='AWS' />"
    }
  ]
) }}
```

**Notes:**
- Each layout has maximum logo count: full-width (8), 50-50 (6), 25-75 (9).
- Fully responsive with appropriate responsive grid behavior.

---

## Quote wrapper

**Purpose:** Display a prominent quotation with optional citation, logo/signpost image, CTA, and associated image.

**Key points:**
- Required param: `quote_text`.
- Optional: header (title + link), signpost image, CTA, image, source.
- Quote size: h2, h4, or h6 (via `quote_size` parameter).
- Source includes: name, title, organization.

**Jinja import:**
```jinja
{% from "_macros/vf_quote-wrapper.jinja" import vf_quote_wrapper %}
```

**Macro signature:**
```jinja
{% call(slot) vf_quote_wrapper(
  title_text='Optional header title',
  quote_size='medium',  # or 'small', 'large'
  quote_text='Quote content' (required),
  citation_source_name_text='Name',
  citation_source_title_text='Title',
  citation_source_organisation_text='Organization',
  is_shallow=false
) %}
  {% if slot == 'heading_link' %}...{% endif %}
  {% if slot == 'signpost_image' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
  {% if slot == 'image' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, optional): Header title above quote. Default: "".
- `quote_size` (string, optional): 'small', 'medium', or 'large'. Default: 'medium'.
- `quote_text` (string, required): The quote text.
- `citation_source_name_text` (string, optional): Person's name. Default: "".
- `citation_source_title_text` (string, optional): Job title. Default: "".
- `citation_source_organisation_text` (string, optional): Company/organization name. Default: "".
- `is_shallow` (boolean, optional): Use shallow section padding. Default: false.

**Slots:**
- `heading_link` (optional): Link or content in heading row (beside title).
- `signpost_image` (optional): Small logo/icon image (left/top of quote).
- `cta` (optional): Call-to-action area.
- `image` (optional): Associated image.

**Example usage (with all elements):**
```jinja
{% from "_macros/vf_quote-wrapper.jinja" import vf_quote_wrapper %}

{% call(slot) vf_quote_wrapper(
  title_text='Why leading companies choose Ubuntu',
  quote_size='large',
  quote_text="Ubuntu has transformed how we deploy infrastructure. It's reliable, secure, and cost-effective.",
  citation_source_name_text="Jane Smith",
  citation_source_title_text="CTO",
  citation_source_organisation_text="Tech Corp Inc."
) %}
  {% if slot == 'heading_link' %}
    <a href="/testimonials">Read more testimonials ›</a>
  {% endif %}
  {% if slot == 'signpost_image' %}
    <img src="company-logo.png" alt="Company" />
  {% endif %}
  {% if slot == 'image' %}
    <img src="quote-image.jpg" alt="Customer testimonial" />
  {% endif %}
  {% if slot == 'cta' %}
    <a href="/contact" class="p-button">Get started</a>
  {% endif %}
{% endcall %}
```

**Example (minimal):**
```jinja
{% from "_macros/vf_quote-wrapper.jinja" import vf_quote_wrapper %}

{% call(slot) vf_quote_wrapper(
  quote_text="This solution exceeded all our expectations in performance and ease of use."
) %}
{% endcall %}
```

**Notes:**
- All optional elements can be omitted for minimal quote display.
- Signpost image typically shows company/brand logo.
- Source information helps establish credibility.

---

## Pricing block

**Purpose:** Display pricing tiers in card format with pricing details, descriptions, feature lists, and CTAs. Supports 1-4 pricing blocks with responsive grid.

**Key points:**
- Required params: `title`, `tiers` array.
- Each tier has: name, price, price explanation, description, offerings list.
- Offerings can use list item styles: tick, bullet, number.
- Layout variants: 4-blocks (25-25-25-25), 3-blocks (25-75), 2-blocks (50-50), 1-block.
- Optional rule variants: default, highlighted, muted.

**Jinja import:**
```jinja
{% from "_macros/vf_pricing-block.jinja" import vf_pricing_block %}
```

**Macro signature:**
```jinja
{% call(slot) vf_pricing_block(
  title_text='Pricing' (required),
  tiers=[...],  # Array of tier objects
  attrs={},
  top_rule_variant='default'  # or 'highlighted', 'muted', 'none'
) %}
  {% if slot == 'section_description' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title text.
- `tiers` (`Array<Object>`, required): Array of tier/pricing objects.
  - `tier_name_text` (string, optional): Tier name.
  - `tier_price_text` (string, required): Price value.
  - `tier_price_explanation` (string, required): Timeframe (e.g., "per month").
  - `tier_description_html` (string, optional): Tier description HTML.
  - `tier_label_text` (string, required): Header for offerings list.
  - `tier_offerings` (`Array<Object>`, required): Array of offering items.
    - `list_item_style` (string, optional): 'ticked' or 'crossed'.
    - `list_item_content_html` (string, required): Offering HTML content.
  - `cta_html` (string, optional): Call-to-action button HTML.
- `attrs` (Object, optional): Additional HTML attributes for the section.
- `top_rule_variant` (string, optional): 'default', 'highlighted', 'muted', or 'none'. Default: 'highlighted'.

**Example usage (4-blocks):**
```jinja
{% from "_macros/vf_pricing-block.jinja" import vf_pricing_block %}

{% call(slot) vf_pricing_block(
  title_text="Simple, transparent pricing",
  attrs={"id": "pricing-4-blocks"},
  tiers=[
    {
      "tier_name_text": "Starter",
      "tier_price_text": "$9",
      "tier_price_explanation": "per month",
      "tier_description_html": "<p>Perfect for getting started</p>",
      "tier_label_text": "What's included",
      "tier_offerings": [
        {"list_item_style": "ticked", "list_item_content_html": "5 projects"},
        {"list_item_style": "ticked", "list_item_content_html": "Community support"},
        {"list_item_style": "ticked", "list_item_content_html": "1GB storage"}
      ],
      "cta_html": "<a class='p-button' href='/signup'>Start free</a>"
    },
    {
      "tier_name_text": "Professional",
      "tier_price_text": "$29",
      "tier_price_explanation": "per month",
      "tier_description_html": "<p>For growing teams</p>",
      "tier_label_text": "What's included",
      "tier_offerings": [
        {"list_item_style": "ticked", "list_item_content_html": "Unlimited projects"},
        {"list_item_style": "ticked", "list_item_content_html": "Email support"},
        {"list_item_style": "ticked", "list_item_content_html": "100GB storage"}
      ],
      "cta_html": "<a class='p-button--positive' href='/signup'>Get started</a>"
    },
    {
      "tier_name_text": "Enterprise",
      "tier_price_text": "Custom",
      "tier_price_explanation": "contact sales",
      "tier_description_html": "<p>For large organizations</p>",
      "tier_label_text": "What's included",
      "tier_offerings": [
        {"list_item_style": "ticked", "list_item_content_html": "Everything in Pro"},
        {"list_item_style": "ticked", "list_item_content_html": "Dedicated support"},
        {"list_item_style": "ticked", "list_item_content_html": "Unlimited storage"},
        {"list_item_style": "ticked", "list_item_content_html": "Custom integrations"}
      ],
      "cta_html": "<a class='p-button' href='/contact'>Contact sales</a>"
    },
    {
      "tier_name_text": "Team",
      "tier_price_text": "$49",
      "tier_price_explanation": "per month",
      "tier_description_html": "<p>For collaborative teams</p>",
      "tier_label_text": "What's included",
      "tier_offerings": [
        {"list_item_style": "ticked", "list_item_content_html": "Unlimited projects"},
        {"list_item_style": "ticked", "list_item_content_html": "Priority support"},
        {"list_item_style": "ticked", "list_item_content_html": "500GB storage"}
      ],
      "cta_html": "<a class='p-button' href='/signup'>Start trial</a>"
    }
  ]
) %}
  {% if slot == 'section_description' %}
    <p>Choose the plan that fits your needs.</p>
  {% endif %}
{% endcall %}
```

**Notes:**
- Layout automatically adjusts based on tier count.
- Use rule variants to match page design.
- Each tier can have different offering counts and list styles.

---

## CTA section

**Purpose:** Create a prominent call-to-action section with title, description, and action buttons/links. Used to encourage user action as they scroll the page.

**Key points:**
- Required param: `title_text` (h2).
- Variants: 'default' (title + link/text) and 'block' (title + description + CTA block).
- Layout options: '100' (full-width) and '25-75' (asymmetric split).
- Rule variant: default, muted, or none.

**Jinja import:**
```jinja
{% from "_macros/vf_cta-section.jinja" import vf_cta_section %}
```

**Macro signature:**
```jinja
{% call(slot) vf_cta_section(
  title_text='Call to action' (required),
  variant='default',  # or 'block'
  layout='100',  # or '25-75'
  attrs={}
) %}
  {% if slot == 'cta' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title text.
- `variant` (string, optional): 'default' (simple text/link) or 'block' (full CTA block). Default: 'default'.
- `layout` (string, optional): '100' (full-width) or '25-75' (split). Default: '100'.
- `attrs` (Object, optional): Additional HTML attributes for the section.

**Slots:**
- `cta` (optional): CTA content (link text, buttons, etc.).

**Example usage (default variant):**
```jinja
{% from "_macros/vf_cta-section.jinja" import vf_cta_section %}

{% call(slot) vf_cta_section(
  title_text='Ready to transform your infrastructure?',
  variant='default',
  layout='100'
) %}
  {% if slot == 'cta' %}
    <a href="/contact" class="p-link--external">Get in touch ›</a>
  {% endif %}
{% endcall %}
```

**Example usage (block variant with full CTA):**
```jinja
{% from "_macros/vf_cta-section.jinja" import vf_cta_section %}

{% call(slot) vf_cta_section(
  title_text='Get started today',
  variant='block',
  layout='25-75'
) %}
  {% if slot == 'cta' %}
    <p><a href="/trial" class="p-button--positive">Start your trial</a></p>
    <p><a href="/pricing">View pricing ›</a></p>
  {% endif %}
{% endcall %}
```

**Notes:**
- Default variant works with simple text/links.
- Block variant supports full CTA block with buttons and links.
- Use layout '25-75' to highlight secondary content on the left.

---

## Tab section

**Purpose:** Organize related content into tabbed interface with title, optional description, CTA, and flexible content blocks in tabs.

**Key points:**
- Required params: `title`, `tabs` array.
- Tabs contain arrays of content blocks (description, code, image, etc.).
- Layout options: 'full-width', '50/50', '25/75'.
- Top rule variants: 'default', 'muted', 'none'.
- Padding variants: 'default', 'deep', 'shallow'.

**Jinja import:**
```jinja
{% from "_macros/vf_tab-section.jinja" import vf_tab_section %}
```

**Macro signature:**
```jinja
{{ vf_tab_section(
  title={'text': 'Section title'} (required),
  tabs=[...],  # Array of tab objects
  layout='full-width',  # or '50/50', '25/75'
  description_html='Optional intro',
  cta={...}
) }}
```

**Parameters:**
- `title` (Object, required): Title object with `text` property.
- `title_link_attrs` (Object, optional): Makes title clickable.
- `tabs` (`Array<Object>`, required): Array of tab objects.
  - `tab_label` (string, required): Label shown on tab.
  - `tab_id` (string, required): Unique tab identifier.
  - `contents` (`Array<Object>`, optional): Array of content blocks.
- `layout` (string, optional): 'full-width', '50/50', or '25/75'. Default: 'full-width'.
- `description_html` (string, optional): Section description.
- `cta` (Object, optional): CTA block configuration.
- `top_rule_variant` (string, optional): 'default', 'muted', or 'none'. Default: 'default'.
- `padding` (string, optional): 'default', 'deep', or 'shallow'. Default: 'default'.

**Example usage:**
```jinja
{% from "_macros/vf_tab-section.jinja" import vf_tab_section %}

{{ vf_tab_section(
  title={"text": "Getting started with our platform"},
  layout='full-width',
  tabs=[
    {
      "tab_label": "Installation",
      "tab_id": "installation",
      "contents": [
        {
          "type": "description",
          "item": {
            "type": "html",
            "content": "<p>Download and install our tools with a single command.</p>"
          }
        },
        {
          "type": "code",
          "item": {
            "code_block": "sudo apt install our-package",
            "language": "bash"
          }
        }
      ]
    },
    {
      "tab_label": "Configuration",
      "tab_id": "configuration",
      "contents": [
        {
          "type": "description",
          "item": {
            "type": "html",
            "content": "<p>Configure the system to your requirements.</p>"
          }
        }
      ]
    },
    {
      "tab_label": "Running",
      "tab_id": "running",
      "contents": [
        {
          "type": "description",
          "item": {
            "type": "html",
            "content": "<p>Start using the platform immediately.</p>"
          }
        }
      ]
    }
  ]
) }}
```

**Notes:**
- Tab IDs must be unique within the section.
- Title should be unique to avoid JavaScript conflicts with other tab sections.
- Supports multiple content block types per tab.
- Layout affects width distribution: full-width uses all space, 50/50 splits evenly, 25/75 emphasizes content.

---

## Newsletter signup

**Purpose:** Create newsletter subscription forms with flexible layouts. Users can subscribe to newsletters for updates.

**Key points:**
- Required params: `form_id`, `return_url`, `title_text`.
- Layout variants: '25-75' (default), '50-50', '2-col', '4-col'.
- 2-col and 4-col variants support adjacent grid content via slots.
- Form fields: email label, checkbox (opt-in), submit button.
- Uses Jinja call syntax with description and other optional slots.

**Jinja import:**
```jinja
{% from "_macros/vf_newsletter-signup.jinja" import vf_newsletter_signup %}
```

**Macro signature:**
```jinja
{% call(slot) vf_newsletter_signup(
  form_id='form-id' (required),
  return_url='https://...' (required),
  title_text='Newsletter' (required),
  layout='25-75',  # or '50-50', '2-col', '4-col'
  input_label='Work email',
  checkbox_id='checkbox-id',
  checkbox_label='I agree to receive updates'
) %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'addendum' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `form_id` (string, required): Unique form ID for form submission.
- `return_url` (string, required): URL to redirect after successful form submission.
- `title_text` (string, required): H2/H3 title text.
- `layout` (string, optional): '25-75', '50-50', '2-col', or '4-col'. Default: '25-75'.
- `form_action` (string, optional): Form submission endpoint. Default: Marketo endpoint.
- `input_label` (string, optional): Label for email input. Default: 'Work email'.
- `checkbox_id` (string, optional): ID for checkbox. Default: 'canonicalUpdatesOptIn'.
- `checkbox_label` (string, optional): Label for consent checkbox.
- `top_rule_variant` (string, optional): 'default', 'muted', 'highlighted', or 'none'. Default: 'default'.
- `hide_newsletter_block_rule` (boolean, optional): Hide rule on smaller screens (2-col/4-col). Default: false.
- `submit_btn_class` (string, optional): Additional CSS classes for submit button.

**Example usage (25-75 layout):**
```jinja
{% from "_macros/vf_newsletter-signup.jinja" import vf_newsletter_signup %}

{% call(slot) vf_newsletter_signup(
  form_id='newsletter-form-1',
  return_url='https://example.com/thanks',
  title_text='Stay updated',
  layout='25-75',
  input_label='Your email address',
  checkbox_id='newsletter-opt-in',
  checkbox_label='Send me updates'
) %}
  {% if slot == 'description' %}
    <p>Get the latest updates delivered to your inbox.</p>
  {% endif %}
{% endcall %}
```

**Example usage (2-col grid layout):**
```jinja
{% from "_macros/vf_newsletter-signup.jinja" import vf_newsletter_signup %}

<div class="p-grid">
  {% call(slot) vf_newsletter_signup(
    form_id='newsletter-form-2',
    return_url='https://example.com/thanks',
    layout='2-col',
    title_text='Newsletter',
    input_label='Your email',
    checkbox_id='newsletter-terms',
    checkbox_label='I accept terms',
    hide_newsletter_block_rule=false
  ) %}
    <!-- Additional grid content can go here using col_1, col_2, etc. slots -->
  {% endcall %}
</div>
```

**Notes:**
- 25-75 and 50-50 are full-width variants with form on the right.
- 2-col takes 2 columns on large (4 on medium/small), 4-col takes 4 columns on all sizes.
- 2-col variant includes muted rule on small screens, 4-col on small/medium.
- Form typically needs backend handler for email submission.

---

## Resources

**Purpose:** Display a collection of resources (articles, guides, videos, etc.) with categories, images/logos, titles, descriptions, and metadata.

**Key points:**
- Required params: `title`, `resources` array.
- Each resource has: category, image/logo, title, description, authors, publication date.
- Options: show/hide images, show/hide categories, text-only layout.
- Responsive grid layout.

**Jinja import:**
```jinja
{% from "_macros/vf_resources.jinja" import vf_resources %}
```

**Macro signature:**
```jinja
{{ vf_resources(
  title={'text': 'Resources'} (required),
  resources=[...],  # Array of resource objects
  description_html='Optional intro',
  has_images=true,
  has_categories=true,
  cta={...}
) }}
```

**Parameters:**
- `title` (Object, required): Title object with `text` property.
- `title_link_attrs` (Object, optional): Makes title clickable.
- `resources` (`Array<Object>`, required): Array of resource objects.
  - `category` (string, optional): Resource category (e.g., "Blog", "Video", "Guide").
  - `image_html` (string, optional): 16:9 image or logo HTML.
  - `title` (string, required): Resource title.
  - `title_link_attrs` (Object, optional): Makes resource title a link.
  - `description` (string, optional): Resource description.
  - `authors` (Array<string>, optional): List of author names (comma-separated in single string).
  - `date` (string, optional): Publication date.
- `description_html` (string, optional): Section description.
- `has_images` (boolean, optional): Show resource images. Default: true.
- `has_categories` (boolean, optional): Show resource categories. Default: true.
- `cta` (Object, optional): CTA block configuration.

**Example usage:**
```jinja
{% from "_macros/vf_resources.jinja" import vf_resources %}

{{ vf_resources(
  title={"text": "Learn from our resources"},
  description_html="<p>Comprehensive guides, tutorials, and documentation to help you succeed.</p>",
  resources=[
    {
      "category": "Blog",
      "image_html": "<img src='blog-post-1.jpg' alt='Article' />",
      "title": "Getting started with Ubuntu Server",
      "title_link_attrs": {"href": "/resources/ubuntu-server-guide"},
      "description": "A comprehensive guide to setting up and configuring Ubuntu Server for production environments.",
      "authors": "John Smith, Jane Doe",
      "date": "March 15, 2025"
    },
    {
      "category": "Video",
      "image_html": "<img src='video-thumbnail.jpg' alt='Video' />",
      "title": "Docker containers on Ubuntu",
      "title_link_attrs": {"href": "https://youtube.com/watch?v=..."},
      "description": "Learn how to containerize applications using Docker on Ubuntu.",
      "authors": "Tech Academy",
      "date": "March 10, 2025"
    },
    {
      "category": "Documentation",
      "image_html": "<img src='docs-icon.svg' alt='Documentation' />",
      "title": "API Reference",
      "title_link_attrs": {"href": "/docs/api"},
      "description": "Complete API documentation with examples and integration guides.",
      "authors": "Development Team",
      "date": "March 1, 2025"
    }
  ],
  cta={
    "primary": {
      "content_html": "Explore all resources",
      "attrs": {"href": "/resources"}
    }
  }
) }}
```

**Example usage (text-only, no images/categories):**
```jinja
{% from "_macros/vf_resources.jinja" import vf_resources %}

{{ vf_resources(
  title={"text": "Documentation"},
  resources=[
    {
      "title": "Installation Guide",
      "title_link_attrs": {"href": "/docs/install"},
      "description": "Step-by-step installation instructions."
    },
    {
      "title": "Configuration Reference",
      "title_link_attrs": {"href": "/docs/config"},
      "description": "Complete configuration option reference."
    }
  ],
  has_images=false,
  has_categories=false
) }}
```

**Notes:**
- Images are typically 16:9 aspect ratio for consistency.
- Categories and images can be toggled independently.
- Resources can have mixed image types (16:9, logo, none).
- Multiple authors should be comma-separated in single string.

---

## Rich list (horizontal)

**Purpose:** Display a list alongside title, optional logo section, description, and CTA. List items are arranged horizontally with dividers.

**Key points:**
- Required param: `title_text`.
- Optional slots: `image`, `description`, `logo_section_items`, `cta`, `list_item_1` through `list_item_12`.
- List item styles: bullet, tick, number, or empty (no styling).
- Layout variants: 'full-width' (default) or '50-50' (text/logo on left, list on right).
- Up to 12 list items supported.
- Uses Jinja call syntax with slots.

**Jinja import:**
```jinja
{% from "_macros/vf_rich-horizontal-list.jinja" import vf_rich_horizontal_list %}
```

**Macro signature:**
```jinja
{% call(slot) vf_rich_horizontal_list(
  title_text='Title' (required),
  layout='full-width',  # or '50-50'
  list_item_style='bullet'  # or 'tick', 'number', or ''
) %}
  {% if slot == 'image' %}...{% endif %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'logo_section_items' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
  {% if slot == 'list_item_1' %}...{% endif %}
  ...
  {% if slot == 'list_item_8' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title text.
- `layout` (string, optional): 'full-width' (stacked) or '50-50' (text/logo left, list right). Default: 'full-width'.
- `list_item_style` (string, optional): 'bullet', 'tick', 'number', or '' (empty/no style). Default: '' (no styling).

**Slots:**
- `image` (optional): Image HTML displayed at top of pattern (e.g., `<img src="..." alt="..." />`).
- `description` (optional): Description paragraph(s).
- `logo_section_items` (optional): Logo section items (4-8 `.p-logo-section__item` divs).
- `cta` (optional): Call-to-action area (paragraph with button and/or link).
- `list_item_1` through `list_item_8` (optional): Individual list item contents (wrapped in `<li>` automatically).

**Example usage:**
```jinja
{% from "_macros/vf_rich-horizontal-list.jinja" import vf_rich_horizontal_list %}

{% call(slot) vf_rich_horizontal_list(
  title_text="Why choose our solution",
  layout="50-50",
  list_item_style="tick"
) %}
  {% if slot == 'description' %}
    <p>Experience the benefits of our platform with these key features.</p>
  {% endif %}
  {% if slot == 'logo_section_items' %}
    <div class="p-logo-section__item">
      <img src="logo1.svg" alt="Partner 1" />
    </div>
    <div class="p-logo-section__item">
      <img src="logo2.svg" alt="Partner 2" />
    </div>
  {% endif %}
  {% if slot == 'list_item_1' %}<strong>Enterprise-grade security</strong><p>Industry-leading protection</p>{% endif %}
  {% if slot == 'list_item_2' %}<strong>24/7 support</strong><p>Always available</p>{% endif %}
  {% if slot == 'list_item_3' %}<strong>Seamless integration</strong><p>Easy setup</p>{% endif %}
  {% if slot == 'cta' %}
    <p><a href="/signup" class="p-button">Get started</a></p>
  {% endif %}
{% endcall %}
```

**Notes:**
- `list_item_style` options: 'bullet' (•), 'tick' (✓), 'number' (1, 2, 3...), or empty (no marker).
- '50-50' layout requires either `description` or `logo_section_items` in the right column.
- Image can be displayed above the content.
- Maximum 8 list items for optimal layout.
- CTA typically includes button and/or text link.

---

## Rich list (vertical)

**Purpose:** Display content in a 50/50 grid with text/list on one side and image on the other. List uses vertical dividers between items.

**Key points:**
- Required params: `title_text`.
- Required slots: `image`.
- Optional slots: `description`, `logo_section`, `cta`, `list_item_1` through `list_item_7`.
- List item styles: bullet, tick, number, or empty (no styling).
- Flipped layout option (image on left, text on right).
- Up to 7 list items supported.
- Uses Jinja call syntax with slots.

**Jinja import:**
```jinja
{% from "_macros/vf_rich-vertical-list.jinja" import vf_rich_vertical_list %}
```

**Macro signature:**
```jinja
{% call(slot) vf_rich_vertical_list(
  title_text='Title' (required),
  list_item_tick_style='bullet',  # or 'tick', 'number', or ''
  is_flipped=false
) %}
  {% if slot == 'image' %}...{% endif %}
  {% if slot == 'description' %}...{% endif %}
  {% if slot == 'logo_section' %}...{% endif %}
  {% if slot == 'list_item_1' %}...{% endif %}
  ...
  {% if slot == 'list_item_7' %}...{% endif %}
  {% if slot == 'cta' %}...{% endif %}
{% endcall %}
```

**Parameters:**
- `title_text` (string, required): H2 title text.
- `list_item_tick_style` (string, optional): 'bullet', 'tick', 'number', or '' (empty/no style). Default: '' (no styling).
- `is_flipped` (boolean, optional): If true, image appears on left and text on right. Default: false (text left, image right).

**Slots:**
- `image` (required): Image HTML (e.g., `<img src="..." alt="..." />`).
- `description` (optional): Description paragraph(s).
- `logo_section` (optional): Logo section content.
- `list_item_1` through `list_item_7` (optional): Individual list item contents (wrapped in `<li>` automatically).
- `cta` (optional): Call-to-action area.

**Example usage:**
```jinja
{% from "_macros/vf_rich-vertical-list.jinja" import vf_rich_vertical_list %}

{% call(slot) vf_rich_vertical_list(
  title_text="Product benefits",
  list_item_tick_style="tick"
) %}
  {% if slot == 'description' %}
    <p>Our solution provides comprehensive value to your organization.</p>
  {% endif %}
  {% if slot == 'image' %}
    <img src="product-image.jpg" alt="Product demo" />
  {% endif %}
  {% if slot == 'list_item_1' %}<strong>Reduces costs</strong><p>40% savings on operations</p>{% endif %}
  {% if slot == 'list_item_2' %}<strong>Boosts productivity</strong><p>Faster workflows</p>{% endif %}
  {% if slot == 'list_item_3' %}<strong>Enterprise security</strong><p>Industry-leading protection</p>{% endif %}
  {% if slot == 'cta' %}
    <p><a href="/features" class="p-button">Learn more</a></p>
  {% endif %}
{% endcall %}
```

**Example usage (flipped layout):**
```jinja
{% from "_macros/vf_rich-vertical-list.jinja" import vf_rich_vertical_list %}

{% call(slot) vf_rich_vertical_list(
  title_text="Advanced capabilities",
  list_item_tick_style="bullet",
  is_flipped=true
) %}
  {% if slot == 'image' %}
    <img src="capabilities.jpg" alt="Capabilities" />
  {% endif %}
  {% if slot == 'list_item_1' %}Multi-cloud support{% endif %}
  {% if slot == 'list_item_2' %}Automated scaling{% endif %}
  {% if slot == 'list_item_3' %}Real-time monitoring{% endif %}
{% endcall %}
```

**Notes:**
- `list_item_tick_style` options: 'bullet' (•), 'tick' (✓), 'number' (1, 2, 3...), or empty (no marker).
- `is_flipped=false` places text on left, image on right.
- `is_flipped=true` places image on left, text on right.
- List items use vertical dividers (`.p-list--divided`) between them.
- Maximum 7 list items for visual balance.
- Image is displayed in right column (or left if flipped).
- Responsive design adapts to 50/50 grid on large screens, stacked on smaller screens.

---

## Summary

All Vanilla patterns follow a consistent Jinja macro approach:

1. **Import the macro** at the top of your template
2. **Provide required parameters** (typically title/title_text)
3. **Configure optional parameters** for layout variants, styling, padding
4. **Use call syntax for slot-based patterns** (pricing-block, tiered-list, logo-section, rich-lists, etc.)
5. **Structure content** using appropriate block types and item objects
6. **Test responsiveness** across all breakpoints

Key patterns to remember:
- **Hero** for prominent page banners
- **Basic section** for flexible mixed content
- **Equal heights** for grid cards with consistent heights
- **Blog** for article collections
- **Data spotlight** for highlighting statistics
- **Tiered list** for feature/tier comparisons
- **Pricing block** for pricing tiers
- **Newsletter signup** for subscription forms
- **Text spotlight** for key benefits/features
- **Logo section** for brand partnerships
- **Rich lists** (horizontal/vertical) for content with image and list
- **Quote wrapper** for testimonials
- **CTA section** for calls-to-action
- **Tab section** for organized content tabs
- **Resources** for documentation/guides collections
- **Divided section** for complex structured layouts

Always import full Vanilla SCSS to ensure consistent styling, and use responsive breakpoints to adapt layouts across devices.
