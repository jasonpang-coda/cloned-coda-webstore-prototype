# Token Usage Dashboard

Dev-only `/tokens` surface reporting which design tokens are used, unused, custom, or drifted —
generated from source on every load, not hand-maintained.

---

## Overview

The dashboard replaces the hand-written audit in
`.claude/skills/web-store-component-token-mapping/` (`token-atlas.md`, `component-map.md`,
`drift-audit.md`) with a live scan. That skill's own `SKILL.md` §5 warned its counts drift —
this dashboard is the fix: every number is derived from the actual CSS/`.vue` source at page-load
time, never transcribed by hand.

| Aspect | Detail |
|---|---|
| **URL** | `/tokens`, `/tokens/<tab>` — a real child path (not a hash), so a finding is a shareable link |
| **Open** | Toolbar's Tools segment (donut icon), the `/` command console ("Open token usage dashboard"), or navigate directly |
| **Close** | `Esc` or the × button |
| **Tabs** | Overview · Coverage · Drift · Custom · Stores |
| **Gating** | `v-if="!isStoreLocked"` — never ships in a `build:<store>` bundle (verified: `TokenAuditApp` builds into its own lazy chunk, absent from `dist/` in a store-locked build) |

**Design.** Overview leads with a hero coverage band judged against an 80% health threshold (the
single most decision-driving number, answers "healthy or not?" without scrolling) before the
per-metric KPI row; the finer a/b/c/d usage-signal breakdown lives behind a collapsed disclosure.
Every `StatCard` status (good/warn/bad) pairs an icon + word with its tone colour, never colour
alone. The fixed dark chrome (sidebar/topbar) is systematised into a `--tk-*` local var ramp;
content panels still consume only the live `--x-*` semantic tokens they're auditing.

## What "in prod" means

Per `docs/token-reconcile.md`, the prod-contract token set is every `--x-` name declared at
`:root` in `src/tokens/ds/{system,semantics,space,text-styles}.css`. The dashboard also folds in
any token whose *name* matches the semantic-tier pattern (`--x-bg-/-text-/-border-/-pad-/-gap-/
-radius-/-size-`) even if it has no `:root` declaration — that gap is exactly what drift rule D02
flags (see below), so hiding those tokens from the "prod" bucket would hide the finding instead of
surfacing it. Everything else (`extensions.css`, `motion*.css`, `materials.css`, `light.css`,
`effects.css`) is bucketed "prototype-only", toggled from the sidebar.

## The four usage signals

A token can be used four independent ways, and the dashboard never collapses them into one boolean:

- **(a) css** — read via `var()` inside a `.vue`'s `<style scoped>` block.
- **(b) alias** — reachable through the alias graph from something that IS read (transitive), or
  consumed by the design system's own internal CSS (e.g. `text-styles.css`'s `.text-style-*`
  classes reading `--x-sys-font-family-*`).
- **(c) js** — read from JS/template (`getPropertyValue`, `getToken`, a `:style` binding, or a
  template-literal name like `` `var(--x-size-img-${size})` `` — the last is flagged *not
  statically provable*).
- **(d) theme** — overridden in one or more `themes/*.css` files.

The headline "used" = (a) ∨ (b) ∨ (c). Signal (d) is deliberately excluded from that — a token
overridden by 13 themes and read by nobody is its own drift finding ("overridden, unconsumed"),
and folding (d) into "used" would make that finding impossible to express.

## Drift rules

`src/token-audit/core/rules.js` — one rule per class of bug, each citing the
`drift-audit.md` finding it re-derives (where one exists). Highlight: **D01 (dead theme
override)** — the recurring specificity-trap regression (`themes/<store>.css` sets a token inside
a plain `[data-theme="x"]` block that a later-imported `:root` declaration silently wins over).
Mechanically applying this rule found **29** real instances against the 1 documented by hand,
including a previously-undiscovered bug: `--x-hdr-glow/-hot/-bloom` overrides in `codm.css`,
`tdr.css`, and `ygodl.css` are dead against `motion-sku.css`'s `:root` defaults.

## Architecture

- `src/token-audit/core/` — the engine. Framework-free (no Vue, no `import.meta`): takes source
  *text*, returns a data model. Runs identically in the browser and in Node.
- `src/token-audit/sources.js` — the **only** file with `import.meta.glob`, pulling every token
  CSS / `.vue` / `.js` file's raw text at build time. Only ever imported from `TokenAuditApp.vue`,
  which `App.vue` mounts behind `!isStoreLocked` — so the whole tree (including the raw source
  text) tree-shakes out of store-locked builds, the same guarantee `src/handoff/registry.js`
  documents for `/handoff`.
- `scripts/token-audit.mjs` — `npm run token:audit` (`--json`, `--drift`). Same engine, `fs`-based
  loader. Mirrors `tools/cms/audit.mjs`'s conventions: read-only, exits non-zero only on an
  error-severity, non-allowlisted finding (CI-safe).
- `scripts/resolve-css.mjs` was refactored to delegate its cascade/specificity logic to
  `core/cascade.js` (same public API, `export-handoff.mjs` needed no changes). Two real bugs were
  fixed in that extraction: `ROOT_TIER_FILES` was missing `light.css`/`materials.css` (main.js
  imports them; the old resolver couldn't resolve any token that referenced them), and the parser
  was merging `@media (dynamic-range: high)` HDR overrides into the base cascade unconditionally.

## Verified against

Every one of the 10 hand-written findings in `drift-audit.md` is re-discovered automatically
(cross-checked by hand during implementation). Declaration/usage counts were cross-checked against
independent `grep` counts before trusting the tool.
