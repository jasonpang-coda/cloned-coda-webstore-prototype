<script setup>
/**
 * LibraryViewer — the component library overlay (dev chrome, prototype-only).
 *
 * A full-screen overlay (z below the inspector's 9000 so its panel floats above
 * us) with a searchable side panel of stories and a main stage that renders the
 * selected component in isolation. The stage cycles:
 *   • variants  — named prop scenarios authored in the story file,
 *   • states    — default/hover/pressed/disabled, applied with the SAME pure
 *                 simulation helpers the inspector uses (buildHoverOverride etc.),
 *   • themes    — all registered stores via useTheme().setTheme (live reskin),
 *   • width     — iPhone / Android / responsive container widths.
 *
 * The "Specs" tab hands off to the existing inspector (open + select the staged
 * root) so live CSS/token/motion/props/a11y come from one source of truth — no
 * duplicated spec logic. The "Notes" tab shows the story's authored prose/rules.
 *
 * System-font styling (like CommandConsole / InspectorPanel) keeps this clearly
 * separate from the store's own type. Mounted behind `v-if="!isStoreLocked"`, so
 * it is absent from store-locked ("isolated") builds.
 */
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import MaterialIcon from '../components/MaterialIcon.vue'
import StoryStage from './StoryStage.vue'
import { GROUPS, getStory } from './registry.js'
import { useLibrary } from './useLibrary.js'
import { useTheme } from '../composables/useTheme.js'
import { useResizablePanel } from '../composables/useResizablePanel.js'
import { useInspector } from '@coda/inspect-kit/vue'
import { buildHoverOverride, applyPressedState, applyDisabledState } from '@coda/inspect-kit'
import { waitForCaptureReady } from '../dev/figmaCapture.js'

const { active, selectedId, variantIndex, widthMode, close, select, setVariant, setWidth } = useLibrary()
const { theme, themes, setTheme } = useTheme()
const inspector = useInspector()

const story = computed(() => getStory(selectedId.value))

// Capture mode (?capture=1, composed with #library=<id>&v=<n>&w=<width> and
// ?theme=<store>) — hides every chrome element that isn't the staged
// component itself, so a driver (tools/harness-capture.mjs's manifest names
// the URL; a human/agent or a future headless script drives the browser to
// it) gets a clean, full-bleed shot instead of the sidebar/controls/notes
// dock. Read once — capture URLs are single-purpose, not meant to be
// toggled live in a session that already has the query param set.
const captureMode = typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('capture') === '1'

// ── side-panel search ────────────────────────────────────────────────────────
const query = ref('')
const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return GROUPS
  return GROUPS
    .map(g => ({ group: g.group, stories: g.stories.filter(s => s.title.toLowerCase().includes(q)) }))
    .filter(g => g.stories.length)
})

// ── stage controls ─────────────────────────────────────────────────────────
const WIDTHS = [
  { value: 'iphone',     label: 'iPhone' },
  { value: 'samsung',    label: 'Android' },
  { value: 'responsive', label: 'Responsive' },
]
// States offered for the active story (always lead with default).
const states = computed(() => {
  const s = story.value?.states || ['default']
  return s.includes('default') ? s : ['default', ...s]
})
const activeState = ref('default')

// Theme grid — every registered store rendered simultaneously (small
// multiples), so cross-store consistency is SEEN, not judged from memory
// switching a <select> one store at a time. Off by default (single-theme
// mode, unchanged from before). State simulation doesn't make sense against
// N simultaneous cells, so it's hidden while grid mode is on — see the
// `states.length > 1 && !gridMode` guard in the template.
const gridMode = ref(false)

// Zoom — atoms (a ~24px icon, a small tag) are unreviewable at native size in
// a stage sized for full device screens. `zoom` (not `transform: scale`) so
// the box actually reflows at the new size instead of just visually
// stretching — standard-ish, Chromium/Safari support it; acceptable here
// since this is dev-only chrome, not shipped store UI.
const ZOOM_LEVELS = [1, 1.5, 2, 3]
const zoomLevel = ref(1)

// Background — the stage's default checkerboard is correct for judging
// transparency but wrong for judging legibility in isolation from the real
// (often dark) store page colour. Overrides the device screen's own painted
// background (@coda/harness-kit's StoryStage always paints the real
// --x-bg-page / brand bg image) via a `:deep()` + `!important` class, since
// that paint lives in a sibling package this viewer doesn't own.
const BG_MODES = [
  { value: 'checkerboard', label: 'Checker' },
  { value: 'light',        label: 'Light' },
  { value: 'dark',         label: 'Dark' },
]
const stageBg = ref('checkerboard')

