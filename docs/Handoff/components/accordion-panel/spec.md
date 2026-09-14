---
handoff: accordion-panel
title: Accordion Panel
group: Primitives
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/AccordionPanel.stories.js
variants: 2
states: 3
---

# Accordion Panel

> Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story accordion-panel`.

## Usage Rules
- Enforce @container query layouts (never @media).
- Use semantic tokens for colors and spacing.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Closed | 0 |
| Open | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-motion-accordion` | `350ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-m` | `12px` |
