<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useDragScroll } from '../composables/useDragScroll.js'

/**
 * CategoryNav — sticky bottom category navigation (Figma "L3 Nav" 5100:19182).
 *
 * A frosted bar pinned to the bottom of the device screen (framed) or the
 * viewport (responsive). Tabs scroll horizontally; an edge fade appears on
 * either side whenever tabs are hidden that way.
 *
 * Two operating modes (driven by the `mode` prop — never by store identity):
 *
 *   'scroll'  (default) — tapping a tab smooth-scrolls to its section id;
 *             the IntersectionObserver scroll-spy tracks the active tab as
 *             the user scrolls. Used by COD:M's single-scroll page model.
 *
 *   'filter'  — tapping a tab emits `update:active` with the tab id; the
 *             parent controls which tab is active via the `active` prop.
 *             No scroll-spy is built (sections are not on-page anchors).
 *             Used by FCM's category hide/show catalogue model.
 *
 * Self-contained: it resolves the scroll container itself (`.device__screen`
 * when framed, else the window) and drives both the scroll-spy and the tap
 * navigation by section id — App only supplies the tab list + section ids.
 */
const props = defineProps({
  /** [{ id, label }] — id matches a section element's id in the page */
  tabs: { type: Array, default: () => [] },
  /** Framed device (absolute, anchored to screen) vs responsive (fixed, viewport) */
  isMobile: { type: Boolean, default: true },
  /**
   * 'scroll' — scroll-spy + scrollIntoView (default, COD:M page model)
   * 'filter' — emit-driven active tab, no scroll-spy (FCM filter model)
   */
  mode: { type: String, default: 'scroll' },
  /**
   * Externally-controlled active tab id (filter mode only).
   * In scroll mode the active tab is driven internally by the IntersectionObserver.
   */
  active: { type: String, default: null },
  /**
   * 'bottom' (default) — pinned to the bottom of the screen, L2 surface.
   * 'top'              — pinned below the NavBar, L3 surface, active indicator on bottom.
   * 'row'              — static in-flow row, no own positioning/background/animation.
   *                      Used by CatalogNavStack, which owns ONE sticky frosted
   *                      surface and stacks two 'row' instances inside it (L2 + L3)
   *                      instead of each managing its own bar.
   */
  variant: { type: String, default: 'bottom' },
  /**
   * Row-level styling hint for `variant="row"` only — distinguishes the L2
   * (category) row from the nested L3 (subcategory) row so two stacked rows
   * read as parent/child rather than peers. No effect on 'bottom'/'top'.
   */
  level: { type: String, default: null }, // 'l2' | 'l3'
})

const emit = defineEmits(['update:active'])

// In scroll mode: driven internally by the IntersectionObserver.
// In filter mode: mirrors the `active` prop (parent-controlled).
const activeId = ref(
  props.mode === 'filter'
    ? (props.active ?? props.tabs[0]?.id ?? null)
    : (props.tabs[0]?.id ?? null),
)

const prefersReduced = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

/* ── Tap → scroll (scroll mode) or notify parent (filter mode) ──────────────
   scroll mode: scrollIntoView walks to the nearest scrollable ancestor, so it
   works for both the framed (.device__screen) and responsive (window) cases.
   filter mode: emit update:active and let the parent swap the visible content. */
function goTo(id) {
  if (props.mode === 'filter') {
    activeId.value = id
    emit('update:active', id)
    return
  }
  const el = document.getElementById(id)
  if (!el) return
  activeId.value = id // optimistic; the observer confirms once scrolling settles
  el.scrollIntoView({
    behavior: prefersReduced() ? 'auto' : 'smooth',
    block: 'start',
  })
}

// Filter mode: keep activeId in sync when the parent changes the active prop
// (e.g. on first load when App sets the default category).
watch(
  () => props.active,
  (id) => {
    if (props.mode === 'filter' && id && id !== activeId.value) {
      activeId.value = id
    }
  },
)

/* ── Scroll-spy — highlight the most-visible section ────────────────────────
   Only used in 'scroll' mode; in 'filter' mode the active tab is parent-
   controlled so there are no on-page section anchors to observe. */
let observer = null
const ratios = new Map()

