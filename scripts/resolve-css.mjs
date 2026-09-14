/**
 * resolve-css.mjs — deterministic, no-browser token resolver for the static
 * handoff export. Mirrors what src/handoff/resolve.js does live in the
 * browser (via getComputedStyle), but for a build script that can't spin up
 * a DOM: it re-derives the same cascade result by parsing the token CSS
 * files in the exact order src/main.js imports them, and simulating the
 * import-order + specificity rule documented in the web-store-tokens skill
 * (§3): `html[data-theme="x"]` (specificity 0,1,1) always wins over a bare
 * `:root` or `[data-theme="x"]` declaration (specificity 0,1,0) regardless of
 * source order; among declarations of EQUAL specificity, the later-imported
 * file wins.
 *
 * Used by export-handoff.mjs so the generated spec.md never contains a
 * hand-transcribed value — every "Resolved" column is produced by this
 * resolver from the actual CSS on disk, at export time.
 *
 * The actual cascade/specificity engine now lives in
 * src/token-audit/core/cascade.js, so it can also run in the browser (no
 * `node:fs`) for the /tokens usage dashboard. This file is now just the
 * `node:fs` source loader + a thin, signature-compatible wrapper — nothing
 * downstream (export-handoff.mjs) needed to change.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { buildCascadeForStore, buildDeclarationUniverse, ROOT_TIER_FILES } from '../src/token-audit/core/cascade.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TOKENS_DIR = path.join(ROOT, 'src/tokens')

function readSource (relPath) {
  const abs = path.join(TOKENS_DIR, relPath)
  try {
    return { file: relPath, text: readFileSync(abs, 'utf8') }
  } catch {
    return null
  }
}

function themeRelPath (storeKey) {
  return `ds/themes/${storeKey}.css`
}

// The universe only needs parsing once per process — every theme file plus
// every ROOT_TIER_FILES entry, store-independent.
let universeCache = null
function getUniverse () {
  if (universeCache) return universeCache
  const themeDir = path.join(TOKENS_DIR, 'ds/themes')
  const themeFiles = readdirSync(themeDir).filter((f) => f.endsWith('.css')).map((f) => `ds/themes/${f}`)
  const sources = [...themeFiles, ...ROOT_TIER_FILES]
    .map(readSource)
    .filter(Boolean)
  universeCache = buildDeclarationUniverse(sources)
  return universeCache
}

/**
 * Resolve one or more token names for a store. Returns { [tokenName]: resolvedValue }.
 * A name absent from the map resolves to null (caller should treat this as
 * "resolve live" rather than guessing).
 */
export function resolveTokensForStore (tokenNames, storeKey) {
  const universe = getUniverse()
  const fileOrder = [themeRelPath(storeKey), ...ROOT_TIER_FILES]
  const cascade = buildCascadeForStore(universe, storeKey, fileOrder)
  const out = {}
  for (const name of tokenNames) {
    out[name] = name in cascade.base ? cascade.base[name] : null
  }
  return out
}

/** Resolve one or more tokens across every given store key. Returns storeKey -> tokenName -> value. */
export function resolveTokensAcrossStores (tokenNames, storeKeys) {
  const out = {}
  for (const store of storeKeys) out[store] = resolveTokensForStore(tokenNames, store)
  return out
}
