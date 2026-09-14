<script setup>
/**
 * Overview — inverted-pyramid headline: a hero health band answers "good or
 * not?" in the first 5 seconds, a small primary-KPI row covers the metrics
 * someone actually acts on, and the finer usage-signal breakdown (a/b/c/d)
 * is demoted behind a disclosure — present for the analyst, out of the way
 * for the first-time viewer. See dashboard-design skill §1-4.
 */
import { computed, ref } from 'vue'
import StatCard from './StatCard.vue'
import MaterialIcon from '../../components/MaterialIcon.vue'
import { stat } from '../core/rollup.js'

const props = defineProps({
  model: { type: Object, required: true },
  bucket: { type: String, required: true },
})

// Coverage is judged against a health threshold, not a prior period — the
// audit is a single fresh scan on every load, so there's no history to diff
// against. 80% is the working bar for "healthy" prod-contract coverage.
const HEALTH_THRESHOLD = 80

const list = computed(() => [...props.model.tokens.values()].filter((t) => t.classify.bucket === props.bucket))

const used = computed(() => stat(list.value.filter((t) => t.usedAny).length, list.value.length))
const unused = computed(() => stat(list.value.filter((t) => !t.usedAny).length, list.value.length))
const bySignal = (key) => stat(list.value.filter((t) => t.usage[key].used).length, list.value.length)
const dynamicOnly = computed(() => stat(list.value.filter((t) => t.usage.js.used && !t.usage.css.used && !t.usage.alias.used).length, list.value.length))
const overriddenUnconsumed = computed(() => stat(list.value.filter((t) => t.usage.theme.used && !t.usage.css.used && !t.usage.alias.used && !t.usage.js.used).length, list.value.length))
const devChromeOnly = computed(() => stat(list.value.filter((t) => t.devChromeOnly).length, list.value.length))

const driftForBucket = computed(() => props.model.drift.filter((d) => d.tokens.some((n) => list.value.some((t) => t.name === n)) || d.tokens.length === 0))
const driftErrors = computed(() => stat(driftForBucket.value.filter((d) => d.severity === 'error').length, driftForBucket.value.length || 1))
const topDrift = computed(() => {
  const order = { error: 0, warn: 1, info: 2 }
  return [...driftForBucket.value].sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 5)
})

const heroTone = computed(() => {
  if (used.value.pct >= HEALTH_THRESHOLD) return 'good'
  if (used.value.pct >= HEALTH_THRESHOLD - 20) return 'warn'
  return 'bad'
})
const heroWord = computed(() => (heroTone.value === 'good' ? 'Healthy' : heroTone.value === 'warn' ? 'Needs attention' : 'At risk'))
const heroIcon = computed(() => (heroTone.value === 'good' ? 'check_circle' : heroTone.value === 'warn' ? 'warning' : 'error'))

const DRIFT_SEV_ICON = { error: 'error', warn: 'warning', info: 'info' }

const signalsOpen = ref(false)
</script>

<template>
  <div class="ov">
    <!-- Hero: the single most decision-driving number, top-left, answers
         "good or not?" on its own before anything else on the page. -->
    <div class="ov__hero" :class="`ov__hero--${heroTone}`">
      <div class="ov__hero-top">
        <span class="ov__hero-label text-style-utility-label-regular">Prod token contract in use</span>
        <span class="ov__hero-status" :class="`ov__hero-status--${heroTone}`">
          <MaterialIcon :name="heroIcon" variant="round" :size="18" />
          {{ heroWord }}
        </span>
      </div>
      <div class="ov__hero-figure">
        <span class="ov__hero-pct">{{ used.total > 0 ? Math.round((used.count / used.total) * 1000) / 10 : 0 }}%</span>
        <span class="ov__hero-frac text-style-utility-label-regular">{{ used.count }} / {{ used.total }} tokens used · target {{ HEALTH_THRESHOLD }}%</span>
      </div>
      <div class="ov__hero-bar" role="meter" :aria-valuenow="used.count" aria-valuemin="0" :aria-valuemax="used.total" :aria-valuetext="`${used.count} of ${used.total} used, target ${HEALTH_THRESHOLD}%`">
        <div class="ov__hero-bar-used" :style="{ width: used.pct + '%' }" />
        <div class="ov__hero-bar-tick" :style="{ left: HEALTH_THRESHOLD + '%' }" />
      </div>
    </div>

    <!-- Primary KPI row — the metrics someone actually acts on. Kept to 4
         so the whole row stays inside the working-memory budget. -->
    <div class="ov__primary">
      <StatCard label="Used" v-bind="used" :tone="heroTone" :threshold="HEALTH_THRESHOLD" thresholdLabel="target 80%" />
      <StatCard label="Unused" v-bind="unused" :tone="unused.count > 0 ? 'bad' : 'good'" hint="Declared, reached by nothing" />
      <StatCard label="Drift errors" v-bind="driftErrors" :tone="driftErrors.count > 0 ? 'bad' : 'good'" hint="Error-severity findings for this bucket" />
      <StatCard label="Overridden, unconsumed" v-bind="overriddenUnconsumed" :tone="overriddenUnconsumed.count > 0 ? 'warn' : 'good'" hint="Theme maintains a value nothing reads" />
    </div>

    <h3 class="ov__section-title text-style-utility-label-bold">Top drift findings</h3>
    <div class="ov__drift-list">
      <p v-if="!topDrift.length" class="ov__empty text-style-utility-label-regular">No drift findings for this bucket.</p>
      <div v-for="(d, i) in topDrift" :key="i" class="ov__drift-row" :class="`ov__drift-row--${d.severity}`">
        <MaterialIcon :name="DRIFT_SEV_ICON[d.severity]" variant="round" :size="14" class="ov__drift-icon" />
        <span class="ov__drift-sev text-style-utility-micro-uppercase">{{ d.severity }}</span>
        <span class="ov__drift-rule">{{ d.rule }}</span>
        <span class="ov__drift-msg text-style-utility-label-regular">{{ d.message }}</span>
      </div>
    </div>

    <!-- Secondary usage-signal breakdown — real, but not part of the 5-second
         read. Collapsed by default (progressive disclosure). -->
    <div class="ov__signals">
      <button type="button" class="ov__signals-toggle" @click="signalsOpen = !signalsOpen" :aria-expanded="signalsOpen">
        <MaterialIcon :name="signalsOpen ? 'expand_less' : 'expand_more'" variant="round" :size="16" />
        <span class="text-style-utility-label-bold">How "used" is counted</span>
      </button>
      <div v-if="signalsOpen" class="ov__signals-body">
        <p class="ov__def text-style-utility-label-regular">
          "Used" = read directly in a .vue's scoped CSS, OR reachable through the alias chain from something that is,
          OR read dynamically from JS/template (flagged separately below). Overridden-by-a-theme-only does
          <strong>not</strong> count as used — see "overridden, unconsumed" above.
        </p>
        <div class="ov__signals-grid">
          <StatCard label="Read in .vue (signal a)" v-bind="bySignal('css')" variant="row" bar />
          <StatCard label="Aliased only (signal b)" v-bind="bySignal('alias')" variant="row" bar hint="Reached via another token, no direct read" />
          <StatCard label="Dynamic-only (signal c)" v-bind="dynamicOnly" variant="row" bar hint="Not statically provable for name-interpolated cases" />
          <StatCard label="Overridden by a theme (signal d)" v-bind="bySignal('theme')" variant="row" bar />
          <StatCard label="Dev-chrome only" v-bind="devChromeOnly" variant="row" bar hint="Used only by the dashboard/handoff/library, not the storefront" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ov { display: flex; flex-direction: column; gap: var(--x-gap-content-separation); max-width: 960px; }

