---
handoff: milestone-rewards
title: Milestone Rewards
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/MilestoneRewards.stories.js
variants: 3
states: 1
---

# Milestone Rewards

> The "Milestone Rewards" tab content — header, hero banner (art bloom-glows via fx-bloom, sized off the hero image itself), campaign description, a text-only progression summary ("Next Level: X/Y"), the MilestoneRewardsRail step-track + reward cards, and a closing "Earn Milestone Points" CTA that emits `go-to-store` (App.vue owns switching the active tab back — this component has no access to that state itself). Reward state (locked/claimable/claimed) is derived from `data.tiers` + the current point balance by ../utils/milestoneRewards.js, the same store-agnostic logic every store campaign shares. In the live app the point balance is either a dev-toolbar scenario flag (FCM) or a fixed `data.demoPoints` (COD:M) — this story always uses `demoPoints` directly so the preview state is deterministic and does not depend on useFeatureFlags() resolving a particular flag.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story milestone-rewards`.

## Usage Rules
- `data` is required — header, hero.{image,tagLabel,title}, description, tiers, and either scenarioFlag or demoPoints must all be supplied by the caller's store module.
- tiers must be in ascending threshold order — deriveRewardsState/deriveProgressionSummary assume it (the "frontier" is the last tier whose threshold has been reached).
- The loyalty status icon on the progression line only renders when config.checkout.loyalty is non-null — not a prop on this component, so it cannot be toggled from a variant.
- hero.badgeImage is optional — omit it to show just the tag/title text with no reward art.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Early progress (mostly locked) | 0 |
| Mid-campaign (reward claimable) | 1 |
| Final tier reached | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-size-img-xxl` | `96px` |
| `--x-gap-content-tight` | `2px` |
| `--x-size-icon-xs` | `12px` |
| `--x-pad-surface-s` | `8px` |
| `--x-surface-frost` | `oklch(0.992 0.003 286 / 0.04)` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-surface-frost-hover` | `oklch(0.992 0.003 286 / 0.10)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-gradient-scroll-fade-bottom` | `linear-gradient(to top, color-mix(in oklab, oklch(0.180 0.035 305) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.166 0.017 273.5) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.207 0.006 56.0) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.231 0.160 264.1) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0 0 0) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.134 0.0 0) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.2 0.02 140) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.147 0.003 17.6) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.165 0.012 258) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.160 0.020 255) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.163 0.033 279.3) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0 0 0) 80%, transparent) 0%, transparent 100%)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
