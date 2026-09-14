---
handoff: region-selector-sheet
title: Region Selector Sheet
group: Overlays
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/RegionSelectorSheet.stories.js
variants: 3
states: 1
---

# Region Selector Sheet

> The "Select Region" picker (Figma 4014:4802; typeahead 4015:5635). Opened from the NavDrawer footer or the navbar region switcher via useLocale().openRegionSelector(). The continent-grouped market list (two-column CSS multi-column layout) sits below a pinned search box — typing does NOT filter that list, it instead drops a floating suggestion card of substring matches (matched text bolded) anchored under the input, while the full list stays in place underneath. Uses BaseSheet's 560px desktop maxWidth (wider than the other sheets' 420px default) for the two-column layout to breathe.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story region-selector-sheet`.

## Usage Rules
- The search input filters nothing directly — it only populates the floating suggestions dropdown; the grouped list below is always the full, unfiltered set.
- Escape is captured in two stages: with a non-empty query it clears the query first (stopPropagation, sheet stays open); only a second Escape (or Escape on an empty query) reaches BaseSheet and closes the sheet.
- query resets to empty every time the sheet re-opens (watch on regionSelectorOpen) — it never carries a stale search across sessions.
- Picking a market (from either the list or the suggestion dropdown) calls setRegion(code) then closeRegionSelector() immediately — no separate confirm step.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default | 0 |
| Non-default region selected | 1 |
| Responsive (desktop modal) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-s` | `8px` |
| `--x-size-icon-m` | `20px` |
| `--x-bg-input-default` | `oklch(0 0 0 / 0.10)` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-gap-content-narrow` | `4px` |
| `--x-shadow-sheet` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` |
| `--x-size-img-xl` | `64px` |
| `--x-pad-surface-l` | `16px` |
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-separation` | `16px` |
| `--x-text-header-strong` | `oklch(1 0 0)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-border-input-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-radius-input-m` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `4px` | `8px` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-placeholder` | `oklch(0.795 0.009 305)` | `oklch(0.584 0.008 277.1)` | `oklch(0.759 0.002 56.0)` | `oklch(0.561 0.154 280.2)` | `oklch(0.455 0.006 106.6)` | `oklch(0.585 0 0)` | `oklch(0.585 0.014 140)` | `oklch(0.585 0.01 80)` | `oklch(0.580 0.007 258)` | `oklch(0.580 0.010 255)` | `oklch(0.583 0.0167 279.3)` | `oklch(0.590 0 0)` |
| `--x-border-input-focused` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-border-card-default` | `oklch(1 0 0 / 0.08)` | `oklch(0.310 0.011 271.0)` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0)` | `oklch(0.158 0.002 197)` | `oklch(0.583 0.198 142.5 / 0.18)` | `oklch(0.3 0.02 140)` | `oklch(0.8 0.07 80 / 0.16)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.843 0.106 88.3 / 0.18)` | `oklch(0.290 0 0)` |
| `--x-bg-card-default` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-bg-page` | `oklch(0.180 0.035 305)` | `oklch(0.166 0.017 273.5)` | `oklch(0.207 0.006 56.0)` | `oklch(0.231 0.160 264.1)` | `oklch(0 0 0)` | `oklch(0.134 0.0 0)` | `oklch(0.2 0.02 140)` | `oklch(0.147 0.003 17.6)` | `oklch(0.165 0.012 258)` | `oklch(0.160 0.020 255)` | `oklch(0.163 0.033 279.3)` | `oklch(0 0 0)` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-bg-indicator-neutral-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-gradient-scroll-fade-bottom` | `linear-gradient(to top, color-mix(in oklab, oklch(0.180 0.035 305) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.166 0.017 273.5) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.207 0.006 56.0) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.231 0.160 264.1) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0 0 0) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.134 0.0 0) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.2 0.02 140) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.147 0.003 17.6) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.165 0.012 258) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.160 0.020 255) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.163 0.033 279.3) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0 0 0) 80%, transparent) 0%, transparent 100%)` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