function buildObserver() {
  // No-op in filter mode — categories are not on-page scroll anchors.
  if (props.mode === 'filter') return

  if (observer) observer.disconnect()
  ratios.clear()
  // Framed content scrolls inside .device__screen; responsive scrolls the window.
  const root = props.isMobile ? document.querySelector('.device__screen') : null
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) ratios.set(e.target.id, e.intersectionRatio)
      // Most-visible section wins; ties resolve to the earlier tab (DOM order).
      let best = null
      let bestRatio = 0
      for (const t of props.tabs) {
        const r = ratios.get(t.id) ?? 0
        if (r > bestRatio) { bestRatio = r; best = t.id }
      }
      if (best) activeId.value = best
    },
    { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
  )
  for (const t of props.tabs) {
    const el = document.getElementById(t.id)
    if (el) observer.observe(el)
  }
}

/* ── Edge fades — show on a side when tabs are hidden that way ───────────────
   Same cached-metrics pattern as BestSellerCarousel: read clientWidth/scrollWidth
   on resize only, scrollLeft per scroll event (no layout thrash). */
const listRef = ref(null)
const canLeft = ref(false)
const canRight = ref(false)
let cw = 0
let sw = 0
function measure() {
  const el = listRef.value
  if (!el) return
  cw = el.clientWidth
  sw = el.scrollWidth
}
function update() {
  const el = listRef.value
  if (!el) return
  const sl = el.scrollLeft
  canLeft.value = sl > 0
  canRight.value = sl + cw < sw - 1
}

/* ── Follow the page — bring the active tab into the centre of the nav ────────
   As the user scrolls the page and the scroll-spy promotes a new category, the
   nav scrolls horizontally so that tab sits front-and-centre. Rect-based maths
   so it's robust regardless of the list's positioning; clamped by scrollTo. */
function centerActiveTab() {
  const list = listRef.value
  if (!list) return
  const idx = props.tabs.findIndex((t) => t.id === activeId.value)
  const btn = list.children[idx]
  if (!btn) return
  const listBox = list.getBoundingClientRect()
  const btnBox = btn.getBoundingClientRect()
  const btnLeftInContent = btnBox.left - listBox.left + list.scrollLeft
  const target = btnLeftInContent - (list.clientWidth - btnBox.width) / 2
  list.scrollTo({ left: target, behavior: prefersReduced() ? 'auto' : 'smooth' })
}

/* ── Page-scroll direction → which edge the active indicator grows from ──────
   No reusable scroll-direction composable exists in this codebase (NavBar.vue
   has the only other direction-tracking logic, and it's private/inline,
   coupled to --navbar-h reporting) — this is a small local equivalent,
   mirroring NavBar's exact scrollTopOf/delta/RAF-throttle pattern, built only
   in 'scroll' mode (mode 'filter' has no on-page anchors to scroll past).
   Down = tabs advance left-to-right (subcategories appear top-to-bottom on
   the page, matching left-to-right tab order) → the incoming tab's indicator
   grows from its LEFT edge (the side the previous tab was on); up = right. */
let scrollTarget = null
let lastScrollTop = 0
let tickingDirection = false
const growOrigin = ref('center') // 'center' until the first real scroll-spy promotion

function scrollTopOfDirection(target) {
  return target === window ? window.scrollY : target.scrollTop
}
function onDirectionScroll() {
  if (tickingDirection) return
  tickingDirection = true
  requestAnimationFrame(() => {
    const top = scrollTopOfDirection(scrollTarget)
    const delta = top - lastScrollTop
    if (delta > 4) pendingDirection = 'down'
    else if (delta < -4) pendingDirection = 'up'
    lastScrollTop = top
    tickingDirection = false
  })
}
let pendingDirection = 'down'
function bindDirectionScroll() {
  unbindDirectionScroll()
  if (props.mode !== 'scroll') return
  scrollTarget = props.isMobile ? document.querySelector('.device__screen') : window
  if (!scrollTarget) return
  lastScrollTop = scrollTopOfDirection(scrollTarget)
  scrollTarget.addEventListener('scroll', onDirectionScroll, { passive: true })
}
function unbindDirectionScroll() {
  scrollTarget?.removeEventListener('scroll', onDirectionScroll)
  scrollTarget = null
}

