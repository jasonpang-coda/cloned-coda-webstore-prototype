---
handoff: grid
title: Grid
group: Layout
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/Grid.stories.js
variants: 4
states: 1
---

# Grid

> The Commerce Engine's responsive column grid — the structural container every page section sits inside, driven entirely by @container queries against the device-screen width (never @media): 8 columns at XS/S (< 801px), 12 columns at M/L (≥ 801px), with column gap, row gap and side padding all escalating per breakpoint via dedicated --x-gap-grid-* tokens. It never renders content directly — a `Span` child claims one or more columns and holds the actual section content. This story wraps it in a small demo component so the grid math is visible against real SKU cards; Grid itself has no items prop.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story grid`.

## Usage Rules
- Grid takes no content props — it only lays out whatever Span (or other) children it is given.
- `as` renders a different root tag (e.g. "section") while keeping the same grid CSS.
- The injected (non-prop) "bare" mode collapses Grid/Span to an unstyled flow at ≥ 801px — used only inside a split-layout column (config.page.layout === "split", e.g. Codashop) so a nested Grid does not lay out a second 12-col grid inside an already-gridded column. Below 801px a bare Grid still uses the normal 8-col rules, since the split collapses to one column there.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default (content section) | 0 |
| As <section> | 1 |
| Split layout (col-lead / col-main) | 2 |
| Bare (nested inside a split column) | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-grid-gutter` | `8px` |
| `--x-gap-grid-row-default` | `12px` |
| `--x-gap-grid-margin` | `12px` |
| `--x-gap-grid-gutter-m` | `12px` |
