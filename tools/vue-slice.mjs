#!/usr/bin/env node
/**
 * tools/vue-slice.mjs — Vue SFC Contract Inspector & Surgical Section Slicer
 *
 * Designed for AI agents and developers to:
 * 1. Extract a component's interface (props, emits, slots, dependencies) in ~100 tokens.
 * 2. Outline massive components (like App.vue's 3,000 lines) by logical sections with exact line numbers.
 * 3. Slice specific blocks/sections for surgical, hallucination-free edits without dumping whole files.
 *
 * Usage:
 *   node tools/vue-slice.mjs contract <path/to/component.vue> [--json]
 *   node tools/vue-slice.mjs outline <path/to/component.vue> [--json]
 *   node tools/vue-slice.mjs slice <path/to/component.vue> [--section <script|template|style>] [--lines <start:end>]
 */

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@vue/compiler-sfc'
import { getComponentConsumedTokenNames } from './lib/component-tokens.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function resolvePath(filePath) {
  if (!filePath) {
    console.error('Error: Vue file path required.')
    process.exit(1)
  }
  const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(ROOT, filePath)
  if (!existsSync(fullPath)) {
    console.error(`Error: File not found: ${fullPath}`)
    process.exit(1)
  }
  return fullPath
}

/**
 * Extract component contract: props, emits, slots, child components, tokens
 */
