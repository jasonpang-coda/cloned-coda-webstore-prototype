---
handoff: order-complete-page
title: Order Complete Page
group: Pages
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/OrderCompletePage.stories.js
variants: 3
states: 1
---

# Order Complete Page

> Full-page Purchase Success view (Figma 335:61272) — a VIEW swapped in by App.vue in place of the storefront, not an overlay. Theme-gated on strings.page.orderComplete; only COD:M defines that key today. Order details persist from the real checkout flow (useCheckout selectedItem/ guestPlayerName/selectedChannel), falling back field-by-field to the Figma default (see useOrderComplete.js) when nothing was selected. The gift banner reuses the same task-gated 88 CP flow as the Gifts category (useTaskGiftClaim), so its step depends on the shared isInstalled/subscribed/claimed singletons.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story order-complete-page`.

## Usage Rules
- Renders nothing (v-if="t") when the active store has no strings.page.orderComplete.
- order merges live checkout state over DEFAULT_ORDER field-by-field (never a spread) so a null field never clobbers the fallback.
- The gift banner shows a ToggleSwitch for the "push" step and a pill CTA for every other step — never both.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default (demo order, install step) | 0 |
| Real checkout selection, push step | 1 |
| Gift already claimed | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-separation` | `16px` |
| `--x-pad-surface-xl` | `24px` |
| `--x-pad-surface-s` | `8px` |
| `--x-gap-content-default` | `8px` |
| `--x-gap-content-tight` | `2px` |
| `--x-fx-ripple-color-dark` | `oklch(0 0 0 / 0.15)` |
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-size-control-s` | `32px` |
| `--x-pad-surface-m` | `12px` |
| `--border-weight-selected` | `2px` |
| `--x-surface-ghost-3` | `oklch(1 0 0 / 0.10)` |
| `--border-weight-default` | `1px` |
| `--x-pad-surface-xxs` | `2px` |
| `--x-bg-tag-neutral` | `oklch(0 0 0 / 0.10)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-scrim-banner-strong` | `color-mix(in oklab, oklch(0.180 0.035 305) 88%, transparent)` | `color-mix(in oklab, oklch(0.166 0.017 273.5) 88%, transparent)` | `color-mix(in oklab, oklch(0.207 0.006 56.0) 88%, transparent)` | `color-mix(in oklab, oklch(0.231 0.160 264.1) 88%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 88%, transparent)` | `color-mix(in oklab, oklch(0.134 0.0 0) 88%, transparent)` | `color-mix(in oklab, oklch(0.2 0.02 140) 88%, transparent)` | `color-mix(in oklab, oklch(0.147 0.003 17.6) 88%, transparent)` | `color-mix(in oklab, oklch(0.165 0.012 258) 88%, transparent)` | `color-mix(in oklab, oklch(0.160 0.020 255) 88%, transparent)` | `color-mix(in oklab, oklch(0.163 0.033 279.3) 88%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 88%, transparent)` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-bg-action-primary` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-bg-action-neutral` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-bg-action-neutral-hover` | `color-mix(in oklab, oklch(1.000 0.000 305) 90%, #000)` | `color-mix(in oklab, oklch(0.992 0.003 286.4) 90%, #000)` | `color-mix(in oklab, oklch(0.993 0.001 56.0) 90%, #000)` | `color-mix(in oklab, oklch(1 0 0) 90%, #000)` | `color-mix(in oklab, oklch(1 0 0) 90%, #000)` | `color-mix(in oklab, oklch(0.975 0 0) 90%, #000)` | `color-mix(in oklab, oklch(0.975 0.005 140) 90%, #000)` | `color-mix(in oklab, oklch(0.972 0.03 80) 90%, #000)` | `color-mix(in oklab, oklch(0.992 0.002 258) 90%, #000)` | `color-mix(in oklab, oklch(0.992 0.002 255) 90%, #000)` | `color-mix(in oklab, oklch(0.995 0.0024 279.3) 90%, #000)` | `color-mix(in oklab, oklch(1 0 0) 90%, #000)` |
| `--x-text-on-primary` | `oklch(0.905 0.195 116)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.494 0.283 269.5)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-border-signin-btn` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.910 0.246 128.9)` |
| `--x-border-tag-success` | `oklch(0.532 0.126 152)` | `oklch(0.584 0.150 137.5)` | `oklch(0.430 0.106 143.1)` | `oklch(0.419 0.133 144.3)` | `oklch(0.593 0.152 150.2)` | `oklch(0.397 0.169 142.5)` | `oklch(0.46 0.190 142.5)` | `oklch(0.523 0.149 132.1)` | `oklch(0.584 0.150 137.5)` | `oklch(0.584 0.150 137.5)` | `oklch(0.536 0.113 164.1)` | `oklch(0.494 0.130 152.5)` |
| `--x-bg-info-banner-success` | `oklch(0.205 0.030 152)` | `oklch(0.211 0.027 131.4)` | `oklch(0.140 0.026 143.1)` | `oklch(0.182 0.053 138.3)` | `oklch(0.31 0.069 151.9)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.07 132.1)` | `oklch(0.211 0.027 131.4)` | `oklch(0.211 0.027 131.4)` | `oklch(0.304 0.053 164.1)` | `oklch(0.166 0.037 152.5)` |
| `--x-border-sheet` | `oklch(1 0 0 / 0.16)` | `oklch(1 0 0 / 0.16)` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.12)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.18)` | `oklch(1 0 0 / 0.16)` | `oklch(0.82 0.07 80 / 0.22)` | `oklch(1 0 0 / 0.16)` | `oklch(1 0 0 / 0.16)` | `oklch(0.843 0.106 88.3 / 0.18)` | `oklch(0.290 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-sheet` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-bg-sku-card-default` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.187 0.035 33.9), oklch(0.187 0.035 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.134 0.0 0)` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.85 0.08 80 / 0.06) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.992 0.003 258 / 0.04) 0%, transparent 100% )` | `linear-gradient(to bottom, oklch(0 0 0 / 0.64) 24.519%, oklch(0 0 0))` | `oklch(0.163 0.033 279.3)` | `oklch(0.145 0 0)` |
| `--x-border-sku-card-default` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.10)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.22)` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.8 0.07 80 / 0.10) 0%, oklch(0.8 0.07 80 / 0.32) 45%, oklch(0.82 0.08 80 / 0.62) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 258 / 0.04) 0%, oklch(0.99 0.004 258 / 0.22) 45%, oklch(0.99 0.004 258 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 255 / 0.05) 0%, oklch(0.99 0.004 255 / 0.24) 45%, oklch(0.99 0.004 255 / 0.60) 100% )` | `oklch(0.843 0.106 88.3 / 0.22)` | `oklch(0.290 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
