#!/usr/bin/env node
/**
 * tools/figma-sync.mjs — Figma Code Connect mapping generator.
 *
 * Generates Figma Code Connect mapping JSON (docs/figma-code-connect/
 * mappings.json) from this repo's component stories, for Figma's CLI/MCP to
 * publish. This is a one-way, file-writing generator — not a live bridge to
 * Figma (a detached node process can't call an MCP tool; see
 * tools/figma-harness.mjs's header for why).
 *
 * Token drift auditing lives in tools/figma-harness.mjs's `diff-tokens`
 * command, not here — a second copy of the same audit ("audit" used to be
 * defined in both files, one of them just printing instructions and always
 * exiting 0) is exactly the kind of duplication REG-RETRO02 warns about.
 *
 * Usage:
 *   node tools/figma-sync.mjs generate [--json]
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STORIES_DIR = path.join(ROOT, 'src/library/stories')
const OUT_DIR = path.join(ROOT, 'docs/figma-code-connect')

/** Kebab-case story id -> camelCase identifier, for use in example snippets. */
function toCamelCase(id) {
  return id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
}

/**
 * Discovers stories and compiles Figma Code Connect mappings
 */
function generateCodeConnectMappings() {
  if (!existsSync(STORIES_DIR)) return []
  const files = readdirSync(STORIES_DIR).filter((f) => f.endsWith('.stories.js'))

  const mappings = []

  for (const file of files) {
    const content = readFileSync(path.join(STORIES_DIR, file), 'utf8')
    const idMatch = content.match(/id:\s*['"`]([^'"`]+)['"`]/)
    const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/)
    const compMatch = content.match(/import\s+([A-Za-z0-9_$]+)\s+from\s+['"`]@\/components\/([^'"`]+\.vue)['"`]/)
    const figmaNodeMatch = content.match(/figmaNodeId:\s*['"`]([^'"`]+)['"`]/)

    const componentName = compMatch ? compMatch[1] : file.replace(/\.stories\.js$/, '')
    const id = idMatch ? idMatch[1] : componentName.toLowerCase()

    mappings.push({
      figmaNodeId: figmaNodeMatch ? figmaNodeMatch[1] : `figma://node/${id}`,
      componentName,
      storyPath: `src/library/stories/${file}`,
      sourceComponent: `src/components/${componentName}.vue`,
      storyUrl: `http://localhost:5173/?library=${id}`,
      harnessImport: `import { StoryStage } from '@coda/harness-kit/vue'`,
      exampleSnippet: `<StoryStage :story="${toCamelCase(id)}Story" />`,
    })
  }

  return mappings
}

// CLI Command Handling
const args = process.argv.slice(2)
const command = args[0] || 'generate'
const isJson = args.includes('--json')

switch (command) {
  case 'generate': {
    const mappings = generateCodeConnectMappings()
    mkdirSync(OUT_DIR, { recursive: true })
    const outPath = path.join(OUT_DIR, 'mappings.json')
    writeFileSync(outPath, JSON.stringify({ version: '1.0.0', mappings }, null, 2), 'utf8')

    if (isJson) {
      console.log(JSON.stringify({ count: mappings.length, path: outPath, mappings }, null, 2))
    } else {
      console.log(`=== Figma Code Connect: Generated ${mappings.length} Component Mapping(s) ===\n`)
      for (const m of mappings) {
        console.log(`• ${m.componentName.padEnd(20)} -> ${m.storyUrl}`)
      }
      console.log(`\n✓ Written to docs/figma-code-connect/mappings.json`)
      console.log(`Ready to publish to Figma Dev Mode via figma_desktop MCP / Code Connect.`)
    }
    break
  }

  case 'audit':
    console.error(`"audit" moved to tools/figma-harness.mjs's "diff-tokens" command — it now does a real diff instead of printing instructions. Run:\n  node tools/figma-harness.mjs diff-tokens --figma-file <path> [--store <store>]`)
    process.exit(1)
    break

  default:
    console.log(`
Usage:
  node tools/figma-sync.mjs generate [--json]

For token drift auditing, see tools/figma-harness.mjs's "diff-tokens" command.
    `.trim())
    break
}
