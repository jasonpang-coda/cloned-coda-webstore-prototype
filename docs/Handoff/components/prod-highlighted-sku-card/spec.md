---
handoff: prod-highlighted-sku-card
title: Prod Highlighted Sku Card
group: Cards
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/ProdHighlightedSkuCard.stories.js
variants: 3
states: 3
---

# Prod Highlighted Sku Card

> The FCM production "highlighted SKU" card (fcmSkuCardModel flag, Figma node 3361:28283), replacing BestSellerCard at its one App.vue mount only. A landscape two-column layout (text + CTA left, product art right) rather than a restyle of BestSellerCard's stacked layout. Tapping anywhere opens the checkout sheet via useCheckout(); itemKey is deliberately prefixed (`prod-hero|...`) so its selection identity never collides with SkuCard/BestSellerCard.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story prod-highlighted-sku-card`.

## Usage Rules
- amount and currentPrice are required; every other prop is optional.
- loyaltyPoints !== null shows the "Loyalty Reward" row; loyaltyIcon only renders inside it when supplied.
- skuImage falls back to image — pass either one for the art panel.
- The RECOMMENDED tag always renders; there is no prop to hide it.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`, `pressed`

| Variant Name | Index |
|---|---|
| Default | 0 |
| With loyalty reward | 1 |
| No subtitle | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-l` | `16px` |
| `--x-pad-surface-s` | `8px` |
| `--x-motion-sys-duration-slow` | `350ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-sys-distance-sm` | `4px` |
| `--x-motion-sku-press-scale` | `0.99` |
| `--x-motion-sku-press` | `100ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-tight` | `2px` |
| `--x-pad-surface-xxs` | `2px` |
| `--x-pad-surface-xs` | `4px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-text-shadow-sku-card-prod` | `4px 4px 4px oklch(0 0 0 / 0.25)` |
| `--x-motion-sys-duration-base` | `250ms` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-border-sku-card-prod-highlighted` | `transparent` | `transparent` | `transparent` | `transparent` | `#fffb94` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` |
| `--x-bg-sku-card-prod-reward` | `transparent` | `transparent` | `transparent` | `transparent` | `#101820` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` |
| `--x-bg-image-sku-card-prod-highlighted` | `none` | `none` | `none` | `none` | `url('../../../stores/fcm/img/content/SKU Banners/Prod Highlighted SKU BG.webp')` | `none` | `none` | `none` | `none` | `none` | `none` | `none` |
| `--x-border-sku-card-selected` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-gradient-sku-card-prod-gold` | `none` | `none` | `none` | `none` | `linear-gradient(140.4809652248109deg, #fffb94 14.893%, #ffffff 29.293%, #fffb94 42.541%, #c4850c 94.957%)` | `none` | `none` | `none` | `none` | `none` | `none` | `none` |
| `--x-text-sku-tag-popular` | `transparent` | `transparent` | `transparent` | `transparent` | `#42240d` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` |
| `--x-sys-weight-regular` | `400` | `400` | `400` | `400` | `400` | `400` | `400` | `400` | `500` | `400` | `300` | `400` |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-radius-control-full` | `999px` | `2px` | `0px` | `8px` | `999px` | `0px` | `2px` | `0px` | `2px` | `2px` | `999px` | `999px` |
| `--x-bg-loyalty-badge-prod` | `transparent` | `transparent` | `transparent` | `transparent` | `#1a1c19` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` | `transparent` |
| `--x-text-body-inverse` | `oklch(0.311 0.029 305)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.304 0.211 264.1)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
