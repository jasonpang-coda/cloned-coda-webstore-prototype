/**
 * server/writers/fs.mjs — the local write/read layer: generated file
 * contents go straight to disk, store discovery is a directory scan.
 * `writers/github.mjs` implements the same exports (writeStore, writeAsset,
 * discoverStores, readDefinition) against the GitHub Contents API instead —
 * see writers/index.mjs for how one gets selected. Every export here is
 * `async` (even though the fs calls are sync) purely so call sites can
 * `await writer.xyz(...)` uniformly regardless of which writer is active.
 */

import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'

export async function discoverStores ({ repoRoot }) {
  const storesDir = resolve(repoRoot, 'src/stores')
  return readdirSync(storesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(resolve(storesDir, d.name, 'store.js')))
    .map(d => d.name)
    .sort()
}

export async function readDefinition ({ repoRoot, key }) {
  const path = resolve(repoRoot, 'src/stores', key, 'store.config.json')
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf8'))
}

/**
 * @param {object} args
 * @param {string} args.repoRoot
 * @param {string} args.key
 * @param {'brand'|'content'|'fonts'} args.slot
 * @param {string} args.name - destination filename
 * @param {Buffer} args.buffer - file contents
 * @returns {Promise<{ path: string }>} relative import path, e.g. './img/brand/wordmark.svg'
 */
export async function writeAsset ({ repoRoot, key, slot, name, buffer }) {
  const storeDir = resolve(repoRoot, 'src/stores', key)
  const subdir = slot === 'fonts' ? 'fonts' : `img/${slot}`
  const destDir = resolve(storeDir, subdir)
  mkdirSync(destDir, { recursive: true })
  writeFileSync(resolve(destDir, name), buffer)
  return { path: `./${subdir}/${name}` }
}

/**
 * @param {object} args
 * @param {string} args.repoRoot
 * @param {string} args.key
 * @param {string} args.storeModuleSrc - store.js file contents
 * @param {string} [args.catalogModuleSrc] - catalog.js file contents (filter-mode stores only)
 * @param {string} args.themeCss - themes/<key>.css file contents
 * @param {object} args.definition - the JSON definition, persisted alongside
 *   store.js as the round-trip source of truth (see Part 3's "JSON is the
 *   source of truth, store.js is generated" model).
 * @param {boolean} [args.overwrite=false] - guard against clobbering an
 *   existing, presumably hand-authored store. The CMS must set this true
 *   only for stores explicitly marked `"managed": true`.
 * @returns {{ storeDir: string, files: string[] }}
 */
export async function writeStore ({ repoRoot, key, storeModuleSrc, catalogModuleSrc, themeCss, definition, overwrite = false }) {
  const storeDir = resolve(repoRoot, 'src/stores', key)
  const storeJsPath = resolve(storeDir, 'store.js')
  const themePath = resolve(repoRoot, 'src/tokens/ds/themes', `${key}.css`)

  if (!overwrite && existsSync(storeJsPath)) {
    throw new Error(
      `${storeJsPath} already exists. Existing stores stay hand-authored unless ` +
      `explicitly opted in — pass overwrite: true only for a store definition ` +
      `whose store.config.json has "managed": true.`
    )
  }

  mkdirSync(storeDir, { recursive: true })
  mkdirSync(resolve(storeDir, 'img/brand'), { recursive: true })
  mkdirSync(resolve(storeDir, 'img/content'), { recursive: true })

  const files = []

  writeFileSync(storeJsPath, storeModuleSrc)
  files.push(storeJsPath)

  if (catalogModuleSrc) {
    const catalogPath = resolve(storeDir, 'catalog.js')
    writeFileSync(catalogPath, catalogModuleSrc)
    files.push(catalogPath)
  }

  writeFileSync(themePath, themeCss)
  files.push(themePath)

  const definitionPath = resolve(storeDir, 'store.config.json')
  writeFileSync(definitionPath, JSON.stringify(definition, null, 2) + '\n')
  files.push(definitionPath)

  return { storeDir, files }
}
