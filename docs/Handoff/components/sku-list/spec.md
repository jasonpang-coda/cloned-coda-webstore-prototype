---
handoff: sku-list
title: Sku List
group: Layout
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/SkuList.stories.js
variants: 4
states: 1
---

# Sku List

> A titled section of SkuCard children with three arrangements: the default "wrap" grid (2 columns on XS, auto-filling 4-up at ≥ 641px, flexing down when 4 fixed columns would not actually fit), "columns" (a fixed 1-col mobile → 2-col ≥ 801px grid), and "stack" (a single full-width column of horizontal "row"-layout cards at every width). Each item in `items` is spread directly onto a SkuCard via v-bind, so it takes the same prop shape as SkuCard itself (amount, currentPrice, skuImage, bonus fields, etc). Cards get a staggered 90ms entrance delay, offset by the section-level baseDelay.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story sku-list`.

## Usage Rules
- items is required — each element is v-bound straight onto a SkuCard, so it must carry SkuCard's own prop shape (amount + currentPrice at minimum).
- columns overrides the default 4-up count at ≥ 641px; it is ignored when layout is "columns" or "stack", which have their own fixed arrangements.
- layout "columns"/"stack" also force every card into SkuCard's row layout — do not additionally pass layout on individual items.
- An item's own skuImage/cpIcon (item.skuImage) overrides the list-level skuImage/cpIcon prop shared by every card.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Wrap (default, 2→4 up) | 0 |
| Explicit 5-up (Codashop Select Recharge) | 1 |
| Columns (stacked → 2-up) | 2 |
| Stack (single column, row cards) | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-default` | `8px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
