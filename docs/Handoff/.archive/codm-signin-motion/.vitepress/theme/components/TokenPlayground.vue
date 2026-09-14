<script setup>
import { computed, onMounted, provide, ref, watch } from 'vue'

const isClient = typeof document !== 'undefined'
import SurfaceDemo from './SurfaceDemo.vue'
import EasingCurve from './EasingCurve.vue'
import TokenChip from './TokenChip.vue'
import {
  COMPOSITE_TOKENS,
  DURATION_TOKENS,
  EASING_TOKENS,
  getToken,
  parseDuration,
} from '../utils/tokens.js'

const rootRef = ref(null)
provide('tokenRoot', rootRef)

const overrides = ref({})
const curvePlaying = ref(false)
const selectedEasing = ref('--motion-ease-spring')

const durationValues = computed(() =>
  DURATION_TOKENS.map((t) => ({
    ...t,
    current: overrides.value[t.name] ?? (isClient ? parseDuration(getToken(t.name, rootRef.value)) : t.min),
    default: isClient ? parseDuration(getToken(t.name, rootRef.value)) : t.min,
  })),
)

const easingValues = computed(() =>
  EASING_TOKENS.map((t) => ({
    ...t,
    current: overrides.value[t.name] ?? (isClient ? getToken(t.name, rootRef.value) : ''),
    default: isClient ? getToken(t.name, rootRef.value) : '',
  })),
)

const compositeValues = computed(() =>
  COMPOSITE_TOKENS.map((name) => ({
    name,
    current: overrides.value[name] ?? (isClient ? getToken(name, rootRef.value) : ''),
    default: isClient ? getToken(name, rootRef.value) : '',
  })),
)

function applyOverrides() {
  const el = rootRef.value
  if (!el) return
  for (const [name, val] of Object.entries(overrides.value)) {
    el.style.setProperty(name, val)
  }
  recomputeComposites()
}

function recomputeComposites() {
  const el = rootRef.value
  if (!el) return
  const slow = overrides.value['--motion-duration-slow'] || getToken('--motion-duration-slow', el)
  const exit = overrides.value['--motion-duration-exit'] || getToken('--motion-duration-exit', el)
  const base = overrides.value['--motion-duration-base'] || getToken('--motion-duration-base', el)
  const decel = overrides.value['--motion-ease-decelerate'] || getToken('--motion-ease-decelerate', el)
  const accel = overrides.value['--motion-ease-accelerate'] || getToken('--motion-ease-accelerate', el)
  const spring = overrides.value['--motion-ease-spring'] || getToken('--motion-ease-spring', el)

  if (!overrides.value['--motion-modal-enter']) {
    el.style.setProperty('--motion-modal-enter', `${slow} ${decel}`)
  }
  if (!overrides.value['--motion-modal-exit']) {
    el.style.setProperty('--motion-modal-exit', `${exit} ${accel}`)
  }
  if (!overrides.value['--motion-snackbar-enter']) {
    el.style.setProperty('--motion-snackbar-enter', `${slow} ${spring}`)
  }
  if (!overrides.value['--motion-snackbar-exit']) {
    el.style.setProperty('--motion-snackbar-exit', `${base} ${accel}`)
  }
}

function setDuration(name, ms) {
  overrides.value[name] = `${ms}ms`
  applyOverrides()
}

function setEasing(name, val) {
  overrides.value[name] = val
  applyOverrides()
}

function resetAll() {
  overrides.value = {}
  if (rootRef.value) {
    for (const t of [...DURATION_TOKENS, ...EASING_TOKENS]) {
      rootRef.value.style.removeProperty(t.name)
    }
    for (const name of COMPOSITE_TOKENS) {
      rootRef.value.style.removeProperty(name)
    }
  }
}

function copyAllTokens() {
  const lines = [
    ...durationValues.value.map((t) => `${t.name}: ${t.current}ms`),
    ...easingValues.value.map((t) => `${t.name}: ${t.current}`),
    ...compositeValues.value.map((t) => `${t.name}: ${t.current}`),
  ]
  navigator.clipboard?.writeText(lines.join('\n'))
}

