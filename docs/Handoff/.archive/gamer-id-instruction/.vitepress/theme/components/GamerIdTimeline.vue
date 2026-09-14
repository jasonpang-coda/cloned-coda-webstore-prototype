<script setup>
import { computed, onMounted, ref } from 'vue'
import { getToken, parseDuration } from '../utils/tokens.js'

const DUR_EXIT  = ref(200)  // --motion-sys-duration-exit  (instructions enter)
const DUR_FAST  = ref(150)  // --motion-sys-duration-fast  (instructions leave)
const DUR_BASE  = ref(250)  // --motion-sys-duration-base  (panel accordion, tab content)
const DUR_SLOW  = ref(350)  // --motion-sys-duration-slow  (chevron, via --motion-accordion)
const SPINNER   = ref(700)  // --motion-spinner

onMounted(() => {
  DUR_EXIT.value  = parseDuration(getToken('--motion-sys-duration-exit'))  || 200
  DUR_FAST.value  = parseDuration(getToken('--motion-sys-duration-fast'))  || 150
  DUR_BASE.value  = parseDuration(getToken('--motion-sys-duration-base'))  || 250
  DUR_SLOW.value  = parseDuration(getToken('--motion-sys-duration-slow'))  || 350
  SPINNER.value   = parseDuration(getToken('--motion-spinner'))            || 700
})

// Two choreography tracks shown side by side:
//   Track A — Disclosure open flow (0 → ~350ms)
//   Track B — Lookup flow          (0 → ~1350ms, spinner loops so show 2 cycles)

const RANGE = computed(() => Math.max(DUR_SLOW.value + DUR_BASE.value + 50, SPINNER.value * 2 + 200))

const disclosureBeats = computed(() => [
  { ms: 0,                label: 'Tap disclosure' },
  { ms: DUR_EXIT.value,   label: 'Instructions in' },
  { ms: DUR_SLOW.value,   label: 'Chevron 180°' },
  { ms: DUR_SLOW.value + DUR_BASE.value, label: 'Panel open' },
])

const lookupBeats = computed(() => [
  { ms: 0,                    label: 'Blur / Enter' },
  { ms: SPINNER.value,        label: 'Spinner cycle 1' },
  { ms: SPINNER.value * 2,    label: 'Spinner cycle 2' },
  { ms: 1100,                 label: 'Found — card in' },
  { ms: 1100 + DUR_BASE.value, label: 'Card visible' },
])
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:32px;">
    <div>
      <p style="margin:0 0 8px;font-size:13px;color:#888;">Disclosure open sequence</p>
      <BeatTimeline :beats="disclosureBeats" :range="RANGE">
        <template #default="{ ms }">
          <div class="tl-stage">
            <!-- Chevron -->
            <div class="tl-row">
              <span class="tl-label">Chevron</span>
              <span class="tl-chevron" :style="{ transform: `rotate(${Math.min(ms / DUR_SLOW, 1) * 180}deg)` }">▾</span>
            </div>
            <!-- Instructions block opacity -->
            <div class="tl-row">
              <span class="tl-label">Block opacity</span>
              <div class="tl-bar" :style="{ opacity: Math.min(ms / DUR_EXIT, 1) }" />
            </div>
            <!-- Panel accordion -->
            <div class="tl-row">
              <span class="tl-label">Panel rows</span>
              <div class="tl-panel-preview" :style="{ height: Math.min(Math.max((ms - DUR_SLOW.value + 10) / DUR_BASE, 0), 1) * 40 + 'px' }" />
            </div>
          </div>
        </template>
      </BeatTimeline>
    </div>

    <div>
      <p style="margin:0 0 8px;font-size:13px;color:#888;">Lookup sequence</p>
      <BeatTimeline :beats="lookupBeats" :range="1100 + DUR_BASE + 50">
        <template #default="{ ms }">
          <div class="tl-stage">
            <!-- Spinner rotation -->
            <div class="tl-row">
              <span class="tl-label">Spinner</span>
              <span
                v-if="ms < 1100"
                class="tl-spinner"
                :style="{ transform: `rotate(${(ms / SPINNER) * 360}deg)` }"
              />
              <span v-else style="font-size:11px;color:#4a90d9;">✓ found</span>
            </div>
            <!-- Player card opacity -->
            <div class="tl-row">
              <span class="tl-label">Card opacity</span>
              <div class="tl-bar" :style="{ opacity: Math.min(Math.max((ms - 1100) / DUR_BASE, 0), 1) }" />
            </div>
          </div>
        </template>
      </BeatTimeline>
    </div>
  </div>
</template>

<style scoped>
.tl-stage { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; }
.tl-row { display: flex; align-items: center; gap: 12px; font-size: 12px; }
.tl-label { width: 90px; color: #888; flex-shrink: 0; }
.tl-chevron { display: inline-block; font-size: 18px; color: #ccc; }
.tl-bar { width: 80px; height: 14px; border-radius: 3px; background: #4a90d9; }
.tl-panel-preview { width: 80px; background: rgba(255,255,255,0.15); border-radius: 3px; transition: none; overflow: hidden; }
.tl-spinner {
  display: inline-block;
  width: 20px; height: 20px;
  border: 2px solid #555;
  border-top-color: #4a90d9;
  border-radius: 50%;
  box-sizing: border-box;
}
</style>
