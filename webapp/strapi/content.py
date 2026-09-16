"""
Turns a Strapi page document into template context.

Templates never see raw API data: every component is matched against the
allowlist below, its Markdown is rendered and sanitised here, and its
enumerations are translated into Vanilla Framework class names. That keeps
the Jinja partials declarative, and means a new field in Strapi cannot put
markup on the page until it is mapped here.
"""

# Standard library
import logging

# Packages
import markdown
from canonicalwebteam.flask_base.env import get_flask_env

logger = logging.getLogger(__name__)

try:
    import nh3
except ImportError:  # pragma: no cover - nh3 is in requirements.txt
    nh3 = None
    logger.warning(
        "nh3 is not installed, so CMS content will be rendered without "
        "sanitisation. Install it from requirements.txt."
    )


# Which Vanilla pattern renders which Strapi component. Anything not listed
# is dropped, so the component name from the API is never used to build a
# template path.
COMPONENT_TEMPLATES = {
    "vanilla.hero": "_cms/components/_hero.html",
    "vanilla.section": "_cms/components/_section.html",
    "vanilla.rich-text": "_cms/components/_rich-text.html",
    "vanilla.card-row": "_cms/components/_card-row.html",
    "vanilla.feature-list": "_cms/components/_feature-list.html",
    "vanilla.tiered-list": "_cms/components/_tiered-list.html",
    "vanilla.media-object-list": "_cms/components/_media-object-list.html",
    "vanilla.divided-list": "_cms/components/_divided-list.html",
    "vanilla.stats": "_cms/components/_stats.html",
    "vanilla.logo-section": "_cms/components/_logo-section.html",
    "vanilla.accordion": "_cms/components/_accordion.html",
    "vanilla.tabs": "_cms/components/_tabs.html",
    "vanilla.quote": "_cms/components/_quote.html",
    "vanilla.notification": "_cms/components/_notification.html",
    "vanilla.image-block": "_cms/components/_image.html",
    "vanilla.embed": "_cms/components/_embed.html",
    "vanilla.code-snippet": "_cms/components/_code-snippet.html",
    "vanilla.cta-block": "_cms/components/_cta-block.html",
    "vanilla.separator": "_cms/components/_separator.html",
    "vanilla.html": "_cms/components/_html.html",
}

# Components that need a page-level script or body class.
COMPONENTS_NEEDING_TABS_JS = {"vanilla.tabs"}

# Most sections render through Vanilla Framework's own Jinja macros, the
# same ones the hand-written pages use, so a CMS page and a template page
# produce identical markup. These map our enumerations onto the values
# those macros accept.
VF_PADDING = {
    "default": "default",
    "shallow": "shallow",
    "deep": "deep",
    "none": "shallow",
}

VF_RULE = {
    "default": "default",
    "muted": "muted",
    "highlight": "highlighted",
    "none": "none",
    "blank": "none",
}

VF_HERO_LAYOUTS = {
    "fifty_fifty": "50/50",
    "twentyfive_seventyfive": "25/75",
    "seventyfive_twentyfive": "75/25",
    "stacked": "fallback",
    # Values from before the hero used the Vanilla macro.
    "centered": "fallback",
    "full_width": "fallback",
}

VF_ASPECT_RATIOS = {
    "square": "square",
    "ratio_2_3": "2-3",
    "ratio_3_2": "3-2",
    "ratio_16_9": "16-9",
    "cinematic": "cinematic",
    "auto": "auto",
}

# Appearances that render as a plain link rather than a button.
TEXT_APPEARANCES = {"text", "soft"}

ROW_CLASSES = {
    "full_width": "u-fixed-width",
    "fifty_fifty": "row--50-50",
    "twentyfive_seventyfive": "row--25-75",
    "seventyfive_twentyfive": "row--75-25",
}

COLUMN_CLASSES = {
    "one": "col-12",
    "two": "col-6 col-medium-3",
    "three": "col-4 col-medium-3",
    "four": "col-3 col-medium-3",
}

BUTTON_CLASSES = {
    "default": "p-button",
    "positive": "p-button--positive",
    "negative": "p-button--negative",
    "base": "p-button--base",
    "link": "p-button--link",
    "text": "",
    "soft": "p-link--soft",
}

