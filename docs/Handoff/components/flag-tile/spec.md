---
handoff: flag-tile
title: Flag Tile
group: Controls
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/FlagTile.stories.js
variants: 3
states: 3
---

# Flag Tile

> Purely decorative 4:3 market flag art (20×15 Figma flag component) with a hairline border + top-light gloss overlay. Falls back to the regional-indicator emoji (via flagEmoji) for markets that have no bundled SVG in src/shared/flags/ (currently IE, GT, FI, GR, SK, TW) — the emoji fallback intentionally skips the border/gloss ring, since a translucent frame around a transparent glyph reads as an empty box. Consumers (LanguageSelectorSheet, RegionSelectorSheet rows, NavBar) supply the visible label; this component carries none itself (aria-hidden).

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story flag-tile`.

## Usage Rules
- code is required — a two-letter ISO country code; anything else falls through flagEmoji to the globe placeholder.
- width controls both dimensions (height follows at a fixed 4:3 ratio) — 20 for drawer/search rows, 24 for the navbar.
- Purely visual/decorative — always render it alongside a real text label for accessibility, never as the sole market identifier.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| SVG artwork (default width) | 0 |
| SVG artwork (navbar width) | 1 |
| Emoji fallback (no SVG art) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-flag-tile-border` | `oklch(0 0 0 / 0.10)` |
| `--x-flag-tile-gloss` | `linear-gradient(to bottom, oklch(1 0 0 / 0.70), oklch(0 0 0 / 0.30))` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-control-xs` | `2px` | `2px` | `0px` | `2px` | `2px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `2px` |
