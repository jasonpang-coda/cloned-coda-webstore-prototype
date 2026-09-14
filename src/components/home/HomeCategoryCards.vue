<script setup>
defineProps({
  categories: { type: Array, default: () => [] }, // [{ id, label, count, cover }]
  /** Selected category id, or null — toggles .cat-card--active. */
  active: { type: String, default: null },
})
defineEmits(['select'])
</script>

<template>
  <div class="cat-cards">
    <button
      v-for="c in categories"
      :key="c.id"
      v-ripple
      type="button"
      class="cat-card"
      :class="{ 'cat-card--active': c.id === active }"
      :aria-pressed="c.id === active"
      @click="$emit('select', c.id)"
    >
      <span class="cat-card__cover">
        <img v-if="c.cover" :src="c.cover" alt="" class="cat-card__img" loading="lazy" />
      </span>
      <span class="cat-card__body">
        <span class="cat-card__label text-style-utility-action-bold">{{ c.label }}</span>
        <span class="cat-card__count text-style-utility-micro-regular">{{ c.count }} titles</span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.cat-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--x-gap-content-default);
}
@container (min-width: 801px) {
  .cat-cards { grid-template-columns: repeat(4, 1fr); }
}

.cat-card {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-m);
  border-radius: var(--x-radius-container-s);
  background: var(--x-home-surface-bg, var(--x-bg-card-default));
  border: var(--border-weight-default) solid var(--x-home-surface-border, transparent);
  box-shadow: var(--x-shadow-card);
  backdrop-filter: var(--x-home-surface-blur, none);
  -webkit-backdrop-filter: var(--x-home-surface-blur, none);
  text-align: left;
  transition: transform var(--x-motion-sku-hover), box-shadow var(--x-motion-sku-hover);
}
.cat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--x-shadow-card-hover);
}
.cat-card:active {
  transform: scale(0.98);
}
.cat-card--active {
  border-color: var(--x-border-sku-card-selected);
  box-shadow: var(--x-shadow-card-hover);
}

.cat-card__cover {
  flex: 0 0 auto;
  width: var(--x-size-img-m);
  height: var(--x-size-img-m);
  border-radius: var(--x-radius-container-xs);
  overflow: hidden;
  background: var(--x-bg-sku-card-default);
}
.cat-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cat-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.cat-card__label {
  display: block;
  color: var(--x-home-surface-text, var(--x-text-header-default));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cat-card__count {
  display: block;
  color: var(--x-home-surface-text-sub, var(--x-text-body-default));
}
</style>