.ov__hero {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-l, var(--x-pad-surface-m));
  border-radius: var(--x-radius-container-m, var(--x-radius-container-s));
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-card-default);
}
.ov__hero--good { border-color: var(--x-border-input-success); }
.ov__hero--warn { border-color: var(--x-border-input-warning); }
.ov__hero--bad { border-color: var(--x-border-input-error); }

.ov__hero-top { display: flex; align-items: center; justify-content: space-between; gap: var(--x-gap-content-default); }
.ov__hero-label { color: var(--x-text-body-soft); }
.ov__hero-status { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--x-text-body-subtle); }
.ov__hero-status--good { color: var(--x-text-success-default); }
.ov__hero-status--warn { color: var(--x-text-warning-default); }
.ov__hero-status--bad { color: var(--x-text-error-default); }

.ov__hero-figure { display: flex; align-items: baseline; gap: var(--x-gap-content-default); flex-wrap: wrap; }
.ov__hero-pct { font-size: 2.4em; font-weight: 700; color: var(--x-text-header-default); font-variant-numeric: tabular-nums; line-height: 1; }
.ov__hero-frac { color: var(--x-text-body-subtle); }

.ov__hero-bar { position: relative; height: 10px; border-radius: var(--x-radius-badge-full); background: var(--x-bg-control-default); overflow: visible; }
.ov__hero-bar-used { height: 100%; border-radius: var(--x-radius-badge-full); background: var(--x-border-input-success); transition: width 200ms ease; }
.ov__hero--warn .ov__hero-bar-used { background: var(--x-border-input-warning); }
.ov__hero--bad .ov__hero-bar-used { background: var(--x-border-input-error); }
.ov__hero-bar-tick { position: absolute; top: -3px; bottom: -3px; width: 2px; background: var(--x-text-header-default); opacity: 0.6; transform: translateX(-1px); }

.ov__primary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: var(--x-gap-content-default);
}

.ov__section-title { color: var(--x-text-header-default); margin: 0; }
.ov__drift-list { display: flex; flex-direction: column; gap: var(--x-gap-content-tight); }
.ov__empty { color: var(--x-text-body-subtle); }
.ov__drift-row {
  display: flex;
  align-items: baseline;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-s) var(--x-pad-surface-m);
  border-radius: var(--x-radius-container-xs);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-card-default);
}
.ov__drift-icon { flex: 0 0 auto; align-self: center; color: var(--x-text-body-subtle); }
.ov__drift-row--error { border-color: var(--x-border-input-error); }
.ov__drift-row--error .ov__drift-icon { color: var(--x-text-error-default); }
.ov__drift-row--warn .ov__drift-icon { color: var(--x-text-warning-default); }
.ov__drift-sev { flex: 0 0 auto; color: var(--x-text-body-subtle); }
.ov__drift-row--error .ov__drift-sev { color: var(--x-text-error-default); }
.ov__drift-rule { flex: 0 0 auto; font-family: monospace; color: var(--x-text-hyperlink-default); }
.ov__drift-msg { color: var(--x-text-body-soft); min-width: 0; }

.ov__signals { display: flex; flex-direction: column; gap: var(--x-gap-content-default); }
.ov__signals-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: var(--x-text-header-default);
  cursor: pointer;
  padding: 4px 0;
}
.ov__signals-body { display: flex; flex-direction: column; gap: var(--x-gap-content-default); }
.ov__def { color: var(--x-text-body-soft); line-height: 1.5; }
.ov__signals-grid { display: flex; flex-direction: column; gap: var(--x-gap-content-tight); }
</style>
