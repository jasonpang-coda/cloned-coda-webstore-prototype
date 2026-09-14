#!/usr/bin/env node
/**
 * ARCHIVED (2026-09-12) — do not use this to build a new handoff site.
 *
 * This whole tool (and every site it ever scaffolded) has been retired to
 * docs/Handoff/.archive/ — see docs/Handoff/.archive/README.md for why.
 * For a new feature's handoff, write a src/handoff/flows/<slug>.flow.js
 * manifest and use the in-app `/handoff` app instead (see
 * .claude/skills/web-store-interactive-handoff/SKILL.md's deprecation note
 * at the top for the fuller explanation). Left in place, unmodified below
 * this notice, purely for historical reference.
 *
 * Handoff Kit scaffold script.
 *
 * USAGE
 *   node docs/Handoff/_handoff-kit/create-handoff.mjs <slug> "<Title>"
 *     → copies template/ into docs/Handoff/<slug>/, replaces {{SLUG}} / {{TITLE}} placeholders.
 *     Refuses to overwrite an existing folder.
 *     Prints next-steps after scaffold.
 *
 *   node docs/Handoff/_handoff-kit/create-handoff.mjs --update <slug> [--force]
 *     → re-copies only the GENERIC kit files into an existing site (propagate kit fixes).
 *     Never touches: handoff.config.mjs, feature components, markdown content files.
 *
 *     SAFE BY DEFAULT: a site's copy of a generic file can drift from
 *     template/ two ways — (a) it's just stale (the template moved on, the
 *     site didn't), which this SHOULD overwrite, or (b) someone extended it
 *     in place for that site (e.g. codm-signin-motion's utils/tokens.js
 *     grew a haptics helper the template doesn't have), which this MUST
 *     NOT silently destroy. This script can't tell those apart from file
 *     content alone, so its default is to never guess: a file identical to
 *     the template is skipped (nothing to do); a file that differs is left
 *     untouched and the incoming template version is written next to it as
 *     <file>.incoming for a human to diff/merge by hand. Pass --force to
 *     overwrite drifted files anyway (the old, unsafe behaviour) — use
 *     this only after actually reading what --update reported as DRIFTED.
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = join(__dirname, 'template')
const SITES_DIR = join(__dirname, '..')

// Files re-copied by --update (generic kit files, never per-site authored content).
const GENERIC_FILES = [
  'scripts/sync-tokens.mjs',
  '.vitepress/config.mjs',
  '.vitepress/theme/index.js',
  '.vitepress/theme/custom.css',
  '.vitepress/theme/utils/tokens.js',
  '.vitepress/theme/utils/bezier.js',
  '.vitepress/theme/utils/mermaid.js',
  '.vitepress/theme/components/EasingCurve.vue',
  '.vitepress/theme/components/TokenChip.vue',
  '.vitepress/theme/components/TokenSandbox.vue',
  '.vitepress/theme/components/BeatTimeline.vue',
  '.vitepress/theme/components/StateDiagram.vue',
  '.vitepress/theme/components/FlowDiagram.vue',
  'vercel.json',
  '.gitignore',
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function replace(str, slug, title) {
  return str.replaceAll('{{SLUG}}', slug).replaceAll('{{TITLE}}', title)
}

// Files that receive placeholder substitution (text files that contain {{…}}).
const SUBSTITUTED_EXTS = new Set(['.mjs', '.json', '.md', '.css', '.js', '.vue', '.html'])

function shouldSubstitute(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf('.'))
  return SUBSTITUTED_EXTS.has(ext)
}

function copyWithSubstitution(src, dest, slug, title) {
  mkdirSync(dirname(dest), { recursive: true })
  if (shouldSubstitute(src)) {
    const content = replace(readFileSync(src, 'utf8'), slug, title)
    writeFileSync(dest, content, 'utf8')
  } else {
    copyFileSync(src, dest)
  }
}

// ─── scaffold (new site) ───────────────────────────────────────────────────────

function scaffold(slug, title) {
  const dest = join(SITES_DIR, slug)
  if (existsSync(dest)) {
    console.error(`✗ Folder already exists: docs/Handoff/${slug}/`)
    console.error('  Use --update to propagate kit fixes to an existing site.')
    process.exit(1)
  }

  console.log(`\nScaffolding handoff site: ${slug} ("${title}")\n`)
  let count = 0
  for (const srcFile of walk(TEMPLATE_DIR)) {
    const rel = relative(TEMPLATE_DIR, srcFile)
    const destFile = join(dest, rel)
    copyWithSubstitution(srcFile, destFile, slug, title)
    console.log(`  + ${rel}`)
    count++
  }

  console.log(`\n✓ ${count} files created at docs/Handoff/${slug}/\n`)
  console.log('Next steps:')
  console.log(`  1. Fill in docs/Handoff/${slug}/handoff.config.mjs`)
  console.log('       • title / description')
  console.log('       • pages[] — link to each spec doc in this folder')
  console.log('       • vendor.images[] — demo assets the playground needs')
  console.log('       • tokenCatalog.durations[] + .easings[] — from the spec token table')
  console.log(`  2. Write feature components in docs/Handoff/${slug}/.vitepress/theme/components/`)
  console.log('       • Compose TokenSandbox for the live demo stage')
  console.log('       • Compose BeatTimeline for the choreography timeline')
  console.log(`  3. Fill playground.md + index.md hero blurbs`)
  console.log(`  4. cd docs/Handoff/${slug} && npm install && npm run docs:dev`)
  console.log('       • Runs sync-tokens automatically, then starts http://localhost:5173\n')
}

// ─── update (propagate kit fixes to existing site) ────────────────────────────

function update(slug, force) {
  const dest = join(SITES_DIR, slug)
  if (!existsSync(dest)) {
    console.error(`✗ Site not found: docs/Handoff/${slug}/`)
    console.error('  Run without --update to scaffold a new site.')
    process.exit(1)
  }

  console.log(`\nUpdating generic kit files in: ${slug}${force ? ' (--force)' : ''}\n`)
  let created = 0, upToDate = 0, overwritten = 0, drifted = 0

  for (const rel of GENERIC_FILES) {
    const src = join(TEMPLATE_DIR, rel)
    if (!existsSync(src)) {
      console.warn(`  ! Template source missing: ${rel} (skipped)`)
      continue
    }
    const destFile = join(dest, rel)
    // For --update we do NOT substitute placeholders — the site already has
    // its slug/title baked in; generic files contain no {{…}} markers anyway.
    const incoming = readFileSync(src, 'utf8')

    if (!existsSync(destFile)) {
      mkdirSync(dirname(destFile), { recursive: true })
      writeFileSync(destFile, incoming, 'utf8')
      console.log(`  + ${rel} (new)`)
      created++
      continue
    }

    const current = readFileSync(destFile, 'utf8')
    if (current === incoming) {
      upToDate++
      continue
    }

    // Drifted from the template — could be a stale copy (safe to overwrite)
    // or a site-local extension (must NOT be silently destroyed). Can't
    // tell which from content alone, so default to leaving it alone and
    // staging the incoming version for a human to diff, unless --force.
    if (force) {
      writeFileSync(destFile, incoming, 'utf8')
      console.log(`  ↺ ${rel} (overwritten, was drifted)`)
      overwritten++
    } else {
      const incomingPath = `${destFile}.incoming`
      writeFileSync(incomingPath, incoming, 'utf8')
      console.log(`  ✗ ${rel} — DRIFTED from template, left untouched`)
      console.log(`      incoming version staged at ${relative(dest, incomingPath)}`)
      drifted++
    }
  }

  console.log(`\n✓ ${created} created · ${upToDate} already up to date · ${overwritten} overwritten · ${drifted} drifted`)
  if (drifted > 0 && !force) {
    console.log(`\n  ${drifted} file(s) differ from the template and were left untouched.`)
    console.log('  Diff each *.incoming file against its sibling, merge by hand, then delete')
    console.log('  the .incoming file. Re-run with --force only if you\'re certain the site\'s')
    console.log('  copy has nothing worth keeping (this overwrites every drifted file).')
  }
  console.log('\n  Untouched either way: handoff.config.mjs, feature components, markdown content.')
  console.log(`  Run sync-tokens + build to verify:`)
  console.log(`    cd docs/Handoff/${slug} && npm run docs:build\n`)
}

// ─── CLI entry ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

if (args[0] === '--update') {
  const slug = args[1]
  if (!slug) {
    console.error('Usage: create-handoff.mjs --update <slug> [--force]')
    process.exit(1)
  }
  update(slug, args.includes('--force'))
} else {
  const [slug, title] = args
  if (!slug || !title) {
    console.error('Usage: create-handoff.mjs <slug> "<Title>"')
    console.error('       create-handoff.mjs --update <slug>')
    process.exit(1)
  }
  // Slugs must be safe directory names.
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error(`✗ Invalid slug "${slug}" — use lowercase letters, digits, hyphens only.`)
    process.exit(1)
  }
  scaffold(slug, title)
}