CARD_CLASSES = {
    "default": "p-card",
    "highlighted": "p-card--highlighted",
    "overlay": "p-card--overlay",
    "muted": "p-card--muted",
}

SECTION_SPACING_CLASSES = {
    "default": "p-section",
    "shallow": "p-section--shallow",
    "deep": "p-section--deep",
    "none": "",
}

# A background means the section becomes a strip, which brings its own
# padding; p-section only adds padding below, so the two are alternatives.
SECTION_BACKGROUND_CLASSES = {
    "none": "",
    "light": "p-strip--light",
    "accent": "p-strip--accent",
    "dark": "p-strip--dark",
}

STRIP_SPACING_CLASSES = {
    "default": "",
    "shallow": "is-shallow",
    "deep": "is-deep",
    "none": "u-no-padding--top u-no-padding--bottom",
}

RULE_CLASSES = {
    "default": "p-rule",
    "muted": "p-rule--muted",
    "highlight": "p-rule--highlight",
    "none": "",
    "blank": "",
}

ASPECT_RATIO_CLASSES = {
    "none": "",
    "ratio_16_9": "p-image-container--16-9",
    "ratio_3_2": "p-image-container--3-2",
    "ratio_2_3": "p-image-container--2-3",
    "square": "p-image-container--square",
    "cinematic": "p-image-container--cinematic",
}

WIDTH_CLASSES = {
    "fixed": "u-fixed-width",
    "full": "row--full-width",
    "narrow": "col-start-large-4 col-9",
}

NOTIFICATION_CLASSES = {
    "information": "p-notification--information",
    "positive": "p-notification--positive",
    "caution": "p-notification--caution",
    "negative": "p-notification--negative",
}

THEME_BODY_CLASSES = {
    "default": "",
    "paper": "is-paper",
    "dark": "is-dark",
}

# Tags the Markdown renderer can emit, plus the handful of block elements a
# writer may reach for. Deliberately no <script>, <style> or event handlers.
ALLOWED_TAGS = {
    "a",
    "abbr",
    "b",
    "blockquote",
    "br",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "dd",
    "del",
    "details",
    "div",
    "dl",
    "dt",
    "em",
    "figcaption",
    "figure",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "ins",
    "kbd",
    "li",
    "mark",
    "ol",
    "p",
    "picture",
    "pre",
    "q",
    "s",
    "samp",
    "small",
    "source",
    "span",
    "strong",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "ul",
    "var",
}

ALLOWED_ATTRIBUTES = {
    "*": {"class", "id", "lang", "dir", "title", "role"},
    # No "rel": nh3 adds rel="noopener noreferrer" to every link itself,
    # and refuses to do both.
    "a": {"href", "hreflang", "target", "download"},
    "img": {"src", "alt", "width", "height", "loading", "srcset", "sizes"},
    "source": {"src", "srcset", "sizes", "type", "media"},
    "td": {"colspan", "rowspan", "headers", "align"},
    "th": {"colspan", "rowspan", "headers", "scope", "abbr", "align"},
    "ol": {"start", "reversed", "type"},
    "details": {"open"},
    "time": {"datetime"},
}

# The custom HTML component is an explicit escape hatch, so it may also
# carry the embeds Vanilla patterns do not cover.
HTML_COMPONENT_TAGS = ALLOWED_TAGS | {"iframe", "video", "audio", "track"}
HTML_COMPONENT_ATTRIBUTES = dict(ALLOWED_ATTRIBUTES)
HTML_COMPONENT_ATTRIBUTES["iframe"] = {
    "src",
    "width",
    "height",
    "allow",
    "allowfullscreen",
    "loading",
    "referrerpolicy",
    "frameborder",
    "title",
}
HTML_COMPONENT_ATTRIBUTES["video"] = {
    "src",
    "controls",
    "poster",
    "width",
    "height",
    "preload",
    "loop",
    "muted",
}
HTML_COMPONENT_ATTRIBUTES["audio"] = {"src", "controls", "preload", "loop"}

MARKDOWN_EXTENSIONS = ["extra", "sane_lists", "admonition"]


def _sanitising_enabled():
    setting = get_flask_env("STRAPI_SANITIZE_HTML", "true")

    return str(setting).lower() != "false"


