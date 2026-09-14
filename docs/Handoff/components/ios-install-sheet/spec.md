---
handoff: ios-install-sheet
title: Ios Install Sheet
group: Overlays
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/IosInstallSheet.stories.js
variants: 2
states: 1
---

# Ios Install Sheet

> The "Add to Home Screen" instruction sheet for iOS Safari, which has no beforeinstallprompt and cannot be triggered programmatically. Opened from the download-banner PWA CTA (App.vue) once usePwaInstall's shouldOfferIos is true. A plain `open`/`isMobile` prop pair + `close` emit — unlike the other sheets in this group it is NOT wired to a singleton composable, so it can be driven directly by story props. Top half is a media demo (assets.content.iosInstallDemo, video or image, with a fixed 16:9 grey placeholder standing in when the store hasn't supplied one); bottom half is a real numbered list of steps (strings.page.pwaInstall.iosSteps) plus a single "Got it" footer CTA that just closes the sheet.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story ios-install-sheet`.

## Usage Rules
- open is required — BaseSheet renders nothing while it is false.
- The media half falls back to a fixed-aspect-ratio placeholder box (not an arbitrary height) when assets.content.iosInstallDemo is absent, so the sheet's size does not jump once a real asset is added. No store currently registers that asset, so every store renders the placeholder today — the demo media is read from useStoreAssets() directly, not a prop, so it cannot be forced on/off from a story variant.
- isVideoDemo is derived from the asset URL extension (.webm/.mp4) — swapping the media type just means swapping the asset string, no separate prop.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default (mobile sheet) | 0 |
| Responsive (desktop modal) | 1 |

## Token Contract (Resolved per Store)

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-gap-content-loose` | `12px` | `12px` | `12px` | `12px` | `12px` | `12px` | `12px` | `12px` | `12px` | `12px` | `12px` | `12px` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-bg-card-default` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-gap-content-narrow` | `4px` | `4px` | `4px` | `4px` | `4px` | `4px` | `4px` | `4px` | `4px` | `4px` | `4px` | `4px` |
| `--x-surface-ghost-2` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` | `oklch(1 0 0 / 0.08)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
| `--x-size-control-m` | `40px` | `40px` | `40px` | `40px` | `40px` | `40px` | `40px` | `40px` | `40px` | `40px` | `40px` | `40px` |
| `--x-pad-surface-l` | `16px` | `16px` | `16px` | `16px` | `16px` | `16px` | `16px` | `16px` | `16px` | `16px` | `16px` | `16px` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-bg-action-primary` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-on-primary` | `oklch(0.905 0.195 116)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.494 0.283 269.5)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-fx-ripple-color-dark` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` | `oklch(0 0 0 / 0.15)` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-gap-content-default` | `8px` | `8px` | `8px` | `8px` | `8px` | `8px` | `8px` | `8px` | `8px` | `8px` | `8px` | `8px` |
