<script setup>
/**
 * PaymentChannelSheetChoreographyStage — the live visual stage for this
 * flow's Choreography tab.
 *
 * Mounts the REAL CheckoutStepBody and drives the REAL
 * `useCheckout().showBoletoKyc` singleton — CheckoutStepBody already owns
 * the actual cross-fade (`<Transition name="ckb-swap" mode="out-in">`,
 * duration-fast/ease-accelerate leave then duration-base/ease-decelerate
 * enter — the exact tokens this flow's choreography[] names), so this stage
 * does not reimplement it. An earlier version manually cross-faded a
 * SEPARATE, independently-mounted <BoletoKycForm> on top of CheckoutStepBody
 * with a hand-rolled opacity calc — wrong on two counts: (1) it modeled the
 * swap as an overlapping fade when `mode="out-in"` is actually sequential
 * (old fully exits before new enters), and (2) since CheckoutStepBody reads
 * the SAME global showBoletoKyc singleton internally, that flag being left
 * true by some other stage (e.g. the CheckoutStepFooter entry's Checkout
 * button — its offStage doesn't reset the flag) could make CheckoutStepBody
 * ALSO render its own internal BoletoKycForm at the same time, stacked under
 * the explicit one — the "content switches back to form" bug.
 *
 * `mode="out-in"` can't be scrubbed to an arbitrary frozen mid-frame (it's a
 * one-shot Vue transition, not a function of time) — so instead of faking
 * that, this crosses the toggle at the timeline's midpoint: scrubbing/
 * playing across the middle of the range flips showBoletoKyc and lets the
 * REAL transition play, at its REAL timing. Resets the singleton on unmount
 * so leaving this tab never leaks state into another stage.
 */
import { computed, onBeforeUnmount, watch } from 'vue'
import CheckoutStepBody from '../../components/steps/CheckoutStepBody.vue'
import { useCheckout } from '../../composables/useCheckout.js'

const props = defineProps({
  ms: { type: Number, required: true },
  range: { type: Number, required: true },
  data: { type: Object, required: true },
})

const { showBoletoKyc, selectedChannel } = useCheckout()
selectedChannel.value = 4 // Boleto — the only channel this cross-fade applies to

const pastMidpoint = computed(() => props.ms >= props.range / 2)
watch(pastMidpoint, (v) => { showBoletoKyc.value = v }, { immediate: true })

onBeforeUnmount(() => { showBoletoKyc.value = false; selectedChannel.value = 0 })
</script>

<template>
  <div class="pcs-stage">
    <CheckoutStepBody :data="data" :is-mobile="true" />
  </div>
</template>

<style scoped>
.pcs-stage {
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
}
</style>
