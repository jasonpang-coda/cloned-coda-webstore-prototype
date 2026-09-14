<script setup>
/**
 * DeviceToolbar — segmented control to step through device frames plus a store
 * dropdown to switch the active theme. Device is two-way bound via
 * v-model:device; the theme switch is self-contained via useTheme (writes
 * <html data-theme>). The dropdown lists whatever the @active-stores manifest
 * registered, so it hides itself on store-locked builds (single store).
 *
 * A light/dark toggle sits next to the store select — self-contained via
 * useColorScheme (writes <html data-color-scheme>) — but only shown for
 * themes that actually ship a light-mode token block (useColorScheme's
 * SUPPORTED_THEMES), since it would otherwise silently do nothing.
 *
 * Collapse: fixed-position notch tab on the right edge, always visible, opens
 * a non-blocking side drawer (no scrim — the page stays interactive behind
 * it) sliding in from the right. State lives in useToolbarCollapse (singleton,
 * starts collapsed) so the `/` command console can toggle it too. Being a
 * fixed overlay rather than in-flow chrome, it no longer reserves page space
 * or publishes --toolbar-h — every consumer of that var already falls back to
 * 0px/0 (see git history), which is now simply always correct.
 *
 * Outside-click-to-close mirrors AccountPopover's pattern: a pointerdown
 * listener registered a tick after open (so the opening click doesn't
 * immediately close it), skipping clicks on the notch button itself.
 */
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import MaterialIcon from './MaterialIcon.vue'
import { useTheme } from '../composables/useTheme.js'
import { useColorScheme, SUPPORTED_THEMES as COLOR_SCHEME_THEMES } from '../composables/useColorScheme.js'
import { useScreenshot } from '../composables/useScreenshot.js'
import { useInspector } from '@coda/inspect-kit/vue'
import { useComments } from '@coda/comment-kit/vue'
import { useTracking } from '@coda/track-kit/vue'
import { useDeviceDetect } from '../composables/useDeviceDetect.js'
import { useOrientation } from '../composables/useOrientation.js'
import { useToolbarCollapse } from '../composables/useToolbarCollapse.js'
import { useFeatureFlags } from '../composables/useFeatureFlags.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useLibrary } from '../library/useLibrary.js'
import { useOrderComplete } from '../composables/useOrderComplete.js'
import { useTransactionHistory } from '../composables/useTransactionHistory.js'
import { useCodashopHome } from '../composables/useCodashopHome.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useHandoff } from '../handoff/useHandoff.js'
import { useTokenAudit } from '../token-audit/useTokenAudit.js'
import { useTaskGiftClaim } from '../composables/useTaskGiftClaim.js'
import { useTourGuide } from '@coda/tourguide-kit/vue'
import { version } from '../../package.json'

defineProps({
  device: { type: String, required: true },
})
const emit = defineEmits(['update:device'])

const options = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'samsung', label: 'Android' },
  { value: 'none', label: 'Responsive' },
]

const { theme, themes, setTheme } = useTheme()
const { colorScheme, toggleColorScheme } = useColorScheme()
const showColorSchemeToggle = computed(() => COLOR_SCHEME_THEMES.has(theme.value))
const { capturing, capture } = useScreenshot()
const { active: inspecting, toggle: toggleInspector } = useInspector()
// Comment mode lives OUTSIDE the !isStoreLocked segment: it's a non-dev entry
// point on locked per-store review builds, unlike the `/` console (dev-chrome,
// reached by keyboard shortcut rather than a visible toolbar button there).
const { enabled: commentsEnabled, mode: commentMode, toggle: toggleComments } = useComments()
// Unlike comments, tracking has no opt-in enable flag here — whether it's
// actually RECORDING is a separate concern (off by default on localhost/dev,
// see main.js). The toolbar button itself is hidden on store-locked builds
// (dev-only affordance); it's still reachable there via the `/` command
// console's "Show session tracker" command.
const { viewerOpen: trackingViewerOpen, toggleViewer: toggleTrackingViewer } = useTracking()
const { active: libraryOpen, toggle: toggleLibrary } = useLibrary()
const { active: handoffOpen, open: openHandoff, close: closeHandoff } = useHandoff()
function toggleHandoff () { handoffOpen.value ? closeHandoff() : openHandoff() }
const { active: tokenAuditOpen, open: openTokenAudit, close: closeTokenAudit } = useTokenAudit()
function toggleTokenAudit () { tokenAuditOpen.value ? closeTokenAudit() : openTokenAudit() }
const { openModal: openTourGuideModal, state: tourGuideState } = useTourGuide()
const { orderCompleteOpen } = useOrderComplete()
const { historyOpen } = useTransactionHistory()
const { homeView } = useCodashopHome()
const router = useRouter()
const strings = useStoreStrings()
const { isMobile } = useDeviceDetect()
const { orientation, toggle: toggleOrientation } = useOrientation()
const { collapsed, set: setCollapsed, toggle } = useToolbarCollapse()
const { flags, setFlag, FLAG_DEFS } = useFeatureFlags()
// PWA (task-gated) gift claim reset — dev-only, mirrors the debug unclaim
// button in GiftSkuCard.vue/TaskGiftSheet.vue but reachable without opening
// either surface. Lives in the Variants section as a plain button (disabled
// until there's actually something to reset) rather than gated behind the
// allowGiftUnclaim flag — this one's meant to always be reachable.
const { claimed: taskGiftClaimed, unclaim: unclaimTaskGift } = useTaskGiftClaim()
const config = useStoreConfig()
// Compile-time flag injected by vite.config.js — true in store-locked builds.
const isStoreLocked = __STORE_LOCKED__