// Fires for both scroll-spy promotion and taps — either way the active tab
// centres, and (scroll-spy only) captures the scroll direction that promoted
// it as the new indicator's grow-from edge. A tap has no meaningful
// direction — growOrigin simply keeps whatever it last was.
watch(activeId, () => {
  if (props.mode === 'scroll') growOrigin.value = pendingDirection === 'up' ? 'right' : 'left'
  nextTick(centerActiveTab)
})

// Click-and-drag scrolling (mouse). Touch keeps native pan-x. `onScroll: update`
// keeps the edge fades in sync as the composable writes scrollLeft.
const { isDragging } = useDragScroll(listRef, { onScroll: update })

let ro = null
onMounted(() => {
  nextTick(() => {
    measure()
    update()
    buildObserver()
    bindDirectionScroll()
  })
  if (typeof ResizeObserver !== 'undefined' && listRef.value) {
    ro = new ResizeObserver(() => { measure(); update() })
    ro.observe(listRef.value)
  }
})

// Device switch swaps the scroll container — rebuild the spy (and the
// direction listener, same root) against the new one.
watch(() => props.isMobile, () => nextTick(() => { buildObserver(); bindDirectionScroll() }))

// Rebuild the spy when the SET of tab ids changes (scroll mode only — filter
// mode has no observer). Keyed on the id sequence rather than the `tabs` array
// reference so a parent re-computing an equal array every render doesn't
// thrash this. Needed by consumers whose tab list itself changes without the
// component remounting — e.g. CatalogNavStack's subcategory row, whose tabs
// switch to reflect whichever category is currently scrolled into view.
watch(
  () => props.tabs.map(t => t.id).join('|'),
  () => { if (props.mode === 'scroll') nextTick(buildObserver) },
)

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  if (observer) observer.disconnect()
  unbindDirectionScroll()
})
</script>

<template>
  <nav
    class="cat-nav"
    :class="{
      'cat-nav--responsive': !isMobile,
      'cat-nav--top': variant === 'top',
      'cat-nav--bottom': variant === 'bottom',
      'cat-nav--row': variant === 'row',
      [`cat-nav--${level}`]: level,
    }"
    aria-label="Categories"
  >
    <div class="cat-nav__viewport">
      <div
        ref="listRef"
        class="cat-nav__list"
        :class="{ 'is-dragging': isDragging }"
        @scroll.passive="update"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          v-ripple
          v-haptic:chip
          type="button"
          class="cat-nav__item"
          :class="{ 'is-active': activeId === tab.id }"
          :style="activeId === tab.id ? { '--tab-grow-origin': growOrigin } : undefined"
          @click="goTo(tab.id)"
        >
          <span
            class="cat-nav__label"
            :class="activeId === tab.id ? 'text-style-utility-label-bold' : 'text-style-utility-label-regular'"
          >{{ tab.label }}</span>
        </button>
      </div>
    </div>
    <!-- Fades are siblings of the viewport so they sit at the true .cat-nav edges,
         unaffected by the viewport's horizontal padding -->
    <div class="cat-nav__fade cat-nav__fade--left" :class="{ 'is-visible': canLeft }" aria-hidden="true" />
    <div class="cat-nav__fade cat-nav__fade--right" :class="{ 'is-visible': canRight }" aria-hidden="true" />
  </nav>
</template>

<style scoped>
.cat-nav {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0; /* persistent base — transient drawer/loader/snackbar/checkout sit above */
  pointer-events: auto;
  /* Horizontal padding lives on the viewport, not here, so the edge fades can
     reach the true left/right edges of the bar */
  padding-bottom: var(--x-pad-surface-l);
  /* Bottom category nav — L2 surface (lighter than the L3 subcategory nav above) */
  border-top: var(--border-weight-default) solid var(--x-border-nav);
  border-top-left-radius: var(--x-radius-container-xs);
  border-top-right-radius: var(--x-radius-container-xs);
  background: var(--x-bg-nav);
  background-color: var(--x-bg-page);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  box-shadow: var(--x-shadow-nav), var(--x-shadow-nav-inset);

  /* Entrance — slides up from the bottom edge it lives on, settles after the
     section cascade. Ease-out, no spring (utilitarian persistent nav). */
  animation: nav-enter var(--x-motion-nav-enter) both;
  animation-delay: 700ms;
}
/* Responsive (no device frame): pin to the viewport bottom instead of the screen */
.cat-nav--responsive {
  position: fixed;
}

