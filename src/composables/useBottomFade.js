import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

/**
 * useBottomFade — tracks whether a scrollable element has more content below
 * the fold, for the bottom "scroll scrim" shown on modal/sheet bodies while
 * they overflow (hides once scrolled to the end, or if content never overflows).
 *
 * Self-binds to whatever DOM node `elRef` currently holds via `watch`, so it
 * works with elements that mount/unmount under a `v-if` (every sheet's root) —
 * call once per component, pass the scrollable body's template ref.
 */
export function useBottomFade (elRef) {
  const canScroll = ref(false)
  let clientH = 0
  let scrollH = 0
  let target = null
  let ro = null

  function measure () {
    if (!target) return
    clientH = target.clientHeight
    scrollH = target.scrollHeight
  }
  function update () {
    if (!target) return
    canScroll.value = target.scrollTop + clientH < scrollH - 1
  }
  function onScroll () { update() }

  function bind (el) {
    unbind()
    target = el
    if (!target) { canScroll.value = false; return }
    nextTick(() => { measure(); update() })
    target.addEventListener('scroll', onScroll, { passive: true })
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => { measure(); update() })
      ro.observe(target)
    }
  }
  function unbind () {
    target?.removeEventListener('scroll', onScroll)
    ro?.disconnect()
    ro = null
    target = null
  }

  watch(elRef, (el) => bind(el), { immediate: true })
  onBeforeUnmount(unbind)

  return { canScroll }
}
