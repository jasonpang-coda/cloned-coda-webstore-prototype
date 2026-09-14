<script setup>
/**
 * Drift — every finding from the rule catalogue (core/rules.js), grouped
 * by rule, severity-sorted, each with a copy-as-grep affordance. Mirrors
 * .claude/skills/web-store-component-token-mapping/drift-audit.md's own
 * format (one-line grep per finding) — that's the pattern that made that
 * doc trustworthy, and the reason to keep it here.
 */
import { computed, ref } from 'vue'
import StatCard from './StatCard.vue'
import MaterialIcon from '../../components/MaterialIcon.vue'
import { stat } from '../core/rollup.js'

const props = defineProps({ model: { type: Object, required: true } })

const SEV_ICON = { error: 'error', warn: 'warning', info: 'info' }

const severityFilter = ref('all') // 'all' | 'error' | 'warn' | 'info'
const ruleFilter = ref('all')

const rules = computed(() => [...new Set(props.model.drift.map((d) => d.rule))].sort())

const filtered = computed(() => {
  let items = props.model.drift
  if (severityFilter.value !== 'all') items = items.filter((d) => d.severity === severityFilter.value)
  if (ruleFilter.value !== 'all') items = items.filter((d) => d.rule === ruleFilter.value)
  const order = { error: 0, warn: 1, info: 2 }
  return items.slice().sort((a, b) => order[a.severity] - order[b.severity])
})

const copied = ref(null)
async function copyGrep (grep, idx) {
  try {
    await navigator.clipboard.writeText(grep)
    copied.value = idx
    setTimeout(() => { if (copied.value === idx) copied.value = null }, 1200)
  } catch { /* clipboard unavailable */ }
}

const total = computed(() => props.model.drift.length)
</script>

<template>
  <div class="drift">
    <div class="drift__summary">
      <StatCard label="Error" v-bind="stat(model.stats.drift.bySeverity.error, total)" tone="bad" bar />
      <StatCard label="Warn" v-bind="stat(model.stats.drift.bySeverity.warn, total)" bar />
      <StatCard label="Info" v-bind="stat(model.stats.drift.bySeverity.info, total)" bar />
    </div>

    <div class="drift__controls">
      <select class="drift__select" v-model="severityFilter">
        <option value="all">All severities</option>
        <option value="error">Error only</option>
        <option value="warn">Warn only</option>
        <option value="info">Info only</option>
      </select>
      <select class="drift__select" v-model="ruleFilter">
        <option value="all">All rules</option>
        <option v-for="r in rules" :key="r" :value="r">{{ r }}</option>
      </select>
      <span class="drift__count text-style-utility-micro-regular">{{ filtered.length }} finding(s)</span>
    </div>

    <div class="drift__list">
      <article v-for="(d, i) in filtered" :key="i" class="drift__card" :class="`drift__card--${d.severity}`">
        <header class="drift__card-head">
          <MaterialIcon :name="SEV_ICON[d.severity]" variant="round" :size="14" class="drift__sev-icon" />
          <span class="drift__sev text-style-utility-micro-uppercase">{{ d.severity }}</span>
          <span class="drift__rule">{{ d.rule }}</span>
          <span class="drift__card-title text-style-utility-label-bold">{{ d.title }}</span>
        </header>
        <p class="drift__msg text-style-utility-label-regular">{{ d.message }}</p>
        <p v-if="d.rediscovers" class="drift__cite text-style-utility-micro-regular">Cites: {{ d.rediscovers }}</p>
        <div v-if="d.grep" class="drift__grep-row">
          <code class="drift__grep">{{ d.grep }}</code>
          <button type="button" class="drift__copy-btn" @click="copyGrep(d.grep, i)">{{ copied === i ? 'Copied' : 'Copy' }}</button>
        </div>
      </article>
      <p v-if="!filtered.length" class="drift__empty text-style-utility-label-regular">No findings match this filter.</p>
    </div>
  </div>
</template>

<style scoped>
.drift { display: flex; flex-direction: column; gap: var(--x-gap-content-separation); max-width: 960px; }
.drift__summary { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--x-gap-content-default); }
.drift__controls { display: flex; align-items: center; gap: var(--x-gap-content-default); }
.drift__select {
  background: var(--x-bg-input-default);
  color: var(--x-text-body-default);
  border: var(--border-weight-default) solid var(--x-border-input-default);
  border-radius: var(--x-radius-input-s);
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  font: inherit;
}
.drift__count { color: var(--x-text-body-subtle); }
.drift__list { display: flex; flex-direction: column; gap: var(--x-gap-content-default); }
.drift__empty { color: var(--x-text-body-subtle); }
.drift__card {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-m);
  border-radius: var(--x-radius-container-s);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-card-default);
}
.drift__card--error { border-color: var(--x-border-input-error); }
.drift__card--warn { border-color: var(--x-border-input-warning); }
.drift__card-head { display: flex; align-items: center; gap: var(--x-gap-content-tight); }
.drift__sev-icon { flex: 0 0 auto; color: var(--x-text-body-subtle); }
.drift__sev { color: var(--x-text-body-subtle); }
.drift__card--error .drift__sev, .drift__card--error .drift__sev-icon { color: var(--x-text-error-default); }
.drift__card--warn .drift__sev, .drift__card--warn .drift__sev-icon { color: var(--x-text-warning-default); }
.drift__rule { font-family: monospace; color: var(--x-text-hyperlink-default); }
.drift__card-title { color: var(--x-text-header-default); }
.drift__msg { color: var(--x-text-body-soft); line-height: 1.5; margin: 0; }
.drift__cite { color: var(--x-text-body-subtle); margin: 0; }
.drift__grep-row { display: flex; align-items: center; gap: var(--x-gap-content-tight); }
.drift__grep {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
  font-family: monospace;
  font-size: 11px;
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  background: var(--x-bg-input-default);
  border-radius: var(--x-radius-input-s);
  color: var(--x-text-body-soft);
}
.drift__copy-btn {
  flex-shrink: 0;
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: transparent;
  color: var(--x-text-body-soft);
  border-radius: var(--x-radius-input-s);
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.drift__copy-btn:hover { color: var(--x-text-header-default); }
</style>