/* ── Top variant — subcategory nav (L3, docks at the top of the screen) ──────
   NavBar is `position: sticky` and stays pinned at the top while scrolled, so
   this bar docks directly beneath it (--navbar-h, reported live by NavBar's
   own ResizeObserver — 0 while NavBar is scroll-hidden, so this would
   otherwise ride all the way up to the device screen's true top instead of
   leaving a dead gap) rather than at a fixed offset — else the two collide
   and the overlay-layer subcategory bar (z-40) paints over the sticky NavBar
   (z-20). NOT `--safe-top + --navbar-h` unconditionally: NavBar's own height
   already starts from y:0 and its top padding bakes in --safe-top, so simply
   adding --safe-top on top would double-count it while NavBar is visible.
   `max(…, --safe-top)` instead: DeviceFrame renders a REAL, permanently-
   visible status bar in the safe-top band, so when NavBar IS hidden
   (--navbar-h: 0) this bar must still stop at --safe-top rather than riding
   up underneath it — max() picks whichever offset is actually larger in
   either case, so it's correct whether NavBar is shown or hidden. */
.cat-nav--top {
  top: max(var(--navbar-h, 0px), var(--safe-top, 0px));
  bottom: auto;
  /* Rides up/down smoothly in sync with NavBar's own hide/show transition
     (--x-motion-sys-duration-base / --x-motion-sys-ease-standard) rather than
     snapping to the new --navbar-h value. */
  transition: top var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
  padding-top: var(--x-pad-surface-l);
  padding-bottom: 0;
  /* L3 surface — more prominent than the L2 bottom category nav. background-image
     (not the `background` shorthand) so the inherited background-color:var(--x-bg-page)
     solid backing is preserved beneath the translucent L3 frosted fill. */
  border-top: none;
  border-bottom: var(--border-weight-default) solid var(--x-border-sheet);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: var(--x-radius-container-xs);
  border-bottom-right-radius: var(--x-radius-container-xs);
  background-image: var(--x-bg-sheet);
  /* No permanent mount animation — Transition wrapper owns show/hide timing */
  animation: none;
}
.cat-nav--top.cat-nav--responsive {
  position: fixed;
  /* below the DeviceToolbar + sticky NavBar; --safe-top is unset in responsive
     mode (no device frame, no status bar) so the max() is a no-op here —
     kept only for symmetry with the framed rule above. */
  top: max(calc(var(--toolbar-h, 0px) + var(--navbar-h, 0px)), var(--safe-top, 0px));
}

/* ── Row variant — static in-flow row, no own surface ────────────────────────
   CatalogNavStack owns the ONE sticky/frosted container; a 'row' instance is
   just its tab strip. Cancel every positioning/background/animation rule the
   bottom/top variants set directly on .cat-nav so two rows stack cleanly
   inside the wrapper's single surface. */
.cat-nav--row {
  position: static;
  padding-bottom: 0;
  border: 0;
  border-radius: 0;
  background: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  animation: none;
}
.cat-nav--row .cat-nav__list {
  margin: 0;
  /* Centred, not left-aligned — when the tabs don't fill the full-bleed
     row's width (few categories, or a wide viewport), they sit in the
     middle rather than bunching to the left with dead space on the right.
     `safe` is required once the row overflows and scrolls: plain `center`
     centres the OVERFLOW itself, so the flex content starts at a negative
     offset relative to the scroll viewport and the first tab renders
     off-screen to the left at rest (scrollLeft: 0 shows a middle slice, not
     tab 1). `safe center` centres only while everything fits, falling back
     to start-alignment (first tab flush left, fully scrollable) the moment
     it doesn't. */
  justify-content: safe center;
}
/* Row variant's active indicator sits on the BOTTOM edge (both L2 and L3),
   not the top — same flip `.cat-nav--top` already does for the legacy
   subcategory bar, just applied to both stacked rows here. Selected state
   reads through this border AND the background colour together
   (--x-bg-nav-selected on .is-active). */
