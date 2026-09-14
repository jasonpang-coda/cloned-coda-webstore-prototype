---
handoff: transaction-card
title: Transaction Card
group: Cards
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/TransactionCard.stories.js
variants: 3
states: 1
---

# Transaction Card

> One entry in the Transaction History list (Figma 5694:1389). Purely presentational and not interactive (no hover/press affordance) — `state` (fulfilled | pending | failed) drives the status pill colour and whether the Total Payment row shows an amount or "No charge Made". All copy including row labels is passed in from the page via strings.transactionHistory — the card formats nothing itself; `date` and `total` arrive pre-formatted as display strings.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story transaction-card`.

## Usage Rules
- title, date and labels/statusLabel are required; total may be null (renders the no-charge copy for failed).
- state must be one of fulfilled | pending | failed — anything else falls back to the neutral pill.
- labels must be the full strings.transactionHistory.row shape (paymentStatus, orderId, transactionId, paymentMethod, totalPayment, noCharge).

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Fulfilled | 0 |
| Pending | 1 |
| Failed (no charge) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-pad-surface-s` | `8px` |
| `--x-pad-surface-l` | `16px` |
| `--x-surface-frost` | `oklch(0.992 0.003 286 / 0.04)` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-distance-md` | `8px` |
| `--x-gap-content-loose` | `12px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-border-card-default` | `oklch(1 0 0 / 0.08)` | `oklch(0.310 0.011 271.0)` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0)` | `oklch(0.158 0.002 197)` | `oklch(0.583 0.198 142.5 / 0.18)` | `oklch(0.3 0.02 140)` | `oklch(0.8 0.07 80 / 0.16)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.843 0.106 88.3 / 0.18)` | `oklch(0.290 0 0)` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-blur-container` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `16px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `8px` | _(resolve live)_ | _(resolve live)_ |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
