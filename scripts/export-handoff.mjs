#!/usr/bin/env node
/**
 * export-handoff.mjs — generates docs/Handoff/<slug>/{spec.md,spec.json} from
 * a live flow manifest (src/handoff/flows/<slug>.flow.js), for AI/FE readers
 * who can't run the app.
 *
 * A flow manifest imports real .vue components (for the in-app live render),
 * so this script can't just `import()` it under plain Node — it uses Vite's
 * `ssrLoadModule` (middleware-mode dev server) to load the flow module with
 * the same .vue transform the app itself uses. Only the manifest's plain-data
 * fields (states/transitions/choreography/token names) are read; the actual
 * Vue component objects are irrelevant to a static export and ignored.
 *
 * Resolved token values are produced by resolve-css.mjs — never hand-written
 * here — so a regenerated spec can never silently drift from the CSS on disk.
 *
 * Usage: node scripts/export-handoff.mjs [slug]   (omit slug to export every flow)
 *
 * `--target=codashop-client` additionally emits docs/Handoff/<slug>/for-codashop-client/
 * — a bundle shaped for that production repo's own conventions (AGENTS.md entry point,
 * a token crosswalk against ITS real tokens, a file-map of exactly which existing
 * component/stylesheet to touch, and the house rules its own AGENTS.md/.cursor/rules/
 * skills already impose). Only meaningful for a flow that declares `targets` — a flow
 * with no production counterpart yet has nothing for this mode to map onto, and the
 * flag is a no-op for it (a warning is printed, not an error, since exporting the plain
 * spec.md/spec.json should still succeed).
 */
import { readdirSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createServer } from 'vite'
import { affectedTokens } from '../src/handoff/flow.js'
import { resolveTokensAcrossStores } from './resolve-css.mjs'
import { crosswalkFlow, renderCrosswalkMarkdown, DEFAULT_PROD_ROOT } from './token-crosswalk.mjs'
import { getComponentConsumedTokenNames } from '../tools/lib/component-tokens.mjs'

// A flow manifest statically imports real .vue components + composables (for
// the in-app live render) — several composables (useTheme.js chief among
// them) touch `window`/`document` at MODULE TOP LEVEL as a side effect of
// being imported, not when actually used. That's fine in the browser but
// throws immediately under Vite's SSR module loader (plain Node, no DOM).
// This script never renders or calls those composables — it only reads the
// plain-data shape of the manifest object — so a minimal, script-local shim
// installed right before ssrLoadModule() is enough to let module evaluation
// complete, without touching any production composable. Installed AFTER
// createServer() (whose own config-loading step imports @vue/runtime-dom,
// which behaves differently — and breaks — if it detects a global
// `document`), so it only shadows the flow module's own top-level reads.
function installBrowserGlobalShim () {
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = { location: { search: '', hash: '' }, addEventListener () {}, removeEventListener () {} }
  }
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = { documentElement: { dataset: {} } }
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const FLOWS_DIR = path.join(ROOT, 'src/handoff/flows')
const OUT_DIR = path.join(ROOT, 'docs/Handoff')

const STORE_KEYS = readdirSync(path.join(ROOT, 'src/stores')).filter((d) =>
  !d.startsWith('.'),
)

function mdEscape (s) {
  // Also collapse internal whitespace/newlines — multi-line CSS values (e.g.
  // gradients authored across several lines in the theme file) would
  // otherwise break out of a markdown table cell.
  return String(s ?? '').replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|')
}

// Splits tokens into "same value at every store" (the common case — most
// tokens in this repo don't vary per store) vs. "actually diverges", and
// renders the uniform ones as a single flat list instead of a 12-identical-
// columns table. Was previously one N-store-wide table for every token
// regardless — a reader hunting for what's store-specific had to scan past
// e.g. `--x-pad-surface-m | 12px | 12px | 12px | ... | 12px` (all 12 stores
// repeating the same value) to find the handful of rows that actually
// differ. plans/tickets/in-progress/harness-false-confidence.md item 3.
function tokenTable (tokenNames, byStore, storeKeys) {
  const uniform = []
  const divergent = []
  for (const name of tokenNames) {
    const values = storeKeys.map((s) => byStore[s]?.[name] ?? null)
    if (values.every((v) => v === values[0])) uniform.push({ name, value: values[0] })
    else divergent.push(name)
  }

  const parts = []
  if (uniform.length) {
    parts.push('**Same value at every store:**', '')
    parts.push('| Token | Value |', '|---|---|')
    for (const { name, value } of uniform) {
      parts.push(`| \`${name}\` | ${value == null ? '_(resolve live)_' : `\`${mdEscape(value)}\``} |`)
    }
  }
  if (divergent.length) {
    if (uniform.length) parts.push('', '**Diverges per store:**', '')
    const header = `| Token | ${storeKeys.map((s) => s.toUpperCase()).join(' | ')} |\n|---|${storeKeys.map(() => '---').join('|')}|`
    const rows = divergent.map((name) => {
      const cells = storeKeys.map((s) => {
        const v = byStore[s]?.[name]
        return v == null ? '_(resolve live)_' : `\`${mdEscape(v)}\``
      })
      return `| \`${name}\` | ${cells.join(' | ')} |`
    })
    parts.push(header, ...rows)
  }
  return parts.join('\n')
}

