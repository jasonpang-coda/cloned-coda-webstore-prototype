<script setup>
/**
 * PaymentChannelSheetComposed — handoff-only composition of BaseSheet +
 * CheckoutStepBody + CheckoutStepFooter mounted TOGETHER, so the Components
 * tab can show the actual composed landscape sheet (BaseSheet's 5fr:3fr
 * grid) in one render. The flow's other two entries deliberately stage the
 * body and footer in isolation — that's the right view for auditing each
 * one's own contract/tokens — but neither shows what the real, composed page
 * looks like, which is what this entry is for.
 *
 * Never mounted by the real app — the actual app composes these three
 * through src/components/PurchaseSheet.vue instead, driven by real
 * open/contentKey/orientation state rather than being force-open like this.
 */
import BaseSheet from '../../components/base/BaseSheet.vue'
import CheckoutStepBody from '../../components/steps/CheckoutStepBody.vue'
import CheckoutStepFooter from '../../components/steps/CheckoutStepFooter.vue'

defineProps({
  data: { type: Object, required: true },
  primaryAction: { type: Object, required: true },
})
</script>

<template>
  <BaseSheet
    open
    is-mobile
    landscape-full
    size-hint="tall"
    title="Order Summary"
    :dismissable="false"
    :show-close="false"
  >
    <CheckoutStepBody :data="data" :is-mobile="true" />
    <template #footer="{ canScrollBody }">
      <CheckoutStepFooter
        :data="data"
        :primary-action="primaryAction"
        :can-scroll-body="canScrollBody"
        :is-mobile="true"
      />
    </template>
  </BaseSheet>
</template>