function handleContract(filePath, options) {
  const fullPath = resolvePath(filePath)
  const source = readFileSync(fullPath, 'utf8')
  const { descriptor } = parse(source, { filename: path.basename(fullPath) })

  const relPath = path.relative(ROOT, fullPath)
  const componentName = path.basename(fullPath, '.vue')

  const scriptContent = (descriptor.scriptSetup?.content || '') + '\n' + (descriptor.script?.content || '')
  const templateContent = descriptor.template?.content || ''

  // 1. Props extraction
  const props = []
  const definePropsMatch = scriptContent.match(/defineProps\s*\(\s*(\{[^;]+?\}|\[[^;]+?\])/s)
  if (definePropsMatch) {
    const raw = definePropsMatch[1]
    if (raw.startsWith('[')) {
      const items = raw.replace(/[\[\]'"`\s]/g, '').split(',').filter(Boolean)
      props.push(...items.map((name) => ({ name, type: 'any' })))
    } else {
      const propRegex = /([a-zA-Z0-9_$]+)\s*:\s*\{([^}]+)\}|([a-zA-Z0-9_$]+)\s*:\s*([A-Za-z]+)/g
      let m
      while ((m = propRegex.exec(raw)) !== null) {
        const name = m[1] || m[3]
        const details = m[2] || m[4]
        const typeMatch = details.match(/type\s*:\s*([A-Za-z[\]|, ]+)/)
        const type = typeMatch ? typeMatch[1].trim() : (m[4] || 'any')
        const required = /required\s*:\s*true/.test(details)
        const defMatch = details.match(/default\s*:\s*([^,\n}]+)/)
        const def = defMatch ? defMatch[1].trim() : undefined
        props.push({ name, type, required, default: def })
      }
    }
  }

  // 2. Emits extraction
  const emits = []
  const defineEmitsMatch = scriptContent.match(/defineEmits\s*\(\s*(\[[^\]]+\])/s)
  if (defineEmitsMatch) {
    const items = defineEmitsMatch[1].replace(/[\[\]'"`\s]/g, '').split(',').filter(Boolean)
    emits.push(...items)
  } else {
    const emitCallRegex = /emit\(\s*['"`]([a-zA-Z0-9_$-]+)['"`]/g
    let em
    while ((em = emitCallRegex.exec(scriptContent)) !== null) {
      if (!emits.includes(em[1])) emits.push(em[1])
    }
  }

  // 3. Child Components imported
  const importedComponents = []
  const compImportRegex = /import\s+([A-Za-z0-9_$]+)\s+from\s+['"`]([^'"`]+\.vue)['"`]/g
  let ci
  while ((ci = compImportRegex.exec(scriptContent)) !== null) {
    importedComponents.push({ name: ci[1], path: ci[2] })
  }

  // 4. Slots in template
  const slots = []
  const slotRegex = /<slot(?:\s+name=['"`]([a-zA-Z0-9_-]+)['"`])?/g
  let sl
  while ((sl = slotRegex.exec(templateContent)) !== null) {
    const slotName = sl[1] || 'default'
    if (!slots.includes(slotName)) slots.push(slotName)
  }

  // 5. Tokens consumed — shared with harness-cli's test sweep and
  // export-handoff's spec generation (tools/lib/component-tokens.mjs) so
  // "what tokens does this component use" has exactly one answer everywhere.
  const tokens = getComponentConsumedTokenNames(fullPath)

  const result = {
    file: relPath,
    component: componentName,
    lineCount: source.split('\n').length,
    isSetup: !!descriptor.scriptSetup,
    props,
    emits,
    slots,
    importedComponents,
    tokensCount: tokens.length,
    // Full list in --json mode (consumers like the story tokens: field need every
    // token); the human-readable `contract` printer below still truncates its
    // own display separately.
    tokens: options.json ? tokens : tokens.slice(0, 15)
  }

  if (options.json) {
    // Guard against a "compact preview" shortcut ever leaking back into the
    // machine-readable path — that exact bug (silently capped at 15) shipped
    // once already and was invisible until a consumer needed the 16th token.
    if (result.tokens.length !== result.tokensCount) {
      throw new Error(`vue-slice: tokens.length (${result.tokens.length}) !== tokensCount (${result.tokensCount}) in --json mode — the full list must never be truncated here.`)
    }
    console.log(JSON.stringify(result, null, 2))
    return
  }

  console.log(`=== Component Contract: ${componentName} (${relPath}) ===`)
  console.log(`Lines: ${result.lineCount} | Script: ${result.isSetup ? '<script setup>' : '<script>'}`)
  console.log(`\nProps (${props.length}):`)
  if (props.length === 0) console.log('  (none)')
  for (const p of props) {
    console.log(`  - ${p.name}: ${p.type}${p.required ? ' (required)' : ''}${p.default ? ` [default: ${p.default}]` : ''}`)
  }

  console.log(`\nEmits (${emits.length}):`)
  console.log(emits.length > 0 ? `  ${emits.join(', ')}` : '  (none)')

  console.log(`\nSlots (${slots.length}):`)
  console.log(slots.length > 0 ? `  ${slots.join(', ')}` : '  (none)')

  console.log(`\nImported Vue Components (${importedComponents.length}):`)
  for (const c of importedComponents) {
    console.log(`  - <${c.name} /> from "${c.path}"`)
  }

  console.log(`\nTokens Consumed (${tokens.length}):`)
  console.log(tokens.length > 0 ? `  ${tokens.slice(0, 10).join(', ')}${tokens.length > 10 ? ` ... (+${tokens.length - 10} more)` : ''}` : '  (none)')
}

/**
 * Outline top-level blocks and sections
 */
function handleOutline(filePath, options) {
  const fullPath = resolvePath(filePath)
  const source = readFileSync(fullPath, 'utf8')
  const { descriptor } = parse(source, { filename: path.basename(fullPath) })

  const lines = source.split('\n')
  const relPath = path.relative(ROOT, fullPath)

  const sections = []

  // Script
  const scriptBlock = descriptor.scriptSetup || descriptor.script
  if (scriptBlock && scriptBlock.loc) {
    sections.push({
      name: descriptor.scriptSetup ? '<script setup>' : '<script>',
      startLine: scriptBlock.loc.start.line,
      endLine: scriptBlock.loc.end.line,
      lineCount: scriptBlock.loc.end.line - scriptBlock.loc.start.line + 1
    })
  }

  // Template & Top-level sub-blocks
  if (descriptor.template && descriptor.template.loc) {
    const tStart = descriptor.template.loc.start.line
    const tEnd = descriptor.template.loc.end.line
    sections.push({
      name: '<template>',
      startLine: tStart,
      endLine: tEnd,
      lineCount: tEnd - tStart + 1
    })

    // Search for major comment sections or containers in template
    for (let i = tStart - 1; i < tEnd; i++) {
      const line = lines[i]
      const commentMatch = line.match(/<!--\s*([A-Za-z0-9_\s\-\/:()]+?)\s*-->/)
      if (commentMatch) {
        sections.push({
          name: `  [Template Section] ${commentMatch[1].trim()}`,
          startLine: i + 1,
          endLine: i + 1,
          lineCount: 1
        })
      }
    }
  }

  // Styles
  descriptor.styles.forEach((styleBlock, index) => {
    if (styleBlock.loc) {
      sections.push({
        name: `<style${styleBlock.scoped ? ' scoped' : ''}> (block ${index + 1})`,
        startLine: styleBlock.loc.start.line,
        endLine: styleBlock.loc.end.line,
        lineCount: styleBlock.loc.end.line - styleBlock.loc.start.line + 1
      })
    }
  })

  if (options.json) {
    console.log(JSON.stringify({ file: relPath, totalLines: lines.length, sections }, null, 2))
    return
  }

  console.log(`=== Structure Outline: ${path.basename(fullPath)} (${lines.length} total lines) ===\n`)
  for (const s of sections) {
    const range = `Lines ${String(s.startLine).padStart(4)} - ${String(s.endLine).padStart(4)}`
    console.log(`${range} : ${s.name} (${s.lineCount} lines)`)
  }
}

/**
 * Slice a specific section or line range with 1-indexed numbers
 */
function handleSlice(filePath, options) {
  const fullPath = resolvePath(filePath)
  const source = readFileSync(fullPath, 'utf8')
  const lines = source.split('\n')
  const { descriptor } = parse(source, { filename: path.basename(fullPath) })

  let start = 1
  let end = lines.length

  if (options.lines) {
    const parts = options.lines.split(':')
    start = parseInt(parts[0], 10) || 1
    end = parseInt(parts[1], 10) || lines.length
  } else if (options.section) {
    const sec = options.section.toLowerCase()
    if (sec === 'script' || sec === 'scriptsetup') {
      const s = descriptor.scriptSetup || descriptor.script
      if (s?.loc) { start = s.loc.start.line; end = s.loc.end.line }
    } else if (sec === 'template') {
      if (descriptor.template?.loc) { start = descriptor.template.loc.start.line; end = descriptor.template.loc.end.line }
    } else if (sec === 'style') {
      if (descriptor.styles[0]?.loc) { start = descriptor.styles[0].loc.start.line; end = descriptor.styles[descriptor.styles.length - 1].loc.end.line }
    }
  }

  start = Math.max(1, start)
  end = Math.min(lines.length, end)

  console.log(`=== Slice: ${path.basename(fullPath)} (Lines ${start} to ${end}) ===\n`)
  const padWidth = String(end).length
  for (let i = start - 1; i < end; i++) {
    const lineNum = String(i + 1).padStart(padWidth)
    console.log(`${lineNum} | ${lines[i]}`)
  }
}

// CLI Argument Parsing
const args = process.argv.slice(2)
const command = args[0]
const flags = {}
const positional = []

for (let i = 1; i < args.length; i++) {
  const arg = args[i]
  if (arg.startsWith('--')) {
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

switch (command) {
  case 'contract':
    handleContract(positional[0], flags)
    break
  case 'outline':
    handleOutline(positional[0], flags)
    break
  case 'slice':
    handleSlice(positional[0], flags)
    break
  default:
    console.log(`
Usage:
  node tools/vue-slice.mjs contract <path/to/component.vue> [--json]
  node tools/vue-slice.mjs outline <path/to/component.vue> [--json]
  node tools/vue-slice.mjs slice <path/to/component.vue> [--section <script|template|style>] [--lines <start:end>]
    `.trim())
    break
}
