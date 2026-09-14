---
handoff: gift-task-banner
title: Gift Task Banner
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/GiftTaskBanner.stories.js
variants: 3
states: 1
---

# Gift Task Banner

> CategoryBanner wrapped with the task-gated gift's step-driven action — a ToggleSwitch for the "push" step, a Button tertiary CTA pill otherwise. Grounded in OrderCompletePage's gift banner. Presentational only — the caller owns which step is active (useTaskGiftClaim.js) and reacts to update:toggle/cta-click. App.vue's own Gifts-category banner uses a near-identical pattern but adds a glow animation this component doesn't have, so it stays a one-off consumer, not migrated to this yet.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story gift-task-banner`.

## Usage Rules
- mode="toggle" renders a ToggleSwitch in the #action slot; any other mode renders a CTA pill Button.
- tone="success" tints the border + overlay for a "reward just earned" banner — omit for CategoryBanner's own default dark-scrim look.
- The CTA pill uses Button's tertiary variant with --btn-border/--btn-bg-hover/--btn-hover-filter overrides, not a bespoke button.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| CTA — install step | 0 |
| Toggle — push step | 1 |
| CTA — claim step | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-surface-ghost-3` | `oklch(1 0 0 / 0.10)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-border-tag-success` | `oklch(0.532 0.126 152)` | `oklch(0.584 0.150 137.5)` | `oklch(0.430 0.106 143.1)` | `oklch(0.419 0.133 144.3)` | `oklch(0.593 0.152 150.2)` | `oklch(0.397 0.169 142.5)` | `oklch(0.46 0.190 142.5)` | `oklch(0.523 0.149 132.1)` | `oklch(0.584 0.150 137.5)` | `oklch(0.584 0.150 137.5)` | `oklch(0.536 0.113 164.1)` | `oklch(0.494 0.130 152.5)` |
| `--x-bg-info-banner-success` | `oklch(0.205 0.030 152)` | `oklch(0.211 0.027 131.4)` | `oklch(0.140 0.026 143.1)` | `oklch(0.182 0.053 138.3)` | `oklch(0.31 0.069 151.9)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.07 132.1)` | `oklch(0.211 0.027 131.4)` | `oklch(0.211 0.027 131.4)` | `oklch(0.304 0.053 164.1)` | `oklch(0.166 0.037 152.5)` |
| `--x-border-signin-btn` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
