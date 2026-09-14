---
handoff: gift-sku-card
title: Gift SKU Card
group: Cards
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/GiftSkuCard.stories.js
variants: 3
states: 2
---

# Gift SKU Card

> A free-gift card with a claim CTA and an optional countdown. The confirmed-claim state is keyed by `id` through useGiftClaim, so each gift remembers whether it has been claimed. With refreshesOnClaim the countdown prefix switches to the "Refreshes:" label once claimed.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story gift-sku-card`.

## Usage Rules
- id, image and title are required — id keys the claim state.
- Localised prefixes come from endsLabel / refreshesLabel (pass the store strings).
- Without endsAt the card shows no countdown (resting gift).

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`

| Variant Name | Index |
|---|---|
| Resting | 0 |
| With countdown | 1 |
| Refreshes on claim | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-loose` | `12px` |
| `--x-motion-sys-duration-slow` | `350ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sku-select` | `250ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-sku-press-scale` | `0.99` |
| `--x-motion-sku-press` | `100ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-s` | `8px` |
| `--x-motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-xs` | `4px` |
| `--x-size-icon-l` | `24px` |
| `--x-surface-ghost-5` | `oklch(1 0 0 / 0.16)` |
| `--x-gap-content-tight` | `2px` |
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-narrow` | `4px` |
| `--border-weight-selected` | `2px` |
| `--border-weight-default` | `1px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-bg-sku-card-default` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.187 0.035 33.9), oklch(0.187 0.035 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.134 0.0 0)` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.85 0.08 80 / 0.06) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.992 0.003 258 / 0.04) 0%, transparent 100% )` | `linear-gradient(to bottom, oklch(0 0 0 / 0.64) 24.519%, oklch(0 0 0))` | `oklch(0.163 0.033 279.3)` | `oklch(0.145 0 0)` |
| `--x-blur-container` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `16px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `8px` | _(resolve live)_ | _(resolve live)_ |
| `--x-bg-card-selected` | `oklch(0.205 0.039 293)` | `oklch(0.217 0.027 98.3)` | `oklch(0.140 0.017 75.1)` | `oklch(0.380 0.092 56.8)` | `oklch(0.334 0.083 152.3)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.057 133.1)` | `oklch(0.205 0.045 45)` | `oklch(0.460 0.180 264)` | `oklch(0.425 0.042 88.3)` | `oklch(0.166 0.045 128.9)` |
| `--x-shadow-card-selected` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.620 0.245 293) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.968 0.211 109.8) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.803 0.225 149.2) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 4px 4px oklch(0 0 0 / 0.25), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` |
| `--x-border-sku-card-selected` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-border-sku-card-default` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.10)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.22)` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.8 0.07 80 / 0.10) 0%, oklch(0.8 0.07 80 / 0.32) 45%, oklch(0.82 0.08 80 / 0.62) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 258 / 0.04) 0%, oklch(0.99 0.004 258 / 0.22) 45%, oklch(0.99 0.004 258 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 255 / 0.05) 0%, oklch(0.99 0.004 255 / 0.24) 45%, oklch(0.99 0.004 255 / 0.60) 100% )` | `oklch(0.843 0.106 88.3 / 0.22)` | `oklch(0.290 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
| `--x-text-warning-default` | `oklch(0.800 0.155 75)` | `oklch(0.743 0.142 66.8)` | `oklch(0.705 0.120 78.8)` | `oklch(0.618 0.149 57.5)` | `oklch(0.769 0.165 70.1)` | `oklch(0.617 0.103 109.1)` | `oklch(0.8 0.15 80)` | `oklch(0.759 0.144 80.0)` | `oklch(0.743 0.142 66.8)` | `oklch(0.743 0.142 66.8)` | `oklch(0.763 0.140 72.5)` | `oklch(0.827 0.171 75.0)` |
| `--x-text-error-default` | `oklch(0.568 0.189 25)` | `oklch(0.619 0.209 28.5)` | `oklch(0.593 0.151 31.8)` | `oklch(0.635 0.251 21.6)` | `oklch(0.599 0.231 27.9)` | `oklch(0.633 0.0 0)` | `oklch(0.6 0.22 25)` | `oklch(0.468 0.172 25.9)` | `oklch(0.619 0.209 28.5)` | `oklch(0.619 0.209 28.5)` | `oklch(0.655 0.231 26.4)` | `oklch(0.708 0.191 33.9)` |
| `--x-text-body-subtle` | `oklch(0.795 0.009 305)` | `oklch(0.584 0.008 277.1)` | `oklch(0.759 0.002 56.0)` | `oklch(0.561 0.154 280.2)` | `oklch(0.455 0.006 106.6)` | `oklch(0.585 0 0)` | `oklch(0.585 0.014 140)` | `oklch(0.585 0.01 80)` | `oklch(0.580 0.007 258)` | `oklch(0.580 0.010 255)` | `oklch(0.583 0.0167 279.3)` | `oklch(0.590 0 0)` |
