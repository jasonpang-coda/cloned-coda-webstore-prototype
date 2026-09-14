# Codashop token map — CSS var → Figma variable

Reusable cross-reference so a future component import (`use_figma`) doesn't
re-derive this by tracing source + the Codashop Tokens Figma library from
scratch. Traced 2026-09-05 while importing `Button.vue` (primary variant)
and `SkuCard.vue` into the Commerce Engine Core UI Components library.

Figma variable names use dot form in aliases (`{sys.colour.primary.main}`)
but are stored/searched with slashes (`sys/colour/primary/main`) — both
forms below refer to the same variable.

## Button — primary variant

| CSS var (`src/components/Button.vue`) | Figma variable | Figma collection |
|---|---|---|
| `--x-bg-action-primary` | `bg/action/primary` | Colours - Semantics |
| `--x-bg-action-primary-hover` | *(none — `color-mix` 90%+black, computed live)* | — |
| `--x-bg-action-primary-pressed` | *(none — `color-mix` 80%+black, computed live)* | — |
| `--x-text-on-primary` (Codashop override) | `sys/colour/secondary/main` | Colours - System |
| `--x-radius-control-full` | `radius/control/full` | Spacing - Semantics |
| `--x-gap-content-tight` | `gap/content/tight` | Spacing - Semantics |
| `--x-pad-surface-m/l/xl` | `pad/surface/m`, `pad/surface/l`, `pad/surface/xl` | Spacing - Semantics |
| `--x-size-control-xs/s/m` | `sys/size-control/xs`, `-s`, `-m` | Spacing - System |

Hover/pressed have no dedicated token — they're `color-mix` formulas over
whatever `bg/action/primary` currently resolves to. When binding these in
Figma, **read back the actual imported base color first** (don't assume the
literal from this table — the published library may be stale, see
`plugin-script-notes.md`), then recompute the 90%/80% black mix from that.

## SkuCard

| CSS var (`src/components/SkuCard.vue`) | Figma variable | Figma collection |
|---|---|---|
| `--x-gap-content-narrow` | `gap/content/narrow` | Spacing - Semantics |
| `--x-gap-content-tight` | `gap/content/tight` | Spacing - Semantics |
| `--x-gap-content-default` | `gap/content/default` | Spacing - Semantics |
| `--x-pad-surface-m/s/xxs` | `pad/surface/m`, `pad/surface/s`, `pad/surface/xxs` | Spacing - Semantics |
| `--x-radius-container-s` | `radius/container/s` | Spacing - Semantics |
| `--x-radius-container-xs` (badge) | `radius/container/xs` | Spacing - Semantics |
| `--x-bg-sku-card-default` | `bg/SKU card/default` | Colours - Semantics |
| `--x-bg-card-selected` | `bg/card/selected` | Colours - Semantics |
| `--x-border-sku-card-default` | `border/SKU card/default` | Colours - Semantics |
| `--x-border-sku-card-hover` | `border/SKU card/hover` | Colours - Semantics |
| `--x-border-sku-card-selected` | `border/SKU card/selected` | Colours - Semantics |
| `--x-text-header-default` | `text/header/default` | Colours - Semantics |
| `--x-text-body-default` | `text/body/default` | Colours - Semantics |
| `--x-text-bonus-amount` | `sys/colour/primary/strong` | Colours - System |
| `--x-text-success-default` | `text/success/default` | Colours - Semantics |
| `--x-text-hyperlink-default` (Codashop → secondary) | `text/hyperlink/default` | Colours - Semantics |
| Badge fill/text (`bg-tag-bonus` / `text-tag-bonus`) | `sys/colour/primary/subtle` / `sys/colour/primary/inverse` | Colours - System |

Not yet mapped: `--x-shadow-card*`, `--x-blur-container`, `--x-fx-*` material
tokens, `--border-weight-*` — these don't have Figma variable/style
equivalents yet (effect styles vs. variables gap). Flag if a future import
needs shadows/blur bound rather than left as Figma default effects.

## Known gaps in the export → Figma structure

- `Colours - Semantics` has no `text/on-primary` slot — Button's
  `--x-text-on-primary` had to be traced to its override chain
  (`sys/colour/secondary/main`) and bound directly, not via a semantic
  alias. If this recurs for other components, consider adding the slot to
  the `web-store-figma-tokens` skill's reference template rather than
  re-discovering the workaround each time.
