<script setup>
import { ref } from 'vue'
import { useDragScroll } from '../composables/useDragScroll.js'
import BundleItem from './BundleItem.vue'

/**
 * BundleBreakdown — the row of child SKU tiles ("what's inside") shared by every
 * card that can surface bundled items: BundleSkuCard, BestSellerCard and
 * SkuImageCard. Owns the flex row, horizontal drag-scroll and the BundleItem
 * loop; hosts position it (overlap margin / inset padding) by passing a class,
 * which falls through to the root and merges with the component's own styles.
 *
 * Renders nothing when `items` is empty, so a host can mount it unconditionally.
 */
defineProps({
  /** Child items: [{ image, tileBg, tag, quantity }] — shape per BundleItem props. */
  items: { type: Array, default: () => [] },
  /** When true, the row scrolls horizontally instead of overflowing (wide item sets). */
  scrollable: { type: Boolean, default: false },
})

// Forwarded to the host (e.g. BundleSkuCard opens the Item Summary sheet).
const emit = defineEmits(['select'])

const rootRef = ref(null)
const { isDragging } = useDragScroll(rootRef)
</script>

<template>
  <div
    v-if="items.length"
    ref="rootRef"
    class="bundle-breakdown"
    :class="{ 'bundle-breakdown--scroll': scrollable, 'is-dragging': isDragging }"
  >
    <BundleItem
      v-for="(item, i) in items"
      :key="i"
      v-bind="item"
      @select="emit('select', $event)"
    />
  </div>
</template>

<style scoped>
.bundle-breakdown {
  position: relative;
  z-index: 1;
  display: flex;
  gap: var(--x-gap-content-narrow);
}

/* Horizontal-scroll variant (e.g. a wide item set in a narrow card) */
.bundle-breakdown--scroll {
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.bundle-breakdown--scroll::-webkit-scrollbar { display: none; }
.bundle-breakdown--scroll.is-dragging { user-select: none; }
</style>
