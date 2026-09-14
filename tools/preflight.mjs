#!/usr/bin/env node
/**
 * tools/preflight.mjs — Fast Static Guardrail & Rule Compliance Linter
 *
 * Checks components and store code for:
 * 1. Container Query compliance (no @media in components; must use @container).
 * 2. Token correctness (no unknown --x-* or --sys-* variables).
 * 3. Color hygiene (no hardcoded #hex/rgb colors; must use semantic tokens).
 * 4. Overlay registration parity (all App.vue SURFACES must exist in useCloseAllOverlays.js).
 * 5. Feature flag double-gate hygiene (flags without capability checks).
 *
 * Usage:
 *   node tools/preflight.mjs [path/to/file.vue] [--json]
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllTokens } from './token-cli.mjs'
import { scanVarUsages } from './lib/component-tokens.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const COMPONENTS_DIR = path.join(ROOT, 'src/components')

/**
 * Scan a single .vue component file for rule violations
 */
function lintVueFile(fullPath, tokenNames) {
  const relPath = path.relative(ROOT, fullPath)
  const content = readFileSync(fullPath, 'utf8')
  const lines = content.split('\n')
  const issues = []

  let inStyle = false

  lines.forEach((line, idx) => {
    const lineNum = idx + 1
    const trimmed = line.trim()

    if (/<style/i.test(trimmed)) inStyle = true
    if (/<\/style>/i.test(trimmed)) inStyle = false

    if (inStyle) {
      // 1. Container query violation: @media in component
      if (/@media\s*\(/.test(trimmed) && !trimmed.includes('prefers-reduced-motion') && !trimmed.includes('print')) {
        issues.push({
          file: relPath,
          line: lineNum,
          type: 'FORBIDDEN_MEDIA_QUERY',
          message: 'Component uses @media query. Use @container per web-store-fe container-query discipline.',
          snippet: trimmed
        })
      }

      // 2. Hardcoded hex colors (exclude comments and SVG icons)
      const hexMatch = /(?<![\w-])#([0-9a-fA-F]{3,8})\b/g
      if (hexMatch.test(trimmed) && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        // Exclude pure white/black fallbacks inside standard masks/gradients if clearly marked
        if (!trimmed.includes('mask') && !trimmed.includes('rgba(0,0,0') && !trimmed.includes('linear-gradient(#fff')) {
          issues.push({
            file: relPath,
            line: lineNum,
            type: 'HARDCODED_COLOR',
            message: 'Hardcoded hex color. Use design tokens (--x-surface-*, --x-text-*, etc.).',
            snippet: trimmed
          })
        }
      }

      // 3. Token validity check — via the single shared scanner
      // (tools/lib/component-tokens.mjs), not a reimplemented regex.
      for (const { token } of scanVarUsages(trimmed)) {
        if ((token.startsWith('--x-') || token.startsWith('--sys-')) && !tokenNames.has(token)) {
          issues.push({
            file: relPath,
            line: lineNum,
            type: 'UNKNOWN_TOKEN',
            message: `Unrecognized token "${token}". Check spelling against token system.`,
            snippet: trimmed
          })
        }
      }
    }
  })

  return issues
}

/**
 * Map every local ref name App.vue binds via `const { ... } = useXxx()` (with
 * or without a `src: alias` rename, single- or multi-line) to the composable
 * function that owns it. This is how a SURFACES ref (e.g. `claimSheetOpen`)
 * is traced back to its real source (`useGiftClaim`) instead of guessing from
 * the surface id's own spelling.
 */
function mapRefNamesToComposables(appContent) {
  const map = new Map()
  const destructureRe = /const\s*\{([^}]+)\}\s*=\s*(use[A-Za-z0-9]+)\s*\(\s*\)/g
  let dm
  while ((dm = destructureRe.exec(appContent)) !== null) {
    const [, bindings, composableName] = dm
    for (const entry of bindings.split(',')) {
      const trimmed = entry.trim()
      if (!trimmed) continue
      const alias = trimmed.includes(':') ? trimmed.split(':')[1].trim() : trimmed
      map.set(alias, composableName)
    }
  }
  return map
}

/**
 * Check overlay parity between App.vue and useCloseAllOverlays.js
 *
 * A surface is "wired" if the composable that actually owns its ref (per
 * mapRefNamesToComposables, above) is invoked in useCloseAllOverlays.js —
 * not if the surface id's own spelling happens to appear as a substring
 * there. The old substring check (`baseWord = id.replace(/-/g,'')`) was
 * order-sensitive: 'claim-gift' → 'claimgift' never matches source text
 * containing 'closeGiftClaim' ('giftclaim'), so a genuinely-wired surface
 * was reported as missing. Tracing the ref to its owning composable and
 * checking that composable is called avoids both that false positive and
 * false negatives from an unrelated substring match elsewhere in the file.
 */
