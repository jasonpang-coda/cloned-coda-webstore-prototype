<script setup>
/**
 * StepCard — shared white surface primitive for Codashop's inline checkout
 * steps (config.checkout.mode === 'inline'). Every panel in the right rail
 * (Enter Gamer ID, Select Recharge, Select Payment, Zip Code, Enter Details)
 * is one of these — see the Figma reference, node 2189:2729.
 */
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <section class="step-card">
    <h2 class="step-card__title text-style-heading-modal">{{ title }}</h2>
    <div class="step-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.step-card {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
  padding: var(--x-pad-surface-l);
  background: var(--x-bg-card-default);
  border: var(--border-weight-default) solid var(--x-border-card-default);
  border-radius: var(--x-radius-container-m);
}

.step-card__title {
  margin: 0;
  color: var(--x-text-header-default);
}

.step-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
}
</style>
