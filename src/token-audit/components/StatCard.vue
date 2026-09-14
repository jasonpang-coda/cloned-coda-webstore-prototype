<script setup>
/**
 * StatCard — the count-and-percentage contract for the whole dashboard.
 * There is exactly one place that renders "count / total · pct" — this
 * component — so a reviewer can verify the "always both, never just one"
 * requirement by reading one template, not auditing every screen.
 *
 * `pct` is ALWAYS derived from count/total, never passed in — so the two
 * numbers can never disagree.
 *
 * Every tone below is a status, so it carries a paired icon + text label
 * (never colour alone — colour-blindness affects ~8% of men). `threshold`
 * is optional: when set it renders an explicit comparison line and a tick
 * mark on the meter, so a lone percentage becomes judgeable rather than a
 * trivia fact (dashboard-design §4).
 */
import { computed } from 'vue'
import MaterialIcon from '../../components/MaterialIcon.vue'

const props = defineProps({
  label: { type: String, required: true },
  count: { type: Number, required: true },
  total: { type: Number, required: true },
  tone: { type: String, default: 'neutral' }, // neutral | good | warn | bad
  hint: { type: String, default: '' },
  bar: { type: Boolean, default: true },
  variant: { type: String, default: 'card' }, // card | row
  size: { type: String, default: 'default' }, // default | hero
  /** Optional target/threshold pct (0-100) this metric is judged against. */
  threshold: { type: Number, default: null },
  thresholdLabel: { type: String, default: '' },
})

const pct = computed(() => (props.total > 0 ? (props.count / props.total) * 100 : null))