def sanitise(html, tags=None, attributes=None):
    if not html:
        return ""

    if nh3 is None or not _sanitising_enabled():
        return html

    return nh3.clean(
        html,
        tags=tags or ALLOWED_TAGS,
        attributes=attributes or ALLOWED_ATTRIBUTES,
        url_schemes={"http", "https", "mailto", "tel"},
    )


def render_markdown(text):
    """Markdown from a `richtext` field, rendered and sanitised."""
    if not text:
        return ""

    html = markdown.markdown(text, extensions=MARKDOWN_EXTENSIONS)

    return sanitise(html)


def _class_list(*classes):
    """Join non-empty class names, preserving order and dropping blanks."""
    seen = []

    for entry in classes:
        for name in (entry or "").split():
            if name not in seen:
                seen.append(name)

    return " ".join(seen)


def normalise_image(data, media_url=""):
    """
    A `shared.image` component: either an uploaded file or a URL on an
    existing asset host.
    """
    if not data:
        return None

    file_data = data.get("file") or {}
    url = data.get("url") or ""
    width = data.get("width")
    height = data.get("height")
    alt = data.get("alt") or ""

    if file_data:
        url = file_data.get("url") or url
        width = width or file_data.get("width")
        height = height or file_data.get("height")
        alt = alt or file_data.get("alternativeText") or ""

    if not url:
        return None

    if url.startswith("/"):
        url = f"{media_url.rstrip('/')}{url}"

    # The image macro proxies through Cloudinary, which can only fetch
    # public URLs, and needs a width. Assets uploaded to Strapi are served
    # by Strapi itself, so those stay plain <img> tags.
    is_uploaded = bool(file_data)

    return {
        "url": url,
        "alt": alt,
        "width": width,
        "height": height,
        "hi_def": bool(data.get("hi_def", True)),
        "loading": data.get("loading") or "lazy",
        "use_macro": (
            not is_uploaded and url.startswith("http") and bool(width)
        ),
    }


def normalise_link(data):
    """A `shared.link` component: label, URL and Vanilla button class."""
    if not data or not data.get("url"):
        return None

    appearance = data.get("appearance") or "default"
    new_tab = bool(data.get("open_in_new_tab"))

    return {
        "label": data.get("label") or data["url"],
        "url": data["url"],
        "appearance": appearance,
        "class": _class_list(
            BUTTON_CLASSES.get(appearance, "p-button"),
            "js-invoke-modal" if data.get("opens_modal") else "",
        ),
        "target": "_blank" if new_tab else "",
        "rel": "noopener noreferrer" if new_tab else "",
    }


def _links(items):
    links = (normalise_link(item) for item in items or [])

    return [link for link in links if link]


def normalise_card(data, media_url=""):
    if not data:
        return None

    return {
        "title": data.get("title"),
        "subtitle": data.get("subtitle"),
        "content": render_markdown(data.get("content")),
        "image": normalise_image(data.get("image"), media_url),
        "link": normalise_link(data.get("link")),
        "class": CARD_CLASSES.get(data.get("style") or "default", "p-card"),
    }


def _vf_cta(links):
    """
    Our list of links, shaped for Vanilla's CTA block: one primary button,
    any number of secondary buttons, and one plain link.
    """
    primary = None
    secondaries = []
    text_link = None

    for link in links or []:
        entry = {
            "content_html": link["label"],
            "attrs": {"href": link["url"]},
        }

        if link["target"]:
            entry["attrs"]["target"] = link["target"]
            entry["attrs"]["rel"] = link["rel"]

        appearance = link.get("appearance") or "default"

        if appearance in TEXT_APPEARANCES:
            if text_link is None:
                if appearance == "soft":
                    entry["attrs"]["class"] = "p-link--soft"
                text_link = entry
            continue

        if appearance == "positive" and primary is None:
            primary = entry
            continue

        # The macro styles secondaries as p-button; anything else needs
        # to say so itself.
        if appearance not in ("default", "positive"):
            entry["attrs"]["class"] = BUTTON_CLASSES.get(
                appearance, "p-button"
            )

        secondaries.append(entry)

    if not (primary or secondaries or text_link):
        return None

    return {
        "primary": primary,
        "secondaries": secondaries,
        "link": text_link,
    }


def _vf_description(html):
    """A rendered-Markdown block, as a Vanilla basic-section item."""
    if not html:
        return None

    return {"type": "description", "item": {"type": "html", "content": html}}


