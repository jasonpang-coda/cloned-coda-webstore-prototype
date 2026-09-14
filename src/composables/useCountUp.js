import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

/**
 * useCountUp — animates a number from 0 to `target` once on mount (or
 * whenever `target` changes), via a requestAnimationFrame easeOutCubic tween.
 * No CSS transition/animation is involved, so it needs its own
 * prefers-reduced-motion guard (same matchMedia pattern StoryCarousel.vue
 * uses) rather than relying on reduced-motion.css's blanket rule.
 *
 * Usage: const { value } = useCountUp(computed(() => props.target), 2800)
 */
export function useCountUp(target, duration = 2800) {
  const value = ref(0)
  const reduceMotion = ref(false)
  let mq = null
  let raf = null

  function onMq(e) { reduceMotion.value = e.matches }

  function run() {
    if (raf) cancelAnimationFrame(raf)
    const to = Number(target.value) || 0
    if (reduceMotion.value) {
      value.value = to
      return
    }
    const start = performance.now()
    function tick(now) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      value.value = Math.round(eased * to)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  onMounted(() => {
    if (typeof matchMedia !== 'undefined') {
      mq = matchMedia('(prefers-reduced-motion: reduce)')
      reduceMotion.value = mq.matches
      mq.addEventListener?.('change', onMq)
    }
    run()
  })
  watch(target, run)
  onBeforeUnmount(() => {
    mq?.removeEventListener?.('change', onMq)
    if (raf) cancelAnimationFrame(raf)
  })

  return { value }
}
