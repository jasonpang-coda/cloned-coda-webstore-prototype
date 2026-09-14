---
handoff: player-card
title: Player Card
group: Cards
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/PlayerCard.stories.js
variants: 3
states: 1
---

# Player Card

> Reusable player-identity card (L1 ghost surface, hairline border) used wherever a player's account info needs to be shown: AccountPopover (signed-in state, `full` variant) and PlayerAccount's guest-lookup "found" state. `nickname-only` is FCM's reduced mode — EA's public-facing profile API only surfaces the display name, so avatar, masked ID and stats are hidden and a small category label can appear above the name instead. Not interactive itself.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story player-card`.

## Usage Rules
- name is required; every other prop is optional with a demo-data default.
- avatarSrc only renders when variant is not nickname-only — nickname-only never shows an avatar.
- label (the small category caption) only appears in nickname-only mode, and only when set.
- showRank: false hides the MP Rank stat in full mode; level always shows.
- The `link` slot is empty for every existing consumer (AccountPopover) — used by PlayerAccount for a trailing PWA-install hyperlink.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Full (default) | 0 |
| Full, no rank | 1 |
| Nickname only (FCM) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-s` | `8px` |
| `--x-border-soft` | `oklch(0.992 0.003 286 / 0.08)` |
| `--x-size-img-l` | `48px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-gap-content-tight` | `2px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-sku-card-default` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.187 0.035 33.9), oklch(0.187 0.035 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.134 0.0 0)` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.85 0.08 80 / 0.06) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.992 0.003 258 / 0.04) 0%, transparent 100% )` | `linear-gradient(to bottom, oklch(0 0 0 / 0.64) 24.519%, oklch(0 0 0))` | `oklch(0.163 0.033 279.3)` | `oklch(0.145 0 0)` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
