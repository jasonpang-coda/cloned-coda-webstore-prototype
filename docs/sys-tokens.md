# System (`--sys-*`) Tokens

Theme-agnostic tier (`:root`). Defined in [`system.css`](../src/tokens/ds/system.css) (colour/effects) and [`space.css`](../src/tokens/ds/space.css) (spacing/size/radius/stroke/elevation/dimension). Components never consume these directly — they only ever read the semantic tier (`semantics.css`), which aliases `--sys-*` down.

`--sys-colour-*` and `--sys-effect-*` reference `--palette-*` / `--ref-*` from the active theme, so they resolve per `[data-theme]`. `--sys-space-*`, `--sys-radius-*`, etc. are plain primitives (px values), theme-agnostic.

## Colour — Surfaces

| Token | Value |
|---|---|
| `--sys-colour-surface-page` | `--palette-neutral-1000` |
| `--sys-colour-surface-container` | `--palette-neutral-900` |
| `--sys-colour-surface-panel` | `--palette-neutral-950` |
| `--sys-colour-surface-floating` | `--palette-neutral-800` |
| `--sys-colour-surface-inverse` | `--palette-neutral-0` |
| `--sys-colour-surface-overlay` | `--palette-neutral-1000` @ 60% |

## Colour — Elevation surfaces (L1/L2/L3)

Composite gradient/border defaults; stores override from `html[data-theme]`. Consumed only via semantics (`--bg-sku-card-default` = L1, `--bg-card-default`/`--bg-nav`/`--bg-sheet` = L2, `--border-sheet` = L3 border).

| Token | Role |
|---|---|
| `--sys-colour-surface-l1-fill` | L1 radial-gradient fill |
| `--sys-colour-surface-l1-border` | L1 linear-gradient border |
| `--sys-colour-surface-l1-border-hover` | L1 border, hover state |
| `--sys-colour-surface-l2-fill` | L2 linear-gradient fill |
| `--sys-colour-surface-l2-border` | L2 flat border `oklch(1 0 0 / 0.12)` |
| `--sys-colour-surface-l3-fill` | L3 linear-gradient fill |
| `--sys-colour-surface-l3-border` | L3 flat border `oklch(1 0 0 / 0.16)` |

## Colour — Status surfaces

Gradient fills built from the active theme's `--palette-status-*` ramp (top = role-700/-600 for warning, bottom = role-950, both @16%).

| Token |
|---|
| `--sys-colour-surface-success-fill` |
| `--sys-colour-surface-warning-fill` |
| `--sys-colour-surface-failure-fill` |

## Colour — Role ramps

Each role ramp follows the same 6-step pattern: `subtle → soft → main → strong → heavy → inverse`, aliasing `--palette-<role>-{950,700,500,400,300,50}`.

| Role | Subtle | Soft | Main | Strong | Heavy | Inverse |
|---|---|---|---|---|---|---|
| `primary` | 950 | 700 | 500 | 400 | 300 | 50 |
| `secondary` | 950 | 700 | 500 | 400 | 300 | 50 |
| `tertiary` | 950 | 700 | 500 | 400 | 300 | 50 |
| `neutral` | 950 | 900 | 800 | 700 | 600 | 50 |
| `positive` (status) | 950 | 700 | 500 | 400 | 300 | 50 |
| `caution` (status) | 950 | 700 | 500 | 400 | 300 | 50 |
| `negative` (status) | 950 | 700 | 500 | 400 | 300 | 50 |

i.e. `--sys-colour-<role>-<step>`, e.g. `--sys-colour-primary-main`, `--sys-colour-negative-heavy`.

### Alias roles (sys → sys, not palette)