function renderSpecMd (flow, storeKeys) {
  const tokens = affectedTokens(flow)
  const byStore = resolveTokensAcrossStores(tokens, storeKeys)

  const lines = []
  lines.push(`---`)
  lines.push(`handoff: ${flow.slug}`)
  lines.push(`title: ${flow.title}`)
  lines.push(`generated_by: scripts/export-handoff.mjs`)
  lines.push(`source: src/handoff/flows/${flow.slug}.flow.js`)
  lines.push(`demo_url: /handoff/${flow.slug}`)
  lines.push(`states: ${flow.states.length}`)
  lines.push(`---`)
  lines.push('')
  lines.push(`# ${flow.title}`)
  lines.push('')
  if (flow.summary) lines.push(`> ${flow.summary}`)
  lines.push('')
  lines.push(`**This file is generated.** Every resolved token value below was read from the actual CSS in \`src/tokens/\` at export time — never hand-transcribed. Regenerate with \`npm run handoff:export\`. The live, always-current version of everything here is at \`/handoff/${flow.slug}\` in the running prototype.`)
  lines.push('')

  lines.push('## 1. Components')
  lines.push('')
  for (const c of flow.components) {
    lines.push(`### ${c.id}`)
    if (c.source) lines.push(`Source: \`${c.source}\``)
    if (c.notes) lines.push('')
    if (c.notes) lines.push(c.notes)
    lines.push('')
    lines.push(tokenTable(c.tokens || [], byStore, storeKeys))
    lines.push('')
  }

  lines.push('## 2. State inventory')
  lines.push('')
  lines.push('| State | Description | Entry | Exit |')
  lines.push('|---|---|---|---|')
  for (const s of flow.states) {
    lines.push(`| \`${s.id}\` | ${mdEscape(s.desc)} | ${mdEscape(s.entry)} | ${mdEscape(s.exit)} |`)
  }
  lines.push('')
  lines.push(`Total states: **${flow.states.length}**`)
  lines.push('')

  lines.push('## 3. Transitions')
  lines.push('')
  lines.push('| From | To | Trigger | Motion tokens |')
  lines.push('|---|---|---|---|')
  for (const t of flow.transitions) {
    lines.push(`| \`${t.from}\` | \`${t.to}\` | ${mdEscape(t.trigger)} | ${(t.motion || []).map((m) => `\`${m}\``).join(', ')} |`)
  }
  lines.push('')

  lines.push('## 4. Choreography')
  lines.push('')
  lines.push('| Beat | Delay | Duration token | Resolved (per store) | Easing token | Resolved (per store) | Target |')
  lines.push('|---|---|---|---|---|---|---|')
  for (const b of flow.choreography) {
    const durByStore = storeKeys.map((s) => `${s}: ${byStore[s]?.[b.duration] ?? '(resolve live)'}`).join('; ')
    const easeByStore = storeKeys.map((s) => `${s}: ${byStore[s]?.[b.easing] ?? '(resolve live)'}`).join('; ')
    lines.push(`| ${mdEscape(b.beat)} | ${b.delayMs}ms | \`${b.duration}\` | ${mdEscape(durByStore)} | \`${b.easing}\` | ${mdEscape(easeByStore)} | ${mdEscape(b.target)} |`)
  }
  lines.push('')

  if (flow.flowChart) {
    lines.push('## 5. User flow')
    lines.push('')
    lines.push('```mermaid')
    lines.push(flow.flowChart)
    lines.push('```')
    lines.push('')
  }
  if (flow.stateChart) {
    lines.push('## 6. State diagram')
    lines.push('')
    lines.push('```mermaid')
    lines.push(flow.stateChart)
    lines.push('```')
    lines.push('')
  }

  lines.push('## 7. Notes (authored)')
  lines.push('')
  if (flow.notes?.rationale) lines.push(`**Rationale:** ${flow.notes.rationale}`, '')
  if (flow.notes?.buildOrder?.length) {
    lines.push('**Build order:**')
    flow.notes.buildOrder.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
    lines.push('')
  }
  if (flow.notes?.gotchas?.length) {
    lines.push('**Gotchas:**')
    flow.notes.gotchas.forEach((g) => lines.push(`- ${g}`))
    lines.push('')
  }
  if (flow.notes?.prohibitions?.length) {
    lines.push('**Prohibitions:**')
    flow.notes.prohibitions.forEach((p) => lines.push(`- ${p}`))
    lines.push('')
  }
  if (flow.notes?.openQuestions?.length) {
    lines.push('**Open questions:**')
    flow.notes.openQuestions.forEach((q) => lines.push(`- ${q}`))
    lines.push('')
  }

  lines.push('## 8. Constraints & prohibitions')
  lines.push('')
  lines.push('- Never hardcode a resolved literal that a token above already provides — map to the equivalent semantic token in your system.')
  lines.push('- Every state in §2 must be reachable in your rebuild. A missing state is an incomplete task.')
  lines.push('- Cross-check the live oracle at `/handoff/' + flow.slug + '` in the running prototype before treating this static export as final — it is a snapshot, the live surface is the source of truth at any given moment.')
  lines.push('')

  lines.push('## 9. Verification')
  lines.push('')
  lines.push('| # | State | Reachable | Matches reference |')
  lines.push('|---|---|---|---|')
  flow.states.forEach((s, i) => lines.push(`| ${i + 1} | \`${s.id}\` | ☐ | ☐ |`))
  lines.push('')

  return lines.join('\n')
}

