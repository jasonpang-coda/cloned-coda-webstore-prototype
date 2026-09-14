<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import CategoryNav from './CategoryNav.vue'

/**
 * CatalogNavStack — the L2/L3 surface for the FCM multi-level navigation pilot.
 * The runtime nav-model flag that used to offer 'dropdown'/'flat'/'flat-bottom-s'
 * has been retired — internal testing settled on 'flat' permanently, so
 * App.vue now always mounts this with presentation="flat". 'dropdown' and
 * 'flat-bottom-s' have been deleted outright (not just archived) below;
 * 'stacked' was already archived in an earlier round and is left as-is.
 *
 * Every category AND subcategory of the active intent is rendered on the page
 * at once (App.vue loops `categories`, one section per category, wrapping
 * CategoryCatalog — no filtering) — the point being every subcategory is
 * discoverable by scrolling, not just by opening a menu. This component is
 * purely a NAVIGATION AID over that single continuous page: it never controls
 * what's rendered. Tapping a tab/option scrolls to the matching section;
 * everything it displays (the L2/L3 highlight, the dropdown breadcrumb) is
 * derived from an internal scroll-spy, so it also tracks the user's position
 * as they scroll past a section without tapping anything.
 *
 * ONE frosted container, mounted in NORMAL document flow right after the
 * Best Sellers section (Best Sellers deliberately isn't part of this nav —
 * see App.vue) — NOT at the very top. `position: sticky` (top: var(--navbar-h),
 * same responsive `--toolbar-h` offset, same ride-with-NavBar transition
 * CategoryNav's `variant="top"` used for the legacy subcategory bar) means it
 * renders inline at that natural position and only DOCKS — sticks to the top,
 * directly beneath NavBar's L1 row — once the user scrolls past it, undocking
 * again when scrolled back above it. Being sticky (not absolute) it also
 * reserves its own space in the document flow automatically — no separate
 * spacer needed, unlike an always-on-top overlay would require.
 *
 *   'stacked'  — two `variant="row"` CategoryNav instances stacked inside this
 *                one surface, both `mode="scroll"` (tap = scrollIntoView,
 *                self-spied highlight — CategoryNav's existing scroll-mode
 *                behaviour, unmodified): row 1 (L2) is every category; row 2
 *                (L3) is the CURRENTLY-IN-VIEW category's subcategories,
 *                re-spied automatically when that set changes (CategoryNav
 *                now rebuilds its observer on a tabs-id change, not just on
 *                mount) — rendered only once that category has more than one
 *                subcategory. Row 2's slot reserves a fixed min-height
 *                regardless, so scrolling from a 3-subcategory category into a
 *                1-subcategory one doesn't reflow the page under the user.
 *
 *   'flat'     — no L2 at all: one `variant="row"` CategoryNav, docking
 *                directly beneath L1 (this surface always docks at
 *                `top: var(--navbar-h)`), whose tabs are EVERY subcategory of
 *                EVERY category flattened into a single list (categories
 *                themselves aren't tappable — only reachable by scrolling/
 *                selecting past their divider). Keeps the l3 (indented "child"
 *                look) row styling — same visual behaviour as 'stacked's L3
 *                row, just with L2 removed. This is the only reachable
 *                presentation now (App.vue hardcodes it).
 *
 *                Own `mode` prop (independent of `presentation`) — this
 *                component's own `mode`/`activeCategoryId`/`activeSubcategoryId`
 *                props, NOT the fixed `mode="scroll"` CategoryNav instances
 *                above use internally:
 *                  'scroll' (default) — every category/subcategory is
 *                    genuinely mounted (App's "show all" L2), so this self-
 *                    spies and a tap scrollIntoView's directly, unchanged.
 *                  'filter' — only activeCategoryId's category is mounted
 *                    (App's filtered L2); self-spying can't work, so the
 *                    active tab is driven by activeCategoryId/
 *                    activeSubcategoryId and a tap emits 'select' with
 *                    { categoryId, subcategoryId } instead of scrolling — the
 *                    parent resolves whether that means switching the active
 *                    category first (its subcategory anchor doesn't exist
 *                    until it is the one mounted).
 *
 * Publishes --nav-stack-h (mirrors NavBar's --navbar-h / DeviceToolbar's
 * --toolbar-h pattern) so CategoryCatalog's section `scroll-margin-top` clears
 * whatever this surface's actual rendered height is, instead of a guess.
 */
