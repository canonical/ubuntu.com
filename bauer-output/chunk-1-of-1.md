# BAU Copy Update Implementation Instructions

You are assisting with implementing copy suggestions from a Google Doc into a web project that uses the Vanilla Framework from Canonical. The feedback is provided as structured suggestions in JSON format. You are only required to update text fields. 

Your task is to accurately apply these suggestions to the correct files in the project repository. Once you read and understand this document, implement all of the suggestions in the provided JSON data, and follow the instructions carefully.

## Project Context

- **Framework**: Vanilla Framework (https://vanillaframework.io/)
- **Template Engine**: Jinja2
- **Repository**: Current working directory (ensure you're in the target repo)
- **Branch**: Currently active branch
- **Document**: Copy of /security/fips - "Ubuntu FIPS certification"

## Finding Target Files

The target file path is specified in the metadata as: ****

### Path Resolution Rules

1. **For most pages**: Create/edit a file with the appropriate page name
   - Example: `ubuntu.com/desktop/upcoming-features` → `templates/desktop/upcoming-features.html`

2. **For index pages**: If the URL path matches a folder name
   - Example: `ubuntu.com/desktop` → `templates/desktop/index.html`
   - Create the folder if it doesn't exist

3. **Nested paths**: Create all necessary parent directories
   - Example: `ubuntu.com/engage/resources/guide` → `templates/engage/resources/guide.html`

### File Location Algorithm

```
Given URL: domain.com/path/to/page

1. Remove domain: /path/to/page
2. Check if file exists at: templates/path/to/page.html
3. If not, check: templates/path/to/page/index.html
4. If creating new file:
   - Create directories: templates/path/to/
   - Create file: page.html (or index.html if path ends with existing folder name)
```

## Understanding the Suggestions JSON Schema

Each suggestion in the JSON array is a **LocationGroupedSuggestions** object with this structure:

```json
{
  "location": {
    "section": "Body",              // Section of document (Body, Header, Footer)
    "parent_heading": "Section Name", // Optional: Nearest heading above
    "heading_level": 2,               // Optional: Heading level (1-6)
    "in_table": false,                // Whether suggestion is in a table
    "in_metadata": false,             // True if suggestion comes from the metadata table
    "table": {                        // Optional: Table context if in_table is true
      "table_title": "Pattern Name",  // Pattern name (Hero, Equal Heights, etc.)
      "row_index": 1,
      "column_index": 2,
      "column_header": "Header",
      "row_header": "Row Label"
    }
  },
  "suggestions": [                    // Array of suggestions for this location
    {
      "id": "suggestion-id",
      "anchor": {
        "preceding_text": "exact text before",
        "following_text": "exact text after"
      },
      "change": {
        "type": "insert|delete|replace",
        "original_text": "text to remove/replace",  // Empty for inserts
        "new_text": "text to add/replace with"      // Empty for deletes
      },
      "verification": {
        "text_before_change": "combined before state",
        "text_after_change": "combined after state"
      },
      "position": {
        "start_index": 123,     // Character index in the document before change. Do not use this to locate text, it's for reference only.
        "end_index": 456        // Character index in the document before change. Do not use this to locate text, it's for reference only. 
      },
      "atomic_count": 1                 // Number of atomic operations merged
    }
  ]
}
```

## Applying Changes

Process the suggestions **one location at a time, in order**. For each location:

1. **Read the location context**: Understand where in the document this is
2. **Process each suggestion** in the `suggestions` array sequentially
3. **Apply each change** following the process below
4. **Verify** before moving to the next suggestion

### Metadata Table Suggestions

If `location.in_metadata` is true, the change came from the document metadata table and likely
does not appear verbatim in the target HTML content. Instead, map the change to metadata tags
in the repo that mirror the metadata table entries.

Use this process:
1. **Identify the metadata key**:
   - Prefer `location.table.row_header` (the left column label in the metadata table).
   - Use `location.table.column_header` only if `row_header` is empty.
2. **Find the tag** in the repo:
   - Search for tags or markers that match the metadata key (they mirror each table entry).
   - Use this strict match order:
     1. Exact text match (`Page title` == `Page title`)
     2. Case-insensitive match (`Page title` == `page title`)
     3. Normalized text match (trim + collapse spaces + remove punctuation)
     4. Snake case match (`Page title` -> `page_title`)
   - Stop at the first successful match; do not keep searching looser matches afterward.
   - Look for HTML comments, data attributes, front-matter fields, or template variables.
3. **Apply the change**:
   - Update the tag value to match the suggestion's `new_text`.
   - Do not use anchor text matching for metadata suggestions.
4. **Verify**:
   - Confirm the tag value matches `text_after_change`.

If multiple files contain the same metadata tag, prefer the file matching ``.
If the tag is missing, report it as an error and continue.

### Application Process

For each suggestion:

1. **Locate the text**:
   - Search for: `{preceding_text}{original_text}{following_text}`
   - The anchor texts are exact strings from the document

2. **Apply the change** based on type:
   - **insert**: Add `new_text` between `preceding_text` and `following_text`
   - **delete**: Remove `original_text`, keeping anchors intact
   - **replace**: Substitute `original_text` with `new_text`

3. **Verify**:
   - Confirm the resulting text matches `text_after_change`
   - If mismatch, report the discrepancy

### Important Notes

- **Preserve formatting**: Maintain HTML structure, indentation, and styling
- **Exact matching**: Anchor texts are precise - use them to find locations
- **Order matters**: Process suggestions in the order provided
- **Pattern awareness**: If `table_title` indicates a Vanilla pattern, consult the patterns reference below
- **Metadata tags**: For `in_metadata` suggestions, update the matching tag in the target repo instead of searching for anchors
- **Style changes**: Some suggestions may be style-only changes (e.g., making text bold, adding emphasis). Use appropriate Vanilla Framework classes and HTML to apply these changes.
- **Section deletions**: It is expected that some suggestions involve removing entire sections, this is acceptable behavior, ensure proper HTML structure and semantics are maintained. 

## Vanilla Framework Patterns

This section is added so you can understand the vanilla patterns you may encounter. Do NOT change any pattern, and report to the user any pattern mismatches.

To identify a pattern from the suggestion use `table_title` in location metadata and match with the corresponding pattern in the Vanilla Patterns Reference section that follows these instructions.

**Note**: The complete Vanilla Framework Patterns Reference appears immediately after these instructions and before the suggestions data.

## Error Handling

If you encounter issues:

1. **File not found**:
   - Check if the path needs index.html instead
   - Verify parent directories exist
   - Report if the URL structure is ambiguous

2. **Anchor text not found**:
   - The file may have been modified since the doc was created
   - Report the missing anchor and suggestion details
   - Ask for manual verification

3. **Verification mismatch**:
   - Report expected vs actual text
   - Indicate which suggestion failed
   - Continue with remaining suggestions

## Document Structure

This prompt is organized in the following order:

1. **These instructions** (what you're reading now)
2. **Vanilla Framework Patterns Reference** (reference material for implementing patterns)
3. **Suggestions Data** (JSON array of changes to implement)

## Processing Instructions

**Chunk 1 of 1**

Process the suggestions data at the end of this document one location at a time. After processing ALL locations in this chunk, report:
- Number of locations processed
- Number of successful changes
- Any errors or issues encountered


---

# Vanilla patterns

This file summarizes common Vanilla patterns and how to use them from Jinja macros. Each pattern below contains:
- purpose (one line),
- required params / slots,
- minimal Jinja import + usage examples,
- short configuration notes.

You should import all required macros at the beginning of the Jinja template before using them.

Table of contents
- [Hero pattern](#hero-pattern)
- [Equal heights](#equal-heights)
- [Text Spotlight](#text-spotlight)
- [Logo section](#logo-section)
- [Tab section](#tab-section)
- [Tiered list](#tiered-list)
- [Basic section](#basic-section)

---

## Hero pattern

Purpose: prominent banner (h1) with optional subtitle, description, CTA and image(s).

Key points
- Required param: `title_text` (renders as `h1`).
- Layouts: `'50/50'`, `'50/50-full-width-image'`, `'75/25'`, `'25/75'`, `'fallback'`.
- Flags: `is_split_on_medium` (bool), `display_blank_signpost_image_space` (bool).
- Slots (callable): `description`, `cta`, `image`, `signpost_image`.

Jinja import
```/dev/null/hero-import.jinja#L1-3
{% from "_macros/vf_hero.jinja" import vf_hero %}
```

Minimal usage
```/dev/null/hero-example.jinja#L1-20
{% from "_macros/vf_hero.jinja" import vf_hero %}

{% call(slot) vf_hero(
  title_text='Welcome to our product',
  subtitle_text='Short subtitle',
  layout='50/50',
  is_split_on_medium=true
) %}
  {% call(description) %}<p>Short description.</p>{% endcall %}
  {% call(cta) %}<a class="p-button" href="/signup">Get started</a>{% endcall %}
  {% call(image) %}<img src="/assets/hero.jpg" alt="Hero" />{% endcall %}
{% endcall %}
```

Notes
- For `25/75` provide `signpost_image` or set `display_blank_signpost_image_space=true`.
- For full-width images use `50/50-full-width-image` or place an image container at the same level as the grid columns.
- Import full Vanilla SCSS for consistent styling.

---

## Equal heights

Purpose: grid of item tiles with consistent heights (useful for features, cards).

Key points
- Required params: `title_text`, `items` (Array<Object>).
- Common item fields: `title_text`, `title_link_attrs`, `description_html`, `image_html`, `cta_html`.
- Image aspect controls: `image_aspect_ratio_small`, `image_aspect_ratio_medium`, `image_aspect_ratio_large`.
- Option: `highlight_images` (boolean) to style illustrations.

Jinja import
```/dev/null/equal-heights-import.jinja#L1-3
{% from "_macros/vf_equal-heights.jinja" import vf_equal_heights %}
```

Minimal usage (using call syntax with slots)
```/dev/null/equal-heights-example.jinja#L1-40
{% from "_macros/vf_equal-heights.jinja" import vf_equal_heights %}

{% call(slot) vf_equal_heights(
  title_text="Keep this heading to 2 lines on large screens.",
  attrs={ "id": "4-columns-responsive" },
  subtitle_text="Ensure the right hand side of this 50/50 split is taller than the left hand side (heading) on its left. This includes the subtitle and description.",
  items=[
    {
      "title_text": "A strong hardware ecosystem",
      "image_html":  "<img src='https://assets.ubuntu.com/v1/ff6a068d-kernelt-vanilla-ehp-1.png' class='p-image-container__image' width='284' height='426' alt='Kernelt' />",
      "description_html": "<p>We enable Ubuntu Core with the best ODMs and silicon vendors in the world. We continuously test it on leading IoT and edge devices and hardware.</p>",
      "cta_html": "<a href='#'>Browse all certified hardware&nbsp;&rsaquo;</a>"
    },
    {
      "title_text": "A strong hardware ecosystem",
      "image_html":  "<img src='https://assets.ubuntu.com/v1/7aa4ed28-kernelt-vanilla-ehp-2.png' class='p-image-container__image' width='284' height='426' alt='Kernelt' />",
      "description_html": "<p>We enable Ubuntu Core with the best ODMs and silicon vendors in the world. We continuously test it on leading IoT and edge devices and hardware.</p>",
      "cta_html": "<a href='#'>Browse all certified hardware&nbsp;&rsaquo;</a>"
    },
    {
      "title_text": "A strong hardware ecosystem",
      "image_html":  "<img src='https://assets.ubuntu.com/v1/4936d43a-kernelt-vanilla-ehp-3.png' class='p-image-container__image' width='284' height='426' alt='Kernelt' />",
      "description_html": "<p>We enable Ubuntu Core with the best ODMs and silicon vendors in the world. We continuously test it on leading IoT and edge devices and hardware.</p>",
      "cta_html": "<a href='#'>Browse all certified hardware&nbsp;&rsaquo;</a>"
    },
    {
      "title_text": "A strong hardware ecosystem",
      "image_html":  "<img src='https://assets.ubuntu.com/v1/bbe7b062-kernelt-vanilla-ehp-4.png' class='p-image-container__image' width='284' height='426' alt='Kernelt' />",
      "description_html": "<p>We enable Ubuntu Core with the best ODMs and silicon vendors in the world. We continuously test it on leading IoT and edge devices and hardware.</p>",
      "cta_html": "<a href='#'>Browse all certified hardware&nbsp;&rsaquo;</a>"
    }
  ]
) %}
{% endcall %}
```

Notes
- Prefer consistent properties across `items` for visual rhythm.
- If number of items is divisible by 4/3, layout adjusts to 4/3 columns on large screens.
- For the parent `title_text` use the text from the first suggestion in the given location, if it is much shorter than the others.

---

## Text Spotlight

Purpose: callout list of short items (2–7), used to highlight benefits or actions.

Key points
- Required params: `title_text`, `list_items` (Array<string>).
- Option: `item_heading_level` (2 or 4) — controls item styling.

Jinja import
```/dev/null/text-spotlight-import.jinja#L1-3
{% from "_macros/vf_text-spotlight.jinja" import vf_text_spotlight %}
```

Minimal usage
```/dev/null/text-spotlight-example.jinja#L1-12
{% from "_macros/vf_text-spotlight.jinja" import vf_text_spotlight %}

{{ vf_text_spotlight(
  title_text='Why choose us',
  list_items=['Fast setup','Secure by default','Enterprise support'],
  item_heading_level=2
) }}
```

Notes
- `list_items` may contain HTML strings if needed.
- Use `item_heading_level=4` for more compact item headings.

---

## Logo section (aka logo cloud)

Purpose: heading + optional description + a block of logos or CTA blocks (use for partner/client logos).

Key points
- Required param: `title` (Object with `text` and optional `link_attrs`).
- Required param: `blocks` — Array of block objects (`type: "logo-block"` or `type: "cta-block"`).
- Slot: `description` (optional) for descriptive paragraphs.
- `padding` can be `'default'` or `'deep'`.

Jinja import
```/dev/null/logo-section-import.jinja#L1-3
{% from "_macros/vf_logo-section.jinja" import vf_logo_section %}
```

Minimal usage (using call syntax with slots)
```/dev/null/logo-section-example.jinja#L1-60
{% from "_macros/vf_logo-section.jinja" import vf_logo_section %}

{% call(slot) vf_logo_section(
  title={
    "text": "The quick brown fox jumps over the lazy dog"
  },
  blocks=[
    {
      "type": "cta-block",
      "item": {
        "primary": {
          "content_html": "Primary Button",
          "attrs": {
            "href": "#"
          }
        },
        "link": {
          "content_html": "Lorem ipsum dolor sit amet ›",
          "attrs": {
            "href": "#"
          }
        }
      }
    },
    {
      "type": "logo-block",
      "item": {
        "logos": [
          {
            "src": "https://assets.ubuntu.com/v1/38fdfd23-Dell-logo.png",
            "alt": "Dell Technologies"
          },
          {
            "src": "https://assets.ubuntu.com/v1/cd5f636a-hp-logo.png",
            "alt": "Hewlett Packard"
          },
          {
            "src": "https://assets.ubuntu.com/v1/f90702cd-lenovo-logo.png",
            "alt": "Lenovo"
          },
          {
            "src": "https://assets.ubuntu.com/v1/2ef3c028-amazon-web-services-logo.png",
            "alt": "Amazon Web Services"
          },
          {
            "src": "https://assets.ubuntu.com/v1/cb7ef8ac-ibm-cloud-logo.png",
            "alt": "IBM Cloud"
          },
          {
            "src": "https://assets.ubuntu.com/v1/210f44e4-microsoft-azure-new-logo.png",
            "alt": "Microsoft Azure"
          },
          {
            "src": "https://assets.ubuntu.com/v1/a554a818-google-cloud-logo.png",
            "alt": "Google Cloud Platform"
          },
          {
            "src": "https://assets.ubuntu.com/v1/b3e692f4-oracle-new-logo.png",
            "alt": "Oracle"
          }
        ]
      }
    }
  ]
) -%}
{%- if slot == 'description' -%}
<p>The quick brown fox jumps over the lazy dog</p>
{%- endif -%}
{% endcall -%}
```

Notes
- Use `logo-block` for simple logo lists; `cta-block` to add buttons/links.
- The macro applies section padding automatically; you can override with `padding`.

---

## Tab section

Purpose: organize related content into separate tabs within a section with title, optional description, and CTA.

Key points
- Required params: `title` (Object with `text`), `tabs` (Array of tab objects).
- Layouts: `'full-width'`, `'50-50'` (default), `'25-75'`.
- Each tab has `type` (content block type) and `item` (block config).
- Supported block types vary by layout (e.g., quote only in full-width).
- JavaScript required for tab interactivity.

Jinja import
```/dev/null/tab-section-import.jinja#L1-3
{% from "_macros/vf_tab-section.jinja" import vf_tab_section %}
```

Minimal usage
```/dev/null/tab-section-example.jinja#L1-40
{% from "_macros/vf_tab-section.jinja" import vf_tab_section %}

{{ vf_tab_section(
  title={"text": "Features"},
  description={"content": "Explore our key features", "type": "text"},
  layout="50-50",
  tabs=[
    {
      "tab_html": "Logos",
      "type": "logo-block",
      "item": {
        "logos": [
          {"attrs": {"src": "https://assets.ubuntu.com/v1/cd5f636a-hp-logo.png", "alt": "HP"}},
          {"attrs": {"src": "https://assets.ubuntu.com/v1/f90702cd-lenovo-logo.png", "alt": "Lenovo"}}
        ]
      }
    },
    {
      "tab_html": "Blog",
      "type": "blog",
      "item": {
        "articles": [
          {
            "title": {"text": "Getting started", "link_attrs": {"href": "#"}},
            "description": {"text": "Learn the basics"},
            "metadata": {
              "authors": [{"text": "Author Name", "link_attrs": {"href": "#"}}],
              "date": {"text": "15 March 2025"}
            }
          }
        ]
      }
    }
  ]
) }}
```

Notes
- Block types: `quote`, `linked-logo`, `logo-block`, `divided-section`, `blog`, `basic-section`.
- Full-width supports quote; 50/50 supports divided-section and basic-section; all support linked-logo, logo-block, blog.
- Requires JS module: `import {tabs} from 'vanilla-framework/js'; tabs.initTabs('[role="tablist"]');`

---

## Tiered list

Purpose: list of paired titles and descriptions with optional top-level description and CTAs.

Key points
- Required params: `is_description_full_width_on_desktop` (bool), `is_list_full_width_on_tablet` (bool).
- Uses slots: `title`, `description` (optional), `list_item_title_[1-25]`, `list_item_description_[1-25]`, `cta` (optional).
- Layouts determined by boolean flags (50/50 vs full-width on different breakpoints).
- Max 25 list items.

Jinja import
```/dev/null/tiered-list-import.jinja#L1-3
{% from "_macros/vf_tiered-list.jinja" import vf_tiered_list %}
```

Minimal usage
```/dev/null/tiered-list-example.jinja#L1-30
{% from "_macros/vf_tiered-list.jinja" import vf_tiered_list %}

{% call(slot) vf_tiered_list(
  is_description_full_width_on_desktop=true,
  is_list_full_width_on_tablet=false
) %}
  {% if slot == 'title' %}
    <h2>Key benefits</h2>
  {% elif slot == 'description' %}
    <p>Discover what makes our solution unique.</p>
  {% elif slot == 'list_item_title_1' %}
    <h3>Fast deployment</h3>
  {% elif slot == 'list_item_description_1' %}
    <p>Get up and running in minutes with our streamlined setup.</p>
  {% elif slot == 'list_item_title_2' %}
    <h3>Enterprise support</h3>
  {% elif slot == 'list_item_description_2' %}
    <p>24/7 support from our expert team.</p>
  {% elif slot == 'cta' %}
    <a href="#" class="p-button--positive">Get started</a>
  {% endif %}
{% endcall %}
```

Notes
- `is_description_full_width_on_desktop=true` makes title/description span full width on desktop.
- `is_list_full_width_on_tablet=false` makes list items display side-by-side on tablet.
- Use numbered slots (`list_item_title_1`, `list_item_description_1`, etc.) for each list item pair.

---

## Basic section

Purpose: flexible 2-column (default) content section composed of various content blocks (description, images, lists, code, logos, CTAs).

Key points
- Required param: `title` (Object with `text` and optional `link_attrs`).
- Common params: `label_text`, `subtitle`, `items` (Array of block objects), `is_split_on_medium`, `padding`, `top_rule_variant`.
- Blocks support `type` keys: `description`, `image`, `video`, `list`, `code-block`, `logo-block`, `cta-block`, `notification`, etc.

Jinja import
```/dev/null/basic-section-import.jinja#L1-3
{% from "_macros/vf_basic-section.jinja" import vf_basic_section %}
```

Minimal usage (mixed items)
```/dev/null/basic-section-example.jinja#L1-28
{% from "_macros/vf_basic-section.jinja" import vf_basic_section %}

{% set items = [
  {'type':'description','item':{'type':'text','content':'Intro paragraph.'}},
  {'type':'image','item':{'attrs':{'src':'/img/feature.jpg','alt':'Feature'},'aspect_ratio':'3-2'}},
  {'type':'cta-block','item':{'primary':{'content_html':'Try demo','attrs':{'href':'/demo'}}}}
] %}

{{ vf_basic_section(title={'text':'Section title'}, items=items, is_split_on_medium=true) }}
```

Notes
- Use `is_split_on_medium=true` to split layout on tablet and larger.
- Items are rendered in sequence; each item supports its own options (see macros for details).
- Import full Vanilla SCSS for images/utility classes used by blocks.

---

General notes
- Always import the appropriate macro from `_macros/*.jinja`.
- Patterns rely on Vanilla CSS utilities — recommended to import the full framework or required partials in your project SCSS.
- When a pattern provides named slots (callable blocks), use `{% call(slotname) %}...{% endcall %}` to inject markup.
- Keep content structure consistent across repeated items to maintain visual rhythm.


---

# Suggestions Data

The following is the JSON array of location-grouped suggestions to implement.
Process each location one by one, applying all suggestions for that location before moving to the next.

```json
[
  {
    "location": {
      "section": "Body",
      "in_table": true,
      "table": {
        "table_index": 3,
        "table_id": "table-3",
        "table_title": "TIERED LIST",
        "row_index": 2,
        "column_index": 2,
        "column_header": "",
        "row_header": "Disruption-free crypto compliance"
      },
      "in_metadata": false
    },
    "suggestions": [
      {
        "id": "suggest.xxk36gr8vnjn",
        "anchor": {
          "preceding_text": "st security patches is vital, especially in high-security environments. With the Ubuntu Pro subscription, you get up to ",
          "following_text": " years of security maintenance for your Ubuntu systems. You can also automate patching at scale with Landscape, a fleet "
        },
        "change": {
          "type": "replace",
          "original_text": "12",
          "new_text": "15"
        },
        "verification": {
          "text_before_change": "st security patches is vital, especially in high-security environments. With the Ubuntu Pro subscription, you get up to 12 years of security maintenance for your Ubuntu systems. You can also automate patching at scale with Landscape, a fleet ",
          "text_after_change": "st security patches is vital, especially in high-security environments. With the Ubuntu Pro subscription, you get up to 15 years of security maintenance for your Ubuntu systems. You can also automate patching at scale with Landscape, a fleet "
        },
        "position": {
          "start_index": 1804,
          "end_index": 1808
        },
        "atomic_changes": [
          {
            "type": "insert",
            "new_text": "15"
          },
          {
            "type": "delete",
            "original_text": "12"
          }
        ],
        "atomic_count": 2
      }
    ]
  },
  {
    "location": {
      "section": "Body",
      "parent_heading": "What you need to know about FIPS 140-3",
      "heading_level": 2,
      "in_table": true,
      "table": {
        "table_index": 8,
        "table_id": "table-8",
        "table_title": "",
        "row_index": 1,
        "column_index": 2,
        "column_header": "Learn about all our security certifications",
        "row_header": "Take the next step towards FIPS compliance"
      },
      "in_metadata": false
    },
    "suggestions": [
      {
        "id": "suggest.m4ivxxis75xn",
        "anchor": {
          "preceding_text": " for your needs\n\nRead the documentation about FIPS for Ubuntu\n\n\nUbuntu Pro provides an easy pathway to FIPS compliance. ",
          "following_text": ", along with automated, unattended, and restartless updates, and the best tools to secure and manage your Ubuntu infrast"
        },
        "change": {
          "type": "replace",
          "original_text": "It delivers CVE patching for Ubuntu OS and Applications covering 36,000 packages",
          "new_text": "It delivers vulnerability patching for the entire Ubuntu Archive (Main and Universe repositories)"
        },
        "verification": {
          "text_before_change": " for your needs\n\nRead the documentation about FIPS for Ubuntu\n\n\nUbuntu Pro provides an easy pathway to FIPS compliance. It delivers CVE patching for Ubuntu OS and Applications covering 36,000 packages, along with automated, unattended, and restartless updates, and the best tools to secure and manage your Ubuntu infrast",
          "text_after_change": " for your needs\n\nRead the documentation about FIPS for Ubuntu\n\n\nUbuntu Pro provides an easy pathway to FIPS compliance. It delivers vulnerability patching for the entire Ubuntu Archive (Main and Universe repositories), along with automated, unattended, and restartless updates, and the best tools to secure and manage your Ubuntu infrast"
        },
        "position": {
          "start_index": 6173,
          "end_index": 6350
        },
        "atomic_changes": [
          {
            "type": "insert",
            "new_text": "It delivers vulnerability patching for the entire Ubuntu Archive (Main and Universe repositories)"
          },
          {
            "type": "delete",
            "original_text": "It delivers CVE patching for Ubuntu OS and Applications covering 36,000 packages"
          }
        ],
        "atomic_count": 2
      }
    ]
  }
]
```
