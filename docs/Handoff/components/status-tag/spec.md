---
handoff: status-tag
title: Status Tag
group: Atoms
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/StatusTag.stories.js
variants: 3
states: 1
---

# Status Tag

> A bordered status pill for transaction state, used inside TransactionCard's order-history rows. A distinct family from the marketing SkuTag badge: it sits on a subtle indicator surface with a matching border colour rather than a solid fill, and its label is set in the one-off Inter text-style-utility-label-tall style (no Hitmarker condense).

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story status-tag`.

## Usage Rules
- label is required.
- variant is one of "success" | "neutral" | "error" (default "neutral") — maps directly to the --x-bg-indicator-*-subtle / --x-border-indicator-* ramps.
- "success" reads as Fulfilled, "neutral" as In Progress, "error" as Failed.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Fulfilled | 0 |
| In Progress | 1 |
| Failed | 2 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-gap-content-narrow` | `4px` |
| `--x-pad-surface-xs` | `4px` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-radius-badge-s` | `4px` | `4px` | `0px` | `4px` | `4px` | `0px` | `4px` | `0px` | `4px` | `4px` | `999px` | `4px` |
| `--x-text-body-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-bg-indicator-success-subtle` | `oklch(0.532 0.126 152)` | `oklch(0.584 0.150 137.5)` | `oklch(0.430 0.106 143.1)` | `oklch(0.419 0.133 144.3)` | `oklch(0.593 0.152 150.2)` | `oklch(0.397 0.169 142.5)` | `oklch(0.46 0.190 142.5)` | `oklch(0.523 0.149 132.1)` | `oklch(0.584 0.150 137.5)` | `oklch(0.584 0.150 137.5)` | `oklch(0.536 0.113 164.1)` | `oklch(0.494 0.130 152.5)` |
| `--x-border-indicator-success` | `oklch(0.205 0.030 152)` | `oklch(0.211 0.027 131.4)` | `oklch(0.140 0.026 143.1)` | `oklch(0.182 0.053 138.3)` | `oklch(0.31 0.069 151.9)` | `oklch(0.165 0.079 142.5)` | `oklch(0.212 0.109 142.5)` | `oklch(0.19 0.07 132.1)` | `oklch(0.211 0.027 131.4)` | `oklch(0.211 0.027 131.4)` | `oklch(0.304 0.053 164.1)` | `oklch(0.166 0.037 152.5)` |
| `--x-bg-indicator-neutral-subtle` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-border-indicator-neutral` | `oklch(0.311 0.029 305)` | `oklch(0.241 0.012 278.0)` | `oklch(0.286 0.007 56.0)` | `oklch(0.304 0.211 264.1)` | `oklch(0.094 0.004 196.5)` | `oklch(0.225 0 0)` | `oklch(0.225 0.02 140)` | `oklch(0.225 0.011 80)` | `oklch(0.235 0.011 258)` | `oklch(0.225 0.018 255)` | `oklch(0.228 0.0301 279.3)` | `oklch(0.145 0 0)` |
| `--x-bg-indicator-error-subtle` | `oklch(0.422 0.128 25)` | `oklch(0.427 0.127 29.0)` | `oklch(0.412 0.109 31.8)` | `oklch(0.447 0.179 21.5)` | `oklch(0.455 0.176 28)` | `oklch(0.431 0 0)` | `oklch(0.431 0.14 25)` | `oklch(0.344 0.146 25.9)` | `oklch(0.427 0.127 29.0)` | `oklch(0.427 0.127 29.0)` | `oklch(0.473 0.193 27.4)` | `oklch(0.458 0.132 33.9)` |
| `--x-border-indicator-error` | `oklch(0.205 0.035 25)` | `oklch(0.184 0.029 42.9)` | `oklch(0.140 0.027 31.8)` | `oklch(0.191 0.061 39.4)` | `oklch(0.243 0.08 25.5)` | `oklch(0.179 0 0)` | `oklch(0.179 0.05 25)` | `oklch(0.19 0.069 25.9)` | `oklch(0.184 0.029 42.9)` | `oklch(0.184 0.029 42.9)` | `oklch(0.237 0.092 26.4)` | `oklch(0.166 0.037 33.9)` |
