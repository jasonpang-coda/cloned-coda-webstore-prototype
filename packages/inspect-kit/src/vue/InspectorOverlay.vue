<script setup>
/**
 * InspectorOverlay — capture + highlight layer for the inspector (dev chrome).
 *
 * Mount this at the host app's ROOT (not nested inside a scaled/clipped
 * container) — the overlay is `position:fixed`, and a transformed ancestor
 * would trap it. The overlay itself is pointer-events:none; instead we
 * intercept interaction with DOCUMENT-LEVEL capture-phase listeners that
 * swallow click/mousedown on demo elements before their own handlers fire.
 * This blocks the demo while:
 *   • leaving the host's own chrome (config.chromeSelectors) + the inspector
 *     panel fully interactive,
 *   • leaving wheel/touch scroll untouched (you can scroll to inspect lower
 *     content),
 *   • leaving every CSS animation playing (we never set pointer-events:none
 *     on the demo, so hover/entrance keyframes keep running).
 *
 * Hovering highlights the element under the cursor; clicking selects it (→
 * useInspector.select → InspectorPanel). Esc is two-stage: closes the spec
 * panel (deselect) first if one is open, then exits inspection mode on a
 * second Esc with nothing selected.
 *
 * Also renders: a box-model overlay (margin/padding strips, à la Figma) and
 * a URL-hash deep-link (#inspect=<selector>) so a selection is shareable.
 */
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useInspector } from './useInspector.js'
import { useTokenMap } from './useTokenMap.js'
import { getConfig } from './config.js'
import { describeNode, elementSelector, computeGapStrips, computeDistanceTo } from '../core/inspect.js'
import InspectorPanel from './InspectorPanel.vue'

defineProps({ device: { type: String, default: 'none' } })

const config = getConfig()
const tokens = useTokenMap()
const { active, selected, showBoxModel, select, close } = useInspector()

const hovered = ref(null)
const altHeld = ref(false)
const tick = ref(0) // bumped on scroll/resize so highlight rects recompute

// Targets that must stay interactive (and never be highlighted/selected).
function isChrome (el) {
  return !el || !el.closest || !!el.closest(config.chromeSelectors)
}

function rectStyle (el) {
  if (!el) return { display: 'none' }
  void tick.value // reactive dependency
  const r = el.getBoundingClientRect()
  return {
    transform: `translate(${r.left}px, ${r.top}px)`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  }
}
const hoverStyle = computed(() => rectStyle(hovered.value && hovered.value !== selected.value ? hovered.value : null))
const selStyle   = computed(() => rectStyle(selected.value))

// Label chip anchored to the top-left corner of the selection box.
// Flips inside the box when the element is within 24px of the viewport top.
const selLabel = computed(() => selected.value ? describeNode(selected.value) : '')
const labelStyle = computed(() => {
  if (!selected.value) return { display: 'none' }
  void tick.value
  const r = selected.value.getBoundingClientRect()
  const CHIP_H = 20
  const top = r.top > CHIP_H + 4 ? r.top - CHIP_H - 2 : r.top + 4
  return { transform: `translate(${r.left}px, ${top}px)` }
})

// ── box-model strips ──────────────────────────────────────────────────────
const boxStrips = computed(() => {
  if (!showBoxModel.value || !selected.value) return []
  void tick.value
  const el = selected.value
  const rect = el.getBoundingClientRect()
  const cs   = getComputedStyle(el)
  const px   = (v) => parseFloat(v) || 0
  const mt = px(cs.marginTop), mr = px(cs.marginRight), mb = px(cs.marginBottom), ml = px(cs.marginLeft)
  const pt = px(cs.paddingTop), pr = px(cs.paddingRight), pb = px(cs.paddingBottom), pl = px(cs.paddingLeft)
  const strips = []

  // Margin strips (orange, outside the element rect)
  if (mt > 0) strips.push({ kind: 'm', top: rect.top - mt,      left: rect.left - ml, w: rect.width + ml + mr, h: mt })
  if (mr > 0) strips.push({ kind: 'm', top: rect.top - mt,      left: rect.right,     w: mr,                   h: rect.height + mt + mb })
  if (mb > 0) strips.push({ kind: 'm', top: rect.bottom,        left: rect.left - ml, w: rect.width + ml + mr, h: mb })
  if (ml > 0) strips.push({ kind: 'm', top: rect.top,           left: rect.left - ml, w: ml,                   h: rect.height })

  // Padding strips (teal, inside the element rect)
  if (pt > 0) strips.push({ kind: 'p', top: rect.top,           left: rect.left,      w: rect.width,           h: pt })
  if (pr > 0) strips.push({ kind: 'p', top: rect.top,           left: rect.right - pr,w: pr,                   h: rect.height })
  if (pb > 0) strips.push({ kind: 'p', top: rect.bottom - pb,   left: rect.left,      w: rect.width,           h: pb })
  if (pl > 0) strips.push({ kind: 'p', top: rect.top,           left: rect.left,      w: pl,                   h: rect.height })

  return strips
})
function stripStyle (s) {
  return { transform: `translate(${s.left}px, ${s.top}px)`, width: `${s.w}px`, height: `${s.h}px` }
}

