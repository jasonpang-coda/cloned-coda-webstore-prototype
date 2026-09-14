---
handoff: info-step-footer
title: Info Step Footer
group: Steps
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/InfoStepFooter.stories.js
variants: 4
states: 3
---

# Info Step Footer

> Presentational port of the "ITEM SUMMARY" step's pinned footer. Branches on `data.footer`: the default (non-FCM) layout shows a full-width BUY button (signed in) or a sign-in-with-account / "OR" / sign-in-with-Player-ID pair (signed out); `data.footer === 'buyNow'` (FCM Buy Now) instead shows a price + pill-CTA row plus an optional reward-points line below. Sibling to InfoStepBody — see that file for why the step is split into a body + footer component pair.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story info-step-footer`.

## Usage Rules
- `data` and `primaryAction` are both required — `primaryAction.label` drives the buy/buy-now CTA text.
- `data.footer === 'buyNow'` switches the whole footer shape (price+pill row) — every other value renders the default full-width-button layout.
- `data.canBuy` toggles buy vs sign-in controls independently of the footer shape.
- The buyNow layout's reward-points line only renders when `data.rewardsLabel` is set.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default (signed in) | 0 |
| Default (signed out) | 1 |
| FCM Buy Now (signed in, with rewards) | 2 |
| FCM Buy Now (signed out) | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-fx-ripple-color-dark` | `oklch(0 0 0 / 0.15)` |
| `--x-size-icon-s` | `16px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-size-icon-xs` | `12px` |
| `--x-text-header-strong` | `oklch(1 0 0)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-final-price` | `oklch(0.878 0.091 340)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-bg-action-primary` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
