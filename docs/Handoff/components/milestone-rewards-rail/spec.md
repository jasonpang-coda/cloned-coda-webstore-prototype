---
handoff: milestone-rewards-rail
title: Milestone Rewards Rail
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/MilestoneRewardsRail.stories.js
variants: 3
states: 1
---

# Milestone Rewards Rail

> Horizontally-scrollable row of MilestoneRewardCard tiles topped by a single connected step track (dim base + bright fill), used inside MilestoneRewards.vue (never mounted standalone in the app). Track geometry is measured in real DOM via offsetLeft/offsetWidth against each node ref (measureTrack, onMounted + a ResizeObserver + a deep watcher on rewards/currentMp) rather than approximated in CSS — deliberately not getBoundingClientRect(), since the app's scaled device frame would return post-scale pixels that disagree with pre-scale scrollLeft. Drag-to-scroll comes from useDragScroll(), the same composable FeaturedCarousel uses. `rewards` must already carry the derived `state` (locked/claimable/claimed) — this component does not derive it itself, it only reads it to decide the fill's frontier and each node's reached/unreached look.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story milestone-rewards-rail`.

## Usage Rules
- Needs at least 2 reward entries — measureTrack() bails out (leaves the track at zero size) when fewer than 2 node refs exist.
- rewards should be pre-sorted ascending by threshold — the fill position and the "reached" frontier both assume that order.
- Each reward needs a stable, unique id — it keys MilestoneRewardCard's own claim state via useGiftClaim().
- pointsUnit is cosmetic only (the label under each node) — it does not affect the fill/threshold math, which is always raw numbers.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Early progress | 0 |
| Mixed — claimed, claimable, locked | 1 |
| Final tier reached | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-s` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-motion-sys-duration-slower` | `500ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-size-img-s` | `24px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-badge-full` | `999px` | `999px` | `999px` | `999px` | `999px` | `0px` | `999px` | `999px` | `999px` | `999px` | `999px` | `999px` |
| `--x-bg-indicator-neutral-subtle` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-bg-indicator-brand-default` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-text-on-primary` | `oklch(0.905 0.195 116)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.494 0.283 269.5)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
