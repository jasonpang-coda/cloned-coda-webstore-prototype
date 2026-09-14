---
handoff: page-sign-in-section
title: Page Sign In Section
group: SignIn
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/PageSignInSection.stories.js
variants: 2
states: 3
---

# Page Sign In Section

> Page-level sign-in prompt / player profile card, mounted directly on the page (not an overlay) — see App.vue. Signed-out renders an L1 card with prompt copy + one button per config.signIn active flow (mirrors SignInSheet's activeFlows logic); signed-in renders PlayerCard instead. Multi-flow stores (eFootball) render every active flow inline rather than a single "open sheet" button.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story page-sign-in-section`.

## Usage Rules
- Enforce @container query layouts (never @media).
- Use semantic tokens for colors and spacing.
- activeFlows is device-split (isMobile) for multi-flow stores — same derivation as SignInSheet.
- Signed-in state swaps the whole card for PlayerCard; it never renders alongside the prompt.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default (signed out) | 0 |
| Signed In | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-loose` | `12px` |
| `--x-pad-surface-l` | `16px` |
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-default` | `8px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-btn-activate` | `250ms cubic-bezier(0, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-bg-sku-card-default` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.187 0.035 33.9), oklch(0.187 0.035 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.134 0.0 0)` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.85 0.08 80 / 0.06) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.992 0.003 258 / 0.04) 0%, transparent 100% )` | `linear-gradient(to bottom, oklch(0 0 0 / 0.64) 24.519%, oklch(0 0 0))` | `oklch(0.163 0.033 279.3)` | `oklch(0.145 0 0)` |
| `--x-blur-container` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `16px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `8px` | _(resolve live)_ | _(resolve live)_ |
| `--x-border-sku-card-default` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.10)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.22)` | `linear-gradient( 160deg, oklch(0.99 0.004 247 / 0.04) 0%, oklch(0.99 0.004 247 / 0.22) 45%, oklch(0.99 0.004 247 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.8 0.07 80 / 0.10) 0%, oklch(0.8 0.07 80 / 0.32) 45%, oklch(0.82 0.08 80 / 0.62) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 258 / 0.04) 0%, oklch(0.99 0.004 258 / 0.22) 45%, oklch(0.99 0.004 258 / 0.58) 100% )` | `linear-gradient( 160deg, oklch(0.99 0.004 255 / 0.05) 0%, oklch(0.99 0.004 255 / 0.24) 45%, oklch(0.99 0.004 255 / 0.60) 100% )` | `oklch(0.843 0.106 88.3 / 0.22)` | `oklch(0.290 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-bg-action-signin` | _(resolve live)_ | `oklch(0 0 0)` | _(resolve live)_ | `oklch(0.968 0.211 109.8)` | `oklch(0.62 0.22 27)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `oklch(0 0 0)` | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | _(resolve live)_ |
| `--x-text-on-primary` | `oklch(0.905 0.195 116)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.494 0.283 269.5)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-bg-action-mykonami` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `linear-gradient(180deg, oklch(0.506 0.207 26), oklch(0.428 0.175 25))` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | `linear-gradient(180deg, oklch(0.460 0.195 27), oklch(0.400 0.165 27))` | _(resolve live)_ |
| `--x-hm-scale` | `1` | `0.82` | `1` | `1` | `1` | `1` | `1` | `1` | `1` | `1` | `1` | `1` |
| `--x-text-hyperlink-inverse` | `oklch(0.620 0.245 293)` | `oklch(0.923 0.004 286.3)` | `oklch(0.402 0.118 33.9)` | `oklch(0.958 0.013 286.1)` | `oklch(0.99 0.007 106.5)` | `oklch(0.514 0.175 142.5)` | `oklch(0.85 0.17 95)` | `oklch(0.759 0.084 73.8)` | `oklch(0.923 0.003 258)` | `oklch(0.890 0.155 96)` | `oklch(0.843 0.106 88.3)` | `oklch(0.970 0 0)` |
