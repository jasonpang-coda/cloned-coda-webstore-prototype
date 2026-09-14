---
handoff: language-selector-sheet
title: Language Selector Sheet
group: Overlays
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/LanguageSelectorSheet.stories.js
variants: 3
states: 1
---

# Language Selector Sheet

> The "Select Language" picker (Figma 4016:6248). A flat, un-grouped list of the languages available in the current region (English always first); the active language row is tinted and check-marked. Opened from the navbar/ NavDrawer language switcher via useLocale().openLanguageSelector(). Uses the same BaseSheet chrome as RegionSelectorSheet, but with size-hint="content" — the list is short enough to hug its own height instead of a fixed 85%.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story language-selector-sheet`.

## Usage Rules
- Picking a row calls setLanguage(code) then immediately closeLanguageSelector() — there is no separate confirm step.
- Each row label renders dir="auto" so an RTL language endonym (e.g. Arabic) still lays out correctly inside an otherwise LTR list.
- availableLanguages is regional — it is not the full language catalogue, only what the current region/market exposes.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default | 0 |
| Non-English selected | 1 |
| Responsive (desktop modal) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-s` | `8px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-bg-indicator-neutral-default` | `oklch(0.539 0.020 305)` | `oklch(0.377 0.010 278.3)` | `oklch(0.444 0.006 56.0)` | `oklch(0.364 0.217 268.7)` | `oklch(0.199 0.002 197)` | `oklch(0.375 0 0)` | `oklch(0.375 0.018 140)` | `oklch(0.375 0.011 80)` | `oklch(0.370 0.009 258)` | `oklch(0.360 0.014 255)` | `oklch(0.363 0.0234 279.3)` | `oklch(0.290 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
