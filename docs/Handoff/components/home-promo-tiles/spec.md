---
handoff: home-promo-tiles
title: Home Promo Tiles
group: Home
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/HomePromoTiles.stories.js
variants: 2
states: 3
---

# Home Promo Tiles

> Horizontally-scrolling promo tile row on the Codashop aggregator homepage (HomeStandard/HomeVisual). 2 tiles per screen at the M breakpoint (>=641px), scroll-snapping to ~78% width below it. Tile background alternates promo-tile--0/--1 purely off array index (i % 2).

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story home-promo-tiles`.

## Usage Rules
- Enforce @container query layouts (never @media).
- Use semantic tokens for colors and spacing.
- Background alternation is index-based, not content-based — a 3rd tile repeats the first color.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default | 0 |
| Three tiles (odd count) | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-l` | `16px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-xs` | `4px` |
| `--x-bg-tag-inverse` | `oklch(1 0 0 / 0.10)` |
| `--x-gap-content-narrow` | `4px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-text-header-inverse` | `oklch(0.311 0.029 305)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.304 0.211 264.1)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-shadow-card-hover` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.620 0.245 293) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.968 0.211 109.8) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.803 0.225 149.2) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` |
| `--x-bg-action-subtle` | `oklch(0.454 0.163 293)` | `oklch(0.606 0.119 100.6)` | `oklch(0.517 0.068 75.1)` | `oklch(0.503 0.126 54.2)` | `oklch(0.651 0.178 149.8)` | `oklch(0.397 0.169 142.5)` | `oklch(0.46 0.190 142.5)` | `oklch(0.458 0.121 133.1)` | `oklch(0.520 0.150 47)` | `oklch(0.460 0.180 264)` | `oklch(0.657 0.090 88.3)` | `oklch(0.614 0.166 128.9)` |
| `--x-bg-card-highlighted` | `oklch(0.205 0.034 340)` | `oklch(0.191 0.030 326.7)` | `oklch(0.140 0.016 263.5)` | `oklch(0.195 0.061 291.2)` | `oklch(0.216 0.016 189)` | `oklch(0.145 0.07 142.5)` | `oklch(0.145 0.07 142.5)` | `oklch(0.19 0.071 133.1)` | `oklch(0.220 0.040 78)` | `oklch(0.300 0.060 95)` | `oklch(0.103 0.062 280.0)` | `oklch(0.166 0.032 220.9)` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
