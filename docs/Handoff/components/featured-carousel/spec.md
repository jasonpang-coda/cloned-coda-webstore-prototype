---
handoff: featured-carousel
title: Featured Carousel
group: Carousels
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/FeaturedCarousel.stories.js
variants: 3
states: 2
---

# Featured Carousel

> Horizontal row of full BundleSkuCards under a section heading with chevron nav — the bundle-focused sibling of BestSellerCarousel. Cards are 72%-width on narrow containers (always scrolls) and settle to 3-per-row at >=801px, hiding the chevrons once the row no longer overflows. Same free-drag scrolling (useDragScroll, inertia + native touch pan-x, no scroll-snap) and chevron-jumps-80%-of-width behavior as BestSellerCarousel. No autoplay.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story featured-carousel`.

## Usage Rules
- items is required — each entry is spread onto a BundleSkuCard, so bannerImage, title and currentPrice are mandatory per item.
- Chevrons render only when the row actually overflows (hasOverflow), and disable individually at either scroll extreme.
- baseDelay staggers each card entrance by +90ms per index.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`

| Variant Name | Index |
|---|---|
| Default (3 bundles) | 0 |
| Overflow (6 bundles, scrollable) | 1 |
| Single bundle (no scroll, chevrons hidden) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-tight` | `2px` |
| `--x-size-icon-l` | `24px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-btn-activate` | `250ms cubic-bezier(0, 0, 0.2, 1)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
