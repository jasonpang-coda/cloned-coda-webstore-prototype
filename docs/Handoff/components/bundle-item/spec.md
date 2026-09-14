---
handoff: bundle-item
title: Bundle Item
group: Cards
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/BundleItem.stories.js
variants: 4
states: 1
---

# Bundle Item

> One child SKU tile inside a bundle's breakdown row (BundleBreakdown, used by BundleSkuCard, BestSellerCard and SkuImageCard). Shows the square SKU image on a rarity-graded background with an optional tag pill (e.g. Bonus / Loyalty) straddling the top edge and a quantity badge in the bottom-right. `tileBg` is polymorphic — a CSS gradient/colour string is used verbatim, an image URL is detected by path pattern and auto-wrapped with `center / cover` sizing. Emits `select` on click and does not stop propagation, so a host can bubble the tap up. No image renders a null-sized 58.8×58.8 empty placeholder tile.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story bundle-item`.

## Usage Rules
- All props are optional — image null renders an empty placeholder tile.
- tileBg null falls back to the neutral rarity gradient; pass a --x-rarity-gradient-* value or raw image URL for graded rarity.
- tag expects { label, variant } (variant defaults to "value") — omit to hide the pill entirely.
- quantity !== null shows the bottom-right badge; pass a Number or String.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default | 0 |
| With bonus tag | 1 |
| Rare rarity | 2 |
| Empty placeholder | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-xs` | `4px` |
| `--x-pad-surface-xxs` | `2px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-rarity-gradient-neutral` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `linear-gradient(to bottom, oklch(0 0 0 / 0.42) 25.481%, oklch(0 0 0 / 0.88))` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` | `radial-gradient(120% 120% at 50% 0%, oklch(0.99 0.003 286 / 0.04) 0%, oklch(0.38 0.01 278 / 0.04) 100%)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-border-sku-card-default` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.10)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.22)` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.8 0.07 80 / 0.10) 0%, oklch(0.8 0.07 80 / 0.32) 45%, oklch(0.82 0.08 80 / 0.62) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 258 / 0.04) 0%, oklch(0.99 0.004 258 / 0.22) 45%, oklch(0.99 0.004 258 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 255 / 0.05) 0%, oklch(0.99 0.004 255 / 0.24) 45%, oklch(0.99 0.004 255 / 0.60) 100% )` | `oklch(0.843 0.106 88.3 / 0.22)` | `oklch(0.290 0 0)` |
| `--x-radius-control-xs` | `2px` | `2px` | `0px` | `2px` | `2px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `2px` |
| `--x-bg-indicator-neutral-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
