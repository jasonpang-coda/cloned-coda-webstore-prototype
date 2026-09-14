<script setup>
/**
 * HandoffApp — the /handoff surface shell (dev chrome, prototype-only).
 *
 * Full-screen overlay mirroring src/library/LibraryViewer.vue's structure
 * (sidebar of items + main content), but routed on a real path via
 * useHandoff.js instead of a hash. Index view lists every discovered flow
 * (registry.js, auto-populated from flows/*.flow.js); selecting one opens a
 * tab bar over the five handoff surfaces.
 *
 * Same dev-chrome convention as LibraryViewer/InspectorPanel/CommandConsole:
 * system font + fixed dark chrome for the frame (so the tool doesn't visually
 * flicker as the store theme underneath changes), while the content panels
 * (TokenLibrary etc.) intentionally consume the live DS tokens they're
 * documenting.
 */
import { computed, ref } from 'vue'
import MaterialIcon from '../components/MaterialIcon.vue'
import { FLOWS, getFlow } from './registry.js'
import { useHandoff } from './useHandoff.js'
import { useResizablePanel } from '../composables/useResizablePanel.js'
import TokenLibrary from './components/TokenLibrary.vue'
import TokenContract from './components/TokenContract.vue'
import StateLaydown from './components/StateLaydown.vue'
import Choreography from './components/Choreography.vue'

const { active, slug, tab, tabs, close, selectFlow, selectTab } = useHandoff()

const flow = computed(() => (slug.value ? getFlow(slug.value) : null))

// Sidebar: drag-resizable + collapses to a 48px icon rail — same composable
// as LibraryViewer.vue/TokenAuditApp.vue (useResizablePanel.js), standardized
// across every tool page. maxWidth is this page's own former fixed width.
const sidebarRef = ref(null)
const {
  collapsed, isResizing, panelStyle, handleProps,
  startResize, onHandleKeydown, resetWidth, toggle: toggleSidebar,
} = useResizablePanel(sidebarRef, { minWidth: 176, maxWidth: 248, storageKey: 'webstore:panel:handoff' })

const TAB_LABELS = {
  tokens: 'Tokens',
  components: 'Components',
  states: 'States',
  choreography: 'Choreography',
  spec: 'Spec',
}

function onKeydown (e) {
  if (e.key === 'Escape') { e.preventDefault(); close() }
}
</script>

<template>
  <Transition name="handoff">
    <div v-if="active" class="handoff" role="dialog" aria-modal="true" aria-label="Handoff" @keydown="onKeydown">
      <aside
        ref="sidebarRef"
        class="handoff__sidebar"
        :class="{ 'handoff__sidebar--collapsed': collapsed, 'is-resizing': isResizing }"
        :style="panelStyle"
      >
        <header class="handoff__brand">
          <MaterialIcon name="handshake" variant="round" :size="18" />
          <span v-if="!collapsed">Handoff</span>
          <button
            v-if="!collapsed"
            type="button"
            class="handoff__collapse-btn"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            aria-expanded="true"
            @click="toggleSidebar()"
          >
            <MaterialIcon name="chevron_left" variant="round" :size="16" />
          </button>
        </header>
        <nav v-if="!collapsed" class="handoff__list">
          <p v-if="!FLOWS.length" class="handoff__empty">No flows registered yet — drop a *.flow.js file in src/handoff/flows/.</p>
          <button
            v-for="f in FLOWS"
            :key="f.slug"
            type="button"
            class="handoff__item"
            :class="{ 'handoff__item--active': f.slug === slug }"
            @click="selectFlow(f.slug)"
          >{{ f.title }}</button>
        </nav>
        <!-- Collapsed rail: current flow still selectable via a slim icon-only
             list, so switching flows doesn't require expanding first. -->
        <nav v-else class="handoff__rail">
          <button
            v-for="f in FLOWS"
            :key="f.slug"
            type="button"
            class="handoff__rail-item"
            :class="{ 'handoff__rail-item--active': f.slug === slug }"
            :title="f.title"
            :aria-label="f.title"
            @click="selectFlow(f.slug)"
          >{{ f.title.slice(0, 1) }}</button>
        </nav>
        <div
          class="handoff__resize-handle"
          v-bind="handleProps"
          @pointerdown="startResize"
          @keydown="onHandleKeydown"
          @dblclick="resetWidth"
        ></div>
      </aside>

      <div class="handoff__main">
        <div class="handoff__topbar">
          <div class="handoff__title">
            <span class="handoff__title-name">{{ flow ? flow.title : 'Select a flow' }}</span>
            <span v-if="flow?.summary" class="handoff__title-summary">{{ flow.summary }}</span>
          </div>
          <button type="button" class="handoff__icon-btn" aria-label="Close handoff" @click="close()">
            <MaterialIcon name="close" variant="round" :size="18" />
          </button>
        </div>

        <div v-if="flow" class="handoff__tabs">
          <button
            v-for="t in tabs"
            :key="t"
            type="button"
            class="handoff__tab"
            :class="{ 'handoff__tab--active': t === tab }"
            @click="selectTab(t)"
          >{{ TAB_LABELS[t] }}</button>
        </div>

        <div class="handoff__content">
          <template v-if="flow">
            <TokenLibrary v-if="tab === 'tokens'" :flow="flow" />
            <TokenContract v-else-if="tab === 'components'" :flow="flow" />
            <StateLaydown v-else-if="tab === 'states'" :flow="flow" />
            <Choreography v-else-if="tab === 'choreography'" :flow="flow" />
            <div v-else-if="tab === 'spec'" class="handoff__spec">
              <p v-if="flow.notes?.rationale" class="handoff__spec-block"><strong>Rationale</strong><br />{{ flow.notes.rationale }}</p>
              <div v-if="flow.notes?.buildOrder?.length" class="handoff__spec-block">
                <strong>Build order</strong>
                <ol><li v-for="(s, i) in flow.notes.buildOrder" :key="i">{{ s }}</li></ol>
              </div>
              <div v-if="flow.notes?.gotchas?.length" class="handoff__spec-block">
                <strong>Gotchas</strong>
                <ul><li v-for="(g, i) in flow.notes.gotchas" :key="i">{{ g }}</li></ul>
              </div>
              <div v-if="flow.notes?.prohibitions?.length" class="handoff__spec-block">
                <strong>Prohibitions</strong>
                <ul><li v-for="(p, i) in flow.notes.prohibitions" :key="i">{{ p }}</li></ul>
              </div>
              <div v-if="flow.notes?.openQuestions?.length" class="handoff__spec-block">
                <strong>Open questions</strong>
                <ul><li v-for="(q, i) in flow.notes.openQuestions" :key="i">{{ q }}</li></ul>
              </div>
              <p class="handoff__spec-hint">
                Generated export: <code>docs/Handoff/{{ flow.slug }}/spec.md</code>
                (run <code>npm run handoff:export</code>).
              </p>
            </div>
          </template>
          <div v-else class="handoff__placeholder">
            <MaterialIcon name="handshake" variant="round" :size="40" />
            <p>Pick a flow from the left — tokens, component contracts, states, and choreography are all resolved live, never transcribed.</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Dev chrome — mirrors LibraryViewer.vue's system-font/ad-hoc-dark convention.
   Layout values are intentionally ad-hoc; content panels use the DS tokens. */