// "Pages" dropdown — lets a tester jump directly between the pages the
// active store actually has, instead of the single "Preview Order Complete
// page" button this replaced. Store-capability-driven (config.home /
// strings.page.orderComplete / strings.transactionHistory), never a
// hardcoded theme-name check, so it generalises to any future store that
// ships any of these shapes. Order Complete and Transaction History are
// each independently optional (COD:M ships both, FCM ships only Transaction
// History, most stores ship neither) — built additively rather than as a
// fixed-shape branch. Empty for a store with only one page (nothing to
// switch between) — segment hides itself.
const pageOptions = computed(() => {
  if (config.value.home) {
    return [
      { value: 'home',    label: 'Homepage' },
      { value: 'product', label: 'Product Page' },
    ]
  }
  const hasOrderComplete = !!strings.value.page?.orderComplete
  const hasHistory = !!strings.value.transactionHistory
  if (!hasOrderComplete && !hasHistory) return []
  const opts = [{ value: 'storefront', label: 'Product Page' }]
  if (hasOrderComplete) opts.push({ value: 'order-complete', label: 'Order Complete' })
  if (hasHistory) opts.push({ value: 'transaction-history', label: 'Transaction History' })
  return opts
})
const currentPage = computed(() => {
  if (config.value.home) return homeView.value ? 'home' : 'product'
  if (historyOpen.value) return 'transaction-history'
  return orderCompleteOpen.value ? 'order-complete' : 'storefront'
})
// Pushes a route rather than flipping a composable ref directly — App.vue's
// route→page-state watcher is what actually opens/closes each page, so this
// jump also lands a real history entry (browser back walks back out of it).
function setPage(value) {
  if (config.value.home) {
    router.push(value === 'home' ? '/' : '/product')
    return
  }
  if (value === 'transaction-history') router.push('/history')
  else if (value === 'order-complete') router.push('/order-complete')
  else router.push('/')
}

// Enum feature flags (options-bearing FLAG_DEFS entries) get their own toolbar
// select, mirroring the store dropdown. `stores` (if present on the def) scopes
// the control to the active theme — dev-chrome scoping is store-name-tested
// directly here (unlike component code), same precedent as the removed COD:M
// body-font toggle this control replaces. `requiresCapability` (if present)
// additionally hides a control whose effect is itself gated off via config.
const enumFlagDefs = computed(() =>
  FLAG_DEFS.filter(f =>
    f.options
    && (!f.stores || f.stores.includes(theme.value))
    && !(f.hideWhenLocked && isStoreLocked)
    && (!f.requiresCapability || f.requiresCapability(config.value)),
  ),
)

// Auto-collapse when the site becomes mobile (rotation / device emulation) —
// re-collapse an open drawer if the tester switches into a phone-frame
// preview mid-session.
watch(isMobile, (v) => { if (v) setCollapsed(true) })

