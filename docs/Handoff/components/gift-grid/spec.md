---
handoff: gift-grid
title: Gift Grid
group: Layout
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/GiftGrid.stories.js
variants: 3
states: 1
---

# Gift Grid

> A 2-up CSS grid for GiftSkuCard children (COD:M Gifts category and the task-gated reward-gift section in App.vue). Always 2 columns at every width by default; when `count` is under 4, the M/L breakpoint (≥ 641px container) collapses the grid to exactly `count` columns instead so a short row (1-3 gifts) reads as a single centred row rather than a half-empty 2-up grid. `count` must match the number of children actually rendered — it is not derived automatically from the slot.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story gift-grid`.

## Usage Rules
- Pass count = the number of gift children being rendered (App.vue uses gifts.length).
- count < 4 only changes layout at ≥ 641px — XS/S always stay 2-up regardless of count.
- count ≥ 4 (the default) keeps the plain 2-up grid at every width; extra gifts simply wrap to more rows.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Few gifts (count < 4, single row) | 0 |
| Three gifts (single row) | 1 |
| Standard 2-up (count ≥ 4) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
