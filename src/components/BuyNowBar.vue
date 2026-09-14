<script setup>
import { computed } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import Button from './Button.vue'
import { useCheckout } from '../composables/useCheckout.js'
import { useAuth } from '../composables/useAuth.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useLocale } from '../composables/useLocale.js'
import { formatNumber } from '../utils/formatNumber.js'

const assets = useStoreAssets()
const config = useStoreConfig()
const strings = useStoreStrings()
const { common } = useLocale()

/**
 * BuyNowBar — docked "Buy Now" strip (Figma 2867:9216 signed-in / 2542:3187
 * signed-out), the FCM Buy Now pilot's first step after a SKU tap (gated by
 * the fcmPaymentSheet flag — see useCheckout.usesBuyNowBar). Unlike the sheets
 * it sits ON the page with no scrim: the storefront stays visible/scrollable
 * behind it. Signed-out shows a SIGN IN CTA (the account gate CheckoutSheet
 * normally applies upfront); signed-in shows BUY NOW, which promotes the bar
 * into the full OrderSummarySheet via openPaymentSheet().
 *
 * forceReady (a second, independent mount path — Diablo Immortal's guided
 * checkout, see InlineCheckoutCta.vue) makes the bar visible and shows the
 * BUY NOW branch regardless of the FCM-pilot buyNowVisible/signedIn state —
 * for a guest-only inline-checkout store, "ready to buy" is simply both real
 * gates (SKU + payment channel) being cleared, not an auth state at all.
 * Every other mount path (FCM) omits it and keeps the original gating.
 */
const props = defineProps({
  isMobile: { type: Boolean, default: true },
  forceReady: { type: Boolean, default: false },
})

const { buyNowVisible, sheetOpen, selectedItem, selectedChannel, pendingBuyNowSignIn, openPaymentSheet } = useCheckout()
const { signedIn, startSignIn, startEaSignIn, eaSignInOpen, konamiSignInOpen } = useAuth()

// Only visible once the full sheet isn't (it takes over the same slot) and no
// full-screen sign-in overlay is covering the page (EA Account / KONAMI ID) —
// the bar would otherwise float on top of those pages.
const isVisible = computed(() => (buyNowVisible.value || props.forceReady) && !sheetOpen.value && !eaSignInOpen.value && !konamiSignInOpen.value)

// Item label — same fallback chain as CheckoutSheet's banner amount, so a
// bundle's title and a currency SKU's "amount + currency" both read correctly.
const summaryLabel = computed(() => {
  const item = selectedItem.value
  if (!item) return ''
  return item.label || [formatNumber(item.amount), item.currencyLabel].filter(v => v != null && v !== '').join(' ')
})

// Chosen payment channel's display name, once one has been picked in the sheet.
const channels = computed(() => config.value.checkout?.channels ?? [])
const selectedChannelName = computed(() => {
  const i = selectedChannel.value
  return i != null ? (channels.value[i]?.name ?? null) : null
})

const rewardsLabel = computed(() => {
  const loyalty = config.value.checkout?.loyalty
  const points = selectedItem.value?.loyaltyPoints
  if (!loyalty || points == null) return null
  return `${loyalty.label} ${formatNumber(points)}`
})

// Keys the content Transition below — any change that alters what's on
// screen (a different SKU, a newly picked channel, or the signed-in swap)
// gets a fresh key, so Vue crossfades the whole block instead of patching
// text/attributes in place.
const contentKey = computed(() => `${signedIn.value}|${selectedItem.value?.currentPrice}|${summaryLabel.value}|${selectedChannelName.value}`)

const emit = defineEmits(['buy-now'])

// forceReady mounts (Diablo Immortal's guided checkout) have no OrderSummarySheet
// to promote into — usesBuyNowBar()'s openPaymentSheet() is a no-op outside the
// FCM pilot presentation, so this "submits" via the parent instead.
function onBuyNow() {
  if (props.forceReady) emit('buy-now')
  else openPaymentSheet()
}

function onSignIn() {
  // Flags useCheckout's watcher to auto-promote into OrderSummarySheet once
  // sign-in completes, instead of leaving the user back on this bar.
  pendingBuyNowSignIn.value = true
  // Mirrors SignInSheet.handleFlow — FCM always resolves to 'ea-redirect',
  // but this stays store-agnostic in case a future Buy Now store differs.
  if (config.value.signIn?.flow === 'ea-redirect') startEaSignIn()
  else startSignIn()
}
</script>

