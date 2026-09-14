---
epic: figma-token-sync
size: XL
status: in-progress
created: 2026-09-12
owner: unassigned
last-verified: 2026-09-13
---

> **2026-09-12 update — the manual workflow below is now a skill + CLI.** Use the
> `figma-token-trace` skill (`.claude/skills/figma-token-trace/SKILL.md`) end to end; it packages
> the "read bound variables → walk alias chain → crosswalk against repo tokens" steps this file's
> Batch 1 did by hand. The crosswalk step is `node tools/figma-token-crosswalk.mjs --figma-file
> <trace-dump.json>` (`npm run figma:crosswalk`) — it re-derived Batch 1's 6/6 ✅ result
> automatically (verified 2026-09-12), ranking `--x-gap-content-loose` etc. as the top candidate by
> name overlap exactly as this file records below. Color tokens stay out of scope for that CLI —
> use `figma-harness.mjs diff-tokens` (§5 of the `design-harness` skill) for those.

# Figma Token Sync Tracker

Living log of every Figma variable traced against this repo's token system, so a "connect Figma to
the repo" session's findings survive past the chat that produced them. See
[`plans/INDEX.md`](../../INDEX.md) for how this fits alongside the harness-quality plans, and the
`design-harness` skill (§5, Figma Token Drift Audit) for the adjacent `figma-harness.mjs
diff-tokens` tool this doc feeds.

## Why this exists

Connecting a Figma node to the repo answers two separable questions that are easy to conflate:
1. **Code Connect** — does Figma know which code component implements this design? (tracked in
   `docs/figma-code-connect/mappings.json`, via `send_code_connect_mappings`)
2. **Token parity** — does the repo's token system actually reproduce the design's values, at the
   *same tier* (sys vs semantic), not just the same final number? This file tracks that.

A Figma variable can look "missing" from the repo (different name, different `/` vs `-`
convention) while actually already existing exactly, and it can look "the same" (same resolved
px value) while one side is a raw literal that isn't wired to its sys tier the way its sibling
tokens are. Both are worth recording — the second is real, quiet debt that survives a value-only
diff.

## Status legend

- ✅ **correct** — repo already has the exact sys + semantic equivalent, correctly aliased.
- ⚠️ **needs fix** — repo has a token with the right *value* but it isn't aliased to sys (or is
  aliased to the wrong thing) — a consistency/maintainability issue, not necessarily a visual bug.
- 🆕 **new token needed** — no repo equivalent exists at all; needs authoring (follow
  `web-store-tokens`'s closed-set rule — don't invent a semantic token without checking first).

## How to add a batch

1. Get the node's bound variable ids from the node itself (`node.boundVariables`), **not** by
   variable name — `figma.variables.getLocalVariablesAsync()` only sees variables *defined* in
   this file; a component's bound variables are usually imported from a remote team library and
   only resolve via `figma.variables.getVariableByIdAsync(id)`.
2. Walk each variable's `valuesByMode` — if the value is a `VARIABLE_ALIAS`, follow it
   (`getVariableByIdAsync` again) until you hit a raw (non-alias) value. Record every hop's
   collection name, mode name, and value — see the reusable script below.
3. For each Figma variable, search the repo for a token with the same **value** at the same
   **tier** (sys primitive vs semantic alias) — not just a value grep, since two unrelated tokens
   can share a value (12px appears in a dozen places) but only one is the actual semantic match.
4. Add a row to a new dated batch section below. Leave ⚠️/🆕 rows open until fixed and
   re-verified (flip to ✅ with the date).

### Reusable trace script (read-only `use_figma`)

```js
// Pass the actual boundVariables ids from the node you're tracing (read them
// first with a separate get_metadata / node.boundVariables call — don't guess
// ids). Walks each variable's full alias chain to its terminal raw value.
async function walkChain(variable, modeId, depth, seen) {
  if (!variable) return [{ error: 'variable not found' }]
  if (depth > 10) return [{ error: 'max depth exceeded' }]
  const collection = variable.variableCollectionId
    ? await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId)
    : null
  const modeName = (collection && collection.modes.find(m => m.modeId === modeId) || {}).name || modeId
  const val = variable.valuesByMode[modeId]
  const hop = {
    variableName: variable.name, variableId: variable.id, remote: variable.remote,
    collectionName: collection ? collection.name : null, modeName, rawValue: val,
    resolvedType: variable.resolvedType, scopes: variable.scopes,
  }
  if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') {
    if (seen.has(val.id)) return [hop, { error: 'cycle detected', id: val.id }]
    seen.add(val.id)
    const nextVar = await figma.variables.getVariableByIdAsync(val.id)
    if (!nextVar) return [hop, { error: 'aliased variable missing/unresolvable', id: val.id }]
    const nextCollection = nextVar.variableCollectionId
      ? await figma.variables.getVariableCollectionByIdAsync(nextVar.variableCollectionId) : null
    let nextModeId = modeId
    if (!(modeId in nextVar.valuesByMode)) {
      nextModeId = (nextCollection && nextCollection.defaultModeId) || Object.keys(nextVar.valuesByMode)[0]
    }
    return [hop].concat(await walkChain(nextVar, nextModeId, depth + 1, seen))
  }
  return [hop]
}

const ids = [/* boundVariable ids from the target node, e.g. 'VariableID:...' */]
const results = []
for (const id of ids) {
  const v = await figma.variables.getVariableByIdAsync(id)
  if (!v) { results.push({ requestedId: id, error: 'not found' }); continue }
  const collection = v.variableCollectionId ? await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId) : null
  const modeId = (collection && collection.defaultModeId) || Object.keys(v.valuesByMode)[0]
  results.push({ requestedId: id, chain: await walkChain(v, modeId, 0, new Set([v.id])) })
}
return results
```