.cat-nav--row .cat-nav__item {
  border-top: 0;
  border-bottom: var(--border-weight-selected) solid transparent;
}
.cat-nav--row .cat-nav__item.is-active {
  /* --x-border-nav-selected defaults to --x-text-hyperlink-default (a plain solid
     underline, byte-for-byte unchanged for every store). FCM instead sets
     this to `transparent` and paints the real underline via the ::after
     gradient-stroke sliver below (both L2 and L3), since a gradient can't be
     expressed as a CSS border-color. */
  border-bottom-color: var(--x-border-nav-selected);
}
/* Gradient-stroke underline for the row-variant border above — L2 (stacked
   only) now keeps the underline (FCM only — --x-gradient-nav-selected-stroke
   defaults to `none`, invisible elsewhere). L3's own version (both this row
   variant AND the bottom-docked bar) lives in the shared "L3 tab prominence"
   block below, since it needs to grow directionally rather than just fade
   in — see that block for why L2 and L3 diverge here.
   Sits inside the tab's own bottom edge, not extending the box like a real
   border would; --border-weight-nav-selected-stroke defaults to
   --border-weight-selected (2px, matching the solid border it replaces) but
   FCM overrides it to 4px, its Figma spec's stroke thickness. */
.cat-nav--row.cat-nav--l2 .cat-nav__item::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--border-weight-nav-selected-stroke, var(--border-weight-selected));
  background: none;
  opacity: 0;
  transition: opacity var(--x-motion-tab-indicator);
}
.cat-nav--row.cat-nav--l2 .cat-nav__item.is-active::after {
  background: var(--x-gradient-nav-selected-stroke, none);
  opacity: 1;
}
/* Full bleed — no side inset, no content-width cap, edge-to-edge regardless
   of viewport width. Individual tabs keep their own padding (below); only the
   row's outer padding/max-width is removed. */
.cat-nav--row .cat-nav__viewport {
  padding-left: 0;
  padding-right: 0;
  max-width: none;
  margin-left: 0;
  margin-right: 0;
}
/* L2 row's own tab padding + min-width spec — no container-level padding
   either; vertical space comes entirely from this. min-width:
   --x-size-control-xl (64px) — enough that a short single-word label (e.g.
   "Silver") doesn't look cramped, small enough that a typical 3-4-tab row
   still fits an XS screen without needing to scroll. L3's own (larger) spec
   lives in the shared prominence block below, since — unlike this rule — it
   applies regardless of variant (row AND bottom-docked). */
.cat-nav--row.cat-nav--l2 .cat-nav__item {
  min-width: var(--x-size-control-xl);
  padding: var(--x-pad-surface-m) var(--x-pad-surface-s);
}

/* ── L3 tab prominence — bigger tabs + a resting→selected transition ────────
   Internal-testing feedback: the flattened L3 row (CatalogNavStack.vue's
   'flat' presentation) read as too small/subtle. Scoped to `.cat-nav--l3`
   alone (NOT `.cat-nav--row .cat-nav--l3`) so it stays correct if L3 ever
   renders in another bar variant again. L2 is untouched — this feedback was
   L3-only. */
.cat-nav--l3 .cat-nav__item {
  min-width: var(--x-size-control-xxl); /* 72px — one step past L2's 64px */
  padding: var(--x-pad-surface-l) var(--x-pad-surface-m);
}
.cat-nav--l3 .cat-nav__label {
  /* Overrides the inherited text-style-utility-label-*'s --x-sys-size-body-s —
     scoped-CSS specificity wins over that plain class rule, so nothing else
     using those utility classes elsewhere in the app is affected. */
  font-size: var(--x-sys-size-body-main);
}
/* Gradient-stroke underline — L3's version of the L2 rule above, but always
   rendered (not just on .is-active) and transform-based rather than a plain
   opacity fade, so it can GROW from an edge rather than just appear. Edge
   differs by variant: the row sits UNDER its content (bottom edge, matching
   L2's convention above); the bottom-docked bar sits ABOVE its content, so
   its accent faces the content from the TOP edge instead — the same
   edge-flip convention `.cat-nav--top` already uses relative to
   `.cat-nav--bottom` for the border/indicator side. */