function renderSpecJson (flow, storeKeys) {
  const tokens = affectedTokens(flow)
  const byStore = resolveTokensAcrossStores(tokens, storeKeys)
  return JSON.stringify({
    slug: flow.slug,
    title: flow.title,
    summary: flow.summary,
    generatedBy: 'scripts/export-handoff.mjs',
    demoUrl: `/handoff/${flow.slug}`,
    components: flow.components.map((c) => ({ id: c.id, source: c.source, notes: c.notes, tokens: c.tokens })),
    states: flow.states,
    transitions: flow.transitions,
    choreography: flow.choreography,
    tokens,
    resolvedByStore: byStore,
    notes: flow.notes,
  }, null, 2)
}

// Sorted (store, then width in the same order the capture rig sweeps them)
// so the generated section — and therefore the file --verify compares
// against — is deterministic regardless of directory-listing order.
const CAPTURE_STORE_ORDER = ['codm', 'codashop', 'fcm']
const CAPTURE_WIDTH_ORDER = ['iphone', 'samsung', 'responsive']
function sortCaptureFiles (files) {
  const rank = (f) => {
    const [store, width] = f.replace(/\.png$/, '').split('-')
    return CAPTURE_STORE_ORDER.indexOf(store) * 10 + CAPTURE_WIDTH_ORDER.indexOf(width)
  }
  return [...files].sort((a, b) => rank(a) - rank(b))
}