const tab = ref('notes') // 'notes' | 'specs'

const stageRef = ref(null)

// ── collapsible/resizable panels (sidebar + notes/specs dock) ────────────────
// Sidebar: drag-resizable + collapses to a 48px icon rail, standardized across
// every tool page (Handoff/Token Audit use the identical composable) — see
// useResizablePanel.js. maxWidth is this page's own former fixed width (248px),
// so dragging can never make the panel BIGGER than it already was.
const sidebarRef = ref(null)
const {
  collapsed: sidebarCollapsed, isResizing, panelStyle, handleProps,
  startResize, onHandleKeydown, resetWidth, toggle: toggleSidebar,
} = useResizablePanel(sidebarRef, { minWidth: 176, maxWidth: 248, storageKey: 'webstore:panel:library' })
// .lib__docs (notes/specs dock) collapses on the Y axis via max-height — a
// different primitive, deliberately untouched by the sidebar resize feature.
const docsCollapsed = ref(false)

// One-letter rail buttons when the sidebar is collapsed — flattens every
// group's stories into a single list, same idea as HandoffApp's flow rail.
const allStories = computed(() => GROUPS.flatMap(g => g.stories))

// ── state simulation (same helpers as the inspector) ──────────────────────────
let cleanupState = null
function clearState () {
  if (cleanupState) { try { cleanupState() } catch { /* noop */ } cleanupState = null }
}
function applyState (s) {
  clearState()
  activeState.value = s
  if (s === 'default') return
  const el = stageRef.value?.componentEl()
  if (!el) return
  if (s === 'hover')    cleanupState = buildHoverOverride(el)
  // buildHoverOverride already special-cases pseudo === 'focus' (aliases
  // :focus-visible/:focus) — it just sat unused until now; no new inspect-kit
  // code needed, only wiring it up as a selectable state here.
  if (s === 'focus')    cleanupState = buildHoverOverride(el, 'focus')
  if (s === 'pressed')  cleanupState = applyPressedState(el)
  if (s === 'disabled') cleanupState = applyDisabledState(el)
}

// Reset simulated state whenever the rendered element changes underneath us.
watch([selectedId, variantIndex, theme, widthMode, gridMode], () => {
  // Defer to let the new component mount before re-applying.
  clearState()
  activeState.value = 'default'
})

// Capture-mode readiness signal — same convention as figmaCapture.js's
// data-figma-capture-ready (images loaded, fonts ready, a short settle delay
// for CSS transitions/entrance motion), so a capture driver waits on a real
// signal instead of guessing a fixed timeout. Scoped to its own dataset key
// (not figmaCaptureReady) since this identifies a story/variant/width, not
// one of that mechanism's named app-level steps.
if (captureMode) {
  watch([selectedId, variantIndex, theme, widthMode], async () => {
    delete document.documentElement.dataset.captureReady
    await nextTick()
    const el = stageRef.value?.componentEl()
    if (!el) return
    await waitForCaptureReady({ root: el })
    document.documentElement.dataset.captureReady = `${selectedId.value}:${variantIndex.value}:${widthMode.value}:${theme.value}`
    document.documentElement.dataset.captureSelector = '.lib__stage .stage-host__screen'
  }, { immediate: true })
}

// ── Specs handoff to the inspector ────────────────────────────────────────────
function inspectStage () {
  const el = stageRef.value?.componentEl()
  if (!el) return
  inspector.open()
  nextTick(() => inspector.select(el))
}

// ── lifecycle ─────────────────────────────────────────────────────────────────
// Auto-select the first story the first time the viewer opens with nothing chosen.
watch(active, (on) => {
  if (on) {
    // Entering the page may carry a selection from a "View in library" jump while
    // the inspector was open on a store element — that element is now unmounted,
    // so close the inspector to drop its stale highlight.
    inspector.close()
    if (!selectedId.value && GROUPS[0]?.stories[0]) {
      select(GROUPS[0].stories[0].id)
    }
  }
  if (!on) clearState()
}, { immediate: true })

function onSelect (id) {
  select(id)
  tab.value = 'notes'
}

function onKeydown (e) {
  if (e.key === 'Escape') { e.preventDefault(); close() }
}

