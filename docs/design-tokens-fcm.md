# Design Token Values — FC Mobile Web Store

Reference for the **EA SPORTS FC™ Mobile** (FCM) theme palette. All colours are
authored in **OKLCH** (perceptual, P3/wide-gamut headroom). sRGB hex equivalents
are provided for reference only — the live values are OKLCH.

Token source: `src/tokens/ds/themes/fcm.css`  
System structure: `src/tokens/ds/` (see [`component-breakdown.md`](component-breakdown.md) for the full cascade)  
Sibling: [`design-tokens-codm.md`](design-tokens-codm.md) — the COD:M palette

> **How FCM differs structurally from COD:M.** FCM is a second `[data-theme]`
> block that coexists with COD:M and is selected via `<html data-theme="fcm">`.
> The shared structural tiers (`system.css` / `semantics.css` / `space.css` /
> `text-styles.css`) live in `:root` and only *alias* the values defined here, so
> this theme block cascades to every consumer with zero component edits. Two
> things make FCM unlike COD:M:
> 1. **Off-500 seed anchoring** — COD:M anchors every seed at ramp step 500. FCM
>    anchors primary/positive at **600** and negative at **400**, so the `-main`
>    role overrides re-point those steps (see [§ −main overrides](#-main-overrides)).
> 2. **No condense hack** — Cruyff Sans is a correctly-proportioned face, so
>    `--sys-font-condense: 1` (COD:M uses `0.82` to tame Hitmarker).

---

## Seeds

The 7 raw brand anchors (Figma `--ref-*`). Every spectrum ramp and semantic
colour derives from these. To retune the palette, change a seed — the cascade
resolves downstream automatically.

| Token | OKLCH | sRGB equiv | Role |
|---|---|---|---|
| `--ref-primary` | `oklch(0.803 0.225 149.2)` | #05E466 | **FC green** — brand, prices, CTAs, active states (seed at step 600) |
| `--ref-secondary` | `oklch(0.948 0.22 117)` | #E5FF00 | Yellow-green accent — HDR hot, highlights (seed at 500) |
| `--ref-tertiary` | `oklch(0.905 0.155 194.8)` | #00FFFF | Cyan (seed at 500) |
| `--ref-status-positive` | `oklch(0.723 0.192 149.6)` | #22C55E | Green — success (seed at 600) |
| `--ref-status-caution` | `oklch(0.769 0.165 70.1)` | #F59E0B | Amber — warnings (seed at 500) |
| `--ref-status-negative` | `oklch(0.637 0.208 25.3)` | #EF4444 | Red — errors, badges (seed at **400**) |
| `--ref-neutral` | `oklch(0.158 0.002 197)` | #0C0D0D | Container colour (seed at 900); page = `neutral-1000` = `#000` |

> **Note:** FCM's page background is pure black (`--palette-neutral-1000` = `#000`),
> with the near-black container colour (`#0C0D0D`) one step lighter at 900. COD:M's
> page is `#0C0E16` (a blue-tinted near-black) — FCM is colder and darker.

---

## Spectrum ramps

Each ramp runs 950 (darkest) → 50 (lightest). Because FCM anchors several seeds
off-500, the **seed step is annotated per ramp** (it is not always 500).

### Neutral

Seed (`#0C0D0D`) at 900; page background is 1000 (`#000`). Adds a `0` step (`#FFF`).

| Step | OKLCH | sRGB equiv | Notes |
|---|---|---|---|
| 1000 | `oklch(0 0 0)` | #000000 | Page background |
| 950 | `oklch(0.094 0.004 196.5)` | #020303 | |
| 900 | `var(--ref-neutral)` | #0C0D0D | Container colour (seed) |
| 800 | `oklch(0.199 0.002 197)` | #151616 | |
| 700 | `oklch(0.311 0.004 128.6)` | #30312F | |
| 600 | `oklch(0.428 0.005 197)` | #4C5050 | |
| 500 | `oklch(0.455 0.006 106.6)` | #575753 | |
| 400 | `oklch(0.523 0.008 106.7)` | #6A6A65 | |
| 300 | `oklch(0.571 0.008 106.6)` | #787873 | |
| 200 | `oklch(0.724 0.007 106.6)` | #A6A6A1 | |
| 100 | `oklch(0.899 0.008 106.6)` | #DEDED8 | |
| 50 | `oklch(0.99 0.007 106.5)` | #FCFCF7 | |
| 0 | `oklch(1 0 0)` | #FFFFFF | |

### Primary (FC green) — seed at 600

| Step | OKLCH | sRGB equiv |
|---|---|---|
| 950 | `oklch(0.334 0.083 152.3)` | #064220 |
| 900 | `oklch(0.398 0.101 151.9)` | #07562A |
| 800 | `oklch(0.526 0.139 150.8)` | #09803D |
| 700 | `oklch(0.651 0.178 149.8)` | #08AC4F |
| **600** | `var(--ref-primary)` = `oklch(0.803 0.225 149.2)` | #05E466 (seed) |
| 500 | `oklch(0.857 0.234 150)` | #13F876 |
| 400 | `oklch(0.861 0.202 153.1)` | #40F68F |
| 300 | `oklch(0.874 0.162 156)` | #6CF5A8 |
| 200 | `oklch(0.9 0.118 158)` | #97F6C0 |
| 100 | `oklch(0.932 0.072 159.6)` | #C0F8D8 |
| 50 | `oklch(0.952 0.049 159.9)` | #D4FAE4 |

### Secondary (yellow-green) — seed at 500

| Step | OKLCH |
|---|---|
| 950 | `oklch(0.230 0.065 117)` |
| 900 | `oklch(0.315 0.088 117)` |
| 800 | `oklch(0.460 0.130 117)` |
| 700 | `oklch(0.595 0.170 117)` |
| 600 | `oklch(0.755 0.210 117)` |
| **500** | `var(--ref-secondary)` = `oklch(0.948 0.22 117)` (#E5FF00 seed) |
| 400 | `oklch(0.961 0.175 118)` |
| 300 | `oklch(0.971 0.128 118)` |
| 200 | `oklch(0.979 0.080 119)` |
| 100 | `oklch(0.987 0.040 119)` |
| 50 | `oklch(0.992 0.020 120)` |

### Tertiary (cyan) — seed at 500

| Step | OKLCH | sRGB equiv |
|---|---|---|
| 950 | `oklch(0.216 0.016 189)` | #111C1B |
| 900 | `oklch(0.293 0.031 192.3)` | #183130 |
| 800 | `oklch(0.446 0.062 193.7)` | #225F5E |
| 700 | `oklch(0.599 0.093 195)` | #259191 |
| 600 | `oklch(0.751 0.123 194.8)` | #21C6C6 |
| **500** | `var(--ref-tertiary)` = `oklch(0.905 0.155 194.8)` | #00FFFF (seed) |
| 400 | `oklch(0.925 0.118 194.6)` | #79FFFE |
| 300 | `oklch(0.944 0.085 194.9)` | #A7FFFE |
| 200 | `oklch(0.963 0.054 194.9)` | #C9FFFE |
| 100 | `oklch(0.982 0.026 193.8)` | #E6FFFE |
| 50 | `oklch(0.991 0.013 197)` | #F3FFFF |

### Status — Positive (green) — seed at 600

| Step | OKLCH | sRGB equiv |
|---|---|---|
| 950 | `oklch(0.31 0.069 151.9)` | #0E3A1E |
| 900 | `oklch(0.369 0.086 151.4)` | #124C27 |
| 800 | `oklch(0.481 0.118 151)` | #187039 |
| 700 | `oklch(0.593 0.152 150.2)` | #1E964A |
| **600** | `var(--ref-status-positive)` = `oklch(0.723 0.192 149.6)` | #22C55E (seed) |
| 500 | `oklch(0.782 0.2 150.2)` | #31DA6F |
| 400 | `oklch(0.806 0.168 152.6)` | #58DE89 |
| 300 | `oklch(0.837 0.132 154.6)` | #7EE3A3 |
| 200 | `oklch(0.878 0.095 156.1)` | #A3EABD |
| 100 | `oklch(0.921 0.056 157.9)` | #C7F1D7 |
| 50 | `oklch(0.945 0.038 157.4)` | #D9F5E3 |

### Status — Caution (amber) — seed at 500

| Step | OKLCH | sRGB equiv |
|---|---|---|
| 950 | `oklch(0.308 0.059 74.9)` | #412B07 |
| 900 | `oklch(0.366 0.072 73.7)` | #553809 |
| 800 | `oklch(0.478 0.098 72.9)` | #7E530B |
| 700 | `oklch(0.587 0.123 71.5)` | #A96E0B |
| 600 | `oklch(0.694 0.148 70.7)` | #D58A0B |
| **500** | `var(--ref-status-caution)` = `oklch(0.769 0.165 70.1)` | #F59E0B (seed) |
| 400 | `oklch(0.806 0.144 77.1)` | #F3B243 |
| 300 | `oklch(0.841 0.116 79.3)` | #F3C26F |
| 200 | `oklch(0.879 0.082 80.2)` | #F4D299 |
| 100 | `oklch(0.923 0.05 81)` | #F7E3C1 |
| 50 | `oklch(0.947 0.033 82)` | #F9ECD5 |

### Status — Negative (red) — seed at **400**

| Step | OKLCH | sRGB equiv |
|---|---|---|
| 950 | `oklch(0.243 0.08 25.5)` | #3E0A0A |
| 900 | `oklch(0.285 0.1 26.4)` | #510C0C |
| 800 | `oklch(0.372 0.139 27.3)` | #791010 |
| 700 | `oklch(0.455 0.176 28)` | #A21212 |
| 600 | `oklch(0.537 0.212 28.4)` | #CC1313 |
| 500 | `oklch(0.599 0.231 27.9)` | #EA2020 |
| **400** | `var(--ref-status-negative)` = `oklch(0.637 0.208 25.3)` | #EF4444 (seed) |
| 300 | `oklch(0.7 0.15 21.7)` | #ED7474 |
| 200 | `oklch(0.777 0.101 19.6)` | #F09C9C |
| 100 | `oklch(0.861 0.057 18.3)` | #F5C3C3 |
| 50 | `oklch(0.905 0.038 17.9)` | #F8D6D6 |

---

## −main overrides

The shared `system.css` maps every role's `-main` slot to ramp step 500. Because
FCM anchors three seeds off-500, those roles re-point `-main` to the seed step in
the theme block. (Secondary / tertiary / caution anchor at 500 → no override.)

| Token | Value | Resolves to |
|---|---|---|
| `--sys-colour-primary-main` | `var(--palette-primary-600)` | #05E466 brand green |
| `--sys-colour-positive-main` | `var(--palette-status-positive-600)` | #22C55E |
| `--sys-colour-negative-main` | `var(--palette-status-negative-400)` | #EF4444 |

---

## Container surfaces

FCM surfaces (Figma node 2634:4756) composite **two** layers in `background-image`:

1. **Dark near-black base** — `oklch(0.047 0 0 / 0.6)`, a slight lift above the
   black page (expressed as a flat gradient so it stacks in `background-image`).
2. **White vertical tint** — top `oklch(0.95)` → bottom `oklch(0.81)`, with the
   **alpha stepping by level** (this is what distinguishes L1/L2/L3).

The **border is a flat `oklch(0.95 0 0 / 0.08)` hairline, identical across all
three levels** — no gradient ring variation (COD:M varies its ring per level).

| Level | Tint alpha | Used by | Tokens |
|---|---|---|---|
| **L1** | 4% | SKU card | `--sys-colour-surface-l1-fill`, `--sys-colour-surface-l1-border`, `--sys-colour-surface-l1-border-hover` |
| **L2** | 8% | generic card, payment channel | `--sys-colour-surface-l2-fill`, `--sys-colour-surface-l2-border` |
| **L3** | 12% | sheet, category nav, popover | `--sys-colour-surface-l3-fill`, `--sys-colour-surface-l3-border` |

### Status surfaces

Top = role-700 (caution uses -600), bottom = role-950, both at **16%** alpha,
pulled from the FCM spectrum. **Success uses the brand primary green** (not
status-positive) so the selected SKU card and sign-in snackbar read on-brand.

| Token | Top → bottom |
|---|---|
| `--sys-colour-surface-success-fill` | `primary-700` → `primary-950` @ 16% |
| `--sys-colour-surface-warning-fill` | `status-caution-600` → `status-caution-950` @ 16% |
| `--sys-colour-surface-failure-fill` | `status-negative-700` → `status-negative-950` @ 16% |

---

## Semantic & effect overrides

Slots whose FCM value differs from the pure cascade, plus theme-only brand tokens
components consume directly.

| Token | Value | Reason |
|---|---|---|
| `--border-card-default` | `oklch(1 0 0 / 0.08)` | FCM neutral-soft is invisible on the black page → translucent white hairline |
| `--text-text-on-brand` | `var(--sys-colour-ink-inverse)` | Dark text on the bright-green CTA |
| `--bg-action-signin` | `oklch(0.62 0.22 27)` ≈ #F04040 | **EA brand red** sign-in button (COD:M uses black) |
| `--bg-action-inverse` | `var(--sys-colour-primary-main)` | FCM wants brand green for primary actions (semantics defaults to secondary/blue) |
| `--border-action-inverse` | `var(--sys-colour-primary-main)` | ditto |
| `--bg-tag-bonus` | `var(--palette-primary-950)` | BONUS / BEST VALUE tag — dark green fill (#064220) |
| `--text-tag-bonus` | `var(--palette-primary-50)` | pale-green tag text (#D4FAE4) |
| `--bg-loyalty-banner` | `var(--palette-primary-950)` | "You will earn N MP points" strip (#064220); COD:M's `checkout.loyalty` is null |
| `--checkout-loyalty-overlap` | `8px` | footer overlaps the loyalty ribbon by this much (depth layering) |
| `--rarity-gradient-*` (all 5) | `var(--sys-colour-surface-l2-fill)` | FCM has no rarity system — all rarity fills collapse to the L2 frosted tile |

### `html[data-theme="fcm"]` block (specificity-safe overrides)

These must live at specificity **(0,1,1)** to beat `:root` rules in the structural
tiers (`space.css`, `semantics.css`, `extensions.css`, `motion-sku.css`) that are
imported *after* the theme file and would otherwise win on source order. (Same
mechanism as COD:M's hyperlink remap — see `design-tokens-codm.md`.)

| Token / rule | FCM value | Note |
|---|---|---|
| `--gradient-bestseller-hero` | `var(--bg-sku-card-default)` | L1 surface, not COD:M's warm-orange |
| `--gradient-bestseller-hero-hover` | `var(--bg-sku-card-default)` | |
| `--gradient-bestseller-vignette` | `transparent` | |
| `--hdr-glow` | `oklch(0.803 0.225 149.2)` | primary green (conic lead/trail) |
| `--hdr-hot` | `oklch(0.948 0.22 117)` | secondary yellow-green (conic peak) |
| `--hdr-bloom` | `oklch(0.62 0.21 149)` | deep green halo behind the card |
| `--radius-control-full` | `var(--sys-radius-full)` | pill controls (999px) — overrides space.css 2px default |
| `--border-signin-btn` | `var(--sys-colour-primary-main)` | action green (COD:M uses white) |
| `.bundle__current` / `.bestseller__current` | `font-size: var(--sys-size-h5)` | equalize bundle + best-seller price to regular SKU (18px) |
| `.sku-card__amount` / `.bestseller__amount` | `font-size: var(--sys-size-h5)` | equalize all card amount sizes to 18px |
| `--text-hyperlink-default` | `var(--sys-colour-primary-main)` | **green** link default on dark bg |
| `--text-hyperlink-hover` / `-focused` | `var(--sys-colour-primary-strong)` | primary-500, brighter |
| `--text-hyperlink-pressed` | `var(--sys-colour-primary-heavy)` | primary-400 |
| `--text-hyperlink-inverse` | `var(--sys-colour-neutral-inverse)` | near-white — links on coloured/brand surfaces |

> The card font-size overrides target the element class (not `--sys-size-h2/h4`)
> so PlayerCard names, SignInSheet, and StoryCarousel headings stay unaffected.
> Specificity (0,1,1) beats the `.text-style-*` class rule (0,1,0) and the scoped
> component rule (0,2,0).

---

## HDR overrides

Applied under `@media (dynamic-range: high)` on `html[data-theme="fcm"]`. The
primary green seed (#05E466 at C 0.225) already clips slightly outside sRGB; on a
P3 panel it holds higher chroma and reads vivid rather than clipped. OKLCH L is
pushed past 1.0 on the hairline so the flat ring genuinely glints (the same effect
COD:M's gradient ring achieves, done here with a single bright colour).

| Token | HDR value |
|---|---|
| `--ref-primary` | `oklch(0.820 0.270 149.2)` (full P3 green) |
| `--ref-secondary` | `oklch(0.960 0.26 117)` (wider chroma) |
| `--ref-tertiary` | `oklch(0.920 0.185 194.8)` (wider chroma) |
| `--sys-colour-surface-l1-border` / `-l2-border` / `-l3-border` | `oklch(1.1 0 0 / 0.10)` |
| `--sys-colour-surface-l1-border-hover` | `oklch(1.1 0 0 / 0.20)` |
| `--hdr-glow` | `oklch(0.820 0.270 149.2)` |
| `--hdr-hot` | `oklch(0.960 0.26 117)` |
| `--hdr-bloom` | `oklch(0.70 0.26 149)` |

---

## Typography tokens (themed)

FCM ships **Cruyff Sans** (the EA SPORTS FC Mobile brand face) in three real
`woff2` cuts: Regular 400, Medium 500, Bold 700. There is **no Semibold (600) or
ExtraBold (800) cut**, so the weight tokens remap those roles onto the available
cuts to keep every weight a genuine cut (no faux-bold synthesis).

| Token | FCM value | Note |
|---|---|---|
| `--sys-font-family-heading/body` | `'Cruyff Sans', 'Inter', system-ui, sans-serif` | |
| `--sys-weight-extra-bold` | 700 | Bold (no ExtraBold cut) — micro-bold badges |
| `--sys-weight-bold` | **500** | Medium → headings; approximates Figma Semibold (Bold 700 read too heavy) |
| `--sys-weight-semibold` | 500 | Medium (no Semibold cut) — micro text |
| `--sys-weight-regular` | 400 | Regular — body |
| `--sys-size-h1…h7` | 28 / 24 / 22 / 20 / 18 / 16 / 14 px | matches Figma scale |
| `--sys-size-body-l/main/s/xs` | 16 / 14 / 12 / 10 px | |
| `--sys-letter-spacing-tight/narrow/main/loose/wide` | −0.005 / −0.002 / 0 / 0.005 / 0.01 em | **no Hitmarker comp** — Cruyff Sans is correctly proportioned |
| `--sys-line-height-main/loose/wide` | 1 / 1.2 / 1.5 | |
| `--sys-font-condense` | **1** | no condense hack (COD:M = 0.82) |

> **Restoring 600/800:** add the real Semibold/ExtraBold faces to the `@font-face`
> block at the top of `fcm.css` and restore `--sys-weight-bold: 700` /
> `--sys-weight-semibold: 600`. Consider splitting out a dedicated heading-weight
> token if headings and a real bold need to differ.

### Export bugs fixed on import

The Figma export (`EA SPORTS FC™ Mobile Tokens.css`) carried three bugs corrected
on the way in:

- Font weights had `px` units (`700px`) → made unitless via `--sys-weight-*`.
- Letter-spacing was authored in `%` (invalid CSS) → converted to `em`.
- Opaque `fill` tokens and collapsed responsive `--sys-dimension-*` modes were
  dropped — those live in the shared structural tiers, not the theme.

---

**Last updated:** June 2026 · FC Mobile Web Store theme (prototype v0.9.1)

**v0.64.0 note:** every token named in this doc was renamed with an `--x-` prefix
as part of the prod token-structure reconciliation (`docs/token-reconcile.md`).
Names below are pre-rename — a follow-up pass should update every reference.
