---
handoff: reseller-banner
title: Reseller Banner
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/ResellerBanner.stories.js
variants: 1
states: 2
---

# Reseller Banner

> Legal-disclosure strip mounted at the very top of the page in App.vue, gated on `config.catalog?.reseller` (only FCM sets that flag today — see src/stores/fcm/store.js — so this never renders on Codashop-family stores). Takes no props: both the always-visible short line and the expandable long disclosure are hardcoded English legal copy in the component itself, not read from useStoreStrings(). Internal `isExpanded` ref drives the chevron rotation and a grid-template-rows 0fr→1fr accordion reveal (the same --x-motion-accordion recipe ItemSummaryAccordion uses) — there is no `defaultOpen` prop, it always mounts collapsed.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story reseller-banner`.

## Usage Rules
- No props — purely self-contained; do not add prop-driven copy here, edit the component text directly if the legal line changes.
- Only rendered when config.catalog.reseller is truthy for the active store (FCM today).
- The long disclosure text is a single fixed EA Sports FC Mobile reseller statement — not localized per store.

## Variants & Interaction States

- **Supported Interaction States**: `collapsed`, `expanded`

| Variant Name | Index |
|---|---|
| Default | 0 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-m` | `12px` |
| `--x-pad-surface-l` | `16px` |
| `--x-gap-control-s` | `4px` |
| `--x-pad-surface-xs` | `4px` |
| `--x-motion-sys-duration-exit` | `200ms` |
| `--x-motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-accordion` | `350ms cubic-bezier(0.4, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-bg-sheet` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
