<script setup>
import { ref } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'
import { useDragScroll } from '../../composables/useDragScroll.js'

defineProps({
  reviews: { type: Array, default: () => [] }, // [{ quote, name, meta }]
})

const listRef = ref(null)
const { isDragging } = useDragScroll(listRef)

const AVATAR_COLORS = ['var(--x-bg-indicator-brand-default)', 'var(--x-bg-indicator-prominent-default)', 'var(--x-bg-indicator-success-default)']
</script>

<template>
  <div ref="listRef" class="review-rail" :class="{ 'is-dragging': isDragging }">
    <div v-for="(r, i) in reviews" :key="r.name" class="review-rail__item">
      <div class="review-rail__stars">
        <MaterialIcon v-for="n in 5" :key="n" name="star_fill" :size="14" class="review-rail__star" />
      </div>
      <p class="review-rail__quote text-style-paragraph-regular">"{{ r.quote }}"</p>
      <div class="review-rail__who">
        <span class="review-rail__avatar text-style-utility-action-bold" :style="{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }">
          {{ r.name[0] }}
        </span>
        <div>
          <div class="review-rail__name text-style-utility-action-bold">{{ r.name }}</div>
          <div class="review-rail__meta text-style-utility-micro-regular">{{ r.meta }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-rail {
  display: flex;
  gap: var(--x-gap-content-default);
  overflow-x: auto;
  cursor: grab;
  padding-block: 4px;
  padding-inline: var(--x-pad-surface-m);
  scroll-padding-inline: var(--x-pad-surface-m);
  scrollbar-width: none;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.review-rail::-webkit-scrollbar { display: none; }
.review-rail.is-dragging { cursor: grabbing; user-select: none; -webkit-user-select: none; }

.review-rail__item {
  flex: 0 0 84%;
  padding: var(--x-pad-surface-l);
  border-radius: var(--x-radius-container-s);
  background: var(--x-home-surface-bg, var(--x-bg-card-default));
  border: var(--border-weight-default) solid var(--x-home-surface-border, transparent);
  box-shadow: var(--x-shadow-card);
  backdrop-filter: var(--x-home-surface-blur, none);
  -webkit-backdrop-filter: var(--x-home-surface-blur, none);
}
@container (min-width: 801px) {
  .review-rail__item { flex: 0 0 calc((100% - 16px) / 3); }
}

.review-rail__stars {
  display: flex;
  gap: 2px;
  margin-bottom: var(--x-gap-content-default);
  color: var(--x-text-warning-default);
}
.review-rail__quote {
  margin: 0 0 var(--x-gap-content-default);
  color: var(--x-home-surface-text-sub, var(--x-text-body-default));
}
.review-rail__who {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
}
.review-rail__avatar {
  flex: 0 0 auto;
  width: var(--x-size-control-s);
  height: var(--x-size-control-s);
  display: grid;
  place-items: center;
  border-radius: var(--x-radius-control-full);
  color: var(--x-text-on-primary);
}
.review-rail__name {
  display: block;
  color: var(--x-home-surface-text, var(--x-text-header-default));
}
.review-rail__meta {
  display: block;
  color: var(--x-home-surface-text-sub, var(--x-text-body-subtle));
}
</style>