// ── gap strips (auto) + Alt-hover distance measurement ──────────────────────
// Figma-style redlines, in a colour distinct from the margin/padding box
// model above. Gap strips preview off whatever's HOVERED (so a dev can sweep
// across containers without clicking), falling back to the selection once the
// pointer leaves the stage so the panel doesn't go blank. Distance-to-sibling
// only appears while Alt/Option is held, mirroring the modifier-gated
// convention design tools use — otherwise every hover would paint a redline
// and the signal would be constant noise instead of an on-demand measurement.
const gapTarget = computed(() => hovered.value || selected.value)
const gapStrips = computed(() => {
  if (!gapTarget.value) return []
  void tick.value
  return computeGapStrips(gapTarget.value, tokens)
})
const distanceStrip = computed(() => {
  if (!altHeld.value || !selected.value || !hovered.value) return null
  void tick.value
  return computeDistanceTo(selected.value, hovered.value, tokens)
})
function gapStripStyle (s) {
  return { transform: `translate(${s.left}px, ${s.top}px)`, width: `${s.w}px`, height: `${s.h}px` }
}
// Label anchored to the strip's midpoint, flipped to read horizontally
// regardless of the gap's own axis (a vertical strip's label still reads
// left-to-right, just centred in the strip instead of alongside it).
function gapLabelStyle (s) {
  const cx = s.left + s.w / 2
  const cy = s.top + s.h / 2
  return { transform: `translate(${cx}px, ${cy}px) translate(-50%, -50%)` }
}

// ── interaction blocking (capture phase, before the demo's own handlers) ───────
function swallow (e) {
  if (isChrome(e.target)) return // chrome + panel keep working
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation?.()
}
function onClick (e) {
  if (isChrome(e.target)) return
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation?.()
  select(e.target)
}
function onMove (e) {
  hovered.value = isChrome(e.target) ? null : e.target
  altHeld.value = e.altKey
}
function onScroll () { tick.value++ }
// Esc is two-stage: with the spec panel open (an element selected), the
// first Esc just closes the panel (deselect) — matching how Esc is used
// everywhere else in this app to dismiss the topmost open surface, not
// necessarily to exit the whole mode. Only Esc with NOTHING selected exits
// inspect mode entirely.
function onKey (e) {
  if (e.key === 'Alt') altHeld.value = true
  if (e.key !== 'Escape') return
  e.preventDefault()
  if (selected.value) select(null)
  else close()
}
// Alt can be released while the pointer isn't moving (e.g. tabbed away and
// back) — a dedicated keyup, rather than relying on the next pointermove's
// e.altKey, keeps the distance strip from getting stuck on.
function onKeyUp (e) {
  if (e.key === 'Alt') altHeld.value = false
}

function bind (on) {
  const fn = on ? 'addEventListener' : 'removeEventListener'
  // capture phase so we intercept before the host's own delegated handlers
  document[fn]('click',       onClick,  true)
  document[fn]('mousedown',   swallow,  true)
  document[fn]('mouseup',     swallow,  true)
  document[fn]('pointerdown', swallow,  true)
  document[fn]('contextmenu', swallow,  true)
  document[fn]('pointermove', onMove,   true)
  window[fn]('scroll',  onScroll, true)
  window[fn]('resize',  onScroll, true)
  window[fn]('keydown', onKey,    true)
  window[fn]('keyup',   onKeyUp,  true)
}

// ── URL-hash deep-link ────────────────────────────────────────────────────
// Keeps #inspect=<selector> in sync with the current selection so the URL is
// always shareable. On inspector open, tries to restore a prior selection
// from the hash (e.g. after navigating to a shared link).

const HASH_PREFIX = '#inspect='

