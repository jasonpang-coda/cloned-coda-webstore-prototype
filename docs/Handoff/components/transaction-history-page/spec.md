---
handoff: transaction-history-page
title: Transaction History Page
group: Pages
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/TransactionHistoryPage.stories.js
variants: 1
states: 1
---

# Transaction History Page

> Full-page Transaction History view (Figma XS7.1.1) — a VIEW swapped in by App.vue in place of the storefront, not an overlay. Reached from the signed-in AccountPopover in every store. Demo data comes entirely from useStoreTransactions() (per-store `transactions` array — see src/stores/<store>/store.js); a store with no array renders the empty state. The "Past N days" range filter is functional and clock-robust — each demo item carries a `daysAgo` offset, filtered against runtime now.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story transaction-history-page`.

## Usage Rules
- No props — everything (list, copy, empty state) is derived from useStoreStrings()/useStoreTransactions() for the active theme.
- selectedRange defaults to 7, matching the Figma default ("Past 7 days").
- A store without a `transactions` array in its store.js falls back to the empty-state copy, not an error.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default | 0 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-l` | `16px` |
| `--x-pad-surface-xl` | `24px` |
| `--x-pad-surface-s` | `8px` |
| `--x-gap-content-separation` | `16px` |
| `--x-gap-content-default` | `8px` |
| `--x-size-icon-l` | `24px` |
| `--x-motion-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-text-header-strong` | `oklch(1 0 0)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
