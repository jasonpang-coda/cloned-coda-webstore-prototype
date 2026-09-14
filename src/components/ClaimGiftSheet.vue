<script setup>
import { computed } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import Button from './Button.vue'
import BaseSheet from './base/BaseSheet.vue'
import PlayerAccount from './PlayerAccount.vue'
import { useGiftClaim } from '../composables/useGiftClaim.js'
import { useAuth } from '../composables/useAuth.js'
import { useCheckout } from '../composables/useCheckout.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { formatNumber } from '../utils/formatNumber.js'

const strings = useStoreStrings()
const config  = useStoreConfig()
const assets  = useStoreAssets()

/**
 * ClaimGiftSheet — the COD:M gift-claim sheet (sibling of PurchaseSheet). Opens
 * when a user taps a gift card. Two views, both sharing the header:
 *   • Confirm  — "You are about to claim <title>" + a SKU banner. When signed out,
 *                the gamer-ID form (PlayerAccount) appears below the banner; the
 *                "Claim Gift" CTA stays disabled until the account is identified.
 *   • Success  — confirmation label + upsell SKU banner. CTA triggers checkout for
 *                the upsell item (price shown as the label). Fired alongside the
 *                success snackbar by confirmClaim().
 *
 * Chrome (scrim, panel, transitions, responsive modal, scroll-fade, Escape) is
 * BaseSheet's; the confirm↔success body swap uses BaseSheet's `contentKey`
 * resize + cross-fade engine directly (no more bespoke onBodyBeforeLeave/
 * onBodyEnter height-morph hooks — that's exactly what the engine was built
 * for). The outward handoff to PurchaseSheet (the upsell CTA) is a plain
 * close + openCheckout() — PurchaseSheet is a persistent, always-mounted
 * surface now (see App.vue), so there's no cross-mount height to capture;
 * it just opens fresh with its own entrance animation once this sheet closes.
 */
const props = defineProps({
  isMobile: { type: Boolean, default: true },
  /** Best-seller (or any featured) SKU to upsell in the success view. */
  upsellItem: { type: Object, default: null },
})

const { claimSheetOpen, selectedGift, claimSuccess, requiresAccount, pendingEaGift, confirmClaim, closeGiftClaim } = useGiftClaim()
const { signedIn, startEaSignIn, startKonamiSignIn } = useAuth()
const { guestVerified, openCheckout } = useCheckout()

// True when the store uses EA Account sign-in (FCM). Drives the footer variant
// for signed-out users: EA button instead of the disabled Claim Gift CTA.
const isEaFlow = computed(() => config.value.signIn?.flow === 'ea-redirect')

// True when the store uses KONAMI ID sign-in (myKONAMI overlay flow).
const isKonamiFlow = computed(() =>
  config.value.signIn?.mobile?.includes('mykonami') ||
  config.value.signIn?.desktop?.includes('mykonami') || false
)

// CTA enables once the account is identified (signed in or guest-verified inline).
const canClaim = computed(() => signedIn.value || guestVerified.value)

// Footer shows the EA sign-in button while the user is signed out on an EA-flow store.
const showEaSignIn = computed(() => requiresAccount.value && isEaFlow.value && !signedIn.value)

// Footer shows the KONAMI sign-in button while the user is signed out on a mykonami store.
const showKonamiSignIn = computed(() => requiresAccount.value && isKonamiFlow.value && !signedIn.value)

// EA-flow: save the pending gift, close the sheet, then open the sign-in overlay.
// useGiftClaim's watcher detects signedIn → true and re-opens the sheet in
// success state, so the user lands directly on the success view after signing in.
function onEaSignIn() {
  pendingEaGift.value = selectedGift.value
  closeGiftClaim()
  startEaSignIn()
}

// KONAMI-flow: same pattern — save pending gift, close sheet, open myKONAMI overlay.
function onKonamiSignIn() {
  pendingEaGift.value = selectedGift.value
  closeGiftClaim()
  startKonamiSignIn()
}

