<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import Button from './Button.vue'
import FlagTile from './FlagTile.vue'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useLocale } from '../composables/useLocale.js'
import { useFeatureFlags } from '../composables/useFeatureFlags.js'
import { useWebPush } from '../composables/useWebPush.js'
import { useTaskGiftClaim } from '../composables/useTaskGiftClaim.js'
import ToggleSwitch from './ToggleSwitch.vue'
import { cssTimeToMs } from '../composables/useCssTimeMs.js'

/**
 * NavDrawer — left slide-in menu opened from the navbar burger (Figma 5031:14225).
 * Mounted into DeviceFrame's #overlay slot so it covers the device screen.
 *
 * Layout: header (MENU + close) / scrolling nav. The nav area flexes and scrolls.
 * (Sign in / sign out now live in the navbar sheet + account popover, not here.)
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  /** Multi-level nav pilot only — [{ id, label, categories }] (useStoreIntents).
   *  Non-null/non-empty drives the drawer's groups (one group per intent,
   *  children = that intent's categories) instead of strings.nav.groups, so the
   *  drawer mirrors L1. null (the default) is byte-for-byte the legacy behaviour. */
  intents: { type: Array, default: null },
})
const emit = defineEmits(['close', 'navigate'])

// Nav structure is store-specific: groups + flat items come from useStoreStrings.
// COD:M: Store (Gifts, CP) + Code Redemption.
// FCM:   flat — Daily Supplies / Limited Offers / Top Ups (no expandable group).
const strings = useStoreStrings()
const groups  = computed(() => {
  if (props.intents?.length) {
    return props.intents.map(intent => ({
      label: intent.label,
      children: (intent.categories ?? []).map(cat => ({
        label: cat.label,
        anchor: cat.id,
        // A category with only one "subcategory" (gifts, best-sellers) has
        // nothing to disambiguate — same gate CatalogNavStack's L3 row uses
        // (subcategoryTabs.length > 1) — so it renders no L3 tier here either.
        subcategories: (cat.subcategories?.length ?? 0) > 1
          ? cat.subcategories.map(sub => ({ label: sub.navLabel ?? sub.label, anchor: sub.id }))
          : [],
      })),
    }))
  }
  return strings.value.nav.groups
})
const items   = computed(() => strings.value.nav.items)

// Region/language switcher — footer row pinned to the drawer bottom. The
// selectors open in the overlay layer ABOVE the drawer (z-index 4 vs 1), so
// the drawer stays open behind them, like checkout over the page.
const { common, currentMarket, currentMarketName, currentLanguage, openRegionSelector, openLanguageSelector } = useLocale()

// Feature-flag gate for the region/language switcher footer (see useFeatureFlags).
const { isEnabled } = useFeatureFlags()

// Notification row — pinned footer, above the locale switcher (see the
// component-level comment near the template). Persistently visible (no more
// install-CTA/push-toggle two-step): switching it on always routes through
// TaskGiftSheet (openTaskGiftSheet — its own globalThis-pinned singleton
// state, already mounted once in App.vue), whose `variant` branches the real
// requirement per platform (iOS needs install first, Android doesn't,
// in-app WebViews need to leave to a real browser first). Switching off
// needs no detour — just disables the subscription directly.
const { subscribed: webPushSubscribed, justEnabled: webPushJustEnabled, disable: disableWebPush } = useWebPush()
const { openSheet: openTaskGiftSheet } = useTaskGiftClaim()
function onWebPushToggle(next) {
  if (next) openTaskGiftSheet()
  else disableWebPush()
}

// Default to the first group's label, or null when no groups exist (flat nav).
const openGroup = ref(groups.value[0]?.label ?? null)
function toggle(label) {
  openGroup.value = openGroup.value === label ? null : label
}

function onItemClick(anchor) {
  emit('close')
  if (!anchor) return

  const reduced = typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    emit('navigate', anchor)
    return
  }

  // Wait for the drawer exit before navigating — one thing at a time (staging).
  // Delay is read from the CSS token so it stays in sync with --x-motion-modal-exit.
  const ms = cssTimeToMs(
    getComputedStyle(document.documentElement).getPropertyValue('--x-motion-sys-duration-exit'),
    200,
  )
  setTimeout(() => emit('navigate', anchor), ms)
}

