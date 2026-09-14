---
handoff: purchase-sheet
title: Purchase Sheet
group: Overlays
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/PurchaseSheet.stories.js
variants: 3
states: 1
---

# Purchase Sheet

> The single persistent surface for EVERY store's "buy something" workflow: info step → payment/checkout step, as ONE BaseSheet whose body/ footer swap in place via BaseSheet's contentKey resize + cross-fade engine — never a separate sheet component faking a handoff. usePurchaseFlow() derives which step shows from the same singletons every entry point already writes: useItemSummary().summaryOpen (the (i) "info" step) and useCheckout().sheetOpen (a direct SKU tap or Buy Now bar). config.checkout.buyNow (FCM only, behind the fcmPaymentSheet dev flag) selects the payment-step view (promo-code order summary) over the default checkout-step view (2x2 payment-channel grid) once sheetOpen is true.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story purchase-sheet`.

## Usage Rules
- currentStep (and therefore what renders) is entirely derived — there is no local open/step prop; a story or caller drives it by writing to useItemSummary/useCheckout, not by passing props to PurchaseSheet.
- openCheckout() is gated: it is a no-op while signed out and not guest-verified (unless in Buy-Now-bar or inline mode) — a demo must set signedIn/guestVerified true first.
- The "Item Info" link from the checkout/payment step layers the info step ON TOP of (not instead of) the still-open checkout step via stepOverride — closing it returns to the step underneath, never to the SKU grid.
- The loyalty earn banner (#pre-footer) only renders on the checkout step, and only when the descriptor carries both a loyalty config object and a loyaltyPoints number.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Info step | 0 |
| Checkout step (signed in) | 1 |
| Responsive (desktop modal) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-m` | `12px` |
| `--x-pad-surface-xl` | `24px` |
| `--x-border-soft` | `oklch(0.992 0.003 286 / 0.08)` |
| `--x-text-header-strong` | `oklch(1 0 0)` |
| `--x-size-icon-s` | `16px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-bg-loyalty-banner` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `oklch(0.334 0.083 152.3)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
