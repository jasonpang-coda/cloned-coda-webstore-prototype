<script setup>
/**
 * Stores — per-store override counts, dead-override counts, and the
 * orphan-theme flag. All 13 stores, always visible (the store selector in
 * the sidebar highlights one, but this tab exists precisely to compare
 * across stores, so it never filters down to one).
 */
import { computed } from 'vue'
import StatCard from './StatCard.vue'
import MaterialIcon from '../../components/MaterialIcon.vue'
import { stat } from '../core/rollup.js'

const props = defineProps({
  model: { type: Object, required: true },
  selectedStore: { type: String, default: null },
})

const rows = computed(() => {
  const maxOverrides = Math.max(1, ...Object.values(props.model.perStore).map((s) => s.overrideCount))
  return Object.entries(props.model.perStore)
    .map(([store, s]) => ({ store, ...s, overridesStat: stat(s.overrideCount, maxOverrides), deadStat: stat(s.deadOverrideCount, s.overrideCount || 1) }))
    .sort((a, b) => b.overrideCount - a.overrideCount)
})
</script>

<template>
  <div class="stores">
    <p class="stores__def text-style-utility-label-regular">
      Override count = distinct tokens this store's theme file repoints (base layer only — HDR and sub-theme variants excluded).
      Dead = a repoint that the cascade never actually applies (rule D01).
    </p>
    <div class="stores__list">
      <div
        v-for="r in rows"
        :key="r.store"
        class="stores__row"
        :class="{ 'stores__row--selected': r.store === selectedStore, 'stores__row--orphan': r.orphan }"
      >
        <span class="stores__name">
          <MaterialIcon v-if="r.store === selectedStore" name="chevron_right" variant="round" :size="14" class="stores__selected-icon" />
          {{ r.store }}
          <span v-if="r.orphan" class="stores__orphan-badge">
            <MaterialIcon name="warning" variant="round" :size="11" />
            orphan
          </span>
        </span>
        <StatCard :label="'overrides'" v-bind="stat(r.overrideCount, rows[0].overrideCount)" variant="row" bar />
        <StatCard :label="'dead'" v-bind="r.deadStat" variant="row" :tone="r.deadOverrideCount > 0 ? 'bad' : 'good'" bar />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stores { display: flex; flex-direction: column; gap: var(--x-gap-content-separation); max-width: 960px; }
.stores__def { color: var(--x-text-body-soft); line-height: 1.5; }
.stores__list { display: flex; flex-direction: column; gap: var(--x-gap-content-default); }
.stores__row {
  display: grid;
  grid-template-columns: 140px 1fr 1fr;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-s) var(--x-pad-surface-m);
  border-radius: var(--x-radius-container-xs);
  border: var(--border-weight-default) solid var(--x-border-card-default);
}
.stores__row--selected { border-color: var(--x-border-input-focused); }
.stores__row--orphan { border-color: var(--x-border-input-error); }
.stores__name { font-weight: 600; color: var(--x-text-header-default); display: flex; align-items: center; gap: 6px; }
.stores__selected-icon { color: var(--x-text-hyperlink-default); flex-shrink: 0; }
.stores__orphan-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  text-transform: uppercase;
  color: var(--x-text-error-default);
  border: var(--border-weight-default) solid var(--x-border-input-error);
  border-radius: 4px;
  padding: 1px 4px;
}
</style>
