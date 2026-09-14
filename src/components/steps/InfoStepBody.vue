<script setup>
import { computed, toRefs } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'
import Media from '../Media.vue'
import ItemSummaryAccordion from '../ItemSummaryAccordion.vue'
import { useCountdown } from '../../composables/useCountdown.js'

/**
 * InfoStepBody — the "ITEM SUMMARY" step's scrolling body (product block +
 * "you will receive" accordion). Presentational: renders `data` (the resolved
 * `info` content descriptor from sheetContent.js) and never reads config/
 * strings/assets itself — that branching now lives in the descriptor.
 * Rendered inside PurchaseSheet's BaseSheet default (body) slot. Sibling to
 * InfoStepFooter — split in two because BaseSheet keeps the scrolling body
 * and the pinned footer as separate slots.
 */
const props = defineProps({
  data: { type: Object, required: true },
})
const { data } = toRefs(props)

const bundle = computed(() => data.value.bundle)
const endsAt = computed(() => bundle.value?.endsAt ?? null)
const { countdown, urgency } = useCountdown(endsAt)
</script>

<template>
  <template v-if="data.showProduct">
    <div v-if="data.canBuy" class="isum__account">
      <MaterialIcon name="account_circle" variant="round" :size="16" />
      <span class="isum__account-name text-style-utility-default-bold">{{ data.accountName }}</span>
    </div>
    <div v-else class="isum__signin-msg">
      <span class="isum__signin-msg-text text-style-utility-default-regular">{{ data.signedOutMessage }}</span>
    </div>

    <div class="isum__product">
      <div class="isum__banner">
        <Media :src="bundle.bannerImage" class="isum__banner-img" />
        <Media v-if="bundle.skuOnBanner && bundle.skuImage" :src="bundle.skuImage" class="isum__banner-sku" />
      </div>
      <div class="isum__info">
        <div class="isum__info-left">
          <p class="isum__title text-style-heading-card">{{ bundle.title }}</p>
          <p v-if="bundle.limitLabel" class="isum__limit text-style-utility-default-regular">{{ bundle.limitLabel }}</p>
          <span v-if="countdown" class="isum__timer" :data-urgency="urgency">
            <MaterialIcon name="schedule" variant="round" :size="14" class="isum__timer-icon" />
            <span class="isum__timer-text text-style-utility-default-regular">{{ data.endsLabel }} {{ countdown }}</span>
          </span>
        </div>
        <div class="isum__price">
          <div v-if="bundle.originalPrice || bundle.discountPercent" class="isum__discount">
            <span v-if="bundle.originalPrice" class="isum__original text-style-utility-label-strikethrough">{{ bundle.originalPrice }}</span>
            <span v-if="bundle.discountPercent" class="isum__discount-pct text-style-utility-label-regular">{{ bundle.discountPercent }}</span>
          </div>
          <span class="isum__current text-style-heading-card">{{ bundle.currentPrice }}</span>
        </div>
      </div>
    </div>
  </template>

  <div class="isum__list">
    <p v-if="data.receiveLabel" class="isum__list-label text-style-utility-default-regular">{{ data.receiveLabel }}</p>
    <ItemSummaryAccordion
      v-for="(item, i) in bundle.items"
      :key="i"
      v-bind="item"
      :compact="data.compactAccordion"
    />
  </div>
</template>

<style scoped>
.isum__account {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  width: 100%;
  padding: var(--x-pad-surface-xs) var(--x-pad-surface-s);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-bg-indicator-neutral-default);
  color: var(--x-text-body-default);
}
.isum__account-name { transform-origin: center center; }

.isum__signin-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-soft);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-bg-sku-card-default);
}
.isum__signin-msg-text {
  color: var(--x-text-body-default);
  text-align: center;
  transform-origin: center center;
}

.isum__product {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
  width: 100%;
  padding-bottom: var(--x-pad-surface-m);
  border-bottom: var(--border-weight-default) solid var(--x-border-divider);
}
.isum__banner {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: var(--x-radius-container-s);
  overflow: hidden;
}
.isum__banner :deep(.isum__banner-img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.isum__banner :deep(.isum__banner-sku) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  object-fit: contain;
  pointer-events: none;
}
.isum__info {
  display: flex;
  align-items: flex-start;
  gap: var(--x-gap-content-default);
}
.isum__info-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-narrow);
  align-items: flex-start;
}
.isum__title {
  margin: 0;
  text-transform: uppercase;
  color: var(--x-text-header-default);
  transform-origin: left center;
}
.isum__limit {
  margin: 0;
  color: var(--x-text-body-default);
}
.isum__timer {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  white-space: nowrap;
}
.isum__timer-icon { flex-shrink: 0; }
.isum__timer[data-urgency='default'] .isum__timer-icon,
.isum__timer[data-urgency='default'] .isum__timer-text { color: var(--x-text-body-default); }
.isum__timer[data-urgency='warning'] .isum__timer-icon,
.isum__timer[data-urgency='warning'] .isum__timer-text { color: var(--x-text-warning-default); }
.isum__timer[data-urgency='error']   .isum__timer-icon,
.isum__timer[data-urgency='error']   .isum__timer-text { color: var(--x-text-error-default); }

.isum__price {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--x-gap-content-narrow);
}
.isum__discount {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
}
.isum__original { color: var(--x-text-body-default); transform-origin: right center; }
.isum__discount-pct { color: var(--x-text-success-default); transform-origin: right center; }
.isum__current {
  color: var(--x-text-final-price, var(--x-text-hyperlink-default));
  white-space: nowrap;
  transform-origin: right center;
}

.isum__list {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.isum__list-label {
  margin: 0;
  color: var(--x-text-body-default);
  transform-origin: left center;
}
</style>
