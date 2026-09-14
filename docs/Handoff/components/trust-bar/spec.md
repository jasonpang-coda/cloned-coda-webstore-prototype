---
handoff: trust-bar
title: Trust Bar
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/TrustBar.stories.js
variants: 1
states: 1
---

# Trust Bar

> Four-card trust-signal row (officially partnered / trusted-by-gamers count / fast delivery / pay-your-way) sitting in the left rail under the compact hero on Codashop only — App.vue gates it on `config.trustBar` (`showTrustBar`), a key only src/stores/codashop/store.js sets, so it never mounts anywhere else. Takes no props at all: every stat, string and logo comes straight from useStoreConfig()/useStoreStrings()/useStoreAssets() inside the component itself, so the only way to see it change is switching the active store theme in the harness, not passing different props. Runs two independent self-driven timers on mount — a publisher-logo crossfade rotator (useCountUp for the animated gamer/delivery stats) and, at XS/S widths, a one-card-peek carousel with drag-to-swipe and dot nav — both respect prefers-reduced-motion and are torn down onBeforeUnmount. Uses a self-named `trust-bar` container-query context (not the app's anonymous `.device__screen` one) because it now lives inside App.vue's narrower sticky lead rail, not the full-width main column.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story trust-bar`.

## Usage Rules
- No props — content is entirely composable-driven; never thread trust-bar copy/stats through props, add them to a store's config.trustBar / strings.trustBar instead.
- Only ever renders where a store defines config.trustBar (Codashop today) — every other store must leave that key absent, not falsy, for App.vue's v-if gate to skip it.
- Layout breakpoints must stay on the named `trust-bar` container query, not the app-wide `.device__screen` one, or the rail-embedded instance breaks.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default | 0 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-motion-trust-slide` | `500ms cubic-bezier(0, 0, 0.2, 1)` |
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-pad-surface-l` | `16px` |
| `--x-sys-size-xxxl` | `128px` |
| `--x-size-control-m` | `40px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-xxs` | `2px` |
| `--x-pad-surface-s` | `8px` |
| `--x-size-icon-m` | `20px` |
| `--x-motion-trust-rotate-fade` | `350ms` |
| `--x-motion-sys-duration-fast` | `150ms` |
| `--x-gap-content-loose` | `12px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-bg-navbar` | `oklch(0.180 0.035 305)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `transparent` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0 0 0)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-border-navbar` | `oklch(0.636 0.016 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-radius-container-m` | `12px` | `12px` | `0px` | `12px` | `12px` | `0px` | `12px` | `0px` | `12px` | `12px` | `0px` | `12px` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-bg-indicator-brand-subtle` | `oklch(0.454 0.163 293)` | `oklch(0.606 0.119 100.6)` | `oklch(0.517 0.068 75.1)` | `oklch(0.503 0.126 54.2)` | `oklch(0.651 0.178 149.8)` | `oklch(0.397 0.169 142.5)` | `oklch(0.46 0.190 142.5)` | `oklch(0.458 0.121 133.1)` | `oklch(0.520 0.150 47)` | `oklch(0.460 0.180 264)` | `oklch(0.657 0.090 88.3)` | `oklch(0.614 0.166 128.9)` |
| `--x-bg-indicator-brand-default` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-header-inverse` | `oklch(0.311 0.029 305)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.304 0.211 264.1)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-text-body-inverse` | `oklch(0.311 0.029 305)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.304 0.211 264.1)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-card-default` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-bg-indicator-neutral-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-bg-indicator-selected-default` | `oklch(0.905 0.195 116)` | `oklch(0.916 0.115 196.7)` | `oklch(0.402 0.118 33.9)` | `oklch(0.646 0.261 1.8)` | `oklch(0.948 0.22 117)` | `oklch(0.876 0.099 127.5)` | `oklch(0.85 0.17 95)` | `oklch(0.759 0.084 73.8)` | `oklch(0.780 0.115 205)` | `oklch(0.460 0.195 27)` | `oklch(0.586 0.238 26.4)` | `oklch(0.686 0.107 61.9)` |
