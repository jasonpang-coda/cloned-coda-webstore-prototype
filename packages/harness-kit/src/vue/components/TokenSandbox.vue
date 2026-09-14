<script setup>
/**
 * TokenSandbox — live token-editing harness. Ported from the standalone
 * handoff kit; the only structural change is dropping the kit's
 * `handoff.config.mjs` import — here `durations`/`easings` are passed in
 * directly by the caller (usually a flow manifest's tokenCatalog), since a
 * flow is chosen at runtime rather than baked per-site.
 *
 * Renders duration sliders + easing selects, writes overrides as CSS custom
 * properties on its root element, and provides that element as 'tokenRoot'
 * (injected by EasingCurve etc). Token vars cascade into whatever the default
 * slot mounts, so the live demo updates instantly.
 *
 * Slots:
 *   default  — the demo stage. Scoped prop `values` = { tokenName: current }
 *              (Number ms for durations, String for easings).
 *   controls — extra feature toggles, appended to the controls row.
 *   hint     — footer note under the sandbox.
 */
import { computed, onMounted, provide, reactive, ref } from 'vue'
import TokenChip from './TokenChip.vue'
import { EASING_OPTIONS, getToken, parseDuration } from '../utils/tokens.js'

const props = defineProps({
  title: { type: String, default: 'Live demo' },
  durations: { type: Array, default: () => [] },
  easings: { type: Array, default: () => [] },
})

const rootRef = ref(null)
provide('tokenRoot', rootRef)

// token name → current value (Number ms for durations, String for easings)
const values = reactive({})

function setDuration (name, ms) {
  values[name] = ms
  rootRef.value?.style.setProperty(name, `${ms}ms`)
}
function setEasing (name, val) {
  values[name] = val
  rootRef.value?.style.setProperty(name, val)
}

function seedDefaults () {
  if (typeof document === 'undefined') return
  const el = rootRef.value
  for (const t of props.durations) values[t.name] = parseDuration(getToken(t.name, el)) || t.min
  for (const t of props.easings) values[t.name] = getToken(t.name, el)
}

function reset () {
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
      <h3 class="text-style-heading-card">{{ title }}</h3>
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
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-m);
  padding: var(--x-pad-surface-l);
  margin: var(--x-gap-content-default) 0;
  background: var(--x-bg-card-default);
}
.sandbox__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--x-gap-content-default);
  margin-bottom: var(--x-gap-content-default);
}
.sandbox__header h3 { margin: 0; }
.sandbox__stage-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--x-pad-surface-m);
  border-radius: var(--x-radius-container-s);
  background: var(--x-bg-page);
}
.sandbox__controls {
  display: grid;
  gap: var(--x-gap-content-default);
  margin-top: var(--x-gap-content-loose);
}
@media (min-width: 640px) {
  .sandbox__controls { grid-template-columns: repeat(2, 1fr); }
}
.sandbox__slider { display: grid; gap: var(--x-gap-content-tight); }
.sandbox__slider-label {
  display: flex;
  justify-content: space-between;
  font-size: var(--x-sys-size-body-s);
}
.sandbox__slider-label code { color: var(--x-text-hyperlink-default); font-family: monospace; }
.sandbox__field { display: grid; gap: var(--x-gap-content-tight); font-size: var(--x-sys-size-body-s); }
.sandbox__field code { color: var(--x-text-hyperlink-default); font-family: monospace; }
.sandbox__select {
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-xs);
  border-radius: var(--x-radius-control-xs);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-page);
  color: var(--x-text-body-default);
  font-size: var(--x-sys-size-body-s);
}
.sandbox__toggles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--x-gap-content-default);
  margin-top: var(--x-gap-content-loose);
  font-size: var(--x-sys-size-body-main);
  color: var(--x-text-body-soft);
}
.sandbox__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--x-gap-content-tight);
  margin-top: var(--x-gap-content-loose);
}
.sandbox__btn {
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-m);
  border-radius: var(--x-radius-control-s);
  border: var(--border-weight-action) solid var(--x-text-hyperlink-default);
  background: var(--x-text-hyperlink-default);
  color: var(--x-text-body-inverse);
  font-weight: var(--x-sys-weight-bold);
  font-size: var(--x-sys-size-body-s);
  cursor: pointer;
}
.sandbox__btn--ghost {
  background: transparent;
  color: var(--x-text-body-default);
  border-color: var(--x-border-card-default);
}
.sandbox__hint {
  font-size: var(--x-sys-size-body-s);
  color: var(--x-text-body-subtle);
  margin: var(--x-gap-content-loose) 0 0;
  line-height: var(--x-sys-line-height-main);
}
</style>