onBeforeUnmount(clearState)
</script>

<template>
  <Transition name="lib">
    <div v-if="active" class="lib" :class="{ 'lib--capture': captureMode }" role="dialog" aria-modal="true" aria-label="Component library" @keydown="onKeydown">
      <!-- ── side panel — hidden entirely in capture mode (?capture=1) ───────── -->
      <aside
        v-if="!captureMode"
        ref="sidebarRef"
        class="lib__sidebar"
        :class="{ 'lib__sidebar--collapsed': sidebarCollapsed, 'is-resizing': isResizing }"
        :style="panelStyle"
      >
        <header class="lib__brand">
          <MaterialIcon name="view_module" variant="round" :size="18" />
          <span v-if="!sidebarCollapsed">Component Library</span>
          <button
            v-if="!sidebarCollapsed"
            type="button"
            class="lib__collapse-btn"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            aria-expanded="true"
            @click="toggleSidebar()"
          >
            <MaterialIcon name="chevron_left" variant="round" :size="16" />
          </button>
        </header>
        <template v-if="!sidebarCollapsed">
          <div class="lib__search">
            <MaterialIcon name="search" variant="round" :size="16" class="lib__search-icon" />
            <input
              v-model="query"
              type="text"
              class="lib__search-input"
              placeholder="Search components…"
              aria-label="Search components"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <nav class="lib__list">
            <template v-if="groups.length">
              <div v-for="g in groups" :key="g.group" class="lib__group">
                <div class="lib__group-label">{{ g.group }}</div>
                <button
                  v-for="s in g.stories"
                  :key="s.id"
                  type="button"
                  class="lib__item"
                  :class="{ 'lib__item--active': s.id === selectedId }"
                  @click="onSelect(s.id)"
                >{{ s.title }}</button>
              </div>
            </template>
            <p v-else class="lib__empty">No components match “{{ query }}”</p>
          </nav>
        </template>
        <!-- Collapsed rail: still lets you switch components without expanding
             first — same idea as HandoffApp's flow rail. -->
        <nav v-else class="lib__rail">
          <button
            v-for="s in allStories"
            :key="s.id"
            type="button"
            class="lib__rail-item"
            :class="{ 'lib__rail-item--active': s.id === selectedId }"
            :title="s.title"
            :aria-label="s.title"
            @click="onSelect(s.id)"
          >{{ s.title.slice(0, 1) }}</button>
        </nav>
        <div
          class="lib__resize-handle"
          v-bind="handleProps"
          @pointerdown="startResize"
          @keydown="onHandleKeydown"
          @dblclick="resetWidth"
        ></div>
      </aside>

      <!-- ── main ───────────────────────────────────────────────────────────── -->
      <div class="lib__main">
        <div v-if="!captureMode" class="lib__topbar">
          <div class="lib__title">
            <span class="lib__title-name">{{ story ? story.title : 'Select a component' }}</span>
            <span v-if="story" class="lib__title-group">{{ story.group }}</span>
          </div>
          <button type="button" class="lib__icon-btn" aria-label="Close library" @click="close()">
            <MaterialIcon name="close" variant="round" :size="18" />
          </button>
        </div>

        <div v-if="story && !captureMode" class="lib__controls">
          <!-- variants -->
          <div v-if="story.variants.length > 1" class="lib__control">
            <span class="lib__control-label">Variant</span>
            <select class="lib__select" :value="variantIndex" @change="setVariant(Number($event.target.value))">
              <option v-for="(v, i) in story.variants" :key="v.name" :value="i">{{ v.name }}</option>
            </select>
          </div>

          <!-- states (hidden in grid mode — simulating a pseudo-state against N
               simultaneous cells has no single target element) -->
          <div v-if="states.length > 1 && !gridMode" class="lib__control">
            <span class="lib__control-label">State</span>
            <div class="lib__seg">
              <button
                v-for="s in states"
                :key="s"
                type="button"
                class="lib__seg-btn"
                :class="{ 'lib__seg-btn--active': s === activeState }"
                @click="applyState(s)"
              >{{ s }}</button>
            </div>
          </div>

          <!-- theme / grid toggle -->
          <div v-if="themes.length > 1" class="lib__control">
            <span class="lib__control-label">Theme</span>
            <div class="lib__theme-row">
              <select
                v-if="!gridMode"
                class="lib__select"
                :value="theme"
                @change="setTheme($event.target.value)"
              >
                <option v-for="t in themes" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
              <span v-else class="lib__theme-grid-label">All {{ themes.length }} stores</span>
              <button
                type="button"
                class="lib__icon-toggle"
                :class="{ 'lib__icon-toggle--active': gridMode }"
                :aria-pressed="gridMode"
                title="Grid: every store at once"
                aria-label="Toggle theme grid view"
                @click="gridMode = !gridMode"
              >
                <MaterialIcon name="grid_view" variant="round" :size="15" />
              </button>
            </div>
          </div>

          <!-- width -->
          <div class="lib__control">
            <span class="lib__control-label">Width</span>
            <div class="lib__seg">
              <button
                v-for="w in WIDTHS"
                :key="w.value"
                type="button"
                class="lib__seg-btn"
                :class="{ 'lib__seg-btn--active': w.value === widthMode }"
                @click="setWidth(w.value)"
              >{{ w.label }}</button>
            </div>
          </div>

          <!-- zoom (single-theme mode only — grid mode uses its own fixed
               compact scale so 12 cells fit at once) -->
          <div v-if="!gridMode" class="lib__control">
            <span class="lib__control-label">Zoom</span>
            <div class="lib__seg">
              <button
                v-for="z in ZOOM_LEVELS"
                :key="z"
                type="button"
                class="lib__seg-btn"
                :class="{ 'lib__seg-btn--active': z === zoomLevel }"
                @click="zoomLevel = z"
              >{{ z }}×</button>
            </div>
          </div>

          <!-- background -->
          <div class="lib__control">
            <span class="lib__control-label">Background</span>
            <div class="lib__seg">
              <button
                v-for="b in BG_MODES"
                :key="b.value"
                type="button"
                class="lib__seg-btn"
                :class="{ 'lib__seg-btn--active': b.value === stageBg }"
                @click="stageBg = b.value"
              >{{ b.label }}</button>
            </div>
          </div>
        </div>

        <!-- stage -->
        <div class="lib__stage" :class="`lib__stage--bg-${stageBg}`">
          <!-- theme grid: every store rendered simultaneously — the visual
               twin of harness test all's 12-store token sweep. -->
          <div v-if="story && gridMode" class="lib__theme-grid">
            <div v-for="t in themes" :key="t.value" class="lib__theme-grid-cell">
              <div class="lib__theme-grid-cell-label">{{ t.label }}</div>
              <div class="lib__theme-grid-cell-stage">
                <StoryStage
                  :story="story"
                  :variant-index="variantIndex"
                  :width="widthMode"
                  :theme-override="t.value"
                />
              </div>
            </div>
          </div>

          <StoryStage
            v-else-if="story"
            ref="stageRef"
            :story="story"
            :variant-index="variantIndex"
            :width="widthMode"
            :style="{ zoom: zoomLevel }"
          />
          <div v-else class="lib__placeholder">
            <MaterialIcon name="view_module" variant="round" :size="40" />
            <p>Pick a component from the left to inspect its states, specs and themes.</p>
          </div>
        </div>

        <!-- docs -->
        <div v-if="story && !captureMode" class="lib__docs" :class="{ 'lib__docs--collapsed': docsCollapsed }">
          <div class="lib__tabs">
            <button type="button" class="lib__tab" :class="{ 'lib__tab--active': tab === 'notes' }" @click="tab = 'notes'">Notes</button>
            <button type="button" class="lib__tab" :class="{ 'lib__tab--active': tab === 'specs' }" @click="tab = 'specs'">Specs</button>
            <button
              type="button"
              class="lib__icon-btn lib__docs-toggle"
              :aria-label="docsCollapsed ? 'Expand notes/specs panel' : 'Collapse notes/specs panel'"
              :title="docsCollapsed ? 'Expand notes/specs panel' : 'Collapse notes/specs panel'"
              @click="docsCollapsed = !docsCollapsed"
            >
              <MaterialIcon :name="docsCollapsed ? 'expand_less' : 'expand_more'" variant="round" :size="18" />
            </button>
          </div>

          <div v-if="!docsCollapsed && tab === 'notes'" class="lib__docs-body">
            <p v-if="story.notes" class="lib__notes">{{ story.notes }}</p>
            <ul v-if="story.rules && story.rules.length" class="lib__rules">
              <li v-for="(r, i) in story.rules" :key="i">{{ r }}</li>
            </ul>
            <p v-if="!story.notes && !(story.rules && story.rules.length)" class="lib__notes lib__notes--muted">
              No notes authored for this component yet.
            </p>
          </div>

          <div v-else-if="!docsCollapsed" class="lib__docs-body">
            <p class="lib__notes lib__notes--muted">
              Open the live inspector on the staged component to read its CSS, design
              tokens, motion, props and accessibility — sourced from the same engine
              as the toolbar inspector.
            </p>
            <button type="button" class="lib__inspect-btn" @click="inspectStage()">
              <MaterialIcon name="highlight_alt" variant="round" :size="15" />
              Inspect this component
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Dev chrome — system font + Figma blue, mirroring InspectorPanel / CommandConsole.
   Layout values are intentionally ad-hoc (not store tokens); only the staged
   component inside StoryStage uses the design-token system. */
