<script setup>
/**
 * BestSellerFxTimeline — scrubs the §2.2 mount-entrance sequence (the one true
 * sequential choreography in this handoff; the ring/bloom/shimmer are perpetual
 * loops with independent periods, not a beat sequence — their live durations are
 * already visible as chips in the TokenSandbox above, so they aren't forced into
 * this timeline).
 *
 * Beat positions are read live from --motion-sys-duration-slow, so editing that
 * slider above reshapes this timeline too.
 */
import { computed, onMounted, ref } from 'vue'
import { getToken, parseDuration } from '../utils/tokens.js'

const DURATION = ref(350)
onMounted(() => {
  DURATION.value = parseDuration(getToken('--motion-sys-duration-slow')) || 350
})

const beats = computed(() => [
  { ms: 0, label: 'mount-pending — invisible, offset 6px' },
  { ms: DURATION.value, label: 'settled — opaque, at rest' },
])

// Pure function of ms — no reactive scrubMs, no RAF here (BeatTimeline owns that).
function opacity(ms) { return Math.min(ms / DURATION.value, 1) }
function offsetPx(ms) { return 6 * (1 - Math.min(ms / DURATION.value, 1)) }
function phaseLabel(ms) {
  if (ms <= 0) return 'mount-pending'
  if (ms >= DURATION.value) return 'settled'
  return 'entering'
}
</script>

<template>
  <BeatTimeline :beats="beats" :range="DURATION">
    <template #default="{ ms }">
      <div class="tl-stage">
        <div
          class="tl-card"
          :style="{ opacity: opacity(ms), transform: `translateY(${offsetPx(ms)}px)` }"
        >
          <span class="tl-card__label">{{ phaseLabel(ms) }}</span>
        </div>
      </div>
    </template>
  </BeatTimeline>
</template>

<style scoped>
.tl-stage { display: grid; place-items: center; height: 96px; width: 100%; }
.tl-card {
  width: 160px;
  height: 64px;
  border-radius: var(--radius-container-s, 8px);
  border-top: 1px solid var(--border-warm);
  border-left: 1px solid var(--border-warm);
  background: var(--gradient-bestseller-hero);
  display: grid;
  place-items: center;
}
.tl-card__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-header-default, #fff);
  letter-spacing: 0.04em;
}
</style>
