---
handoff: home-category-cards
title: Home Category Cards
group: Home
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/HomeCategoryCards.stories.js
variants: 3
states: 3
---

# Home Category Cards

> Home page "shop by category" grid (HomeStandard/HomeVisual). Emits `select` with a category id; the caller toggles `active` itself (see HomeView.vue's onCategorySelect, which clears the selection on a second click of the same card).

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story home-category-cards`.

## Usage Rules
- Enforce @container query layouts (never @media) — 2-col below 801px, 4-col above.
- Use semantic tokens for colors and spacing.
- `cover` is nullable per-card (falls back to an empty tinted swatch) — do not assume every category has art yet.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default | 0 |
| Category selected | 1 |
| No cover art | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-home-surface-bg` | _(resolve live)_ |
| `--x-home-surface-border` | _(resolve live)_ |
| `--x-shadow-card` | `0 4px 4px oklch(0 0 0 / 0.25)` |
| `--x-home-surface-blur` | _(resolve live)_ |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-size-img-m` | `32px` |
| `--x-home-surface-text` | _(resolve live)_ |
| `--x-home-surface-text-sub` | _(resolve live)_ |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-shadow-card-hover` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.620 0.245 293) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.968 0.211 109.8) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.803 0.225 149.2) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` |
| `--x-border-sku-card-selected` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-sku-card-default` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.187 0.035 33.9), oklch(0.187 0.035 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.134 0.0 0)` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.85 0.08 80 / 0.06) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.992 0.003 258 / 0.04) 0%, transparent 100% )` | `linear-gradient(to bottom, oklch(0 0 0 / 0.64) 24.519%, oklch(0 0 0))` | `oklch(0.163 0.033 279.3)` | `oklch(0.145 0 0)` |