.lib {
  position: fixed;
  inset: 0;
  z-index: 8000; /* below the inspector overlay (9000) so its panel floats on top */
  display: flex;
  /* Solid dev-chrome backdrop — NEVER a store token. YGODL sets --x-bg-page to
     `transparent` (it paints a fixed page-bg image on .app instead), so a
     var(--x-bg-page) here would go see-through and let the store bleed in. */
  background: #0c0e16;
  color: var(--x-text-body-default, #e7e7ea);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
}

/* ── side panel ── */
.lib__sidebar {
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #16181c;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  /* width comes from panelStyle (useResizablePanel) — no fixed value here.
     Collapse/expand and keyboard-nudge transitions are driven entirely by
     the composable (inline el.style.transition), not CSS, so every trigger
     path shares the same eased motion. */
}
.lib__sidebar--collapsed {
  border-right-color: rgba(255, 255, 255, 0.06);
}
.lib__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.lib__sidebar--collapsed .lib__brand {
  padding: 14px 8px;
  justify-content: center;
}
.lib__collapse-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #b8b8c0;
  cursor: pointer;
}
.lib__collapse-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }

/* Collapsed rail — one letter-button per story, so switching components
   doesn't require expanding first (same idea as Handoff's flow rail). */
.lib__rail {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  scrollbar-width: none;
}
.lib__rail-item {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #b8b8c0;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
}
.lib__rail-item:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
.lib__rail-item--active { background: rgba(59, 130, 246, 0.18); color: #fff; }

/* Resize handle — a thin strip on the sidebar's own right edge, invisible at
   rest so it doesn't compete visually with the border-right hairline. */
.lib__resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 1;
  background: transparent;
  transition: background-color 120ms ease;
}
.lib__resize-handle:hover,
.lib__resize-handle:focus-visible,
.lib__sidebar.is-resizing .lib__resize-handle {
  background: rgba(28, 111, 235, 0.55);
}
.lib__resize-handle:focus-visible { outline: none; } /* the fill above IS the focus indicator */
.lib__search {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.lib__search-icon { color: #9a9aa2; flex-shrink: 0; }
.lib__search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: #fff;
  outline: none;
  font: inherit;
}
.lib__search-input::placeholder { color: #6f6f78; }

.lib__list { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 8px 16px; scrollbar-width: thin; }
.lib__group { margin-bottom: 10px; }
.lib__group-label {
  padding: 6px 8px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #8a8a92;
}
.lib__item {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: #cfcfd6;
  padding: 7px 10px;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;
}
.lib__item:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.lib__item--active { background: rgba(28, 111, 235, 0.18); color: #6aa3f8; font-weight: 600; }
.lib__empty { padding: 16px; color: #8a8a92; text-align: center; }

/* ── main ── */
.lib__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lib__topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
.lib__title { flex: 1; display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.lib__title-name { font-weight: 700; font-size: 15px; color: #fff; }
.lib__title-group {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8a8a92;
}
.lib__icon-btn {
  display: inline-flex;
  border: 0;
  background: transparent;
  color: #9a9aa2;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.lib__icon-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.06); }

.lib__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
.lib__control { display: flex; flex-direction: column; gap: 5px; }
.lib__control-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  color: #8a8a92;
}
.lib__seg { display: inline-flex; gap: 2px; padding: 3px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; }
.lib__seg-btn {
  appearance: none;
  border: 0;
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 6px;
  background: transparent;
  color: #9a9aa2;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  text-transform: capitalize;
  transition: background-color 120ms, color 120ms;
}
.lib__seg-btn:hover { color: #fff; }
.lib__seg-btn--active { background: rgba(28, 111, 235, 0.9); color: #fff; }
.lib__select {
  appearance: none;
  border: 0;
  cursor: pointer;
  padding: 6px 28px 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="%239a9aa2" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat right 10px center;
  color: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
}
.lib__select:hover { background-color: rgba(255, 255, 255, 0.08); }

.lib__stage {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background:
    repeating-conic-gradient(rgba(255,255,255,0.018) 0% 25%, transparent 0% 50%) 50% / 22px 22px;
}
/* Centre the staged component instead of pinning it to the top of a stage
   sized for a full device screen — .stage-host is @coda/harness-kit's own
   scoped root; :deep() reaches into it since this viewer doesn't own that
   package. Unconditional (not behind a background/zoom mode) — top-anchoring
   inside a tall stage was never the intended reading, just the default. */
.lib__stage :deep(.stage-host) {
  align-items: center;
}
/* Background modes — override the device screen's own painted background
   (the real store --x-bg-page / brand bg image, from @coda/harness-kit's
   StoryStage) so legibility can be judged against a neutral, controlled
   ground instead of always the real (often dark) page colour. `background`
   shorthand resets background-image to `none` too, so this fully replaces
   the store's own paint, not just layers under it. Checkerboard is the
   default (no override — same look as before this control existed). */
.lib__stage--bg-light :deep(.stage-host__screen) {
  background: #f2f1ec !important;
}
.lib__stage--bg-dark :deep(.stage-host__screen) {
  background: #0c0e16 !important;
}

/* ── theme grid ── */
.lib__theme-row { display: flex; align-items: center; gap: 6px; }
.lib__theme-grid-label {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}
.lib__icon-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #9a9aa2;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;
}
.lib__icon-toggle:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
.lib__icon-toggle--active { background: rgba(28, 111, 235, 0.9); color: #fff; }

.lib__theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 20px;
  align-items: start;
}
.lib__theme-grid-cell {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}
.lib__theme-grid-cell-label {
  padding: 7px 10px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #cfcfd6;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
/* Fixed compact scale so 12 device-width stages fit in a grid — not
   adjustable in this pass (see plans/tickets/done/library-viewer-ux.md item 2/3); the
   single-stage Zoom control is the tunable one. */
.lib__theme-grid-cell-stage {
  zoom: 0.4;
  overflow: hidden;
}
.lib__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 100%;
  color: #6f6f78;
  text-align: center;
  padding: 32px;
}
.lib__placeholder p { max-width: 320px; line-height: 1.5; }

/* ── docs ── */
.lib__docs {
  flex-shrink: 0;
  max-height: 38%;
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: #16181c;
}
.lib__docs--collapsed { max-height: none; }
.lib__tabs { display: flex; align-items: center; gap: 4px; padding: 8px 8px 0 12px; flex-shrink: 0; }
.lib__docs-toggle { margin-left: auto; }
.lib__tab {
  border: 0;
  background: transparent;
  color: #9a9aa2;
  padding: 6px 12px;
  border-radius: 6px 6px 0 0;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.lib__tab:hover { color: #fff; }
.lib__tab--active { color: #6aa3f8; background: rgba(28, 111, 235, 0.12); }

.lib__docs-body { padding: 12px 16px 16px; overflow-y: auto; scrollbar-width: thin; }
.lib__notes { margin: 0 0 10px; line-height: 1.55; color: #cfcfd6; white-space: pre-wrap; }
.lib__notes--muted { color: #8a8a92; }
.lib__rules { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
.lib__rules li { line-height: 1.5; color: #cfcfd6; }

.lib__inspect-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(28, 111, 235, 0.45);
  background: rgba(28, 111, 235, 0.12);
  color: #6aa3f8;
  border-radius: 8px;
  padding: 8px 14px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 120ms;
}
.lib__inspect-btn:hover { background: rgba(28, 111, 235, 0.22); }

/* Open/close motion — fade + slight lift (decelerate in, accelerate out). */
.lib-enter-active { transition: opacity var(--x-motion-modal-enter, 250ms cubic-bezier(0, 0, 0.2, 1)); }
.lib-leave-active { transition: opacity var(--x-motion-modal-exit, 200ms cubic-bezier(0.4, 0, 1, 1)); }
.lib-enter-from, .lib-leave-to { opacity: 0; }
</style>