// Auto-collapse when entering inspect mode — the drawer (320px, right-anchored)
// covers a chunk of the Responsive frame, blocking the very elements a tester
// wants to click on to inspect. Only fires on the on-transition (not every
// selection change): useInspector's `active` toggles once for the whole
// session, `selected` changes per pick.
watch(inspecting, (on) => { if (on) setCollapsed(true) })

// Outside-tap + Escape close the drawer, mirroring AccountPopover.vue. The
// notch button is excluded via data-toolbar-toggle so the click that opens
// the drawer doesn't also register as an outside tap that immediately
// closes it again.
const panelRef = ref(null)
function onKey(e) {
  if (e.key === 'Escape') setCollapsed(true)
}
function onPointerDown(e) {
  if (e.target.closest('[data-toolbar-toggle]')) return
  if (panelRef.value && !panelRef.value.contains(e.target)) setCollapsed(true)
}
watch(collapsed, (isCollapsed) => {
  if (!isCollapsed) {
    window.addEventListener('keydown', onKey)
    nextTick(() => document.addEventListener('pointerdown', onPointerDown))
  } else {
    window.removeEventListener('keydown', onKey)
    document.removeEventListener('pointerdown', onPointerDown)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <div class="toolbar">
    <!-- Notch is a child of the panel (not a separate fixed element) so it
         physically rides along with the drawer's slide transform — a tab
         attached to the edge of a folder, not an independent floating button. -->
    <div id="toolbar-panel" ref="panelRef" class="toolbar__panel" :class="{ 'toolbar__panel--collapsed': collapsed }" role="dialog" aria-label="Preview tools">
      <button
        type="button"
        data-toolbar-toggle
        class="toolbar__notch"
        :aria-expanded="!collapsed"
        aria-controls="toolbar-content"
        :aria-label="collapsed ? 'Expand preview tools' : 'Collapse preview tools'"
        :title="collapsed ? 'Expand preview tools' : 'Collapse preview tools'"
        @click="toggle()"
      >
        <MaterialIcon name="chevron_left" variant="round" :size="24" class="toolbar__chevron" :class="{ 'toolbar__chevron--open': !collapsed }" />
      </button>

      <!-- inert (not the notch button) when collapsed — the panel itself stays
           in the DOM, fully translated off-viewport, so its controls must not
           be reachable by keyboard/AT while hidden. -->
      <div id="toolbar-content" class="toolbar__content" :inert="collapsed">
      <div class="toolbar__body-inner">
    <div v-if="!isMobile" class="toolbar__segment" role="tablist" aria-label="Device frame">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        role="tab"
        :aria-selected="device === opt.value"
        class="toolbar__btn"
        :class="{ 'toolbar__btn--active': device === opt.value }"
        @click="emit('update:device', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Orientation only makes sense for a framed device (iPhone/Android) —
         Responsive has no physical frame to rotate, so this hides itself
         there rather than doing nothing. -->
    <div v-if="!isMobile && device !== 'none'" class="toolbar__segment">
      <button
        type="button"
        class="toolbar__btn toolbar__btn--icon"
        :aria-label="orientation === 'portrait' ? 'Rotate to landscape' : 'Rotate to portrait'"
        :title="orientation === 'portrait' ? 'Rotate to landscape' : 'Rotate to portrait'"
        :aria-pressed="orientation === 'landscape'"
        @click="toggleOrientation()"
      >
        <MaterialIcon name="screen_rotation_alt" variant="round" :size="18" />
      </button>
    </div>

    <div v-if="!isStoreLocked && !isMobile" class="toolbar__segment toolbar__segment--stack">
      <span class="toolbar__eyebrow">Tools</span>
      <div class="toolbar__row">
        <button
          type="button"
          class="toolbar__btn toolbar__btn--icon"
          :class="{ 'toolbar__btn--active': libraryOpen }"
          aria-label="Component library"
          title="Component library"
          :aria-pressed="libraryOpen"
          @click="toggleLibrary()"
        >
          <MaterialIcon name="view_module" variant="round" :size="18" />
        </button>
        <button
          type="button"
          class="toolbar__btn toolbar__btn--icon"
          :class="{ 'toolbar__btn--active': handoffOpen }"
          aria-label="Handoff"
          title="Handoff (live tokens, states, choreography)"
          :aria-pressed="handoffOpen"
          @click="toggleHandoff()"
        >
          <MaterialIcon name="directions_boat" variant="round" :size="18" />
        </button>
        <button
          type="button"
          class="toolbar__btn toolbar__btn--icon"
          :class="{ 'toolbar__btn--active': inspecting }"
          aria-label="Inspect elements"
          title="Inspect elements (tokens, CSS, motion)"
          :aria-pressed="inspecting"
          @click="toggleInspector()"
        >
          <MaterialIcon name="highlight_alt" variant="round" :size="18" />
        </button>
        <button
          type="button"
          class="toolbar__btn toolbar__btn--icon"
          aria-label="Take screenshot"
          title="Take screenshot"
          :disabled="capturing"
          @click="capture(device, theme)"
        >
          <MaterialIcon name="photo_camera" variant="round" :size="18" />
        </button>
        <button
          type="button"
          class="toolbar__btn toolbar__btn--icon"
          :class="{ 'toolbar__btn--active': tourGuideState !== 'idle' }"
          aria-label="Tour Guide walkthroughs"
          title="Tour Guide walkthroughs & video recording"
          @click="openTourGuideModal()"
        >
          <MaterialIcon name="tour" variant="round" :size="18" />
        </button>
        <button
          type="button"
          class="toolbar__btn toolbar__btn--icon"
          :class="{ 'toolbar__btn--active': trackingViewerOpen }"
          aria-label="Session tracker"
          title="Session tracker — heatmap, replay & scroll depth"
          :aria-pressed="trackingViewerOpen"
          @click="toggleTrackingViewer()"
        >
          <MaterialIcon name="query_stats" variant="round" :size="18" />
        </button>
        <button
          type="button"
          class="toolbar__btn toolbar__btn--icon"
          :class="{ 'toolbar__btn--active': tokenAuditOpen }"
          aria-label="Token usage dashboard"
          title="Token usage — coverage, drift & per-store overrides"
          :aria-pressed="tokenAuditOpen"
          @click="toggleTokenAudit()"
        >
          <MaterialIcon name="contextual_token" variant="round" :size="18" />
        </button>
      </div>
    </div>

    <div v-if="commentsEnabled" class="toolbar__segment">
      <button
        type="button"
        class="toolbar__btn toolbar__btn--icon"
        :class="{ 'toolbar__btn--active': commentMode }"
        aria-label="Comment mode"
        title="Comment mode (C) — leave feedback on the prototype"
        :aria-pressed="commentMode"
        @click="toggleComments()"
      >
        <MaterialIcon name="mode_comment" variant="round" :size="18" />
      </button>
    </div>

    <!-- Options, in the requested order: Stores → Light/Dark → Pages →
         Variants. Every dropdown segment below follows the storefront's own
         eyebrow convention (e.g. HeroSkuCard's `.hero-sku__eyebrow` — a small
         caption above the thing it labels), stacked full-width rather than a
         label beside a content-width control. -->
    <div v-if="themes.length > 1" class="toolbar__segment toolbar__segment--stack">
      <span class="toolbar__eyebrow">Stores</span>
      <select
        class="toolbar__select toolbar__select--full"
        aria-label="Store theme"
        :value="theme"
        @change="setTheme($event.target.value)"
      >
        <option v-for="opt in themes" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div v-if="showColorSchemeToggle" class="toolbar__segment">
      <button
        type="button"
        class="toolbar__btn toolbar__btn--icon"
        :aria-label="colorScheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        :title="colorScheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        :aria-pressed="colorScheme === 'light'"
        @click="toggleColorScheme()"
      >
        <MaterialIcon :name="colorScheme === 'light' ? 'light_mode' : 'dark_mode'" variant="round" :size="18" />
      </button>
    </div>

    <!-- "Pages" — dev/demo jump between the pages the active store actually
         has (Codashop: Homepage/Product Page; COD:M: Product Page/Order
         Complete/Transaction History; FCM: Product Page/Transaction History
         — value stays 'storefront' internally, only the label reads
         "Product Page" for terminology consistency with Codashop),
         replacing the single-purpose "Preview Order Complete page" button
         this segment used to be. NOT gated on isStoreLocked (unlike
         InspectorLayer/LibraryViewer/etc.) — this navigates real product
         surfaces the locked build actually ships, not an internal dev tool,
         so QA on a locked single-store build (e.g. build:codm) still needs
         it; pageOptions itself already empties out for a store with nothing
         to switch between. -->
    <div v-if="pageOptions.length" class="toolbar__segment toolbar__segment--stack">
      <span class="toolbar__eyebrow">Pages</span>
      <select
        class="toolbar__select toolbar__select--full"
        aria-label="Page"
        :value="currentPage"
        @change="setPage($event.target.value)"
      >
        <option v-for="opt in pageOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Variants — every per-store enum feature flag (SKU card material,
         Codashop homepage layout, milestone scenario, …) folded into one
         section instead of one bare `<select>` per segment. Each keeps its
         own sub-label (def.label) above its own full-width select. -->
    <div v-if="enumFlagDefs.length || strings.page.giftTask" class="toolbar__segment toolbar__segment--stack">
      <span class="toolbar__eyebrow">Variants</span>
      <div v-for="def in enumFlagDefs" :key="def.key" class="toolbar__field">
        <span class="toolbar__field-label">{{ def.label }}</span>
        <select
          class="toolbar__select toolbar__select--full"
          :aria-label="def.label"
          :title="def.description"
          :value="flags[def.key]"
          @change="setFlag(def.key, $event.target.value)"
        >
          <option v-for="opt in def.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div v-if="strings.page.giftTask" class="toolbar__field">
        <span class="toolbar__field-label">PWA gift claim</span>
        <button
          type="button"
          class="toolbar__btn toolbar__btn--full"
          :disabled="!taskGiftClaimed"
          aria-label="Reset PWA gift claim"
          title="Reset PWA gift claim"
          data-poi="toolbar-pwa-gift-reset"
          @click="unclaimTaskGift()"
        >
          Reset claim
        </button>
      </div>
    </div>

        </div>
        <span class="toolbar__version" aria-hidden="true">v{{ version }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  /* No layout footprint — the notch and panel are both fixed overlays, so
     this root contributes nothing to page flow (unlike the old sticky bar). */
  display: contents;
}

/* Side drawer — fixed, right-aligned, full height, non-blocking (no scrim;
   the page stays interactive behind it). Always mounted — collapse is a
   transform, not a v-if — so the notch tab (a child, positioned to poke out
   past the panel's own left edge) rides along with the slide instead of
   sitting as an independent floating button: a tab attached to a folder,
   moving with the folder as it opens/closes. overflow stays visible here
   (not on .toolbar__panel) specifically so that protruding notch isn't
   clipped; scrolling happens one level down, on .toolbar__body-inner. */
.toolbar__panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  width: 320px;
  max-width: 87.5vw;
  display: flex;
  flex-direction: column;
  /* Same electric-blue identity as .toolbar__notch, tinted into the base
     dark toolbar background (not a flat wash of the notch's own alpha)
     so body text stays legible against it. */
  background: color-mix(in oklab, oklch(0.62 0.24 262) 18%, var(--x-toolbar-bg));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--x-shadow-drawer);
  transform: translateX(0);
  transition: transform var(--x-motion-modal-enter);
}

