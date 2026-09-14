# Design Token Values — COD:M Web Store

Reference for the COD:M theme palette. All colours are authored in **OKLCH**
(perceptual, P3/wide-gamut headroom). sRGB hex equivalents are provided for
reference only — the live values are OKLCH.

Token source: `src/tokens/ds/themes/codm.css`  
System structure: `src/tokens/ds/` (see `component-breakdown.md` for the full cascade)

---

## Seeds

The 7 raw brand anchors. Every spectrum ramp and semantic colour derives from
these. To retune the palette, change a seed here — the cascade resolves
automatically downstream.

| Token | OKLCH | sRGB equiv | Role |
|---|---|---|---|
| `--ref-primary` | `oklch(0.919 0.192 101.8)` | #FFE700 | Brand yellow — prices, CTAs, active states |
| `--ref-secondary` | `oklch(0.916 0.115 196.7)` | #79FBFD | Cyan accent — hyperlinks, secondary actions |
| `--ref-tertiary` | `oklch(0.680 0.289 324.1)` | #E834F9 | Magenta — highlighted states |
| `--ref-status-positive` | `oklch(0.880 0.246 138.2)` | #79FB40 | Green — success, discounts |
| `--ref-status-caution` | `oklch(0.743 0.142 66.8)` | #E79839 | Amber — warnings |
| `--ref-status-negative` | `oklch(0.619 0.209 28.5)` | #E93E33 | Red — errors, badges |
| `--ref-neutral` | `oklch(0.166 0.017 273.5)` | #0C0E16 | Page black — base of the neutral ramp |

---

## Spectrum ramps

Each ramp runs from 950 (darkest) to 50 (lightest). The **500 step aliases its
seed** so a seed change re-anchors the ramp mid-point.

### Neutral

Anchored to the prototype greys — these values are the known-correct UI greys.

| Step | OKLCH | sRGB equiv | Notes |
|---|---|---|---|
| 1000 | `oklch(0.166 0.017 273.5)` | #0C0E16 | Page background |
| 950 | `oklch(0.241 0.012 278.0)` | #1E1F25 | Panel / navbar |
| 900 | `oklch(0.310 0.011 271.0)` | #2E3036 | Container / divider |
| 800 | `oklch(0.377 0.010 278.3)` | #404147 | Floating surfaces / indicators |
| 700 | `oklch(0.447 0.008 277.0)` | #535459 | |
| 600 | `oklch(0.515 0.008 277.0)` | #66676C | |
| 500 | `oklch(0.584 0.008 277.1)` | #7A7B80 | Ink subtle |
| 400 | `oklch(0.651 0.007 277.1)` | #8E8F94 | |
| 300 | `oklch(0.719 0.006 274.9)` | #A3A4A8 | Ink soft / body-soft |
| 200 | `oklch(0.786 0.006 274.9)` | #B8B9BD | |
| 100 | `oklch(0.855 0.004 271.4)` | #CECFD2 | |
| 50 | `oklch(0.923 0.004 286.3)` | #E5E5E8 | Neutral inverse |
| 0 | `oklch(0.992 0.003 286.4)` | #FCFCFE | Header / ink main |

### Primary (yellow)

| Step | OKLCH |
|---|---|
| 950 | `oklch(0.217 0.027 98.3)` |
| 900 | `oklch(0.295 0.043 99.0)` |
| 800 | `oklch(0.450 0.081 99.9)` |
| 700 | `oklch(0.606 0.119 100.6)` |
| 600 | `oklch(0.763 0.156 101.5)` |
| **500** | `var(--ref-primary)` = `oklch(0.919 0.192 101.8)` |
| 400 | `oklch(0.930 0.164 101.5)` |
| 300 | `oklch(0.945 0.129 101.4)` |
| 200 | `oklch(0.962 0.089 101.0)` |
| 100 | `oklch(0.980 0.046 100.5)` |
| 50 | `oklch(0.989 0.022 98.6)` |

### Secondary (cyan)

| Step | OKLCH |
|---|---|
| 950 | `oklch(0.215 0.010 196.4)` |
| 900 | `oklch(0.294 0.024 195.9)` |
| 800 | `oklch(0.449 0.046 197.7)` |
| 700 | `oklch(0.606 0.069 195.5)` |
| 600 | `oklch(0.759 0.091 197.2)` |
| **500** | `var(--ref-secondary)` = `oklch(0.916 0.115 196.7)` |
| 400 | `oklch(0.932 0.092 196.5)` |
| 300 | `oklch(0.949 0.068 197.2)` |
| 200 | `oklch(0.966 0.046 196.4)` |
| 100 | `oklch(0.984 0.023 196.8)` |
| 50 | `oklch(0.992 0.012 197.0)` |

