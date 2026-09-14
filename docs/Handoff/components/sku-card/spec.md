---
handoff: sku-card
title: SKU Card
group: Cards
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/SkuCard.stories.js
variants: 6
states: 3
---

# SKU Card

> The standard currency / CP card. Tapping opens the checkout sheet via useCheckout() (a no-op until the account is identified). The bonus chip, crossed-out price and discount badge are all optional and render only when their props are supplied. `layout: "row"` switches the vertical column to a horizontal row with the price pinned right — used in dense lists.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story sku-card`.

## Reference Captures

Captured via `npm run harness:capture -- manifest sku-card` (see plans/tickets/in-progress/visual-capture-rig.md) — the component in isolation, per store/width, not a hand-taken screenshot.

**codm / iphone**

![SKU Card — codm iphone](captures/codm-iphone.png)

**codm / samsung**

![SKU Card — codm samsung](captures/codm-samsung.png)

**codm / responsive**

![SKU Card — codm responsive](captures/codm-responsive.png)

**codashop / iphone**

![SKU Card — codashop iphone](captures/codashop-iphone.png)

**codashop / samsung**

![SKU Card — codashop samsung](captures/codashop-samsung.png)

**codashop / responsive**

![SKU Card — codashop responsive](captures/codashop-responsive.png)

**fcm / iphone**

![SKU Card — fcm iphone](captures/fcm-iphone.png)

**fcm / samsung**

![SKU Card — fcm samsung](captures/fcm-samsung.png)

**fcm / responsive**

![SKU Card — fcm responsive](captures/fcm-responsive.png)

## Usage Rules
- BundleItem's tag pill straddles -8px above its tile; .sku-card__breakdown must keep padding-top: var(--x-pad-surface-s) (8px) in BOTH column and row layouts so the pill has clearance above the bonus/subtitle sibling above it — a positioned box (position:relative) always paints over a non-positioned in-flow sibling it visually overlaps, so shrinking this padding back toward the bare flex gap (4px/2px) silently reintroduces the pill overlapping that text.
- The metal/plastic/carbonFibre material variants read --x-fx-metal/plastic/carbon-* tokens defined only in themes/codashop.css (the sole store with skuCard.materialExploration enabled); with no var() fallback, harness test all fails UNRESOLVED_MANDATORY_TOKEN in every other store even though the modifier classes never actually apply there. Fix: fall back to the card's own --x-bg-sku-card-default/--x-border-sku-card-default for fill/edge and transparent for sheen layers, so any theme resolves safely without diluting Codashop's authored values.
- Never show the bonus line without a baseAmount — the breakdown needs both.
- isBestValue renders the default BEST VALUE badge; tagLabel overrides it with custom text.
- currentPrice and amount are required; everything else is additive.
- items renders a BundleBreakdown row (scrollable) below the amount/bonus/subtitle block — shape [{ image, tileBg, tag, quantity }], same as SkuImageCard/BestSellerCard.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default | 0 |
| With bonus | 1 |
| Best value | 2 |
| Row layout | 3 |
| With child breakdown | 4 |
| With child breakdown (row) | 5 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-m` | `12px` |
| `--x-pad-surface-s` | `8px` |
| `--x-pad-surface-l` | `16px` |
| `--x-shadow-card` | `0 4px 4px oklch(0 0 0 / 0.25)` |
| `--x-motion-sys-duration-slow` | `350ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-sku-hover-in` | `220ms cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sku-select` | `250ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-sku-press-scale` | `0.99` |
| `--x-motion-sku-press` | `100ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-gap-content-default` | `8px` |
| `--x-gap-content-tight` | `2px` |
| `--x-motion-sys-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--x-text-icon-muted` | `oklch(1 0 0 / 0.40)` |
| `--x-motion-shimmer-sweep` | `3000ms` |
| `--border-weight-default` | `1px` |
| `--border-weight-selected` | `2px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-blur-container` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `16px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `8px` | _(resolve live)_ | _(resolve live)_ |
| `--x-border-sku-card-default` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.10)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.22)` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.8 0.07 80 / 0.10) 0%, oklch(0.8 0.07 80 / 0.32) 45%, oklch(0.82 0.08 80 / 0.62) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 258 / 0.04) 0%, oklch(0.99 0.004 258 / 0.22) 45%, oklch(0.99 0.004 258 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 255 / 0.05) 0%, oklch(0.99 0.004 255 / 0.24) 45%, oklch(0.99 0.004 255 / 0.60) 100% )` | `oklch(0.843 0.106 88.3 / 0.22)` | `oklch(0.290 0 0)` |
| `--x-shadow-card-hover` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.620 0.245 293) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.968 0.211 109.8) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.803 0.225 149.2) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` | `0 6px 12px oklch(0 0 0 / 0.30), 0 0 12px 0px color-mix(in oklch, oklch(0.82 0.20 75) 22%, transparent)` |
| `--x-border-sku-card-hover` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.08) 0%, oklch(0.99 0.004 247 / 0.35) 45%, oklch(0.99 0.004 247 / 0.78) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.08) 0%, oklch(0.99 0.004 247 / 0.35) 45%, oklch(0.99 0.004 247 / 0.78) 100% )` | `oklch(0.355 0.109 33.9)` | `oklch(0.95 0 0 / 0.22)` | `oklch(0.95 0 0 / 0.16)` | `oklch(0.583 0.198 142.5 / 0.45)` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.08) 0%, oklch(0.99 0.004 247 / 0.35) 45%, oklch(0.99 0.004 247 / 0.78) 100% )` | `linear-gradient( 160deg, oklch(0.84 0.08 80 / 0.16) 0%, oklch(0.84 0.08 80 / 0.45) 45%, oklch(0.88 0.09 80 / 0.85) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 258 / 0.08) 0%, oklch(0.99 0.004 258 / 0.35) 45%, oklch(0.99 0.004 258 / 0.78) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 255 / 0.10) 0%, oklch(0.99 0.004 255 / 0.38) 45%, oklch(0.99 0.004 255 / 0.80) 100% )` | `oklch(0.843 0.106 88.3 / 0.45)` | `oklch(0.910 0.246 128.9)` |
| `--x-border-sku-card-selected` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-shadow-card-selected` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.620 0.245 293) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.968 0.211 109.8) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.803 0.225 149.2) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` |
| `--x-bg-sku-card-default` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.187 0.035 33.9), oklch(0.187 0.035 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.134 0.0 0)` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.85 0.08 80 / 0.06) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.992 0.003 258 / 0.04) 0%, transparent 100% )` | `linear-gradient(to bottom, oklch(0 0 0 / 0.64) 24.519%, oklch(0 0 0))` | `oklch(0.163 0.033 279.3)` | `oklch(0.145 0 0)` |
| `--x-bg-card-selected` | `oklch(0.205 0.039 293)` | `oklch(0.217 0.027 98.3)` | `oklch(0.140 0.017 75.1)` | `oklch(0.380 0.092 56.8)` | `oklch(0.334 0.083 152.3)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.057 133.1)` | `oklch(0.205 0.045 45)` | `oklch(0.460 0.180 264)` | `oklch(0.425 0.042 88.3)` | `oklch(0.166 0.045 128.9)` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-bonus-amount` | `oklch(0.749 0.166 293)` | `oklch(0.930 0.164 101.5)` | `oklch(0.809 0.085 75.1)` | `oklch(0.975 0.149 108.9)` | `oklch(0.861 0.202 153.1)` | `oklch(0.642 0.183 142.5)` | `oklch(0.77 0.16 142.5)` | `oklch(0.74 0.131 133.1)` | `oklch(0.780 0.180 50)` | `oklch(0.890 0.155 96)` | `oklch(0.902 0.098 88.3)` | `oklch(0.934 0.185 128.9)` |
| `--x-text-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-fx-metal-sheen` | `radial-gradient(120% 90% at 25% 0%, oklch(1 0 0 / 0.10), transparent 55%)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-fx-metal-fill` | `linear-gradient( 160deg, oklch(0.40 0.085 293) 0%, oklch(0.27 0.065 293) 55%, oklch(0.19 0.045 293) 100% )` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-fx-metal-edge` | `color-mix(in oklch, oklch(0.620 0.245 293) 55%, transparent)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-fx-plastic-fill` | `linear-gradient(oklch(0.26 0.07 293), oklch(0.26 0.07 293))` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-fx-plastic-edge` | `color-mix(in oklch, oklch(0.749 0.166 293) 40%, transparent)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-fx-plastic-sheen` | `linear-gradient( calc(315deg + 180deg), transparent 0%, transparent 30%, oklch(1 0 0 / 0.16) 46%, oklch(1 0 0 / 0.30) 50%, oklch(1 0 0 / 0.16) 54%, transparent 70%, transparent 100% )` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-fx-carbon-sheen` | `linear-gradient( 135deg, transparent 30%, oklch(1 0 0 / 0.05) 48%, oklch(1 0 0 / 0.05) 54%, transparent 72% )` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-fx-carbon-fill` | `linear-gradient(oklch(0.15 0.04 305), oklch(0.15 0.04 305))` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-fx-carbon-edge` | `color-mix(in oklch, oklch(0.537 0.204 293) 45%, transparent)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
