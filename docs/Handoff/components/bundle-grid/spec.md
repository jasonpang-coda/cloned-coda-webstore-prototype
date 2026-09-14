---
handoff: bundle-grid
title: Bundle Grid
group: Layout
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/BundleGrid.stories.js
variants: 3
states: 1
---

# Bundle Grid

> A plain CSS grid wrapper for BundleSkuCard rows: single column on XS/S, 2-up from the 801px container breakpoint. It carries no props of its own — callers just drop BundleSkuCard children straight into the default slot (e.g. the Currency+Bonus and New Users Promo sections in App.vue, and CategoryCatalog's bundle subcategories). Typically holds 1-4 bundle cards per section; more than 4 simply wraps to additional rows at the same 2-up cadence.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story bundle-grid`.

## Usage Rules
- BundleGrid takes no props — column count is purely a function of container width and child count.
- Children are expected to be BundleSkuCard (or equivalent) elements; the grid does not care about their content.
- A single child still renders inside the 2-up track and does not stretch to fill both columns.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Single bundle | 0 |
| Two bundles (2-up) | 1 |
| Four bundles (wraps to 2 rows) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
