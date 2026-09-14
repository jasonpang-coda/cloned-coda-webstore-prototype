<script setup>
// GENERIC kit component — RAF scrub/play timeline harness (extracted from the
// signin ChoreographyTimeline / carousel SlideCycleTimeline, which shared ~80%
// of this chrome).
//
// Props:
//   beats — [{ ms, label }] markers; clicking one jumps the playhead to it.
//   range — total timeline length in ms.
//   step  — scrub slider resolution.
//
// Default slot (the stage) receives { ms, progress } — render the feature's
// visual state for that moment (opacity ramps, fills, swaps) as a pure
// function of ms. Playback is RAF-driven with a 0.25×–2× speed control.
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  beats: { type: Array, default: () => [] },
  range: { type: Number, required: true },
  step: { type: Number, default: 50 },
})

const scrubMs = ref(0)
const playing = ref(false)
const speed = ref(1)
let rafId = null
let playStart = null
let playFrom = 0

const progress = computed(() => scrubMs.value / props.range)

const activeBeat = computed(() => {
  for (let i = props.beats.length - 1; i >= 0; i--) {
    if (scrubMs.value >= props.beats[i].ms) return props.beats[i]
  }
  return props.beats[0] ?? null
})

function clamp(ms) { return Math.max(0, Math.min(ms, props.range)) }

function onScrub(e) {
  playing.value = false
  cancelAnimation()
  scrubMs.value = clamp(Number(e.target.value))
}

function togglePlay() {
  if (playing.value) { playing.value = false; cancelAnimation(); return }
  playing.value = true
  playFrom = scrubMs.value >= props.range ? 0 : scrubMs.value
  playStart = null
  rafId = requestAnimationFrame(tick)
}

function tick(now) {
  if (!playStart) playStart = now
  const ms = playFrom + (now - playStart) * speed.value
  if (ms >= props.range) {
    scrubMs.value = props.range
    playing.value = false
    cancelAnimation()
    return
  }
  scrubMs.value = ms
  rafId = requestAnimationFrame(tick)
}

function cancelAnimation() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  playStart = null
}

function jumpTo(ms) { playing.value = false; cancelAnimation(); scrubMs.value = clamp(ms) }

// If the range shrinks below the playhead (e.g. interval token edited), re-clamp.
watch(() => props.range, () => { scrubMs.value = clamp(scrubMs.value) })

onUnmounted(cancelAnimation)

defineExpose({ jumpTo, togglePlay })
</script>

<template>
  <div class="beats">
    <div class="beats__controls">
      <button type="button" class="beats__btn" @click="togglePlay">{{ playing ? 'Pause' : 'Play' }}</button>
      <label class="beats__speed">
        Speed
        <select v-model.number="speed">
          <option :value="0.25">0.25×</option>
          <option :value="0.5">0.5×</option>
          <option :value="1">1×</option>
          <option :value="1.5">1.5×</option>
          <option :value="2">2×</option>
        </select>
      </label>
      <span class="beats__time">{{ Math.round(scrubMs) }}ms / {{ range }}ms</span>
    </div>

    <div class="beats__stage" v-if="$slots.default">
      <slot :ms="scrubMs" :progress="progress" />
    </div>

    <div class="beats__track-wrap">
      <input type="range" class="beats__scrub" min="0" :max="range" :step="step" :value="scrubMs" @input="onScrub" />
      <div class="beats__markers">
        <button
          v-for="beat in beats"
          :key="beat.ms"
          type="button"
          class="beats__marker"
          :style="{ left: `${(beat.ms / range) * 100}%` }"
          :title="beat.label"
          @click="jumpTo(beat.ms)"
        >
          <span class="beats__marker-dot" />
          <span class="beats__marker-label">{{ Math.round(beat.ms) }}ms</span>
        </button>
      </div>
    </div>

    <p class="beats__active" v-if="activeBeat"><strong>Active beat:</strong> {{ activeBeat.label }}</p>
  </div>
</template>

<style scoped>
.beats {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 16px;
  margin: 16px 0;
  background: var(--vp-c-bg-soft);
}
.beats__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.beats__btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #111;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}
.beats__speed { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--vp-c-text-2); }
.beats__speed select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.beats__time { font-family: var(--vp-font-family-mono); font-size: 12px; color: var(--vp-c-text-3); margin-left: auto; }
.beats__stage { display: flex; justify-content: center; margin-bottom: 16px; }
.beats__track-wrap { position: relative; height: 48px; margin-bottom: 12px; }
.beats__scrub { width: 100%; margin: 0; position: relative; z-index: 2; }
.beats__markers { position: absolute; inset: 0; pointer-events: none; }
.beats__marker {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.beats__marker-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--vp-c-brand-1); border: 2px solid var(--vp-c-bg); }
.beats__marker-label { font-size: 10px; color: var(--vp-c-text-3); white-space: nowrap; }
.beats__active { font-size: 13px; margin: 0; color: var(--vp-c-text-2); }
</style>
