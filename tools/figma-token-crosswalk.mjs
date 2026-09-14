#!/usr/bin/env node
/**
 * tools/figma-token-crosswalk.mjs — cross-reference a traced Figma variable
 * alias-chain dump against this repo's own numeric (spacing/radius/size/
 * stroke) token declarations, so "does the repo already have this" stops
 * being a manual space.css/semantics.css read (see plans/tickets/in-progress/figma-token-sync.md
 * Batch 1, done by hand — this is the automatable half of that process).
 *
 * Scope: NUMERIC tokens only (px/unitless values — spacing, radius, size,
 * stroke weight). Color tokens are a different, already-solved problem —
 * `tools/figma-harness.mjs diff-tokens` does real OKLCH↔sRGB comparison
 * against a real Figma variables export; this tool does not duplicate that,
 * per the design-harness skill's one-extractor-per-problem convention.
 *
 * Input: a JSON file shaped like the output of the reusable use_figma
 * alias-walk script in plans/tickets/in-progress/figma-token-sync.md —
 *   [{ requestedId, chain: [{ variableName, rawValue, collectionName, ... }, ...] }, ...]
 * `chain[0]` is the Figma SEMANTIC variable; the last entry with a
 * non-alias `rawValue` is its terminal (sys-tier) numeric value.
 *
 * What this does NOT do: decide semantic correctness on its own. Matching by
 * value can't tell "--x-gap-content-loose" from "--x-pad-surface-m" when
 * both alias the same 12px primitive — it ranks every candidate by
 * name-segment overlap with the Figma variable's own name and reports all of
 * them, so a human (or the figma-token-trace skill) makes the final call,
 * exactly as plans/tickets/in-progress/figma-token-sync.md's Batch 1 did by hand for Grid.
 *
 * Also deliberately BASE-cascade only (no --store flag): it reads each
 * token's own declared value from getAllTokens(), not the full per-store
 * cascade scripts/resolve-css.mjs computes — a lighter, different question
 * ("does a repo primitive/semantic pair exist at all") than "what does this
 * token resolve to in store X" (which resolve-css.mjs already answers).
 *
 * Usage:
 *   node tools/figma-token-crosswalk.mjs --figma-file <path-to-trace-dump.json> [--json]
 */

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllTokens } from './token-cli.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ── repo token indexing ──────────────────────────────────────────────────

const LITERAL_NUMERIC_RE = /^-?[\d.]+(?:px)?$/
const SIMPLE_ALIAS_RE = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/

/**
 * Index every declared repo token into:
 *  - `literals`: name -> numeric px value, for tokens whose OWN declared
 *    value is a raw number (the primitive tier, e.g. --x-sys-space-main).
 *  - `aliasOf`: name -> the single --token it aliases, for tokens whose OWN
 *    declared value is a plain `var(--x)` reference (ignoring the fallback
 *    arg, if any) — anything with calc()/multiple var()s/oklch()/etc. is
 *    left out of both maps (not a numeric crosswalk candidate).
 *  - `fileOf`: name -> the file it's declared in, for reporting.
 */
function indexRepoTokens() {
  const { tokens } = getAllTokens()
  const literals = new Map()
  const aliasOf = new Map()
  const fileOf = new Map()

  for (const t of tokens) {
    // getAllTokens() also walks ds/themes/*.css (tier 'theme') — a per-store
    // override is a different question (that's resolve-css.mjs's job), so
    // this crosswalk only indexes the base (:root / non-theme) declarations.
    if (t.tier === 'theme') continue
    if (!fileOf.has(t.name)) fileOf.set(t.name, t.file)

    const val = t.value.trim()
    const litMatch = val.match(LITERAL_NUMERIC_RE)
    if (litMatch) {
      literals.set(t.name, parseFloat(val))
      continue
    }
    const aliasMatch = val.match(SIMPLE_ALIAS_RE)
    if (aliasMatch) {
      aliasOf.set(t.name, aliasMatch[1])
    }
    // else: complex value (color, calc(), multi-var composite) — not indexed.
  }

  // Resolve every alias down to its terminal literal value (walk, memoized).
  const resolvedCache = new Map()
  function resolveValue(name, seen = new Set()) {
    if (resolvedCache.has(name)) return resolvedCache.get(name)
    if (literals.has(name)) {
      const v = literals.get(name)
      resolvedCache.set(name, v)
      return v
    }
    const target = aliasOf.get(name)
    if (!target || seen.has(target)) {
      resolvedCache.set(name, null)
      return null
    }
    seen.add(target)
    const v = resolveValue(target, seen)
    resolvedCache.set(name, v)
    return v
  }

  const valueToNames = new Map() // numeric value -> [tokenName, ...]
  for (const name of new Set([...literals.keys(), ...aliasOf.keys()])) {
    const v = resolveValue(name)
    if (v === null) continue
    if (!valueToNames.has(v)) valueToNames.set(v, [])
    valueToNames.get(v).push(name)
  }

  return { literals, aliasOf, fileOf, valueToNames, resolveValue }
}

// ── name-overlap scoring ─────────────────────────────────────────────────

// Segments an org would recognize as noise on either side — drop before scoring.
const STOPWORDS = new Set(['x', 'sys', 'default'])

function segmentsOf(name) {
  return name
    .toLowerCase()
    .split(/[/\-]/)
    .filter((s) => s && !STOPWORDS.has(s))
}

function overlapScore(figmaName, repoTokenName) {
  const a = new Set(segmentsOf(figmaName))
  const b = new Set(segmentsOf(repoTokenName))
  let score = 0
  for (const seg of a) if (b.has(seg)) score++
  return score
}

