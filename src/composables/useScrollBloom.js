import { onMounted, onBeforeUnmount, nextTick } from 'vue'

/**
 * useScrollBloom — scroll-LINKED (not reveal-once) "bloom in" progress for a
 * list of tiles, in the spirit of
 * https://codepen.io/argyleink/pen/wBMvNaN ("Scroll to bloom"), which drives
 * this purely with `animation-timeline: view()`. That CSS API doesn't
 * reliably establish a view-timeline in every mode this app runs in — the
 * device-frame's Responsive mode has NO fixed-height, actually-scrolling
 * `.device__screen` (see DeviceFrame.vue: `.device--none .device__screen`
 * is `height: auto`, so the real scroller is the window, not the screen),
 * while the framed iPhone/Android modes DO scroll `.device__screen`
 * internally. A single CSS timeline can't span both, so this recomputes
 * plain 0→1 progress per tile from `getBoundingClientRect()` — which is
 * correct in both cases as long as the right element's height is used as
 * the "viewport" — and writes it to `--bloom-progress` on each element for
 * the component's own CSS (`scale`/`rotate` via `calc()`) to consume.
 *
 * Continuously recomputed on scroll in EITHER context, so progress runs
 * back down (and the CSS un-blooms) when the user scrolls back up — this is
 * the fix for "doesn't show up after scrolling back up", which a reveal-once
 * IntersectionObserver (unobserve-after-first-hit) can never do.
 *
 * @param {import('vue').Ref<HTMLElement[]>} itemRefs — array ref of the tile elements (holes for unset indices are skipped)
 */
export function useScrollBloom (itemRefs) {
  let scrollEl = null   // the .device__screen ancestor, if it's the one actually scrolling
  let raf = 0
  let reduceMotion = false
  let mq = null

  function isActuallyScrolling (el) {
    return !!el && el.scrollHeight > el.clientHeight + 1
  }

  // The "viewport" to measure tiles against: the device screen's own visible
  // box when IT scrolls internally (framed modes), otherwise the window
  // (Responsive mode, where .device__screen is height:auto and the window
  // scrolls) — re-checked each tick since the user can switch device modes
  // (DeviceToolbar) at runtime without remounting this component.
  function getViewportRect () {
    if (isActuallyScrolling(scrollEl)) {
      const r = scrollEl.getBoundingClientRect()
      return { top: r.top, height: r.height }
    }
    return { top: 0, height: window.innerHeight }
  }

  function update () {
    const { top: vpTop, height: vpHeight } = getViewportRect()
    const enterStart = vpTop + vpHeight // tile top at the viewport's bottom edge = progress 0

    for (const el of itemRefs.value) {
      if (!el) continue
      const rect = el.getBoundingClientRect()
      // Span is relative to the TILE'S OWN height, not the viewport's — a
      // ~150px tile finishing blooming only after scrolling ~15% of a
      // ~700px viewport (105px) needs almost as much scroll as the tile is
      // tall, which reads as sluggish. Finishing after ~60% of the tile's
      // own height has scrolled by feels snappy regardless of viewport size,
      // and completes well before the tile is fully past the fold.
      const span = Math.max(1, rect.height * 0.6)
      const progress = (enterStart - rect.top) / span
      el.style.setProperty('--bloom-progress', String(Math.min(1, Math.max(0, progress))))
    }
  }

  function scheduleUpdate () {
    if (raf) return
    raf = requestAnimationFrame(() => { raf = 0; update() })
  }

  function setAllBloomed () {
    for (const el of itemRefs.value) el?.style.setProperty('--bloom-progress', '1')
  }

  function attachListeners () {
    scrollEl = itemRefs.value[0]?.closest('.device__screen') ?? null
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    scrollEl?.addEventListener('scroll', scheduleUpdate, { passive: true })
    scheduleUpdate()
  }
  function detachListeners () {
    window.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
    scrollEl?.removeEventListener('scroll', scheduleUpdate)
  }

  function onReduceChange (e) {
    reduceMotion = e.matches
    if (reduceMotion) { detachListeners(); setAllBloomed() }
    else attachListeners()
  }

  onMounted(() => {
    if (typeof matchMedia !== 'undefined') {
      mq = matchMedia('(prefers-reduced-motion: reduce)')
      reduceMotion = mq.matches
      mq.addEventListener?.('change', onReduceChange)
    }
    nextTick(() => {
      if (reduceMotion) setAllBloomed()
      else attachListeners()
    })
  })

  onBeforeUnmount(() => {
    detachListeners()
    if (raf) cancelAnimationFrame(raf)
    mq?.removeEventListener?.('change', onReduceChange)
  })
}
