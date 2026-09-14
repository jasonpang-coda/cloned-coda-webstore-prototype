---
handoff: base-sheet
title: Base Sheet
group: Overlays
generated_by: scripts/export-handoff.mjs (story-mode)
source: src/library/stories/BaseSheet.stories.js
variants: 4
states: 1
---

# Base Sheet

> The one bottom-sheet/modal shell every overlay in this app (CheckoutSheet, PurchaseSheet, ClaimGiftSheet, SignInSheet, RegionSelectorSheet, LanguageSelectorSheet, TaskGiftSheet) is built on. Owns the scrim, the frosted L3 panel, the slide-up / responsive-centered-modal transition, the bottom scroll scrim, Escape-to-close, and (when scrim=false) outside-tap-to- close. Consumers own state (open/contentKey/sizeHint from their own composables) and content (slots) — BaseSheet owns none of it. Bumping `contentKey` while `open` stays true drives the auto-size engine: the panel measures its old height, lets the new slot content patch in clipped at that height, then grows/shrinks to the new natural height — the resize itself is the transition between two views of the same sheet.

**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with `node scripts/export-handoff.mjs --story base-sheet`.

## Usage Rules
- When overriding this shared chrome for a new layout mode (e.g. .sheet__header padding), check whether ANY ancestor (e.g. DeviceFrame's overlay) applies a competing rounded-corner clip at a different radius before removing padding as 'redundant' — it may be the only thing keeping content out of that clip zone. Happened twice: diagnosing the landscape corner-square fix, then a regression (missing close button) from stripping this exact padding.
- `open` is required to mount anything — BaseSheet renders nothing at all when false.
- scrim=false (SignInSheet's pattern) leaves the page behind interactive; BaseSheet falls back to a document-level outside-tap listener for dismissal instead.
- sizeHint maps to a fixed mobile/framed height policy: tall (85%), full (95%), compact (auto, max 95%), content (max 85%, no fixed height), content-full (max 100%, no fixed height).
- dismissable=false suppresses close() entirely — Escape, scrim click, and the close button all become no-ops.
- Changing contentKey while open triggers the resize + cross-fade engine; it must be a stable per-view identity (a step id), never something that changes on every render.

## Variants & Interaction States

- **Supported Interaction States**: `default`

| Variant Name | Index |
|---|---|
| Default (tall) | 0 |
| Content-hugging | 1 |
| No scrim (content-full) | 2 |
| Responsive (desktop modal) | 3 |

## Token Contract (Resolved per Store)

**Same value at every store:**

| Token | Value |
|---|---|
| `--x-pad-surface-l` | `16px` |
| `--x-shadow-sheet` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` |
| `--x-gap-content-default` | `8px` |
| `--x-pad-surface-m` | `12px` |
| `--x-gap-content-loose` | `12px` |
| `--x-pad-surface-xl` | `24px` |
| `--x-size-img-xl` | `64px` |
| `--x-motion-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-motion-modal-enter` | `350ms cubic-bezier(0, 0, 0.2, 1)` |
| `--x-motion-sys-duration-modal-panel-delay` | `60ms` |
| `--x-motion-modal-exit` | `200ms cubic-bezier(0.4, 0, 1, 1)` |
| `--x-motion-sys-duration-footer-delay` | `100ms` |
| `--x-motion-sys-distance-lg` | `16px` |
| `--x-pad-surface-s` | `8px` |
| `--x-size-icon-l` | `24px` |
| `--x-motion-sku-hover` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `--x-text-header-strong` | `oklch(1 0 0)` |

**Diverges per store:**

| Token | CODASHOP | CODM | DIABLOIMMORTAL | EFOOTBALL | FCM | MGSSE | PVZ3 | ROGUETRADER | TDR | YGODL | YGOMD | ZZZ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `--x-scrim` | `color-mix(in oklab, oklch(0.180 0.035 305) 60%, transparent)` | `color-mix(in oklab, oklch(0.166 0.017 273.5) 60%, transparent)` | `color-mix(in oklab, oklch(0.207 0.006 56.0) 60%, transparent)` | `color-mix(in oklab, oklch(0.231 0.160 264.1) 60%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 60%, transparent)` | `color-mix(in oklab, oklch(0.134 0.0 0) 60%, transparent)` | `color-mix(in oklab, oklch(0.2 0.02 140) 60%, transparent)` | `color-mix(in oklab, oklch(0.147 0.003 17.6) 60%, transparent)` | `color-mix(in oklab, oklch(0.165 0.012 258) 60%, transparent)` | `color-mix(in oklab, oklch(0.160 0.020 255) 60%, transparent)` | `color-mix(in oklab, oklch(0.163 0.033 279.3) 60%, transparent)` | `color-mix(in oklab, oklch(0 0 0) 60%, transparent)` |
| `--x-border-sheet` | `oklch(1 0 0 / 0.16)` | `oklch(1 0 0 / 0.16)` | `oklch(0.297 0.085 33.9)` | `oklch(0.95 0 0 / 0.12)` | `oklch(0.95 0 0 / 0.08)` | `oklch(0.583 0.198 142.5 / 0.18)` | `oklch(1 0 0 / 0.16)` | `oklch(0.82 0.07 80 / 0.22)` | `oklch(1 0 0 / 0.16)` | `oklch(1 0 0 / 0.16)` | `oklch(0.843 0.106 88.3 / 0.18)` | `oklch(0.290 0 0)` |
| `--x-radius-container-s` | `8px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` | `0px` | `8px` | `8px` | `0px` | `8px` |
| `--x-bg-sheet` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-bg-page` | `oklch(0.180 0.035 305)` | `oklch(0.166 0.017 273.5)` | `oklch(0.207 0.006 56.0)` | `oklch(0.231 0.160 264.1)` | `oklch(0 0 0)` | `oklch(0.134 0.0 0)` | `oklch(0.2 0.02 140)` | `oklch(0.147 0.003 17.6)` | `oklch(0.165 0.012 258)` | `oklch(0.160 0.020 255)` | `oklch(0.163 0.033 279.3)` | `oklch(0 0 0)` |
| `--x-blur-container` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `16px` | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | _(resolve live)_ | `8px` | _(resolve live)_ | _(resolve live)_ |
| `--x-text-header-default` | `oklch(1.000 0.000 305)` | `oklch(0.992 0.003 286.4)` | `oklch(0.993 0.001 56.0)` | `oklch(1 0 0)` | `oklch(1 0 0)` | `oklch(0.975 0 0)` | `oklch(0.975 0.005 140)` | `oklch(0.972 0.03 80)` | `oklch(0.992 0.002 258)` | `oklch(0.992 0.002 255)` | `oklch(0.995 0.0024 279.3)` | `oklch(1 0 0)` |
| `--x-gradient-scroll-fade-bottom` | `linear-gradient(to top, color-mix(in oklab, oklch(0.180 0.035 305) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.166 0.017 273.5) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.207 0.006 56.0) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.231 0.160 264.1) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0 0 0) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.134 0.0 0) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.2 0.02 140) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.147 0.003 17.6) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.165 0.012 258) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.160 0.020 255) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0.163 0.033 279.3) 80%, transparent) 0%, transparent 100%)` | `linear-gradient(to top, color-mix(in oklab, oklch(0 0 0) 80%, transparent) 0%, transparent 100%)` |
| `--x-border-divider` | `oklch(0.431 0.024 305)` | `oklch(0.310 0.011 271.0)` | `oklch(0.349 0.007 56.0)` | `oklch(0.335 0.216 266.4)` | `oklch(0.158 0.002 197)` | `oklch(0.3 0 0)` | `oklch(0.3 0.02 140)` | `oklch(0.3 0.011 80)` | `oklch(0.300 0.010 258)` | `oklch(0.290 0.016 255)` | `oklch(0.293 0.0268 279.3)` | `oklch(0.205 0 0)` |
| `--x-radius-container-m` | `12px` | `12px` | `0px` | `12px` | `12px` | `0px` | `12px` | `0px` | `12px` | `12px` | `0px` | `12px` |
| `--x-bg-sheet-footer` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.239 0.059 33.9), oklch(0.239 0.059 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.08) 0%, oklch(0.81 0 0 / 0.08) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.225 0 0)` | `linear-gradient(0deg, oklch(0.377 0.010 278 / 0.08), oklch(0.786 0.006 275 / 0.08))` | `linear-gradient(0deg, oklch(0.225 0.011 80 / 0.55), oklch(0.3 0.011 80 / 0.55))` | `linear-gradient(0deg, oklch(0.370 0.009 258 / 0.08), oklch(0.786 0.005 258 / 0.08))` | `linear-gradient(to bottom, oklch(0 0 0 / 0.56) 24.519%, oklch(0 0 0 / 0.88))` | `oklch(0.228 0.0301 279.3)` | `oklch(0 0 0)` |
| `--x-shadow-checkout-footer` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -1px 3px oklch(0 0 0 / 0.45), 0 -6px 12px oklch(0 0 0 / 0.50)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` | `0 -8px 16px oklch(0.17 0.02 80 / 0.30)` |
| `--x-checkout-loyalty-overlap` | `0px` | `0px` | `0px` | `0px` | `16px` | `0px` | `0px` | `0px` | `0px` | `0px` | `0px` | `0px` |
| `--x-bg-sku-card-default` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.75%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%20result%3D%22t%22/%3E%3CfeColorMatrix%20in%3D%22t%22%20type%3D%22matrix%22%20values%3D%220%200%200%200%200%20%200%200%200%200%200%20%200%200%200%200%200%20%200.9%200.9%200.9%200%200%22/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type%3D%22linear%22%20slope%3D%220.09%22/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23n%29%22/%3E%3C/svg%3E"), linear-gradient(0deg, oklch(0.187 0.035 33.9), oklch(0.187 0.035 33.9))` | `linear-gradient( oklch(0.304 0.211 264.1 / 0.60), oklch(0.304 0.211 264.1 / 0.60) )` | `linear-gradient(180deg, oklch(0.95 0 0 / 0.04) 0%, oklch(0.81 0 0 / 0.04) 100%), linear-gradient(180deg, oklch(0.047 0 0 / 0.6), oklch(0.047 0 0 / 0.6))` | `oklch(0.134 0.0 0)` | `radial-gradient( ellipse 100% 32% at 35% 0%, oklch(0.992 0.003 286 / 0.04) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.85 0.08 80 / 0.06) 0%, transparent 100% )` | `radial-gradient( ellipse 100% 32% at 50% 0%, oklch(0.992 0.003 258 / 0.04) 0%, transparent 100% )` | `linear-gradient(to bottom, oklch(0 0 0 / 0.64) 24.519%, oklch(0 0 0))` | `oklch(0.163 0.033 279.3)` | `oklch(0.145 0 0)` |
