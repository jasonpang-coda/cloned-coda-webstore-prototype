<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import MaterialIcon from './MaterialIcon.vue'

/**
 * FilterDropdown — generic select: a button trigger ("Input") + a frosted options
 * panel ("Options"/"Option") that drops in 12px below it (Figma 5677:49 / 5694:202).
 * Built for the Transaction History range filter; also the base for the combined
 * L2+L3 "breadcrumb" dropdown used by CatalogNavStack's `dropdown` presentation.
 *
 * The trigger keeps a static `label` (e.g. "Filter Transaction") by default; pass
 * `triggerLabel` to show something dynamic instead (e.g. a "Top Ups › FC Points"
 * breadcrumb) while `label` stays the accessible fallback name.
 *
 * Two option shapes, mutually exclusive:
 *   flat   (default) — `options: [{ key, label }]`, unchanged since introduction.
 *   grouped           — `groups: [{ label, options: [{ key, label }] }]` (e.g. one
 *                        group per category, its options = that category's
 *                        subcategories). `groups` wins when non-empty. No visible
 *                        header per group — a divider between groups is the only
 *                        separation (feedback: the parent category label read as
 *                        clutter); `group.label` still reaches assistive tech via
 *                        the group `<div>`'s own `aria-label`.
 * Either shape emits `update:modelValue` with the selected option's `key`.
 *
 * Motion (reuses existing motion tokens throughout, plus one new generic
 * --x-motion-control-press-scale for the trigger's own press feedback — see
 * motion.css):
 *   panel  — fade + drop-and-settle, --x-motion-dropdown (200ms ease-out) in /
 *            accelerate out; transform-origin top so it grows from the trigger.
 *   chevron — rotates 180° on open over --x-motion-dropdown.
 *   options — subtle staggered fade-in, stepped by --x-motion-sys-stagger-sm.
 *   trigger — hover AND keyboard focus both apply --x-surface-frost-hover (the
 *             same wash .filter-dropdown__option:hover already uses — no
 *             separate focus-ring token); active adds a subtle press-scale.
 * prefers-reduced-motion is collapsed globally (reduced-motion.css).
 */
