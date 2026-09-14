#!/usr/bin/env node
/**
 * guardrail/preflight.mjs — ported + trimmed from this sandbox's source repo
 * (tools/preflight.mjs). Checks the PAGES YOU AUTHOR under src/*.vue for:
 *   1. Container-query compliance (no @media — use @container).
 *   2. Token correctness (no unknown --x- or --sys- prefixed var() usage).
 *   3. Color hygiene (no hardcoded #hex — use design tokens).
 *
 * Deliberately does NOT scan vendor/ — those are the real, already-correct
 * repo components; linting them would just be noise. It also does NOT carry
 * the source repo's overlay-parity check (App.vue-specific, meaningless
 * here).
 *
 * Usage: node guardrail/preflight.mjs [path/to/page.vue] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllTokens } from './lib/tokens.mjs'
import { scanVarUsages } from './lib/component-tokens.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'src')

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
    if (!inStyle) return

    if (/@media\s*\(/.test(trimmed) && !trimmed.includes('prefers-reduced-motion') && !trimmed.includes('print')) {
      issues.push({
        file: relPath, line: lineNum, type: 'FORBIDDEN_MEDIA_QUERY',
        message: 'Uses @media. Use @container instead — this component library is container-query only.',
        snippet: trimmed,
      })
    }

    const hexMatch = /(?<![\w-])#([0-9a-fA-F]{3,8})\b/g
    if (hexMatch.test(trimmed) && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
      if (!trimmed.includes('mask') && !trimmed.includes('rgba(0,0,0') && !trimmed.includes('linear-gradient(#fff')) {
        issues.push({
          file: relPath, line: lineNum, type: 'HARDCODED_COLOR',
          message: 'Hardcoded hex color. Use a design token from catalog.json instead.',
          snippet: trimmed,
        })
      }
    }

    for (const { token } of scanVarUsages(trimmed)) {
      if ((token.startsWith('--x-') || token.startsWith('--sys-')) && !tokenNames.has(token)) {
        issues.push({
          file: relPath, line: lineNum, type: 'UNKNOWN_TOKEN',
          message: `Unrecognized token "${token}". Check catalog.json / vendor/tokens for the correct name.`,
          snippet: trimmed,
        })
      }
    }
  })

  return issues
}

function collectVueFiles(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) collectVueFiles(full, out)
    else if (entry.endsWith('.vue')) out.push(full)
  }
  return out
}

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
  allIssues.push(...lintVueFile(fullPath, tokenNames))
} else {
  for (const file of collectVueFiles(SRC_DIR)) {
    allIssues.push(...lintVueFile(file, tokenNames))
  }
}

if (isJson) {
  console.log(JSON.stringify({ passed: allIssues.length === 0, count: allIssues.length, issues: allIssues }, null, 2))
  process.exit(allIssues.length === 0 ? 0 : 1)
}

if (allIssues.length === 0) {
  console.log('✓ Guardrail check PASSED: no rule violations found.')
  process.exit(0)
} else {
  console.log(`✗ Guardrail check FAILED: found ${allIssues.length} issue(s):\n`)
  for (const issue of allIssues) {
    console.log(`[${issue.type}] ${issue.file}${issue.line ? `:${issue.line}` : ''}`)
    console.log(`  Message: ${issue.message}`)
    if (issue.snippet) console.log(`  Snippet: ${issue.snippet}`)
    console.log()
  }
  process.exit(1)
}
