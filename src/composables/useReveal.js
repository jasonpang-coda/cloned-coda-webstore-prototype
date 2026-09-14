import { onMounted, onBeforeUnmount } from 'vue'

/**
 * useReveal — scroll-triggered entrance choreography for the Codashop visual
 * homepage (HomeVisual.vue). An IntersectionObserver adds `is-in` to any
 * `[data-reveal]` descendant of the given root once it's ~15% into view;
 * children carrying `[data-reveal-child]` get a staggered
 * `--reveal-index`-based delay (see the CSS custom property below) so a
 * group of cards/lines cascades in rather than popping together — Disney's
 * "follow-through" principle applied to entrance timing.
 *
 * Honors prefers-reduced-motion: when set, every observed element is marked
 * `is-in` immediately and no observer is created, matching StoryCarousel's
 * own reduced-motion pattern (content still appears, just without motion).
 *
 * The CSS itself lives in each component's <style scoped> (opacity/transform
 * on `[data-reveal]`, gated by `.is-in` — see HomeVisual's section styles);
 * this composable only toggles the class.
 *
 * @param {import('vue').Ref<HTMLElement|null>} rootRef
 */
export function useReveal (rootRef) {
  let observer = null
  let mq = null

  function markAllVisible (root) {
    root.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.setProperty('--reveal-index', String(i % 8))
      el.classList.add('is-in')
    })
  }

  function start () {
    const root = rootRef.value
    if (!root) return

    const prefersReduced = typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      markAllVisible(root)
      return
    }

    const targets = root.querySelectorAll('[data-reveal]')
    targets.forEach((el, i) => el.style.setProperty('--reveal-index', String(i % 8)))

    if (typeof IntersectionObserver === 'undefined') {
      // No IO support — fail open rather than leaving content invisible.
      markAllVisible(root)
      return
    }

    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })

    targets.forEach(el => observer.observe(el))
  }

  onMounted(() => {
    if (typeof matchMedia !== 'undefined') {
      mq = matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener?.('change', (e) => {
        if (e.matches && rootRef.value) markAllVisible(rootRef.value)
      })
    }
    // Wait a tick so v-if/v-for content is in the DOM before observing.
    requestAnimationFrame(start)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    mq = null
  })
}
