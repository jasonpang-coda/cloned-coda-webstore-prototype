/**
 * v-ripple — click-point ripple effect for interactive elements.
 *
 * Usage: add `v-ripple` to any button or clickable div. The directive
 * adds the `fx-ripple` class (position:relative, overflow:hidden,
 * isolation:isolate — defined in effects.css) and attaches a pointerdown
 * handler that spawns a `.fx-ripple__wave` span sized and centred on the
 * tap/click point. The wave animates via the `ripple` keyframe (keyframes.css)
 * and self-removes once done.
 *
 * Colour: set `--x-fx-ripple-color` on the element (or in its CSS rule).
 * The project-wide default `rgba(255, 255, 255, 0.14)` lives in style.css.
 * Override locally for light surfaces, e.g. the yellow checkout CTA uses
 * `--x-fx-ripple-color: rgba(0, 0, 0, 0.15)`.
 *
 * Reduced motion: the wave is still appended but its animation is collapsed
 * to 0ms globally by reduced-motion.css, so the class appears and disappears
 * instantly — no residual element, no visible motion.
 */

function spawnWave(el, e) {
  const rect = el.getBoundingClientRect()
  // Diameter = 2 × max side. At scale(2.5) the wave reaches every corner
  // of the button from any click point, even worst-case corner taps.
  const d = Math.max(el.offsetWidth, el.offsetHeight) * 2
  const x = e.clientX - rect.left - d / 2
  const y = e.clientY - rect.top  - d / 2

  const wave = document.createElement('span')
  wave.className = 'fx-ripple__wave'
  // Set position + pointer-events inline so they are guaranteed before the
  // browser's first layout pass — flex / grid containers would otherwise treat
  // the span as an in-flow item for one frame before the CSS rule applies,
  // causing a visible height jump (repro: PC channel cards in CheckoutSheet).
  wave.style.cssText =
    `position:absolute;pointer-events:none;` +
    `width:${d}px;height:${d}px;left:${x}px;top:${y}px`
  el.appendChild(wave)

  // Read the resolved animation-duration from the wave itself (handles any
  // future changes to --x-motion-ripple without touching this file).
  // getComputedStyle returns seconds ("0.35s"); parseFloat * 1000 → ms.
  const dur = parseFloat(getComputedStyle(wave).animationDuration) * 1000 || 400
  setTimeout(() => wave.remove(), dur + 50)
}

export const vRipple = {
  mounted(el) {
    el.classList.add('fx-ripple')
    el._rippleHandler = (e) => spawnWave(el, e)
    el.addEventListener('pointerdown', el._rippleHandler)
  },
  unmounted(el) {
    el.removeEventListener('pointerdown', el._rippleHandler)
    delete el._rippleHandler
  },
}
