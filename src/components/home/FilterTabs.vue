<script setup>
import Button from '../Button.vue'

/**
 * FilterTabs — horizontal scrollable pill tabs (the trending-titles category
 * filter). Hick's-law grouping: a handful of named tabs instead of asking the
 * user to scan every title at once. Shared by both homepage layouts.
 */
defineProps({
  tabs: { type: Array, default: () => [] }, // [{ id, label }]
  active: { type: String, default: 'all' },
})
defineEmits(['update:active'])
</script>

<template>
  <div class="filter-tabs" role="tablist">
    <Button
      v-for="tab in tabs"
      :key="tab.id"
      variant="chip"
      :haptic="false"
      :active="active === tab.id"
      :label-style="active === tab.id ? 'text-style-utility-action-bold' : 'text-style-utility-action-regular'"
      role="tab"
      :aria-selected="active === tab.id"
      class="filter-tabs__tab"
      @click="$emit('update:active', tab.id)"
    >{{ tab.label }}</Button>
  </div>
</template>

<style scoped>
.filter-tabs {
  display: flex;
  gap: var(--x-gap-content-tight);
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
  /* Without this, .device__screen's own `touch-action: pan-y` (it needs
     that to own ambiguous vertical swipes) claims a horizontal drag over
     this row before it ever reaches this element's own overflow-x — same
     reason every other horizontal scroller in this app (TitleRail,
     BestSellerCarousel, the review stack's touch mode) declares this
     explicitly. Without it the row still scrolls with a mouse wheel/
     trackpad on desktop, which is why this only ever showed up on touch. */
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
}
.filter-tabs::-webkit-scrollbar { display: none; }

/* --x-bg-tag-neutral (theme-agnostic translucent black-tint) + inverse text
   is Button's own chip-variant default — no override needed here. */
.filter-tabs__tab {
  flex: 0 0 auto;
}
</style>
