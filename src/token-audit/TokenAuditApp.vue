<script setup>
/**
 * TokenAuditApp — the /tokens dashboard shell (dev chrome, prototype-only).
 *
 * Structural clone of src/handoff/HandoffApp.vue: full-screen overlay,
 * fixed ad-hoc dark chrome (system font, so it never renders in the active
 * store's brand face and never re-themes as the store switcher below flips
 * stores), content panels built entirely from the existing semantic token
 * set. Real path routing via useTokenAudit.js, same reasoning as /handoff.
 *
 * The audit itself is a synchronous scan over globbed source text (see
 * sources.js) — not free, so it's computed once behind a memoised getter
 * and reused across every tab and every store-selector change within one
 * page load.
 */
import { computed, ref } from 'vue'
import MaterialIcon from '../components/MaterialIcon.vue'
import { useTokenAudit } from './useTokenAudit.js'
import { getTokenAudit, sourceCounts } from './sources.js'
import { useResizablePanel } from '../composables/useResizablePanel.js'
import Overview from './components/Overview.vue'
import Coverage from './components/Coverage.vue'
import Drift from './components/Drift.vue'
import Custom from './components/Custom.vue'
import Stores from './components/Stores.vue'

const { active, tab, tabs, close, selectTab } = useTokenAudit()

// Sidebar: drag-resizable + collapses to a 48px icon rail — same composable
// as LibraryViewer.vue/HandoffApp.vue (useResizablePanel.js), standardized
// across every tool page. This page had no collapse mechanism at all before;
// minWidth is wider than the other two pages' (208px, not 176px) since the
// "Prototype (NNN)" segmented-control label is the widest atom in this panel.
const sidebarRef = ref(null)
const {
  collapsed, isResizing, panelStyle, handleProps,
  startResize, onHandleKeydown, resetWidth, toggle: toggleSidebar,
} = useResizablePanel(sidebarRef, { minWidth: 208, maxWidth: 260, storageKey: 'webstore:panel:tokenAudit' })

const TAB_LABELS = {
  overview: 'Overview',
  coverage: 'Coverage',
  drift: 'Drift',
  custom: 'Custom',
  stores: 'Stores',
}

// Only run the (non-trivial) scan while the panel is actually open, and
// only once — every tab and every bucket/store filter change re-reads the
// same memoised model.
const model = computed(() => (active.value ? getTokenAudit() : null))
const counts = computed(() => (active.value ? sourceCounts() : null))

const bucket = ref('prod') // 'prod' | 'prototype' — decision #1's default
const selectedStore = ref(null) // null = all stores (global rollups)

function onKeydown (e) {
  if (e.key === 'Escape') { e.preventDefault(); close() }
}
</script>

