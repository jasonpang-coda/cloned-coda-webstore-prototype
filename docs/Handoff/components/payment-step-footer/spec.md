---
handoff: payment-step-footer
title: Payment Step Footer
group: Steps
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/PaymentStepFooter.stories.js
variants: 3
states: 3
---

# Payment Step Footer

> Presentational port of the payment step's pinned footer: rewards line + full-width CTA (disabled and reading "Select Payment Method" until a channel is chosen), then the "View Terms and Conditions" link that scrolls PaymentStepBody's static legal bar into view. Reads useCheckout().selectedChannel directly — the same shared singleton PaymentStepBody reads — so the two halves stay in sync without a prop bridge. Sibling to PaymentStepBody; see that file for why the step is split in two.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story payment-step-footer`.

## Usage Rules
- `data` is required; the CTA label and enabled state are NOT driven by `primaryAction` here (unlike CheckoutStepFooter) — they're computed locally from `useCheckout().selectedChannel`: disabled + `data.selectPaymentCta` until a channel is picked, then enabled + `data.actionLabel`.
- `canScrollBody` (from BaseSheet's #footer scoped slot) hides the terms link once the legal bar it jumps to already fits on screen.
- A story that wants to show the "channel selected" state must write to the shared `useCheckout().selectedChannel` singleton directly (via setup/teardown) — there is no prop for it.
- The rewards line only renders when both `data.loyalty` and `data.loyaltyPoints` are set.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| No channel selected (disabled) | 0 |
| Channel selected (enabled) | 1 |
| No rewards, terms link hidden | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-separation` | `16px` |
| `--x-gap-content-default` | `8px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-text-header-strong` | `oklch(1 0 0)` |
| `--x-size-icon-s` | `16px` |
| `--x-fx-ripple-color-dark` | `oklch(0 0 0 / 0.15)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-bg-action-primary` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
