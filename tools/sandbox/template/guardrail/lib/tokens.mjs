/**
 * guardrail/lib/tokens.mjs — trimmed to the `getAllTokens`-shape from this
 * sandbox's source repo (tools/token-cli.mjs). Parses the bundle's own
 * vendored token cascade (vendor/tokens/) instead of the source repo's
 * src/tokens/ — everything else about the shape is unchanged, so a finding
 * from this guardrail reads the same as the source repo's preflight output.
 * Does NOT need resolve-css.mjs/cascade.js (store-resolution engine) — this
 * bundle is single-store, so there's nothing to resolve across stores.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOKENS_DIR = path.resolve(__dirname, '../../vendor/tokens')

const TIER_FILES = [
  'ds/system.css',
  'ds/semantics.css',
  'ds/space.css',
  'ds/text-styles.css',
  'ds/extensions.css',
  'light.css',
  'materials.css',
  'motion.css',
  'motion-sku.css',
  'motion-trust.css',
  'keyframes.css',
  'effects.css',
  'reduced-motion.css',
]

export function getAllTokens() {
  const tokens = []
  const tokenNames = new Set()

  for (const rel of TIER_FILES) {
    const fullPath = path.join(TOKENS_DIR, rel)
    if (!existsSync(fullPath)) continue
    const root = postcss.parse(readFileSync(fullPath, 'utf8'))
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        tokens.push({ name: decl.prop, value: decl.value, file: rel })
        tokenNames.add(decl.prop)
      }
    })
  }

  const themesDir = path.join(TOKENS_DIR, 'ds/themes')
  if (existsSync(themesDir)) {
    for (const themeFile of readdirSync(themesDir).filter((f) => f.endsWith('.css'))) {
      const root = postcss.parse(readFileSync(path.join(themesDir, themeFile), 'utf8'))
      root.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          tokens.push({ name: decl.prop, value: decl.value, file: `ds/themes/${themeFile}` })
          tokenNames.add(decl.prop)
        }
      })
    }
  }

  return { tokens, tokenNames }
}
