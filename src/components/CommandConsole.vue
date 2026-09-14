<script setup>
/**
 * CommandConsole — dev command palette, opened with `/` (App.vue global keydown).
 *
 * A keyboard-first overlay for switching the prototype's runtime state without
 * reaching for the DeviceToolbar dropdowns: store theme, device frame, auth
 * state, and on-page navigation. It drives the SAME reactive composables every
 * existing switcher uses (useTheme / useAuth) plus App-local state passed in
 * as props/emits (device frame, section navigation), so it adds no new
 * source of truth.
 *
 * Mounted in DeviceFrame's #overlay slot. The open state is the useCommandConsole
 * singleton (shared with the `/` listener). Background blur + scrim mirror the
 * NavDrawer pattern; motion uses tokens; type uses .text-style-* classes.
 *
 * Store-agnostic: the command registry is built from composables (themes,
 * sections, config flags), never from a theme-name test, so a new store appears
 * in the palette with zero edits.
 */
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import { useCommandConsole } from '../composables/useCommandConsole.js'
import { useTheme } from '../composables/useTheme.js'
import { useAuth } from '../composables/useAuth.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useFeatureFlags } from '../composables/useFeatureFlags.js'
import { scrollToTop } from '../composables/useScrollReset.js'
import { useScreenshot } from '../composables/useScreenshot.js'
import { useInspector } from '@coda/inspect-kit/vue'
import { useToolbarCollapse } from '../composables/useToolbarCollapse.js'
import { useLibrary } from '../library/useLibrary.js'
import { useTokenAudit } from '../token-audit/useTokenAudit.js'
import { useComments } from '@coda/comment-kit/vue'
import { useTracking } from '@coda/track-kit/vue'
import { useTourGuide } from '@coda/tourguide-kit/vue'

const props = defineProps({
  // Active device frame (App-local) — two-way bound so a Device command flips it.
  device:   { type: String, default: 'iphone' },
  // On-page section tabs ({ id, label }) — drives the Navigation commands.
  sections: { type: Array,  default: () => [] },
})
const emit = defineEmits(['update:device', 'navigate', 'open-drawer'])

const { open, closeConsole } = useCommandConsole()
const { theme, themes, setTheme } = useTheme()
const { signedIn, openSignInSheet, startEaSignIn, signOut } = useAuth()
const config = useStoreConfig()
const { flags, toggleFlag, setFlag, FLAG_DEFS } = useFeatureFlags()
const { capture } = useScreenshot()
const { active: inspecting, toggle: toggleInspector } = useInspector()
const {
  enabled: commentsEnabled, mode: commentMode, listOpen: commentListOpen,
  toggle: toggleComments, toggleList: toggleCommentList,
} = useComments()
const {
  recording: trackingRecording, viewerOpen: trackingViewerOpen,
  toggleViewer: toggleTrackingViewer, openTab: openTrackingTab,
  enableLocally: enableTrackingLocally, disableLocally: disableTrackingLocally,
} = useTracking()
const { collapsed: toolbarCollapsed, toggle: toggleToolbar } = useToolbarCollapse()
const { toggle: toggleLibrary } = useLibrary()
const { open: openTokenAudit } = useTokenAudit()
const { openModal: openTourGuideModal, listFlows, startFlow } = useTourGuide()

const DEVICES = [
  { value: 'iphone',  label: 'iPhone',     keywords: 'apple ios mobile frame' },
  { value: 'samsung', label: 'Android',    keywords: 'samsung galaxy mobile frame' },
  { value: 'none',    label: 'Responsive', keywords: 'desktop web fluid no frame' },
]

// Sign-in routes to the store's primary entry, mirroring NavBar's dispatch:
// EA stores open the EA page; everyone else opens the "sign in to purchase" sheet
// (which then offers the store's actual flows). Keeps the palette store-agnostic.
function runSignIn () {
  if (config.value.signIn?.flow === 'ea-redirect') startEaSignIn()
  else openSignInSheet()
}

