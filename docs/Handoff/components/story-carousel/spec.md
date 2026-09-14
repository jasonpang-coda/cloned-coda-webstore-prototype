---
handoff: story-carousel
title: Story Carousel
group: Carousels
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/StoryCarousel.stories.js
variants: 4
states: 2
---

# Story Carousel

> Instagram-story-style hero slideshow: 1:1 portrait frame on narrow containers, 2.6:1 landscape at >=801px (or a fixed aspectRatio prop override). A segmented progress bar per slide fills over `interval` (5000ms default) and auto-advances to the next slide on fill; tapping the left/right half of the frame navigates manually. Holding a pointer down on the frame pauses the active segment's fill (press-to-pause) without resetting it. Slides crossfade (350ms) rather than cut. With exactly one slide the progress bar, its scrim and autoplay are all hidden — it just presents a static hero. Honors prefers-reduced-motion by disabling auto-advance and showing the active segment full; tap navigation still works.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story story-carousel`.

## Usage Rules
- slides is capped at 5 in practice — the segmented progress bar is designed for up to 5 segments before they become too thin to read.
- loop=true (default) wraps tap-next on the last slide back to the first, and tap-prev on the first to the last.
- A single slide silently disables autoplay, the progress bar and its scrim — there is nothing to advance to.
- ctaLabel is optional per slide — the CTA pill only renders when the current slide supplies one.
- aspectRatio overrides the responsive 1:1/2.6:1 default at every breakpoint — use it when a store's art is neither square nor the wide banner crop.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`

| Variant Name | Index |
|---|---|
| Default (3 slides, autoplay) | 0 |
| Single slide (static, no progress bar) | 1 |
| Autoplay off | 2 |
| Fast interval, no loop | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-motion-sys-duration-slow` | `350ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-bestseller-warm` | `oklch(0.181 0.006 55.9)` |
| `--x-shadow-story-card` | `0 2px 5px oklch(0.12 0.01 273 / 0.31), 0 8px 8px oklch(0.12 0.01 273 / 0.27), 0 19px 11px oklch(0.12 0.01 273 / 0.16)` |
| `--x-motion-sku-story-fade` | `350ms` |
| `--x-motion-sys-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-gradient-story-progress-scrim` | `linear-gradient(to bottom, oklch(0.99 0.002 286 / 0.2) 0%, transparent 100%)` |
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-s` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-loose` | `12px` |
| `--x-pad-surface-l` | `16px` |
| `--x-shadow-logo` | `drop-shadow(0 4px 2px oklch(0 0 0 / 0.25))` |
| `--x-text-shadow-story-heading` | `0 2px 5px oklch(0.12 0.01 273 / 0.31), 0 8px 8px oklch(0.12 0.01 273 / 0.27)` |
| `--x-surface-frost` | `oklch(0.992 0.003 286 / 0.04)` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-surface-frost-hover` | `oklch(0.992 0.003 286 / 0.10)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-gradient-story-scrim` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` | `linear-gradient( 180deg, transparent 30%, oklch(0.134 0.0 0) 100% )` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` | `linear-gradient( 180deg, transparent 30%, oklch(0.147 0.003 17.6) 100% )` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` | `linear-gradient(180deg, transparent 45%, oklch(0.12 0.01 273 / 0.55) 100%)` |
| `--x-story-logo-max-height` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `140px` | _(resolve live)_ | `192px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-story-logo-max-width` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `640px` | _(resolve live)_ | `660px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