// Success CTA — closes this sheet and opens PurchaseSheet fresh for the
// upsell item.
function onUpsellCta() {
  if (!props.upsellItem) return
  openCheckout(props.upsellItem)
  closeGiftClaim()
}
</script>

<template>
  <BaseSheet
    :open="claimSheetOpen"
    :is-mobile="isMobile"
    size-hint="content"
    :content-key="claimSuccess ? 'success' : 'confirm'"
    :duration="{ enter: 350, leave: 350 }"
    aria-label="Claim gift"
    @close="closeGiftClaim()"
  >
    <!-- Header — title crossfades between views -->
    <template #header>
      <Transition name="claim-title" mode="out-in">
        <span :key="claimSuccess" class="sheet__title text-style-heading-modal">{{ claimSuccess ? strings.page.giftClaimedHeading : strings.page.giftClaimHeading }}</span>
      </Transition>
      <Button variant="icon" size="medium" icon="close" aria-label="Close" class="sheet__close" @click="closeGiftClaim()" />
    </template>

    <!-- Body — BaseSheet's contentKey engine resizes + cross-fades between
         confirm and success (bound to claimSuccess above). -->
    <template v-if="!claimSuccess">
      <p class="sheet__label text-style-paragraph-regular">
        {{ strings.page.giftClaimLabel }} {{ selectedGift?.title }}
      </p>

      <!-- SKU banner — same treatment as the checkout chosen-item banner -->
      <div class="sheet__banner">
        <div class="sheet__banner-bg" aria-hidden="true"></div>
        <div class="sheet__banner-content">
          <img
            v-if="selectedGift?.image"
            :src="selectedGift.image"
            alt=""
            class="sheet__banner-thumb sheet__banner-thumb--img"
          />
          <div v-else class="sheet__banner-thumb" aria-hidden="true"></div>
          <div class="sheet__banner-info" v-if="selectedGift">
            <p v-if="selectedGift.title" class="sheet__banner-amount text-style-heading-banner">{{ selectedGift.title }}</p>
            <p v-if="selectedGift.subtitle" class="sheet__banner-subtitle text-style-utility-label-regular">{{ selectedGift.subtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Gamer-ID form — COD:M signed-out flow only; EA/KONAMI-flow stores use
           the footer sign-in button instead. -->
      <PlayerAccount v-if="requiresAccount && !isEaFlow && !isKonamiFlow" :base-delay="0" :show-pwa-link="false" />
    </template>

    <template v-else>
      <!-- "<title> has been sent to your COD:M inbox." -->
      <p class="sheet__label text-style-paragraph-regular">
        {{ selectedGift?.title }} {{ strings.page.giftClaimedBody }}
      </p>

      <!-- Upsell intro + best-seller banner -->
      <template v-if="upsellItem">
        <p class="sheet__label text-style-paragraph-regular">
          {{ strings.page.giftClaimedUpsellIntro }}
        </p>
        <div class="sheet__banner">
          <div class="sheet__banner-bg" aria-hidden="true"></div>
          <div class="sheet__banner-content">
            <img
              v-if="upsellItem.skuImage"
              :src="upsellItem.skuImage"
              alt=""
              class="sheet__banner-thumb sheet__banner-thumb--img"
            />
            <div v-else class="sheet__banner-thumb" aria-hidden="true"></div>
            <div class="sheet__banner-info">
              <p class="sheet__banner-amount text-style-heading-banner">
                {{ upsellItem.label || [formatNumber(upsellItem.amount), upsellItem.currencyLabel].filter(v => v != null && v !== '').join(' ') }}
              </p>
              <p v-if="upsellItem.subtitle" class="sheet__banner-subtitle text-style-utility-label-regular">{{ upsellItem.subtitle }}</p>
              <p
                v-if="upsellItem.baseAmount != null && upsellItem.bonusAmount != null"
                class="sheet__banner-bonus text-style-utility-label-regular"
              >
                <span>{{ formatNumber(upsellItem.baseAmount) }} + </span>
                <span class="sheet__bonus text-style-utility-default-bold">{{ formatNumber(upsellItem.bonusAmount) }} {{ upsellItem.bonusLabel }}</span>
              </p>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- Footer — CTA crossfades between views -->
    <template #footer>
      <Transition name="claim-footer" mode="out-in">
        <!-- EA sign-in — FCM signed-out state: closes the sheet, opens the EA
             sign-in overlay; on completion the gift claim success view reopens. -->
        <Button
          v-if="!claimSuccess && showEaSignIn"
          key="confirm-ea"
          variant="primary"
          size="large"
          label-style="text-style-heading-banner"
          class="sheet__cta sheet__cta--ea"
          @click="onEaSignIn()"
        >
          <template #icon><img :src="assets.brand.logomark" alt="" class="sheet__cta-ea-logo" aria-hidden="true" /></template>
          {{ strings.signIn.cta }}
        </Button>
        <!-- KONAMI sign-in — ygodl signed-out state: closes the sheet, opens the
             myKONAMI overlay; on completion the gift claim success view reopens. -->
        <Button
          v-else-if="!claimSuccess && showKonamiSignIn"
          key="confirm-konami"
          variant="primary"
          size="large"
          label-style="text-style-utility-action-bold"
          class="sheet__cta sheet__cta--mykonami"
          @click="onKonamiSignIn()"
        >{{ strings.signIn.mykonami.cta }}</Button>
        <!-- Normal confirm CTA — enabled once account is identified -->
        <Button
          v-else-if="!claimSuccess"
          key="confirm"
          variant="primary"
          size="large"
          :shimmer="canClaim"
          haptic-token="confirm"
          label-style="text-style-heading-banner"
          :disabled="!canClaim"
          class="sheet__cta"
          @click="confirmClaim()"
        >{{ strings.page.giftClaimCta }}</Button>
        <!-- Success CTA — close or upsell checkout -->
        <Button
          v-else
          key="success"
          variant="primary"
          size="large"
          shimmer
          haptic-token="confirm"
          label-style="text-style-heading-banner"
          class="sheet__cta"
          @click="onUpsellCta()"
        >{{ upsellItem?.currentPrice || strings.page.giftClaimDoneCta }}</Button>
      </Transition>
    </template>

    <!-- Success bg glow — radiates once on claim confirm, fades back to original surface -->
    <template #panel-overlay>
      <div class="sheet__success-overlay" :class="{ 'sheet__success-overlay--active': claimSuccess }" aria-hidden="true" />
    </template>
  </BaseSheet>
</template>

<style scoped>
/* Header title + close — this component overrides BaseSheet's #header slot
   (for the confirm/success title crossfade), so BaseSheet's own .sheet__title/
   .sheet__close rules don't apply here: scoped CSS only matches elements
   carrying the SAME component's scope attribute, and this slot content is
   ClaimGiftSheet's own markup, not BaseSheet's. Redefined here so the title
   still grows to push the close button to the right. */
.sheet__title {
  flex: 1;
  min-width: 0;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}
.sheet__close {
  flex-shrink: 0;
}

.sheet__label {
  margin: 0;
  color: var(--x-text-body-default);
  transform-origin: left center;
}

/* Chosen-item banner — mirrors CheckoutSheet.__banner */
.sheet__banner {
  position: relative;
  width: 100%;
  height: 80px;
  padding: var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-border-soft-2);
  border-radius: var(--x-radius-container-xs);
  overflow: hidden;
  display: flex;
  align-items: center;
}
.sheet__banner-bg {
  position: absolute;
  inset: 0;
  background: var(--x-gradient-checkout-banner);
}
.sheet__banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.sheet__banner-thumb {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: var(--x-radius-container-xs);
  background: var(--x-gradient-thumb-gloss);
  border: var(--border-weight-default) solid var(--x-border-soft);
}
.sheet__banner-thumb--img {
  object-fit: contain;
  background: none;
}
.sheet__banner-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}
.sheet__banner-amount {
  text-transform: uppercase;
  color: var(--x-text-header-default);
}
.sheet__banner-subtitle {
  color: var(--x-text-body-default);
}
.sheet__banner-bonus {
  text-transform: uppercase;
  color: var(--x-text-header-strong);
  display: block;
}
.sheet__bonus { color: var(--x-text-bonus-amount); }