function playCurve() {
  curvePlaying.value = false
  requestAnimationFrame(() => {
    curvePlaying.value = true
    setTimeout(() => { curvePlaying.value = false }, 400)
  })
}

watch(overrides, applyOverrides, { deep: true })

onMounted(applyOverrides)
</script>

<template>
  <div ref="rootRef" class="playground-root">
    <div class="playground__header">
      <h3>Token Sandbox</h3>
      <div class="playground__header-actions">
        <button type="button" class="playground__btn playground__btn--ghost" @click="resetAll">Reset</button>
        <button type="button" class="playground__btn" @click="copyAllTokens">Copy all tokens</button>
      </div>
    </div>

    <section class="playground__section">
      <h4>Durations</h4>
      <div class="playground__sliders">
        <label v-for="t in durationValues" :key="t.name" class="playground__slider">
          <span class="playground__slider-label">
            <code>{{ t.name }}</code>
            <span>{{ t.current }}ms</span>
          </span>
          <input
            type="range"
            :min="t.min"
            :max="t.max"
            :step="t.step"
            :value="t.current"
            @input="setDuration(t.name, Number($event.target.value))"
          />
        </label>
      </div>
    </section>

    <section class="playground__section">
      <h4>Easings</h4>
      <div class="playground__easing-grid">
        <div v-for="t in easingValues" :key="t.name" class="playground__easing-item">
          <TokenChip :name="t.name" :value="t.current" />
          <select
            class="playground__select"
            :value="t.current"
            @change="setEasing(t.name, $event.target.value)"
          >
            <option v-for="e in easingValues" :key="e.name" :value="e.default">
              {{ e.label }} (default)
            </option>
            <option value="cubic-bezier(0, 0, 0.2, 1)">Decelerate</option>
            <option value="cubic-bezier(0.4, 0, 1, 1)">Accelerate</option>
            <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">Spring</option>
            <option value="cubic-bezier(0.4, 0, 0.2, 1)">Standard</option>
            <option value="linear">Linear</option>
          </select>
        </div>
      </div>
    </section>

    <section class="playground__section">
      <h4>Composite tokens (live)</h4>
      <div class="playground__chips">
        <TokenChip
          v-for="t in compositeValues"
          :key="t.name"
          :name="t.name"
          :value="t.current"
        />
      </div>
    </section>

    <section class="playground__section">
      <h4>Easing curve preview</h4>
      <div class="playground__curve-row">
        <select v-model="selectedEasing" class="playground__select">
          <option v-for="t in easingValues" :key="t.name" :value="t.name">{{ t.label }}</option>
        </select>
        <button type="button" class="playground__btn" @click="playCurve">Animate dot</button>
      </div>
      <EasingCurve :token="selectedEasing" :playing="curvePlaying" :duration="350" />
    </section>

    <section class="playground__section">
      <h4>Surface previews (live token overrides)</h4>
      <div class="playground__demos">
        <SurfaceDemo preset="sheet" />
        <SurfaceDemo preset="loader" />
        <SurfaceDemo preset="nav-auth" />
        <SurfaceDemo preset="snackbar" />
        <SurfaceDemo preset="popover" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.playground-root {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 20px;
  margin: 16px 0;
  background: var(--vp-c-bg);
}
.playground__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.playground__header h3 {
  margin: 0;
  font-size: 16px;
}
.playground__header-actions {
  display: flex;
  gap: 8px;
}
.playground__btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #111;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}
.playground__btn--ghost {
  background: transparent;
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.playground__section {
  margin-bottom: 24px;
}
.playground__section h4 {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.playground__sliders {
  display: grid;
  gap: 12px;
}
.playground__slider {
  display: grid;
  gap: 6px;
}
.playground__slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
.playground__slider-label code {
  color: var(--vp-c-brand-1);
}
.playground__easing-grid {
  display: grid;
  gap: 10px;
}
@media (min-width: 640px) {
  .playground__easing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.playground__easing-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.playground__select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 12px;
}
.playground__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.playground__curve-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}
.playground__demos {
  display: grid;
  gap: 12px;
}
@media (min-width: 720px) {
  .playground__demos {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
