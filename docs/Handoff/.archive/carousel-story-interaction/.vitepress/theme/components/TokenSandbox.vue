<script setup>
// GENERIC kit component — the live token-editing harness.
//
// Renders duration sliders + easing selects for the site's tokenCatalog
// (handoff.config.mjs), writes overrides as CSS custom properties on its root
// element, and provides that element as 'tokenRoot' (inject-able by
// EasingCurve etc.). Token vars cascade into whatever the default slot mounts,
// so the live demo updates instantly.
//
// Slots:
//   default  — the demo stage. Scoped prop `values` = { tokenName: current }
//              (Number ms for durations, String for easings) for demos that
//              need a token as a JS prop (e.g. StoryCarousel's `interval`).
//   controls — extra feature toggles, appended to the controls row.
//   hint     — footer note under the sandbox.
import { computed, onMounted, provide, reactive, ref } from 'vue'
import TokenChip from './TokenChip.vue'
import { EASING_OPTIONS, getToken, parseDuration } from '../utils/tokens.js'
import siteConfig from '../../../handoff.config.mjs'

const props = defineProps({
  title: { type: String, default: 'Live demo' },
  durations: { type: Array, default: () => siteConfig.tokenCatalog?.durations ?? [] },
  easings: { type: Array, default: () => siteConfig.tokenCatalog?.easings ?? [] },
})

const rootRef = ref(null)
provide('tokenRoot', rootRef)

// token name → current value (Number ms for durations, String for easings)
const values = reactive({})

function setDuration(name, ms) {
  values[name] = ms
  rootRef.value?.style.setProperty(name, `${ms}ms`)
}
function setEasing(name, val) {
  values[name] = val
  rootRef.value?.style.setProperty(name, val)
}

function seedDefaults() {
  if (typeof document === 'undefined') return
  const el = rootRef.value
  for (const t of props.durations) values[t.name] = parseDuration(getToken(t.name, el)) || t.min
  for (const t of props.easings) values[t.name] = getToken(t.name, el)
}

function reset() {
  for (const t of [...props.durations, ...props.easings]) {
    rootRef.value?.style.removeProperty(t.name)
  }
  seedDefaults()
}

onMounted(seedDefaults)

const chips = computed(() => [
  ...props.durations.map((t) => ({ name: t.name, value: values[t.name] != null ? `${values[t.name]}ms` : '—' })),
  ...props.easings.map((t) => ({ name: t.name, value: values[t.name] || '—' })),
])
</script>

<template>
  <div ref="rootRef" class="sandbox">
    <div class="sandbox__header">
      <h3>{{ title }}</h3>
      <button type="button" class="sandbox__btn sandbox__btn--ghost" @click="reset">Reset tokens</button>
    </div>

    <div class="sandbox__stage-wrap">
      <slot :values="values" />
    </div>

    <div class="sandbox__controls" v-if="durations.length || easings.length">
      <label v-for="t in durations" :key="t.name" class="sandbox__slider">
        <span class="sandbox__slider-label"><code>{{ t.name }}</code><span>{{ values[t.name] ?? '—' }}ms</span></span>
        <input
          type="range"
          :min="t.min"
          :max="t.max"
          :step="t.step"
          :value="values[t.name] ?? t.min"
          @input="setDuration(t.name, Number($event.target.value))"
        />
      </label>

      <label v-for="t in easings" :key="t.name" class="sandbox__field">
        <span><code>{{ t.name }}</code></span>
        <select class="sandbox__select" :value="values[t.name]" @change="setEasing(t.name, $event.target.value)">
          <option v-for="e in EASING_OPTIONS" :key="e.value" :value="e.value">{{ e.label }}</option>
        </select>
      </label>
    </div>

    <div class="sandbox__toggles" v-if="$slots.controls">
      <slot name="controls" />
    </div>

    <div class="sandbox__chips" v-if="chips.length">
      <TokenChip v-for="c in chips" :key="c.name" :name="c.name" :value="String(c.value)" />
    </div>

    <p class="sandbox__hint" v-if="$slots.hint"><slot name="hint" /></p>
  </div>
</template>

<style scoped>
.sandbox {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 20px;
  margin: 16px 0;
  background: var(--vp-c-bg);
}
.sandbox__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.sandbox__header h3 { margin: 0; font-size: 16px; }
.sandbox__stage-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.sandbox__controls {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}
@media (min-width: 640px) {
  .sandbox__controls { grid-template-columns: repeat(2, 1fr); }
}
.sandbox__slider { display: grid; gap: 6px; }
.sandbox__slider-label { display: flex; justify-content: space-between; font-size: 12px; }
.sandbox__slider-label code { color: var(--vp-c-brand-1); }
.sandbox__field { display: grid; gap: 6px; font-size: 12px; }
.sandbox__field code { color: var(--vp-c-brand-1); }
.sandbox__select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 12px;
}
.sandbox__toggles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.sandbox__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 18px;
}
.sandbox__btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #111;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}
.sandbox__btn--ghost {
  background: transparent;
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.sandbox__hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 16px 0 0;
  line-height: 1.6;
}
</style>
