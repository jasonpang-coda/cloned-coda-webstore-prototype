<script setup>
import { computed, toRefs } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'
import Button from '../Button.vue'

/**
 * InfoStepFooter — the "ITEM SUMMARY" step's pinned footer (buyNow/sign-in
 * CTA row). Sibling to InfoStepBody — see that file for why the step is
 * split into a body + footer component pair.
 */
const props = defineProps({
  data: { type: Object, required: true },
  primaryAction: { type: Object, required: true },
})
const { data, primaryAction } = toRefs(props)

defineEmits(['buy-now', 'sign-in', 'sign-in-id'])

const bundle = computed(() => data.value.bundle)
const isFcmBuyNow = computed(() => data.value.footer === 'buyNow')
</script>

<template>
  <template v-if="isFcmBuyNow">
    <div class="isum__buynow-row">
      <span
        class="isum__buynow-price"
        :class="data.canBuy ? 'text-style-heading-card' : 'text-style-heading-page-title'"
      >{{ bundle.currentPrice }}</span>
      <Button
        v-if="data.canBuy"
        variant="primary"
        size="large"
        shimmer
        haptic-token="confirm"
        label-style="text-style-heading-banner"
        class="isum__buynow-cta isum__buynow-cta--buy"
        @click="$emit('buy-now')"
      >{{ primaryAction.label }}</Button>
      <Button
        v-else
        variant="primary"
        size="large"
        brand="signin"
        label-style="text-style-utility-action-uppercase"
        class="isum__buynow-cta isum__buynow-cta--signin"
        @click="$emit('sign-in')"
      >
        <template v-if="data.logomark" #icon>
          <img :src="data.logomark" alt="" class="isum__buynow-cta-logo" aria-hidden="true" />
        </template>
        {{ data.signInCta }}
      </Button>
    </div>

    <div v-if="data.rewardsLabel" class="isum__buynow-rewards" :class="{ 'isum__buynow-rewards--soft': !data.canBuy }">
      <span class="isum__buynow-rewards-text text-style-utility-micro-regular">{{ data.rewardsLabel }}</span>
      <img v-if="data.loyaltyIcon" :src="data.loyaltyIcon" alt="" aria-hidden="true" class="isum__buynow-rewards-mp" />
      <MaterialIcon v-else name="stars" variant="round" :size="12" class="isum__buynow-rewards-icon" />
    </div>
  </template>

  <template v-else>
    <template v-if="data.canBuy">
      <Button
        variant="primary"
        size="large"
        full-width
        shimmer
        haptic-token="confirm"
        label-style="text-style-heading-banner"
        class="isum__buy"
        @click="$emit('buy-now')"
      >{{ primaryAction.label }}</Button>
    </template>
    <template v-else>
      <Button
        variant="tertiary"
        size="large"
        full-width
        label-style="text-style-utility-action-uppercase"
        class="isum__signin-btn"
        @click="$emit('sign-in')"
      >
        <template #icon><img :src="data.logomark" alt="" class="isum__signin-logo" aria-hidden="true" /></template>
        {{ data.signInCta }}
      </Button>
      <span class="isum__or text-style-utility-label-regular">{{ data.orLabel }}</span>
      <Button variant="link" class="isum__signin-id" @click="$emit('sign-in-id')">{{ data.signInIdCta }}</Button>
    </template>
  </template>
</template>

<style scoped>
.isum__buynow-row {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.isum__buynow-price {
  flex: 1;
  min-width: 0;
  color: var(--x-text-final-price);
  white-space: nowrap;
  transform-origin: left center;
}
.isum__buynow-cta {
  flex: 1;
  min-width: 0;
}
.isum__buynow-cta--buy {
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
  /* gloss-metal shimmer: hot core tints toward this button's own brand fill
     instead of a generic white streak (see .claude/skills/material-fx). */
  --x-material-metal-gloss-shimmer-core: var(--x-bg-action-primary);
}
.isum__buynow-cta-logo {
  width: var(--x-size-icon-s);
  height: var(--x-size-icon-s);
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}
.isum__buynow-rewards {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--x-gap-content-narrow);
  width: 100%;
}
.isum__buynow-rewards-text { color: var(--x-text-body-default); transform-origin: left center; }
.isum__buynow-rewards--soft .isum__buynow-rewards-text { color: var(--x-text-body-soft); }
.isum__buynow-rewards-mp {
  height: var(--x-size-icon-xs);
  width: auto;
  display: block;
  flex-shrink: 0;
}
.isum__buynow-rewards-icon { color: var(--x-text-header-strong); flex-shrink: 0; }

.isum__buy {
  /* Deliberately preserved as-is: this CTA uses --x-radius-container-xs
     while its siblings (BuyNowBar, CheckoutStepFooter, PaymentStepFooter,
     isum__buynow-cta--buy above) all use the pill radius
     (--x-radius-control-full) — likely an authoring inconsistency between
     otherwise-identical "primary purchase CTA" buttons, but not this
     migration's call to silently unify; flagged for a follow-up design
     decision instead. */
  --btn-radius: var(--x-radius-container-xs);
  --btn-bg: var(--x-text-hyperlink-default);
  --btn-bg-hover: var(--x-text-hyperlink-default);
  --btn-bg-pressed: var(--x-text-hyperlink-default);
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
  /* gloss-metal shimmer: hot core tints toward this button's own fill instead
     of a generic white streak (see .claude/skills/material-fx). */
  --x-material-metal-gloss-shimmer-core: var(--x-text-hyperlink-default);
}
.isum__buy:hover { filter: brightness(1.05); }

.isum__signin-btn {
  --btn-radius: var(--x-radius-container-xs);
}
.isum__signin-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}
.isum__or { color: var(--x-text-body-default); text-align: center; transform-origin: center center; }
</style>