const props = defineProps({
  /** Active intent's FULL category tree — [{ id, label, subcategories }].
   *  In 'scroll' mode every category/subcategory here is assumed to already
   *  be on the page (nothing here filters). In 'filter' mode only the
   *  category matching activeCategoryId is actually mounted — every other
   *  category is still listed here (so it stays discoverable/tappable), its
   *  tap just can't scrollIntoView directly; see mode below. */
  categories: { type: Array, default: () => [] },
  /** 'stacked' | 'flat' — 'flat' is the only value App.vue ever passes now;
      'stacked' is kept archived (unreachable via any live control) from an
      earlier round, in case it's revisited. */
  presentation: { type: String, default: 'stacked' },
  isMobile: { type: Boolean, default: true },
  /** 'scroll' (default) — every category/subcategory already on the page;
   *  self-spied, tap scrollIntoView's the tapped tab directly (unchanged
   *  behaviour). 'filter' — only activeCategoryId's category is mounted, so
   *  self-spying can't work; the active tab is externally driven by
   *  activeCategoryId/activeSubcategoryId, and a tap emits 'select' instead
   *  of scrolling — the parent (which owns the active category) resolves
   *  whether that means switching categories before it can scroll. */
  mode: { type: String, default: 'scroll' },
  /** filter mode only: the currently active (mounted) category's raw id. */
  activeCategoryId: { type: String, default: null },
  /** filter mode only: the currently active subcategory id within
   *  activeCategoryId — highlights the right tab in the flat row. */
  activeSubcategoryId: { type: String, default: null },
})
const emit = defineEmits(['select'])

// Category-level anchors are prefixed `cat-${id}` (App.vue wraps each category
// loop item in `<section :id="\`cat-${cat.id}\`">`) so they can't collide with
// the unprefixed subcategory ids CategoryCatalog renders (`:id="sub.id"`).
const categoryTabs = computed(() =>
  props.categories.map(c => ({ id: `cat-${c.id}`, label: c.label })),
)

const allSubcategories = computed(() =>
  props.categories.flatMap(c => (c.subcategories ?? []).map(s => ({ ...s, categoryId: c.id }))),
)

// ── Scroll-spy — a small helper shared by two independent observers ─────────
// Two separate spies, not one: a category (e.g. FCM's "gifts") can render
// custom markup instead of CategoryCatalog and skip having its OWN addressable
// subcategory anchor, which would otherwise leave the category-level spy stuck
// on whatever category was last seen. Watching `cat-{id}` anchors directly
// (always rendered, one per category, unconditionally) keeps inViewCategory
// correct regardless of what a given category renders internally.
function useVisibilitySpy (idsRef, isMobileRef) {
  const activeId = ref(idsRef.value[0] ?? null)
  const ratios = new Map()
  let observer = null
  function build () {
    if (observer) observer.disconnect()
    ratios.clear()
    const root = isMobileRef.value ? document.querySelector('.device__screen') : null
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target.id, e.intersectionRatio)
        let best = null
        let bestRatio = 0
        for (const id of idsRef.value) {
          const r = ratios.get(id) ?? 0
          if (r > bestRatio) { bestRatio = r; best = id }
        }
        if (best) activeId.value = best
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    for (const id of idsRef.value) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  }
  onMounted(() => nextTick(build))
  watch(() => idsRef.value.join('|'), () => nextTick(build))
  watch(isMobileRef, () => nextTick(build))
  onBeforeUnmount(() => observer?.disconnect())
  return activeId
}