<template>
  <Transition name="tokaudit">
    <div v-if="active" class="tokaudit" role="dialog" aria-modal="true" aria-label="Token usage dashboard" @keydown="onKeydown">
      <aside
        ref="sidebarRef"
        class="tokaudit__sidebar"
        :class="{ 'tokaudit__sidebar--collapsed': collapsed, 'is-resizing': isResizing }"
        :style="panelStyle"
      >
        <header class="tokaudit__brand">
          <MaterialIcon name="contextual_token" variant="round" :size="18" />
          <span v-if="!collapsed">Token usage</span>
          <button
            v-if="!collapsed"
            type="button"
            class="tokaudit__collapse-btn"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            aria-expanded="true"
            @click="toggleSidebar()"
          >
            <MaterialIcon name="chevron_left" variant="round" :size="16" />
          </button>
        </header>

        <template v-if="!collapsed">
          <div class="tokaudit__filters">
            <div class="tokaudit__filter-group">
              <span class="tokaudit__filter-label">Bucket</span>
              <div class="tokaudit__seg">
                <button type="button" class="tokaudit__seg-btn" :class="{ 'tokaudit__seg-btn--active': bucket === 'prod' }" @click="bucket = 'prod'">
                  Prod ({{ model?.stats.universe.prodContract ?? '…' }})
                </button>
                <button type="button" class="tokaudit__seg-btn" :class="{ 'tokaudit__seg-btn--active': bucket === 'prototype' }" @click="bucket = 'prototype'">
                  Prototype ({{ model?.stats.universe.prototypeOnly ?? '…' }})
                </button>
              </div>
            </div>

            <div class="tokaudit__filter-group">
              <span class="tokaudit__filter-label">Store</span>
              <select class="tokaudit__select" :value="selectedStore ?? ''" @change="selectedStore = $event.target.value || null">
                <option value="">All stores</option>
                <option v-for="s in model?.meta.stores ?? []" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <p v-if="counts" class="tokaudit__scope">
            Scanned {{ counts.tokenCss }} token CSS files, {{ counts.vue }} .vue, {{ counts.js }} .js
          </p>
        </template>
        <!-- Collapsed rail: this sidebar holds filters, not a list, so its rail
             is 2 icon buttons rather than Library/Handoff's per-item rail. -->
        <nav v-else class="tokaudit__rail">
          <button
            type="button"
            class="tokaudit__rail-item"
            :class="{ 'tokaudit__rail-item--active': bucket === 'prototype' }"
            :title="bucket === 'prod' ? 'Bucket: Prod (click for Prototype)' : 'Bucket: Prototype (click for Prod)'"
            :aria-label="'Bucket: ' + bucket"
            @click="bucket = bucket === 'prod' ? 'prototype' : 'prod'"
          >
            <MaterialIcon name="filter_alt" variant="round" :size="16" />
          </button>
          <button
            type="button"
            class="tokaudit__rail-item"
            :class="{ 'tokaudit__rail-item--active': !!selectedStore }"
            :title="selectedStore ? `Store: ${selectedStore} (click to expand)` : 'Store: All (click to expand)'"
            :aria-label="'Store filter: ' + (selectedStore || 'All')"
            @click="toggleSidebar()"
          >
            <MaterialIcon name="store" variant="round" :size="16" />
          </button>
        </nav>
        <div
          class="tokaudit__resize-handle"
          v-bind="handleProps"
          @pointerdown="startResize"
          @keydown="onHandleKeydown"
          @dblclick="resetWidth"
        ></div>
      </aside>

      <div class="tokaudit__main">
        <div class="tokaudit__topbar">
          <nav class="tokaudit__tabs">
            <button
              v-for="t in tabs"
              :key="t"
              type="button"
              class="tokaudit__tab"
              :class="{ 'tokaudit__tab--active': t === tab }"
              @click="selectTab(t)"
            >{{ TAB_LABELS[t] }}</button>
          </nav>
          <div class="tokaudit__topbar-right">
            <span v-if="model" class="tokaudit__fresh" title="This model is regenerated fresh on every page load">
              <MaterialIcon name="schedule" variant="round" :size="14" />
              Scanned {{ new Date(model.meta.generatedAt).toLocaleTimeString() }}
            </span>
            <button type="button" class="tokaudit__icon-btn" aria-label="Close token usage dashboard" @click="close()">
              <MaterialIcon name="close" variant="round" :size="18" />
            </button>
          </div>
        </div>

        <div class="tokaudit__content">
          <div v-if="!model" class="tokaudit__skeleton" aria-hidden="true" aria-label="Loading the audit">
            <div class="tokaudit__skel-hero" />
            <div class="tokaudit__skel-row">
              <div class="tokaudit__skel-card" />
              <div class="tokaudit__skel-card" />
              <div class="tokaudit__skel-card" />
              <div class="tokaudit__skel-card" />
            </div>
            <div class="tokaudit__skel-block" />
          </div>
          <template v-else>
            <Overview v-if="tab === 'overview'" :model="model" :bucket="bucket" />
            <Coverage v-else-if="tab === 'coverage'" :model="model" :bucket="bucket" />
            <Drift v-else-if="tab === 'drift'" :model="model" />
            <Custom v-else-if="tab === 'custom'" :model="model" />
            <Stores v-else-if="tab === 'stores'" :model="model" :selected-store="selectedStore" />
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Dev chrome — same convention as HandoffApp.vue/LibraryViewer.vue:
   system font + fixed ad-hoc dark frame (never re-themes as the store
   selector flips stores while comparing), content panels consume the live
   DS tokens they're reporting on. */
.tokaudit {
  /* Fixed dev-chrome ramp — deliberately off-brand (never re-themes as the
     store selector flips stores below), but systematised into one place
     instead of hex sprinkled through every rule. Content panels do NOT use
     these — they consume the live --x-* semantic tokens they're auditing. */
  --tk-bg: #0c0e16;
  --tk-surface: #16181c;
  --tk-surface-2: #1c1e26;
  --tk-border: rgba(255, 255, 255, 0.1);
  --tk-border-soft: rgba(255, 255, 255, 0.08);
  --tk-text: #e7e7ea;
  --tk-text-bright: #fff;
  --tk-text-dim: #9a9aa2;
  --tk-text-faint: #6f6f78;
  --tk-accent: #6aa3f8;
  --tk-accent-bg: rgba(28, 111, 235, 0.2);
  --tk-accent-bg-soft: rgba(28, 111, 235, 0.12);
  --tk-hover-bg: rgba(255, 255, 255, 0.06);
  --tk-skel: rgba(255, 255, 255, 0.06);

  position: fixed;
  inset: 0;
  z-index: 8000;
  display: flex;
  background: var(--tk-bg);
  color: var(--tk-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
}

.tokaudit__sidebar {
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--tk-surface);
  border-right: 1px solid var(--tk-border);
  padding: 14px 16px;
  overflow-y: auto;
  /* width comes from panelStyle (useResizablePanel) — no fixed value here.
     Collapse/expand and keyboard-nudge transitions are driven entirely by
     the composable (inline el.style.transition), not CSS, so every trigger
     path shares the same eased motion. */
}
.tokaudit__sidebar--collapsed { padding: 14px 8px; align-items: center; }
.tokaudit__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
  color: var(--tk-text-bright);
}
.tokaudit__sidebar--collapsed .tokaudit__brand { justify-content: center; }
.tokaudit__collapse-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--tk-text-dim);
  cursor: pointer;
  flex-shrink: 0;
}
.tokaudit__collapse-btn:hover { background: var(--tk-hover-bg); color: var(--tk-text-bright); }