// Close on Escape while open.
function onKey(e) {
  if (e.key === 'Escape') emit('close')
}
watch(
  () => props.open,
  (o) => {
    if (o) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  }
)
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <!-- duration prop is required: Vue measures leave-duration from the root element
       (.nav-drawer itself has no transition); without it Vue removes the element
       at 0ms, preventing the panel/scrim children from playing their exit. -->
  <Transition name="drawer" :duration="{ enter: 350, leave: 200 }">
    <div v-if="open" class="nav-drawer" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="nav-drawer__scrim" @click="emit('close')"></div>

      <aside class="nav-drawer__panel">
        <div class="nav-drawer__header">
          <span class="nav-drawer__title text-style-utility-default-bold">{{ common.nav.drawerTitle }}</span>
          <Button variant="icon" size="medium" icon="close" aria-label="Close menu" data-poi="drawer-close-btn" class="nav-drawer__close" @click="emit('close')" />
        </div>

        <nav class="nav-drawer__nav">
          <!-- Expandable group (STORE → Gifts, CP) -->
          <div
            v-for="g in groups"
            :key="g.label"
            class="nav-drawer__group"
            :class="{ 'is-open': openGroup === g.label }"
          >
            <button
              v-ripple
              v-haptic
              class="nav-drawer__l1"
              type="button"
              :aria-expanded="openGroup === g.label"
              @click="toggle(g.label)"
            >
              <span class="nav-drawer__label text-style-heading-card">{{ g.label }}</span>
              <MaterialIcon
                :name="openGroup === g.label ? 'expand_less' : 'expand_more'"
                variant="round"
                :size="24"
              />
            </button>
            <div class="nav-drawer__sub">
              <ul class="nav-drawer__sub-inner">
                <li v-for="c in g.children" :key="c.label">
                  <button v-ripple v-haptic class="nav-drawer__l2" type="button" @click="onItemClick(c.anchor)">
                    <span class="nav-drawer__label text-style-heading-banner">{{ c.label }}</span>
                  </button>
                  <!-- L3 (subcategories) — only when the category has more than
                       one; mirrors CatalogNavStack's own L3-row gate. -->
                  <ul v-if="c.subcategories?.length" class="nav-drawer__l3-list">
                    <li v-for="s in c.subcategories" :key="s.anchor">
                      <button v-ripple v-haptic class="nav-drawer__l3" type="button" @click="onItemClick(s.anchor)">
                        <span class="nav-drawer__label text-style-utility-label-regular">{{ s.label }}</span>
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          <!-- Flat L1 items (CODE REDEMPTION) -->
          <button
            v-for="item in items"
            :key="item.label"
            v-ripple
            v-haptic
            class="nav-drawer__l1 nav-drawer__l1--flat"
            type="button"
            @click="onItemClick(item.anchor)"
          >
            <span class="nav-drawer__label text-style-heading-card">{{ item.label }}</span>
          </button>
        </nav>

        <!-- Notification toggle — pinned footer row, above the locale
             switcher (a more actionable item first, utility toggles below
             it). Persistently visible, no install-CTA/push-toggle two-step:
             switching on always opens TaskGiftSheet, whose own `variant`
             branches what's actually needed per platform (see
             onWebPushToggle above) — doesn't close the drawer first,
             TaskGiftSheet is a z-index-4 BaseSheet, same layering precedent
             as the locale selectors below (see the comment above
             useLocale()). Content-gated on strings.page.webPush, same
             convention as the download-banner/Gifts-banner CTAs — no other
             store defines that key today, so this is inert everywhere but
             COD:M. -->
        <div v-if="strings.page.webPush" class="nav-drawer__pwa-row nav-drawer__webpush-row" data-poi="webpush-drawer-row">
          <div class="nav-drawer__webpush-glow" :class="{ 'nav-drawer__webpush-glow--active': webPushJustEnabled }" aria-hidden="true" />
          <MaterialIcon name="notifications" variant="round" :size="18" />
          <span class="text-style-utility-default-uppercase nav-drawer__webpush-label">{{ strings.page.webPush.drawerLabel }}</span>
          <ToggleSwitch
            :model-value="webPushSubscribed"
            :aria-label="strings.page.webPush.drawerAriaLabel"
            @update:model-value="onWebPushToggle($event)"
          />
        </div>

        <!-- Region & language switcher — pinned footer (Figma 4014:4698).
             Gated by the localeSwitcher feature flag. -->
        <div v-if="isEnabled('localeSwitcher')" class="nav-drawer__locale">
          <button
            v-ripple
            v-haptic
            type="button"
            class="nav-drawer__locale-btn"
            :aria-label="`Region: ${currentMarketName}`"
            @click="openRegionSelector()"
          >
            <FlagTile :code="currentMarket.code" :width="20" />
            <span class="nav-drawer__locale-label text-style-utility-label-regular" dir="auto">{{ currentMarketName }}</span>
          </button>
          <span class="nav-drawer__locale-divider" aria-hidden="true"></span>
          <button
            v-ripple
            v-haptic
            type="button"
            class="nav-drawer__locale-btn"
            :aria-label="`Language: ${currentLanguage.endonym}`"
            @click="openLanguageSelector()"
          >
            <MaterialIcon name="language" variant="round" :size="16" />
            <span class="nav-drawer__locale-label text-style-utility-label-regular" dir="auto">{{ currentLanguage.endonym }}</span>
          </button>
        </div>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.nav-drawer {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* Scrim — dims the screen behind the panel, closes on click. */
.nav-drawer__scrim {
  position: absolute;
  inset: 0;
  background: var(--x-scrim);
  backdrop-filter: blur(64px);
  -webkit-backdrop-filter: blur(64px);
  pointer-events: auto;
}

/* Panel — left edge, slides in. Flex column: header + scrolling nav.
   Padding 12px (--x-pad-surface-m) matches the Figma drawer. */
.nav-drawer__panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 87.5%; /* 7 of 8 grid columns on XS */
  max-width: 360px;
  display: flex;
  flex-direction: column;
  background: var(--x-bg-page);
  border-right: var(--border-weight-default) solid var(--x-border-divider);
  box-shadow: var(--x-shadow-drawer);
  pointer-events: auto;
  padding: calc(var(--safe-top, 0px) + var(--x-pad-surface-m)) var(--x-pad-surface-m) var(--x-pad-surface-m);
}