<template>
  <Transition name="buynow" :duration="{ enter: 350, leave: 200 }">
    <div v-if="isVisible" class="buynow" :class="{ 'buynow--responsive': !isMobile }">
      <div class="buynow__panel">
        <!-- Crossfades the whole content block on any change — a different
             SKU, a newly picked payment channel, or the signed-out ↔ signed-in
             swap — rather than snapping. Keyed on contentKey so Vue treats
             each change as a full replace instead of patching nodes in place. -->
        <Transition name="buynow-content" mode="out-in">
          <div :key="contentKey" class="buynow__content">
            <!-- Summary — item label, plus the chosen channel once one is picked -->
            <div class="buynow__summary">
              <span class="buynow__summary-text text-style-utility-micro-regular">{{ summaryLabel }}</span>
              <template v-if="(signedIn || forceReady) && selectedChannelName">
                <span class="buynow__divider text-style-utility-micro-regular" aria-hidden="true">&middot;</span>
                <span class="buynow__summary-text text-style-utility-micro-regular">{{ selectedChannelName }}</span>
              </template>
            </div>

            <!-- Price + CTA -->
            <div class="buynow__row">
              <span
                class="buynow__price"
                :class="(signedIn || forceReady) ? 'text-style-heading-card' : 'text-style-heading-page-title'"
              >{{ selectedItem?.currentPrice }}</span>

              <Button
                v-if="signedIn || forceReady"
                variant="primary"
                size="large"
                shimmer
                haptic-token="confirm"
                label-style="text-style-heading-banner"
                class="buynow__cta buynow__cta--buy"
                @click="onBuyNow()"
              >{{ common.checkout.buyNow }}</Button>
              <Button
                v-else
                variant="primary"
                size="large"
                brand="signin"
                label-style="text-style-utility-action-uppercase"
                class="buynow__cta buynow__cta--signin"
                @click="onSignIn()"
              >
                <template v-if="assets.brand.logomark" #icon>
                  <img :src="assets.brand.logomark" alt="" class="buynow__cta-logo" aria-hidden="true" />
                </template>
                {{ strings.signIn?.cta }}
              </Button>
            </div>

            <!-- Rewards — MP mark shown alongside the amount regardless of auth state -->
            <div v-if="rewardsLabel" class="buynow__rewards" :class="{ 'buynow__rewards--soft': !signedIn }">
              <span class="buynow__rewards-text text-style-utility-micro-regular">{{ rewardsLabel }}</span>
              <img v-if="assets.brand.loyaltyIcon" :src="assets.brand.loyaltyIcon" alt="" aria-hidden="true" class="buynow__rewards-mp" />
              <MaterialIcon v-else name="stars" variant="round" :size="12" class="buynow__rewards-icon" />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.buynow {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3; /* above CategoryNav (0) / drawer (1) / loader (2), below sheets (4) */
  pointer-events: none; /* only the panel itself is interactive */
}

.buynow__panel {
  pointer-events: auto;
  width: 100%;
  padding: var(--x-pad-surface-m) var(--x-pad-surface-m) var(--x-pad-surface-xl);
  border-top: var(--border-weight-default) solid var(--x-border-soft);
  border-top-left-radius: var(--x-radius-container-s);
  border-top-right-radius: var(--x-radius-container-s);
  background-image: var(--x-bg-sheet);
  background-color: var(--x-bg-page);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
  box-shadow: var(--x-shadow-sheet);
}

/* Crossfades as a unit on the signed-out ↔ signed-in swap — see the
   Transition in the template. */
.buynow__content {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}

/* Summary row — item label + optional "· <channel>" */
.buynow__summary {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  width: 100%;
}
.buynow__summary-text {
  color: var(--x-text-header-default);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform-origin: left center;
}
/* Literal middle-dot character (·), not a drawn shape — a real unicode
   separator between the SKU title and the selected payment channel. */
.buynow__divider {
  flex-shrink: 0;
  color: var(--x-text-header-default);
}

/* Price + CTA row */
.buynow__row {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.buynow__price {
  flex: 1;
  min-width: 0;
  color: var(--x-text-final-price);
  white-space: nowrap;
  transform-origin: left center;
}

.buynow__cta {
  flex: 1;
  min-width: 0;
}

.buynow__cta--buy {
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
  /* gloss-metal shimmer: hot core tints toward this button's own brand fill
     instead of a generic white streak (see .claude/skills/material-fx). */
  --x-material-metal-gloss-shimmer-core: var(--x-bg-action-primary);
}

.buynow__cta--signin {
  --btn-text-color: var(--x-text-header-strong);
}
.buynow__cta-logo {
  width: var(--x-size-icon-s);
  height: var(--x-size-icon-s);
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}

/* Rewards */
.buynow__rewards {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--x-gap-content-narrow);
  width: 100%;
}
.buynow__rewards-text {
  color: var(--x-text-body-default);
  transform-origin: left center;
}
.buynow__rewards--soft .buynow__rewards-text {
  color: var(--x-text-body-soft);
}
.buynow__rewards-mp {
  height: var(--x-size-icon-xs);
  width: auto;
  display: block;
  flex-shrink: 0;
}
.buynow__rewards-icon {
  color: var(--x-text-header-strong);
  flex-shrink: 0;
}

/* ── Slide-up motion (mirrors the sheet shell — transform/opacity only) ────── */
.buynow-enter-active { transition: transform var(--x-motion-modal-enter), opacity var(--x-motion-modal-enter); }
.buynow-enter-from { transform: translateY(100%); opacity: 0; }
.buynow-enter-to   { transform: translateY(0); opacity: 1; }

.buynow-leave-active { transition: transform var(--x-motion-modal-exit), opacity var(--x-motion-modal-exit); }
.buynow-leave-from { transform: translateY(0); opacity: 1; }
.buynow-leave-to   { transform: translateY(100%); opacity: 0; }

/* ── Signed-out ↔ signed-in content crossfade (mode="out-in") ──────────────── */
.buynow-content-leave-active {
  transition: opacity var(--x-motion-sys-duration-exit) var(--x-motion-sys-ease-accelerate);
}
.buynow-content-leave-to { opacity: 0; }
.buynow-content-enter-active {
  transition: opacity var(--x-motion-sys-duration-slow) var(--x-motion-sys-ease-decelerate);
}
.buynow-content-enter-from { opacity: 0; }

/* ── Responsive (desktop) — pin to the viewport, centered column width ──────── */
.buynow--responsive {
  position: fixed;
}
@container (min-width: 801px) {
  .buynow--responsive {
    display: flex;
    justify-content: center;
    padding: 0 var(--x-pad-surface-xl);
  }
  .buynow--responsive .buynow__panel {
    width: 100%;
    max-width: 420px;
    border: var(--border-weight-default) solid var(--x-border-sheet);
    border-bottom: 0;
    border-radius: var(--x-radius-container-s) var(--x-radius-container-s) 0 0;
  }
}
</style>