function renderStorySpecMd (story, storeKeys, sourceFile, componentAbsPath, captureFiles = []) {
  // Auto-derived from the actual component (single source of truth — see
  // tools/lib/component-tokens.mjs) UNIONed with any explicit story.tokens,
  // so an author can still pin a token the regex can't see (e.g. resolved
  // only via a JS-computed inline style), but can no longer under-declare
  // by omission — that's exactly how the --x-fx-* cross-store gap stayed
  // invisible until someone happened to hand-populate a story's tokens.
  const derived = componentAbsPath ? getComponentConsumedTokenNames(componentAbsPath) : []
  const explicit = Array.isArray(story.tokens) ? story.tokens : []
  const tokens = [...new Set([...derived, ...explicit])]
  const byStore = resolveTokensAcrossStores(tokens, storeKeys)

  const lines = []
  lines.push(`---`)
  lines.push(`handoff: ${story.id}`)
  lines.push(`title: ${story.title}`)
  lines.push(`group: ${story.group}`)
  lines.push(`generated_by: scripts/export-handoff.mjs (story-mode)`)
  lines.push(`source: src/library/stories/${sourceFile}`)
  lines.push(`variants: ${(story.variants || []).length}`)
  lines.push(`states: ${(story.states || []).length}`)
  lines.push(`---`)
  lines.push('')
  lines.push(`# ${story.title}`)
  lines.push('')
  if (story.notes) lines.push(`> ${story.notes}`)
  lines.push('')
  lines.push(`**Generated Component Spec from Story Harness.** Generated deterministically from the component's story declaration. Regenerate with \`node scripts/export-handoff.mjs --story ${story.id}\`.`)
  lines.push('')

  if (captureFiles.length) {
    // plans/tickets/in-progress/visual-capture-rig.md Phase 3b — real screenshots, not prose.
    // captureFiles are the actual filenames found on disk at export time (not
    // a fixed list this generator assumes exist), so --verify's byte
    // comparison genuinely reflects whether a capture arrived/changed —
    // consistent with every other section here reading real current state
    // rather than a value baked in at generation time.
    lines.push('## Reference Captures')
    lines.push('')
    lines.push(`Captured via \`npm run harness:capture -- manifest ${story.id}\` (see plans/tickets/in-progress/visual-capture-rig.md) — the component in isolation, per store/width, not a hand-taken screenshot.`)
    lines.push('')
    for (const file of sortCaptureFiles(captureFiles)) {
      const [store, width] = file.replace(/\.png$/, '').split('-')
      lines.push(`**${store} / ${width}**`)
      lines.push('')
      lines.push(`![${story.title} — ${store} ${width}](captures/${file})`)
      lines.push('')
    }
  }

  if (story.rules && story.rules.length) {
    lines.push('## Usage Rules')
    for (const r of story.rules) lines.push(`- ${r}`)
    lines.push('')
  }

  lines.push('## Variants & Interaction States')
  lines.push('')
  lines.push(`- **Supported Interaction States**: ${(story.states || ['default']).map(s => `\`${s}\``).join(', ')}`)
  lines.push('')
  lines.push('| Variant Name | Index |')
  lines.push('|---|---|')
  for (let i = 0; i < (story.variants || []).length; i++) {
    lines.push(`| ${mdEscape(story.variants[i].name)} | ${i} |`)
  }
  lines.push('')

  if (tokens.length) {
    lines.push('## Token Contract (Resolved per Store)')
    lines.push('')
    lines.push(tokenTable(tokens, byStore, storeKeys))
    lines.push('')
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// --target=codashop-client bundle — five files under for-codashop-client/,
// shaped to land as a PR into that repo, not as documentation to read here.
// ---------------------------------------------------------------------------

function renderContractMd (flow) {
  if (!flow.contract?.length) return ''
  const lines = []
  lines.push('## Integration contract')
  lines.push('')
  lines.push('What the UI needs FROM the platform. This section is silent on HOW any of it is')
  lines.push('implemented (no backend/endpoint shape is prescribed) — that\'s this repo\'s call.')
  lines.push('')
  lines.push('| State | Trigger | Required UI outcome | |')
  lines.push('|---|---|---|---|')
  for (const s of flow.contract) {
    lines.push(`| \`${s.id}\` | ${mdEscape(s.trigger)} | ${mdEscape(s.outcome)} | ${s.isError ? '⚠️ error/terminal branch' : ''} |`)
  }
  lines.push('')
  return lines.join('\n')
}

