<script setup>
import { computed } from 'vue'
import FilterDropdown from './FilterDropdown.vue'

/**
 * CategoryJumpNav — end-of-category navigation: a dropdown to jump to any
 * category. Two modes, mirroring CategoryNav's own scroll/filter split:
 *
 *   'scroll' (default) — every category is already on the page (multi-level
 *             nav); picking one scrollIntoView's its `cat-{id}` anchor.
 *   'filter'          — only the active category renders (legacy FCM filter
 *             mode); picking one just emits `select` and lets the parent
 *             swap the active category (same as CategoryNav's filter mode).
 *
 * `categories` ids are raw catalogue ids (unprefixed) in both modes.
 */
const props = defineProps({
  /** [{ id, label }] full ordered category list (raw ids, unprefixed) */
  categories: { type: Array, required: true },
  /** Current category's raw id */
  currentId: { type: String, required: true },
  /** 'scroll' (default, multi-level) | 'filter' (legacy, parent-controlled) */
  mode: { type: String, default: 'scroll' },
})
const emit = defineEmits(['select'])

const dropdownOptions = computed(() => props.categories.map(c => ({ key: c.id, label: c.label })))

const prefersReduced = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

function goTo(id) {
  emit('select', id)
  if (props.mode === 'filter') return
  const el = document.getElementById(`cat-${id}`)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' })
}
</script>

<template>
  <nav v-if="categories.length > 1" class="category-jump-nav" aria-label="Category navigation">
    <FilterDropdown
      class="category-jump-nav__dropdown"
      :model-value="currentId"
      :options="dropdownOptions"
      label="Jump to category"
      :panel-blur="64"
      :panel-opaque="false"
      @update:model-value="goTo"
    />
  </nav>
</template>

<style scoped>
.category-jump-nav {
  display: flex;
  justify-content: center;
  padding-top: var(--x-pad-surface-l);
}

/* Wider than FilterDropdown's own 200px default — this dropdown's option
   labels (subcategory names) run longer than the generic filter it was
   originally built for. Read by FilterDropdown itself (the trigger's own
   rendered width feeds its teleported panel's computed width) — safe to set
   here via a plain CSS custom property despite the panel living elsewhere
   once open, since only the (non-teleported) trigger needs to see it. */
.category-jump-nav__dropdown {
  --dropdown-w: 260px;
}
</style>
