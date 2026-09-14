---
handoff: thumbnail
title: Thumbnail
group: Atoms
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/Thumbnail.stories.js
variants: 3
states: 1
---

# Thumbnail

> A generic square image tile with fixed rounded corners, used by CompactHero for its SKU/reward artwork. Size is a token-scale key (--x-size-img-<size>) rather than a raw pixel value, so callers stay on the size scale instead of inventing dimensions.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story thumbnail`.

## Usage Rules
- image is required (the img src).
- alt is optional, defaults to empty (decorative).
- size maps to --x-size-img-<size> — one of xs | s | m | l | xl (default) | xxl.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default (xl) | 0 |
| Small (s) | 1 |
| Extra large (xxl) | 2 |

## Token Contract (Resolved per Store)

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-thumbnail-m` | `12px` | `12px` | `0px` | `12px` | `12px` | `0px` | `12px` | `0px` | `12px` | `12px` | `0px` | `12px` |