.toolbar__panel--collapsed {
  transform: translateX(100%);
  transition: transform var(--x-motion-modal-exit);
}

/* Tab protruding from the panel's own left edge — visible whether the panel
   sits on-screen (open) or translated fully past the right edge (collapsed),
   since it's offset outside the panel's own transformed box either way. */
/* Sized up + coloured electric blue (vs. the old low-contrast dark-on-dark
   tab) specifically so it reads as a findable affordance at a glance — the
   previous 22×44px version was too easy to miss entirely. */
.toolbar__notch {
  position: absolute;
  top: 50%;
  left: -40px;
  transform: translateY(-50%);
  appearance: none;
  border: 0;
  border-top-left-radius: var(--x-radius-container-s);
  border-bottom-left-radius: var(--x-radius-container-s);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 72px;
  padding: 0;
  background: oklch(0.62 0.24 262 / 0.35);
  border: 2px solid oklch(0.62 0.24 262 / 0.9);
  border-right: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: oklch(0.97 0.02 262);
  transition: background-color var(--x-motion-sku-hover), color var(--x-motion-sku-hover);
}

.toolbar__notch:hover {
  background: oklch(0.62 0.24 262 / 0.55);
  color: #fff;
}

/* chevron_left points left by default ("tap to open the drawer to my left");
   flip to point right once the drawer is open ("tap to close it"). */
