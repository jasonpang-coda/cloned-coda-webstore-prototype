import { ref, computed, onBeforeUnmount } from 'vue'

/**
 * useResizablePanel — drag-to-resize + collapse-to-rail for a tool-page
 * sidebar. Direct transliteration of useDragScroll.js's pointer/rAF/cleanup
 * shape (scrollLeft -> width): pointerdown on the resize handle attaches
 * pointermove/pointerup on `document` (NOT setPointerCapture — same reason
 * as useDragScroll: capture re-targets pointerup to the capturing element
 * even for a child click, which would swallow clicks on the sidebar's own
 * nav/rail buttons), filtered by pointerId so simultaneous pointers behave.
 * An rAF loop batches the actual width write once per frame (avoids layout
 * thrash) and writes it IMPERATIVELY (elRef.value.style.width) during the
 * drag rather than through the reactive `width` ref, so the sidebar's own
 * list/content doesn't re-render on every pointermove.
 *
 * No momentum/coast (unlike useDragScroll) — a panel must stop exactly
 * where the pointer released, not keep drifting.
 *
 * Collapse/expand is a discrete state change (rail width <-> minWidth is a
 * fixed gap with no valid width in between), so it can't be tracked 1:1 with
 * the pointer the way a plain resize can. Crossing that boundary — whether
 * by drag, the toggle button, keyboard Enter/Space, or the reset dblclick —
 * always hands off to a real eased width transition (see `settle` below)
 * instead of teleporting, using an accelerate/exit curve for collapsing and
 * a decelerate/entrance curve for expanding, per this repo's motion system
 * (`web-store-motion`: ease-in for permanent exits, ease-out for entrances).
 * The transition is driven entirely in JS (inline `el.style.transition`,
 * cleared once it settles) rather than a CSS class, so every trigger path
 * gets the identical curve and nothing fights Vue's own reactive style
 * binding mid-animation.
 *
 * Written with ZERO repo-specific imports (Vue only) so it can be moved
 * verbatim into packages/harness-kit/src/vue/ in Phase 2 of this feature
 * without any rewrite.
 *
 * @param {import('vue').Ref<HTMLElement|null>} elRef  the sidebar element
 * @param {object} opts
 * @param {number} [opts.minWidth=176]   drag floor before the rail snap zone
 * @param {number} [opts.maxWidth]       drag ceiling — REQUIRED, pass the page's
 *                                        current fixed width so it can never grow
 *                                        past what it is today
 * @param {number} [opts.railWidth=48]   standardized collapsed width
 * @param {string|null} [opts.storageKey=null]  localStorage key for width+collapsed
 *                                        persistence; null disables persistence
 * @param {number} [opts.step=16]        px per arrow-key nudge
 * @returns {{
 *   width: import('vue').Ref<number>,
 *   collapsed: import('vue').Ref<boolean>,
 *   isResizing: import('vue').Ref<boolean>,
 *   panelWidth: import('vue').ComputedRef<number>,
 *   panelStyle: import('vue').ComputedRef<{width: string}>,
 *   handleProps: import('vue').ComputedRef<object>,
 *   startResize: (e: PointerEvent) => void,
 *   onHandleKeydown: (e: KeyboardEvent) => void,
 *   resetWidth: () => void,
 *   toggle: () => void,
 *   expand: () => void,
 *   collapse: () => void,
 *   stop: () => void,
 * }}
 */

// Collapsing reads as a permanent exit (accelerate/ease-in); expanding reads
// as an entrance (decelerate/ease-out) — durations mirror this repo's real
// --x-motion-sys-duration-exit (200ms) / -base (250ms) tokens even though
// these dev-chrome pages don't consume --x-* tokens directly.
const COLLAPSE_MOTION = { duration: 200, easing: 'cubic-bezier(0.4, 0, 1, 1)' }
const EXPAND_MOTION = { duration: 250, easing: 'cubic-bezier(0, 0, 0.2, 1)' }
// Small keyboard nudges are an on-screen move, not a state change — standard easing.
const NUDGE_MOTION = { duration: 150, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }

export function useResizablePanel(elRef, opts = {}) {
  const {
    minWidth = 176,
    maxWidth,
    railWidth = 48,
    storageKey = null,
    step = 16,
  } = opts
  if (typeof maxWidth !== 'number') {
    throw new Error('useResizablePanel: maxWidth is required (pass the page\'s current fixed width)')
  }

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)) }

  function loadPersisted() {
    if (!storageKey) return null
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (typeof parsed?.w !== 'number') return null
      return { w: clamp(parsed.w, minWidth, maxWidth), c: !!parsed.c }
    } catch { return null }
  }

  function persist() {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ w: width.value, c: collapsed.value }))
    } catch { /* Safari private mode, quota, etc. — non-fatal */ }
  }

  const restored = loadPersisted()
  const width = ref(restored?.w ?? maxWidth)
  const collapsed = ref(restored?.c ?? false)
  const isResizing = ref(false)

  const panelWidth = computed(() => (collapsed.value ? railWidth : width.value))
  const panelStyle = computed(() => ({ width: panelWidth.value + 'px' }))
  const handleProps = computed(() => ({
    role: 'separator',
    'aria-orientation': 'vertical',
    tabindex: 0,
    'aria-label': 'Resize sidebar',
    'aria-valuemin': minWidth,
    'aria-valuemax': maxWidth,
    'aria-valuenow': collapsed.value ? railWidth : width.value,
  }))

  // ── eased width transitions (own every trigger path — drag-crossing,
  // toggle, keyboard, reset — so the motion is identical regardless of how
  // the state change was triggered) ───────────────────────────────────────
  let settleToken = 0

  function animateWidth(el, fromPx, toPx, { duration, easing }) {
    return new Promise((resolve) => {
      if (Math.abs(fromPx - toPx) < 0.5) { resolve(); return }
      el.style.transition = `width ${duration}ms ${easing}`
      el.style.width = fromPx + 'px'
      void el.offsetWidth // force layout so the browser registers fromPx as the start
      el.style.width = toPx + 'px'
      let done = false
      const timeoutId = setTimeout(finish, duration + 50) // safety net if transitionend never fires
      function finish() {
        if (done) return
        done = true
        el.removeEventListener('transitionend', onEnd)
        clearTimeout(timeoutId)
        el.style.transition = ''
        resolve()
      }
      function onEnd(e) { if (e.propertyName === 'width') finish() }
      el.addEventListener('transitionend', onEnd)
    })
  }

  // toCollapsed: target state. explicitWidth: only for expand paths that
  // also change the resting width (resetWidth, or expanding off a drag
  // crossing which rests at minWidth) — omit to keep width.value as-is.
  function settle(toCollapsed, explicitWidth) {
    const el = elRef.value
    const myToken = ++settleToken
    const toPx = toCollapsed ? railWidth : (explicitWidth ?? width.value)
    const fromPx = el ? el.getBoundingClientRect().width : toPx
    collapsed.value = toCollapsed
    if (!toCollapsed && explicitWidth != null) width.value = explicitWidth
    persist()
    if (!el) return
    animateWidth(el, fromPx, toPx, toCollapsed ? COLLAPSE_MOTION : EXPAND_MOTION).then(() => {
      if (myToken !== settleToken) return // superseded by a newer settle/stop
      // Leave el.style.width at toPx (don't clear it) — it already matches
      // what the reactive panelStyle binding would render. Clearing it here
      // would race Vue's own patch, which already fired synchronously back
      // when collapsed/width were assigned above, long before this promise
      // resolves; clearing after that point wins the race and blanks the
      // style entirely (Vue has no reason to re-patch an unchanged binding).
      if (isResizing.value) {
        // Pointer is still down (this settle was a mid-drag crossing) —
        // resume tracking. Deliberately DON'T rebase startW/startX to the
        // just-settled position: startW/startX (set once at pointerdown)
        // already encode a continuous mapping from pointer position to
        // width for the whole gesture. Resuming with them intact means the
        // very next frame reflects wherever the pointer *actually* is now
        // (it kept moving during the ~200-250ms transition) rather than
        // freezing the gesture's progress at the moment the crossing was
        // first detected. Rebasing here was tried and caused two bugs: the
        // resumed baseline landing exactly on the inclusive collapse
        // threshold (self-retriggering with zero pointer movement), and —
        // more subtly — discarding real mouse movement that happened while
        // the settle animation was still playing.
        dragRaf = requestAnimationFrame(dragFrame)
      }
    })
  }

  function expand() { settle(false) }
  function collapse() { settle(true) }
  function toggle() { collapsed.value ? expand() : collapse() }
  function resetWidth() { settle(false, maxWidth) }

  // ── drag state ─────────────────────────────────────────────────────────
  let startX = 0
  let startW = 0
  let pointerX = 0
  let willCollapse = false
  let activeId = null
  let dragRaf = 0

  function cancelDragRaf() { if (dragRaf) { cancelAnimationFrame(dragRaf); dragRaf = 0 } }

  function removeDocListeners() {
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerUp)
  }

  function stop() {
    settleToken++ // invalidate any in-flight settle so its .then() is a no-op
    cancelDragRaf()
    removeDocListeners()
    document.body.classList.remove('is-resizing-panel')
    const el = elRef.value
    if (el) { el.style.width = ''; el.style.transition = '' }
    isResizing.value = false
  }

  // ── pointerdown on the handle (bound via startResize in the template) ──
  function startResize(e) {
    if (e.pointerType === 'touch') return // handle is hidden on the mobile stacked layout anyway
    if (e.button !== 0) return
    const el = elRef.value
    if (!el) return
    e.preventDefault()
    el.style.transition = '' // defensive — a settle() from a prior interaction should have cleared this already
    isResizing.value = true
    willCollapse = collapsed.value
    activeId = e.pointerId
    startX = pointerX = e.clientX
    startW = collapsed.value ? railWidth : width.value
    // pointermove/pointerup go on the document (not setPointerCapture) so a
    // fast drag that leaves the handle's bounds still tracks, without
    // re-targeting pointerup and breaking clicks on nearby buttons.
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerUp)
    document.body.classList.add('is-resizing-panel')
    dragRaf = requestAnimationFrame(dragFrame)
  }

  function onPointerMove(e) {
    if (e.pointerId !== activeId) return
    pointerX = e.clientX
    // No preventDefault here — text selection is blocked by the
    // .is-resizing-panel body class (user-select:none), not by intercepting
    // the move event itself (avoids passive-listener warnings).
  }

  function dragFrame() {
    if (!isResizing.value) return
    const el = elRef.value
    if (!el) return
    const raw = startW + (pointerX - startX)
    const next = clamp(raw, minWidth, maxWidth)
    const nowCollapse = next <= minWidth
    if (nowCollapse !== willCollapse) {
      // Crossing the rail/expanded boundary — there's no valid width between
      // railWidth and minWidth, so don't teleport: cancel raw tracking and
      // let settle() ease across the gap. It resumes live tracking on its
      // own once the transition finishes, if the pointer is still down.
      willCollapse = nowCollapse
      cancelDragRaf()
      settle(nowCollapse, nowCollapse ? undefined : minWidth)
      return
    }
    el.style.width = (willCollapse ? railWidth : next) + 'px'
    dragRaf = requestAnimationFrame(dragFrame)
  }

  function onPointerUp(e) {
    if (e.pointerId !== activeId) return
    if (!isResizing.value) return
    activeId = null
    cancelDragRaf()
    removeDocListeners()
    document.body.classList.remove('is-resizing-panel')
    if (!willCollapse) {
      // Never crossed into collapse this drag — commit the live-tracked width.
      // (If it did cross, settle() already committed collapsed/width state.)
      const el = elRef.value
      if (el) el.style.width = ''
      width.value = clamp(startW + (pointerX - startX), minWidth, maxWidth)
      persist()
    }
    isResizing.value = false
  }

  // ── keyboard on the handle ───────────────────────────────────────────────
  function nudge(nextWidth) {
    const el = elRef.value
    const fromPx = el ? el.getBoundingClientRect().width : nextWidth
    width.value = clamp(nextWidth, minWidth, maxWidth)
    persist()
    // Don't clear el.style.width when this resolves — same reasoning as
    // settle(): it already equals width.value, and clearing after the fact
    // would race (and lose to) Vue's own patch from the assignment above.
    if (el) animateWidth(el, fromPx, width.value, NUDGE_MOTION)
  }

  function onHandleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); return }
    if (collapsed.value) return // arrow/Home/End only meaningful while expanded
    if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(width.value - step); return }
    if (e.key === 'ArrowRight') { e.preventDefault(); nudge(width.value + step); return }
    if (e.key === 'Home') { e.preventDefault(); nudge(minWidth); return }
    if (e.key === 'End') { e.preventDefault(); nudge(maxWidth) }
  }

  onBeforeUnmount(stop)

  return {
    width, collapsed, isResizing, panelWidth, panelStyle, handleProps,
    startResize, onHandleKeydown, resetWidth, toggle, expand, collapse, stop,
  }
}