def _vf_items(data):
    """
    The second column of a Vanilla basic section: the body copy, then any
    call to action.
    """
    items = []

    for html in (data.get("content"), data.get("aside_content")):
        block = _vf_description(html)

        if block:
            items.append(block)

    cta = _vf_cta(data.get("links"))

    if cta:
        items.append({"type": "cta-block", "item": cta})

    return items


def _section_classes(data):
    """The wrapper classes shared by every section component."""
    spacing = data.get("spacing") or "default"
    background = SECTION_BACKGROUND_CLASSES.get(
        data.get("background") or "none", ""
    )

    if background:
        return _class_list(background, STRIP_SPACING_CLASSES.get(spacing, ""))

    return SECTION_SPACING_CLASSES.get(spacing, "p-section")


def _normalise_component(component, media_url=""):
    """One entry of the page's dynamic zone."""
    name = component.get("__component")
    template = COMPONENT_TEMPLATES.get(name)

    if not template:
        logger.warning("Ignoring unknown CMS component: %s", name)
        return None

    data = dict(component)
    data["component"] = name

    # Fields that mean the same thing wherever they appear. The custom
    # HTML component is the exception: its content is markup already, and
    # is sanitised further down with a wider allowlist.
    if "content" in data and name != "vanilla.html":
        data["content"] = render_markdown(data.get("content"))

    for field in ("intro", "aside_content", "message", "description"):
        if field in data:
            data[field] = render_markdown(data.get(field))

    if "links" in data:
        data["links"] = _links(data.get("links"))

    if "image" in data:
        data["image"] = normalise_image(data.get("image"), media_url)

    if "logo" in data:
        data["logo"] = normalise_image(data.get("logo"), media_url)

    if "layout" in data:
        data["row_class"] = ROW_CLASSES.get(data["layout"], "u-fixed-width")

    if "columns" in data:
        data["column_class"] = COLUMN_CLASSES.get(
            data["columns"], "col-4 col-medium-3"
        )

    if "rule" in data:
        data["rule_class"] = RULE_CLASSES.get(data["rule"] or "none", "")

    if "width" in data:
        data["width_class"] = WIDTH_CLASSES.get(data["width"], "u-fixed-width")

    data["section_class"] = _section_classes(data)

    # Vanilla macro arguments, shared by the components that render
    # through them.
    data["vf_padding"] = VF_PADDING.get(
        data.get("spacing") or "default", "default"
    )
    data["vf_rule"] = VF_RULE.get(data.get("rule") or "default", "default")
    data["vf_cta"] = _vf_cta(data.get("links"))

    # Per-component shaping.
    if name == "vanilla.hero":
        data["vf_layout"] = VF_HERO_LAYOUTS.get(data.get("layout"), "50/50")
        # A 25/75 hero is a signpost layout: without a signpost image the
        # macro needs to be told to keep the column's space.
        data["vf_blank_signpost"] = data[
            "vf_layout"
        ] == "25/75" and not data.get("image")

    if name == "vanilla.section":
        data["vf_items"] = _vf_items(data)

    if name in ("vanilla.tiered-list", "vanilla.divided-list"):
        data["items"] = [
            {
                "title": item.get("title"),
                "content": render_markdown(item.get("content")),
                "link": normalise_link(item.get("link")),
            }
            for item in data.get("items") or []
        ]

    if name == "vanilla.divided-list":
        data["vf_blocks"] = [
            {
                "type": "divided-block",
                "bullet_type": "none",
                "items": [
                    {
                        "title_text": item["title"],
                        "contents": [
                            block
                            for block in (
                                _vf_description(item["content"]),
                                (
                                    {
                                        "type": "cta-block",
                                        "item": _vf_cta([item["link"]]),
                                    }
                                    if item["link"]
                                    else None
                                ),
                            )
                            if block
                        ],
                    }
                    for item in data["items"]
                ],
            }
        ]

    if name == "vanilla.card-row":
        data["vf_aspect_ratio"] = VF_ASPECT_RATIOS.get(
            data.get("image_aspect_ratio") or "ratio_2_3", "2-3"
        )

    if name == "vanilla.feature-list":
        data["vf_list"] = {
            "type": "list",
            "item": {
                "list_items": [
                    {
                        "list_item_type": (
                            "tick" if item.get("is_ticked", True) else "bullet"
                        ),
                        "content": item.get("text") or "",
                    }
                    for item in data.get("items") or []
                ]
            },
        }

    if name in ("vanilla.card-row", "vanilla.media-object-list"):
        data["cards"] = [
            card
            for card in (
                normalise_card(item, media_url)
                for item in (data.get("cards") or data.get("items") or [])
            )
            if card
        ]

    if name == "vanilla.feature-list":
        data["items"] = [
            {
                "text": item.get("text"),
                "description": render_markdown(item.get("description")),
                "is_ticked": bool(item.get("is_ticked", True)),
                "link": normalise_link(item.get("link")),
            }
            for item in data.get("items") or []
        ]

    if name == "vanilla.accordion":
        data["items"] = [
            {
                "title": item.get("title"),
                "content": render_markdown(item.get("content")),
                "is_expanded": bool(item.get("is_expanded")),
            }
            for item in data.get("items") or []
        ]

    if name == "vanilla.tabs":
        data["items"] = [
            {
                "title": item.get("title"),
                "content": render_markdown(item.get("content")),
            }
            for item in data.get("items") or []
        ]

    if name == "vanilla.logo-section":
        data["logos"] = [
            {
                "name": logo.get("name"),
                "url": logo.get("url"),
                "image": normalise_image(logo.get("image"), media_url),
            }
            for logo in data.get("logos") or []
            if logo.get("image")
        ]

    if name == "vanilla.stats":
        data["items"] = [
            {
                "value": item.get("value"),
                "label": item.get("label"),
                "description": item.get("description"),
            }
            for item in data.get("items") or []
        ]

    if name == "vanilla.code-snippet":
        data["blocks"] = [
            {
                "title": block.get("title"),
                "language": block.get("language") or "bash",
                "content": block.get("content") or "",
                "class": _class_list(
                    "p-code-snippet__block",
                    "is-wrapped" if block.get("is_wrapped") else "",
                    (
                        "p-code-snippet__block--numbered"
                        if block.get("is_numbered")
                        else ""
                    ),
                ),
            }
            for block in data.get("blocks") or []
        ]

    if name == "vanilla.notification":
        data["notification_class"] = NOTIFICATION_CLASSES.get(
            data.get("status") or "information",
            "p-notification--information",
        )

    if name == "vanilla.image-block":
        data["aspect_ratio_class"] = ASPECT_RATIO_CLASSES.get(
            data.get("aspect_ratio") or "none", ""
        )

    if name == "vanilla.separator":
        data["rule_class"] = RULE_CLASSES.get(
            data.get("style") or "default", "p-rule"
        )

    if name == "vanilla.html":
        data["content"] = sanitise(
            data.get("content"),
            tags=HTML_COMPONENT_TAGS,
            attributes=HTML_COMPONENT_ATTRIBUTES,
        )

    return {"template": template, "name": name, "data": data}


