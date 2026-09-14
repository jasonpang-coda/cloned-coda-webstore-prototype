---
handoff: sku-tag
title: SKU Tag
group: Atoms
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/SkuTag.stories.js
variants: 3
states: 1
---

# SKU Tag

> The shared pill badge used across SKU / Bundle / Gift cards. Provides consistent display, padding, radius and per-variant colours; positioning is the consumer's responsibility (absolute on BundleItem / GiftSkuCard, in flow on SkuCard). The inner label is condensed via an inner span so the badge background is never scaled.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story sku-tag`.

## Usage Rules
- label is required.
- variant "bonus" and "value" share the bonus colours; "success" is the green FREE GIFT pill.
- Do not scale the pill itself for Hitmarker condense — condense the inner text span.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Bonus | 0 |
| Value | 1 |
| Success | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-xxs` | `2px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-tag-bonus` | `oklch(0.205 0.039 293)` | `oklch(0.217 0.027 98.3)` | `oklch(0.140 0.017 75.1)` | `oklch(0.380 0.092 56.8)` | `oklch(0.334 0.083 152.3)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.057 133.1)` | `oklch(0.205 0.045 45)` | `oklch(0.240 0.070 264)` | `oklch(0.425 0.042 88.3)` | `oklch(0.166 0.045 128.9)` |
| `--x-text-tag-bonus` | `oklch(0.978 0.024 293)` | `oklch(0.989 0.022 98.6)` | `oklch(0.965 0.011 75.1)` | `oklch(0.993 0.034 107.0)` | `oklch(0.952 0.049 159.9)` | `oklch(0.846 0.039 142.5)` | `oklch(0.94 0.03 142.5)` | `oklch(0.975 0.028 133.1)` | `oklch(0.975 0.028 60)` | `oklch(0.890 0.155 96)` | `oklch(0.980 0.018 88.3)` | `oklch(0.997 0.014 128.9)` |
| `--x-bg-tag-success` | `oklch(0.205 0.030 152)` | `oklch(0.211 0.027 131.4)` | `oklch(0.140 0.026 143.1)` | `oklch(0.182 0.053 138.3)` | `oklch(0.31 0.069 151.9)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.07 132.1)` | `oklch(0.211 0.027 131.4)` | `oklch(0.211 0.027 131.4)` | `oklch(0.304 0.053 164.1)` | `oklch(0.166 0.037 152.5)` |
| `--x-text-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
