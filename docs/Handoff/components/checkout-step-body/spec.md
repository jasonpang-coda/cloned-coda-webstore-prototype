---
handoff: checkout-step-body
title: Checkout Step Body
group: Steps
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/CheckoutStepBody.stories.js
variants: 2
states: 3
---

# Checkout Step Body

> Presentational port of CheckoutSheet.vue's scrolling body — the default (non-FCM-Buy-Now) payment step: account row, chosen-item banner (+ optional "Item Info" link back to the info step), the literal 2x2 payment-channel grid, and the static Terms & Conditions legal bar. Renders `data`, the resolved `checkout` descriptor from src/content/sheetContent.js (checkoutDescriptor) — never reads config/strings/assets directly. Sibling to CheckoutStepFooter, split because BaseSheet keeps the scrolling body and pinned footer as separate slots; both read useCheckout().selectedChannel directly so the footer can compute its enabled state without a prop bridge.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story checkout-step-body`.

## Usage Rules
- `data` is the only prop, and is required — it is the full `checkout` step descriptor, not a raw item.
- The item banner shows `label` when set, otherwise falls back to `amount` + `currencyLabel`; `baseAmount`/`bonusAmount` render the "500 + 28 BONUS CP" split line only when both are non-null.
- "Item Info" only renders when `data.item.bundleInfo` is present — a plain currency SKU has no bundle to drill into.
- The payment-channel grid is a literal 4-entry list built in sheetContent.js (Google Pay/Apple Pay, card, PayPal, Cash App) — not config-driven, unlike PaymentStepBody's per-store `config.checkout.channels`.
- Selection is read from the shared `useCheckout().selectedChannel` singleton, not a prop — driving it in a story means writing to that composable directly if a specific selected state is needed.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default | 0 |
| Bundle item (with Item Info) | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-default` | `8px` |
| `--x-motion-sys-duration-fast` | `150ms` |
| `--x-motion-sys-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-xs` | `4px` |
| `--x-pad-surface-s` | `8px` |
| `--x-border-soft-2` | `oklch(0.992 0.003 286 / 0.12)` |
| `--x-size-img-xl` | `64px` |
| `--x-gradient-thumb-gloss` | `linear-gradient(135deg, oklch(0.992 0.003 286 / 0.12), oklch(0.992 0.003 286 / 0.02))` |
| `--x-border-soft` | `oklch(0.992 0.003 286 / 0.08)` |
| `--x-gap-content-tight` | `2px` |
| `--x-text-header-strong` | `oklch(1 0 0)` |
| `--x-pad-surface-m` | `12px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-size-icon-l` | `24px` |
| `--x-gap-content-separation` | `16px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-indicator-neutral-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-gradient-checkout-banner` | `linear-gradient(color-mix(in oklab, oklch(0.180 0.035 305) 72%, transparent), color-mix(in oklab, oklch(0.180 0.035 305) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.166 0.017 273.5) 72%, transparent), color-mix(in oklab, oklch(0.166 0.017 273.5) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.207 0.006 56.0) 72%, transparent), color-mix(in oklab, oklch(0.207 0.006 56.0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.231 0.160 264.1) 72%, transparent), color-mix(in oklab, oklch(0.231 0.160 264.1) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0 0 0) 72%, transparent), color-mix(in oklab, oklch(0 0 0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.134 0.0 0) 72%, transparent), color-mix(in oklab, oklch(0.134 0.0 0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.2 0.02 140) 72%, transparent), color-mix(in oklab, oklch(0.2 0.02 140) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.147 0.003 17.6) 72%, transparent), color-mix(in oklab, oklch(0.147 0.003 17.6) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.165 0.012 258) 72%, transparent), color-mix(in oklab, oklch(0.165 0.012 258) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.160 0.020 255) 72%, transparent), color-mix(in oklab, oklch(0.160 0.020 255) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.163 0.033 279.3) 72%, transparent), color-mix(in oklab, oklch(0.163 0.033 279.3) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0 0 0) 72%, transparent), color-mix(in oklab, oklch(0 0 0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-bonus-amount` | `oklch(0.749 0.166 293)` | `oklch(0.930 0.164 101.5)` | `oklch(0.809 0.085 75.1)` | `oklch(0.975 0.149 108.9)` | `oklch(0.861 0.202 153.1)` | `oklch(0.642 0.183 142.5)` | `oklch(0.77 0.16 142.5)` | `oklch(0.74 0.131 133.1)` | `oklch(0.780 0.180 50)` | `oklch(0.890 0.155 96)` | `oklch(0.902 0.098 88.3)` | `oklch(0.934 0.185 128.9)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
| `--x-bg-card-default` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-border-sku-card-default` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.10)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.22)` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.8 0.07 80 / 0.10) 0%, oklch(0.8 0.07 80 / 0.32) 45%, oklch(0.82 0.08 80 / 0.62) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 258 / 0.04) 0%, oklch(0.99 0.004 258 / 0.22) 45%, oklch(0.99 0.004 258 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 255 / 0.05) 0%, oklch(0.99 0.004 255 / 0.24) 45%, oklch(0.99 0.004 255 / 0.60) 100% )` | `oklch(0.843 0.106 88.3 / 0.22)` | `oklch(0.290 0 0)` |
| `--x-border-sku-card-hover` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.08) 0%, oklch(0.99 0.004 247 / 0.35) 45%, oklch(0.99 0.004 247 / 0.78) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.08) 0%, oklch(0.99 0.004 247 / 0.35) 45%, oklch(0.99 0.004 247 / 0.78) 100% )` | `oklch(0.355 0.109 33.9)` | `oklch(0.95 0 0 / 0.22)` | `oklch(0.95 0 0 / 0.16)` | `oklch(0.583 0.198 142.5 / 0.45)` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.08) 0%, oklch(0.99 0.004 247 / 0.35) 45%, oklch(0.99 0.004 247 / 0.78) 100% )` | `linear-gradient( 160deg, oklch(0.84 0.08 80 / 0.16) 0%, oklch(0.84 0.08 80 / 0.45) 45%, oklch(0.88 0.09 80 / 0.85) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 258 / 0.08) 0%, oklch(0.99 0.004 258 / 0.35) 45%, oklch(0.99 0.004 258 / 0.78) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 255 / 0.10) 0%, oklch(0.99 0.004 255 / 0.38) 45%, oklch(0.99 0.004 255 / 0.80) 100% )` | `oklch(0.843 0.106 88.3 / 0.45)` | `oklch(0.910 0.246 128.9)` |
| `--x-bg-card-selected` | `oklch(0.205 0.039 293)` | `oklch(0.217 0.027 98.3)` | `oklch(0.140 0.017 75.1)` | `oklch(0.380 0.092 56.8)` | `oklch(0.334 0.083 152.3)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.057 133.1)` | `oklch(0.205 0.045 45)` | `oklch(0.460 0.180 264)` | `oklch(0.425 0.042 88.3)` | `oklch(0.166 0.045 128.9)` |
| `--x-text-final-price` | `oklch(0.878 0.091 340)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
