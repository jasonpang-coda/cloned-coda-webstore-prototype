---
handoff: home-steps
title: Home Steps
group: Home
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/HomeSteps.stories.js
variants: 2
states: 3
---

# Home Steps

> "How it works" step list on the Codashop aggregator homepage (HomeStandard/HomeVisual). Each card washes a different hue across the 1-2-3 sequence via nth-child (--x-wash-home-step-1/2/3, --x-home-step-ink-2/3) — a 4th+ step repeats the 3rd card's wash/ink, same index-based limitation as HomePromoTiles' alternation.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story home-steps`.

## Usage Rules
- Enforce @container query layouts (never @media).
- Use semantic tokens for colors and spacing.
- icon is optional per-step — omitting it falls back to a numbered badge (i + 1) instead of the masked icon glyph.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default (with icons) | 0 |
| Numbered (no icons) | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-home-surface-bg` | _(resolve live)_ |
| `--x-home-surface-border` | _(resolve live)_ |
| `--x-shadow-card` | `0 4px 4px oklch(0 0 0 / 0.25)` |
| `--x-home-surface-blur` | _(resolve live)_ |
| `--x-size-icon-xl` | `32px` |
| `--x-size-control-m` | `40px` |
| `--x-home-surface-text` | _(resolve live)_ |
| `--x-home-surface-text-sub` | _(resolve live)_ |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-wash-home-step-1` | `linear-gradient(color-mix(in oklch, oklch(0.749 0.166 293) 28%, transparent), color-mix(in oklch, oklch(0.749 0.166 293) 28%, transparent))` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-wash-home-step-2` | `linear-gradient(color-mix(in oklch, oklch(0.620 0.245 293) 36%, transparent), color-mix(in oklch, oklch(0.620 0.245 293) 36%, transparent))` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-wash-home-step-3` | `linear-gradient(color-mix(in oklch, oklch(0.537 0.204 293) 45%, transparent), color-mix(in oklch, oklch(0.537 0.204 293) 45%, transparent))` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-home-step-ink-2` | `oklch(0.620 0.245 293)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-home-step-ink-3` | `oklch(0.537 0.204 293)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-bg-indicator-brand-subtle` | `oklch(0.454 0.163 293)` | `oklch(0.606 0.119 100.6)` | `oklch(0.517 0.068 75.1)` | `oklch(0.503 0.126 54.2)` | `oklch(0.651 0.178 149.8)` | `oklch(0.397 0.169 142.5)` | `oklch(0.46 0.190 142.5)` | `oklch(0.458 0.121 133.1)` | `oklch(0.520 0.150 47)` | `oklch(0.460 0.180 264)` | `oklch(0.657 0.090 88.3)` | `oklch(0.614 0.166 128.9)` |
| `--x-bg-indicator-brand-default` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