def normalise_page(document, media_url=""):
    """
    A Strapi page document, flattened into what `_cms/page.html` expects.
    """
    if not document:
        return None

    sections = [
        section
        for section in (
            _normalise_component(component, media_url)
            for component in document.get("sections") or []
        )
        if section
    ]

    # Accordions and tabs need ids that are unique across the whole page,
    # not just within their own component.
    for index, section in enumerate(sections, start=1):
        section["index"] = index

    seo = document.get("seo") or {}
    meta_image = normalise_image(seo.get("meta_image"), media_url)
    title = document.get("title") or ""

    return {
        "title": title,
        "route": document.get("route"),
        "body_class": THEME_BODY_CLASSES.get(
            document.get("theme") or "default", ""
        ),
        "hide_nav": not document.get("show_navigation", True),
        "hide_footer": not document.get("show_footer", True),
        "updated_at": document.get("updatedAt"),
        "is_draft": document.get("publishedAt") is None,
        "seo": {
            "title": seo.get("meta_title") or title,
            "description": seo.get("meta_description") or "",
            "image": meta_image["url"] if meta_image else "",
            "copydoc": seo.get("meta_copydoc") or "",
            "canonical_url": seo.get("canonical_url") or "",
            "no_index": bool(seo.get("no_index")),
        },
        "sections": sections,
        "needs_tabs_js": any(
            section["name"] in COMPONENTS_NEEDING_TABS_JS
            for section in sections
        ),
    }
