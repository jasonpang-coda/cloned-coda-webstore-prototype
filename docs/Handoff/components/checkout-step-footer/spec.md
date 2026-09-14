---
handoff: checkout-step-footer
title: Checkout Step Footer
group: Steps
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/CheckoutStepFooter.stories.js
variants: 2
states: 3
---

# Checkout Step Footer

> Presentational port of CheckoutSheet.vue's pinned footer — subtotal/price + CTA row, then the "View Terms and Conditions" link that scrolls CheckoutStepBody's static legal bar into view. Sibling to CheckoutStepBody; split because BaseSheet keeps the scrolling body and pinned footer as separate slots. Single flex root (not BaseSheet's shared `.sheet__footer` layout) since this footer is a horizontal price-block/CTA-column row rather than the other sheets' stacked footers.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story checkout-step-footer`.

## Usage Rules
- `data` and `primaryAction` are both required — `primaryAction.label` drives the CTA button text, `data.item.currentPrice` drives the price display.
- `canScrollBody` (from BaseSheet's #footer scoped slot) hides the terms link once the legal bar it jumps to already fits on screen without scrolling — a redundant "view" link otherwise.
- The terms link scrolls `.sheet__terms` (CheckoutStepBody's own element) into view via a direct DOM query, not a prop bridge — the two components must be mounted together for that click to do anything.
- `data.showPoweredByCoda` / `data.showRating` are independent per-store toggles — either, both, or neither may show.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default | 0 |
| Terms link hidden (nothing left to scroll) | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-size-img-xl` | `64px` |
| `--x-gradient-thumb-gloss` | `linear-gradient(135deg, oklch(0.992 0.003 286 / 0.12), oklch(0.992 0.003 286 / 0.02))` |
| `--x-border-soft` | `oklch(0.992 0.003 286 / 0.08)` |
| `--x-gap-content-tight` | `2px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-s` | `8px` |
| `--x-gap-content-separation` | `16px` |
| `--x-size-icon-xs` | `12px` |
| `--x-fx-ripple-color-dark` | `oklch(0 0 0 / 0.15)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