---

## Batch 1 — Grid component (2026-09-12)

Source: [Commerce Engine Core UI Components — Grid](https://www.figma.com/design/2ERPQME5maCRg6POjg8EyH/Commerce-Engine-Core-UI-Components?node-id=1386-1381),
node `1386:1381` (component set, variants `Width=XS/S/M/L`). Code Connect mapped to
[`src/components/Grid.vue`](../../../src/components/Grid.vue) on 2026-09-12 (all 4 variants → the one
component, since `Grid.vue` handles every breakpoint itself via `@container` queries).

| Figma semantic var | → Figma sys var | Value | Repo sys token | Repo semantic token | Status |
|---|---|---|---|---|---|
| `gap/content/default` | `sys/space/s` | 8 | `--x-sys-space-s` | `--x-gap-content-default` | ✅ correct |
| `gap/content/loose` | `sys/space/main` | 12 | `--x-sys-space-main` | `--x-gap-content-loose` | ✅ correct |
| `gap/content/separation` | `sys/space/l` | 16 | `--x-sys-space-l` | `--x-gap-content-separation` | ✅ correct |
| `pad/surface/m` | `sys/space/main` | 12 | `--x-sys-space-main` | `--x-pad-surface-m` | ✅ correct |
| `pad/surface/l` | `sys/space/l` | 16 | `--x-sys-space-l` | `--x-pad-surface-l` | ✅ correct |
| `border/weight/default` | `sys/stroke/thin` | 1 | `--x-sys-stroke-thin` | `--border-weight-default` | ✅ correct |

**No new tokens needed.** All six already exist, name-for-name reproducing the Figma sys tier —
`space.css`'s own header comment ("Values are the Figma 'Mobile' mode") confirms this repo's
sys-space scale was built directly from this same Figma library. The only mismatch is naming
convention (`gap/content/default` vs `--x-gap-content-default`), not structure or value — expected,
not actionable.

**Found instead — 4 existing tokens are numerically right but not aliased to sys** — ✅ fixed
2026-09-13.
`Grid.vue` consumes its own grid-specific semantic tokens for the M/L breakpoints, and those bypass
the alias chain every sibling token in the same file uses:

| Token | File:line | Currently | Should be |
|---|---|---|---|
| `--x-gap-grid-gutter-m` | `src/tokens/ds/space.css:133` | `12px` (raw) | `var(--x-sys-space-main)` |
| `--x-gap-grid-gutter-l` | `src/tokens/ds/space.css:134` | `16px` (raw) | `var(--x-sys-space-l)` |
| `--x-gap-grid-margin-l` | `src/tokens/ds/space.css:135` | `16px` (raw) | `var(--x-sys-space-l)` |
| `--x-gap-grid-gutter-l` (codashop override) | `src/tokens/ds/themes/codashop.css:264` | `12px` (raw) | `var(--x-sys-space-main)` |

Not a visual bug — the raw values already match their intended sys primitive exactly. It's
consistency/maintainability debt: a future re-tune of `--x-sys-space-main`/`--x-sys-space-l` (e.g.
a density pass) would silently miss these four declarations while correctly repainting every other
`--x-gap-*`/`--x-pad-*` token in the same file.

**Fixed.** All 4 re-aliased to `var(--x-sys-space-main)`/`var(--x-sys-space-l)`. Verified zero
resolved-value change via `resolveTokensForStore` before AND after (COD:M: `12px`/`16px`/`16px`
unchanged; Codashop: `12px`/`12px`/`16px` unchanged — its override still lands on its own derived
12px gutter). `harness test all` (87/87 pass) and `npm test` (same 2 pre-existing unrelated
failures) both clean after the change.

## Open items across all batches

- [x] ~~Fix the 4 raw-literal tokens above~~ — done 2026-09-13.
- [x] ~~Populate `Grid.stories.js`'s `figmaNodeId`~~ — already done (2026-09-12, same session as
      the Code Connect mapping).
- [ ] (add a new dated batch section here as more components get traced)