.cat-nav--row.cat-nav--l3 .cat-nav__item::after,
.cat-nav--bottom.cat-nav--l3 .cat-nav__item::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: var(--border-weight-nav-selected-stroke, var(--border-weight-selected));
  background: var(--x-gradient-nav-selected-stroke, none);
  transform: scaleX(0);
  /* Set inline per-tab, only on whichever tab is currently active (see the
     template's :style binding) — the scroll direction that promoted it
     determines which side it grows from. Defaults to 'center' (no direction
     signal yet, e.g. before the first scroll-spy promotion). */
  transform-origin: var(--tab-grow-origin, center);
  opacity: 0;
  transition: transform var(--x-motion-tab-indicator), opacity var(--x-motion-tab-indicator);
}
.cat-nav--row.cat-nav--l3 .cat-nav__item::after {
  bottom: 0;
}
.cat-nav--bottom.cat-nav--l3 .cat-nav__item::after {
  top: 0;
}
.cat-nav--row.cat-nav--l3 .cat-nav__item.is-active::after,
.cat-nav--bottom.cat-nav--l3 .cat-nav__item.is-active::after {
  transform: scaleX(1);
  opacity: 1;
}
/* Bottom-docked L3's plain border-top (the shared .cat-nav__item.is-active
   rule below, --x-text-hyperlink-default, unchanged for every other variant)
   would otherwise double up with the new gradient ::after at the same top
   edge. Re-source it through --x-border-nav-selected instead — byte-for-byte
   the same value everywhere except FCM (which sets it to `transparent`, the
   same trick the row variant already relies on), so the plain line
   disappears there and only the gradient stroke reads, while every other
   store is unaffected (--x-border-nav-selected defaults to
   --x-text-hyperlink-default, so this override is a no-op value-wise). */
.cat-nav--bottom.cat-nav--l3 .cat-nav__item.is-active {
  border-top-color: var(--x-border-nav-selected);
}

.cat-nav__viewport {
  position: relative;
  /* Horizontal padding is here — the list scrolls within this inset area */
  padding: 0 var(--x-pad-surface-m);
  max-width: 616px;
  margin: 0 auto;
  overflow: hidden; /* clip the scroll row so items don't bleed under the fades */
}

.cat-nav__list {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--x-gap-content-default);
  overflow-x: auto;
  width: 100%;
  cursor: grab;
  /* Pull the row up by the hairline so the active 2px indicator meets the top edge */
  margin-top: calc(-1 * var(--border-weight-default));
  touch-action: pan-x; /* own horizontal gestures; vertical page scroll passes through */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain; /* horizontal flick doesn't leak to the page scroll */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
/* Top variant: pull the row DOWN so the active indicator meets the bottom border */
.cat-nav--top .cat-nav__list {
  margin-top: 0;
  margin-bottom: calc(-1 * var(--border-weight-default));
}
.cat-nav__list::-webkit-scrollbar { display: none; }
.cat-nav__list.is-dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}

.cat-nav__item {
  flex-shrink: 0;
  min-width: 121px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-s);
  border: 0;
  border-top: var(--border-weight-selected) solid transparent;
  position: relative; /* anchors ::after's gradient-stroke sliver (row/L3 only, see below) */
  background: transparent;
  cursor: pointer;
  /* Typography — font-size/weight/tracking live on the inner label span via
     text-style-utility-label-* classes (active toggles bold variant). */
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--x-text-body-default);
  transition:
    color var(--x-motion-tab-indicator),
    border-color var(--x-motion-tab-indicator),
    background-color var(--x-motion-sku-hover),
    transform var(--x-motion-btn-activate);
}
/* Hover/press feedback — L2 and L3 (the same "indicator" tint + press-down
   scale recipe as NavDrawer's L1/L2/L3 rows and .navbar__intent above), not
   a bespoke one. `.cat-nav__item` is also shared by every OTHER store's
   plain (no `level` prop) filter-mode tab bars, so this is scoped to
   `.cat-nav--l2`/`.cat-nav--l3` rather than the bare class — those bars
   keep their current (unchanged) treatment. `level="l3"` is used only by
   CatalogNavStack (both its live 'flat' row and the archived 'stacked'
   presentation's L3 sub-row), so this reaches exactly those, not every
   store's legacy nav. Scoped to :not(.is-active) so it doesn't fight the
   selected tab's own ::before gradient-fill layer above. */
