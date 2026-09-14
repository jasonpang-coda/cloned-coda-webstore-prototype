---
handoff: sign-in-loader
title: Sign In Loader
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/SignInLoader.stories.js
variants: 2
states: 1
---

# Sign In Loader

> Full-screen sign-in overlay shown while the simulated COD:M sign-in is in flight, mounted in DeviceFrame's #overlay slot. Reads `signingIn` off the shared useAuth() singleton (also read by NavBar, NavDrawer and Snackbar) rather than a prop — so it appears automatically whenever anything calls startSignIn(), and "Cancel Sign In" calls cancelSignIn() to abort. isMobile is device-driven in App.vue (device !== 'none'), not user-chosen: it swaps the whole content block between an "Opening COD:M app…" indeterminate-bar loader (Figma 4990:12116) and a QR-code sign-in panel (Figma 5031:15622). The blurred scrim captures pointer events so the screen underneath is inert while it is open.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story sign-in-loader`.

## Usage Rules
- Visibility is NOT prop-driven — it only renders while useAuth().signingIn is true; the story forces this open directly since startSignIn() would also arm a 5s auto-dismiss timer.
- isMobile switches between the two entirely different content blocks (app-opening loader vs QR code) — there is no combined or partial state.
- .loader--desktop switches position:fixed (full viewport) instead of position:absolute (bounded to the device screen box) — required because the responsive layout has no transformed ancestor to bound against.
- Cancel always calls cancelSignIn(), never a local handler — it clears the shared signInTimer so a cancelled flow cannot still flip signedIn later.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Mobile (opening app) | 0 |
| Desktop / responsive (QR sign-in) | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-xl` | `24px` |
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-default` | `8px` |
| `--x-motion-sys-ease-linear` | `linear` |
| `--x-pad-surface-xs` | `4px` |
| `--x-pad-surface-s` | `8px` |
| `--x-border-soft-2` | `oklch(0.992 0.003 286 / 0.12)` |
| `--x-motion-modal-enter` | `350ms cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-modal-exit` | `200ms cubic-bezier(0.4, 0, 1, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-scrim` | `color-mix(in oklab, oklch(0.180 0.035 305) 60%, transparent)` | `color-mix(in oklab, oklch(0.166 0.017 273.5) 60%, transparent)` | `color-mix(in oklab, oklch(0.207 0.006 56.0) 60%, transparent)` | `color-mix(in oklab, oklch(0.231 0.160 264.1) 60%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 60%, transparent)` | `color-mix(in oklab, oklch(0.134 0.0 0) 60%, transparent)` | `color-mix(in oklab, oklch(0.2 0.02 140) 60%, transparent)` | `color-mix(in oklab, oklch(0.147 0.003 17.6) 60%, transparent)` | `color-mix(in oklab, oklch(0.165 0.012 258) 60%, transparent)` | `color-mix(in oklab, oklch(0.160 0.020 255) 60%, transparent)` | `color-mix(in oklab, oklch(0.163 0.033 279.3) 60%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 60%, transparent)` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-bg-indicator-neutral-subtle` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-bg-action-primary` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-bg-page` | `oklch(0.180 0.035 305)` | `oklch(0.166 0.017 273.5)` | `oklch(0.207 0.006 56.0)` | `oklch(0.231 0.160 264.1)` | `oklch(0 0 0)` | `oklch(0.134 0.0 0)` | `oklch(0.2 0.02 140)` | `oklch(0.147 0.003 17.6)` | `oklch(0.165 0.012 258)` | `oklch(0.160 0.020 255)` | `oklch(0.163 0.033 279.3)` | `oklch(0 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-radius-control-xs` | `2px` | `2px` | `0px` | `2px` | `2px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `2px` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