.toolbar__chevron {
  transform: rotate(0deg);
  transition: transform var(--x-motion-toggle);
}

.toolbar__chevron--open {
  transform: rotate(180deg);
}

/* Holds the scrollable controls + the pinned version footer; inert while
   collapsed so its (off-viewport) controls can't be tabbed/read into focus. */
.toolbar__content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.toolbar__body-inner {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--x-pad-surface-m);
}

.toolbar__segment {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 3px;
  background: var(--x-surface-ghost);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-md);
}

/* Dropdown segments (Pages, Stores, Variants) stack the eyebrow above a
   full-width control instead of sitting beside a content-width one — the
   storefront's own eyebrow-over-control convention (e.g. HeroSkuCard's
   `.hero-sku__eyebrow` above its title), applied to dev chrome. Also used by
   the Tools segment, whose eyebrow sits above a wrapping row of icon buttons
   (.toolbar__row) rather than a single full-width control. */
.toolbar__segment--stack {
  flex-direction: column;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 6px;
  padding: 8px 10px 10px;
}

/* Horizontal wrapping row of controls under a .toolbar__segment--stack
   eyebrow (e.g. Tools' icon buttons) — mirrors the base .toolbar__segment's
   own row layout, since the outer stack div already supplies the box. */
.toolbar__row {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.toolbar__btn {
  appearance: none;
  border: 0;
  cursor: pointer;
  padding: 7px 16px;
  border-radius: var(--x-radius-control);
  background: transparent;
  color: var(--x-toolbar-text-idle);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.105px;
  white-space: nowrap;
  transition:
    background-color var(--x-motion-sku-hover),
    color var(--x-motion-sku-hover);
}

.toolbar__btn:hover {
  color: var(--x-text-header-default);
}

.toolbar__btn--active {
  background: var(--x-surface-ghost-4);
  color: var(--x-text-header-default);
}

/* Icon-only button (screenshot) — square padding, centred glyph. */
.toolbar__btn--icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 10px;
}

