---
handoff: sku-image-list
title: Sku Image List
group: Layout
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/SkuImageList.stories.js
variants: 3
states: 1
---

# Sku Image List

> The SkuImageCard-only sibling of SkuList — same titled-section shape, but items are spread onto SkuImageCard rather than SkuCard (a different prop set: currencyLabel/variant/loyaltyIcon instead of cpIcon/row layout). Grid is fixed (no `columns` override like SkuList): 2 columns on XS, 4 at ≥ 641px. The `wide` prop switches to fewer, bigger cards (1 col mobile, 2 at ≥ 641px — the same ratio as BundleGrid) for a featured row that wants more visual weight per card, independent of the `variant` art treatment. An optional description line renders under the title.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story sku-image-list`.

## Usage Rules
- items is required — each element is v-bound straight onto a SkuImageCard, so it must carry that card's prop shape (currentPrice at minimum).
- variant ("panel" | "background") and currencyLabel/loyaltyIcon are shared by every card in the list — set them once here, not per item.
- wide is independent of variant — it only changes column count/card size, not the art treatment.
- description only renders when title is also set (the header block is skipped entirely when both are empty).

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Panel (2→4 up) | 0 |
| Background variant | 1 |
| Wide (featured row, 1→2 up) | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-loose` | `12px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-gap-content-default` | `8px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-sku-image-list-title-size` | _(resolve live)_ | _(resolve live)_ | `18px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ |
| `--x-text-body-soft` | `oklch(0.909 0.004 305)` | `oklch(0.719 0.006 274.9)` | `oklch(0.893 0.001 56.0)` | `oklch(0.738 0.088 284.0)` | `oklch(0.571 0.008 106.6)` | `oklch(0.73 0 0)` | `oklch(0.73 0.01 140)` | `oklch(0.725 0.016 80)` | `oklch(0.718 0.006 258)` | `oklch(0.720 0.007 255)` | `oklch(0.723 0.0117 279.3)` | `oklch(0.790 0 0)` |