.cat-nav--l2 .cat-nav__item:not(.is-active):hover,
.cat-nav--l3 .cat-nav__item:not(.is-active):hover {
  color: var(--x-text-header-strong);
  background-color: var(--x-bg-indicator-neutral-subtle);
}
.cat-nav--l2 .cat-nav__item:not(.is-active):active,
.cat-nav--l3 .cat-nav__item:not(.is-active):active {
  color: var(--x-text-hyperlink-default);
  background-color: var(--x-bg-indicator-neutral-default);
}
.cat-nav--l2 .cat-nav__item:active,
.cat-nav--l3 .cat-nav__item:active {
  transform: scale(0.97);
}
/* Selected-state gradient fill — an always-present ::before layer, opacity-
   faded, rather than transitioning .is-active's background-image directly
   (unreliably/inconsistently animatable across browsers for anything beyond
   a plain colour). `none` everywhere except FCM's override (see semantics.css
   / fcm.css) — inert for every other store, so only the container background
   fades in, and it's invisible (opacity: 0, no-op) either way. Applies to
   every variant (bottom/top/row) since `.cat-nav--top` below only overrides
   the border edge, not this base rule. */
.cat-nav__item::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--x-bg-nav-selected);
  opacity: 0;
  transition: opacity var(--x-motion-tab-indicator);
}
.cat-nav__item.is-active::before {
  opacity: 1;
}
.cat-nav__item.is-active {
  /* --x-text-nav-selected defaults to --x-text-hyperlink-default (byte-for-byte
     unchanged for every store) — FCM overrides it to --x-text-body-default
     since the hyperlink accent reads poorly on its solid success-green
     --x-bg-nav-selected fill (see semantics.css / fcm.css for both tokens). */
  color: var(--x-text-nav-selected);
  border-top-color: var(--x-text-hyperlink-default);
}
/* Top variant: active indicator on the bottom instead of the top */
.cat-nav--top .cat-nav__item {
  border-top: 0;
  border-bottom: var(--border-weight-selected) solid transparent;
}
.cat-nav--top .cat-nav__item.is-active {
  border-bottom-color: var(--x-text-hyperlink-default);
}

/* Condense + track the label text — text-style-utility-label-* class handles
   display:inline-block + scaleX. scaleX on the span leaves the button border unaffected.
   Centre-aligned within the button, so override the default left-origin.
   position:relative + z-index:1: without an explicit z-index the label (a
   plain non-positioned inline-block) would paint BENEATH .cat-nav__item's
   ::before gradient-fill layer — positioned pseudo-elements at the default
   stacking level (z-index:auto) paint after non-positioned in-flow content,
   ahead of it, not behind — so the label needs its own explicit level to
   stay on top of that full-coverage fill. */
.cat-nav__label {
  position: relative;
  z-index: 1;
  transform-origin: center center;
}

/* Edge fades — positioned relative to .cat-nav (itself position:absolute), so
   left:0/right:0 is the true outer edge of the bar, not the inset viewport */
.cat-nav__fade {
  position: absolute;
  top: var(--border-weight-default); /* sit just below the top hairline */
  bottom: 0;
  width: 30px;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--x-motion-hover);
}
/* Top variant: anchor fades above the bottom hairline instead */
.cat-nav--top .cat-nav__fade {
  top: 0;
  bottom: var(--border-weight-default);
}
.cat-nav__fade.is-visible { opacity: 1; }
.cat-nav__fade--left {
  left: 0;
  background: var(--x-gradient-scroll-fade-left);
}
.cat-nav__fade--right {
  right: 0;
  background: var(--x-gradient-scroll-fade-right);
}

@keyframes nav-enter {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nav-enter-top {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes nav-leave-top {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-100%); }
}

/* ── Scroll-triggered Transition classes (applied by App.vue's <Transition name="subcat-nav">) */
.subcat-nav-enter-active {
  animation-name: nav-enter-top;
  animation-duration: var(--x-motion-sys-duration-base);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
}
.subcat-nav-leave-active {
  animation-name: nav-leave-top;
  animation-duration: var(--x-motion-sys-duration-exit);
  animation-timing-function: var(--x-motion-sys-ease-accelerate);
  animation-fill-mode: both;
}
</style>
