#!/usr/bin/env node
/**
 * tools/scaffold.mjs — Deterministic Overlay & Component Scaffolder
 *
 * Automates the multi-step ritual required when adding a new sheet, drawer,
 * modal, or component to the coda-webstore-prototype repository:
 * 1. Creates the Vue component following web-store-fe & container-query standards.
 * 2. Creates the singleton composable in src/composables/use<Name>.js.
 * 3. Registers the dismissal in src/composables/useCloseAllOverlays.js.
 * 4. Mounts the component into App.vue's overlay z-stack & comment-mode SURFACES.
 *
 * Usage:
 *   node tools/scaffold.mjs overlay --name VipPassSheet [--type sheet|drawer|dialog] [--label "VIP Pass"] [--dry-run]
 *   node tools/scaffold.mjs component --name PromoBadge [--type card|badge|section] [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getComponentConsumedTokenNames } from './lib/component-tokens.mjs'
import { toKebabCase, toCamelCase } from './lib/naming.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function toPascalCase(str) {
  const c = toCamelCase(str)
  return c.charAt(0).toUpperCase() + c.slice(1)
}

/**
 * Generate Vue Component Template for an Overlay (Sheet/Drawer/Dialog)
 */
function createOverlayVueTemplate(name, type, label) {
  return `<script setup>
import { computed } from 'vue'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useHaptics } from '../composables/useHaptics.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const strings = useStoreStrings()
const { triggerHaptic } = useHaptics()

function handleClose() {
  triggerHaptic('light')
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="visible"
        class="cq-root overlay-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="'${label}'"
        @click.self="handleClose"
      >
        <div class="overlay-panel">
          <header class="overlay-header">
            <h2 class="overlay-title">${label}</h2>
            <button
              type="button"
              class="overlay-close-btn"
              aria-label="Close"
              @click="handleClose"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <main class="overlay-body">
            <slot>
              <p class="overlay-description">Content for ${label}</p>
            </slot>
          </main>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cq-root {
  container-type: inline-size;
}

.overlay-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--x-sys-colour-surface-overlay, rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.overlay-panel {
  width: 100%;
  max-width: 480px;
  background: var(--x-surface-primary, var(--x-sys-colour-surface-container, #1c1e22));
  border-top: 1px solid var(--x-border-card-default, rgba(255, 255, 255, 0.1));
  border-radius: var(--x-radius-sheet-top, 16px 16px 0 0);
  box-shadow: var(--x-shadow-card, 0 10px 30px rgba(0, 0, 0, 0.5));
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
}

.overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--x-pad-surface-m, 16px);
  border-bottom: 1px solid var(--x-border-card-default, rgba(255, 255, 255, 0.08));
}

.overlay-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--x-text-primary, #ffffff);
}

.overlay-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--x-text-secondary, rgba(255, 255, 255, 0.7));
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.overlay-close-btn:hover {
  opacity: 0.8;
}

.overlay-body {
  padding: var(--x-pad-surface-m, 16px);
  overflow-y: auto;
}

.overlay-description {
  margin: 0;
  color: var(--x-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Container Query Adjustments for wide frames */
@container (min-width: 640px) {
  .overlay-panel {
    border-radius: var(--x-radius-container-m, 16px);
    margin-bottom: 24px;
  }
}

/* Transitions */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
`
}

/**
 * Generate Composable template
 */
function createComposableTemplate(namePascal, nameCamel) {
  return `import { ref } from 'vue'

const open = ref(false)

export function use${namePascal}() {
  function open${namePascal}() {
    open.value = true
  }

  function close${namePascal}() {
    open.value = false
  }

  function toggle${namePascal}() {
    open.value = !open.value
  }

  return {
    ${nameCamel}Open: open,
    open${namePascal},
    close${namePascal},
    toggle${namePascal}
  }
}
`
}

/**
 * Handle Overlay Scaffolding
 */