// ── Command registry ─────────────────────────────────────────────────────────
// One reactive list of { id, group, label, hint, keywords, run }. Availability
// tracks the active store (current store omitted from the switch list; body-font
// commands appear only where the store ships >1 option; sign-in/out toggles on
// signedIn). `run` mutates via the relevant composable/emit, then the palette closes.
const commands = computed(() => {
  const list = []

  // Store — one per registered theme, excluding the active one.
  for (const t of themes) {
    if (t.value === theme.value) continue
    list.push({
      id: `store:${t.value}`,
      group: 'Store',
      label: `Store: ${t.label}`,
      hint: 'Switch store',
      keywords: `theme reskin ${t.value} ${t.label}`,
      run: () => setTheme(t.value),
    })
  }

  // Device frame — excluding the active one.
  for (const d of DEVICES) {
    if (d.value === props.device) continue
    list.push({
      id: `device:${d.value}`,
      group: 'Device',
      label: `Device: ${d.label}`,
      hint: 'Switch frame',
      keywords: `device frame ${d.keywords}`,
      run: () => emit('update:device', d.value),
    })
  }

  // Auth — sign in / sign out depending on current state.
  if (signedIn.value) {
    list.push({
      id: 'auth:signout', group: 'Auth', label: 'Sign out', hint: 'Reset demo session',
      keywords: 'log out logout account session', run: () => signOut(),
    })
  } else {
    list.push({
      id: 'auth:signin', group: 'Auth', label: 'Sign in', hint: 'Run sign-in flow',
      keywords: 'log in login account session purchase', run: () => runSignIn(),
    })
  }

  // Navigation — open drawer + one per on-page section.
  list.push({
    id: 'nav:drawer', group: 'Navigation', label: 'Open menu drawer', hint: 'Navigation',
    keywords: 'menu drawer burger nav', run: () => emit('open-drawer'),
  })
  list.push({
    id: 'nav:top', group: 'Navigation', label: 'Scroll to top', hint: 'Navigation',
    keywords: 'top scroll up home', run: () => scrollToTop(),
  })
  for (const s of props.sections) {
    list.push({
      id: `nav:${s.id}`,
      group: 'Navigation',
      label: `Go to: ${s.label}`,
      hint: 'Jump to section',
      keywords: `section jump scroll ${s.label}`,
      run: () => emit('navigate', s.id),
    })
  }

  // Feature flags — one control per registered flag. Runtime, persisted, prototype-wide
  // (useFeatureFlags), distinct from the static per-store useStoreConfig capabilities.
  // Boolean flags get a single Enable/Disable toggle; enum flags get one command
  // per non-active option. `stores` (if present) hides a flag's commands outside
  // the listed store(s) — same scoping the toolbar select uses.
  for (const f of FLAG_DEFS) {
    if (f.stores && !f.stores.includes(theme.value)) continue
    if (f.hideWhenLocked && __STORE_LOCKED__) continue
    if (f.requiresCapability && !f.requiresCapability(config.value)) continue
    if (f.options) {
      for (const opt of f.options) {
        if (opt.value === flags[f.key]) continue
        list.push({
          id: `flag:${f.key}:${opt.value}`,
          group: 'Feature flags',
          label: `${f.label}: ${opt.label}`,
          hint: 'Feature flag',
          keywords: `flag feature ${f.key} ${f.label} ${opt.label}`,
          run: () => setFlag(f.key, opt.value),
        })
      }
    } else {
      list.push({
        id: `flag:${f.key}`,
        group: 'Feature flags',
        label: `${flags[f.key] ? 'Disable' : 'Enable'}: ${f.label}`,
        hint: 'Feature flag',
        keywords: `flag toggle feature ${f.key} ${f.label} locale region language switcher`,
        run: () => toggleFlag(f.key),
      })
    }
  }

  // Tools — capture + inspection utilities. Hidden in store-locked builds (prototype-only).
  if (!__STORE_LOCKED__) {
    list.push({
      id: 'tools:toolbar',
      group: 'Tools',
      label: toolbarCollapsed.value ? 'Expand preview toolbar' : 'Collapse preview toolbar',
      hint: 'Device/theme controls',
      keywords: 'toolbar collapse expand hide show device bar chrome',
      run: () => toggleToolbar(),
    })
    list.push({
      id: 'tools:library',
      group: 'Tools',
      label: 'Open component library',
      hint: 'Browse + inspect components',
      keywords: 'library components storybook catalog viewer stage variants states themes',
      run: () => { closeConsole(); toggleLibrary() },
    })
    list.push({
      id: 'tools:tokenusage',
      group: 'Tools',
      label: 'Open token usage dashboard',
      hint: 'Coverage, drift & custom tokens',
      keywords: 'token tokens dashboard audit usage unused dead drift coverage custom design system',
      run: () => { closeConsole(); openTokenAudit() },
    })
    list.push({
      id: 'tools:inspect',
      group: 'Tools',
      label: inspecting.value ? 'Exit inspection mode' : 'Inspect elements',
      hint: 'Tokens, CSS & motion',
      keywords: 'inspect inspector devmode handoff tokens css motion element component figma',
      run: () => { closeConsole(); toggleInspector() },
    })
    list.push({
      id: 'tools:screenshot',
      group: 'Tools',
      label: 'Take screenshot',
      hint: 'Capture current view (.webp)',
      keywords: 'screenshot capture download image export webp photo',
      // Close the palette and let it unmount + paint away before capturing, so
      // the console (and its scrim) never lands in the shot.
      run: async () => {
        closeConsole()
        await nextTick()
        await new Promise(r => requestAnimationFrame(r))
        capture(props.device, theme.value)
      },
    })
  }

  // Comments — collaborator feedback mode. Gated on its own runtime flag, not
  // store-lock (the console is dev-only, but the flag keeps parity with the
  // toolbar toggle + C key that also drive comment mode).
  if (commentsEnabled) {
    list.push({
      id: 'comments:mode',
      group: 'Tools',
      label: commentMode.value ? 'Exit comment mode' : 'Comment mode',
      hint: 'Leave feedback',
      keywords: 'comment annotate feedback review note pin collaborate',
      run: () => { closeConsole(); toggleComments() },
    })
    list.push({
      id: 'comments:list',
      group: 'Tools',
      label: commentListOpen.value ? 'Hide comments list' : 'Show comments list',
      hint: 'All threads for this store',
      keywords: 'comments list threads feedback sidebar review',
      run: () => { closeConsole(); if (!commentMode.value) toggleComments(); toggleCommentList() },
    })
  }

  // Session tracking (@coda/track-kit) — unlike comments, tracking has no
  // opt-in `enabled` gate here: it's off by default on localhost/local dev
  // (see main.js) but the commands always register, so a facilitator can
  // flip it on for THIS device via enableLocally() without the ?testmode=
  // URL param (see track-kit's index.js: it flips the kit's own devOverride
  // localStorage escape hatch, same mechanism comment-kit ships).
  list.push({
    id: 'tracking:viewer',
    group: 'Tools',
    label: trackingViewerOpen.value ? 'Hide session tracker' : 'Show session tracker',
    hint: 'Heatmap, replay & scroll depth',
    keywords: 'track heatmap replay session click rage scroll analytics hotjar',
    run: () => { closeConsole(); toggleTrackingViewer() },
  })
  list.push({
    id: 'tracking:heatmap',
    group: 'Tools',
    label: 'Show click heatmap',
    hint: 'Session tracker → Heatmap',
    keywords: 'heatmap clicks track hotjar',
    run: () => { closeConsole(); openTrackingTab('heatmap') },
  })
  list.push({
    id: 'tracking:scrolldepth',
    group: 'Tools',
    label: 'Show scroll depth',
    hint: 'Session tracker → Scroll Depth',
    keywords: 'scroll depth track funnel',
    run: () => { closeConsole(); openTrackingTab('scrollDepth') },
  })
  list.push({
    id: 'tracking:toggle-recording',
    group: 'Tools',
    label: trackingRecording.value ? 'Pause session tracking' : 'Resume session tracking',
    hint: 'Start/stop recording this session',
    keywords: 'track pause resume recording enable disable',
    run: () => { closeConsole(); trackingRecording.value ? disableTrackingLocally() : enableTrackingLocally() },
  })
  list.push({
    id: 'tourguide:modal',
    group: 'Tour Guide',
    label: 'Tour Guide: Choose Walkthrough...',
    hint: 'Select and play a guided tour',
    keywords: 'tour guide onboarding walkthrough autoplay record webm demo video',
    run: () => { closeConsole(); openTourGuideModal() },
  })

  for (const flow of listFlows()) {
    list.push({
      id: `tourguide:flow:${flow.id}`,
      group: 'Tour Guide',
      label: `Tour Guide: ${flow.title}`,
      hint: `${flow.steps.length} steps`,
      keywords: `tour guide ${flow.id} ${flow.title} ${flow.category} play`,
      run: () => { closeConsole(); startFlow(flow.id, { record: true }) },
    })
  }

  return list
})

