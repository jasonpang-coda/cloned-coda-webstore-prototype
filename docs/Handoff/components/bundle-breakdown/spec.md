---
handoff: bundle-breakdown
title: Bundle Breakdown
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/BundleBreakdown.stories.js
variants: 4
states: 1
---

# Bundle Breakdown

> The row of child SKU tiles ("what's inside") shared by every card that can surface bundled items — BundleSkuCard, BestSellerCard and SkuImageCard. Owns the flex row, the BundleItem loop and (when scrollable) a horizontal drag-scroll via useDragScroll(). Renders nothing (no root element at all) when items is empty, so a host can mount it unconditionally without an extra v-if. Clicking a tile emits `select` with the click event, which the host forwards to open the Item Summary sheet.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story bundle-breakdown`.

## Usage Rules
- items is the only real driver of content — each entry is passed straight through to BundleItem: { image, tileBg, tag: { label, variant }, quantity }.
- Renders nothing when items is empty — hosts do not need to guard with v-if.
- scrollable=true switches from wrapping/overflowing to a horizontal drag-scroll row (scrollbar hidden) — use it when the item set is wider than its host card.
- A class passed by the host falls through to the root and merges with the component's own layout styles (used for overlap margin / inset padding tuning).

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default (3 items) | 0 |
| Graded rarities | 1 |
| Scrollable (wide set) | 2 |
| Empty (renders nothing) | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-narrow` | `4px` |
