---
handoff: promo-code
title: Promo Code
group: Controls
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/PromoCode.stories.js
variants: 2
states: 3
---

# Promo Code

> Collapsible "Have a promo code?" mini-accordion nested inside OrderSummarySheet's Order Summary detail — the same grid-rows 0fr→1fr accordion recipe as ItemSummaryAccordion, applied a second time inside an already-open parent accordion. Prototype-only validation: the single hardcoded demo code "SAVE10" succeeds and applies a flat 10% discount off `amount` (emitted via `applied`); anything else non-empty shows the input's error state. Success cross-fades the form into a pill with a remove (×) control; removing returns to the expanded empty form, not the collapsed head.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story promo-code`.

## Usage Rules
- amount is optional — when omitted, a successful apply still fires `applied` but with a 0 discount (no item total to compute a percentage against).
- All interaction state (expanded/collapsed, idle/error/applied) is internal — there is no prop to force a state; drive it by typing into the field in the rendered story.
- The demo code is case-insensitive ("save10", "SAVE10" both match) — anything else non-empty on Apply shows the error state, and an empty field no-ops.
- show-terms is emitted, not handled internally — the host is responsible for opening whatever terms surface it points to.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default | 0 |
| With item amount | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-narrow` | `4px` |
| `--x-motion-toggle` | `200ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-s` | `8px` |
| `--x-gap-content-default` | `8px` |
| `--x-motion-sys-duration-fast` | `150ms` |
| `--x-motion-sys-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-bg-input-default` | `oklch(0 0 0 / 0.10)` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-accordion` | `350ms cubic-bezier(0.4, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-border-input-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-radius-input-s` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `4px` | `4px` |
| `--x-border-input-error` | `oklch(0.568 0.189 25)` | `oklch(0.619 0.209 28.5)` | `oklch(0.593 0.151 31.8)` | `oklch(0.635 0.251 21.6)` | `oklch(0.599 0.231 27.9)` | `oklch(0.633 0.0 0)` | `oklch(0.6 0.22 25)` | `oklch(0.468 0.172 25.9)` | `oklch(0.619 0.209 28.5)` | `oklch(0.619 0.209 28.5)` | `oklch(0.655 0.231 26.4)` | `oklch(0.708 0.191 33.9)` |
| `--x-bg-input-error` | `oklch(0.205 0.035 25)` | `oklch(0.184 0.029 42.9)` | `oklch(0.140 0.027 31.8)` | `oklch(0.191 0.061 39.4)` | `oklch(0.243 0.08 25.5)` | `oklch(0.179 0 0)` | `oklch(0.179 0.05 25)` | `oklch(0.19 0.069 25.9)` | `oklch(0.184 0.029 42.9)` | `oklch(0.184 0.029 42.9)` | `oklch(0.237 0.092 26.4)` | `oklch(0.166 0.037 33.9)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-placeholder` | `oklch(0.795 0.009 305)` | `oklch(0.584 0.008 277.1)` | `oklch(0.759 0.002 56.0)` | `oklch(0.561 0.154 280.2)` | `oklch(0.455 0.006 106.6)` | `oklch(0.585 0 0)` | `oklch(0.585 0.014 140)` | `oklch(0.585 0.01 80)` | `oklch(0.580 0.007 258)` | `oklch(0.580 0.010 255)` | `oklch(0.583 0.0167 279.3)` | `oklch(0.590 0 0)` |
| `--x-text-error-default` | `oklch(0.568 0.189 25)` | `oklch(0.619 0.209 28.5)` | `oklch(0.593 0.151 31.8)` | `oklch(0.635 0.251 21.6)` | `oklch(0.599 0.231 27.9)` | `oklch(0.633 0.0 0)` | `oklch(0.6 0.22 25)` | `oklch(0.468 0.172 25.9)` | `oklch(0.619 0.209 28.5)` | `oklch(0.619 0.209 28.5)` | `oklch(0.655 0.231 26.4)` | `oklch(0.708 0.191 33.9)` |
| `--x-border-input-success` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
| `--x-bg-sku-card-success` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.532 0.126 152) 16%, transparent) 0%, color-mix(in oklab, oklch(0.205 0.030 152) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.584 0.150 137.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.211 0.027 131.4) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.430 0.106 143.1) 16%, transparent) 0%, color-mix(in oklab, oklch(0.140 0.026 143.1) 16%, transparent) 100%)` | `linear-gradient( oklch(0.419 0.133 144.3 / 0.60), oklch(0.419 0.133 144.3 / 0.60) )` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.651 0.178 149.8) 16%, transparent) 0%, color-mix(in oklab, oklch(0.334 0.083 152.3) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.397 0.169 142.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.165 0.079 142.5) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.46 0.190 142.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.212 0.109 142.5) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.523 0.149 132.1) 16%, transparent) 0%, color-mix(in oklab, oklch(0.19 0.07 132.1) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.584 0.150 137.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.211 0.027 131.4) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.584 0.150 137.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.211 0.027 131.4) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.536 0.113 164.1) 16%, transparent) 0%, color-mix(in oklab, oklch(0.304 0.053 164.1) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.494 0.130 152.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.166 0.037 152.5) 16%, transparent) 100%)` |
| `--x-text-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
