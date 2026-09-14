---
handoff: item-summary-accordion
title: Item Summary Accordion
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/ItemSummaryAccordion.stories.js
variants: 4
states: 2
---

# Item Summary Accordion

> One row of the "You will receive" list inside the Item Summary sheet (src/components/steps/InfoStepBody.vue loops `bundle.items` and spreads each item object as props, plus `data.compactAccordion` for `compact`). Collapsed, it shows a rarity-tinted 48×48 thumb, the item name, and an x-quantity line; tapping it expands a media block (image or video, resolved by <Media> from the `media` src's extension) and a text description via the same grid-template-rows 0fr→1fr accordion recipe used across the repo (--x-motion-accordion, also seen in ResellerBanner). The header button self-disables (`:disabled="!hasDetail"`) and hides the chevron entirely when neither `media` nor `description` is given, so a plain reward line never looks falsely interactive. `tileBg` accepts a raw CSS gradient/color string (e.g. `var(--x-rarity-gradient-legendary)`) or a plain image URL auto-wrapped with cover sizing — same convention as BundleItem.tileBg.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story item-summary-accordion`.

## Usage Rules
- `name` is the only required prop — everything else is optional and additive.
- Omit both `media` and `description` for a non-expandable reward row: the chevron disappears and the header button disables itself automatically, no separate "expandable" flag exists.
- `compact` hides the rarity thumb entirely (used for FCM's info sheet, which has no rarity thumb) — do not pass an `image` expecting it to still show under `compact`.
- `tileBg` is a raw CSS value (gradient var or url), not a rarity enum — pass one of the --x-rarity-gradient-* tokens directly, matching BundleItem's convention.

## Variants & Interaction States

- **Supported Interaction States**: `collapsed`, `expanded`

| Variant Name | Index |
|---|---|
| Reward row (no detail) | 0 |
| Expandable, collapsed | 1 |
| Expanded by default | 2 |
| Compact (no rarity thumb) | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-border-soft` | `oklch(0.992 0.003 286 / 0.08)` |
| `--x-pad-surface-s` | `8px` |
| `--x-size-img-l` | `48px` |
| `--x-gap-content-tight` | `2px` |
| `--x-gap-content-default` | `8px` |
| `--x-motion-accordion` | `350ms cubic-bezier(0.4, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-rarity-gradient-neutral` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `linear-gradient(to bottom, oklch(0 0 0 / 0.42) 25.481%, oklch(0 0 0 / 0.88))` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-card-default` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
