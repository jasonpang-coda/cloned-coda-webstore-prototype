<script setup>
/**
 * BeatTimeline — RAF scrub/play timeline harness. Ported from the standalone
 * handoff kit (extracted there from the signin/carousel choreography demos);
 * logic untouched, chrome reskinned onto DS tokens.
 *
 * Props:
 *   beats — [{ ms, label }] markers; clicking one jumps the playhead to it.
 *   range — total timeline length in ms.
 *   step  — scrub slider resolution.
 *
 * Default slot (the stage) receives { ms, progress } — render the feature's
 * visual state for that moment as a pure function of ms.
 */
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

function clamp (ms) { return Math.max(0, Math.min(ms, props.range)) }

function onScrub (e) {
  playing.value = false
  cancelAnimation()
  scrubMs.value = clamp(Number(e.target.value))
}

function togglePlay () {
  if (playing.value) { playing.value = false; cancelAnimation(); return }
  playing.value = true
  playFrom = scrubMs.value >= props.range ? 0 : scrubMs.value
  playStart = null
  rafId = requestAnimationFrame(tick)
}

function tick (now) {
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

function cancelAnimation () {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  playStart = null
}

function jumpTo (ms) { playing.value = false; cancelAnimation(); scrubMs.value = clamp(ms) }

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
        <select v-model.number="speed" class="beats__select">
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
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-s);
  padding: var(--x-pad-surface-m);
  background: var(--x-bg-card-default);
}
.beats__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--x-gap-content-default);
  margin-bottom: var(--x-gap-content-default);
}
.beats__btn {
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-m);
  border-radius: var(--x-radius-control-s);
  border: var(--border-weight-action) solid var(--x-text-hyperlink-default);
  background: var(--x-text-hyperlink-default);
  color: var(--x-text-body-inverse);
  font-weight: var(--x-sys-weight-bold);
  font-size: var(--x-sys-size-body-s);
  cursor: pointer;
}
.beats__speed {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  font-size: var(--x-sys-size-body-s);
  color: var(--x-text-body-soft);
}
.beats__select {
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-xs);
  border-radius: var(--x-radius-control-xs);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-page);
  color: var(--x-text-body-default);
}
.beats__time {
  font-family: monospace;
  font-size: var(--x-sys-size-body-s);
  color: var(--x-text-body-subtle);
  margin-left: auto;
}
.beats__stage {
  display: flex;
  justify-content: center;
  margin-bottom: var(--x-gap-content-default);
}
.beats__track-wrap { position: relative; height: 48px; margin-bottom: var(--x-gap-content-narrow); }
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
  gap: var(--x-gap-content-tight);
}
.beats__marker-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-text-hyperlink-default);
  border: 2px solid var(--x-bg-card-default);
}
.beats__marker-label { font-size: var(--x-sys-size-body-s); color: var(--x-text-body-subtle); white-space: nowrap; }
.beats__active { font-size: var(--x-sys-size-body-s); margin: 0; color: var(--x-text-body-soft); }
</style>