// ── Fuzzy filter (dependency-free subsequence match) ──────────────────────────
const query = ref('')

function matches (haystack, needle) {
  if (!needle) return true
  const h = haystack.toLowerCase()
  const n = needle.toLowerCase().trim()
  if (h.includes(n)) return true
  // subsequence: every char of the query appears in order
  let i = 0
  for (const ch of h) {
    if (ch === n[i]) i++
    if (i === n.length) return true
  }
  return false
}

const filtered = computed(() =>
  commands.value.filter(c => matches(`${c.label} ${c.keywords}`, query.value))
)

// Group the filtered results for display, preserving registry order.
const grouped = computed(() => {
  const order = []
  const byGroup = new Map()
  filtered.value.forEach((c, flatIndex) => {
    if (!byGroup.has(c.group)) { byGroup.set(c.group, []); order.push(c.group) }
    byGroup.get(c.group).push({ ...c, flatIndex })
  })
  return order.map(g => ({ group: g, items: byGroup.get(g) }))
})

// ── Keyboard navigation ───────────────────────────────────────────────────────
const highlighted = ref(0)
const inputRef = ref(null)
const listRef = ref(null)

// Reset highlight whenever the result set changes (filter or registry update).
watch(filtered, () => { highlighted.value = 0 })

function move (delta) {
  const n = filtered.value.length
  if (!n) return
  highlighted.value = (highlighted.value + delta + n) % n
  nextTick(scrollHighlightedIntoView)
}

