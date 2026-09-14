#!/usr/bin/env node
/**
 * tools/cms/create-store.mjs — headless "onboard a new title" CLI.
 *
 * Usage:
 *   node tools/cms/create-store.mjs path/to/definition.json
 *
 * The definition JSON shape (see tools/cms/schema/*.js for the field-level
 * schema this validates against loosely — this CLI does the minimum required
 * to produce a buildable store, matching setup-checklist.md's Phase 0-2 order):
 *
 * {
 *   "key": "mytitle", "label": "My Title",
 *   "theme": { "seeds": { "primary": "oklch(0.72 0.19 142.5)", ... all 7 ... },
 *              "fonts": [], "typography": {} },
 *   "config": { ...every required flag from schema/config.js... },
 *   "strings": { ...every required group from schema/strings.js... },
 *   "translations": {},
 *   "assets": "placeholder" | { "brand": {...}, "content": {...} },
 *   "catalog": [...] | null, "featured": null, "skus": undefined
 * }
 *
 * Exits non-zero on any generator error (missing required field, bad seed,
 * etc.) — never writes a partial store.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import { generateThemeCss } from './generators/theme.mjs'
import { generateStoreModule } from './generators/store-module.mjs'
import { generateCatalogModule } from './generators/catalog.mjs'
import { scaffoldPlaceholderAssets } from './generators/assets.mjs'
import { getWriter } from './server/writers/index.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../..')

async function main () {
  const defPath = process.argv[2]
  if (!defPath) {
    console.error('Usage: node tools/cms/create-store.mjs path/to/definition.json')
    process.exit(2)
  }

  const definition = JSON.parse(readFileSync(resolve(defPath), 'utf8'))
  const { key, label, theme, config, strings, translations = {}, catalog = null, featured = null, skus } = definition

  if (!key || !/^[a-z][a-z0-9-]*$/.test(key)) {
    throw new Error(`definition.key must be a lowercase identifier (got ${JSON.stringify(key)})`)
  }

  const writer = getWriter()

  const assets = definition.assets === 'placeholder'
    ? await scaffoldPlaceholderAssets(writer, { repoRoot: REPO_ROOT, key })
    : definition.assets

  const themeCss = generateThemeCss({ key, ...theme })

  const splitCatalog = config?.catalog?.mode === 'filter' && catalog !== null
  const catalogModuleSrc = splitCatalog
    ? generateCatalogModule({ label, catalog, featured })
    : null

  const storeModuleSrc = generateStoreModule({
    key, label, config, strings, translations, assets,
    catalog: splitCatalog ? null : catalog,
    featured: splitCatalog ? null : featured,
    skus,
  })

  const { storeDir: writtenDir, files } = await writer.writeStore({
    repoRoot: REPO_ROOT, key, storeModuleSrc, catalogModuleSrc, themeCss, definition,
  })

  console.log(`Created store "${key}" at ${writtenDir}`)
  for (const f of files) console.log(`  ${f}`)
  console.log(`\nNext: npx vite build --mode ${key}   (or npx vite --mode ${key} for dev)`)
}

main().catch(err => {
  console.error(`create-store failed: ${err.message}`)
  process.exit(1)
})
