<script setup>
/**
 * EasingCurve — plots a cubic-bezier token as an SVG curve with a playable dot.
 * Ported from the standalone handoff kit; logic untouched, chrome reskinned
 * onto DS tokens (see TokenChip.vue for why).
 */
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { parseBezier, pointsToSvgPath, sampleBezierCurve } from '../utils/bezier.js'
import { getToken } from '../utils/tokens.js'

const props = defineProps({
  token: { type: String, default: '--x-motion-sys-ease-decelerate' },
  duration: { type: Number, default: 350 },
  playing: { type: Boolean, default: false },
  progress: { type: Number, default: null },
  width: { type: Number, default: 280 },
  height: { type: Number, default: 160 },
})

const tokenRoot = inject('tokenRoot', null)
const easingValue = ref('')
const dotProgress = ref(0)
let rafId = null
let startTime = null

function refresh () {
  const el = tokenRoot?.value || document.documentElement
  easingValue.value = getToken(props.token, el)
}

const bezier = computed(() => parseBezier(easingValue.value))

const svgData = computed(() => {
  if (!bezier.value) return null
  const points = sampleBezierCurve(bezier.value)
  return pointsToSvgPath(points, props.width, props.height)
})

const dotPos = computed(() => {
  if (!bezier.value || !svgData.value) return { x: 12, y: props.height - 12 }
  const t = dotProgress.value
  const points = sampleBezierCurve(bezier.value, 200)
  const idx = Math.min(Math.floor(t * 200), 200)
  const p = points[idx]
  return svgData.value.toSvg(p)
})

function animate (now) {
  if (!startTime) startTime = now
  const elapsed = now - startTime
  dotProgress.value = Math.min(elapsed / props.duration, 1)
  if (dotProgress.value < 1) {
    rafId = requestAnimationFrame(animate)
  } else {
    startTime = null
  }
}

function startAnimation () {
  cancelAnimation()
  dotProgress.value = 0
  startTime = null
  rafId = requestAnimationFrame(animate)
}

function cancelAnimation () {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
}

watch(() => props.playing, (v) => { if (v) startAnimation() })
watch(() => props.progress, (v) => {
  if (v != null) {
    cancelAnimation()
    dotProgress.value = v
  }
})
watch(() => props.token, refresh)

onMounted(() => {
  refresh()
  if (props.playing) startAnimation()
})

onUnmounted(cancelAnimation)

defineExpose({ startAnimation, refresh })
</script>

<template>
  <div class="easing-curve">
    <div class="easing-curve__header">
      <code>{{ token }}</code>
      <span class="easing-curve__val">{{ easingValue || '—' }}</span>
    </div>
    <svg
      v-if="svgData"
      :width="width"
      :height="height"
      class="easing-curve__svg"
      role="img"
      :aria-label="`Easing curve for ${token}`"
    >
      <line :x1="12" :y1="height - 12" :x2="width - 12" :y2="12" class="easing-curve__diag" />
      <path :d="svgData.path" class="easing-curve__path" fill="none" />
      <template v-if="bezier">
        <circle
          :cx="12 + bezier.x1 * (width - 24)"
          :cy="height - 12 - bezier.y1 * (height - 24)"
          r="4" class="easing-curve__cp"
        />
        <circle
          :cx="12 + bezier.x2 * (width - 24)"
          :cy="height - 12 - bezier.y2 * (height - 24)"
          r="4" class="easing-curve__cp"
        />
      </template>
      <circle :cx="dotPos.x" :cy="dotPos.y" r="6" class="easing-curve__dot" />
    </svg>
    <p v-else class="easing-curve__fallback">{{ easingValue || 'No bezier data' }}</p>
  </div>
</template>

<style scoped>
.easing-curve {
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-s);
  padding: var(--x-pad-surface-s);
  background: var(--x-bg-card-default);
}
.easing-curve__header {
  display: flex;
  justify-content: space-between;
  gap: var(--x-gap-content-narrow);
  margin-bottom: var(--x-gap-content-narrow);
  font-size: var(--x-sys-size-body-s);
}
.easing-curve__header code {
  color: var(--x-text-hyperlink-default);
  font-family: monospace;
}
.easing-curve__val {
  color: var(--x-text-body-subtle);
  font-family: monospace;
  font-size: var(--x-sys-size-body-s);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.easing-curve__svg {
  display: block;
  width: 100%;
  max-width: 100%;
}
.easing-curve__diag {
  stroke: var(--x-border-card-default);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}
.easing-curve__path {
  stroke: var(--x-text-hyperlink-default);
  stroke-width: 2.5;
}
.easing-curve__cp {
  fill: var(--x-text-body-subtle);
  opacity: 0.6;
}
.easing-curve__dot {
  fill: var(--x-text-hyperlink-default);
}
.easing-curve__fallback {
  font-size: var(--x-sys-size-body-s);
  color: var(--x-text-body-subtle);
  margin: 0;
}
</style>
