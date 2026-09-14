import { ref, onMounted, onUnmounted, watch } from 'vue'

/**
 * useDeviceScale — scales a fixed-size device mockup down so it fits the
 * available window height. `transform: scale()` does not change layout width,
 * so the device screen's container-query breakpoints still see its true CSS
 * width (440 / 384). Returns a reactive `scale` (1 when it already fits or
 * when there is no frame).
 *
 * @param {() => number} getDeviceHeight  total device height incl. bezels (px)
 * @param {() => boolean} isFramed         whether a frame is active
 * @param {import('vue').Ref<HTMLElement|null>} [frameRootRef]  root element of
 *   the device mockup — while an input inside it is focused, recompute is
 *   skipped (see below).
 */
export function useDeviceScale(getDeviceHeight, isFramed, frameRootRef) {
  const scale = ref(1)
  const BREATHING_ROOM = 24 // px, beyond the toolbar's own live height
  const RESIZE_DEBOUNCE = 120 // ms — coalesce rapid resize events

  // DeviceToolbar publishes its OWN live height here (ResizeObserver — grows
  // with expanded rows, shrinks when collapsed) and fires a `resize` event
  // whenever it changes. Reading it live (instead of a fixed guess) is what
  // guarantees the device mockup + toolbar never together exceed the window:
  // a fixed margin under-reserves whenever the toolbar has more rows than
  // that guess assumed, which leaves the pair taller than the viewport and
  // forces the OUTER page to become scrollable — and once that's possible,
  // an in-app `scrollIntoView()` (e.g. jumping to a tapped nav category)
  // cascades up through every scrollable ancestor, including that outer
  // page, sliding the whole device mockup up behind the (sticky) toolbar.
  function toolbarHeight() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--toolbar-h')
    return parseFloat(v) || 0
  }

  // On-screen keyboards shrink window.innerHeight on many mobile browsers,
  // which would otherwise re-scale (visibly shift) the whole device mockup
  // every time the user taps into a text field (sign-in, promo code, search).
  // Skip recompute while focus is inside the frame; onFocusChange below
  // re-checks once focus leaves, so a genuine resize during typing still
  // applies once the keyboard closes.
  function isTypingInFrame() {
    const root = frameRootRef?.value
    if (!root) return false
    const active = document.activeElement
    return !!active && root.contains(active) &&
      (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)
  }

  function recompute() {
    if (!isFramed()) {
      scale.value = 1
      return
    }
    if (isTypingInFrame()) return
    const deviceH = getDeviceHeight()
    const avail = window.innerHeight - toolbarHeight() - BREATHING_ROOM
    scale.value = deviceH > avail ? Math.max(0.4, avail / deviceH) : 1
  }

  let debounceTimer = null
  function onDeferredRecompute() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(recompute, RESIZE_DEBOUNCE)
  }

  onMounted(() => {
    recompute()
    window.addEventListener('resize', onDeferredRecompute)
    // capture: focus/blur don't bubble, so listen on the capture phase.
    document.addEventListener('focusin', onDeferredRecompute, true)
    document.addEventListener('focusout', onDeferredRecompute, true)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', onDeferredRecompute)
    document.removeEventListener('focusin', onDeferredRecompute, true)
    document.removeEventListener('focusout', onDeferredRecompute, true)
    clearTimeout(debounceTimer)
  })

  // Recompute when the framed/device inputs change
  watch([() => getDeviceHeight(), () => isFramed()], recompute)

  return { scale, recompute }
}
