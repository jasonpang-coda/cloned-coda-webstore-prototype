/**
 * tools/sandbox/lib/vendor.mjs — shared curated-component/token/store
 * vendoring, extracted from export-sandbox.mjs in Milestone 2 so pack-kit.mjs
 * (the git-installable kit packer) can reuse the exact same closure-walk +
 * boundary-rule + token/store copying instead of duplicating it. Every
 * function takes a single `ctx` object so call sites can't mix up argument
 * order — see export-sandbox.mjs/pack-kit.mjs for the ctx shape each builds.
 *
 * Multi-store support (Milestone 2): every function that used to take one
 * `store` string now takes `ctx.stores` (a non-empty array) — a single-store
 * caller just passes a length-1 array. `ctx.stores[0]` is always the
 * "primary" store (catalog.json's resolved column, the theme
 * `<html data-theme>` boots into).
 */
import {
  copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { section, tableCells, parseSpecMd, toKebab } from './markdown.mjs'

const IMPORT_RE = /import\s*(?:[^'"]*?\sfrom\s*)?\(?\s*['"]([^'"]+)['"]/g
const CODE_EXTS = new Set(['.vue', '.js'])

function relFromComponents(SRC, absPath) {
  return path.relative(path.join(SRC, 'components'), absPath).split(path.sep).join('/')
}

/**
 * Throws a loud, descriptive error if resolved lands in an excluded area.
 * Throws rather than calling process.exit() directly — every function in
 * this lib does — so this stays unit-testable in-process (a test can
 * `assert.throws()` a violation without killing the test runner) and so CLI
 * entry points (export-sandbox.mjs / pack-kit.mjs) own the single place that
 * turns a thrown error into a printed message + exit code.
 */
export function assertNotExcluded(resolvedAbs, importedBy, ctx) {
  const { SRC, ROOT, EXCLUDED_COMPONENT_DIRS, EXCLUDED_COMPONENT_FILES } = ctx
  if (!resolvedAbs.startsWith(path.join(SRC, 'components'))) return
  const rel = relFromComponents(SRC, resolvedAbs)
  const topDir = rel.split('/')[0]
  const base = path.basename(rel)
  if (EXCLUDED_COMPONENT_DIRS.includes(topDir) || EXCLUDED_COMPONENT_FILES.includes(base)) {
    throw new Error(
      `Boundary violation: "${rel}" is excluded from the ideation sandbox ` +
      `(checkout/payment/nav-chrome/overlay-sheet internals), but is imported by:\n` +
      `    ${path.relative(ROOT, importedBy)}\n\n` +
      `Either drop that curated component from CURATED_COMPONENTS in ` +
      `curated.manifest.mjs, or — if this edge is actually fine to include — ` +
      `move "${base}" out of EXCLUDED_COMPONENT_FILES/DIRS deliberately.`,
    )
  }
}

function resolveSpecifier(SRC, specifier, fromFileAbs) {
  if (specifier.startsWith('@/')) return path.join(SRC, specifier.slice(2))
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    return path.resolve(path.dirname(fromFileAbs), specifier)
  }
  return null // bare specifier (npm dep, or @active-stores — handled separately)
}

/**
 * Walks the import closure of CURATED_COMPONENTS + ALWAYS_VENDOR, enforcing
 * the boundary rule on every seed AND every transitively-discovered file.
 * Returns the full Set of absolute file paths to vendor (components,
 * composables, directives, assets — anything CODE_EXTS or not).
 */
export function walkClosure(ctx) {
  const { SRC, ROOT } = ctx
  const seedAbsPaths = [
    ...ctx.CURATED_COMPONENTS.map((rel) => path.join(SRC, 'components', rel)),
    ...ctx.ALWAYS_VENDOR.map((rel) => path.join(SRC, rel)),
  ]

  const visited = new Set()
  const queue = [...seedAbsPaths]

  // A seed can itself be an excluded file (e.g. someone adds 'checkout/
  // PcCard.vue' straight to CURATED_COMPONENTS) — that must fail the same
  // way a transitively-imported excluded file does. Checked up front, not
  // just on imports discovered mid-walk.
  for (const seed of seedAbsPaths) assertNotExcluded(seed, 'curated.manifest.mjs (seed list)', ctx)

  while (queue.length) {
    const current = queue.shift()
    if (visited.has(current)) continue
    if (!existsSync(current)) {
      console.warn(`  ! Referenced file missing, skipping: ${path.relative(ROOT, current)}`)
      continue
    }
    visited.add(current)

    const ext = path.extname(current)
    if (!CODE_EXTS.has(ext)) continue // asset — copied, not parsed

    const content = readFileSync(current, 'utf8')
    let m
    IMPORT_RE.lastIndex = 0
    while ((m = IMPORT_RE.exec(content)) !== null) {
      const specifier = m[1]
      if (specifier.endsWith('.css')) continue // token cascade vendored separately
      if (specifier === '@active-stores' || specifier === 'vue') continue // aliased/external
      const resolved = resolveSpecifier(SRC, specifier, current)
      if (resolved === null) continue // other bare specifier (npm dep) — not vendored
      assertNotExcluded(resolved, current, ctx)
      if (!visited.has(resolved)) queue.push(resolved)
    }
  }

  return visited
}

export function copyClosure(closure, ctx) {
  const { SRC, VENDOR } = ctx
  let count = 0
  for (const abs of closure) {
    const rel = path.relative(SRC, abs)
    const out = path.join(VENDOR, rel)
    mkdirSync(path.dirname(out), { recursive: true })
    copyFileSync(abs, out)
    count++
  }
  console.log(`  + ${count} vendored component/composable/asset files (closure walk)`)
  return count
}

/** Token cascade (preserving ds/ structure) + every requested store's theme. */
export function copyTokens(ctx) {
  const { SRC, VENDOR, stores, TOKEN_FILES } = ctx
  const tokensSrc = path.join(SRC, 'tokens')
  const tokensDest = path.join(VENDOR, 'tokens')
  for (const rel of TOKEN_FILES) {
    const src = path.join(tokensSrc, rel)
    if (!existsSync(src)) { console.warn(`  ! Missing token file: ${rel}`); continue }
    const out = path.join(tokensDest, rel)
    mkdirSync(path.dirname(out), { recursive: true })
    copyFileSync(src, out)
  }
  for (const store of stores) {
    const themeRel = `ds/themes/${store}.css`
    const themeSrc = path.join(tokensSrc, themeRel)
    if (!existsSync(themeSrc)) {
      throw new Error(`Missing theme file for store "${store}": src/tokens/${themeRel}`)
    }
    const themeOut = path.join(tokensDest, themeRel)
    mkdirSync(path.dirname(themeOut), { recursive: true })
    copyFileSync(themeSrc, themeOut)
  }
  console.log(`  + token cascade (${TOKEN_FILES.length} files) + ds/themes/{${stores.join(',')}}.css`)
}

/** Wholesale-copies every requested store's dir (once each) + shared/locale. */
export function copyWholesale(ctx) {
  const { SRC, VENDOR, stores, WHOLESALE_DIRS } = ctx
  for (const store of stores) {
    cpSync(path.join(SRC, 'stores', store), path.join(VENDOR, 'stores', store), { recursive: true })
  }
  for (const dir of WHOLESALE_DIRS) {
    const src = path.join(SRC, dir)
    if (!existsSync(src)) continue
    cpSync(src, path.join(VENDOR, dir), { recursive: true })
  }
  console.log(`  + stores/{${stores.join(',')}}/ + ${WHOLESALE_DIRS.join('/')}/  (wholesale)`)
}

/**
 * Generates the static @active-stores replacement — N imports for N vendored
 * stores, exactly mirroring vite.config.js's real `load()` codegen shape for
 * both the locked (N=1) and all-stores (N>1) cases.
 */
export function writeActiveStores(ctx) {
  const { VENDOR, stores } = ctx
  const imports = stores.map((s, i) => `import s${i} from './stores/${s}/store.js'`).join('\n')
  const list = stores.map((_, i) => `s${i}`).join(', ')
  writeFileSync(
    path.join(VENDOR, 'active-stores.js'),
    `// GENERATED — static replacement for the real repo's @active-stores\n` +
    `// virtual module (this bundle has no vite multi-store plugin; a plain\n` +
    `// static array of the vendored stores is all @active-stores ever was).\n` +
    `${imports}\n` +
    `export const ACTIVE_STORES = [${list}]\n`,
    'utf8',
  )
}

/**
 * catalog.json — parsed from each curated component's existing
 * docs/Handoff/components/<slug>/spec.md file, resolved against
 * ctx.stores[0] (the "primary" store). Writes to
 * <outDir>/catalog.json.
 */
export function writeCatalog(outDir, ctx) {
  const { ROOT, CURATED_COMPONENTS, stores } = ctx
  const storeKeyUpper = stores[0].toUpperCase()
  const catalog = []
  for (const seed of CURATED_COMPONENTS) {
    const name = path.basename(seed, '.vue')
    const slug = toKebab(name)
    const specPath = path.join(ROOT, 'docs/Handoff/components', slug, 'spec.md')
    if (!existsSync(specPath)) {
      console.warn(`  ! No handoff spec for "${name}" (slug "${slug}") — skipped in catalog.json`)
      continue
    }
    const parsed = parseSpecMd(readFileSync(specPath, 'utf8'), storeKeyUpper)
    catalog.push({ name, slug, ...parsed })
  }
  writeFileSync(
    path.join(outDir, 'catalog.json'),
    JSON.stringify({ store: stores[0], stores, components: catalog }, null, 2),
    'utf8',
  )
  console.log(`  + catalog.json (${catalog.length}/${CURATED_COMPONENTS.length} components, resolved against ${stores[0]})`)
}

export { section, tableCells }