.handoff {
  position: fixed;
  inset: 0;
  z-index: 8000;
  display: flex;
  background: #0c0e16;
  color: var(--x-text-body-default, #e7e7ea);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
}

.handoff__sidebar {
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #16181c;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  /* width comes from panelStyle (useResizablePanel) — no fixed value here.
     Collapse/expand and keyboard-nudge transitions are driven entirely by
     the composable (inline el.style.transition), not CSS, so every trigger
     path shares the same eased motion. */
}
.handoff__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.handoff__sidebar--collapsed .handoff__brand { padding: 14px 8px; justify-content: center; }
.handoff__collapse-btn {
  margin-left: auto;
  display: inline-flex;
  border: 0;
  background: transparent;
  color: #9a9aa2;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  flex-shrink: 0;
}
.handoff__collapse-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.06); }

.handoff__list { flex: 1; min-height: 0; overflow-y: auto; padding: 8px; scrollbar-width: thin; }

/* Collapsed rail — icon-only flow switcher so a flow stays reachable without
   expanding the sidebar back out first. */
.handoff__rail { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 6px; display: flex; flex-direction: column; gap: 4px; align-items: center; }
.handoff__rail-item {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #cfcfd6;
  font-weight: 700;
  cursor: pointer;
}
.handoff__rail-item:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.handoff__rail-item--active { background: rgba(28, 111, 235, 0.18); color: #6aa3f8; }

/* Resize handle — a thin strip on the sidebar's own right edge, invisible at
   rest so it doesn't compete visually with the border-right hairline. Shared
   spec with LibraryViewer.vue/TokenAuditApp.vue's own handle. */
.handoff__resize-handle {
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
.handoff__resize-handle:hover,
.handoff__resize-handle:focus-visible,
.handoff__sidebar.is-resizing .handoff__resize-handle {
  background: rgba(28, 111, 235, 0.55);
}
.handoff__resize-handle:focus-visible { outline: none; }
.handoff__empty { padding: 16px; color: #8a8a92; line-height: 1.5; }
.handoff__item {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: #cfcfd6;
  padding: 8px 10px;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}
.handoff__item:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.handoff__item--active { background: rgba(28, 111, 235, 0.18); color: #6aa3f8; font-weight: 600; }

.handoff__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.handoff__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
.handoff__title { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.handoff__title-name { font-weight: 700; font-size: 15px; color: #fff; }
.handoff__title-summary { font-size: 12px; color: #8a8a92; }
.handoff__icon-btn { display: inline-flex; border: 0; background: transparent; color: #9a9aa2; cursor: pointer; padding: 4px; border-radius: 6px; }
.handoff__icon-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.06); }

.handoff__tabs { display: flex; gap: 4px; padding: 8px 16px 0; flex-shrink: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.handoff__tab { border: 0; background: transparent; color: #9a9aa2; padding: 8px 14px; border-radius: 6px 6px 0 0; font: inherit; font-weight: 600; cursor: pointer; }
.handoff__tab:hover { color: #fff; }
.handoff__tab--active { color: #6aa3f8; background: rgba(28, 111, 235, 0.12); }

.handoff__content { flex: 1; min-height: 0; overflow-y: auto; padding: 20px; scrollbar-width: thin; }
.handoff__placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; height: 100%; color: #6f6f78; text-align: center; padding: 32px; }
.handoff__placeholder p { max-width: 340px; line-height: 1.5; }

.handoff__spec { max-width: 720px; }
.handoff__spec-block { margin: 0 0 20px; line-height: 1.6; color: #cfcfd6; }
.handoff__spec-block strong { color: #fff; }
.handoff__spec-hint { color: #8a8a92; font-size: 12px; }
.handoff__spec-hint code { font-family: monospace; }

.handoff-enter-active { transition: opacity var(--x-motion-modal-enter, 250ms cubic-bezier(0, 0, 0.2, 1)); }
.handoff-leave-active { transition: opacity var(--x-motion-modal-exit, 200ms cubic-bezier(0.4, 0, 1, 1)); }
.handoff-enter-from, .handoff-leave-to { opacity: 0; }
</style>
