---
handoff: compact-hero
title: Compact Hero
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/CompactHero.stories.js
variants: 2
states: 1
---

# Compact Hero

> Compact left-rail game-identity tile for the two-column split page layout (config.page.layout === "split", e.g. Codashop): a square thumbnail, the game title, and an optional delivery InfoTag chip. Only renders when the store provides config.identity — every store other than Codashop omits that key, so this mounts nowhere else. Vertical rhythm comes from the caller's standard `.section` wrapper; only its own side padding is self-owned.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story compact-hero`.

## Usage Rules
- image and title are required; deliveryLabel is optional and hides the InfoTag chip entirely when omitted.
- Never test config.identity from inside another component — this only mounts where the store config supplies it.
- Do not confuse with StepGamerId (the Gamer ID input form) or HeroSkuCard (a SKU-card ring-effect variant) — this is identity-tile only, no interaction.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default (with delivery badge) | 0 |
| No delivery badge | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-tight` | `2px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-inverse` | `oklch(0.311 0.029 305)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.304 0.211 264.1)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
