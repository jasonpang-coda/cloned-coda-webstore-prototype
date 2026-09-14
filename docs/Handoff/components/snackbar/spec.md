---
handoff: snackbar
title: Snackbar
group: Atoms
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/Snackbar.stories.js
variants: 3
states: 1
---

# Snackbar

> The success toast shown on sign-in (Figma node 4863:15067), mounted once in DeviceFrame's #overlay slot and driven entirely by useAuth()'s shared `snackbarVisible` / `snackbarContent` singleton — never a prop. It bounces up from below the screen on entrance and auto-dismisses after 5s (the timer lives in the composable), or earlier via its own close button. Content is reused for other success confirmations too (e.g. the gift-claim flow).

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story snackbar`.

## Usage Rules
- Never gate this on a prop — it always reads the shared snackbarVisible/snackbarContent singleton, driven by useAuth's showSnackbar()/dismissSnackbar().
- isMobile controls only positioning: true (default) pins it absolute to the device screen bottom (framed); false pins it fixed to the viewport bottom (responsive/desktop, no device frame).
- Only one snackbar is ever shown at a time — a new showSnackbar() call replaces the current content and resets the auto-dismiss timer.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Visible (framed) | 0 |
| Visible (responsive) | 1 |
| Dismissed | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-s` | `8px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-motion-snackbar-enter` | `350ms cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--x-motion-snackbar-exit` | `250ms cubic-bezier(0.4, 0, 1, 1)` |
| `--x-motion-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-bg-snackbar-success` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.532 0.126 152) 16%, transparent) 0%, color-mix(in oklab, oklch(0.205 0.030 152) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.584 0.150 137.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.211 0.027 131.4) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.430 0.106 143.1) 16%, transparent) 0%, color-mix(in oklab, oklch(0.140 0.026 143.1) 16%, transparent) 100%)` | `linear-gradient( oklch(0.419 0.133 144.3 / 0.60), oklch(0.419 0.133 144.3 / 0.60) )` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.651 0.178 149.8) 16%, transparent) 0%, color-mix(in oklab, oklch(0.334 0.083 152.3) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.397 0.169 142.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.165 0.079 142.5) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.46 0.190 142.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.212 0.109 142.5) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.523 0.149 132.1) 16%, transparent) 0%, color-mix(in oklab, oklch(0.19 0.07 132.1) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.584 0.150 137.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.211 0.027 131.4) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.584 0.150 137.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.211 0.027 131.4) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.536 0.113 164.1) 16%, transparent) 0%, color-mix(in oklab, oklch(0.304 0.053 164.1) 16%, transparent) 100%)` | `linear-gradient(to bottom, color-mix(in oklab, oklch(0.494 0.130 152.5) 16%, transparent) 0%, color-mix(in oklab, oklch(0.166 0.037 152.5) 16%, transparent) 100%)` |
| `--x-blur-container` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `16px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `8px` | _(resolve live)_ | _(resolve live)_ |
| `--x-text-success-inverse` | `oklch(0.978 0.019 152)` | `oklch(0.987 0.026 133.0)` | `oklch(0.957 0.018 143.1)` | `oklch(0.968 0.057 141.3)` | `oklch(0.945 0.038 157.4)` | `oklch(0.846 0.039 142.5)` | `oklch(0.94 0.03 142.5)` | `oklch(0.975 0.035 132.1)` | `oklch(0.987 0.026 133.0)` | `oklch(0.987 0.026 133.0)` | `oklch(0.983 0.024 164.1)` | `oklch(0.992 0.011 152.5)` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
