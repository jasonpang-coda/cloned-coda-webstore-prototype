<script setup>
import { computed } from 'vue'
import { useStoreAssets } from '../../composables/useStoreAssets.js'

/**
 * HomePayments — the local-payment-method reassurance strip. Reuses the
 * shared, polarity-keyed payment-channel logos from useStoreAssets (the same
 * registry TrustBar's paymentIcons row reads) rather than importing any
 * store-specific asset directly.
 *
 * Always a dramatic coral→magenta panel (--x-gradient-home-payments, Codashop-
 * only theme token) regardless of layout — everything else on the homepage
 * is indigo/acid/dark-neutral, so this section is deliberately its OWN fixed
 * colour rather than following --home-surface-* (which is inert on Standard
 * and a translucent dark-frost on Visual) so it reads as distinct in both.
 *
 * .fx-bloom (src/tokens/effects.css) adds a slow, soft breathing halo behind
 * the card — reused as-is rather than a bespoke animation (same effect
 * BestSellerCard uses for its hero SKU): a continuous ambient loop like this
 * should stay subtle and low-key per the motion-design skill, and an
 * existing, already reduced-motion-safe effect is the tasteful choice over
 * a one-off. --x-fx-bloom-image is overridden to a Codashop-only token
 * (--x-glow-home-payments) so the glow matches this card's own tertiary tones
 * instead of the global amber HDR default.
 */
defineProps({
  heading: { type: String, default: '' },
  sub: { type: String, default: '' },
})

const assets = useStoreAssets()
const icons = computed(() => [
  { logo: assets.value.pc.googleApple, label: 'Google Pay / Apple Pay' },
  { logo: assets.value.pc.creditCard,  label: 'Credit Card' },
  { logo: assets.value.pc.paypalVenmo, label: 'PayPal' },
  { logo: assets.value.pc.cashApp,     label: 'Cash App' },
])
</script>

<template>
  <div class="home-payments fx-bloom">
    <h4 class="home-payments__heading text-style-heading-card">{{ heading }}</h4>
    <p class="home-payments__sub text-style-paragraph-small">{{ sub }}</p>
    <div class="home-payments__grid">
      <div v-for="pm in icons" :key="pm.label" class="home-payments__pill">
        <img :src="pm.logo" :alt="pm.label" class="home-payments__icon" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-payments {
  position: relative;
  padding: var(--x-pad-surface-l);
  border-radius: var(--x-radius-container-s);
  background: var(--x-gradient-home-payments, var(--x-bg-card-subtle));
  text-align: center;
  --x-fx-bloom-image: var(--x-glow-home-payments);
}
.home-payments__heading {
  display: block;
  margin: 0 0 2px;
  color: var(--x-text-header-inverse);
}
.home-payments__sub {
  display: block;
  margin: 0 0 var(--x-gap-content-default);
  color: var(--x-text-body-inverse);
}
.home-payments__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--x-gap-content-default);
}
.home-payments__pill {
  height: var(--x-size-control-s);
  padding: 0 var(--x-pad-surface-m);
  display: flex;
  align-items: center;
  border-radius: var(--x-radius-control-s);
  background: var(--x-surface-frost-hover);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.home-payments__icon {
  height: var(--x-size-icon-l);
  width: auto;
  object-fit: contain;
}
</style>
