---
handoff: task-gift-sheet
title: Task Gift Sheet
group: Overlays
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/TaskGiftSheet.stories.js
variants: 3
states: 1
---

# Task Gift Sheet

> THE merged install/notify sheet — every install/enable-notifications touchpoint in the store opens this one component (useTaskGiftClaim.js); there is no separate standalone install sheet any more. Its body is fully driven by `step` ("install" → "push" → "claim" → "claimed") and `variant` ("ios" | "webview" | "android", from usePwaInstall.js). Android skips "install" entirely (Web Push there doesn't need it) and shows its single requirement as prose instead of a checklist; iOS/webview keep the 2-item checklist, with "install" driving a media+steps detour rendered INLINE (showStepsDetour, via BaseSheet's contentKey engine growing this one sheet) rather than opening a second sheet on top of it — stacking two sheets for one action would read as a glitch. Opened from both the Gifts-category GiftSkuCard and the Order Complete banner — both read the same shared singleton, so progress made on either surface shows here.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story task-gift-sheet`.

## Usage Rules
- step is entirely derived from isInstalled + subscribed (usePwaInstall/useWebPush) plus the persisted claimed flag — there is no local "current step" prop to set directly.
- variant is entirely derived from device/UA (usePwaInstall's shouldOfferIos + useWebviewDetect's isWebview) — there is no local "current variant" prop to set directly; preview it via the device-frame selector (iPhone → ios) or the forceWebviewInstallSheet dev flag.
- showStepsDetour is local UI state, separate from step — closing the sheet while viewing it returns to the checklist instead of dismissing the whole sheet (onSheetClose checks it first).
- justClaimed (the one-shot success glow) is a transient flag set only the moment Claim is tapped — reopening an already-claimed sheet must never replay it.
- upsellItem is optional, same contract as ClaimGiftSheet's — its absence falls back to a plain gotIt-style CTA in the claimed view.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Step 1 — install PWA | 0 |
| Step 2 — enable push | 1 |
| Claimed — with upsell | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-motion-sys-duration-fast` | `150ms` |
| `--x-motion-sys-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-duration-slowest` | `1800ms` |
| `--x-motion-sys-duration-slow` | `350ms` |
| `--x-gap-content-loose` | `12px` |
| `--x-pad-surface-s` | `8px` |
| `--x-border-soft-2` | `oklch(0.992 0.003 286 / 0.12)` |
| `--x-gap-content-default` | `8px` |
| `--x-gradient-thumb-gloss` | `linear-gradient(135deg, oklch(0.992 0.003 286 / 0.12), oklch(0.992 0.003 286 / 0.02))` |
| `--x-border-soft` | `oklch(0.992 0.003 286 / 0.08)` |
| `--x-gap-content-tight` | `2px` |
| `--x-text-header-strong` | `oklch(1 0 0)` |
| `--x-motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-fx-ripple-color-dark` | `oklch(0 0 0 / 0.15)` |
| `--x-gap-content-narrow` | `4px` |
| `--x-surface-ghost-2` | `oklch(1 0 0 / 0.08)` |
| `--x-size-icon-l` | `24px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-size-control-m` | `40px` |
| `--x-pad-surface-l` | `16px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-bg-indicator-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-gradient-checkout-banner` | `linear-gradient(color-mix(in oklab, oklch(0.180 0.035 305) 72%, transparent), color-mix(in oklab, oklch(0.180 0.035 305) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.166 0.017 273.5) 72%, transparent), color-mix(in oklab, oklch(0.166 0.017 273.5) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.207 0.006 56.0) 72%, transparent), color-mix(in oklab, oklch(0.207 0.006 56.0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.231 0.160 264.1) 72%, transparent), color-mix(in oklab, oklch(0.231 0.160 264.1) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0 0 0) 72%, transparent), color-mix(in oklab, oklch(0 0 0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.134 0.0 0) 72%, transparent), color-mix(in oklab, oklch(0.134 0.0 0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.2 0.02 140) 72%, transparent), color-mix(in oklab, oklch(0.2 0.02 140) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.147 0.003 17.6) 72%, transparent), color-mix(in oklab, oklch(0.147 0.003 17.6) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.165 0.012 258) 72%, transparent), color-mix(in oklab, oklch(0.165 0.012 258) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.160 0.020 255) 72%, transparent), color-mix(in oklab, oklch(0.160 0.020 255) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0.163 0.033 279.3) 72%, transparent), color-mix(in oklab, oklch(0.163 0.033 279.3) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` | `linear-gradient(color-mix(in oklab, oklch(0 0 0) 72%, transparent), color-mix(in oklab, oklch(0 0 0) 72%, transparent)), radial-gradient(120% 140% at 80% 0%, oklch(0.26 0.08 290) 0%, oklch(0.18 0.006 56) 70%)` |
| `--x-text-bonus-amount` | `oklch(0.749 0.166 293)` | `oklch(0.930 0.164 101.5)` | `oklch(0.809 0.085 75.1)` | `oklch(0.975 0.149 108.9)` | `oklch(0.861 0.202 153.1)` | `oklch(0.642 0.183 142.5)` | `oklch(0.77 0.16 142.5)` | `oklch(0.74 0.131 133.1)` | `oklch(0.780 0.180 50)` | `oklch(0.890 0.155 96)` | `oklch(0.902 0.098 88.3)` | `oklch(0.934 0.185 128.9)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
| `--x-text-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-bg-card-default` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-bg-action-primary` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-on-primary` | `oklch(0.905 0.195 116)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.494 0.283 269.5)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