function renderAgentsMd (flow, crosswalkRows) {
  const gated = crosswalkRows.filter((r) => r.class === 'NEW_SEMANTIC')
  const lines = []
  lines.push(`# ${flow.title} — agent instructions`)
  lines.push('')
  if (flow.summary) lines.push(flow.summary)
  lines.push('')
  lines.push('## The prototype is a reference, not a target')
  lines.push('')
  lines.push('This spec came from a Vue 3 prototype that is **not 1:1** with this codebase. Do')
  lines.push('not copy `.vue` files or file layout from it — every component this feature touches')
  lines.push('already has a counterpart here (see `file-map.md`). Reproduce two things:')
  lines.push('')
  lines.push('1. **The state machine** — `spec.md` §2/§3 (states, transitions) and, if present,')
  lines.push('   §Integration contract (the platform behaviour the UI must react to).')
  lines.push('2. **The token contract** — `tokens.md`. Every value by semantic role, already')
  lines.push('   cross-referenced against this repo\'s real tokens.')
  lines.push('')
  lines.push('## Read order')
  lines.push('')
  lines.push('1. This repo\'s own conventions first: `AGENTS.md`, `.cursor/rules/*.mdc`,')
  lines.push('   `.agents/skills/`, `skills/figma-implement-design/SKILL.md` — they take')
  lines.push('   precedence over anything in this bundle.')
  lines.push('2. `house-rules.md` in this folder — the subset of the above that specifically')
  lines.push('   applies to this feature, cited to source.')
  lines.push('3. `file-map.md` — which existing file to edit for each component.')
  lines.push('4. `tokens.md` — the token crosswalk. Every `NEW_SEMANTIC` row is gated (see below).')
  lines.push('5. `spec.md` — states, transitions, choreography, integration contract.')
  lines.push('')
  lines.push('## Hard rules')
  lines.push('')
  lines.push('- Modify the existing components named in `file-map.md`. Do not create new `.vue`')
  lines.push('  files without explicit permission (`skills/figma-implement-design/SKILL.md`).')
  lines.push('- Verify every token against `tokens.md` before writing styles — this repo\'s own')
  lines.push('  convention, restated here because it matters most on a cross-codebase handoff.')
  if (gated.length) {
    lines.push(`- ${gated.length} token(s) in \`tokens.md\` are marked **NEW_SEMANTIC (gated)** —`)
    lines.push('  this repo\'s semantic token tiers are a closed set (matches this prototype\'s own')
    lines.push('  `web-store-tokens` §2b rule). Do not add them unsupervised. Use the listed')
    lines.push('  fallback until the design-system owner signs off.')
  }
  lines.push('- All user-facing copy goes through i18n — see `.agents/skills/add-translations`.')
  lines.push('  `file-map.md` lists the i18n key prefix each surface should use.')
  lines.push('- Gate any pilot behaviour with `isSiteFeatureOn()`, never a tenant-name check')
  lines.push('  (`isEa*`/`isCodm*`) — this repo\'s `AGENTS.md` rule.')
  if (flow.prototypeOnly?.length) {
    lines.push('- Do not port prototype-only scaffolding (see `spec.md`\'s "prototype-only" list) —')
    lines.push('  it exists purely to make the feature demoable without a backend.')
  }
  lines.push('')
  lines.push('## When something is missing')
  lines.push('')
  lines.push('If a value or behaviour is not in `spec.md` or `tokens.md`: check the open')
  lines.push('questions listed in `spec.md` §7. Still unresolved → **stop and ask a human**.')
  lines.push('Never infer a colour, duration, endpoint shape, or behaviour.')
  lines.push('')
  return lines.join('\n')
}

