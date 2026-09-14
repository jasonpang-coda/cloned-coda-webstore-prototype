import { triggerHaptic } from '../composables/useHaptics.js'

/**
 * v-haptic — fire a haptic on pointerdown. Mirrors v-ripple's shape (same
 * event, same mount/unmount lifecycle). The directive ARG selects the semantic
 * token; default is 'press' (light).
 *
 *   v-haptic          → haptics.press  (light)
 *   v-haptic:chip     → haptics.chip   (light)
 *   v-haptic:confirm  → haptics.confirm (heavy)
 *
 * For gated or outcome-dependent feedback (SKU select behind the checkout gate,
 * sign-in success/error patterns) call useHaptics().haptic(...) in the handler
 * instead — the directive fires unconditionally on every press.
 */
export const vHaptic = {
  mounted(el, binding) {
    const token = binding.arg || 'press'
    el._hapticHandler = () => triggerHaptic(token)
    el.addEventListener('pointerdown', el._hapticHandler)
  },
  unmounted(el) {
    el.removeEventListener('pointerdown', el._hapticHandler)
    delete el._hapticHandler
  },
}
