---
handoff: sign-in-sheet
title: Sign In Sheet
group: Overlays
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/SignInSheet.stories.js
variants: 2
states: 1
---

# Sign In Sheet

> "SIGN IN TO PURCHASE" bottom sheet (Figma 4863:14324), opened from the navbar SIGN IN button via useAuth().openSignInSheet(). Rendered with NO dimming scrim — the page behind stays visible and interactive; BaseSheet falls back to a document-level outside-tap listener for dismissal instead. activeFlows is device-split for eFootball (desktop: mykonami only; mobile: mykonami + efootball) and a single-item array derived from config.signIn.flow for every legacy (COD:M/FCM/single-flow) store. Guest checkout is config-gated (config.checkout.allowGuest) and closes the sheet then scrolls to + focuses the Player Account section.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story sign-in-sheet`.

## Usage Rules
- scrim=false and ariaModal=false — this sheet never blocks interaction with the page behind it, unlike every other sheet in this group.
- The guest-checkout button + "or" separator render only when config.checkout.allowGuest is true.
- Each sign-in flow button's CTA copy comes from strings.signIn[flow].cta for a multi-flow store, or strings.signIn.cta for a single-flow store — never hardcoded.
- Picking any flow calls closeSignInSheet() before handing off to that flow's own overlay/loader (startSignIn/startEaSignIn/startKonamiSignIn) — the sheet never stays open underneath.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default (single flow + guest) | 0 |
| Responsive (desktop modal) | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-size-icon-m` | `20px` |
| `--x-pad-surface-xs` | `4px` |
| `--x-gap-content-default` | `8px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-btn-activate` | `250ms cubic-bezier(0, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
| `--x-text-on-primary` | `oklch(0.905 0.195 116)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.494 0.283 269.5)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