/* Header: "MENU" (h7 14px) + close */
.nav-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--x-pad-surface-s);
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
  flex-shrink: 0;
}
.nav-drawer__title {
  text-transform: uppercase;
  color: var(--x-text-header-default);
  transform-origin: left center;
}

/* Nav — flexes to fill and scrolls. */
.nav-drawer__nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* Own containing block (like .device__screen) so comment-mode pins Teleported
     in here can be position:absolute and scroll natively with this box. */
  position: relative;
  display: flex;
  flex-direction: column;
  scrollbar-width: none;
}
.nav-drawer__nav::-webkit-scrollbar { display: none; }

/* Expandable group — divider beneath (matches the line under STORE) */
.nav-drawer__group {
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
  padding: var(--x-pad-surface-m) 0;
}

/* L1 rows (STORE, CODE REDEMPTION) — h5 18px bold, uppercase */
.nav-drawer__l1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: var(--x-gap-content-default);
  padding: 0;
  border: 0;
  border-radius: var(--x-radius-container-xs);
  background: transparent;
  color: var(--x-text-header-default);
  text-align: left;
  cursor: pointer;
}

/* Flat L1 (CODE REDEMPTION) — own row, top padding, no divider */
.nav-drawer__l1--flat {
  padding: var(--x-pad-surface-m) 0;
}

/* L2 sub-rows (Gifts, CP) — h6 16px bold, indented 8px, uppercase */
.nav-drawer__l2 {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--x-pad-surface-s) 0 0 var(--x-pad-surface-s);
  border: 0;
  border-radius: var(--x-radius-container-xs);
  background: transparent;
  color: var(--x-text-header-default);
  text-align: left;
  cursor: pointer;
}

/* L3 (subcategories) — reset list, indented one step further than L2 and a
   lighter/smaller label so it visibly reads as L2's child. Bigger top gap
   than the other rows' rhythm (--x-pad-surface-s, not -xs) — a clearer break
   between a category and its own subcategory list. */
.nav-drawer__l3-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.nav-drawer__l3 {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--x-pad-surface-s) 0 0 calc(var(--x-pad-surface-s) * 2);
  border: 0;
  border-radius: var(--x-radius-container-xs);
  background: transparent;
  color: var(--x-text-body-default);
  text-align: left;
  cursor: pointer;
}

/* Hover/active feedback — shared across all three tab levels: a soft tint on
   hover, a stronger tint + press-down scale on active, using the "indicator"
   background family (same one --x-bg-nav-selected draws from) rather than the
   raw --surface-ghost-* overlay tints. Active additionally recolours the
   label to the hyperlink token, so "this is the one you just tapped" reads
   the same way the on-page L1/L2/L3 selected state does. */
.nav-drawer__l1,
.nav-drawer__l2,
.nav-drawer__l3 {
  transition: color var(--x-motion-sku-hover),
              background-color var(--x-motion-sku-hover),
              transform var(--x-motion-btn-activate);
}
.nav-drawer__l1:hover,
.nav-drawer__l2:hover,
.nav-drawer__l3:hover {
  color: var(--x-text-header-strong);
  background-color: var(--x-bg-indicator-neutral-subtle);
}
.nav-drawer__l1:active,
.nav-drawer__l2:active,
.nav-drawer__l3:active {
  color: var(--x-text-hyperlink-default);
  background-color: var(--x-bg-indicator-neutral-default);
  transform: scale(0.97);
}

/* Condense labels to match the rest of the UI.
   display/transform handled by .text-style-* class on each label span. */
.nav-drawer__label {
  transform-origin: left center;
}
/* L1, L2 and L3 labels are uppercase; text-transform is not part of the heading/utility text-style classes */
.nav-drawer__l1 .nav-drawer__label,
.nav-drawer__l2 .nav-drawer__label,
.nav-drawer__l3 .nav-drawer__label {
  text-transform: uppercase;
}

