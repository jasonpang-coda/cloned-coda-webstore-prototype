<script setup>
import { computed, toRefs } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'
import Button from '../Button.vue'
import { useCheckout } from '../../composables/useCheckout.js'
import { formatNumber } from '../../utils/formatNumber.js'

/**
 * PaymentStepFooter — the payment step's pinned footer: rewards line + full-
 * width CTA (disabled until a channel is chosen), then the "View Terms and
 * Conditions" link that scrolls PaymentStepBody's static legal bar into
 * view. Reads `useCheckout().selectedChannel` directly — the same shared
 * singleton PaymentStepBody reads — so the two halves stay in sync without a
 * prop bridge. Sibling to PaymentStepBody; see that file for why the step is
 * split in two.
 */
const props = defineProps({
  data: { type: Object, required: true },
  // From BaseSheet's #footer scoped slot — true while the body has more
  // content below the fold. Hides the terms link once the legal bar it
  // jumps to already fits on screen (a "view" link is redundant then).
  canScrollBody: { type: Boolean, default: false },
})
const { data } = toRefs(props)

const emit = defineEmits(['confirm'])

const { selectedChannel } = useCheckout()

const canCheckout = computed(() => selectedChannel.value !== null)
const checkoutLabel = computed(() => (canCheckout.value ? data.value.actionLabel : data.value.selectPaymentCta))

function onConfirm() {
  if (!canCheckout.value) return
  emit('confirm')
}

// Scrolls PaymentStepBody's `.sheet__terms` legal bar into view — a sibling
// component's element, queried directly rather than plumbed through a ref
// (a pure scroll convenience, no state to keep in sync).
function onViewTerms() {
  document.querySelector('.sheet__terms')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="payment-footer">
    <div class="sheet__footer-cta">
      <span
        v-if="data.loyalty && data.loyaltyPoints != null"
        class="sheet__rewards text-style-utility-default-bold"
      >
        {{ data.loyalty.label }} {{ formatNumber(data.loyaltyPoints) }}
        <img v-if="data.loyaltyIcon" :src="data.loyaltyIcon" alt="" aria-hidden="true" class="sheet__rewards-mp" />
        <MaterialIcon v-else name="stars" variant="round" :size="16" class="sheet__rewards-icon" />
      </span>
      <Button
        variant="primary"
        size="large"
        full-width
        shimmer
        haptic-token="confirm"
        label-style="text-style-heading-banner"
        :disabled="!canCheckout"
        class="sheet__checkout"
        @click="onConfirm()"
      >{{ checkoutLabel }}</Button>
    </div>
    <Button
      v-if="canScrollBody"
      variant="link"
      full-width
      label-style="text-style-utility-label-regular"
      class="sheet__terms-link"
      @click="onViewTerms()"
    >{{ data.viewTerms }}</Button>
  </div>
</template>

<style scoped>
/* Single root so BaseSheet's shared .sheet__footer gap (tuned for the other
   sheets' flatter footers) never applies here — this footer's own two-part
   vertical rhythm (cta group, then the terms link) needs the wider
   "separation" gap, controlled entirely within this component. */
.payment-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-separation);
  width: 100%;
}
.sheet__footer-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.sheet__terms-link :deep(.btn__label) {
  transform-origin: center center;
}
.sheet__rewards {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  color: var(--x-text-header-strong);
  white-space: nowrap;
}
.sheet__rewards-mp {
  height: var(--x-size-icon-s);
  width: auto;
  display: block;
  flex-shrink: 0;
}
.sheet__rewards-icon { color: var(--x-text-header-strong); flex-shrink: 0; }

.sheet__checkout {
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
  /* gloss-metal shimmer: hot core tints toward this button's own brand fill
     instead of a generic white streak (see .claude/skills/material-fx). */
  --x-material-metal-gloss-shimmer-core: var(--x-bg-action-primary);
}
.sheet__checkout:hover:not(:disabled) { filter: brightness(1.05); }
.sheet__checkout:disabled { transform: scale(0.97); }
</style>