const pctLabel = computed(() => {
  if (pct.value === null) return 'n/a'
  if (pct.value === 0) return '0%'
  if (pct.value === 100) return '100%'
  if (pct.value < 0.1) return '<0.1%'
  if (pct.value > 99.9) return '>99.9%'
  const rounded = Math.round(pct.value * 10) / 10
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`
})

const fracLabel = computed(() => {
  const nf = new Intl.NumberFormat('en-US')
  return `${nf.format(props.count)} / ${nf.format(props.total)}`
})

const barPct = computed(() => Math.max(0, Math.min(100, pct.value ?? 0)))

const TONE_META = {
  good: { icon: 'check_circle', word: 'Healthy' },
  warn: { icon: 'warning', word: 'Watch' },
  bad: { icon: 'error', word: 'Needs attention' },
  neutral: { icon: null, word: '' },
}
const toneMeta = computed(() => TONE_META[props.tone] ?? TONE_META.neutral)

const thresholdDelta = computed(() => {
  if (props.threshold === null || pct.value === null) return null
  const d = Math.round((pct.value - props.threshold) * 10) / 10
  return d
})
const thresholdText = computed(() => {
  if (props.threshold === null) return ''
  const base = props.thresholdLabel || `target ${props.threshold}%`
  if (thresholdDelta.value === null) return base
  const sign = thresholdDelta.value > 0 ? '+' : ''
  return `${base} (${sign}${thresholdDelta.value}pt)`
})
</script>

<template>
  <div class="statc" :class="[`statc--${variant}`, `statc--${tone}`, `statc--${size}`]">
    <div class="statc__head">
      <span class="statc__label text-style-utility-label-regular">{{ label }}</span>
      <span v-if="toneMeta.icon" class="statc__status" :class="`statc__status--${tone}`" :title="toneMeta.word">
        <MaterialIcon :name="toneMeta.icon" variant="round" :size="size === 'hero' ? 18 : 14" />
        <span class="statc__status-word text-style-utility-micro-uppercase">{{ toneMeta.word }}</span>
      </span>
    </div>

    <div class="statc__figure-row">
      <span class="statc__figure">
        <span class="statc__frac">{{ fracLabel }}</span>
        <span class="statc__dot" aria-hidden="true">·</span>
        <span class="statc__pct">{{ pctLabel }}</span>
      </span>
    </div>

    <div
      v-if="bar && total > 0"
      class="statc__meter"
      role="meter"
      :aria-valuenow="count"
      aria-valuemin="0"
      :aria-valuemax="total"
      :aria-valuetext="`${fracLabel}, ${pctLabel}${threshold !== null ? `, ${thresholdText}` : ''}`"
    >
      <div class="statc__meter-fill" :style="{ width: barPct + '%' }" />
      <div v-if="threshold !== null" class="statc__meter-tick" :style="{ left: Math.max(0, Math.min(100, threshold)) + '%' }" />
    </div>

    <span v-if="threshold !== null" class="statc__threshold text-style-utility-micro-regular">{{ thresholdText }}</span>
    <span v-if="hint" class="statc__hint text-style-utility-micro-regular">{{ hint }}</span>
  </div>
</template>

<style scoped>
.statc {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
  padding: var(--x-pad-surface-m);
  border-radius: var(--x-radius-container-s);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  background: var(--x-bg-card-default);
  container-type: inline-size;
}
.statc--row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-m);
}
.statc--row .statc__head { flex: 0 0 auto; gap: 4px; }
.statc--row .statc__status-word { display: none; }
.statc--row .statc__figure-row { flex: 0 0 auto; }
.statc--row .statc__meter { flex: 1 1 120px; margin-left: var(--x-gap-content-default); }
.statc--row .statc__threshold { display: none; }

.statc--bad { border-color: var(--x-border-input-error); }
.statc--warn { border-color: var(--x-border-input-warning); }
.statc--good { border-color: var(--x-border-input-success); }

.statc--hero {
  padding: var(--x-pad-surface-l, var(--x-pad-surface-m));
  gap: var(--x-gap-content-default);
}
.statc--hero .statc__frac { font-size: 1.6em; }
.statc--hero .statc__pct { font-size: 1.6em; }

.statc__head { display: flex; align-items: center; justify-content: space-between; gap: var(--x-gap-content-tight); }
.statc__label {
  color: var(--x-text-body-soft);
}
.statc__status { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; color: var(--x-text-body-subtle); }
.statc__status--good { color: var(--x-text-success-default); }
.statc__status--warn { color: var(--x-text-warning-default); }
.statc__status--bad { color: var(--x-text-error-default); }
.statc__status-word { white-space: nowrap; }

.statc__figure {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--x-gap-content-tight);
  font-variant-numeric: tabular-nums;
}
.statc__frac {
  color: var(--x-text-header-default);
  font-weight: 600;
}
.statc__dot {
  color: var(--x-text-body-subtle);
}
.statc__pct {
  color: var(--x-text-header-default);
  font-weight: 600;
}
.statc--good .statc__pct { color: var(--x-text-success-default); }
.statc--warn .statc__pct { color: var(--x-text-warning-default); }
.statc--bad .statc__frac,
.statc--bad .statc__pct { color: var(--x-text-error-default); }

.statc__meter {
  position: relative;
  height: 6px;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-bg-control-default);
  overflow: visible;
}
.statc__meter-fill {
  height: 100%;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-border-input-focused);
  transition: width 200ms ease;
  overflow: hidden;
}
.statc--good .statc__meter-fill { background: var(--x-border-input-success); }
.statc--warn .statc__meter-fill { background: var(--x-border-input-warning); }
.statc--bad .statc__meter-fill { background: var(--x-border-input-error); }
.statc__meter-tick {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  background: var(--x-text-header-default);
  opacity: 0.6;
  transform: translateX(-1px);
}

.statc__threshold {
  color: var(--x-text-body-subtle);
}
.statc__hint {
  color: var(--x-text-body-subtle);
}

@container (max-width: 220px) {
  .statc--row {
    flex-direction: column;
    align-items: flex-start;
  }
  .statc--row .statc__meter { margin-left: 0; width: 100%; }
}
</style>