function handleScaffoldOverlay(flags) {
  if (!flags.name) {
    console.error('Error: --name is required. Example: node tools/scaffold.mjs overlay --name VipPassSheet')
    process.exit(1)
  }

  const rawName = flags.name.replace(/\.vue$/, '')
  const namePascal = toPascalCase(rawName)
  const nameCamel = toCamelCase(rawName)
  const nameKebab = toKebabCase(rawName)
  const label = flags.label || rawName.replace(/Sheet$|Drawer$|Modal$|Dialog$/, '').replace(/([A-Z])/g, ' $1').trim()
  const type = flags.type || 'sheet'
  const isDryRun = !!flags['dry-run']

  const compPath = path.join(ROOT, 'src/components', `${namePascal}.vue`)
  const composablePath = path.join(ROOT, 'src/composables', `use${namePascal}.js`)
  const closerPath = path.join(ROOT, 'src/composables/useCloseAllOverlays.js')
  const appVuePath = path.join(ROOT, 'src/App.vue')

  console.log(`[Scaffold Overlay] Plan for "${namePascal}" (${label}):\n`)

  // 1. Component file
  console.log(`1. [NEW] src/components/${namePascal}.vue`)
  const compCode = createOverlayVueTemplate(namePascal, type, label)

  // 2. Composable file
  console.log(`2. [NEW] src/composables/use${namePascal}.js`)
  const composableCode = createComposableTemplate(namePascal, nameCamel)

  // 3. useCloseAllOverlays.js edit
  console.log(`3. [MODIFY] src/composables/useCloseAllOverlays.js (register closer)`)
  if (!existsSync(closerPath)) {
    console.error(`Error: src/composables/useCloseAllOverlays.js not found at ${closerPath}.`)
    process.exit(1)
  }
  let closerCode = readFileSync(closerPath, 'utf8')
  if (!closerCode.includes(`use${namePascal}`)) {
    const importStmt = `import { use${namePascal} } from './use${namePascal}.js'\n`
    closerCode = importStmt + closerCode
    const closerCall = `  use${namePascal}().close${namePascal}()\n}`
    closerCode = closerCode.replace(/\n\}/, '\n' + closerCall)
  }

  // 4. App.vue wiring
  console.log(`4. [MODIFY] src/App.vue (import composable, add to SURFACES & mount tag)`)
  if (!existsSync(appVuePath)) {
    console.error(`Error: src/App.vue not found at ${appVuePath}.`)
    process.exit(1)
  }
  let appCode = readFileSync(appVuePath, 'utf8')

  if (!appCode.includes(`use${namePascal}`)) {
    // Import composable in script setup
    const compImport = `import { use${namePascal} } from './composables/use${namePascal}.js'\nimport ${namePascal} from './components/${namePascal}.vue'\n`
    appCode = appCode.replace(/<script setup>/, `<script setup>\n${compImport}`)

    // Init composable state
    const stateInit = `const { ${nameCamel}Open, close${namePascal} } = use${namePascal}()\n`
    appCode = appCode.replace(/const SURFACES = \[/, `${stateInit}  const SURFACES = [\n    ['${nameKebab}', '${label}', ${nameCamel}Open],`)

    // Mount overlay in template before </template> or near existing overlays
    const mountTag = `\n    <!-- ${label} Overlay -->\n    <${namePascal} :visible="${nameCamel}Open" @close="close${namePascal}" />\n`
    if (appCode.includes('<!-- Overlays')) {
      appCode = appCode.replace(/(<!-- Overlays[^>]*>)/, `$1${mountTag}`)
    } else {
      appCode = appCode.replace(/<\/template>/, `${mountTag}\n</template>`)
    }
  }

  if (isDryRun) {
    console.log('\n[Dry Run] No files written. Run without --dry-run to apply.')
    return
  }

  writeFileSync(compPath, compCode, 'utf8')
  writeFileSync(composablePath, composableCode, 'utf8')
  writeFileSync(closerPath, closerCode, 'utf8')
  writeFileSync(appVuePath, appCode, 'utf8')

  console.log('\n[SUCCESS] Successfully scaffolded overlay and wired all 4 integration points!')
  console.log(`  - Component: src/components/${namePascal}.vue`)
  console.log(`  - Composable: src/composables/use${namePascal}.js`)
  console.log(`  - Closer registered in: src/composables/useCloseAllOverlays.js`)
  console.log(`  - Mounted in: src/App.vue`)
}

/**
 * Handle Story Scaffolding (Harness-First Protocol)
 */