function writeHash (el) {
  const sel = el ? elementSelector(el, config.screenRoot) : null
  if (sel) {
    history.replaceState(null, '', `${HASH_PREFIX}${encodeURIComponent(sel)}`)
  } else if (window.location.hash.startsWith(HASH_PREFIX)) {
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}

function restoreFromHash () {
  if (!window.location.hash.startsWith(HASH_PREFIX)) return
  const sel = decodeURIComponent(window.location.hash.slice(HASH_PREFIX.length))
  if (!sel) return
  requestAnimationFrame(() => {
    const screen = document.querySelector(config.screenRoot)
    if (!screen) return
    try {
      const found = screen.querySelector(sel)
      if (found) select(found)
    } catch { /* invalid selector — hash may be from a different build */ }
  })
}

watch(selected, (el) => { if (active.value) writeHash(el) })

watch(active, (on) => {
  bind(on)
  if (on) {
    restoreFromHash()
  } else {
    hovered.value = null
    writeHash(null) // clear hash on exit
  }
})
onBeforeUnmount(() => { if (active.value) bind(false) })
</script>

<template>
  <div v-if="active" class="inspector">
    <!-- Hover + selection highlight boxes -->
    <div class="inspector__box inspector__box--hover" :style="hoverStyle" />
    <div class="inspector__box inspector__box--sel"   :style="selStyle" />
    <div v-if="selLabel" class="inspector__label" :style="labelStyle">{{ selLabel }}</div>

    <!-- Box-model overlay -->
    <div
      v-for="(s, i) in boxStrips" :key="i"
      class="inspector__strip"
      :class="`inspector__strip--${s.kind}`"
      :style="stripStyle(s)"
    />

    <!-- Gap redlines — the hovered (or, absent a hover, the selected) flex/grid
         container's `gap`, always on while that container is in view. -->
    <template v-for="(s, i) in gapStrips" :key="`gap-${i}`">
      <div class="inspector__gap" :style="gapStripStyle(s)" />
      <div class="inspector__gap-label" :style="gapLabelStyle(s)">
        {{ s.token ? `var(${s.token}) · ${s.px}` : s.px }}
      </div>
    </template>

    <!-- Distance-to-hovered-sibling — only while Alt/Option is held, so a
         plain hover never paints an extra redline (see gapTarget/distanceStrip
         comment above). -->
    <template v-if="distanceStrip">
      <div class="inspector__gap inspector__gap--distance" :style="gapStripStyle(distanceStrip)" />
      <div class="inspector__gap-label inspector__gap-label--distance" :style="gapLabelStyle(distanceStrip)">
        {{ distanceStrip.token ? `var(${distanceStrip.token}) · ${distanceStrip.px}` : distanceStrip.px }}
      </div>
    </template>

    <div v-if="!selected" class="inspector__hint">
      <strong>Inspecting</strong> · click an element · hold <kbd>Alt</kbd> over a sibling to measure · <kbd>Esc</kbd> to exit
    </div>

    <InspectorPanel :device="device" />
  </div>
</template>

<style scoped>
/* Root is non-blocking: interaction is intercepted at the document level so the
   page can still scroll and animate. Children that need input opt back in. */
.inspector {
  position: fixed;
  inset: 0;
  z-index: 9000; /* above typical toolbar/overlay chrome */
  pointer-events: none;
}

/* Highlight boxes — visual only, positioned in viewport coords via transform. */
.inspector__box {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  will-change: transform;
}
/*
 * Figma-style blue — hardcoded so it is store-agnostic and theme-agnostic.
 * #1C6FEB sits at roughly 50% lightness in OKLCH: legible against both dark
 * and light surfaces. The 8–10% tint fill is light enough to never obscure
 * content in either mode.
 */
.inspector__box--hover {
  outline: 1px dashed rgba(28, 111, 235, 0.65);
  background: rgba(28, 111, 235, 0.08);
}
.inspector__box--sel {
  outline: 2px solid #1c6feb;
  background: rgba(28, 111, 235, 0.08);
}

/* Element name chip — same Figma blue, always white text, readable on any bg. */
.inspector__label {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  white-space: nowrap;
  background: #1c6feb;
  color: #fff;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 3px;
  letter-spacing: 0.2px;
}

/* Box-model strips */
.inspector__strip {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  will-change: transform;
}
.inspector__strip--m { background: rgba(255, 150, 50, 0.35); }   /* margin = orange */
.inspector__strip--p { background: rgba(50, 210, 180, 0.35); }   /* padding = teal */

/* Gap/distance redlines — hot pink/red, deliberately distinct from the
   margin (orange) / padding (teal) box-model strips above, matching the
   "red measurement line" convention design tools use for spacing. */
.inspector__gap {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  will-change: transform;
  background: repeating-linear-gradient(
    135deg,
    rgba(255, 45, 85, 0.45) 0 4px,
    rgba(255, 45, 85, 0.2) 4px 8px
  );
  outline: 1px solid rgba(255, 45, 85, 0.65);
}
.inspector__gap--distance {
  background: rgba(255, 45, 85, 0.28);
  outline: 1px dashed #ff2d55;
}
.inspector__gap-label {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  white-space: nowrap;
  background: #ff2d55;
  color: #fff;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  padding: 3px 5px;
  border-radius: 3px;
  letter-spacing: 0.2px;
}
.inspector__gap-label--distance { background: #d6003c; }

.inspector__hint {
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  pointer-events: none;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.82);
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  letter-spacing: 0.2px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
.inspector__hint kbd {
  display: inline-block;
  padding: 0 5px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  font: inherit;
  font-size: 11px;
}
</style>
