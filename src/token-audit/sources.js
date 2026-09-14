/**
 * sources.js — the browser source loader for the /tokens dashboard.
 *
 * `import.meta.glob(..., { query: '?raw', eager: true })` is build-time:
 * mirrors src/handoff/registry.js's `import.meta.glob(..., { eager: true })`
 * comment almost verbatim — in a store-locked ("isolated") build nothing
 * imports THIS module (buildTokenAudit() is only called from
 * TokenAuditApp.vue, which App.vue only mounts behind `!__STORE_LOCKED__`),
 * so the whole raw-source tree (every token CSS file, every .vue, every .js
 * under src/) tree-shakes out of a real per-store build and never reaches
 * the shipped bundle.
 *
 * This is the ONLY file in src/token-audit/ that uses `import.meta` — the
 * engine in core/ is framework-free and runs identically here and in
 * scripts/token-audit.mjs (Node, readFileSync).
 */
import { buildAudit } from './core/build.js'
import { ACTIVE_STORES } from '@active-stores'

const cssModules = import.meta.glob('/src/tokens/**/*.css', { query: '?raw', import: 'default', eager: true })
const vueModules = import.meta.glob('/src/**/*.vue', { query: '?raw', import: 'default', eager: true })
const jsModules = import.meta.glob('/src/**/*.js', { query: '?raw', import: 'default', eager: true })

function toTokenCssSources () {
  const prefix = '/src/tokens/'
  return Object.entries(cssModules)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, text]) => ({ file: k.slice(prefix.length), text }))
}

function toRepoRelSources (modules) {
  return Object.entries(modules).map(([k, text]) => ({ file: k.replace(/^\//, ''), text }))
}

let cached = null

/** Build (and memoise) the audit model from the live source tree. */
export function getTokenAudit () {
  if (cached) return cached
  const tokenCss = toTokenCssSources()
  const vue = toRepoRelSources(vueModules)
  const js = toRepoRelSources(jsModules)
  const storeModuleKeys = ACTIVE_STORES.map((s) => s.key)
  cached = buildAudit({ tokenCss, vue, js, storeModuleKeys })
  return cached
}

/** Source-file counts, for the "Scan scope" disclosure. */
export function sourceCounts () {
  return {
    tokenCss: toTokenCssSources().length,
    vue: Object.keys(vueModules).length,
    js: Object.keys(jsModules).length,
  }
}
