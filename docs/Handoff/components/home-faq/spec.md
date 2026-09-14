---
handoff: home-faq
title: Home Faq
group: Home
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/HomeFaq.stories.js
variants: 2
states: 3
---

# Home Faq

> Accordion FAQ list. `layout="stack"` (default, HomeStandard/HomeVisual, the Codashop-style homepage) is a single stacked column; `layout="grid"` (App.vue's SEO content block, e.g. Diablo Immortal) arranges min(3, count) columns per row at the M breakpoint (>=801px).

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story home-faq`.

## Usage Rules
- Enforce @container query layouts (never @media).
- Use semantic tokens for colors and spacing.
- All items render collapsed by default (openIndex = -1) — only one item open at a time.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default (stack, short list) | 0 |
| Grid layout (6 items) | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-home-surface-bg` | _(resolve live)_ |
| `--x-home-surface-border` | _(resolve live)_ |
| `--x-shadow-card` | `0 4px 4px oklch(0 0 0 / 0.25)` |
| `--x-home-surface-blur` | _(resolve live)_ |
| `--x-pad-surface-m` | `12px` |
| `--x-pad-surface-l` | `16px` |
| `--x-home-surface-text` | _(resolve live)_ |
| `--x-home-surface-text-sub` | _(resolve live)_ |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