### Tertiary (magenta)

| Step | OKLCH |
|---|---|
| 950 | `oklch(0.191 0.030 326.7)` |
| 900 | `oklch(0.246 0.058 324.3)` |
| 800 | `oklch(0.354 0.117 324.3)` |
| 700 | `oklch(0.463 0.174 324.1)` |
| 600 | `oklch(0.571 0.231 324.0)` |
| **500** | `var(--ref-tertiary)` = `oklch(0.680 0.289 324.1)` |
| 400 | `oklch(0.743 0.232 324.8)` |
| 300 | `oklch(0.806 0.174 325.0)` |
| 200 | `oklch(0.871 0.116 325.5)` |
| 100 | `oklch(0.936 0.058 326.0)` |
| 50 | `oklch(0.967 0.029 325.8)` |

### Status — Positive (green)

| Step | OKLCH |
|---|---|
| 950 | `oklch(0.211 0.027 131.4)` |
| 900 | `oklch(0.286 0.050 135.6)` |
| 800 | `oklch(0.434 0.100 136.6)` |
| 700 | `oklch(0.584 0.150 137.5)` |
| 600 | `oklch(0.731 0.197 137.8)` |
| **500** | `var(--ref-status-positive)` = `oklch(0.880 0.246 138.2)` |
| 400 | `oklch(0.904 0.201 136.8)` |
| 300 | `oklch(0.927 0.153 135.4)` |
| 200 | `oklch(0.951 0.104 134.4)` |
| 100 | `oklch(0.976 0.051 132.8)` |
| 50 | `oklch(0.987 0.026 133.0)` |

### Status — Caution (amber)

| Step | OKLCH |
|---|---|
| 950 | `oklch(0.199 0.021 69.4)` |
| 900 | `oklch(0.259 0.031 67.8)` |
| 800 | `oklch(0.381 0.060 67.1)` |
| 700 | `oklch(0.502 0.088 67.2)` |
| 600 | `oklch(0.623 0.115 66.9)` |
| **500** | `var(--ref-status-caution)` = `oklch(0.743 0.142 66.8)` |
| 400 | `oklch(0.794 0.121 66.9)` |
| 300 | `oklch(0.846 0.096 65.4)` |
| 200 | `oklch(0.898 0.067 65.3)` |
| 100 | `oklch(0.949 0.034 64.6)` |
| 50 | `oklch(0.973 0.017 62.0)` |

### Status — Negative (red)

| Step | OKLCH | Notes |
|---|---|---|
| 950 | `oklch(0.184 0.029 42.9)` | Badge background |
| 900 | `oklch(0.234 0.045 31.7)` | |
| 800 | `oklch(0.332 0.086 30.3)` | |
| 700 | `oklch(0.427 0.127 29.0)` | Bonus / Loyalty pill bg |
| 600 | `oklch(0.524 0.168 29.0)` | |
| **500** | `var(--ref-status-negative)` = `oklch(0.619 0.209 28.5)` | |
| 400 | `oklch(0.695 0.172 30.0)` | |
| 300 | `oklch(0.771 0.134 30.4)` | |
| 200 | `oklch(0.843 0.087 31.3)` | |
| 100 | `oklch(0.919 0.042 32.6)` | |
| 50 | `oklch(0.959 0.020 32.5)` | Pill text |

---

## COD:M semantic overrides

These semantic tokens are overridden in the COD:M theme to match accurate values
that don't fall cleanly on a spectrum step.

