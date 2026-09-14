---
handoff: best-seller-card
title: Best Seller Card
group: Cards
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/BestSellerCard.stories.js
variants: 2
states: 2
---

# Best Seller Card

> The hero "best seller" card. By default it renders its own BEST SELLER heading above the card; set showHeading=false for the compact variant used inside the BestSellerCarousel. The compact variant drops the bloom and uses a shorter image.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story best-seller-card`.

## Usage Rules
- amount and currentPrice are required.
- showHeading controls the section heading; description is section-level copy, not card content.
- compact is for the carousel context — shorter image, no bloom.

## Variants & Interaction States

- **Supported Interaction States**: `default`, `hover`

| Variant Name | Index |
|---|---|
| Hero | 0 |
| Compact | 1 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-default` | `8px` |
| `--x-border-warm` | `oklch(0.93 0.03 80 / 0.16)` |
| `--x-motion-sys-duration-slow` | `350ms` |
| `--x-motion-sys-ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-duration-base` | `250ms` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-sku-select` | `250ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-shadow-bestseller` | `0 8px 24px oklch(0 0 0 / 0.35)` |
| `--x-motion-sku-press` | `100ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-pad-surface-s` | `8px` |
| `--x-gradient-bestseller-metallic-shine` | `linear-gradient(100deg, oklch(1 0 0 / 0) 15%, oklch(1 0 0 / 0.61) 50%, oklch(1 0 0 / 0) 85%)` |
| `--x-fx-bestseller-shimmer-opacity` | `0.25` |
| `--x-motion-sku-shimmer` | `3000ms` |
| `--x-motion-sys-ease-linear` | `linear` |
| `--x-pad-surface-xs` | `4px` |
| `--x-pad-surface-l` | `16px` |
| `--x-gap-content-narrow` | `4px` |
| `--x-text-icon-faint` | `oklch(1 0 0 / 0.50)` |
| `--x-pad-surface-xxs` | `2px` |
| `--x-gap-content-tight` | `2px` |
| `--border-weight-default` | `1px` |
| `--border-weight-selected` | `2px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-hdr-hot` | `oklch(0.921 0.060 293)` | `oklch(0.97 0.16 95)` | `oklch(0.97 0.16 95)` | `oklch(0.865 0.177 90.4)` | `oklch(0.948 0.22 117)` | `oklch(0.97 0.16 95)` | `oklch(0.97 0.16 95)` | `oklch(0.97 0.16 95)` | `oklch(0.97 0.16 95)` | `oklch(0.97 0.16 95)` | `oklch(0.97 0.16 95)` | `oklch(0.97 0.16 95)` |
| `--x-hdr-glow` | `oklch(0.620 0.245 293)` | `oklch(0.82 0.20 75)` | `oklch(0.82 0.20 75)` | `oklch(0.968 0.211 109.8)` | `oklch(0.803 0.225 149.2)` | `oklch(0.82 0.20 75)` | `oklch(0.82 0.20 75)` | `oklch(0.82 0.20 75)` | `oklch(0.82 0.20 75)` | `oklch(0.82 0.20 75)` | `oklch(0.82 0.20 75)` | `oklch(0.82 0.20 75)` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-gradient-bestseller-hero` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` | `radial-gradient(ellipse 160% 180% at -5% 11%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.85) 12%, oklch(0.52 0.10 101 / 0.80) 22%, oklch(0.36 0.065 99 / 0.70) 38%, oklch(0.25 0.035 97 / 0.55) 58%, oklch(0.17 0.012 95 / 0.88) 100%)` |
| `--x-bg-card-selected` | `oklch(0.205 0.039 293)` | `oklch(0.217 0.027 98.3)` | `oklch(0.140 0.017 75.1)` | `oklch(0.380 0.092 56.8)` | `oklch(0.334 0.083 152.3)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.057 133.1)` | `oklch(0.205 0.045 45)` | `oklch(0.460 0.180 264)` | `oklch(0.425 0.042 88.3)` | `oklch(0.166 0.045 128.9)` |
| `--x-shadow-bestseller-selected` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.620 0.245 293) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.968 0.211 109.8) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.803 0.225 149.2) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` | `0 8px 24px oklch(0 0 0 / 0.35), 0 0 20px 1px color-mix(in oklch, oklch(0.82 0.20 75) 55%, transparent)` |
| `--x-border-sku-card-selected` | `oklch(0.620 0.245 293)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
| `--x-gradient-bestseller-hero-hover` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` | `radial-gradient(ellipse 165% 185% at -7% 9%, oklch(0.91 0.19 104 / 0.88) 0%, oklch(0.85 0.175 104 / 0.88) 5%, oklch(0.72 0.14 103 / 0.87) 12%, oklch(0.52 0.10 101 / 0.82) 22%, oklch(0.36 0.065 99 / 0.72) 38%, oklch(0.25 0.035 97 / 0.58) 58%, oklch(0.17 0.012 95 / 1) 100%)` |
| `--x-gradient-bestseller-vignette` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `transparent` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` | `linear-gradient(180deg, oklch(0.14 0.005 50 / 0) 0%, oklch(0.14 0.005 50 / 0.56) 100%)` |
| `--x-text-warning-default` | `oklch(0.800 0.155 75)` | `oklch(0.743 0.142 66.8)` | `oklch(0.705 0.120 78.8)` | `oklch(0.618 0.149 57.5)` | `oklch(0.769 0.165 70.1)` | `oklch(0.617 0.103 109.1)` | `oklch(0.8 0.15 80)` | `oklch(0.759 0.144 80.0)` | `oklch(0.743 0.142 66.8)` | `oklch(0.743 0.142 66.8)` | `oklch(0.763 0.140 72.5)` | `oklch(0.827 0.171 75.0)` |
| `--x-text-error-default` | `oklch(0.568 0.189 25)` | `oklch(0.619 0.209 28.5)` | `oklch(0.593 0.151 31.8)` | `oklch(0.635 0.251 21.6)` | `oklch(0.599 0.231 27.9)` | `oklch(0.633 0.0 0)` | `oklch(0.6 0.22 25)` | `oklch(0.468 0.172 25.9)` | `oklch(0.619 0.209 28.5)` | `oklch(0.619 0.209 28.5)` | `oklch(0.655 0.231 26.4)` | `oklch(0.708 0.191 33.9)` |
| `--x-text-bonus-amount` | `oklch(0.749 0.166 293)` | `oklch(0.930 0.164 101.5)` | `oklch(0.809 0.085 75.1)` | `oklch(0.975 0.149 108.9)` | `oklch(0.861 0.202 153.1)` | `oklch(0.642 0.183 142.5)` | `oklch(0.77 0.16 142.5)` | `oklch(0.74 0.131 133.1)` | `oklch(0.780 0.180 50)` | `oklch(0.890 0.155 96)` | `oklch(0.902 0.098 88.3)` | `oklch(0.934 0.185 128.9)` |
| `--x-text-success-default` | `oklch(0.750 0.190 152)` | `oklch(0.880 0.246 138.2)` | `oklch(0.623 0.147 143.1)` | `oklch(0.593 0.189 144.4)` | `oklch(0.782 0.2 150.2)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.790 0.175 132.1)` | `oklch(0.880 0.246 138.2)` | `oklch(0.880 0.246 138.2)` | `oklch(0.722 0.132 164.1)` | `oklch(0.803 0.191 152.5)` |
| `--x-text-hyperlink-default` | `oklch(0.905 0.195 116)` | `oklch(0.919 0.192 101.8)` | `oklch(0.768 0.095 75.1)` | `oklch(0.968 0.211 109.8)` | `oklch(0.857 0.234 150)` | `oklch(0.583 0.198 142.5)` | `oklch(0.72 0.19 142.5)` | `oklch(0.672 0.142 133.1)` | `oklch(0.720 0.195 48)` | `oklch(0.550 0.215 264)` | `oklch(0.843 0.106 88.3)` | `oklch(0.910 0.246 128.9)` |
