<script setup>
import { computed, onUnmounted, ref } from 'vue'
import SurfaceDemo from './SurfaceDemo.vue'

const TOTAL_MS = 10500

const beats = [
  { ms: 0, label: 'Sheet dismiss + loader fade-in', surfaces: ['loader'] },
  { ms: 5000, label: 'signedIn — loader out + navbar swap', surfaces: ['loader', 'nav-auth'] },
  { ms: 5500, label: '+500ms pause → snackbar spring', surfaces: ['snackbar'] },
  { ms: 10500, label: 'Snackbar drop exit', surfaces: ['snackbar'] },
]

const scrubMs = ref(0)
const playing = ref(false)
const speed = ref(1)
const loaderRef = ref(null)
const navRef = ref(null)
const snackbarRef = ref(null)

let rafId = null
let playStart = null
let playFrom = 0

const progress = computed(() => (scrubMs.value / TOTAL_MS) * 100)

const activeBeat = computed(() => {
  for (let i = beats.length - 1; i >= 0; i--) {
    if (scrubMs.value >= beats[i].ms) return beats[i]
  }
  return beats[0]
})

function applyStateAt(ms) {
  scrubMs.value = Math.max(0, Math.min(ms, TOTAL_MS))

  if (ms >= 0 && ms < 5000) loaderRef.value?.show()
  else loaderRef.value?.dismiss()

  if (ms >= 5000) navRef.value?.show()
  else navRef.value?.dismiss()

  if (ms >= 5500 && ms < 10500) snackbarRef.value?.show()
  else snackbarRef.value?.dismiss()
}

function onScrub(e) {
  playing.value = false
  cancelAnimation()
  const val = Number(e.target.value)
  applyStateAt(val)
}

function togglePlay() {
  if (playing.value) {
    playing.value = false
    cancelAnimation()
    return
  }
  playing.value = true
  playFrom = scrubMs.value >= TOTAL_MS ? 0 : scrubMs.value
  playStart = null
  rafId = requestAnimationFrame(tick)
}

function tick(now) {
  if (!playStart) playStart = now
  const elapsed = (now - playStart) * speed.value
  const ms = playFrom + elapsed
  if (ms >= TOTAL_MS) {
    applyStateAt(TOTAL_MS)
    playing.value = false
    cancelAnimation()
    return
  }
  applyStateAt(ms)
  rafId = requestAnimationFrame(tick)
}

function cancelAnimation() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  playStart = null
}

function jumpTo(ms) {
  playing.value = false
  cancelAnimation()
  applyStateAt(ms)
}

onUnmounted(cancelAnimation)
</script>

<template>
  <div class="choreo">
    <div class="choreo__controls">
      <button type="button" class="choreo__btn" @click="togglePlay">
        {{ playing ? 'Pause' : 'Play sequence' }}
      </button>
      <label class="choreo__speed">
        Speed
        <select v-model.number="speed">
          <option :value="0.25">0.25×</option>
          <option :value="0.5">0.5×</option>
          <option :value="1">1×</option>
          <option :value="1.5">1.5×</option>
          <option :value="2">2×</option>
        </select>
      </label>
      <span class="choreo__time">{{ Math.round(scrubMs) }}ms / {{ TOTAL_MS }}ms</span>
    </div>

    <div class="choreo__track-wrap">
      <input
        type="range"
        class="choreo__scrub"
        min="0"
        :max="TOTAL_MS"
        step="50"
        :value="scrubMs"
        @input="onScrub"
      />
      <div class="choreo__markers">
        <button
          v-for="beat in beats"
          :key="beat.ms"
          type="button"
          class="choreo__marker"
          :style="{ left: `${(beat.ms / TOTAL_MS) * 100}%` }"
          :title="beat.label"
          @click="jumpTo(beat.ms)"
        >
          <span class="choreo__marker-dot" />
          <span class="choreo__marker-label">{{ beat.ms }}ms</span>
        </button>
      </div>
      <div class="choreo__progress" :style="{ width: `${progress}%` }" />
    </div>

    <p class="choreo__active">
      <strong>Active beat:</strong> {{ activeBeat.label }}
    </p>

    <div class="choreo__demos">
      <SurfaceDemo ref="loaderRef" preset="loader" compact />
      <SurfaceDemo ref="navRef" preset="nav-auth" compact />
      <SurfaceDemo ref="snackbarRef" preset="snackbar" compact />
    </div>
  </div>
</template>

<style scoped>
.choreo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 16px;
  margin: 16px 0;
  background: var(--vp-c-bg-soft);
}
.choreo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.choreo__btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #111;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}
.choreo__speed {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.choreo__speed select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.choreo__time {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-left: auto;
}
.choreo__track-wrap {
  position: relative;
  height: 48px;
  margin-bottom: 12px;
}
.choreo__scrub {
  width: 100%;
  margin: 0;
  position: relative;
  z-index: 2;
}
.choreo__progress {
  position: absolute;
  top: 18px;
  left: 0;
  height: 4px;
  background: var(--vp-c-brand-1);
  border-radius: 2px;
  pointer-events: none;
  opacity: 0.5;
  max-width: 100%;
}
.choreo__markers {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.choreo__marker {
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
.choreo__marker-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  border: 2px solid var(--vp-c-bg);
}
.choreo__marker-label {
  font-size: 10px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.choreo__active {
  font-size: 13px;
  margin: 0 0 16px;
  color: var(--vp-c-text-2);
}
.choreo__demos {
  display: grid;
  gap: 12px;
}
@media (min-width: 720px) {
  .choreo__demos {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
