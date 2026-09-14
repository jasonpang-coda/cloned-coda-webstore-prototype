/**
 * generators/store-module.mjs — a plain-data store definition → `store.js`.
 *
 * The one rule this generator exists to protect: every image in this codebase
 * is a build-time Vite `import`, never a runtime URL string — that's what
 * keeps store-locked bundles free of other stores' art and gives every asset
 * a fingerprinted, cacheable filename. So this generator never emits a URL;
 * it emits an `import` statement and references the bound identifier.
 *
 * Asset references can appear anywhere in the definition — not just under
 * `assets`, but inside `catalog[].subcategories[].items[].skuImage`,
 * `skus.cp[].skuImage`, `featured[].bannerImage`, etc. Rather than hardcoding
 * every field path, this walks the whole definition and treats any string
 * starting with `./`, `../`, or `@/` as an asset reference to import — the
 * same conventions a relative or aliased import specifier already use (`@/`
 * is the `src/` alias — every store also pulls in the market-shared
 * `coda`/`rating` brand marks this way, e.g. `@/shared/brand/coda.svg`), so
 * it never collides with a real string value (URLs are absolute, `'#'`
 * placeholders aren't paths, copy doesn't start with a dot-slash or `@/`).
 *
 * Known limitation (found while verifying this generator against pvz3's real
 * store.js): a shared NON-ASSET reference — e.g. `config.locale:
 * LOCALE_SETS.codashop`, a live import of a shared data object rather than an
 * image — has no representation in a plain-data JSON definition. Today the
 * generator can only inline such a value (duplicating it into the new store's
 * config rather than sharing the reference); a definition wanting to reuse a
 * named export from src/locale/sets.js or similar needs a `{ $ref:
 * 'module/path#exportName' }` convention this generator doesn't implement yet.
 */

const ASSET_PATH_RE = /^(\.\.?\/|@\/)/

function isAssetPath (value) {
  return typeof value === 'string' && ASSET_PATH_RE.test(value)
}

class AssetRef {
  constructor (path) { this.path = path }
}

// First pass: wrap every asset-looking string in an AssetRef marker so the
// serializer can tell "a path to import" apart from "a string to quote".
function markAssets (value) {
  if (isAssetPath(value)) return new AssetRef(value)
  if (Array.isArray(value)) return value.map(markAssets)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = markAssets(v)
    return out
  }
  return value
}

function collectAssetPaths (value, seen = new Set(), order = []) {
  if (value instanceof AssetRef) {
    if (!seen.has(value.path)) { seen.add(value.path); order.push(value.path) }
    return order
  }
  if (Array.isArray(value)) { for (const v of value) collectAssetPaths(v, seen, order); return order }
  if (value && typeof value === 'object') { for (const v of Object.values(value)) collectAssetPaths(v, seen, order); return order }
  return order
}

function identFor (assetPath, used) {
  const stem = assetPath.split('/').pop().replace(/\.[a-z0-9]+$/i, '')
  let ident = stem
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[0-9]/, '_$&')
  if (!ident) ident = 'asset'
  ident = ident[0].toLowerCase() + ident.slice(1)
  let candidate = ident, n = 1
  while (used.has(candidate)) candidate = `${ident}${n++}`
  used.add(candidate)
  return candidate
}

function jsKey (key) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key)
}

function toJs (value, identMap, indent = 0) {
  const pad = '  '.repeat(indent)
  const padIn = '  '.repeat(indent + 1)
  if (value instanceof AssetRef) return identMap.get(value.path)
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'string') return JSON.stringify(value)
  if (Array.isArray(value)) {
    if (!value.length) return '[]'
    const items = value.map(v => `${padIn}${toJs(v, identMap, indent + 1)}`).join(',\n')
    return `[\n${items}\n${pad}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
    if (!entries.length) return '{}'
    const lines = entries.map(([k, v]) => `${padIn}${jsKey(k)}: ${toJs(v, identMap, indent + 1)}`).join(',\n')
    return `{\n${lines}\n${pad}}`
  }
  throw new Error(`Cannot serialize value of type ${typeof value}`)
}

/**
 * @param {object} def - plain-data store definition (see tools/cms/schema/*)
 * @param {string} def.key
 * @param {string} def.label
 * @param {object} def.config
 * @param {object} def.strings
 * @param {object} [def.translations]
 * @param {object} def.assets - { brand: {...}, content: {...} }, values are
 *   relative asset paths (or null) — never resolved URLs.
 * @param {Array|null} [def.catalog]
 * @param {Array|null} [def.featured]
 * @param {object} [def.skus]
 * @param {Array} [def.transactions]
 */
export function generateStoreModule (def) {
  const { key, label, config, strings, translations = {}, assets, catalog = null, featured = null, skus, transactions = [] } = def
  if (!key) throw new Error('def.key is required')
  if (!config) throw new Error('def.config is required')
  if (!strings) throw new Error('def.strings is required')
  if (!assets) throw new Error('def.assets is required')

  // Filter-mode stores keep their catalogue tree in a sibling catalog.js (see
  // generators/catalog.mjs) — matching the existing fcm/pvz3 convention —
  // rather than inlining a potentially large tree into store.js.
  const splitCatalog = config?.catalog?.mode === 'filter' && catalog !== null

  const marked = markAssets(splitCatalog ? { assets, skus } : { assets, catalog, featured, skus })
  const assetPaths = collectAssetPaths(marked)

  const used = new Set()
  const identMap = new Map()
  for (const path of assetPaths) identMap.set(path, identFor(path, used))

  const assetImportLines = assetPaths
    .map(path => `import ${identMap.get(path)} from ${JSON.stringify(path)}`)
    .join('\n')

  const catalogImportLine = splitCatalog ? `import { catalog, featured } from './catalog.js'` : ''

  const exportObj = {
    key, label,
    config,
    strings,
    translations,
    assets: marked.assets,
    ...(splitCatalog
      ? {} // catalog/featured are referenced as bare identifiers below, not literals
      : { catalog: marked.catalog, featured: marked.featured }),
    ...(skus !== undefined ? { skus: marked.skus } : {}),
    transactions,
  }

  let body = toJs(exportObj, identMap, 0)
  if (splitCatalog) {
    // Splice in the imported `catalog`/`featured` identifiers as the last two
    // top-level properties, matching the field order every other generated
    // store uses (config, strings, translations, assets, catalog, featured, skus, transactions).
    body = body.replace(/\n(\s*)transactions:/, `\n$1catalog,\n$1featured,\n$1transactions:`)
  }

  const importLines = [catalogImportLine, assetImportLines].filter(Boolean).join('\n')

  return `/**
 * ${label} store module — GENERATED by tools/cms (store-module.mjs) from
 * src/stores/${key}/store.config.json. Do not hand-edit this file directly;
 * edit the JSON definition (or the store-CMS dashboard) and regenerate, or the
 * next regeneration will silently overwrite your change.
 *
 * Imported only via the @active-stores virtual module (vite.config.js), so a
 * build that doesn't include ${label} never bundles these assets, fonts, or
 * theme CSS.
 */

import '@/tokens/ds/themes/${key}.css'
${importLines ? '\n' + importLines + '\n' : ''}
export default ${body}
`
}
