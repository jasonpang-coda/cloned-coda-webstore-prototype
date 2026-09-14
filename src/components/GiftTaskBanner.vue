<script setup>
import CategoryBanner from './CategoryBanner.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import Button from './Button.vue'

/**
 * GiftTaskBanner — CategoryBanner wrapped with the task-gated gift's
 * step-driven action (a toggle for the push step, a CTA pill otherwise).
 * Grounded in OrderCompletePage's gift banner; presentational only — the
 * caller owns which step is active (useTaskGiftClaim.js) and reacts to
 * `update:toggle`/`cta-click`. App.vue's own Gifts-category banner uses a
 * near-identical pattern but adds a glow animation this component doesn't
 * have yet, so it stays a one-off consumer for now, not migrated here.
 */
defineProps({
  icon: { type: String, default: null },
  title: { type: String, default: null },
  description: { type: String, default: null },
  mode: { type: String, default: 'cta' }, // 'cta' | 'toggle'
  tone: { type: String, default: null }, // null | 'success'
  toggleModelValue: { type: Boolean, default: false },
  toggleAriaLabel: { type: String, default: null },
  togglePoi: { type: String, default: null },
  ctaLabel: { type: String, default: null },
  ctaIcon: { type: String, default: null },
  ctaPoi: { type: String, default: null },
})

defineEmits(['update:toggle', 'cta-click'])
</script>

<template>
  <CategoryBanner
    class="gift-task-banner"
    :class="{ 'gift-task-banner--success': tone === 'success' }"
    :icon="icon"
    :title="title"
    :description="description"
  >
    <template v-if="mode === 'toggle'" #action>
      <ToggleSwitch
        :model-value="toggleModelValue"
        :data-poi="togglePoi"
        :aria-label="toggleAriaLabel"
        @update:model-value="$emit('update:toggle', $event)"
      />
    </template>
    <template v-else #action>
      <Button
        variant="tertiary"
        size="medium"
        :icon="ctaIcon"
        icon-position="leading"
        :data-poi="ctaPoi"
        label-style="text-style-utility-default-uppercase"
        class="gift-task-banner__cta"
        @click="$emit('cta-click')"
      >{{ ctaLabel }}</Button>
    </template>
  </CategoryBanner>
</template>

<style scoped>
/* Positive tone — a reward the user just earned, not a generic promo, so it
   borrows the shared "success" info-banner fill with a visibly stronger
   success border (see OrderCompletePage's original comment: the info-banner
   "-success" border token aliases the same subtle value as its own fill and
   was invisible against it; the tag-success border sits a step darker). */
.gift-task-banner--success { border-color: var(--x-border-tag-success); }
.gift-task-banner--success :deep(.category-banner__bg-overlay) {
  background: var(--x-bg-info-banner-success);
}

.gift-task-banner__cta {
  --btn-border: var(--x-border-signin-btn);
  --btn-text-color: var(--x-text-header-default);
  --btn-bg-hover: var(--x-surface-ghost-3);
  --btn-hover-filter: none;
}
</style>
