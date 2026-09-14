<script setup>
defineProps({
  tiles: { type: Array, default: () => [] }, // [{ tag, heading, sub }]
})
</script>

<template>
  <div class="promo-tiles">
    <button v-for="(p, i) in tiles" :key="p.heading" v-ripple class="promo-tile" :class="`promo-tile--${i % 2}`" type="button">
      <span class="promo-tile__tag text-style-utility-micro-bold">{{ p.tag }}</span>
      <span class="promo-tile__heading text-style-heading-card">{{ p.heading }}</span>
      <span class="promo-tile__sub text-style-paragraph-small">{{ p.sub }}</span>
    </button>
  </div>
</template>

<style scoped>
.promo-tiles {
  display: flex;
  gap: var(--x-gap-content-default);
  overflow-x: auto;
  scrollbar-width: none;
}
.promo-tiles::-webkit-scrollbar { display: none; }

.promo-tile {
  flex: 0 0 78%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-height: 104px;
  padding: var(--x-pad-surface-l);
  border-radius: var(--x-radius-container-s);
  text-align: left;
  color: var(--x-text-header-inverse);
  transition: transform var(--x-motion-sku-hover), box-shadow var(--x-motion-sku-hover);
}
.promo-tile:hover {
  transform: translateY(-2px);
  box-shadow: var(--x-shadow-card-hover);
}
.promo-tile:active {
  transform: scale(0.98);
}
@container (min-width: 641px) {
  .promo-tile { flex: 0 0 calc(50% - 4px); }
}
.promo-tile--0 { background: var(--x-bg-action-subtle); }
.promo-tile--1 { background: var(--x-bg-card-highlighted); }

.promo-tile__tag {
  padding: 2px var(--x-pad-surface-xs);
  border-radius: var(--x-radius-badge-full);
  background: var(--x-bg-tag-inverse);
  text-transform: uppercase;
  margin-bottom: var(--x-gap-content-narrow);
}
.promo-tile__heading { margin: 0; }
.promo-tile__sub { opacity: 0.92; margin: 0; }
</style>