function renderFileMapMd (flow) {
  const lines = []
  lines.push(`# File map — ${flow.title}`)
  lines.push('')
  lines.push('Every component below already exists in this repo. This is a modify-existing task.')
  lines.push('')
  lines.push('| Prototype component | Edit this file | Styles | i18n prefix |')
  lines.push('|---|---|---|---|')
  const targets = flow.targets || {}
  const ids = Object.keys(targets)
  if (!ids.length) {
    lines.push('| _(no `targets` declared on this flow)_ | — | — | — |')
  }
  for (const id of ids) {
    const t = targets[id]
    lines.push(`| \`${id}\` | \`${t.component}\` | ${t.styles ? `\`${t.styles}\`` : '_n/a_'} | ${t.i18nPrefix ? `\`${t.i18nPrefix}.*\`` : '_n/a_'} |`)
  }
  lines.push('')
  lines.push('A path listed above that no longer exists in this repo is a signal the file moved,')
  lines.push('not that the feature is new — search for it before assuming a new component is needed.')
  lines.push('')
  return lines.join('\n')
}

function renderHouseRulesMd () {
  // Static — these are the production repo's own standing conventions, cited to
  // source, not derived from any one flow. Update this list if their conventions
  // change; it deliberately does not restate the full rule text, only points at it.
  const lines = []
  lines.push('# House rules (codapayments-codashop-client)')
  lines.push('')
  lines.push('Cited, not restated — read the source before relying on this summary.')
  lines.push('')
  lines.push('| Rule | Source |')
  lines.push('|---|---|')
  lines.push('| All user-facing copy through i18n, never hardcoded | `.agents/skills/add-translations`, `AGENTS.md` |')
  lines.push('| No tenant-name branching (`isEa*`/`isCodm*`) — use `isSiteFeatureOn()` | `AGENTS.md`, `composables/store-config.ts` |')
  lines.push('| New tokens only on the `theme-preset-edge--*` / `.theme--styled-edge` branch | `.cursor/rules/sitebuilder-edge-only-tokens.mdc` |')
  lines.push('| Motion tokens chosen by interaction intent, propose a table + wait for approval, never bulk-replace | `.cursor/rules/sitebuilder-motion-tokens-by-intent.mdc` |')
  lines.push('| No new `.vue` component without explicit permission | `skills/figma-implement-design/SKILL.md` |')
  lines.push('| Token-existence verification mandatory before writing any styles | `skills/figma-implement-design/SKILL.md` |')
  lines.push('| Component CSS lives in the mirrored `assets/css/sitebuilder/components/**` file, not inline in the SFC | `assets/css/sitebuilder/README.md` |')
  lines.push('| Test in the lightest sufficient tier: `.unit.ts` → `.test.ts` → `.spec.ts` | `AGENTS.md` |')
  lines.push('| Never `git commit`/push/open a PR unless explicitly asked | `.cursor/rules/no-auto-git-commit-push.mdc` |')
  lines.push('| Verify AWS Lambda runtime compatibility before adding a dependency | `AGENTS.md` |')
  lines.push('')
  return lines.join('\n')
}

function emitCodashopClientBundle (flow, prodRoot) {
  const outDir = path.join(OUT_DIR, flow.slug, 'for-codashop-client')
  mkdirSync(outDir, { recursive: true })

  const rows = crosswalkFlow(flow, prodRoot)
  writeFileSync(path.join(outDir, 'AGENTS.md'), renderAgentsMd(flow, rows))
  writeFileSync(path.join(outDir, 'tokens.md'), renderCrosswalkMarkdown(flow, rows, prodRoot))
  writeFileSync(path.join(outDir, 'file-map.md'), renderFileMapMd(flow))
  writeFileSync(path.join(outDir, 'house-rules.md'), renderHouseRulesMd())
  // spec.md is repo-agnostic (states/transitions/choreography/contract) so the same
  // renderer used for the plain export is copied in verbatim — no second implementation
  // to drift from the first.
  writeFileSync(path.join(outDir, 'spec.md'), renderSpecMd(flow, STORE_KEYS) + '\n' + renderContractMd(flow))
  console.log(`  -> for-codashop-client/{AGENTS.md,spec.md,tokens.md,file-map.md,house-rules.md}`)
}

// ---------------------------------------------------------------------------
// Plain-text mirror under public/ — the CURRENT transport is "here's the
// prototype link, let your Cursor agent scrape it", which today returns
// rendered DOM. Serving the generated spec as plain markdown at a stable path
// upgrades that transport without requiring anyone to change habits.
// ---------------------------------------------------------------------------

function emitPublicMirror (allFlows) {
  const publicHandoffDir = path.join(ROOT, 'public/handoff')
  mkdirSync(publicHandoffDir, { recursive: true })
  const llmsLines = ['# COD:M web store — handoff specs', '']
  for (const flow of allFlows) {
    writeFileSync(path.join(publicHandoffDir, `${flow.slug}.md`), renderSpecMd(flow, STORE_KEYS) + '\n' + renderContractMd(flow))
    llmsLines.push(`- [${flow.title}](/handoff/${flow.slug}.md) — ${flow.summary || ''}`.trim())
  }
  writeFileSync(path.join(ROOT, 'public/llms.txt'), llmsLines.join('\n') + '\n')
  console.log(`Public mirror -> public/handoff/*.md, public/llms.txt`)
}

async function main () {
  const args = process.argv.slice(2)
  const isVerifyMode = args.includes('--verify')
  // --verify no longer forces story mode: it used to (`|| isVerifyMode`),
  // which meant bare `--verify` (no --story) silently verified nothing —
  // flow-mode output (spec.md + spec.json under docs/Handoff/<slug>/, and
  // the --target=codashop-client bundle) had zero drift coverage and could
  // never report anything but "in sync". --verify now checks whichever mode
  // --story does or doesn't select, same as a plain export would.
  const isStoryMode = args.includes('--story')
  const storyIdx = args.indexOf('--story')
  const requestedStory = storyIdx !== -1 && args[storyIdx + 1] && !args[storyIdx + 1].startsWith('--')
    ? args[storyIdx + 1]
    : null
  const requestedSlug = args.find((a) => !a.startsWith('--')) || null
  const targetArg = args.find((a) => a.startsWith('--target='))
  const target = targetArg ? targetArg.split('=')[1] : null
  const prodRootArg = args.find((a) => a.startsWith('--prod-root='))
  const prodRoot = prodRootArg ? path.resolve(prodRootArg.split('=')[1]) : DEFAULT_PROD_ROOT

  // optimizeDeps.force: a stale node_modules/.vite dep cache from a normal
  // `vite dev` run can silently bleed into this SSR load, making two
  // otherwise-identical invocations of this script return different
  // resolved content — indistinguishable from a real resolver bug until you
  // burn an hour proving it isn't one. Cheap to force-bust for a CLI script.
  const server = await createServer({ root: ROOT, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'warn', optimizeDeps: { force: true } })
  installBrowserGlobalShim()

  if (isStoryMode) {
    const storiesDir = path.join(ROOT, 'src/library/stories')
    const files = readdirSync(storiesDir).filter((f) => f.endsWith('.stories.js'))
    // Story ids are kebab-case ("sku-tag") but filenames are PascalCase
    // ("SkuTag.stories.js") — strip non-alphanumerics from both sides before
    // matching, or a kebab-case id can never substring-match its own file.
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    const targets = requestedStory
      ? files.filter((f) => normalize(f).includes(normalize(requestedStory)))
      : files

    if (requestedStory && targets.length === 0) {
      const available = files.map((f) => f.replace(/\.stories\.js$/, '')).join(', ')
      console.error(`No story matches "${requestedStory}". Available: ${available}`)
      await server.close()
      process.exitCode = 1
      return
    }

    let driftCount = 0

    for (const file of targets) {
      const mod = await server.ssrLoadModule(path.join(storiesDir, file))
      const story = mod.default
      if (!story) continue
      const outDir = path.join(OUT_DIR, 'components', story.id)
      const specPath = path.join(outDir, 'spec.md')
      // Same import-statement regex harness-cli.mjs uses to build its own
      // story registry — the component object from ssrLoadModule doesn't
      // reliably carry its own source path across Vue/Vite versions, but
      // every story file's own `import X from '@/components/X.vue'` does.
      const storySource = readFileSync(path.join(storiesDir, file), 'utf8')
      const compMatch = storySource.match(/from\s+['"`]@\/components\/([^'"`]+\.vue)['"`]/)
      const componentAbsPath = compMatch ? path.join(ROOT, 'src/components', compMatch[1]) : null
      const capturesDir = path.join(outDir, 'captures')
      const captureFiles = existsSync(capturesDir) ? readdirSync(capturesDir).filter((f) => f.endsWith('.png')) : []
      const expectedContent = renderStorySpecMd(story, STORE_KEYS, file, componentAbsPath, captureFiles)

      if (isVerifyMode) {
        if (!existsSync(specPath)) {
          console.error(`[DRIFT] Missing spec for story "${story.id}" at ${specPath}`)
          driftCount++
        } else if (readFileSync(specPath, 'utf8') !== expectedContent) {
          console.error(`[DRIFT] Spec out of sync: docs/Handoff/components/${story.id}/spec.md`)
          driftCount++
        } else {
          console.log(`[PARITY] Spec in sync: docs/Handoff/components/${story.id}/spec.md`)
        }
        continue
      }

      mkdirSync(outDir, { recursive: true })
      writeFileSync(specPath, expectedContent)
      console.log(`Exported story ${story.id} -> docs/Handoff/components/${story.id}/spec.md`)
    }

    await server.close()
    if (isVerifyMode && driftCount > 0) {
      console.error(`\n[SPEC DRIFT] Found ${driftCount} story spec(s) out of sync. Run "npm run handoff:export -- --story" to regenerate.`)
      process.exitCode = 1
    }
    return
  }

  const files = readdirSync(FLOWS_DIR).filter((f) => f.endsWith('.flow.js'))
  const targetFiles = requestedSlug ? files.filter((f) => f === `${requestedSlug}.flow.js`) : files

  if (!targetFiles.length) {
    console.error(requestedSlug ? `No flow found for slug "${requestedSlug}"` : 'No flows found in src/handoff/flows/')
    await server.close()
    process.exitCode = 1
    return
  }

  // Compares expectedContent against what's on disk at outPath, logging
  // [DRIFT]/[PARITY] the same way story-mode verify does, and incrementing
  // the shared driftCount closure below. Used for every flow-mode output
  // (spec.md, spec.json, and — when requested — every codashop-client bundle
  // file), so none of them can report false "in sync" the way a
  // does-the-file-exist-only check (the original REG-RETRO03 bug) would.
  let driftCount = 0
  function verifyOne (label, outPath, expectedContent) {
    if (!existsSync(outPath)) {
      console.error(`[DRIFT] Missing ${label} at ${path.relative(ROOT, outPath)}`)
      driftCount++
    } else if (readFileSync(outPath, 'utf8') !== expectedContent) {
      console.error(`[DRIFT] ${label} out of sync: ${path.relative(ROOT, outPath)}`)
      driftCount++
    } else {
      console.log(`[PARITY] ${label} in sync: ${path.relative(ROOT, outPath)}`)
    }
  }

  const loadedFlows = []
  for (const file of targetFiles) {
    const mod = await server.ssrLoadModule(path.join(FLOWS_DIR, file))
    const flow = mod.default
    loadedFlows.push(flow)
    const outDir = path.join(OUT_DIR, flow.slug)
    const expectedMd = renderSpecMd(flow, STORE_KEYS)
    const expectedJson = renderSpecJson(flow, STORE_KEYS)

    if (isVerifyMode) {
      verifyOne(`${flow.slug} spec.md`, path.join(outDir, 'spec.md'), expectedMd)
      verifyOne(`${flow.slug} spec.json`, path.join(outDir, 'spec.json'), expectedJson)
    } else {
      mkdirSync(outDir, { recursive: true })
      writeFileSync(path.join(outDir, 'spec.md'), expectedMd)
      writeFileSync(path.join(outDir, 'spec.json'), expectedJson)
      console.log(`Exported ${flow.slug} -> docs/Handoff/${flow.slug}/{spec.md,spec.json}`)
    }

    if (target === 'codashop-client') {
      if (!existsSync(prodRoot)) {
        console.warn(`  --target=codashop-client requested but prod root not found at ${prodRoot} — skipping that bundle for ${flow.slug}. Pass --prod-root=<path>.`)
      } else if (!flow.targets || Object.keys(flow.targets).length === 0) {
        console.warn(`  --target=codashop-client requested but ${flow.slug} declares no "targets" — nothing to map. Skipping that bundle.`)
      } else if (isVerifyMode) {
        const bundleDir = path.join(outDir, 'for-codashop-client')
        const rows = crosswalkFlow(flow, prodRoot)
        verifyOne(`${flow.slug} for-codashop-client/AGENTS.md`, path.join(bundleDir, 'AGENTS.md'), renderAgentsMd(flow, rows))
        verifyOne(`${flow.slug} for-codashop-client/tokens.md`, path.join(bundleDir, 'tokens.md'), renderCrosswalkMarkdown(flow, rows, prodRoot))
        verifyOne(`${flow.slug} for-codashop-client/file-map.md`, path.join(bundleDir, 'file-map.md'), renderFileMapMd(flow))
        verifyOne(`${flow.slug} for-codashop-client/house-rules.md`, path.join(bundleDir, 'house-rules.md'), renderHouseRulesMd())
        verifyOne(`${flow.slug} for-codashop-client/spec.md`, path.join(bundleDir, 'spec.md'), renderSpecMd(flow, STORE_KEYS) + '\n' + renderContractMd(flow))
      } else {
        emitCodashopClientBundle(flow, prodRoot)
      }
    }
  }

  if (isVerifyMode) {
    await server.close()
    if (driftCount > 0) {
      console.error(`\n[SPEC DRIFT] Found ${driftCount} file(s) out of sync. Run "node scripts/export-handoff.mjs${target ? ` --target=${target}` : ''}" to regenerate.`)
      process.exitCode = 1
    }
    return
  }

  // Load every flow (not just the requested one) for the public mirror's llms.txt index,
  // so a single-slug export doesn't drop other features from the index.
  const allFiles = readdirSync(FLOWS_DIR).filter((f) => f.endsWith('.flow.js'))
  const allFlows = await Promise.all(
    allFiles.map(async (f) => (await server.ssrLoadModule(path.join(FLOWS_DIR, f))).default),
  )
  emitPublicMirror(allFlows)

  await server.close()
}

main().catch((err) => { console.error(err); process.exitCode = 1 })
