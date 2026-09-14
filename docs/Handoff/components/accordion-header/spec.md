---
handoff: accordion-header
title: Accordion Header
group: Primitives
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/AccordionHeader.stories.js
variants: 5
states: 3
---

# Accordion Header

> Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story accordion-header`.

## Usage Rules
- Enforce @container query layouts (never @media).
- Use semantic tokens for colors and spacing.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Closed (between) | 0 |
| Open (between) | 1 |
| Closed (center, with icon) | 2 |
| Open (center, with icon) | 3 |
| Disabled | 4 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-accordion` | `350ms cubic-bezier(0.4, 0, 0.2, 1)` |
