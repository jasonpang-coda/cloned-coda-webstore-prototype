---
handoff: button
title: Button
group: Primitives
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/Button.stories.js
variants: 17
states: 3
---

# Button

> Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story button`.

## Usage Rules
- Enforce @container query layouts (never @media).
- Use semantic tokens for colors and spacing.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Primary | 0 |
| Secondary | 1 |
| Tertiary | 2 |
| Link | 3 |
| Icon only | 4 |
| Leading icon | 5 |
| Trailing icon | 6 |
| Full width | 7 |
| Loading | 8 |
| Disabled | 9 |
| Small size | 10 |
| Large size | 11 |
| Shimmer (hero CTA) | 12 |
| Brand override (sign-in) | 13 |
| As link | 14 |
| Chip (inactive) | 15 |
| Chip (active) | 16 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-tight` | `2px` |
| `--x-motion-btn-activate` | `250ms cubic-bezier(0, 0, 0.2, 1)` |
| `--x-size-control-xs` | `24px` |
| `--x-pad-surface-m` | `12px` |
| `--x-size-control-s` | `32px` |
| `--x-pad-surface-l` | `16px` |
| `--x-size-control-m` | `40px` |
| `--x-pad-surface-xl` | `24px` |
| `--x-size-icon-s` | `16px` |
| `--x-size-icon-l` | `24px` |
| `--x-size-icon-xl` | `32px` |
| `--x-size-control-xxl` | `72px` |
| `--x-pad-surface-s` | `8px` |
| `--x-bg-tag-inverse` | `oklch(1 0 0 / 0.10)` |
| `--x-bg-action-tertiary` | `oklch(1 0 0 / 0.10)` |
| `--x-border-action-tertiary` | `oklch(1 0 0 / 0.20)` |
| `--x-bg-action-tertiary-hover` | `color-mix(in oklab, oklch(1 0 0 / 0.10) 90%, #000)` |
| `--x-bg-action-tertiary-pressed` | `color-mix(in oklab, oklch(1 0 0 / 0.10) 80%, #000)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-bg-action-signin` | _(resolve live)_ | `oklch(0 0 0)` | _(resolve live)_ | `oklch(0.968 0.211 109.8)` | `oklch(0.62 0.22 27)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `oklch(0 0 0)` | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | _(resolve live)_ |
| `--x-bg-action-mykonami` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `linear-gradient(180deg, oklch(0.506 0.207 26), oklch(0.428 0.175 25))` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | _(resolve live)_ |
| `--x-bg-action-secondary` | `oklch(0.205 0.039 293)` | `oklch(0.217 0.027 98.3)` | `oklch(0.140 0.017 75.1)` | `oklch(0.380 0.092 56.8)` | `oklch(0.334 0.083 152.3)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.057 133.1)` | `oklch(0.205 0.045 45)` | `oklch(0.240 0.070 264)` | `oklch(0.425 0.042 88.3)` | `oklch(0.166 0.045 128.9)` |
| `--x-text-on-action-secondary` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-bg-action-secondary-hover` | `color-mix(in oklab, oklch(0.205 0.039 293) 90%, #000)` | `color-mix(in oklab, oklch(0.217 0.027 98.3) 90%, #000)` | `color-mix(in oklab, oklch(0.140 0.017 75.1) 90%, #000)` | `color-mix(in oklab, oklch(0.380 0.092 56.8) 90%, #000)` | `color-mix(in oklab, oklch(0.334 0.083 152.3) 90%, #000)` | `color-mix(in oklab, oklch(0.165 0.079 142.5) 90%, #000)` | `color-mix(in oklab, oklch(0.212 0.109 142.5) 90%, #000)` | `color-mix(in oklab, oklch(0.19 0.057 133.1) 90%, #000)` | `color-mix(in oklab, oklch(0.205 0.045 45) 90%, #000)` | `color-mix(in oklab, oklch(0.240 0.070 264) 90%, #000)` | `color-mix(in oklab, oklch(0.425 0.042 88.3) 90%, #000)` | `color-mix(in oklab, oklch(0.166 0.045 128.9) 90%, #000)` |
| `--x-bg-action-secondary-pressed` | `color-mix(in oklab, oklch(0.205 0.039 293) 80%, #000)` | `color-mix(in oklab, oklch(0.217 0.027 98.3) 80%, #000)` | `color-mix(in oklab, oklch(0.140 0.017 75.1) 80%, #000)` | `color-mix(in oklab, oklch(0.380 0.092 56.8) 80%, #000)` | `color-mix(in oklab, oklch(0.334 0.083 152.3) 80%, #000)` | `color-mix(in oklab, oklch(0.165 0.079 142.5) 80%, #000)` | `color-mix(in oklab, oklch(0.212 0.109 142.5) 80%, #000)` | `color-mix(in oklab, oklch(0.19 0.057 133.1) 80%, #000)` | `color-mix(in oklab, oklch(0.205 0.045 45) 80%, #000)` | `color-mix(in oklab, oklch(0.240 0.070 264) 80%, #000)` | `color-mix(in oklab, oklch(0.425 0.042 88.3) 80%, #000)` | `color-mix(in oklab, oklch(0.166 0.045 128.9) 80%, #000)` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-border-card-hover` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-text-on-primary` | `oklch(0.905 0.195 116)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.494 0.283 269.5)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-text-on-action-tertiary` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
