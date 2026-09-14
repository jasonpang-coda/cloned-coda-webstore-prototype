<script setup>
/**
 * AccordionPanel — the collapsible content wrapper paired with
 * AccordionHeader. The grid-template-rows 0fr→1fr height transition is the
 * sanctioned accordion recipe, duplicated identically in HomeFaq,
 * ItemSummaryAccordion, and PromoCode before this extraction — <details>
 * can't animate its own open/close height without extra JS, so every
 * accordion in this codebase already used this same three-layer structure
 * (grid track, inner clip, padded content).
 */
defineProps({
  open: { type: Boolean, required: true },
  text: { type: String, default: null }, // fallback content when no default slot is provided (e.g. in the harness, which only binds props)
})
</script>

<template>
  <div class="ap" :class="{ 'is-open': open }">
    <div class="ap__inner">
      <div class="ap__pad">
        <slot>{{ text }}</slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--x-motion-accordion);
}
.ap.is-open {
  grid-template-rows: 1fr;
}
.ap__inner {
  min-height: 0;
  overflow: hidden;
}
.ap__pad {
  padding: var(--ap-padding, 0 var(--x-pad-surface-l) var(--x-pad-surface-m));
}
</style>
