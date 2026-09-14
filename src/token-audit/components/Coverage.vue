<script setup>
/**
 * Coverage — used vs unused, broken down by tier and by family, plus the
 * actionable unused-token list (default sort: unused first). This is the
 * literal answer to "show what is being used and not used".
 */
import { computed, ref } from 'vue'
import StatCard from './StatCard.vue'
import { TokenChip } from '@coda/harness-kit/vue'
import MaterialIcon from '../../components/MaterialIcon.vue'
import { stat } from '../core/rollup.js'

const HEALTH_THRESHOLD = 80

const props = defineProps({
  model: { type: Object, required: true },
  bucket: { type: String, required: true },
})

const list = computed(() => [...props.model.tokens.values()].filter((t) => t.classify.bucket === props.bucket))

const byTier = computed(() => {
  const groups = new Map()
  for (const t of list.value) {
    if (!groups.has(t.classify.tier)) groups.set(t.classify.tier, [])
    groups.get(t.classify.tier).push(t)
  }
  return [...groups.entries()]
    .map(([tier, items]) => ({ tier, items, ...stat(items.filter((t) => t.usedAny).length, items.length) }))
    .sort((a, b) => a.pct - b.pct)
})

const byFamily = computed(() => {
  const groups = new Map()
  for (const t of list.value) {
    if (!groups.has(t.classify.family)) groups.set(t.classify.family, [])
    groups.get(t.classify.family).push(t)
  }
  return [...groups.entries()]
    .map(([family, items]) => ({ family, items, ...stat(items.filter((t) => t.usedAny).length, items.length) }))
    .sort((a, b) => a.pct - b.pct)
})

const search = ref('')
const showOnly = ref('unused') // 'all' | 'unused' | 'used'
const filtered = computed(() => {
  let items = list.value
  if (showOnly.value === 'unused') items = items.filter((t) => !t.usedAny)
  else if (showOnly.value === 'used') items = items.filter((t) => t.usedAny)
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    items = items.filter((t) => t.name.toLowerCase().includes(q))
  }
  return items.slice().sort((a, b) => (a.usedAny === b.usedAny ? a.name.localeCompare(b.name) : a.usedAny ? 1 : -1))
})
</script>

<template>
  <div class="cov">
    <div class="cov__section">
      <h3 class="cov__title text-style-utility-label-bold">Coverage by tier (lowest first)</h3>
      <div class="cov__rows">
        <StatCard v-for="g in byTier" :key="g.tier" :label="g.tier" v-bind="g" variant="row" :threshold="HEALTH_THRESHOLD" :tone="g.pct < 50 ? 'bad' : g.pct < HEALTH_THRESHOLD ? 'warn' : 'good'" />
      </div>
    </div>

    <div class="cov__section">
      <h3 class="cov__title text-style-utility-label-bold">Coverage by family (worst 15)</h3>
      <div class="cov__rows">
        <StatCard v-for="g in byFamily.slice(0, 15)" :key="g.family" :label="g.family" v-bind="g" variant="row" :threshold="HEALTH_THRESHOLD" :tone="g.pct < 50 ? 'bad' : g.pct < HEALTH_THRESHOLD ? 'warn' : 'good'" />
      </div>
    </div>

    <div class="cov__section">
      <div class="cov__list-header">
        <h3 class="cov__title text-style-utility-label-bold">Tokens ({{ filtered.length }})</h3>
        <div class="cov__list-controls">
          <select class="cov__select" v-model="showOnly">
            <option value="unused">Unused only</option>
            <option value="used">Used only</option>
            <option value="all">All</option>
          </select>
          <input class="cov__search" type="text" placeholder="Search…" v-model="search" />
        </div>
      </div>
      <p class="cov__legend text-style-utility-micro-regular">
        Signals: <strong>a</strong> read in .vue &nbsp;<strong>b</strong> aliased &nbsp;<strong>c</strong> dynamic (JS/template) &nbsp;<strong>d</strong> overridden by a theme — a filled, ticked square means that signal is on.
      </p>
      <div class="cov__token-list">
        <div v-for="t in filtered.slice(0, 200)" :key="t.name" class="cov__token-row">
          <TokenChip :name="t.name" :value="t.declarations[0]?.rawValue ?? ''" />
          <div class="cov__signals">
            <span class="cov__signal" :class="{ 'cov__signal--on': t.usage.css.used }">
              <MaterialIcon v-if="t.usage.css.used" name="check" variant="round" :size="10" />
              <template v-else>a</template>
            </span>
            <span class="cov__signal" :class="{ 'cov__signal--on': t.usage.alias.used }">
              <MaterialIcon v-if="t.usage.alias.used" name="check" variant="round" :size="10" />
              <template v-else>b</template>
            </span>
            <span class="cov__signal" :class="{ 'cov__signal--on': t.usage.js.used }">
              <MaterialIcon v-if="t.usage.js.used" name="check" variant="round" :size="10" />
              <template v-else>c</template>
            </span>
            <span class="cov__signal" :class="{ 'cov__signal--on': t.usage.theme.used }">
              <MaterialIcon v-if="t.usage.theme.used" name="check" variant="round" :size="10" />
              <template v-else>d</template>
            </span>
          </div>
        </div>
        <p v-if="filtered.length > 200" class="cov__more text-style-utility-micro-regular">…and {{ filtered.length - 200 }} more. Narrow the search.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cov { display: flex; flex-direction: column; gap: var(--x-gap-content-separation); max-width: 960px; }
.cov__title { color: var(--x-text-header-default); margin: 0 0 var(--x-gap-content-default); }
.cov__rows { display: flex; flex-direction: column; gap: var(--x-gap-content-tight); }
.cov__list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--x-gap-content-default); }
.cov__list-controls { display: flex; gap: var(--x-gap-content-tight); }
.cov__select, .cov__search {
  background: var(--x-bg-input-default);
  color: var(--x-text-body-default);
  border: var(--border-weight-default) solid var(--x-border-input-default);
  border-radius: var(--x-radius-input-s);
  padding: var(--x-pad-surface-xxs) var(--x-pad-surface-s);
  font: inherit;
}
.cov__token-list { display: flex; flex-direction: column; gap: var(--x-gap-content-tight); }
.cov__token-row { display: flex; align-items: center; justify-content: space-between; gap: var(--x-gap-content-default); }
.cov__signals { display: flex; gap: 4px; flex-shrink: 0; }
.cov__signal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: var(--border-weight-default) solid var(--x-border-card-default);
  color: var(--x-text-body-subtle);
  font-size: 10px;
  font-family: monospace;
}
.cov__signal--on { color: var(--x-text-success-inverse); background: var(--x-text-success-default); border-color: var(--x-text-success-default); }
.cov__more { color: var(--x-text-body-subtle); }
.cov__legend { color: var(--x-text-body-subtle); margin: calc(-1 * var(--x-gap-content-default)) 0 0; }
</style>
