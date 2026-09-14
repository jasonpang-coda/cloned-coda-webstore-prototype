---
handoff: step-payment
title: Step Payment
group: Checkout
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/StepPayment.stories.js
variants: 2
states: 1
---

# Step Payment

> "Select Payment" step (Figma 2198:5134). A grid of PcCard payment-channel tiles, modelled on CheckoutSheet's own channel list but laid out as its own page section with NO enclosing StepCard. Has no real props: the channel set is config.checkout.paymentChannels (an ordered array of CHANNEL_DEFS keys — omitted keeps the original 4-channel default), and selection reads/writes the shared useCheckout() singleton (selectedItem, selectedChannel), not local state — a story drives it via setup()/teardown() writing directly to that composable, the same idiom as BuyNowBar's story.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story step-payment`.

## Usage Rules
- Every tile shows the same price once a SKU is selected upstream (useCheckout().selectedItem) — price is not per-channel.
- A channel with no shipped logo asset renders a generic icon + label tile rather than a fabricated brand mark.
- 2 columns on mobile, 4 columns at the >= 641px container breakpoint.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| No item selected yet | 0 |
| Item + channel selected | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-gap-content-default` | `8px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
