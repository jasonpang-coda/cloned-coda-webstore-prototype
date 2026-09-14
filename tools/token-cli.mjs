#!/usr/bin/env node
/**
 * tools/token-cli.mjs — Fast Token Lookup, Resolver & Component Token Auditor
 *
 * Designed for AI agents and developers to:
 * 1. Search tokens instantly without reading giant documentation/token files.
 * 2. Resolve computed token values & alias chains across any store theme.
 * 3. Audit any .vue file for invalid tokens, hardcoded colors, or @media misuse.
 *
 * Usage:
 *   node tools/token-cli.mjs search <query> [--tier <tier>] [--json]
 *   node tools/token-cli.mjs resolve <token-name> [--store <store>] [--json]
 *   node tools/token-cli.mjs audit <path/to/component.vue> [--json]
 *   node tools/token-cli.mjs list [--json]
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { resolveTokensForStore } from '../scripts/resolve-css.mjs'
import { scanVarUsages } from './lib/component-tokens.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TOKENS_DIR = path.join(ROOT, 'src/tokens')

const TIER_FILES = [
  { tier: 'system', file: 'ds/system.css' },
  { tier: 'semantics', file: 'ds/semantics.css' },
  { tier: 'space', file: 'ds/space.css' },
  { tier: 'text-styles', file: 'ds/text-styles.css' },
  { tier: 'extensions', file: 'ds/extensions.css' },
  { tier: 'effects', file: 'effects.css' },
  { tier: 'materials', file: 'materials.css' },
  { tier: 'motion', file: 'motion.css' },
  { tier: 'motion-sku', file: 'motion-sku.css' },
  { tier: 'motion-trust', file: 'motion-trust.css' },
  { tier: 'keyframes', file: 'keyframes.css' }
]

/**
 * Parses all token definitions across system CSS files.
 * Returns array of { name, value, tier, file, comment }
 */
export function getAllTokens() {
  const tokens = []
  const seen = new Set()

  for (const { tier, file } of TIER_FILES) {
    const fullPath = path.join(TOKENS_DIR, file)
    if (!existsSync(fullPath)) continue
    const css = readFileSync(fullPath, 'utf8')
    const root = postcss.parse(css)

    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        let comment = ''
        const prev = decl.prev()
        if (prev && prev.type === 'comment') {
          comment = prev.text.trim().replace(/\n\s*\*\s*/g, ' ')
        }

        tokens.push({
          name: decl.prop,
          value: decl.value,
          tier,
          file,
          comment
        })
        seen.add(decl.prop)
      }
    })
  }

  // Also include store theme files in ds/themes/*.css
  const themesDir = path.join(TOKENS_DIR, 'ds/themes')
  if (existsSync(themesDir)) {
    const themeFiles = readdirSync(themesDir).filter((f) => f.endsWith('.css'))
    for (const themeFile of themeFiles) {
      const fullPath = path.join(themesDir, themeFile)
      const css = readFileSync(fullPath, 'utf8')
      const root = postcss.parse(css)

      root.walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
          tokens.push({
            name: decl.prop,
            value: decl.value,
            tier: 'theme',
            file: `ds/themes/${themeFile}`,
            comment: `Theme token from ${themeFile}`
          })
          seen.add(decl.prop)
        }
      })
    }
  }

  return { tokens, tokenNames: seen }
}

/**
 * Search tokens matching query
 */
function handleSearch(query, options) {
  const { tokens } = getAllTokens()
  const q = (query || '').toLowerCase()
  const tierFilter = options.tier ? options.tier.toLowerCase() : null

  const matches = tokens.filter((t) => {
    if (tierFilter && t.tier.toLowerCase() !== tierFilter) return false
    if (!q) return true
    return (
      t.name.toLowerCase().includes(q) ||
      t.value.toLowerCase().includes(q) ||
      t.comment.toLowerCase().includes(q)
    )
  })

  if (options.json) {
    console.log(JSON.stringify(matches, null, 2))
    return
  }

  if (matches.length === 0) {
    console.log(`No tokens found matching "${query}"${tierFilter ? ` in tier "${tierFilter}"` : ''}.`)
    return
  }

  console.log(`Found ${matches.length} token(s)${query ? ` for "${query}"` : ''}:\n`)
  const maxNameLen = Math.max(...matches.map((m) => m.name.length), 10)
  const maxTierLen = Math.max(...matches.map((m) => m.tier.length), 6)

  for (const m of matches) {
    const namePadded = m.name.padEnd(maxNameLen + 2)
    const tierPadded = `[${m.tier}]`.padEnd(maxTierLen + 4)
    const commentPart = m.comment ? ` — ${m.comment.slice(0, 60)}${m.comment.length > 60 ? '...' : ''}` : ''
    console.log(`${namePadded} ${tierPadded} = ${m.value}${commentPart}`)
  }
}

/**
 * Resolve a token for a store
 */
