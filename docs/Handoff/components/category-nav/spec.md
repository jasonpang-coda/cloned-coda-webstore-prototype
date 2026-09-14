---
handoff: category-nav
title: Category Nav
group: Navigation
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/CategoryNav.stories.js
variants: 3
states: 3
---

# Category Nav

> A frosted, self-contained horizontally-scrolling tab bar (Figma "L3 Nav" 5100:19182) used in three shapes across the app: a fixed bar pinned to the bottom of the screen (`variant="bottom"`, the classic L2 category bar), one pinned below NavBar (`variant="top"`, the legacy L3 subcategory bar), and a plain in-flow row with no own surface (`variant="row"`) — the shape CatalogNavStack stacks two of, inside its own single frosted container. It resolves its own scroll container (`.device__screen` when framed, else the window) and runs either a scroll-spy (`mode="scroll"` — tap scrolls to a section id, an IntersectionObserver tracks the active tab as the user scrolls) or a fully parent-controlled active tab (`mode="filter"` — tap just emits `update:active`, no on-page anchors assumed). Edge fades appear whenever tabs overflow the visible width in that direction.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story category-nav`.

## Usage Rules
- `mode` must never be chosen by store identity — "scroll" is COD:M's single-scroll page model, "filter" is FCM's category hide/show model.
- In `mode="filter"` the `active` prop is the source of truth; in `mode="scroll"` it is ignored and the internal scroll-spy owns the active tab.
- `level` ("l2"/"l3") is a styling hint only, meaningful for `variant="row"` — it makes two stacked rows read as parent/child, no behavioural effect.
- Tab ids in `tabs` must match real on-page section element ids in scroll mode, or the scroll-spy silently observes nothing.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Bottom (L2, scroll mode) | 0 |
| Top (L3, filter mode) | 1 |
| Row (L3, CatalogNavStack tab strip) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-l` | `16px` |
| `--x-shadow-nav` | `0 309px 87px oklch(0.12 0.01 273 / 0.01), 0 198px 79px oklch(0.12 0.01 273 / 0.05), 0 111px 67px oklch(0.12 0.01 273 / 0.16), 0 49px 49px oklch(0.12 0.01 273 / 0.27), 0 12px 27px oklch(0.12 0.01 273 / 0.31)` |
| `--x-shadow-nav-inset` | `inset 0 4px 4px oklch(0.12 0.01 273 / 0.16), inset 0 2px 8px oklch(0 0 0 / 0.24)` |
| `--x-motion-nav-enter` | `350ms cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-tab-indicator` | `250ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-size-control-xl` | `64px` |
| `--x-pad-surface-m` | `12px` |
| `--x-pad-surface-s` | `8px` |
| `--x-size-control-xxl` | `72px` |
| `--x-gap-content-default` | `8px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-btn-activate` | `250ms cubic-bezier(0, 0, 0.2, 1)` |
| `--x-text-header-strong` | `oklch(1 0 0)` |
| `--x-motion-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-duration-exit` | `200ms` |
| `--x-motion-sys-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-border-nav` | `oklch(1 0 0 / 0.12)` | `oklch(1 0 0 / 0.12)` | `oklch(0.355 0.109 33.9)` | `oklch(0.95 0 0 / 0.10)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.14)` | `oklch(1 0 0 / 0.12)` | `oklch(0.8 0.06 80 / 0.18)` | `oklch(1 0 0 / 0.12)` | `oklch(1 0 0 / 0.12)` | `oklch(0.843 0.106 88.3 / 0.14)` | `oklch(0.290 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-nav` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-bg-page` | `oklch(0.180 0.035 305)` | `oklch(0.166 0.017 273.5)` | `oklch(0.207 0.006 56.0)` | `oklch(0.231 0.160 264.1)` | `oklch(0 0 0)` | `oklch(0.134 0.0 0)` | `oklch(0.2 0.02 140)` | `oklch(0.147 0.003 17.6)` | `oklch(0.165 0.012 258)` | `oklch(0.160 0.020 255)` | `oklch(0.163 0.033 279.3)` | `oklch(0 0 0)` |
| `--x-blur-container` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `16px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `8px` | _(resolve live)_ | _(resolve live)_ |
| `--x-border-sheet` | `oklch(1 0 0 / 0.16)` | `oklch(1 0 0 / 0.16)` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.12)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.18)` | `oklch(1 0 0 / 0.16)` | `oklch(0.82 0.07 80 / 0.22)` | `oklch(1 0 0 / 0.16)` | `oklch(1 0 0 / 0.16)` | `oklch(0.843 0.106 88.3 / 0.18)` | `oklch(0.290 0 0)` |
| `--x-bg-sheet` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-border-nav-selected` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `transparent` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-gradient-nav-selected-stroke` | `none` | `none` | `none` | `none` | `linear-gradient(90deg, #0F5767 0%, #E2FE00 40%, #05F167 61%, #0E5767 100%)` | `none` | `none` | `none` | `none` | `none` | `none` | `none` |
| `--x-sys-size-body-main` | `14px` | `14px` | `14px` | `16px` | `14px` | `14px` | `14px` | `14px` | `18px` | `14px` | `14px` | `14px` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-bg-indicator-neutral-subtle` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-bg-indicator-neutral-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-bg-nav-selected` | `none` | `none` | `none` | `none` | `radial-gradient(75% 117% at 50% 100%, #0D6166 0%, #0F4856 31.485%, #112F45 62.969%, #1B1C22 100%)` | `none` | `none` | `none` | `none` | `none` | `none` | `none` |
| `--x-text-nav-selected` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(1 0 0)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-gradient-scroll-fade-left` | `linear-gradient(to right, oklch(0.180 0.035 305) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0.166 0.017 273.5) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0.207 0.006 56.0) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0.231 0.160 264) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0 0 0) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0.134 0.0 0) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0.2 0.02 140) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0.147 0.003 17.6) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0.165 0.012 258) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0.160 0.020 255) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0.163 0.033 279.3) 0%, transparent 100%)` | `linear-gradient(to right, oklch(0 0 0) 0%, transparent 100%)` |
| `--x-gradient-scroll-fade-right` | `linear-gradient(to left, oklch(0.180 0.035 305) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0.166 0.017 273.5) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0.207 0.006 56.0) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0.231 0.160 264) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0 0 0) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0.134 0.0 0) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0.2 0.02 140) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0.147 0.003 17.6) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0.165 0.012 258) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0.160 0.020 255) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0.163 0.033 279.3) 0%, transparent 100%)` | `linear-gradient(to left, oklch(0 0 0) 0%, transparent 100%)` |