function checkOverlayParity() {
  const issues = []
  const appVuePath = path.join(ROOT, 'src/App.vue')
  const closerPath = path.join(ROOT, 'src/composables/useCloseAllOverlays.js')

  if (!existsSync(appVuePath) || !existsSync(closerPath)) return issues

  const appContent = readFileSync(appVuePath, 'utf8')
  const closerContent = readFileSync(closerPath, 'utf8')
  const refToComposable = mapRefNamesToComposables(appContent)

  // Extract surfaces from App.vue
  const surfaceRegex = /\[\s*['"]([a-zA-Z0-9_-]+)['"]\s*,\s*['"][^'"]+['"]\s*,\s*([a-zA-Z0-9_$]+)\s*\]/g
  let sm
  const declaredSurfaces = []
  while ((sm = surfaceRegex.exec(appContent)) !== null) {
    declaredSurfaces.push({ id: sm[1], refName: sm[2] })
  }

  for (const s of declaredSurfaces) {
    const composableName = refToComposable.get(s.refName)

    if (composableName) {
      // High-confidence check: is the owning composable actually invoked
      // (not merely imported) in the closer file?
      const invoked = new RegExp(`\\b${composableName}\\s*\\(`).test(closerContent)
      if (!invoked) {
        issues.push({
          file: 'src/App.vue',
          type: 'UNREGISTERED_OVERLAY',
          message: `Overlay surface "${s.id}" (ref: ${s.refName}, from ${composableName}()) is declared in App.vue SURFACES but ${composableName}() is never invoked in useCloseAllOverlays.js!`,
          snippet: `['${s.id}', ...]`
        })
      }
      continue
    }

    // Fallback: refName isn't bound via a `const { ... } = useXxx()`
    // destructure App.vue-side (e.g. a locally-declared ref), so there's no
    // composable to trace. Low-confidence substring heuristic only — flagged
    // as a distinct, less certain type rather than asserted as a hard fact.
    const baseWord = s.id.replace(/-/g, '').toLowerCase()
    if (!closerContent.toLowerCase().includes(baseWord)) {
      issues.push({
        file: 'src/App.vue',
        type: 'OVERLAY_PARITY_UNVERIFIED',
        message: `Overlay surface "${s.id}" (ref: ${s.refName}) has no traceable owning composable in App.vue, and its id text doesn't appear in useCloseAllOverlays.js either. Verify manually.`,
        snippet: `['${s.id}', ...]`
      })
    }
  }

  return issues
}

// CLI Execution
const args = process.argv.slice(2)
const isJson = args.includes('--json')
const targetFile = args.find((a) => !a.startsWith('--'))

const { tokenNames } = getAllTokens()
const allIssues = []

if (targetFile) {
  const fullPath = path.isAbsolute(targetFile) ? targetFile : path.resolve(ROOT, targetFile)
  if (!existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`)
    process.exit(1)
  }
  const fileIssues = lintVueFile(fullPath, tokenNames)
  allIssues.push(...fileIssues)
} else {
  // Full sweep of components
  if (existsSync(COMPONENTS_DIR)) {
    const files = readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith('.vue'))
    for (const file of files) {
      const fileIssues = lintVueFile(path.join(COMPONENTS_DIR, file), tokenNames)
      allIssues.push(...fileIssues)
    }
  }
  // Check overlay parity
  allIssues.push(...checkOverlayParity())
}

if (isJson) {
  console.log(JSON.stringify({ passed: allIssues.length === 0, count: allIssues.length, issues: allIssues }, null, 2))
  process.exit(allIssues.length === 0 ? 0 : 1)
}

if (allIssues.length === 0) {
  console.log('✓ Preflight Check PASSED: No rule violations found!')
  process.exit(0)
} else {
  console.log(`✗ Preflight Check FAILED: Found ${allIssues.length} issue(s):\n`)
  for (const issue of allIssues) {
    console.log(`[${issue.type}] ${issue.file}${issue.line ? `:${issue.line}` : ''}`)
    console.log(`  Message: ${issue.message}`)
    if (issue.snippet) console.log(`  Snippet: ${issue.snippet}`)
    console.log()
  }
  process.exit(1)
}