/* Yellow primary CTA — fluid width, same pattern as the checkout Buy Now button */
.sheet__cta {
  width: 100%;
  --btn-bg: var(--x-text-hyperlink-default);
  --btn-bg-hover: var(--x-text-hyperlink-default);
  --btn-bg-pressed: var(--x-text-hyperlink-default);
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
  /* gloss-metal shimmer: hot core tints toward this button's own fill instead
     of a generic white streak (see .claude/skills/material-fx). */
  --x-material-metal-gloss-shimmer-core: var(--x-text-hyperlink-default);
}
.sheet__cta:hover:not(:disabled) { filter: brightness(1.05); }
.sheet__cta:disabled { transform: scale(0.97); }

/* EA Account sign-in button — store-themed action color (EA red for FCM),
   same token used by PageSignInSection and SignInSheet. Overrides .sheet__cta's
   --btn-bg (same specificity, later in file — plain cascade, not the `brand`
   prop, since a --btn-bg set anywhere always wins over --btn-brand-bg in
   Button's fallback chain regardless of source). */
.sheet__cta--ea {
  --btn-bg: var(--x-bg-action-signin, var(--x-bg-action-primary));
  --btn-bg-hover: var(--x-bg-action-signin, var(--x-bg-action-primary));
  --btn-bg-pressed: var(--x-bg-action-signin, var(--x-bg-action-primary));
  --btn-text-color: var(--x-text-header-strong);
  gap: var(--x-gap-content-narrow);
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
}
.sheet__cta--ea:hover { filter: brightness(1.08); }
.sheet__cta-ea-logo {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
}

