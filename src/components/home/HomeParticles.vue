<script setup>
import { ref, onMounted } from 'vue'
import { useScrollParticles } from '../../composables/useScrollParticles.js'

/**
 * HomeParticles — ambient, scroll-reactive particle background for the
 * Codashop visual homepage (HomeVisual.vue). Sits behind all content as a
 * decorative canvas layer; see useScrollParticles.js for the simulation
 * itself (reduced-motion gating, rAF lifecycle, scroll-velocity reaction).
 *
 * Colours are read from the active theme's own motion/effect tokens
 * (--x-hdr-glow / --x-hdr-hot / --x-text-hyperlink-default) via getComputedStyle,
 * NOT hardcoded — canvas fillStyle can't consume a live var() reference, so
 * this resolves them once per mount/theme-repaint instead of hand-picking a
 * literal colour (keeps the effect on-brand across any store that ever
 * reuses HomeVisual, per the whitelabel token-discipline rule).
 *
 * Positioned absolute within HomeVisual's own `position: relative` root —
 * NOT position: fixed, which the device-frame overlay model forbids outside
 * the #overlay slot (see the FE skill's "Overlays & the device frame"
 * section) — so it scrolls out with the homepage content rather than
 * pinning across the whole device screen.
 */
const canvasRef = ref(null)
const scrollElRef = ref(null)
const colors = ref([])

onMounted(() => {
  scrollElRef.value = canvasRef.value?.closest('.device__screen') ?? null
  const style = getComputedStyle(document.documentElement)
  const glow = style.getPropertyValue('--x-hdr-glow').trim()
  const hot = style.getPropertyValue('--x-hdr-hot').trim()
  const link = style.getPropertyValue('--x-text-hyperlink-default').trim()
  colors.value = [glow, hot, link].filter(Boolean)
})

// A getter, not a plain value — this onMounted above and useScrollParticles's
// own internal onMounted (registered next, so it runs after this one) both
// fire during the same mount pass, but `colors.value` is only populated
// once THIS hook runs. A getter lets seed() (called from the composable's
// onMounted) read the now-current value instead of the empty array `colors`
// held at setup time, when this options object would otherwise be captured.
useScrollParticles(canvasRef, scrollElRef, {
  get colors () { return colors.value.length ? colors.value : undefined },
})
</script>

<template>
  <canvas ref="canvasRef" class="home-particles" aria-hidden="true"></canvas>
</template>

<style scoped>
.home-particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