const isMobileRef = computed(() => props.isMobile)
const inViewCategoryId = useVisibilitySpy(computed(() => categoryTabs.value.map(t => t.id)), isMobileRef)

const inViewCategory = computed(() =>
  props.categories.find(c => `cat-${c.id}` === inViewCategoryId.value) ?? props.categories[0] ?? null,
)

const subcategoryTabs = computed(() =>
  inViewCategory.value?.subcategories?.map(s => ({ id: s.id, label: s.navLabel ?? s.label })) ?? [],
)

// ── Flat presentation — one row, every subcategory, no L2 ───────────────────
const flatTabs = computed(() =>
  allSubcategories.value.map(s => ({ id: s.id, label: s.navLabel ?? s.label })),
)

// Filter mode only: a tapped tab's owning category may not be the one
// currently mounted — resolve it and hand both ids to the parent, which owns
// activeCategoryId/activeCat and decides whether a category switch is needed
// before it can scroll to the subcategory (mirrors App.vue's onDrawerNavigate
// for the same isFilter case).
function onFlatSelect(subId) {
  if (props.mode !== 'filter') return
  const sub = allSubcategories.value.find(s => s.id === subId)
  emit('select', { categoryId: sub?.categoryId ?? null, subcategoryId: subId })
}

// ── --nav-stack-h ─────────────────────────────────────────────────────────
// Published for CategoryCatalog's / App's section `scroll-margin-top` (see
// their own comments) — a jump target needs to clear BOTH this bar (once
// docked, sticky, sitting at the top) AND NavBar above it. Deliberately NOT
// just this bar's own rendered height — it also folds in NavBar's
// --navbar-h-max (its STABLE, hide-state-agnostic height, not the live
// --navbar-h this bar docks itself against). Reason: scrollIntoView()
// computes its destination once, from geometry at call time; a jump that
// scrolls UPWARD triggers NavBar's own "reveal on scroll-up" rule as the jump
// starts, so NavBar can end up visible again by the time the jump settles
// even though --navbar-h was 0 (hidden) at the moment it began — and this
// bar's own `top` follows --navbar-h too, so it would ALSO shift down to sit
// below the now-visible NavBar. Reserving against the stable max means the
// target always clears BOTH bars' worst case, never just their state at the
// instant the tap happened.
const rootRef = ref(null)
let ro = null
function reportHeight () {
  const ownHeight = rootRef.value?.offsetHeight ?? 0
  const navbarMax = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h-max')) || 0
  document.documentElement.style.setProperty('--nav-stack-h', (ownHeight + navbarMax) + 'px')
}
onMounted(() => {
  if (typeof ResizeObserver === 'undefined' || !rootRef.value) return
  ro = new ResizeObserver(reportHeight)
  ro.observe(rootRef.value)
  reportHeight()
  // NavBar's own ResizeObserver callback (which sets --navbar-h-max) is async
  // and may not have fired yet at this exact instant — re-read once more a
  // tick later so the first published value picks it up rather than 0.
  nextTick(reportHeight)
})
onBeforeUnmount(() => {
  ro?.disconnect()
  document.documentElement.style.removeProperty('--nav-stack-h')
})
</script>

<template>
  <nav
    ref="rootRef"
    class="nav-stack"
    :class="{ 'nav-stack--responsive': !isMobile }"
    aria-label="Catalogue"
  >
    <template v-if="presentation === 'flat'">
      <CategoryNav
        :tabs="flatTabs"
        :is-mobile="isMobile"
        :mode="mode"
        :active="mode === 'filter' ? activeSubcategoryId : undefined"
        variant="row"
        level="l3"
        @update:active="onFlatSelect"
      />
    </template>

    <template v-else>
      <CategoryNav
        :tabs="categoryTabs"
        :is-mobile="isMobile"
        mode="scroll"
        variant="row"
        level="l2"
      />
      <div v-if="subcategoryTabs.length > 1" class="nav-stack__l3-slot">
        <CategoryNav
          :tabs="subcategoryTabs"
          :is-mobile="isMobile"
          mode="scroll"
          variant="row"
          level="l3"
        />
      </div>
    </template>
  </nav>