/* Collapsed rail — 2 icon buttons (bucket toggle, store-filter indicator),
   since this sidebar holds filters rather than a list. */
.tokaudit__rail { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.tokaudit__rail-item {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--tk-text-dim);
  cursor: pointer;
}
.tokaudit__rail-item:hover { background: var(--tk-hover-bg); color: var(--tk-text-bright); }
.tokaudit__rail-item--active { background: var(--tk-accent-bg-soft); color: var(--tk-accent); }

/* Resize handle — same shared spec as LibraryViewer.vue/HandoffApp.vue's,
   using this page's own --tk-* colour set instead of a literal. */
.tokaudit__resize-handle {
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
.tokaudit__resize-handle:hover,
.tokaudit__resize-handle:focus-visible,
.tokaudit__sidebar.is-resizing .tokaudit__resize-handle {
  background: var(--tk-accent-bg);
}
.tokaudit__resize-handle:focus-visible { outline: none; }
.tokaudit__filters { display: flex; flex-direction: column; gap: 14px; }
.tokaudit__filter-group { display: flex; flex-direction: column; gap: 6px; }
.tokaudit__filter-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--tk-text-dim); }
.tokaudit__seg { display: flex; border: 1px solid var(--tk-border); border-radius: 8px; overflow: hidden; }
.tokaudit__seg-btn {
  flex: 1;
  border: 0;
  background: transparent;
  color: #cfcfd6;
  padding: 7px 8px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.tokaudit__seg-btn--active { background: var(--tk-accent-bg); color: var(--tk-accent); font-weight: 600; }
.tokaudit__select {
  background: var(--tk-surface-2);
  color: var(--tk-text);
  border: 1px solid var(--tk-border);
  border-radius: 8px;
  padding: 7px 8px;
  font: inherit;
  font-size: 12px;
}
.tokaudit__scope { font-size: 11px; line-height: 1.5; color: var(--tk-text-faint); margin: 0; }

.tokaudit__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.tokaudit__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--tk-border-soft);
  flex-shrink: 0;
}
.tokaudit__tabs { display: flex; gap: 4px; }
.tokaudit__tab { border: 0; background: transparent; color: var(--tk-text-dim); padding: 8px 14px; border-radius: 6px; font: inherit; font-weight: 600; cursor: pointer; }
.tokaudit__tab:hover { color: var(--tk-text-bright); }
.tokaudit__tab--active { color: var(--tk-accent); background: var(--tk-accent-bg-soft); }
.tokaudit__topbar-right { display: flex; align-items: center; gap: 12px; }
.tokaudit__fresh {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--tk-text-dim);
  white-space: nowrap;
}
.tokaudit__icon-btn { display: inline-flex; border: 0; background: transparent; color: var(--tk-text-dim); cursor: pointer; padding: 4px; border-radius: 6px; }
.tokaudit__icon-btn:hover { color: var(--tk-text-bright); background: var(--tk-hover-bg); }

.tokaudit__content { flex: 1; min-height: 0; overflow-y: auto; padding: 20px; scrollbar-width: thin; container-type: inline-size; }

/* Loading skeleton — mirrors the Overview layout (hero + KPI row + a block)
   so the eye keeps its place instead of a blank re-flow when data lands.
   Never render a real-looking 0/0·0% while the scan is still running. */
.tokaudit__skeleton { display: flex; flex-direction: column; gap: 16px; max-width: 960px; }
.tokaudit__skel-hero { height: 96px; border-radius: 10px; background: var(--tk-skel); animation: tokaudit-pulse 1.4s ease-in-out infinite; }
.tokaudit__skel-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.tokaudit__skel-card { height: 76px; border-radius: 10px; background: var(--tk-skel); animation: tokaudit-pulse 1.4s ease-in-out infinite; }
.tokaudit__skel-block { height: 160px; border-radius: 10px; background: var(--tk-skel); animation: tokaudit-pulse 1.4s ease-in-out infinite; }
@keyframes tokaudit-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

/* This is internal dev chrome, reachable via direct URL/command-console even
   though the toolbar entry point itself hides on mobile (DeviceToolbar's
   Tools segment is `!isMobile`) — stack the sidebar above the content below
   a phone-ish width rather than clipping figures against a fixed 260px rail. */
@media (max-width: 700px) {
  .tokaudit { flex-direction: column; }
  /* !important: panelStyle sets an inline width (useResizablePanel), which
     otherwise beats this class-based override at equal-or-lower specificity. */
  .tokaudit__sidebar { width: 100% !important; flex-direction: row; flex-wrap: wrap; max-height: 40vh; }
  .tokaudit__resize-handle { display: none; }
}

.tokaudit-enter-active { transition: opacity var(--x-motion-modal-enter, 250ms cubic-bezier(0, 0, 0.2, 1)); }
.tokaudit-leave-active { transition: opacity var(--x-motion-modal-exit, 200ms cubic-bezier(0.4, 0, 1, 1)); }
.tokaudit-enter-from, .tokaudit-leave-to { opacity: 0; }
</style>