const props = defineProps({
  /** Selected option key */
  modelValue: { type: [String, Number], default: null },
  /** [{ key, label }] — flat option list (default shape) */
  options: { type: Array, default: () => [] },
  /** [{ label, options: [{ key, label }] }] — grouped shape; wins over `options` when non-empty */
  groups: { type: Array, default: () => [] },
  /** Static trigger text (stays put while an option is selected, per Figma) */
  label: { type: String, default: 'Filter' },
  /** Dynamic trigger text (e.g. a breadcrumb path) — falls back to `label` when unset */
  triggerLabel: { type: String, default: null },
  /** Panel backdrop-filter blur radius override, in px (default: FilterDropdown's
   *  own 32px). Passed explicitly rather than via a scoped CSS override — once
   *  teleported (see below), a consumer's `:deep()` selector can no longer reach
   *  the panel, since it is no longer a DOM descendant of that consumer at all. */
  panelBlur: { type: Number, default: null },
  /** false renders the panel's background-color transparent, so its blur is
   *  actually visible through it — the default `--x-bg-page` fill is opaque,
   *  which fully hides backdrop-filter no matter how high the blur radius is.
   *  Same "can't reach it once teleported" reasoning as panelBlur above. */
  panelOpaque: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const hasGroups = computed(() => props.groups.length > 0)

const open = ref(false)
const root = ref(null)
const triggerRef = ref(null)
const panelRef = ref(null)

function toggle() { open.value = !open.value }
function close()  { open.value = false }
function select(key) {
  emit('update:modelValue', key)
  close()
}

function onKey(e) {
  if (e.key === 'Escape') close()
}
function onPointerDown(e) {
  // panelRef check matters once teleported (see below) — the panel is no
  // longer a DOM descendant of `root` then, so root.contains() alone would
  // treat every click inside the panel itself as "outside" and close before
  // the option's own @click can register the selection.
  if (root.value?.contains(e.target)) return
  if (panelRef.value?.contains(e.target)) return
  close()
}

// ── Teleport target + position ───────────────────────────────────────────
// The panel is deeply nested inside page content in some call sites (e.g.
// CategoryJumpNav inside FCM's split-layout storefront) where — for reasons
// that resisted every targeted fix (raising z-index to the maximum possible
// value included) — it can lose real stacking/hit-testing against later,
// unrelated page content (observed: a footer button underneath it silently
// received real clicks meant for an option). Teleporting into the app's own
// dedicated overlay layer (`.device__overlay` — the same layer drawers,
// sheets, and toasts already use) sidesteps whatever in that nested chain
// causes it, rather than trying to out-z-index it. Falls back to rendering
// in place (Teleport `disabled`) wherever that layer doesn't exist — e.g. a
// bare component-library/harness preview with no DeviceFrame.
const overlayTarget = ref(null)
const teleportDisabled = computed(() => !overlayTarget.value)
const pos = ref({ top: 0, left: 0, width: 0 })

// Combines the JS-computed position (teleported only) with panelBlur/
// panelOpaque (either way — a consumer wants these regardless of whether
// teleporting actually happened, e.g. the harness fallback).
const panelStyle = computed(() => ({
  ...(teleportDisabled.value ? {} : { top: pos.value.top + 'px', left: pos.value.left + 'px', width: pos.value.width + 'px' }),
  ...(props.panelBlur != null ? { '--x-blur-container': props.panelBlur + 'px' } : {}),
  ...(props.panelOpaque === false ? { backgroundColor: 'transparent' } : {}),
}))

// getBoundingClientRect() reports POST-transform (visually scaled) pixels,
// but a position:absolute element's own top/left are resolved in its
// containing block's LOCAL (pre-scale) space — the device mockup is scaled
// down via a CSS transform (useDeviceScale.js) to fit the window, so a plain
// rect-delta would place the panel too far off once that scale is below 1.
// Comparing the overlay's own rendered width against its layout width
// (offsetWidth, untouched by transform) gives the current factor without
// needing to reach into DeviceFrame's private scale ref.
function scaleFactorOf(el) {
  if (!el || !el.offsetWidth) return 1
  return el.getBoundingClientRect().width / el.offsetWidth
}

function updatePosition() {
  const overlay = overlayTarget.value
  const trigger = triggerRef.value
  if (!overlay || !trigger) return
  const triggerRect = trigger.getBoundingClientRect()
  const overlayRect = overlay.getBoundingClientRect()
  const scale = scaleFactorOf(overlay)
  // --x-gap-content-loose is a custom-property STRING (e.g. "12px"), not a
  // layout measurement — reading it is unaffected by the transform scale
  // above, so it's already in the same local units pos.top needs.
  const gap = parseFloat(getComputedStyle(trigger).getPropertyValue('--x-gap-content-loose')) || 0
  pos.value = {
    top: (triggerRect.bottom - overlayRect.top) / scale + gap,
    left: (triggerRect.left - overlayRect.left) / scale,
    width: triggerRect.width / scale,
  }
}

// Closes on scroll rather than continuously repositioning — the trigger's
// on-screen position keeps changing as the underlying page content scrolls
// (the overlay layer itself does not scroll with it), and a stale-position
// open panel is worse than just dismissing it, same as most popovers.
function onScroll() { close() }

watch(open, (isOpen) => {
  if (isOpen) {
    overlayTarget.value = document.querySelector('.device__overlay')
    if (overlayTarget.value) nextTick(updatePosition)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', updatePosition)
    document.querySelector('.device__screen')?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    // Defer the outside-tap listener a tick so the opening click doesn't close it.
    nextTick(() => document.addEventListener('pointerdown', onPointerDown))
  } else {
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', updatePosition)
    document.querySelector('.device__screen')?.removeEventListener('scroll', onScroll)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('pointerdown', onPointerDown)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', updatePosition)
  document.querySelector('.device__screen')?.removeEventListener('scroll', onScroll)
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <div ref="root" class="filter-dropdown">
    <button
      ref="triggerRef"
      type="button"
      class="filter-dropdown__trigger"
      :class="{ 'is-open': open }"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span class="filter-dropdown__label text-style-utility-label-uppercase">{{ triggerLabel ?? label }}</span>
      <MaterialIcon class="filter-dropdown__chevron" name="expand_more" :size="20" />
    </button>

    <!-- Teleported into the app's overlay layer (see script comment above) —
         `disabled` falls back to rendering in place wherever that layer
         doesn't exist (e.g. a bare harness preview with no DeviceFrame).
         :duration pins Vue to a fixed 200ms timer (matching --x-motion-dropdown's
         own duration below) instead of its default behaviour of waiting for the
         browser's transitionend event to remove the enter/leave classes. That
         event can fail to fire (observed: a backgrounded/non-visible tab can
         suspend transitionend delivery), which otherwise leaves the panel
         stuck mid-transition forever — invisible (opacity still at its
         enter-from 0) yet still positioned/interactive, so a tap on an
         "invisible" option silently falls through to whatever real content
         sits underneath it instead. -->
    <Teleport :to="overlayTarget" :disabled="teleportDisabled">
    <Transition name="dropdown" :duration="200">
      <!-- Grouped shape (e.g. one group per category, options = its subcategories) -->
      <div
        v-if="open && hasGroups"
        ref="panelRef"
        class="filter-dropdown__panel"
        :style="panelStyle"
        role="listbox"
      >
        <div v-for="group in groups" :key="group.label" class="filter-dropdown__group" role="group" :aria-label="group.label">
          <div
            v-for="(opt, i) in group.options"
            :key="opt.key"
            class="filter-dropdown__option"
            :class="{ 'is-selected': opt.key === modelValue }"
            :style="{ '--opt-delay': `calc(${i} * var(--x-motion-sys-stagger-sm))` }"
            role="option"
            :aria-selected="opt.key === modelValue"
            @click="select(opt.key)"
          >
            <span class="filter-dropdown__option-label text-style-utility-default-regular">{{ opt.label }}</span>
            <MaterialIcon v-if="opt.key === modelValue" class="filter-dropdown__check" name="check" :size="20" />
          </div>
        </div>
      </div>
      <!-- Flat shape (default — unchanged since introduction) -->
      <ul
        v-else-if="open"
        ref="panelRef"
        class="filter-dropdown__panel"
        :style="panelStyle"
        role="listbox"
      >
        <li
          v-for="(opt, i) in options"
          :key="opt.key"
          class="filter-dropdown__option"
          :class="{ 'is-selected': opt.key === modelValue }"
          :style="{ '--opt-delay': `calc(${i} * var(--x-motion-sys-stagger-sm))` }"
          role="option"
          :aria-selected="opt.key === modelValue"
          @click="select(opt.key)"
        >
          <span class="filter-dropdown__option-label text-style-utility-default-regular">{{ opt.label }}</span>
          <MaterialIcon v-if="opt.key === modelValue" class="filter-dropdown__check" name="check" :size="20" />
        </li>
      </ul>
    </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.filter-dropdown {
  position: relative;
  display: inline-block;
}

/* ── Trigger ("Input") ─────────────────────────────────────────────────────── */
.filter-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--x-gap-content-default);
  width: var(--dropdown-w, 200px);
  max-width: 100%;
  height: var(--x-size-input-m);
  padding: 0 var(--x-pad-surface-m);
  border: var(--border-weight-default) solid var(--x-border-action-tertiary);
  border-radius: var(--x-radius-control-s);
  background: var(--x-bg-input-default);
  color: var(--x-text-header-default);
  cursor: pointer;
  transition: background var(--x-motion-hover), transform var(--x-motion-press);
}
/* Hover + keyboard focus share the same treatment — the same frost-hover
   wash the options panel's own rows already use (.filter-dropdown__option:
   hover above), rather than a separate focus-ring token. outline: none is
   deliberate here since this background change IS the focus indicator. */
.filter-dropdown__trigger:hover,
.filter-dropdown__trigger:focus-visible {
  background: var(--x-surface-frost-hover);
  outline: none;
}
.filter-dropdown__trigger:active {
  background: var(--x-surface-frost-hover);
  transform: scale(var(--x-motion-control-press-scale));
}
.filter-dropdown__label {
  min-width: 0;
  color: var(--x-text-header-default);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.filter-dropdown__chevron {
  flex-shrink: 0;
  transition: transform var(--x-motion-dropdown);
}
.filter-dropdown__trigger.is-open .filter-dropdown__chevron {
  transform: rotate(180deg);
}

/* ── Options panel ─────────────────────────────────────────────────────────── */
.filter-dropdown__panel {
  position: absolute;
  top: calc(100% + var(--x-gap-content-loose)); /* 12px below the trigger — overridden by an inline top/left/width (panelStyle) once teleported into .device__overlay */
  left: 0;
  width: var(--dropdown-w, 200px);
  max-width: 100%;
  max-height: 60vh;
  overflow-y: auto;
  z-index: 1; /* overlays the list below; also clears .device__overlay's own low-numbered children (CategoryNav/drawer/loader/snackbar/checkout — see web-store-fe) once teleported there */
  /* .device__overlay (its containing block once teleported) sets pointer-events:
     none at the container level so it doesn't block taps to page content behind
     it wherever nothing is open — this is this panel's own opt-back-in. */
  pointer-events: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  border: var(--border-weight-default) solid var(--x-border-sheet);
  border-radius: var(--x-radius-container-xs);
  background-image: var(--x-bg-sheet);
  background-color: var(--x-bg-page);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  box-shadow: var(--x-shadow-sheet);
  transform-origin: top;
}

/* ── Grouped shape — a divider between groups, no visible label (see the
   component docstring — group.label stays accessible via the group's own
   aria-label, just no longer rendered as text) ────────────────────────── */
.filter-dropdown__group + .filter-dropdown__group {
  border-top: var(--border-weight-default) solid var(--x-border-divider);
}

.filter-dropdown__option {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-m);
  color: var(--x-text-body-default);
  cursor: pointer;
  /* Subtle staggered fade-in; delay stepped per-row via --opt-delay (inline). */
  animation-name: dropdown-option-enter;
  animation-duration: var(--x-motion-sys-duration-base);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: both;
  animation-delay: var(--opt-delay, 0ms);
}
.filter-dropdown__option:hover {
  background: var(--x-surface-frost-hover);
}
.filter-dropdown__option.is-selected {
  background: var(--x-bg-card-selected);
}
.filter-dropdown__option-label {
  flex: 1 1 0;
  min-width: 0;
  color: var(--x-text-body-default);
}
.filter-dropdown__check {
  flex-shrink: 0;
  color: var(--x-text-hyperlink-default);
}

@keyframes dropdown-option-enter {
  from { opacity: 0; transform: translateY(calc(-1 * var(--x-motion-sys-distance-sm))); }
  to   { opacity: 1; transform: none; }
}

/* ── Panel open/close (group) — decelerate in, accelerate out ───────────────── */
.dropdown-enter-active {
  transition: opacity var(--x-motion-dropdown), transform var(--x-motion-dropdown);
}
.dropdown-leave-active {
  transition:
    opacity var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate),
    transform var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--x-motion-sys-distance-sm))) scale(0.98);
}
</style>