function scrollHighlightedIntoView () {
  const el = listRef.value?.querySelector('[data-active="true"]')
  el?.scrollIntoView({ block: 'nearest' })
}

function runHighlighted () {
  const cmd = filtered.value[highlighted.value]
  if (!cmd) return
  cmd.run()
  closeConsole()
}

function runCommand (cmd) {
  cmd.run()
  closeConsole()
}

function onKeydown (e) {
  if (e.key === 'ArrowDown')      { e.preventDefault(); move(1) }
  else if (e.key === 'ArrowUp')   { e.preventDefault(); move(-1) }
  else if (e.key === 'Enter')     { e.preventDefault(); runHighlighted() }
  else if (e.key === 'Escape')    { e.preventDefault(); closeConsole() }
}

// Reset query + focus the input each time the palette opens.
watch(open, (isOpen) => {
  if (isOpen) {
    query.value = ''
    highlighted.value = 0
    nextTick(() => inputRef.value?.focus())
  }
})

onBeforeUnmount(() => { /* listeners are element-scoped; nothing global to clean */ })
</script>

<template>
  <Transition name="cmd">
    <div
      v-if="open"
      class="cmd"
      role="dialog"
      aria-modal="true"
      aria-label="Command console"
    >
      <!-- Backdrop — blurs + dims the store behind the palette; click to close. -->
      <div class="cmd__scrim" @click="closeConsole()"></div>

      <div class="cmd__panel" @keydown="onKeydown">
        <div class="cmd__search">
          <MaterialIcon name="search" variant="round" :size="20" class="cmd__search-icon" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="cmd__input text-style-paragraph-regular"
            placeholder="Type a command…"
            aria-label="Command search"
            autocomplete="off"
            spellcheck="false"
          />
        </div>

        <div ref="listRef" class="cmd__list" role="listbox">
          <template v-if="filtered.length">
            <div v-for="section in grouped" :key="section.group" class="cmd__group">
              <div class="cmd__group-label text-style-utility-micro-uppercase">
                <span>{{ section.group }}</span>
              </div>
              <button
                v-for="cmd in section.items"
                :key="cmd.id"
                type="button"
                role="option"
                class="cmd__item"
                :class="{ 'cmd__item--active': cmd.flatIndex === highlighted }"
                :data-active="cmd.flatIndex === highlighted"
                :aria-selected="cmd.flatIndex === highlighted"
                @click="runCommand(cmd)"
                @mousemove="highlighted = cmd.flatIndex"
              >
                <span class="cmd__item-label text-style-utility-default-regular">{{ cmd.label }}</span>
                <span v-if="cmd.hint" class="cmd__item-hint text-style-utility-micro-regular">{{ cmd.hint }}</span>
              </button>
            </div>
          </template>
          <div v-else class="cmd__empty text-style-utility-default-regular">
            <span>No commands match “{{ query }}”</span>
          </div>
        </div>

        <div class="cmd__footer text-style-utility-micro-regular">
          <span class="cmd__hint"><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span class="cmd__hint"><kbd>↵</kbd> run</span>
          <span class="cmd__hint"><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cmd {
  position: absolute;
  inset: 0;
  z-index: 6; /* above snackbar (5) — palette floats over everything */
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

/* Backdrop — blurs + dims the store behind the palette (mirrors NavDrawer scrim). */
.cmd__scrim {
  position: absolute;
  inset: 0;
  background: var(--x-scrim);
  backdrop-filter: blur(64px);
  -webkit-backdrop-filter: blur(64px);
  pointer-events: auto;
}

/* Palette panel — centred, near the top so results have room to grow. */
.cmd__panel {
  position: relative;
  margin-top: calc(var(--safe-top, 0px) + var(--x-pad-surface-xl));
  width: min(92%, 420px);
  max-height: 70%;
  display: flex;
  flex-direction: column;
  background: var(--x-bg-sheet);
  border: var(--border-weight-default) solid var(--x-border-sheet, var(--x-border-divider));
  border-radius: var(--x-radius-container-m);
  box-shadow: var(--x-shadow-drawer);
  overflow: hidden;
  pointer-events: auto;
  /* System font — keeps the console clearly "dev chrome", separate from store type.
     Override the sys-tier font-family tokens so .text-style-* classes inside the
     panel resolve to the system stack instead of the active store's typeface. */
  --x-sys-font-family-body:    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --x-sys-font-family-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Search row */
.cmd__search {
  display: flex;
  align-items: center;
  gap: var(--x-gap-control-s);
  padding: var(--x-pad-surface-s) var(--x-pad-surface-m);
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
  flex-shrink: 0;
}
.cmd__search-icon {
  color: var(--x-text-body-subtle);
  flex-shrink: 0;
}
.cmd__input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--x-text-header-default);
  outline: none;
  padding: var(--x-pad-surface-xs) 0;
}
.cmd__input::placeholder { color: var(--x-text-placeholder); }

