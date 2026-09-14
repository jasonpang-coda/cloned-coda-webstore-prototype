---
handoff: category-banner
title: Category Banner
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/CategoryBanner.stories.js
variants: 4
states: 1
---

# Category Banner

> A generic promo/event header used above a catalog section (double-currency, new-users, gifts, CP deals). All text and imagery are optional — the banner renders with whatever subset of icon/title/description/subtext/background it is given. When `endsAt` is set it starts a 1s setInterval (cleared on unmount) driving a live "Xd 00h 00m" countdown chip; the description supports simple HTML via v-html for bold emphasis. The #action slot (e.g. a PWA-install CTA or a Web Push ToggleSwitch, see App.vue's gifts banner) sits as a flex sibling of the text column so it never gets squeezed by flex:1.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story category-banner`.

## Usage Rules
- Every prop is optional — title, description, subtext, icon and backgroundImage each render only when supplied.
- endsAt is an ms-epoch timestamp; omit it entirely to suppress the countdown chip (do not pass 0).
- description is rendered with v-html — only pass trusted/sanitized markup (<strong>/<b> supported).
- Use the #action slot for a single right-aligned control; it is a flex sibling of the text column, not nested inside it.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Double currency (with countdown) | 0 |
| New users (title + description + subtext) | 1 |
| Icon-less, description-only | 2 |
| With action slot (gifts banner) | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-s` | `8px` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-size-img-xxl` | `96px` |
| `--x-radius-circle` | `50%` |
| `--x-surface-ghost-2` | `oklch(1 0 0 / 0.08)` |
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-xxs` | `2px` |
| `--x-pad-surface-xs` | `4px` |
| `--x-surface-ghost-5` | `oklch(1 0 0 / 0.16)` |
| `--x-gap-content-tight` | `2px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-category-banner-pad` | _(resolve live)_ | _(resolve live)_ | `16px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-category-banner-border` | _(resolve live)_ | `1px solid oklch(0.310 0.011 271.0)` | `1px solid oklch(0.297 0.085 33.9)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `1px solid oklch(0.290 0 0)` |
| `--x-category-banner-border-bottom` | _(resolve live)_ | `1px solid oklch(0.310 0.011 271.0)` | `1px solid oklch(0.297 0.085 33.9)` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `1px solid oklch(0.290 0 0)` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-radius-container-xs` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` |
| `--x-scrim-strong` | `color-mix(in oklab, oklch(0.180 0.035 305) 72%, transparent)` | `color-mix(in oklab, oklch(0.166 0.017 273.5) 72%, transparent)` | `color-mix(in oklab, oklch(0.207 0.006 56.0) 72%, transparent)` | `color-mix(in oklab, oklch(0.231 0.160 264.1) 72%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 72%, transparent)` | `color-mix(in oklab, oklch(0.134 0.0 0) 72%, transparent)` | `color-mix(in oklab, oklch(0.2 0.02 140) 72%, transparent)` | `color-mix(in oklab, oklch(0.147 0.003 17.6) 72%, transparent)` | `color-mix(in oklab, oklch(0.165 0.012 258) 72%, transparent)` | `color-mix(in oklab, oklch(0.160 0.020 255) 72%, transparent)` | `color-mix(in oklab, oklch(0.163 0.033 279.3) 72%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 72%, transparent)` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