// ── crosswalk ────────────────────────────────────────────────────────────

function crosswalkOne(entry, repo) {
  const chain = entry.chain || []
  const semanticHop = chain[0] || null
  // Terminal hop = last entry with a plain numeric rawValue (not an alias
  // object, not itself missing).
  let terminalHop = null
  for (let i = chain.length - 1; i >= 0; i--) {
    const c = chain[i]
    if (c && typeof c.rawValue !== 'object') { terminalHop = c; break }
  }

  const result = {
    requestedId: entry.requestedId,
    figmaSemanticName: semanticHop ? semanticHop.variableName : null,
    figmaSysName: terminalHop ? terminalHop.variableName : null,
    value: terminalHop ? terminalHop.rawValue : null,
    status: '🆕',
    primitiveMatches: [],
    semanticMatches: [],
    note: null,
  }

  if (entry.error || !terminalHop || typeof terminalHop.rawValue !== 'number') {
    result.status = '❓'
    result.note = entry.error || 'could not find a terminal numeric value in this chain'
    return result
  }

  const value = terminalHop.rawValue
  const candidateNames = repo.valueToNames.get(value) || []
  if (candidateNames.length === 0) {
    result.status = '🆕'
    result.note = `no repo token (base cascade) resolves to ${value} at all`
    return result
  }

  const primitives = candidateNames.filter((n) => repo.literals.has(n))
  const semantics = candidateNames.filter((n) => repo.aliasOf.has(n))

  result.primitiveMatches = primitives.map((n) => ({ name: n, file: repo.fileOf.get(n) }))

  const scored = semantics
    .map((n) => ({
      name: n,
      file: repo.fileOf.get(n),
      aliasChain: describeAliasChain(n, repo),
      score: Math.max(
        overlapScore(result.figmaSemanticName || '', n),
        overlapScore(result.figmaSysName || '', n)
      ),
    }))
    .sort((a, b) => b.score - a.score)

  result.semanticMatches = scored

  if (scored.length === 0) {
    result.status = '⚠️'
    result.note = `value ${value} exists as a repo primitive (${primitives.join(', ') || '—'}) but nothing aliases it semantically`
  } else if (scored[0].score === 0) {
    result.status = '⚠️'
    result.note = 'candidates exist at the right value but none share a name segment with the Figma variable — confirm manually'
  } else {
    result.status = '✅'
  }

  return result
}

function describeAliasChain(name, repo) {
  const parts = [name]
  let cur = name
  const seen = new Set([name])
  while (repo.aliasOf.has(cur)) {
    cur = repo.aliasOf.get(cur)
    if (seen.has(cur)) { parts.push(`${cur} (cycle)`); break }
    seen.add(cur)
    parts.push(cur)
  }
  return parts.join(' → var(') + ')'.repeat(parts.length - 1)
}

// ── CLI ──────────────────────────────────────────────────────────────────

function printHuman(results) {
  const counts = { '✅': 0, '⚠️': 0, '🆕': 0, '❓': 0 }
  for (const r of results) {
    counts[r.status] = (counts[r.status] || 0) + 1
    console.log(`\n${r.status} ${r.figmaSemanticName || r.requestedId}${r.figmaSysName ? ` → ${r.figmaSysName}` : ''}${r.value != null ? ` = ${r.value}` : ''}`)
    if (r.note) console.log(`   ${r.note}`)
    if (r.primitiveMatches.length) {
      console.log(`   repo primitives at this value: ${r.primitiveMatches.map((p) => `${p.name} (${p.file})`).join(', ')}`)
    }
    if (r.semanticMatches.length) {
      console.log('   repo semantic candidates (ranked by name overlap with the Figma variable):')
      for (const s of r.semanticMatches.slice(0, 5)) {
        console.log(`     [score ${s.score}] ${s.name}  (${s.aliasChain})  — ${s.file}`)
      }
    }
  }
  console.log(`\n--- Summary: ${counts['✅']} already correct · ${counts['⚠️']} needs a look · ${counts['🆕']} no repo match · ${counts['❓']} couldn't trace ---`)
  console.log('Record ✅/⚠️/🆕 rows in plans/tickets/in-progress/figma-token-sync.md as a new dated batch — this tool ranks candidates, it does not decide semantic correctness.')
}

const args = process.argv.slice(2)
const isJson = args.includes('--json')
const fileFlagIndex = args.indexOf('--figma-file')
const figmaFile = fileFlagIndex !== -1 ? args[fileFlagIndex + 1] : null

if (!figmaFile) {
  console.error('Usage: node tools/figma-token-crosswalk.mjs --figma-file <path-to-trace-dump.json> [--json]')
  console.error('The input file is the JSON array returned by the reusable use_figma alias-walk script in plans/tickets/in-progress/figma-token-sync.md.')
  process.exit(1)
}

const fullPath = path.isAbsolute(figmaFile) ? figmaFile : path.resolve(process.cwd(), figmaFile)
if (!existsSync(fullPath)) {
  console.error(`Error: --figma-file not found: ${path.relative(ROOT, fullPath)}`)
  process.exit(1)
}

let entries
try {
  entries = JSON.parse(readFileSync(fullPath, 'utf8'))
} catch (e) {
  console.error(`Error: --figma-file is not valid JSON (${e.message})`)
  process.exit(1)
}
if (!Array.isArray(entries)) {
  console.error('Error: --figma-file must contain a JSON array (the shape the reusable use_figma trace script returns).')
  process.exit(1)
}

const repo = indexRepoTokens()
const results = entries.map((e) => crosswalkOne(e, repo))

if (isJson) {
  console.log(JSON.stringify(results, null, 2))
} else {
  printHuman(results)
}
