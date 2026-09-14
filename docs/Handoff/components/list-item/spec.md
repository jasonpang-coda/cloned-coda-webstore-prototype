---
handoff: list-item
title: List Item
group: Primitives
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/ListItem.stories.js
variants: 5
states: 3
---

# List Item

> Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story list-item`.

## Usage Rules
- Enforce @container query layouts (never @media).
- Use semantic tokens for colors and spacing.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default | 0 |
| Selected | 1 |
| Leading icon | 2 |
| Disabled | 3 |
| As link | 4 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-gap-content-default` | `8px` |