function handleScaffoldStory(flags) {
  if (!flags.name) {
    console.error('Error: --name is required. Example: node tools/scaffold.mjs story --name SkuCard --group Cards')
    process.exit(1)
  }

  const rawName = flags.name.replace(/\.vue$|\.stories\.js$/, '')
  const namePascal = toPascalCase(rawName)
  const nameKebab = toKebabCase(rawName)
  const group = flags.group || 'Components'
  const isDryRun = !!flags['dry-run']

  const storyPath = path.join(ROOT, 'src/library/stories', `${namePascal}.stories.js`)
  const componentPath = path.join(ROOT, 'src/components', `${namePascal}.vue`)

  console.log(`[Scaffold Story] Plan for "${namePascal}.stories.js" (Group: ${group}):\n`)
  console.log(`1. [NEW] src/library/stories/${namePascal}.stories.js`)

  // `tokens:` here is a seed/pin, not the source of truth — export-handoff.mjs
  // auto-derives the real token contract from the component's own var(--x-...)
  // usage and merges it with whatever's declared here. If the component
  // already exists, seed with its real tokens so a first-pass spec isn't
  // built from a made-up placeholder; if it doesn't exist yet, leave an
  // explicit empty array rather than a placeholder that reads as real.
  const derivedTokens = existsSync(componentPath) ? getComponentConsumedTokenNames(componentPath) : []
  const tokensBlock = derivedTokens.length
    ? `[\n${derivedTokens.map((t) => `    '${t}',`).join('\n')}\n  ]`
    : `[] /* component not found yet — auto-derived once src/components/${namePascal}.vue exists */`

  const code = `import ${namePascal} from '@/components/${namePascal}.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: '${nameKebab}',
  title: '${namePascal.replace(/([A-Z])/g, ' $1').trim()}',
  group: '${group}',
  component: ${namePascal},
  states: ['default', 'hover', 'pressed'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: ${tokensBlock},
  notes: 'Rendered in isolation via StoryStage. Verifies container queries and store theme reskinning.',
  rules: [
    'Enforce @container query layouts (never @media).',
    'Use semantic tokens for colors and spacing.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ assets, strings }) => ({
        // Dynamic store assets / strings
      }),
    },
    {
      name: 'Secondary',
      props: ({ assets, strings }) => ({
        // Secondary variant matrix
      }),
    },
  ],
})
`

  if (isDryRun) {
    console.log('\n[Dry Run] No files written. Run without --dry-run to apply.')
    return
  }

  writeFileSync(storyPath, code, 'utf8')
  console.log(`\n[SUCCESS] Successfully scaffolded story: src/library/stories/${namePascal}.stories.js`)
  console.log('Story is automatically discovered by src/library/registry.js and tools/harness-cli.mjs!')
}

/**
 * Handle Component Scaffolding
 */
function handleScaffoldComponent(flags) {
  if (!flags.name) {
    console.error('Error: --name is required. Example: node tools/scaffold.mjs component --name PromoBadge')
    process.exit(1)
  }

  const rawName = flags.name.replace(/\.vue$/, '')
  const namePascal = toPascalCase(rawName)
  const nameKebab = toKebabCase(rawName)
  const isDryRun = !!flags['dry-run']
  const compPath = path.join(ROOT, 'src/components', `${namePascal}.vue`)

  console.log(`[Scaffold Component] Plan for "${namePascal}.vue":\n`)
  console.log(`1. [NEW] src/components/${namePascal}.vue`)

  const code = `<script setup>
import { computed } from 'vue'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action'])

const strings = useStoreStrings()
const assets = useStoreAssets()
</script>

<template>
  <div class="cq-root ${nameKebab}">
    <header class="header">
      <h3 class="title">{{ title || 'Title' }}</h3>
    </header>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cq-root {
  container-type: inline-size;
}

.${nameKebab} {
  display: flex;
  flex-direction: column;
  padding: var(--x-pad-surface-m, 16px);
  background: var(--x-surface-primary, var(--x-sys-colour-surface-container, #1e2025));
  border: 1px solid var(--x-border-card-default, rgba(255, 255, 255, 0.1));
  border-radius: var(--x-radius-container-m, 12px);
  color: var(--x-text-primary, #ffffff);
  box-shadow: var(--x-shadow-card, 0 4px 12px rgba(0, 0, 0, 0.3));
}

.title {
  margin: 0 0 var(--x-gap-content-narrow, 8px) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--x-text-primary, #ffffff);
}

.content {
  color: var(--x-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.875rem;
  line-height: 1.5;
}

@container (min-width: 480px) {
  .${nameKebab} {
    padding: var(--x-pad-surface-l, 20px);
  }
}
</style>
`

  if (isDryRun) {
    console.log('\n[Dry Run] No files written. Run without --dry-run to apply.')
    return
  }

  writeFileSync(compPath, code, 'utf8')
  console.log(`\n[SUCCESS] Successfully scaffolded component: src/components/${namePascal}.vue`)
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
  case 'overlay':
    handleScaffoldOverlay(flags)
    break
  case 'story':
    handleScaffoldStory(flags)
    break
  case 'component':
    handleScaffoldComponent(flags)
    break
  default:
    console.log(`
Usage:
  node tools/scaffold.mjs overlay --name <PascalName>Sheet [--type sheet|drawer|dialog] [--label "Label"] [--dry-run]
  node tools/scaffold.mjs story --name <ComponentName> [--group <Group>] [--dry-run]
  node tools/scaffold.mjs component --name <ComponentName> [--type card|badge|section] [--dry-run]
    `.trim())
    break
}
