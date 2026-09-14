---
handoff: info-step-body
title: Info Step Body
group: Steps
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/InfoStepBody.stories.js
variants: 3
states: 3
---

# Info Step Body

> Presentational port of the "ITEM SUMMARY" step's scrolling body — the signed-in-state account row (or a signed-out message), the product block (banner, optional composited SKU art, title, limit label, live countdown, price/discount), and the "you will receive" ItemSummaryAccordion list. Renders `data`, the resolved `info` descriptor from src/content/sheetContent.js (infoDescriptor) — never reads config/strings/ assets directly. Sibling to InfoStepFooter, split because BaseSheet keeps the scrolling body and pinned footer as separate slots.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story info-step-body`.

## Usage Rules
- A live countdown (bundle.endsAt set) used to hang npm run harness:render forever: composables/useCountdown.js's watch(...,{immediate:true}) started a real setInterval during setup(), which Vue SSR's renderToString() also executes (unlike onMounted, which SSR skips) — the pending timer kept the Node process alive indefinitely. Fixed in useCountdown.js by guarding start() with '!import.meta.env.SSR'. Any future composable starting a timer/interval from an immediate watch or top-level setup code (not onMounted) needs the same guard.
- `data` is the only prop, and is required — `data.bundle` is the full SKU/bundle object, plus the resolved copy/flags around it.
- `data.showProduct: false` (FCM Buy Now's compact sheet) hides the whole account row + product block, leaving only the receive list.
- `data.canBuy` toggles between the account row (signed in / guest-verified) and `data.signedOutMessage`.
- A live countdown only renders when `bundle.endsAt` is a future ms epoch — `useCountdown` drives the "ends in" text and its urgency color tier.
- `data.compactAccordion` is forwarded to every ItemSummaryAccordion row (hides the rarity thumb — used by stores with no rarity thumb concept).

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default (signed in) | 0 |
| Signed out | 1 |
| With countdown + rewards (FCM Buy Now, compact) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-xs` | `4px` |
| `--x-pad-surface-s` | `8px` |
| `--x-border-soft` | `oklch(0.992 0.003 286 / 0.08)` |
| `--x-gap-content-loose` | `12px` |
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-default` | `8px` |
| `--x-gap-content-tight` | `2px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-indicator-neutral-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-bg-sku-card-default` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.187 0.035 33.9), oklch(0.187 0.035 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.134 0.0 0)` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.85 0.08 80 / 0.06) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.992 0.003 258 / 0.04) 0%, transparent 100% )` | `linear-gradient(to bottom, oklch(0 0 0 / 0.64) 24.519%, oklch(0 0 0))` | `oklch(0.163 0.033 279.3)` | `oklch(0.145 0 0)` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-warning-default` | `oklch(0.800 0.155 75)` | `oklch(0.743 0.142 66.8)` | `oklch(0.705 0.120 78.8)` | `oklch(0.618 0.149 57.5)` | `oklch(0.769 0.165 70.1)` | `oklch(0.617 0.103 109.1)` | `oklch(0.8 0.15 80)` | `oklch(0.759 0.144 80.0)` | `oklch(0.743 0.142 66.8)` | `oklch(0.743 0.142 66.8)` | `oklch(0.763 0.140 72.5)` | `oklch(0.827 0.171 75.0)` |
| `--x-text-error-default` | `oklch(0.568 0.189 25)` | `oklch(0.619 0.209 28.5)` | `oklch(0.593 0.151 31.8)` | `oklch(0.635 0.251 21.6)` | `oklch(0.599 0.231 27.9)` | `oklch(0.633 0.0 0)` | `oklch(0.6 0.22 25)` | `oklch(0.468 0.172 25.9)` | `oklch(0.619 0.209 28.5)` | `oklch(0.619 0.209 28.5)` | `oklch(0.655 0.231 26.4)` | `oklch(0.708 0.191 33.9)` |
| `--x-text-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
| `--x-text-final-price` | `oklch(0.878 0.091 340)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
