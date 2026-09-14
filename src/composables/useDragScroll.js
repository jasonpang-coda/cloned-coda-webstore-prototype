import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * useDragScroll — click-and-drag horizontal scrolling for a scroll container,
 * tuned to feel good with a mouse. Touch devices keep their native pan-x
 * momentum (this shim ignores `pointerType: 'touch'`).
 *
 * Why document-level pointermove/pointerup (not setPointerCapture):
 *   `setPointerCapture` routes the *pointerup* event to the capturing element
 *   even when the user only tapped a child button — browser sees pointerdown on
 *   the button but pointerup on the list, so it never fires a `click` on the
 *   button. Carousel cards and nav tabs become unresponsive.
 *
 *   Listening to pointermove/pointerup on `document` instead gives us fast-drag
 *   reliability (events arrive even when the cursor leaves the element) without
 *   breaking click events on children. We filter by pointerId to handle multiple
 *   simultaneous pointers correctly.
 *
 *   Native image-drag is suppressed with a `dragstart` handler on the element.
 *   Text selection is suppressed by `user-select:none` via the `.is-dragging`
 *   class (CSS, not preventDefault on pointermove — avoids passive listener
 *   warnings and touch-compatibility issues).
 *
 * Mechanics: pointermove only records the cursor x; a rAF loop writes scrollLeft
 * once per frame (batched, no thrash) and tracks an EMA velocity so a flick
 * coasts on release with frame-rate-independent friction.
 *
 * @param {import('vue').Ref<HTMLElement|null>} elRef  the scroll container ref
 * @param {object}   [opts]
 * @param {boolean}  [opts.momentum=true]    coast after a flick
 * @param {number}   [opts.threshold=6]      px of movement before it counts as a drag (suppresses the click)
 * @param {Function} [opts.onScroll]         called after each programmatic scrollLeft write (refresh edge state)
 * @returns {{ isDragging: import('vue').Ref<boolean>, stop: () => void }}
 */
export function useDragScroll(elRef, opts = {}) {
  const { momentum = true, threshold = 6, onScroll } = opts

  const isDragging = ref(false)
  let startX = 0          // cursor x at grab
  let startSL = 0         // scrollLeft at grab
  let pointerX = 0        // latest cursor x
  let velocity = 0        // px/ms, EMA-smoothed
  let lastSL = 0
  let lastT = 0
  let dragRaf = 0
  let momentumRaf = 0
  let moved = false       // crossed the drag threshold → suppress the click
  let activeId = null     // which pointer we are tracking

  const now = () => performance.now()
  const prefersReduced = () =>
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches

  function cancelDragRaf() { if (dragRaf) { cancelAnimationFrame(dragRaf); dragRaf = 0 } }
  function cancelMomentum() { if (momentumRaf) { cancelAnimationFrame(momentumRaf); momentumRaf = 0 } }

  function removeDocListeners() {
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerUp)
  }

  // Public: kill any in-flight drag/coast (e.g. when a chevron takes over).
  function stop() {
    cancelDragRaf()
    cancelMomentum()
    removeDocListeners()
    const el = elRef.value
    if (el) el.style.scrollBehavior = ''
  }

  // ── pointerdown on the element ────────────────────────────────────────────
  function onPointerDown(e) {
    if (e.pointerType === 'touch') return // native pan-x handles touch
    if (e.button !== 0) return            // left button only
    const el = elRef.value
    if (!el) return
    cancelMomentum()
    isDragging.value = true
    moved = false
    activeId = e.pointerId
    startX = pointerX = e.clientX
    startSL = lastSL = el.scrollLeft
    lastT = now()
    velocity = 0
    el.style.scrollBehavior = 'auto' // we write scrollLeft per-frame; no CSS smoothing
    // pointermove and pointerup go on the document so fast swipes that leave the
    // element boundary still track, without needing setPointerCapture (which
    // breaks child click events by re-targeting pointerup to the container).
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerUp)
    dragRaf = requestAnimationFrame(dragFrame)
  }

  // ── pointermove on document ───────────────────────────────────────────────
  function onPointerMove(e) {
    if (e.pointerId !== activeId) return
    pointerX = e.clientX
    // No preventDefault here — text selection is blocked by `user-select:none`
    // on the .is-dragging class; calling preventDefault on a document-level
    // listener causes passive-listener warnings and breaks scroll on some browsers.
  }

  // ── rAF: apply position + track velocity ─────────────────────────────────
  function dragFrame() {
    if (!isDragging.value) return
    const el = elRef.value
    if (!el) return
    el.scrollLeft = startSL - (pointerX - startX) // 1:1 follow (auto-clamped at edges)
    if (Math.abs(pointerX - startX) > threshold) moved = true
    const t = now()
    const dt = t - lastT || 16.67
    velocity += ((el.scrollLeft - lastSL) / dt - velocity) * 0.35 // EMA
    lastSL = el.scrollLeft
    lastT = t
    onScroll?.()
    dragRaf = requestAnimationFrame(dragFrame)
  }

  // ── pointerup/cancel on document ─────────────────────────────────────────
  function onPointerUp(e) {
    if (e.pointerId !== activeId) return
    if (!isDragging.value) return
    isDragging.value = false
    activeId = null
    cancelDragRaf()
    removeDocListeners()
    const el = elRef.value
    if (momentum && !prefersReduced() && Math.abs(velocity) > 0.015) startMomentum()
    else if (el) { el.style.scrollBehavior = ''; onScroll?.() }
  }

  function startMomentum() {
    const el = elRef.value
    if (!el) return
    const FRICTION = 0.96 // gentle decay → long, smooth glide
    let last = now()
    const step = () => {
      const t = now()
      const dt = t - last || 16.67
      last = t
      el.scrollLeft += velocity * dt
      velocity *= Math.pow(FRICTION, dt / 16.67) // frame-rate independent
      onScroll?.()
      const atEdge = el.scrollLeft <= 0 || el.scrollLeft + el.clientWidth >= el.scrollWidth - 0.5
      if (Math.abs(velocity) < 0.01 || atEdge) {
        cancelMomentum()
        el.style.scrollBehavior = ''
        return
      }
      momentumRaf = requestAnimationFrame(step)
    }
    momentumRaf = requestAnimationFrame(step)
  }

  // ── click suppression (capture phase on the element) ─────────────────────
  // If the pointer moved past the threshold it was a drag, not a tap — swallow
  // the trailing click so a drag-scroll never opens a card or fires a tab.
  function onClickCapture(e) {
    if (moved) {
      e.stopPropagation()
      e.preventDefault()
      moved = false
    }
  }

  // Stop the browser starting a native image/link drag.
  function onDragStart(e) { e.preventDefault() }

  onMounted(() => {
    const el = elRef.value
    if (!el) return
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('click', onClickCapture, true) // capture phase
    el.addEventListener('dragstart', onDragStart)
  })

  onBeforeUnmount(() => {
    stop()
    const el = elRef.value
    if (!el) return
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('click', onClickCapture, true)
    el.removeEventListener('dragstart', onDragStart)
  })

  return { isDragging, stop }
}