/* KONAMI ID sign-in button — matches page-signin__btn--mykonami exactly. */
.sheet__cta--mykonami {
  --btn-bg: var(--x-bg-action-mykonami, var(--x-bg-action-signin));
  --btn-bg-hover: var(--x-bg-action-mykonami, var(--x-bg-action-signin));
  --btn-bg-pressed: var(--x-bg-action-mykonami, var(--x-bg-action-signin));
  --btn-text-color: var(--x-text-body-default);
}
.sheet__cta--mykonami:hover { filter: brightness(1.08); }

/* Header title crossfade — copy changes without teleporting */
.claim-title-leave-active {
  transition: opacity var(--x-motion-sys-duration-fast) var(--x-motion-sys-ease-accelerate);
}
.claim-title-leave-to { opacity: 0; }
.claim-title-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.claim-title-enter-from { opacity: 0; }

/* Footer CTA crossfade */
.claim-footer-leave-active {
  transition: opacity var(--x-motion-sys-duration-fast) var(--x-motion-sys-ease-accelerate);
}
.claim-footer-leave-to { opacity: 0; }
.claim-footer-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.claim-footer-enter-from { opacity: 0; }

/* Success bg glow — radiates once across the panel surface after the body
   transition settles. Uses the solid success green at 25% peak opacity so the
   tint is clearly visible against the dark frosted panel. Delay tuned to
   BaseSheet's contentKey engine's own height-morph duration (--motion-sys-
   duration-slow) so the glow fires on a settled surface. opacity-only → GPU-
   composited, 60fps-safe. Use animation longhands (easing token contains a
   comma → shorthand is banned). */
.sheet__success-overlay {
  position: absolute;
  inset: 0;
  background: var(--x-bg-indicator-success-default);
  pointer-events: none;
  opacity: 0;
}
.sheet__success-overlay--active {
  animation-name: success-bg-glow;
  animation-duration: var(--x-motion-sys-duration-slowest);
  animation-delay: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: forwards;
}
@keyframes success-bg-glow {
  0%   { opacity: 0; }
  15%  { opacity: 0.25; }
  100% { opacity: 0; }
}
</style>