</template>

<style scoped>
/* Mounted in NORMAL document flow (App.vue, right after Best Sellers) — a
   plain sibling of NavBar/StoryCarousel/etc. in the same scrolling content,
   NOT the DeviceFrame #overlay layer. `position: sticky` is what gives it the
   dock/undock behaviour: it sits at its natural in-flow position until the
   page scrolls past it, then sticks at `top: var(--navbar-h)` — same var,
   same transition, same reasoning CategoryNav's `variant="top"` used for the
   legacy subcategory bar. z-index sits below NavBar's (20) but above normal
   content, so it still layers correctly over whatever scrolls beneath it
   once docked.

   `max(…, var(--safe-top))`, NOT `var(--navbar-h)` alone: DeviceFrame renders
   a REAL status bar (time/icons) in the safe-top band, permanently — it never
   hides. --navbar-h reports 0 while NavBar is scroll-hidden, which would
   otherwise let this bar ride all the way up to the device screen's true
   top (y:0) and dock UNDERNEATH the status bar. Clamping to at least
   --safe-top means it never docks higher than just below the status bar,
   regardless of NavBar's hidden state. */
.nav-stack {
  position: sticky;
  top: max(var(--navbar-h, 0px), var(--safe-top, 0px));
  z-index: 10;
  transition: top var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
  border-bottom: var(--border-weight-default) solid var(--x-border-sheet);
  border-bottom-left-radius: var(--x-radius-container-xs);
  border-bottom-right-radius: var(--x-radius-container-xs);
  background-image: var(--x-bg-sheet);
  background-color: var(--x-bg-page);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
}
/* Tighter tab gap for this surface specifically — CategoryNav's own default
   (--x-gap-content-default) is shared by every other CategoryNav usage (the
   classic bottom/top sticky bars), so it's overridden here rather than in
   CategoryNav.vue itself to avoid touching those. */
.nav-stack :deep(.cat-nav__list) {
  gap: var(--x-gap-content-narrow);
}
/* Responsive (no device frame): sticks below the fixed DeviceToolbar too —
   same offset cat-nav--top used, just via sticky instead of fixed.
   --safe-top is unset in responsive mode (no device frame, no status bar),
   so the max() here is a no-op — kept only for symmetry with the framed rule. */
.nav-stack--responsive {
  top: max(calc(var(--toolbar-h, 0px) + var(--navbar-h, 0px)), var(--safe-top, 0px));
}

.nav-stack__l3-slot {
  /* Only rendered when the in-view category has an L3 to show (see the
     v-if above) — a category with none (e.g. gifts, best-sellers) collapses
     this to nothing rather than leaving an empty reserved bar. min-height
     here just keeps multi-subcategory categories' L3 row a consistent size
     as their own tab count/label length varies. */
  min-height: var(--x-size-control-s);
}

/* ── L1 ↔ L2 mount/unmount (App.vue's <Transition name="nav-stack">) ─────────
   Fires when switching L1 intents flips isStoreIntentActive — this whole
   surface mounts (Store) or unmounts (Milestone Rewards/Events, which have no
   L2/L3 to navigate). Fade + a short rise/drop rather than CategoryNav's
   fixed-overlay full slide-off-screen: this bar is `position: sticky`, in
   normal flow, so leave keeps its layout space reserved for the animation's
   duration (Vue's default Transition behaviour) while enter's space is
   already reserved the instant it mounts — a short local translate reads as
   the bar settling into that space, not a purely instant pop. */
.nav-stack-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate),
              transform var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.nav-stack-leave-active {
  transition: opacity var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate),
              transform var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate);
}
.nav-stack-enter-from,
.nav-stack-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
