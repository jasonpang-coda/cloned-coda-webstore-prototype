---
handoff: catalog-nav-stack
title: Catalog Nav Stack
group: Navigation
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/CatalogNavStack.stories.js
variants: 3
states: 3
---

# Catalog Nav Stack

> The sticky L2/L3 navigation aid for the FCM multi-level pilot, mounted in normal document flow right after Best Sellers (not the overlay layer). It is a pure navigation aid over a single continuous page that already renders every category/subcategory — tapping a tab scrolls to the matching section; an internal IntersectionObserver scroll-spy keeps the highlight (and, in the "stacked" presentation, the visible L3 row) in sync as the user scrolls past sections without tapping anything. It publishes --nav-stack-h so page sections can size their own scroll-margin-top against this bar's real height. In this isolated story the on-page section anchors (`cat-<id>` / subcategory ids) the scroll-spy looks for do not exist, so the observer simply finds nothing to watch and the first tab stays highlighted — this is graceful, not a bug.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story catalog-nav-stack`.

## Usage Rules
- App.vue hardcodes presentation="flat" in production — "stacked" is kept only as an archived, still-functional presentation.
- `categories` must already be fully rendered on the page elsewhere; this component never filters or owns what content shows, only the affordance to jump to it.
- The L3 row only renders when the in-view category has more than one subcategory — a 1-subcategory category (e.g. Gifts) collapses it to nothing, not an empty bar.
- `isMobile` selects the scroll container: `.device__screen` when true, `window` when false (responsive/no device frame).

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Flat presentation (production default) | 0 |
| Stacked presentation (archived, L2 + L3) | 1 |
| Responsive (no device frame) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-gap-content-narrow` | `4px` |
| `--x-size-control-s` | `32px` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-duration-exit` | `200ms` |
| `--x-motion-sys-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-border-sheet` | `oklch(1 0 0 / 0.16)` | `oklch(1 0 0 / 0.16)` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.12)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.18)` | `oklch(1 0 0 / 0.16)` | `oklch(0.82 0.07 80 / 0.22)` | `oklch(1 0 0 / 0.16)` | `oklch(1 0 0 / 0.16)` | `oklch(0.843 0.106 88.3 / 0.18)` | `oklch(0.290 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-bg-sheet` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-bg-page` | `oklch(0.180 0.035 305)` | `oklch(0.166 0.017 273.5)` | `oklch(0.207 0.006 56.0)` | `oklch(0.231 0.160 264.1)` | `oklch(0 0 0)` | `oklch(0.134 0.0 0)` | `oklch(0.2 0.02 140)` | `oklch(0.147 0.003 17.6)` | `oklch(0.165 0.012 258)` | `oklch(0.160 0.020 255)` | `oklch(0.163 0.033 279.3)` | `oklch(0 0 0)` |
| `--x-blur-container` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `16px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `8px` | _(resolve live)_ | _(resolve live)_ |