/* ── Region & language footer (Figma 4014:4698) ────────────────────────────
   Pinned below the scrolling nav: top divider, two halves split by a 1px rule.
   Each half is a tap target opening its selector sheet above the drawer. */
/* Pinned footer row wrapper — owns the border-top that used to sit on
   .nav-drawer__locale — now that this row leads the footer block, the
   divider between the scrolling nav and the whole footer belongs here, not
   repeated on every row inside it. */
.nav-drawer__pwa-row {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: var(--x-pad-surface-l);
  padding-bottom: var(--x-pad-surface-xs);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
}

/* Web Push row — icon + label + toggle. Always the only row now (no more
   install-CTA row above it — see the template comment), so it overrides the
   wrapper's default centring for a spread-out layout. */
.nav-drawer__webpush-row {
  position: relative;
  justify-content: flex-start;
  align-items: center;
  gap: var(--x-gap-content-default);
  color: var(--x-text-header-default);
}
.nav-drawer__webpush-row > * { position: relative; z-index: 1; }
.nav-drawer__webpush-label {
  flex: 1 1 0;
  min-width: 0;
}

/* "Just turned on" glow — mirrors ClaimGiftSheet.vue's success-bg-glow recipe.
   Animation longhands (the easing token contains a comma — shorthand is
   banned). */
.nav-drawer__webpush-glow {
  position: absolute;
  inset: 0;
  background: var(--x-bg-indicator-success-default);
  pointer-events: none;
  opacity: 0;
}
.nav-drawer__webpush-glow--active {
  animation-name: nav-drawer-webpush-glow;
  animation-duration: var(--x-motion-sys-duration-slowest);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: forwards;
}
@keyframes nav-drawer-webpush-glow {
  0%   { opacity: 0; }
  15%  { opacity: 0.25; }
  100% { opacity: 0; }
}

.nav-drawer__locale {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding-top: var(--x-pad-surface-m);
  padding-bottom: var(--x-pad-surface-xl);
}
.nav-drawer__locale-btn {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  /* Padding grows the hit/hover area beyond the text; matching negative
     margin cancels it out so the row's footprint is unchanged at rest. */
  padding: var(--x-pad-surface-xs) var(--x-pad-surface-s);
  margin: calc(-1 * var(--x-pad-surface-xs)) calc(-1 * var(--x-pad-surface-s));
  border: 0;
  border-radius: var(--x-radius-container-xs);
  background: transparent;
  color: var(--x-text-header-default);
  text-align: start;
  cursor: pointer;
  transition: color var(--x-motion-sku-hover),
              background-color var(--x-motion-sku-hover),
              transform var(--x-motion-btn-activate);
}
.nav-drawer__locale-btn:hover {
  color: var(--x-text-header-strong);
  background-color: var(--x-surface-ghost-2);
}
.nav-drawer__locale-btn:active {
  background-color: var(--x-surface-ghost-3);
  transform: scale(0.97);
}
.nav-drawer__locale-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform-origin: left center;
}
.nav-drawer__locale-divider {
  flex-shrink: 0;
  width: var(--border-weight-default);
  height: var(--x-size-icon-s);
  background: var(--x-border-divider);
}

/* Accordion sub-list — animate height via grid-rows 0fr→1fr */
.nav-drawer__sub {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.nav-drawer__group.is-open .nav-drawer__sub {
  grid-template-rows: 1fr;
}
.nav-drawer__sub-inner {
  overflow: hidden;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* ── Open/close motion ─────────────────────────────────────────────────────
   Panel slides from the left edge; scrim fades. Enter decelerates (350ms),
   exit accelerates away (200ms). Reduced-motion collapses these globally. */
.drawer-enter-active .nav-drawer__panel {
  transition: transform var(--x-motion-modal-enter);
}
.drawer-enter-from .nav-drawer__panel { transform: translateX(-100%); }
.drawer-enter-to   .nav-drawer__panel { transform: translateX(0); }

.drawer-enter-active .nav-drawer__scrim { transition: opacity var(--x-motion-modal-enter); }
.drawer-enter-from .nav-drawer__scrim { opacity: 0; }
.drawer-enter-to   .nav-drawer__scrim { opacity: 1; }

.drawer-leave-active .nav-drawer__panel {
  transition: transform var(--x-motion-modal-exit);
}
.drawer-leave-from .nav-drawer__panel { transform: translateX(0); }
.drawer-leave-to   .nav-drawer__panel { transform: translateX(-100%); }

.drawer-leave-active .nav-drawer__scrim { transition: opacity var(--x-motion-modal-exit); }
.drawer-leave-from .nav-drawer__scrim { opacity: 1; }
.drawer-leave-to   .nav-drawer__scrim { opacity: 0; }
</style>