| Token | Value | Reason |
|---|---|---|
| `--border-card-default` | `oklch(0.992 0.003 286 / 0.08)` | Translucent white hairline |
| `--bg-tag-error` | `oklch(0.182 0.023 29.1)` | Discount badge background (#1B0E0C) |
| `--text-error-default` | `oklch(0.632 0.205 25.8)` | Discount badge text (#EC4442) |
| `--text-text-on-brand` | `oklch(0.142 0.011 284.9)` | Text on the yellow CTA (#09090E). Alias corrected v0.22.0: `--sys-colour-ink-heavy` → `--sys-colour-ink-inverse` in `semantics.css` base. |
| `--text-on-action-secondary` | `oklch(0.992 0.003 286.4)` | Text on secondary/frosted action button surface (near-white). Added v0.22.0. |
| `--text-on-action-tertiary` | `oklch(0.992 0.003 286.4)` | Text on tertiary/ghost action button on dark surface (near-white). Added v0.22.0. Used by NavBar "SIGN IN" label. |
| `--bg-overlay` | `var(--palette-neutral-1000)` | Solid page colour (blur applied at use) |
| `--bg-action-signin` | `oklch(0 0 0)` | Black fill for "Sign in with COD:M" button |
| `--text-web-bonus-codashop` | `oklch(0.78 0.155 297)` | Purple bonus amount |
| `--text-web-bonus-cp` | `oklch(0.78 0.135 260)` | Blue CP bonus amount |
| `--text-bonus-amount` | `var(--palette-primary-400)` = `oklch(0.930 0.164 101.5)` | Bonus breakdown amount — bright warm yellow, one step lighter (400) than the CTA yellow (500). Applied to `.sku-card__bonus-amount`, `.bestseller__bonus-amount`. Keeps the bonus visible while the CTA remains the strongest yellow on the card. |

### Hyperlink family remap (v0.9.0)

The `--text-hyperlink-*` family is remapped for COD:M so yellow is the default
link colour on dark backgrounds (not the inverse). Defined in a separate
`html[data-theme="codm"]` block for **higher specificity** (0,1,1) than
`semantics.css` `:root` (0,1,0) — required because `semantics.css` is imported
after the theme file, and equal-specificity rules resolve by source order.

| Token | COD:M value | Note |
|---|---|---|
| `--text-hyperlink-default` | `var(--sys-colour-primary-main)` | **#FFE700 yellow** — use on dark bg |
| `--text-hyperlink-hover` | `var(--sys-colour-primary-strong)` | Lighter yellow |
| `--text-hyperlink-focused` | `var(--sys-colour-primary-strong)` | Lighter yellow |
| `--text-hyperlink-pressed` | `var(--sys-colour-primary-heavy)` | Even lighter yellow |
| `--text-hyperlink-inverse` | `var(--sys-colour-neutral-inverse)` | Near-white — for links on brand/coloured surfaces |

**Rule:** always use `--text-hyperlink-default` for yellow links in components.
`--text-hyperlink-inverse` is reserved for links on coloured/brand backgrounds.

---

## HDR overrides

Applied under `@media (dynamic-range: high)` in `themes/codm.css`. OKLCH L pushed
past 1.0 for a genuine glint on wide-gamut panels.

| Token | HDR value |
|---|---|
| `--border-sku-card-default` | gradient with L up to 1.2 |
| `--border-sku-card-hover` | gradient with L up to 1.3 |
| `--text-web-bonus-codashop` | `oklch(0.85 0.17 297)` |
| `--text-web-bonus-cp` | `oklch(0.85 0.15 260)` |
| `--gloss-sheen` (extensions) | `oklch(1.3 0 0 / 0.8)` |

---

## Typography tokens (themed)

| Token | COD:M value |
|---|---|
| `--sys-font-family-heading` | `'Hitmarker Text VF', sans-serif` |
| `--sys-font-family-body` | `'Inter', sans-serif` (settled body pairing — was an eval toggle between Hitmarker/Barlow/Inter, removed v0.46.0) |
| `--sys-weight-extra-bold/bold/semibold/regular` | 800 / 700 / 600 / 400 |
| `--sys-size-h1…h7` | 28 / 24 / 22 / 20 / 18 / 16 / 14 px |
| `--sys-size-body-l/main/s/xs` | 16 / 14 / 12 / 10 px |
| `--sys-letter-spacing-tight/narrow/main/loose/wide` | -0.005 / -0.002 / 0 / 0.00525 / 0.0105 em |
| `--sys-line-height-main/loose/wide` | 1 / 1.2 / 1.5 |
| `--sys-font-condense` | 0.82 (heading only — `--sys-font-condense-body: 1`, Inter is not condensed) |

`loose` and `wide` tracking carry a +5% Hitmarker compensation over their nominal values (the static font cut sits tighter than the Figma variable font). This compensation is zeroed for body text (`--sys-letter-spacing-body-base: 0`) since Inter needs no correction.

---

**Last updated:** July 2026 · COD:M Web Store prototype v0.46.0

**v0.64.0 note:** every token named in this doc was renamed with an `--x-` prefix
as part of the prod token-structure reconciliation (`docs/token-reconcile.md`).
Names below are pre-rename — a follow-up pass should update every reference.
