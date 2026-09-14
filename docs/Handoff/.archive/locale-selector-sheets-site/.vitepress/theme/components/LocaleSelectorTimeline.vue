<script setup>
/**
 * LocaleSelectorTimeline — scrubs the §1.1 sheet enter/exit choreography.
 * Toggle between the two phases: entrance uses --motion-sys-duration-slow +
 * ease-decelerate (350ms default); exit uses --motion-sys-duration-exit +
 * ease-accelerate (200ms default) — noticeably shorter, per the §1.1 callout
 * on why dismissal should feel quicker than arrival. Beat positions and the
 * stage's motion are read live from the tokens, so editing the sliders above
 * reshapes this timeline too.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { getToken, parseDuration } from '../utils/tokens.js'

const phase = ref('enter') // 'enter' | 'exit'
const ENTER_MS = ref(350)
const EXIT_MS = ref(200)

function readDurations() {
  ENTER_MS.value = parseDuration(getToken('--motion-sys-duration-slow')) || 350
  EXIT_MS.value = parseDuration(getToken('--motion-sys-duration-exit')) || 200
}
onMounted(readDurations)
// Re-read whenever the phase toggles, in case the sandbox sliders moved while off-tab.
watch(phase, readDurations)

const DURATION = computed(() => (phase.value === 'enter' ? ENTER_MS.value : EXIT_MS.value))

const beats = computed(() =>
  phase.value === 'enter'
    ? [
        { ms: 0, label: 'closed — offscreen, scrim transparent' },
        { ms: DURATION.value, label: 'open — settled, scrim opaque' },
      ]
    : [
        { ms: 0, label: 'open — settled, scrim opaque' },
        { ms: DURATION.value, label: 'closed — offscreen, scrim transparent' },
      ]
)

// Pure functions of ms — no reactive scrubMs, no RAF here (BeatTimeline owns that).
function progressFor(ms) {
  const p = Math.min(ms / DURATION.value, 1)
  return phase.value === 'enter' ? p : 1 - p
}
function translateY(ms) { return (1 - progressFor(ms)) * 100 }
function scrimOpacity(ms) { return progressFor(ms) }
</script>

<template>
  <div class="phase-toggle">
    <button type="button" class="phase-btn" :class="{ 'phase-btn--active': phase === 'enter' }" @click="phase = 'enter'">
      Entrance (--motion-sys-duration-slow · decelerate)
    </button>
    <button type="button" class="phase-btn" :class="{ 'phase-btn--active': phase === 'exit' }" @click="phase = 'exit'">
      Exit (--motion-sys-duration-exit · accelerate)
    </button>
  </div>

  <BeatTimeline :beats="beats" :range="DURATION">
    <template #default="{ ms }">
      <div class="tl-stage">
        <div class="tl-scrim" :style="{ opacity: scrimOpacity(ms) }" />
        <div class="tl-panel" :style="{ transform: `translateY(${translateY(ms)}%)` }">
          <span class="tl-panel__label">{{ phase === 'enter' ? 'entering' : 'exiting' }}</span>
        </div>
      </div>
    </template>
  </BeatTimeline>
</template>

<style scoped>
.phase-toggle { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.phase-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
}
.phase-btn--active { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); font-weight: 600; }

.tl-stage {
  position: relative;
  width: 220px;
  height: 140px;
  margin: 0 auto;
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.tl-scrim { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); }
.tl-panel {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 70%;
  display: grid;
  place-items: center;
  border-radius: 10px 10px 0 0;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
}
.tl-panel__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-2);
}
</style>
