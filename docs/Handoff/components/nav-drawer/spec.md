---
handoff: nav-drawer
title: Nav Drawer
group: Navigation
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/NavDrawer.stories.js
variants: 3
states: 3
---

# Nav Drawer

> Left slide-in menu opened from the NavBar burger, mounted into DeviceFrame's #overlay slot. Nav content is store-driven: COD:M/FCM both render an expandable "Store" group (L1) with category children (L2) plus a flat "Code Redemption" row, sourced from strings.nav.groups/items via useStoreStrings. When the `intents` prop is supplied (non-null, non-empty — the multi-level nav pilot), the drawer instead builds one group per intent from useStoreIntents' category tree, with an L3 subcategory tier for any category that has more than one subcategory — the drawer never owns this data itself. Also hosts the PWA install / Web Push opt-in rows and the region/language switcher footer (gated on the localeSwitcher feature flag), both singleton-composable driven.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story nav-drawer`.

## Usage Rules
- The drawer renders nothing while `open` is false — Transition unmounts the whole tree, so it never occupies layout space closed.
- Pass `duration` is baked into the component's own Transition; the parent only toggles `open` and listens for "close"/"navigate".
- L3 (subcategory) rows only render for a category with more than one subcategory — matches CatalogNavStack's own L3 gate so the two surfaces never disagree.
- Never branch on theme identity — nav structure comes entirely from strings/intents props, never a hardcoded store check.
- Emits "navigate" with the tapped anchor only after the exit transition settles (or immediately if prefers-reduced-motion is set) — the parent should not scroll before that.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Open | 0 |
| Open — multi-level intents (L1/L2/L3) | 1 |
| Closed | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-shadow-drawer` | `6px 0 32px oklch(0.12 0.01 273 / 0.55)` |
| `--x-pad-surface-m` | `12px` |
| `--x-pad-surface-s` | `8px` |
| `--x-gap-content-default` | `8px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-btn-activate` | `250ms cubic-bezier(0, 0, 0.2, 1)` |
| `--x-text-header-strong` | `oklch(1 0 0)` |
| `--x-pad-surface-l` | `16px` |
| `--x-pad-surface-xs` | `4px` |
| `--x-motion-sys-duration-slowest` | `1800ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-pad-surface-xl` | `24px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-surface-ghost-2` | `oklch(1 0 0 / 0.08)` |
| `--x-surface-ghost-3` | `oklch(1 0 0 / 0.10)` |
| `--x-size-icon-s` | `16px` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-modal-enter` | `350ms cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-modal-exit` | `200ms cubic-bezier(0.4, 0, 1, 1)` |
| `--x-size-icon-l` | `24px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-scrim` | `color-mix(in oklab, oklch(0.180 0.035 305) 60%, transparent)` | `color-mix(in oklab, oklch(0.166 0.017 273.5) 60%, transparent)` | `color-mix(in oklab, oklch(0.207 0.006 56.0) 60%, transparent)` | `color-mix(in oklab, oklch(0.231 0.160 264.1) 60%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 60%, transparent)` | `color-mix(in oklab, oklch(0.134 0.0 0) 60%, transparent)` | `color-mix(in oklab, oklch(0.2 0.02 140) 60%, transparent)` | `color-mix(in oklab, oklch(0.147 0.003 17.6) 60%, transparent)` | `color-mix(in oklab, oklch(0.165 0.012 258) 60%, transparent)` | `color-mix(in oklab, oklch(0.160 0.020 255) 60%, transparent)` | `color-mix(in oklab, oklch(0.163 0.033 279.3) 60%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 60%, transparent)` |
| `--x-bg-page` | `oklch(0.180 0.035 305)` | `oklch(0.166 0.017 273.5)` | `oklch(0.207 0.006 56.0)` | `oklch(0.231 0.160 264.1)` | `oklch(0 0 0)` | `oklch(0.134 0.0 0)` | `oklch(0.2 0.02 140)` | `oklch(0.147 0.003 17.6)` | `oklch(0.165 0.012 258)` | `oklch(0.160 0.020 255)` | `oklch(0.163 0.033 279.3)` | `oklch(0 0 0)` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-bg-indicator-neutral-subtle` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-bg-indicator-neutral-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-bg-indicator-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
| `--x-border-signin-btn` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.910 0.246 128.9)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