/* Results list — scrolls; hides scrollbar like the drawer nav. */
.cmd__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--x-pad-surface-xs);
  scrollbar-width: none;
}
.cmd__list::-webkit-scrollbar { display: none; }

.cmd__group { padding-bottom: var(--x-pad-surface-xs); }
.cmd__group-label {
  display: block;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-s) var(--x-pad-surface-xs);
  color: var(--x-text-body-subtle);
}
.cmd__group-label span {
  display: inline-block;
  text-transform: uppercase;
  transform-origin: left center;
}

/* Command row */
.cmd__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--x-gap-content-default);
  width: 100%;
  padding: var(--x-pad-surface-s);
  border: 0;
  border-radius: var(--x-radius-control-s);
  background: transparent;
  color: var(--x-text-body-default);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--x-motion-sku-hover), color var(--x-motion-sku-hover);
}
.cmd__item--active {
  background: var(--x-bg-card-selected, var(--x-bg-card-highlighted));
  color: var(--x-text-header-default);
}
.cmd__item-label {
  display: inline-block;
  transform-origin: left center;
}
.cmd__item-hint {
  display: inline-block;
  color: var(--x-text-body-subtle);
  transform-origin: right center;
  white-space: nowrap;
  flex-shrink: 0;
}

.cmd__empty {
  display: block;
  padding: var(--x-pad-surface-l) var(--x-pad-surface-m);
  color: var(--x-text-body-subtle);
  text-align: center;
}
.cmd__empty span { display: inline-block; transform-origin: center center; }

/* Footer key hints */
.cmd__footer {
  display: flex;
  gap: var(--x-gap-content-default);
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-s);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
  color: var(--x-text-body-subtle);
  flex-shrink: 0;
}
.cmd__hint { display: inline-flex; align-items: center; gap: var(--x-gap-control-xs); }
.cmd__footer kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  padding: 0 var(--x-pad-surface-xxs);
  border: var(--border-weight-default) solid var(--x-border-divider);
  border-radius: var(--x-radius-control-xs);
  background: var(--x-bg-control-default);
  color: var(--x-text-body-default);
  font: inherit;
}

/* ── Open/close motion ─────────────────────────────────────────────────────
   Scrim fades; panel fades + lifts slightly. Enter decelerates, exit
   accelerates. Reduced-motion is collapsed globally. */
.cmd-enter-active .cmd__scrim { transition: opacity var(--x-motion-modal-enter); }
.cmd-leave-active .cmd__scrim { transition: opacity var(--x-motion-modal-exit); }
.cmd-enter-from .cmd__scrim,
.cmd-leave-to   .cmd__scrim { opacity: 0; }

.cmd-enter-active .cmd__panel {
  transition: opacity var(--x-motion-modal-enter), transform var(--x-motion-modal-enter);
}
.cmd-leave-active .cmd__panel {
  transition: opacity var(--x-motion-modal-exit), transform var(--x-motion-modal-exit);
}
.cmd-enter-from .cmd__panel,
.cmd-leave-to   .cmd__panel {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
