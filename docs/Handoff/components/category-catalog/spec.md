---
handoff: category-catalog
title: Category Catalog
group: Content
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/CategoryCatalog.stories.js
variants: 4
states: 1
---

# Category Catalog

> Renders every subcategory of one active category node from useStoreCatalog (the FCM catalogue tree). Each subcategory's `cardType` field — never store identity — picks its card: "hero" for flagship named editions (HeroSkuCard), "bundle" for Campaign-Pack style bundles (BundleSkuCard, or SkuImageCard variant="prod" when the `cardVariant` override is "prod"), "sku" with a cardVariant for image-led panel cards (SkuImageCard), and plain "sku" for a "Coming soon" stub while per-category SkuCard designs are pending. Category switches cross-fade (Transition mode="out-in") and remount the subtree via a :key on category.id, replaying every card's staggered entrance.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story category-catalog`.

## Usage Rules
- category is required — a single node shaped { id, label, subcategories: [...] } from useStoreCatalog.
- Each subcategory's cardType drives which card renders — never branch on store identity.
- cardVariant prop (e.g. "prod") overrides every subcategory's own cardVariant; leave null to use the catalogue data as-is.
- sub.promo (CategoryBanner props) replaces the plain <h2> heading when present.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Hero subcategory (flagship editions) | 0 |
| Bundle subcategory (Campaign Packs, with promo banner) | 1 |
| SKU subcategory (image-led panel cards) | 2 |
| SKU subcategory (stub — designs pending) | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-duration-exit` | `200ms` |
| `--x-motion-sys-ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--x-motion-sys-distance-md` | `8px` |
| `--x-pad-surface-l` | `16px` |
| `--x-pad-surface-xl` | `24px` |
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-default` | `8px` |
| `--x-motion-sys-distance-sm` | `4px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-xxl` | `32px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
