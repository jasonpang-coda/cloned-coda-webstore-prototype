#!/usr/bin/env node
/**
 * tools/compound.mjs — Knowledge Compounding Engine (Level 5)
 *
 * Promotes hard-won lessons, caught bugs, and edge cases permanently back into the harness:
 * 1. Injects learned rules into the component story's `rules: [...]`
 * 2. Adds dedicated regression test variants to prevent recurring bugs
 * 3. Maintains an enduring audit ledger in `audits/regressions-log.json`
 *
 * Usage:
 *   node tools/compound.mjs --component <Name> --rule "<LearnedRule>" [--variant "<VariantName>"] [--store <Store>] [--dry-run]
 *   node tools/compound.mjs --list                 # print the whole ledger, newest first
 *   node tools/compound.mjs --check <Component>     # print lessons recorded for one component
 *
 * The ledger (audits/regressions-log.json) is COMMITTED (see .gitignore's
 * exception for this one file) specifically so it survives across worktrees
 * and clones — a lesson recorded in one session's worktree is useless to a
 * different session/worktree if it can't leave that machine. This is very
 * likely why feat/ai-dev-tooling and feat/design-harness-refactor
 * independently built byte-identical tooling: nothing recorded either
 * effort anywhere the other could see it. --list/--check exist so the
 * ledger is actually consulted before starting new harness work, not just
 * appended to and forgotten.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readLedger as readLedgerSafe, appendToLedger } from './lib/ledger.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const AUDITS_DIR = path.join(ROOT, 'audits')
const LEDGER_PATH = path.join(AUDITS_DIR, 'regressions-log.json')

// CLI Argument Parsing
const args = process.argv.slice(2)
const flags = {}
for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg.startsWith('--')) {
    const key = arg.slice(2)
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      flags[key] = args[i + 1]
      i++
    } else {
      flags[key] = true
    }
  }
}

function readLedger () {
  return readLedgerSafe(LEDGER_PATH)
}

if (flags.list) {
  const ledger = readLedger()
  if (!ledger.length) {
    console.log('Ledger is empty (audits/regressions-log.json).')
    process.exit(0)
  }
  console.log(`=== Regression Ledger (${ledger.length} entr${ledger.length === 1 ? 'y' : 'ies'}, newest first) ===\n`)
  for (const r of [...ledger].reverse()) {
    console.log(`[${r.id}] ${r.timestamp} — ${r.component}`)
    console.log(`  Rule: ${r.rule}`)
    if (r.variant) console.log(`  Regression variant: ${r.variant}`)
    console.log(`  Store: ${r.store}\n`)
  }
  process.exit(0)
}

if (flags.check) {
  const target = typeof flags.check === 'string' ? flags.check : null
  if (!target) {
    console.error('Error: --check requires a component name. Example: node tools/compound.mjs --check SkuCard')
    process.exit(1)
  }
  const ledger = readLedger().filter((r) => r.component.toLowerCase() === target.toLowerCase())
  if (!ledger.length) {
    console.log(`No recorded lessons for "${target}".`)
    process.exit(0)
  }
  console.log(`=== Recorded lessons for ${target} (${ledger.length}) ===\n`)
  for (const r of [...ledger].reverse()) {
    console.log(`[${r.id}] ${r.timestamp}`)
    console.log(`  Rule: ${r.rule}`)
    if (r.variant) console.log(`  Regression variant: ${r.variant}`)
    console.log(`  Store: ${r.store}\n`)
  }
  process.exit(0)
}

const component = flags.component || flags.c
const rule = flags.rule || flags.r
const variant = flags.variant || flags.v
const store = flags.store || flags.s
const isDryRun = !!flags['dry-run']

if (!component || !rule) {
  console.log(`
Usage:
  node tools/compound.mjs --component <Name> --rule "<LearnedRule>" [--variant "<VariantName>"] [--store <Store>] [--dry-run]
  node tools/compound.mjs --list
  node tools/compound.mjs --check <Component>

Options:
  --component, -c   Component name (e.g. SkuCard, NavBar)
  --rule, -r        Learned rule or negative constraint to enforce
  --variant, -v     Optional regression test variant name
  --store, -s       Specific store theme where regression occurred (e.g. efootball, tdr)
  --dry-run         Show changes without writing to disk
  --list            Print the whole ledger, newest first
  --check <Name>    Print recorded lessons for one component
`.trim())
  process.exit(1)
}

const storyPath = path.join(ROOT, `src/library/stories/${component}.stories.js`)
if (!existsSync(storyPath)) {
  console.error(`Error: Story not found at ${storyPath}. Scaffold it first with "npm run scaffold:story -- --name ${component}"`)
  process.exit(1)
}

console.log(`=== Compounding Lesson into Harness: ${component} ===\n`)
console.log(`Rule: "${rule}"`)
if (variant) console.log(`Regression Variant: "${variant}"`)
if (store) console.log(`Store Context: "${store}"`)

// 1. Read existing story
let storyContent = readFileSync(storyPath, 'utf8')

// 2. Inject Rule into rules: [...]
if (storyContent.includes('rules: [')) {
  const ruleEntry = `    ${JSON.stringify(rule)},`
  storyContent = storyContent.replace(/rules:\s*\[/, `rules: [\n${ruleEntry}`)
} else if (storyContent.includes('defineStory({')) {
  // If rules array doesn't exist, inject it
  const rulesBlock = `  rules: [\n    ${JSON.stringify(rule)},\n  ],`
  storyContent = storyContent.replace(/defineStory\(\{/, `defineStory({\n${rulesBlock}`)
}

// 3. Inject Variant if requested
if (variant) {
  const variantBlock = `    {\n      name: ${JSON.stringify(variant)},\n      props: ({ assets, strings, config, theme }) => ({\n        // Regression scenario: ${rule}\n      }),\n    },`
  if (storyContent.includes('variants: [')) {
    storyContent = storyContent.replace(/variants:\s*\[/, `variants: [\n${variantBlock}`)
  }
}

// 4. Update Story File
if (isDryRun) {
  console.log('\n[Dry Run] Story modification preview:')
  console.log(`Updated rules and variants in ${storyPath}`)
} else {
  writeFileSync(storyPath, storyContent, 'utf8')
  console.log(`\n✓ Updated story: src/library/stories/${component}.stories.js`)
}

// 5. Append to Regressions Ledger — under a cross-process lock, via
// tools/lib/ledger.mjs, so two concurrent `compound.mjs` invocations (e.g.
// two agent worktrees compounding lessons at once — the exact scenario this
// ledger exists for) can't silently clobber one another's entry.
const record = {
  id: `REG-${Date.now().toString(36).toUpperCase()}`,
  timestamp: new Date().toISOString(),
  component,
  rule,
  variant: variant || null,
  store: store || 'all',
}

if (isDryRun) {
  console.log(`[Dry Run] Ledger entry to append to ${LEDGER_PATH}:`)
  console.log(JSON.stringify(record, null, 2))
} else {
  appendToLedger(LEDGER_PATH, record)
  console.log(`✓ Recorded in regression ledger: audits/regressions-log.json (${record.id})`)
}

console.log(`\n[Knowledge Compounded] This lesson is now part of the permanent verification harness.`)
