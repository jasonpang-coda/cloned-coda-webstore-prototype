---
handoff: download-banner
title: Download Banner
group: Components
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/DownloadBanner.stories.js
variants: 3
states: 3
---

# Download Banner

> Extracted from App.vue's inline download-banner section (strings.page.download). Not installed: shows the PWA install upsell row (strings.page.pwaInstall), emitting `pwa-cta-click` for the parent to open TaskGiftSheet. Installed: swaps to the Web Push upsell row (strings.page.webPush), emitting `webpush-cta-click`. Store badges render inside the banner by default; set `hideBadges` when a store places them above the value-prop grid instead (see App.vue's config.content.badgesAboveValueProps, rendered via the sibling <StoreBadges> component in that case).

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story download-banner`.

## Usage Rules
- heading is required; body/bgImage/badges/pwa/webPush rows are all optional.
- Only one of the PWA-install row or the Web-Push row shows at a time, gated on pwaInstalled.
- hideBadges suppresses the in-banner <StoreBadges> — the parent is responsible for rendering them elsewhere in that case.
- Parent owns the CTA side effects (TaskGiftSheet / Web Push toggle) via the pwa-cta-click / webpush-cta-click emits.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default (PWA install upsell) | 0 |
| Installed (Web Push upsell) | 1 |
| Badges hidden (badgesAboveValueProps stores) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-xl` | `24px` |
| `--x-pad-surface-l` | `16px` |
| `--x-gap-content-default` | `8px` |
| `--x-gap-content-tight` | `2px` |
| `--x-gap-content-separation` | `16px` |
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-gap-control-m` | `8px` |
| `--x-size-control-m` | `40px` |
| `--x-fx-ripple-color-dark` | `oklch(0 0 0 / 0.15)` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-l` | `16px` | `12px` | `0px` | `12px` | `12px` | `0px` | `12px` | `0px` | `12px` | `12px` | `0px` | `12px` |
| `--x-download-banner-border` | _(resolve live)_ | `1px solid oklch(0.310 0.011 271.0)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `1px solid oklch(0.290 0 0)` |
| `--x-gradient-download-banner-scrim` | `linear-gradient(0deg, oklch(0.180 0.035 305) 0%, color-mix(in oklab, oklch(0.180 0.035 305) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0.166 0.017 273.5) 0%, color-mix(in oklab, oklch(0.166 0.017 273.5) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0.207 0.006 56.0) 0%, color-mix(in oklab, oklch(0.207 0.006 56.0) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0.231 0.160 264.1) 0%, color-mix(in oklab, oklch(0.231 0.160 264.1) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0 0 0) 0%, color-mix(in oklab, oklch(0 0 0) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0.134 0.0 0) 0%, color-mix(in oklab, oklch(0.134 0.0 0) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0.2 0.02 140) 0%, color-mix(in oklab, oklch(0.2 0.02 140) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0.147 0.003 17.6) 0%, color-mix(in oklab, oklch(0.147 0.003 17.6) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0.165 0.012 258) 0%, color-mix(in oklab, oklch(0.165 0.012 258) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0.160 0.020 255) 0%, color-mix(in oklab, oklch(0.160 0.020 255) 70%, transparent) 100%)` | `linear-gradient(0deg, oklch(0.163 0.033 279.3) 0%, color-mix(in oklab, oklch(0.163 0.033 279.3) 70%, transparent) 100%)` | `linear-gradient( 0deg, color-mix(in oklab, oklch(0 0 0) 55%, transparent) 0%, color-mix(in oklab, oklch(0 0 0) 25%, transparent) 100% )` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-bg-action-primary` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-on-primary` | `oklch(0.905 0.195 116)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.494 0.283 269.5)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
