---
handoff: span
title: Span
group: Atoms
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/Span.stories.js
variants: 4
states: 1
---

# Span

> A column-span slot that must live inside a Grid — it houses a section's actual content and its column width changes per breakpoint via container queries, never @media. Used throughout the page templates (HomeStandard, HomeBlob, CategoryCatalog, TransactionHistoryPage, OrderCompletePage, MilestoneRewards, Footer, NavBar) to wrap each section's content inside the shared Grid. Grid itself has no items prop — Span is the only thing that claims columns.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story span`.

## Usage Rules
- size is one of "fluid" (default, full width at all breakpoints) | "content" (full width XS/S, centred 6-of-12 on M/L) | "full" (alias of fluid) | "carousel" (full-bleed edge-to-edge on XS/S, same centred 6-of-12 as content on M/L) | "col-lead" (4-of-12 left rail on M/L) | "col-main" (8-of-12 right rail on M/L) — col-lead/col-main are full width on XS/S.
- A `bare` mode is injected (not a prop) from a split-layout ancestor via GRID_BARE_KEY — an inner Span inside a split column must not re-centre or cap its own width since the outer split shell already owns placement.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Fluid (full width) | 0 |
| Content (centred) | 1 |
| Carousel (full bleed) | 2 |
| Col-lead (split rail) | 3 |
