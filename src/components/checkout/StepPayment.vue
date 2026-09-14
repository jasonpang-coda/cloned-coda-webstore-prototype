<script setup>
import { computed } from 'vue'
import PcCard from './PcCard.vue'
import { useStoreAssets } from '../../composables/useStoreAssets.js'
import { useStoreStrings } from '../../composables/useStoreStrings.js'
import { useStoreConfig } from '../../composables/useStoreConfig.js'
import { useCheckout } from '../../composables/useCheckout.js'
import { useLocale } from '../../composables/useLocale.js'

/**
 * StepPayment — "Select Payment" step (Figma node 2198:5134). A grid of
 * PcCard payment-channel tiles reading assets.pc, modelled on CheckoutSheet's
 * sheet__pc-list (same channel list/order + shared PcCard component), but
 * laid out as its own page section — a heading + grid, same shape as
 * SkuImageList's own header/grid — with NO enclosing StepCard container.
 *
 * The channel SET is config-driven (config.checkout.paymentChannels, an
 * ordered array of CHANNEL_DEFS keys) so a store can show a different local
 * payment mix without a component edit. Omitting the flag keeps the original
 * 4-channel default (every existing store). A channel with no real logo
 * asset yet (e.g. regional carrier billing marks not shipped in this repo)
 * renders as a generic icon + label tile rather than a fabricated brand mark
 * — the codebase's existing "text-only, no fabricated logos" precedent
 * (see TrustBar's publisherChips).
 *
 * Selection reads/writes the shared useCheckout() singleton (selectedChannel),
 * not local state — so the price line here and the storefront's own SKU
 * selection stay in sync: once useCheckout().selectedItem is set (a SKU
 * tapped), every card shows that item's price.
 */
const assets = useStoreAssets()
const strings = useStoreStrings()
const config = useStoreConfig()
const { common } = useLocale()
const { selectedItem, selectedChannel } = useCheckout()

const CHANNEL_DEFS = computed(() => ({
  googleApple:  { logo: assets.value.pc.googleApple, icon: null,              label: 'Google Pay / Apple Pay' },
  creditCard:   { logo: assets.value.pc.creditCard,  icon: null,              label: common.value.checkout.cardPayments },
  paypalVenmo:  { logo: assets.value.pc.paypalVenmo, icon: null,              label: 'PayPal' },
  cashApp:      { logo: assets.value.pc.cashApp,     icon: null,              label: 'Cash App' },
  // No shipped logo asset yet — generic icon + label tile (see file header).
  payNow:       { logo: null, icon: 'qr_code_2',        label: 'PayNow' },
  grabPay:      { logo: null, icon: 'local_taxi',        label: 'GrabPay' },
  weChatPay:    { logo: null, icon: 'chat',              label: 'WeChat Pay' },
  starHub:      { logo: null, icon: 'sim_card',          label: 'StarHub' },
  m1:           { logo: null, icon: 'sim_card',          label: 'M1' },
  singTel:      { logo: null, icon: 'sim_card',          label: 'Singtel' },
}))

const channels = computed(() => {
  const keys = config.value.checkout.paymentChannels ?? ['googleApple', 'creditCard', 'paypalVenmo', 'cashApp']
  return keys.map(key => ({ key, ...CHANNEL_DEFS.value[key] }))
})

// Every tile shows the same price once a SKU is selected upstream (mirrors
// sheetContent.js's channelPrice() — a flat per-item price, not per-channel,
// unless a channel defines its own fee — no fee model in this inline flow yet).
const priceDisplay = computed(() => selectedItem.value?.currentPrice ?? null)
</script>

<template>
  <div class="step-payment">
    <div class="step-payment__header">
      <h2 class="step-payment__title text-style-heading-banner">{{ strings.payment?.heading }}</h2>
    </div>
    <div class="step-payment__grid">
      <PcCard
        v-for="(ch, i) in channels"
        :key="ch.key"
        :logo="ch.logo"
        :icon="ch.icon"
        :label="ch.label"
        :price="priceDisplay"
        :selected="selectedChannel === i"
        @click="selectedChannel = i"
      />
    </div>
  </div>
</template>

<style scoped>
/* Same shape as SkuImageList's own header + grid — no enclosing card. */
.step-payment {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
}

.step-payment__header {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
}

.step-payment__title {
  text-transform: uppercase;
  color: var(--x-text-header-default);
  margin: 0;
  display: block;
}

/* 2 columns on mobile, 4 at >= S breakpoint — mirrors SkuImageList's grid. */
.step-payment__grid {
  display: grid;
  gap: var(--x-gap-content-default);
  grid-template-columns: repeat(2, 1fr);
}
@container (min-width: 641px) {
  .step-payment__grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