| Token | Points at |
|---|---|
| `--sys-colour-hyperlink-main/strong/heavy` | `--sys-colour-primary-*` |
| `--sys-colour-hyperlink-inverse` | `--sys-colour-secondary-main` |
| `--sys-colour-bonus-subtle` | `--sys-colour-primary-subtle` (chip bg) |
| `--sys-colour-bonus-strong` | `--sys-colour-primary-strong` (+N amount) |
| `--sys-colour-bonus-inverse` | `--sys-colour-primary-inverse` (chip text) |

A theme can repoint an alias role at the system tier to recolour every consumer at once (e.g. bonus chips) without touching palette.

## Colour — Fills (overlay tints)

| Token | Value |
|---|---|
| `--sys-colour-fill-main-subtle` | `oklch(0 0 0 / 0.10)` |
| `--sys-colour-fill-main-strong` | `oklch(0 0 0 / 0.20)` |
| `--sys-colour-fill-inverse-subtle` | `oklch(1 0 0 / 0.10)` |
| `--sys-colour-fill-inverse-strong` | `oklch(1 0 0 / 0.20)` |

## Colour — Ink (text) ramp

| Token | Value |
|---|---|
| `--sys-colour-ink-subtle` | `--palette-neutral-500` |
| `--sys-colour-ink-soft` | `--palette-neutral-300` |
| `--sys-colour-ink-main` / `-strong` / `-heavy` | `--palette-neutral-0` |
| `--sys-colour-ink-inverse` | `--palette-neutral-950` |

## Effects — Shadow tints (darkest step @30%)

`--sys-effect-shadow-{primary,secondary,tertiary,neutral,positive,caution,negative}` — each is the role's darkest palette step (950, or 1000 for neutral) mixed to 30% opacity.

## Effects — Glows (seed hue @25%)

`--sys-effect-glow-{primary,secondary,tertiary,positive,caution,negative}` — each is `--ref-<role>` mixed to 25% opacity. `--sys-effect-glow-neutral` is a flat `oklch(0 0 0 / 0.25)`.

---

## Space scale

`--sys-space-{0,xxxs,xxs,xs,s,main,l,xl,xxl,xxxl}` → `0 / 1 / 2 / 4 / 8 / 12 / 16 / 24 / 32 / 48px`

## Radius scale

`--sys-radius-{0,xxs,xs,s,m,l,xl,xxl,full}` → `0 / 2 / 4 / 8 / 12 / 12 / 12 / 12 / 999px`
(m/l/xl/xxl all flatten to 12px — no further step above `m` in the current scale.)

## Control sizes

`--sys-size-control-{xxxs,xxs,xs,s,m,l,xl,xxl}` → `16 / 24 / 32 / 40 / 48 / 56 / 64 / 72px`

## Generic sizes

`--sys-size-{xxxxs,xxxs,xxs,xs,s,m,l,xl,xxl,xxxl}` → `8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96 / 128px`

## Strokes

`--sys-stroke-{thin,medium,thick}` → `1 / 2 / 4px`

## Elevation (blur-radius scalars, not composed shadows)

| Token | Value |
|---|---|
| `--sys-elevation-flat` | `0px` |
| `--sys-elevation-level-1-main` / `-inverse` | `2px` / `-2px` |
| `--sys-elevation-level-2-main` / `-inverse` | `4px` / `-4px` |
| `--sys-elevation-level-3-main` / `-inverse` | `8px` / `-8px` |
| `--sys-blur` | `16px` |

Composed box-shadow effects that consume these live in `extensions.css`.

## Dimension percentages

| Token | Value |
|---|---|
| `--sys-dimension-height-100` | `100%` |
| `--sys-dimension-height-85` | `85%` |
| `--sys-dimension-width-full-width` | `100%` |

Grid column widths are intentionally omitted — the container-query Grid/Span system owns responsive width.

## `--sys-font-condense`

Defined in `text-styles.css` as `1` (a no-op placeholder — see file comment).

---

## Tier position

`palette/ref (theme)` → **`sys` (this tier, theme-agnostic structure)** → `semantic` (`semantics.css`, what components read) → `component` (scoped `.vue` CSS).
