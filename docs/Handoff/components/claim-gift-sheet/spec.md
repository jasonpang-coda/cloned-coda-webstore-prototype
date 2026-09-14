---
handoff: claim-gift-sheet
title: Claim Gift Sheet
group: Overlays
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/ClaimGiftSheet.stories.js
variants: 4
states: 1
---

# Claim Gift Sheet

> The COD:M/FCM gift-claim sheet (sibling of PurchaseSheet), opened via useGiftClaim().openGiftClaim(gift) from a GiftSkuCard tap. Two views on one BaseSheet, swapped through the contentKey resize + cross-fade engine: Confirm ("You are about to claim…" + SKU banner, plus an inline gamer-ID form when signed out) and Success (confirmation + an optional upsell SKU banner that hands off to PurchaseSheet). On an EA/KONAMI-flow store the signed-out footer swaps the disabled Claim CTA for an EA/mykonami sign-in button instead of showing the inline form.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story claim-gift-sheet`.

## Usage Rules
- requiresAccount is captured once at open time, not derived reactively — it must not flip false mid-session or the embedded PlayerAccount form unmounts and resets guestVerified.
- The Claim CTA stays disabled until canClaim (signedIn || guestVerified) is true.
- upsellItem is optional — the success view falls back to a plain "Got it"-style CTA (giftClaimDoneCta) when it is absent.
- On an EA/KONAMI-flow store, the signed-out footer replaces the disabled Claim CTA entirely — it never shows both.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Confirm — signed out | 0 |
| Confirm — ready to claim | 1 |
| Success — no upsell | 2 |
| Success — with upsell | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-s` | `8px` |
| `--x-border-soft-2` | `oklch(0.992 0.003 286 / 0.12)` |
| `--x-gap-content-default` | `8px` |
| `--x-gradient-thumb-gloss` | `linear-gradient(135deg, oklch(0.992 0.003 286 / 0.12), oklch(0.992 0.003 286 / 0.02))` |
| `--x-border-soft` | `oklch(0.992 0.003 286 / 0.08)` |
| `--x-gap-content-tight` | `2px` |
| `--x-text-header-strong` | `oklch(1 0 0)` |
| `--x-fx-ripple-color-dark` | `oklch(0 0 0 / 0.15)` |
| `--x-gap-content-narrow` | `4px` |
| `--x-motion-sys-duration-fast` | `150ms` |
| `--x-motion-sys-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-duration-slowest` | `1800ms` |
| `--x-motion-sys-duration-slow` | `350ms` |
| `--x-size-icon-l` | `24px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-xl` | `24px` |
| `--x-motion-btn-activate` | `250ms cubic-bezier(0, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-gradient-checkout-banner` | `linear-gradient(color-mix(in oklab, oklch(0.180 0.035 305) 72%, transparent), color-mix(in oklab, oklch(0.180 0.035 305) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.166 0.017 273.5) 72%, transparent), color-mix(in oklab, oklch(0.166 0.017 273.5) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.207 0.006 56.0) 72%, transparent), color-mix(in oklab, oklch(0.207 0.006 56.0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.231 0.160 264.1) 72%, transparent), color-mix(in oklab, oklch(0.231 0.160 264.1) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0 0 0) 72%, transparent), color-mix(in oklab, oklch(0 0 0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.134 0.0 0) 72%, transparent), color-mix(in oklab, oklch(0.134 0.0 0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.2 0.02 140) 72%, transparent), color-mix(in oklab, oklch(0.2 0.02 140) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.147 0.003 17.6) 72%, transparent), color-mix(in oklab, oklch(0.147 0.003 17.6) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.165 0.012 258) 72%, transparent), color-mix(in oklab, oklch(0.165 0.012 258) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.160 0.020 255) 72%, transparent), color-mix(in oklab, oklch(0.160 0.020 255) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.163 0.033 279.3) 72%, transparent), color-mix(in oklab, oklch(0.163 0.033 279.3) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0 0 0) 72%, transparent), color-mix(in oklab, oklch(0 0 0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` |
| `--x-text-bonus-amount` | `oklch(0.749 0.166 293)` | `oklch(0.930 0.164 101.5)` | `oklch(0.809 0.085 75.1)` | `oklch(0.975 0.149 108.9)` | `oklch(0.861 0.202 153.1)` | `oklch(0.642 0.183 142.5)` | `oklch(0.77 0.16 142.5)` | `oklch(0.74 0.131 133.1)` | `oklch(0.780 0.180 50)` | `oklch(0.890 0.155 96)` | `oklch(0.902 0.098 88.3)` | `oklch(0.934 0.185 128.9)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-bg-action-signin` | _(resolve live)_ | `oklch(0 0 0)` | _(resolve live)_ | `oklch(0.968 0.211 109.8)` | `oklch(0.62 0.22 27)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `oklch(0 0 0)` | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | _(resolve live)_ |
| `--x-bg-action-mykonami` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `linear-gradient(180deg, oklch(0.506 0.207 26), oklch(0.428 0.175 25))` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | _(resolve live)_ |
| `--x-bg-indicator-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-text-on-primary` | `oklch(0.905 0.195 116)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.494 0.283 269.5)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