.toolbar__btn--icon:disabled {
  opacity: 0.5;
  cursor: progress;
}

/* Full-width action button inside a stacked segment (e.g. Variants' gift
   claim reset) — same footprint as .toolbar__select--full, background always
   on (not just on hover/active) so it reads as a distinct control. */
.toolbar__btn--full {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  background: var(--x-surface-ghost-4);
  color: var(--x-text-header-default);
}

.toolbar__btn--full:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Section eyebrow (e.g. "Pages", "Stores", "Variants") — sits above the
   full-width control(s) it labels, non-interactive. */
.toolbar__eyebrow {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--x-toolbar-text-idle);
  opacity: 0.7;
  white-space: nowrap;
  user-select: none;
}

/* One labelled control folded inside a multi-control section (Variants) —
   its own smaller sub-label above its own full-width select, several of
   these stacking under one shared .toolbar__eyebrow. */
.toolbar__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.toolbar__field + .toolbar__field {
  margin-top: 4px;
}
.toolbar__field-label {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: var(--x-toolbar-text-idle);
  opacity: 0.55;
  white-space: nowrap;
  user-select: none;
}

/* Store dropdown — mirrors the segmented buttons' active state so the toolbar
   reads as one family of controls. Native popup keeps it dependency-free and
   scales to any number of stores. */
.toolbar__select {
  appearance: none;
  -webkit-appearance: none;
  border: 0;
  cursor: pointer;
  padding: 7px 32px 7px 16px;
  border-radius: var(--x-radius-control);
  background: var(--x-surface-ghost-4);
  color: var(--x-text-header-default);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.105px;
  white-space: nowrap;
  /* chevron — mask idiom (currentColor-independent dev chrome) */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px 6px;
  transition: color var(--x-motion-sku-hover);
}

.toolbar__select:hover {
  color: var(--x-text-header-default);
}

/* Pages / Stores / Variants selects — full width of their stacked segment,
   instead of shrinking to their own option text (the "follow stores'
   layout" ask: an eyebrow label followed by a full-width control). */
.toolbar__select--full {
  width: 100%;
}

.toolbar__select option {
  color: initial;
}

.toolbar__version {
  flex-shrink: 0;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-m);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.2px;
  color: var(--x-toolbar-text-idle);
  opacity: 0.55;
  pointer-events: none;
  user-select: none;
}

</style>
