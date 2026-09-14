---
handoff: material-icon
title: Material Icon
group: Atoms
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/MaterialIcon.stories.js
variants: 4
states: 1
---

# Material Icon

> Renders a Google Material Symbol (@material-symbols/svg-400) as a CSS mask filled with currentColor, so it inherits text colour like a font glyph. Used across nearly every interactive component in the app — NavBar, NavDrawer, PurchaseSheet, TrustBar, InfoTag, Snackbar, BuyNowBar and dozens more — for chevrons, status glyphs and inline iconography. Icons are resolved from an explicit whitelist of `?url` imports (ICONS map), not a node_modules glob, so the same set works in dev, build, and on Vercel.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story material-icon`.

## Usage Rules
- name is required and must match a key already imported into the ICONS map — unknown names render an empty (blank) glyph, not an error.
- variant is one of filled | outlined | round (default) | sharp | two-tone — only variants actually imported per-icon are available (mostly "round").
- size accepts a number (px) or a CSS size string; default is 24.
- To add a new icon: import its ?url asset and add an ICONS entry keyed "<variant>/<name>".

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| account_circle | 0 |
| check_circle | 1 |
| close | 2 |
| chevron_right (small) | 3 |
