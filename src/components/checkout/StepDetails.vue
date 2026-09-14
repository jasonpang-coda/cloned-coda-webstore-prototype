<script setup>
import { ref } from 'vue'
import StepCard from './StepCard.vue'
import MaterialIcon from '../MaterialIcon.vue'
import { useStoreStrings } from '../../composables/useStoreStrings.js'
import { useStoreConfig } from '../../composables/useStoreConfig.js'
import { triggerHaptic } from '../../composables/useHaptics.js'

/**
 * StepDetails — "Enter Details" step (Figma node 2198:5139), the final panel
 * of the inline checkout. Email + marketing-consent checkbox, an optional
 * Terms & Conditions block (strings.details.termsBody — null hides it, e.g.
 * every store before Diablo Immortal), plus the primary CTA.
 *
 * consentLabel/termsBody render via v-html — store copy is trusted, authored
 * content (same precedent as CategoryBanner's description prop), which lets
 * a store embed inline links (e.g. "Publisher Privacy Policy").
 *
 * config.checkout.detailsCta.icon (a MaterialIcon name, optional) puts a
 * leading icon on the CTA — absent for every store before Diablo Immortal, so
 * the button stays text-only elsewhere.
 *
 * config.checkout.stepCta: true moves the CTA out of this card entirely —
 * InlineCheckoutCta.vue renders it instead, as its own section, with a label/
 * progress-donut that update per checkout step (Diablo Immortal). Every other
 * inline-checkout store (e.g. Codashop) omits the flag and keeps the CTA here.
 */
const strings = useStoreStrings()
const config = useStoreConfig()
const email = ref('')
const consent = ref(false)

const emit = defineEmits(['submit'])
function onSubmit() {
  triggerHaptic('success')
  emit('submit')
}
</script>

<template>
  <StepCard :title="strings.details?.heading">
    <p class="details__helper text-style-utility-label-regular">{{ strings.details?.helperText }}</p>
    <input
      v-model="email"
      type="email"
      class="details__input text-style-utility-label-regular"
      :placeholder="strings.details?.emailLabel"
    />
    <label class="details__consent">
      <input v-model="consent" type="checkbox" class="details__checkbox" />
      <span class="details__consent-label text-style-utility-label-regular" v-html="strings.details?.consentLabel"></span>
    </label>

    <div v-if="strings.details?.termsBody" class="details__terms">
      <p v-if="strings.details?.termsHeading" class="details__terms-heading text-style-utility-label-uppercase">{{ strings.details?.termsHeading }}</p>
      <p class="details__terms-body text-style-paragraph-small" v-html="strings.details?.termsBody"></p>
    </div>

    <button v-if="!config.checkout.stepCta" v-ripple type="button" class="details__cta text-style-utility-action-uppercase" @click="onSubmit">
      <MaterialIcon v-if="config.checkout.detailsCta?.icon" :name="config.checkout.detailsCta.icon" variant="round" :size="20" />
      <span>{{ strings.details?.submitCta }}</span>
    </button>
  </StepCard>
</template>

<style scoped>
.details__helper {
  margin: 0;
  color: var(--x-text-body-subtle);
}

.details__input {
  width: 100%;
  height: var(--x-size-input-m);
  padding: 0 var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-input-default);
  border-radius: var(--x-radius-input-s);
  background: var(--x-bg-input-default);
  color: var(--x-text-body-default);
  display: block;
  transform: none;
  line-height: 1;
  outline: none;
  box-sizing: border-box;
}
.details__input::placeholder { color: var(--x-text-placeholder); }
.details__input:focus { border-color: var(--x-border-input-focused); }

.details__consent {
  display: flex;
  align-items: flex-start;
  gap: var(--x-gap-control-s);
  cursor: pointer;
}

.details__checkbox {
  flex-shrink: 0;
  width: var(--x-size-icon-m);
  height: var(--x-size-icon-m);
  margin: 0;
  accent-color: var(--x-bg-action-primary);
}

.details__consent-label {
  color: var(--x-text-body-soft);
}
.details__consent-label :deep(a) {
  color: var(--x-text-hyperlink-default);
}

.details__terms {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
  padding-top: var(--x-pad-surface-s);
  border-top: var(--border-weight-default) solid var(--x-border-divider);
}
.details__terms-heading {
  color: var(--x-text-header-default);
}
.details__terms-body {
  margin: 0;
  color: var(--x-text-body-soft);
}
.details__terms-body :deep(a) {
  color: var(--x-text-hyperlink-default);
}

.details__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-tight);
  height: var(--x-size-control-m);
  padding: 0 var(--x-pad-surface-xl);
  border: 0;
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-action-primary);
  color: var(--x-text-on-primary);
  cursor: pointer;
}
</style>
