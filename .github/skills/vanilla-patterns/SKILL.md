---
name: vanilla-patterns
description: Reference guide for correctly implementing Vanilla Framework Jinja macro patterns. Use whenever creating or editing a hero, basic section, equal heights, blog, card, data spotlight, divided section, in-page navigation, tiered list, text spotlight, logo section, linked logo section, quote wrapper, pricing block, CTA section, tab section, newsletter signup, resources, rich horizontal list, or rich vertical list in a Jinja template. Also use when reviewing a pattern's macro signature, parameters, blocks, slots, imports, or Vanilla compatibility.
---

# Vanilla Framework Jinja Patterns

Use this skill to select and implement the repository's shared Vanilla Jinja macros without loading guidance for unrelated patterns.

## Workflow

1. Identify the pattern being created, edited, or reviewed.
2. Read only its linked reference below.
3. If that reference embeds another pattern's structured block, read the nested pattern's reference only when its detailed schema is needed.
4. Read the installed `vanilla-framework` version from `package.json`, then compare the installed macro with the current official documentation before using version-sensitive fields.
5. Preserve the surrounding template's established import and formatting style.

## Pattern References

| Pattern | Reference | Invocation model |
| --- | --- | --- |
| Hero | [Hero](./references/hero.md) | Structured blocks; empty compatibility wrapper |
| Basic section | [Basic section](./references/basic-section.md) | Direct call with structured items |
| Equal heights | [Equal heights](./references/equal-heights.md) | Caller slots |
| Blog | [Blog](./references/blog.md) | Direct call with articles |
| Card | [Card](./references/card.md) | Direct call inside a grid row |
| Data spotlight | [Data spotlight](./references/data-spotlight.md) | Direct call with blocks |
| Divided section | [Divided section](./references/divided-section.md) | Direct call with blocks |
| In-page navigation | [In-page navigation](./references/in-page-navigation.md) | Direct call inside a grid column |
| Tiered list | [Tiered list](./references/tiered-list.md) | Caller slots |
| Text spotlight | [Text spotlight](./references/text-spotlight.md) | Empty call wrapper |
| Logo section | [Logo section](./references/logo-section.md) | Blocks plus description slot |
| Linked logo section | [Linked logo section](./references/linked-logo-section.md) | Direct call with links |
| Quote wrapper | [Quote wrapper](./references/quote-wrapper.md) | Caller slots |
| Pricing block | [Pricing block](./references/pricing-block.md) | Tiers plus description slot |
| CTA section | [CTA section](./references/cta-section.md) | Structured blocks; empty compatibility wrapper |
| Tab section | [Tab section](./references/tab-section.md) | Direct call with tabs |
| Newsletter signup | [Newsletter signup](./references/newsletter-signup.md) | Caller slots |
| Resources | [Resources](./references/resources.md) | Structured blocks; empty wrapper |
| Rich list, horizontal | [Rich list, horizontal](./references/rich-list-horizontal.md) | Caller slots |
| Rich list, vertical | [Rich list, vertical](./references/rich-list-vertical.md) | Direct call with items and media |

## Shared Rules

- Prefer structured parameters and block arrays over deprecated caller slots.
- Only seven patterns use meaningful caller content: Equal heights, Tiered list, Logo section, Quote wrapper, Pricing block, Newsletter signup, and Rich list (horizontal).
- Hero and CTA section use structured blocks. If the installed macros still invoke `caller()`, use an empty `{% call(slot) ... %}{% endcall %}` wrapper.
- Text spotlight and Resources have no meaningful content slots, but their documented/runtime-compatible usage uses an empty call wrapper.
- Import macros from their `_macros/vf_*.jinja` module; do not reproduce pattern markup by hand.
- Use Jinja dictionaries and arrays for structured APIs. Treat raw HTML fields as trusted content and sanitize untrusted values before rendering.
- Use `attrs` and `link_attrs` dictionaries rather than concatenating HTML attributes.
- Omit optional empty blocks only when the installed macro handles their absence. The Resources compatibility exception is documented in its reference.
- Pattern defaults and accepted values are version-sensitive. Treat compatibility notes as prompts to inspect the installed macro, not permanent claims about the latest Vanilla release.

## Sources

- [Current pattern documentation](https://vanillaframework.io/docs/patterns)
- [What's new in Vanilla](https://vanillaframework.io/docs/whats-new)
- [Upstream Jinja macro source](https://github.com/canonical/vanilla-framework/tree/main/templates/_macros)
- Runtime compatibility: read the pinned `vanilla-framework` version from `package.json` and inspect its macros under `node_modules/vanilla-framework/templates/_macros/`.
- When current docs and the installed macro disagree, follow the installed macro for executable behavior and retain the documented API direction as an explicit compatibility note.