function handleResolve(tokenName, options) {
  if (!tokenName) {
    console.error('Error: Token name required. Example: node tools/token-cli.mjs resolve --x-surface-primary')
    process.exit(1)
  }

  const store = options.store || 'codm'
  const name = tokenName.startsWith('--') ? tokenName : `--${tokenName}`
  const { tokens } = getAllTokens()
  const tokenDef = tokens.find((t) => t.name === name)

  // A token that isn't declared ANYWHERE in the DS is almost always a typo —
  // fail loudly rather than printing the same "(unresolved...)" text a
  // legitimately-undefined-in-this-store-only token would also produce.
  // Those two cases used to be indistinguishable, so a typo silently
  // "succeeded" with exit 0.
  if (!tokenDef) {
    console.error(`Error: "${name}" is not declared in any token tier. Try "npm run token search <keyword>" to find the right name.`)
    process.exit(1)
  }

  const resolvedMap = resolveTokensForStore([name], store)
  const resolvedValue = resolvedMap[name]

  const result = {
    token: name,
    store,
    defined: true,
    rawDefinition: tokenDef.value,
    tier: tokenDef.tier,
    resolvedValue: resolvedValue ?? '(declared, but unresolved in this store theme)'
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  console.log(`Token: ${name}`)
  console.log(`Store: ${store}`)
  console.log(`Tier: ${tokenDef.tier}`)
  console.log(`Raw Definition: ${tokenDef.value}`)
  console.log(`Resolved Value: ${result.resolvedValue}`)
}

/**
 * Audit a .vue component for token and CSS rule violations
 */
function handleAudit(filePath, options) {
  if (!filePath) {
    console.error('Error: Path to .vue file required. Example: node tools/token-cli.mjs audit src/components/SkuCard.vue')
    process.exit(1)
  }

  const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(ROOT, filePath)
  if (!existsSync(fullPath)) {
    console.error(`Error: File not found: ${fullPath}`)
    process.exit(1)
  }

  const content = readFileSync(fullPath, 'utf8')
  const { tokenNames } = getAllTokens()

  const issues = []
  const lines = content.split('\n')

  // 1. Check for token references: var(--...) — via the single shared
  // scanner (tools/lib/component-tokens.mjs) so this never drifts from
  // preflight.mjs's or component-tokens.mjs's own idea of what counts as a
  // token usage.
  for (const { token, line: lineNum, snippet } of scanVarUsages(content)) {
    // Skip standard or browser-native vars if any, but all our design tokens start with --x- or --sys-
    if ((token.startsWith('--x-') || token.startsWith('--sys-')) && !tokenNames.has(token)) {
      issues.push({
        line: lineNum,
        type: 'INVALID_TOKEN',
        message: `Unknown or unregistered token: "${token}". Check spelling or declare it in tokens.`,
        snippet
      })
    }
  }

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1

    // Check for @media inside style blocks
    if (/@media\s*\(/.test(lineText) && !lineText.includes('prefers-reduced-motion')) {
      issues.push({
        line: lineNum,
        type: 'MEDIA_QUERY_FORBIDDEN',
        message: 'Avoid @media queries inside component styles; use @container queries instead per web-store-fe rules.',
        snippet: lineText.trim()
      })
    }

    // Check for hardcoded hex colors in style blocks (excluding comments and svg paths)
    const hexMatch = /(?<![\w-])#([0-9a-fA-F]{3,8})\b/g
    if (!lineText.includes('//') && !lineText.includes('/*') && hexMatch.test(lineText)) {
      // Ignore if in template svg fill/stroke or common base styles
      if (!lineText.includes('<svg') && !lineText.includes('<path') && !lineText.includes('<rect')) {
        issues.push({
          line: lineNum,
          type: 'HARDCODED_HEX_COLOR',
          message: 'Hardcoded hex color detected. Use an OKLCH semantic token (--x-surface-*, --x-text-*, etc.).',
          snippet: lineText.trim()
        })
      }
    }
  })

  if (options.json) {
    console.log(JSON.stringify({ file: path.relative(ROOT, fullPath), issues, valid: issues.length === 0 }, null, 2))
    process.exit(issues.length === 0 ? 0 : 1)
  }

  const relPath = path.relative(ROOT, fullPath)
  if (issues.length === 0) {
    console.log(`[PASS] ${relPath}: Token audit clean. No unregistered tokens or forbidden patterns found.`)
    process.exit(0)
  } else {
    console.log(`[FAIL] ${relPath}: Found ${issues.length} issue(s):\n`)
    for (const issue of issues) {
      console.log(`  Line ${issue.line}: [${issue.type}] ${issue.message}`)
      console.log(`    > ${issue.snippet}\n`)
    }
    process.exit(1)
  }
}

/**
 * List overview of tokens by tier
 */
function handleList(options) {
  const { tokens } = getAllTokens()
  const counts = {}
  for (const t of tokens) {
    counts[t.tier] = (counts[t.tier] || 0) + 1
  }

  if (options.json) {
    console.log(JSON.stringify({ total: tokens.length, tiers: counts }, null, 2))
    return
  }

  console.log(`Total design tokens defined: ${tokens.length}\n`)
  console.log('Tier Breakdown:')
  for (const [tier, count] of Object.entries(counts)) {
    console.log(`  - ${tier.padEnd(14)}: ${count} tokens`)
  }
}

// CLI Argument Parsing
const args = process.argv.slice(2)
const command = args[0]
const flags = {}
const positional = []
const KNOWN_FLAGS = new Set(['tier', 'store', 'json', 'help'])

for (let i = 1; i < args.length; i++) {
  const arg = args[i]
  if (arg.startsWith('--') && !arg.startsWith('--x-') && !arg.startsWith('--sys-')) {
    const key = arg.slice(2)
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      flags[key] = args[i + 1]
      i++
    } else {
      flags[key] = true
    }
  } else {
    positional.push(arg)
  }
}

// Only run CLI dispatcher if executed directly
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  switch (command) {
    case 'search':
      handleSearch(positional[0], flags)
      break
    case 'resolve':
      handleResolve(positional[0], flags)
      break
    case 'audit':
      handleAudit(positional[0], flags)
      break
    case 'list':
      handleList(flags)
      break
    default:
      console.log(`
Usage:
  node tools/token-cli.mjs search <keyword> [--tier <tier>] [--json]
  node tools/token-cli.mjs resolve <token-name> [--store <store>] [--json]
  node tools/token-cli.mjs audit <path/to/component.vue> [--json]
  node tools/token-cli.mjs list [--json]
      `.trim())
      break
  }
}
