# COD:M Web Store — Colour Tokens

Extracted from `src/tokens/ds/themes/codm.css` (theme source), with semantic
overrides cross-referenced from `docs/design-tokens-codm.md`. All colours are
authored in **OKLCH**; sRGB hex equivalents are given where noted in source
comments.

| Token | OKLCH value | sRGB equiv | Category | Notes |
|---|---|---|---|---|
| `--ref-primary` | `oklch(0.919 0.192 101.8)` | #FFE700 | Seed | Brand yellow — prices, CTAs, active states |
| `--ref-secondary` | `oklch(0.916 0.115 196.7)` | #79FBFD | Seed | Cyan accent — hyperlinks, secondary actions |
| `--ref-tertiary` | `oklch(0.680 0.289 324.1)` | #E834F9 | Seed | Magenta — highlighted states |
| `--ref-status-positive` | `oklch(0.880 0.246 138.2)` | #79FB40 | Seed | Green — success, discounts |
| `--ref-status-caution` | `oklch(0.743 0.142 66.8)` | #E79839 | Seed | Amber — warnings |
| `--ref-status-negative` | `oklch(0.619 0.209 28.5)` | #E93E33 | Seed | Red — errors, badges |
| `--ref-neutral` | `oklch(0.166 0.017 273.5)` | #0C0E16 | Seed | Page black — base of neutral ramp |
| `--palette-primary-950` | `oklch(0.217 0.027 98.3)` | — | Primary ramp | |
| `--palette-primary-900` | `oklch(0.295 0.043 99.0)` | — | Primary ramp | |
| `--palette-primary-800` | `oklch(0.450 0.081 99.9)` | — | Primary ramp | |
| `--palette-primary-700` | `oklch(0.606 0.119 100.6)` | — | Primary ramp | |
| `--palette-primary-600` | `oklch(0.763 0.156 101.5)` | — | Primary ramp | |
| `--palette-primary-500` | `var(--ref-primary)` | #FFE700 | Primary ramp | Aliases seed |
| `--palette-primary-400` | `oklch(0.930 0.164 101.5)` | — | Primary ramp | Used for `--text-bonus-amount` |
| `--palette-primary-300` | `oklch(0.945 0.129 101.4)` | — | Primary ramp | |
| `--palette-primary-200` | `oklch(0.962 0.089 101.0)` | — | Primary ramp | |
| `--palette-primary-100` | `oklch(0.980 0.046 100.5)` | — | Primary ramp | |
| `--palette-primary-50` | `oklch(0.989 0.022 98.6)` | — | Primary ramp | |
| `--palette-secondary-950` | `oklch(0.215 0.010 196.4)` | — | Secondary ramp | |
| `--palette-secondary-900` | `oklch(0.294 0.024 195.9)` | — | Secondary ramp | |
| `--palette-secondary-800` | `oklch(0.449 0.046 197.7)` | — | Secondary ramp | |
| `--palette-secondary-700` | `oklch(0.606 0.069 195.5)` | — | Secondary ramp | |
| `--palette-secondary-600` | `oklch(0.759 0.091 197.2)` | — | Secondary ramp | |
| `--palette-secondary-500` | `var(--ref-secondary)` | #79FBFD | Secondary ramp | Aliases seed |
| `--palette-secondary-400` | `oklch(0.932 0.092 196.5)` | — | Secondary ramp | |
| `--palette-secondary-300` | `oklch(0.949 0.068 197.2)` | — | Secondary ramp | |
| `--palette-secondary-200` | `oklch(0.966 0.046 196.4)` | — | Secondary ramp | |
| `--palette-secondary-100` | `oklch(0.984 0.023 196.8)` | — | Secondary ramp | |
| `--palette-secondary-50` | `oklch(0.992 0.012 197.0)` | — | Secondary ramp | |
| `--palette-tertiary-950` | `oklch(0.191 0.030 326.7)` | — | Tertiary ramp | |
| `--palette-tertiary-900` | `oklch(0.246 0.058 324.3)` | — | Tertiary ramp | |
| `--palette-tertiary-800` | `oklch(0.354 0.117 324.3)` | — | Tertiary ramp | |
| `--palette-tertiary-700` | `oklch(0.463 0.174 324.1)` | — | Tertiary ramp | |
| `--palette-tertiary-600` | `oklch(0.571 0.231 324.0)` | — | Tertiary ramp | |
| `--palette-tertiary-500` | `var(--ref-tertiary)` | #E834F9 | Tertiary ramp | Aliases seed |
| `--palette-tertiary-400` | `oklch(0.743 0.232 324.8)` | — | Tertiary ramp | |
| `--palette-tertiary-300` | `oklch(0.806 0.174 325.0)` | — | Tertiary ramp | |
| `--palette-tertiary-200` | `oklch(0.871 0.116 325.5)` | — | Tertiary ramp | |
| `--palette-tertiary-100` | `oklch(0.936 0.058 326.0)` | — | Tertiary ramp | |
| `--palette-tertiary-50` | `oklch(0.967 0.029 325.8)` | — | Tertiary ramp | |
| `--palette-neutral-1000` | `var(--ref-neutral)` | #0C0E16 | Neutral ramp | Page background |
| `--palette-neutral-950` | `oklch(0.241 0.012 278.0)` | #1E1F25 | Neutral ramp | Panel / navbar |
| `--palette-neutral-900` | `oklch(0.310 0.011 271.0)` | #2E3036 | Neutral ramp | Container / divider |
| `--palette-neutral-800` | `oklch(0.377 0.010 278.3)` | #404147 | Neutral ramp | Floating surfaces / indicators |
| `--palette-neutral-700` | `oklch(0.447 0.008 277.0)` | #535459 | Neutral ramp | |
| `--palette-neutral-600` | `oklch(0.515 0.008 277.0)` | #66676C | Neutral ramp | |
| `--palette-neutral-500` | `oklch(0.584 0.008 277.1)` | #7A7B80 | Neutral ramp | Ink subtle |
| `--palette-neutral-400` | `oklch(0.651 0.007 277.1)` | #8E8F94 | Neutral ramp | |
| `--palette-neutral-300` | `oklch(0.719 0.006 274.9)` | #A3A4A8 | Neutral ramp | Ink soft / body-soft |
| `--palette-neutral-200` | `oklch(0.786 0.006 274.9)` | #B8B9BD | Neutral ramp | |
| `--palette-neutral-100` | `oklch(0.855 0.004 271.4)` | #CECFD2 | Neutral ramp | |
| `--palette-neutral-50` | `oklch(0.923 0.004 286.3)` | #E5E5E8 | Neutral ramp | Neutral inverse |
| `--palette-neutral-0` | `oklch(0.992 0.003 286.4)` | #FCFCFE | Neutral ramp | Header / ink main |
| `--palette-status-positive-950` | `oklch(0.211 0.027 131.4)` | — | Status: positive ramp | |
| `--palette-status-positive-900` | `oklch(0.286 0.050 135.6)` | — | Status: positive ramp | |
| `--palette-status-positive-800` | `oklch(0.434 0.100 136.6)` | — | Status: positive ramp | |
| `--palette-status-positive-700` | `oklch(0.584 0.150 137.5)` | — | Status: positive ramp | |
| `--palette-status-positive-600` | `oklch(0.731 0.197 137.8)` | — | Status: positive ramp | |
| `--palette-status-positive-500` | `var(--ref-status-positive)` | #79FB40 | Status: positive ramp | Aliases seed |
| `--palette-status-positive-400` | `oklch(0.904 0.201 136.8)` | — | Status: positive ramp | |
| `--palette-status-positive-300` | `oklch(0.927 0.153 135.4)` | — | Status: positive ramp | |
| `--palette-status-positive-200` | `oklch(0.951 0.104 134.4)` | — | Status: positive ramp | |
| `--palette-status-positive-100` | `oklch(0.976 0.051 132.8)` | — | Status: positive ramp | |
| `--palette-status-positive-50` | `oklch(0.987 0.026 133.0)` | #F4FFED | Status: positive ramp | Snackbar copy |
| `--palette-status-caution-950` | `oklch(0.199 0.021 69.4)` | — | Status: caution ramp | |
| `--palette-status-caution-900` | `oklch(0.259 0.031 67.8)` | — | Status: caution ramp | |
| `--palette-status-caution-800` | `oklch(0.381 0.060 67.1)` | — | Status: caution ramp | |
| `--palette-status-caution-700` | `oklch(0.502 0.088 67.2)` | — | Status: caution ramp | |
| `--palette-status-caution-600` | `oklch(0.623 0.115 66.9)` | — | Status: caution ramp | |
| `--palette-status-caution-500` | `var(--ref-status-caution)` | #E79839 | Status: caution ramp | Aliases seed |
| `--palette-status-caution-400` | `oklch(0.794 0.121 66.9)` | — | Status: caution ramp | |
| `--palette-status-caution-300` | `oklch(0.846 0.096 65.4)` | — | Status: caution ramp | |
| `--palette-status-caution-200` | `oklch(0.898 0.067 65.3)` | — | Status: caution ramp | |
| `--palette-status-caution-100` | `oklch(0.949 0.034 64.6)` | — | Status: caution ramp | |
| `--palette-status-caution-50` | `oklch(0.973 0.017 62.0)` | — | Status: caution ramp | |
| `--palette-status-negative-950` | `oklch(0.184 0.029 42.9)` | #1D0E08 | Status: negative ramp | ≈ badge/tag background |
| `--palette-status-negative-900` | `oklch(0.234 0.045 31.7)` | — | Status: negative ramp | |
| `--palette-status-negative-800` | `oklch(0.332 0.086 30.3)` | — | Status: negative ramp | |
| `--palette-status-negative-700` | `oklch(0.427 0.127 29.0)` | #872B22 | Status: negative ramp | Bonus / Loyalty pill background |
| `--palette-status-negative-600` | `oklch(0.524 0.168 29.0)` | — | Status: negative ramp | |
| `--palette-status-negative-500` | `var(--ref-status-negative)` | #E93E33 | Status: negative ramp | Aliases seed |
| `--palette-status-negative-400` | `oklch(0.695 0.172 30.0)` | — | Status: negative ramp | |
| `--palette-status-negative-300` | `oklch(0.771 0.134 30.4)` | — | Status: negative ramp | |
| `--palette-status-negative-200` | `oklch(0.843 0.087 31.3)` | — | Status: negative ramp | |
| `--palette-status-negative-100` | `oklch(0.919 0.042 32.6)` | — | Status: negative ramp | |
| `--palette-status-negative-50` | `oklch(0.959 0.020 32.5)` | #FFEDE9 | Status: negative ramp | Pill text |
| `--border-card-default` | `oklch(0.992 0.003 286 / 0.08)` | — | Semantic override | Translucent white hairline |
| `--bg-action-signin` | `oklch(0 0 0)` | #000000 | Semantic override | "Sign in with COD:M" button fill |
| `--bg-tag-error` | `oklch(0.182 0.023 29.1)` | #1B0E0C | Semantic override | Discount badge background |
| `--text-error-default` | `oklch(0.632 0.205 25.8)` | #EC4442 | Semantic override | Discount badge text |
| `--text-text-on-brand` | `oklch(0.142 0.011 284.9)` | #09090E | Semantic override | Text on yellow CTA |
| `--text-on-action-secondary` | `oklch(0.992 0.003 286.4)` | — | Semantic override | Text on secondary/frosted action button (near-white) |
| `--text-on-action-tertiary` | `oklch(0.992 0.003 286.4)` | — | Semantic override | Text on tertiary/ghost action button; used by NavBar "SIGN IN" |
| `--bg-overlay` | `var(--palette-neutral-1000)` | #0C0E16 | Semantic override | Solid page colour (blur applied at use) |
| `--text-web-bonus-codashop` | `oklch(0.78 0.155 297)` | — | Semantic override | Purple bonus amount (Codashop) |
| `--text-web-bonus-cp` | `oklch(0.78 0.135 260)` | — | Semantic override | Blue bonus amount (CP) |
| `--text-bonus-amount` | `var(--palette-primary-400)` | — | Semantic override | Bonus breakdown amount — bright warm yellow |
| `--sys-colour-hyperlink-inverse` | `var(--sys-colour-neutral-inverse)` | — | Hyperlink remap | Near-white — links on brand/coloured surfaces |
| `--text-hyperlink-default` | `var(--sys-colour-primary-main)` | #FFE700 | Hyperlink remap | Default yellow link on dark bg |
| `--text-hyperlink-hover` | `var(--sys-colour-primary-strong)` | — | Hyperlink remap | Lighter yellow |
| `--text-hyperlink-focused` | `var(--sys-colour-primary-strong)` | — | Hyperlink remap | Lighter yellow |
| `--text-hyperlink-pressed` | `var(--sys-colour-primary-heavy)` | — | Hyperlink remap | Even lighter yellow |

## HDR overrides (`@media (dynamic-range: high)`)

| Token | HDR value | Notes |
|---|---|---|
| `--sys-colour-surface-l1-border` | gradient, L up to 1.2 | Wide-gamut border glint |
| `--sys-colour-surface-l1-border-hover` | gradient, L up to 1.3 | Wide-gamut border glint (hover) |
| `--text-web-bonus-codashop` | `oklch(0.85 0.17 297)` | HDR-boosted purple |
| `--text-web-bonus-cp` | `oklch(0.85 0.15 260)` | HDR-boosted blue |
| `--gloss-sheen` (extensions) | `oklch(1.3 0 0 / 0.8)` | Sheen highlight |

---

Source: `src/tokens/ds/themes/codm.css`, cross-referenced against `docs/design-tokens-codm.md`.
Last updated: July 2026 · COD:M Web Store prototype v0.46.0

**v0.64.0 note:** every token named in this doc was renamed with an `--x-` prefix
(e.g. `--sys-colour-primary-main` → `--x-sys-colour-primary-main`) as part of the
prod token-structure reconciliation (`docs/token-reconcile.md`). Names below are
pre-rename — a follow-up pass should update every reference.
