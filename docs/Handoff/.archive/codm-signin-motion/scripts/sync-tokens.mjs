/**
 * Sync motion token CSS from the prototype into vendor/tokens/.
 * Run after changing src/tokens/*.css in the parent project.
 * On Vercel (subdirectory root), parent src/ is unavailable — committed vendor copies are used.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const handoffRoot = join(__dirname, '..')
const prototypeTokens = join(handoffRoot, '../../../src/tokens')
const vendorDir = join(handoffRoot, 'vendor/tokens')

const FILES = ['motion.css', 'motion-sku.css', 'keyframes.css']

if (!existsSync(prototypeTokens)) {
  console.log('[sync-tokens] Prototype src/tokens not found — using committed vendor copies.')
  process.exit(0)
}

mkdirSync(vendorDir, { recursive: true })

for (const file of FILES) {
  const src = join(prototypeTokens, file)
  const dest = join(vendorDir, file)
  if (!existsSync(src)) {
    console.warn(`[sync-tokens] Skip missing: ${src}`)
    continue
  }
  copyFileSync(src, dest)
  console.log(`[sync-tokens] ${file}`)
}
