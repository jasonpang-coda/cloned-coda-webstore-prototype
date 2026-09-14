<script setup>
import { ref, computed } from 'vue'
import BaseSheet from './base/BaseSheet.vue'
import MaterialIcon from './MaterialIcon.vue'
import Button from './Button.vue'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useTaskGiftClaim } from '../composables/useTaskGiftClaim.js'
import { useWebPush } from '../composables/useWebPush.js'
import { useFeatureFlags } from '../composables/useFeatureFlags.js'
import { useCheckout } from '../composables/useCheckout.js'
import { formatNumber } from '../utils/formatNumber.js'

/**
 * TaskGiftSheet — THE merged install/notify sheet for the task-gated 88 CP
 * gift (see useTaskGiftClaim.js). Every install/enable-notifications
 * touchpoint in the store (drawer, download banner, gifts banner, story CTA,
 * gift card, Order Complete banner) opens this one sheet — there is no
 * separate standalone install sheet any more.
 *
 * Content branches on usePwaInstall's `variant` ('ios' | 'webview' |
 * 'android' — see that composable's doc), because eligibility itself differs
 * by platform (confirmed via research, not a UX choice): Android/Chromium
 * doesn't need install for Web Push at all, so its `step` machine skips
 * straight to a single "enable notifications" requirement, spelled out as
 * prose rather than a checklist item; iOS needs install first (PushManager
 * only exists for an installed PWA) and shows the real Add-to-Home-Screen
 * steps; an in-app WebView (Instagram/TikTok/etc.) can do neither from
 * inside itself, so it gets the same 2-item checklist shape as iOS but with
 * generic "open in your browser" steps instead.
 *
 * While step is 'install' (ios/webview only), the media + numbered steps
 * render directly under the checklist — no tap required to reveal them, and
 * no second sheet opens on top of this one either. BaseSheet's own
 * contentKey resize engine (keyed on step + variant) grows/shrinks this
 * single sheet to fit as that block appears/disappears.
 */
const props = defineProps({
  isMobile: { type: Boolean, default: true },
  /** Best-seller (or any featured) SKU to upsell in the claimed view — same
   *  role as ClaimGiftSheet's own upsellItem prop. */
  upsellItem: { type: Object, default: null },
})

const strings = useStoreStrings()
const assets = useStoreAssets()
const { sheetOpen, step, variant, claim, closeSheet, unclaim } = useTaskGiftClaim()
const { enable: enableWebPush } = useWebPush()
const { isEnabled } = useFeatureFlags()
const { openCheckout } = useCheckout()
const showUnclaim = computed(() => step.value === 'claimed' && isEnabled('allowGiftUnclaim'))

const t = computed(() => strings.value.page.giftTask)
const pwaStrings = computed(() => strings.value.page?.pwaInstall)

// Install-instructions content — iOS gets the real Add-to-Home-Screen steps,
// webview gets the generic "open in your browser" ones (see
// useWebviewDetect.js's class doc: neither install nor push works inside an
// in-app browser, so leaving it is the only path forward). Android never
// shows this block at all — see useTaskGiftClaim.js's step machine.
const installSteps = computed(() => variant.value === 'webview' ? pwaStrings.value?.webviewSteps : pwaStrings.value?.iosSteps)
const installDemoSrc = computed(() => {
  const key = variant.value === 'webview' ? 'webviewOpenDemo' : 'iosInstallDemo'
  return assets.value.content?.[key] ?? null
})
const isVideoDemo = computed(() => /\.(webm|mp4)$/i.test(installDemoSrc.value ?? ''))

// Reward art for the sheet's own SKU-style banner — same 88 CP coin lookup
// App.vue's cpCoinFor(88) uses, resolved here via useStoreAssets directly
// since this component doesn't have App.vue's local helper.
const rewardImage = computed(() => assets.value.content?.cpCoins?.[88] ?? null)
const rewardAmount = computed(() => `${formatNumber(88)} ${strings.value.currency?.abbr ?? ''}`.trim())

const stepDone = computed(() => ({
  install: step.value !== 'install',
  push: step.value === 'claim' || step.value === 'claimed',
}))

// Keyed on variant too, not just step — switching the device-frame between
// iOS/webview while sitting on 'install' changes the instructions block's
// content (and thus height) without step itself changing.
const contentKey = computed(() => `${step.value}:${variant.value}`)

const headerTitle = computed(() => step.value === 'claimed' ? t.value?.claimedHeading : t.value?.sheetTitle)

// One-shot success pulse (see .task-gift-sheet__success-overlay below) — a
// transient local flag, NOT derived from `step === 'claimed'` directly,
// since `claimed` is persisted: reopening an already-claimed sheet must not
// replay the glow, only the moment the user actually taps Claim. Mirrors
// useWebPush.js's justEnabled (set true, auto-clears after the animation).
const justClaimed = ref(false)
let justClaimedTimer = null
function onClaimClick() {
  claim()
  justClaimed.value = true
  clearTimeout(justClaimedTimer)
  justClaimedTimer = setTimeout(() => { justClaimed.value = false }, 2500)
}

async function onEnablePush() {
  await enableWebPush()
}

// Claimed footer CTA — same handoff as ClaimGiftSheet's success view: close
// this sheet and open PurchaseSheet fresh for the upsell item, rather than
// stacking a second sheet on top.
function onUpsellCta() {
  if (!props.upsellItem) { closeSheet(); return }
  openCheckout(props.upsellItem)
  closeSheet()
}

// The install step's own instructions are always visible now (no tap-in
// detour to open), so its footer CTA is just an acknowledgement — the actual
// install/leave-to-browser action happens outside this page.
function onFooterCta() {
  if (step.value === 'install') closeSheet()
  else if (step.value === 'push') onEnablePush()
  else if (step.value === 'claim') onClaimClick()
  else onUpsellCta()
}

const footerLabel = computed(() => {
  switch (step.value) {
    case 'install':  return t.value?.gotIt
    case 'push':     return t.value?.ctaEnablePush
    case 'claim':    return t.value?.ctaClaim
    default:         return props.upsellItem?.currentPrice || t.value?.gotIt
  }
})
const footerIcon = computed(() => {
  if (step.value === 'push') return 'notifications'
  return null
})

// Checklist step-1 label — split per variant (see the giftTask.stepOpenBrowser
// string doc): a webview can't install anything, so its item reads "open in
// your browser" instead of "install".
const stepInstallLabel = computed(() => variant.value === 'webview' ? t.value?.stepOpenBrowser : t.value?.stepInstall)

// Heading above the inline install-instructions block — same variant split.
const installInstructionsHeading = computed(() => variant.value === 'webview' ? t.value?.openBrowserInstructionsHeading : t.value?.installInstructionsHeading)
</script>

<template>
  <BaseSheet
    :open="sheetOpen"
    :is-mobile="isMobile"
    size-hint="content"
    :content-key="contentKey"
    :duration="{ enter: 350, leave: 350 }"
    aria-label="Claim your 88 CP reward"
    @close="closeSheet()"
  >
    <!-- Header override — same crossfade recipe as ClaimGiftSheet.vue's own
         #header slot, so the title change (Unlock → Claimed) doesn't just
         teleport. Redefines .sheet__title/.sheet__close locally (scoped CSS
         only matches this component's own markup, not BaseSheet's). -->
    <template #header>
      <Transition name="task-gift-title" mode="out-in">
        <span :key="headerTitle" class="sheet__title text-style-heading-modal">{{ headerTitle }}</span>
      </Transition>
      <Button variant="icon" size="medium" icon="close" aria-label="Close" class="sheet__close" @click="closeSheet()" />
    </template>

    <div class="task-gift-sheet" data-poi="task-gift-sheet">
      <!-- Confirm view (install/push/claim) — instructions + checklist +
           reward banner. Swapped out entirely once claimed (see the v-else
           below), same confirm→success replacement ClaimGiftSheet.vue uses,
           rather than appending the success copy underneath. -->
      <template v-if="step !== 'claimed'">
        <!-- "Complete both steps below" only makes sense where there IS a
             2-item checklist — Android's single requirement is already
             stated by androidBody just below the banner, so skip this here
             to avoid "both steps"/one-line-requirement reading as a
             contradiction. -->
        <p v-if="variant !== 'android'" class="task-gift-sheet__desc text-style-paragraph-regular">{{ t?.sheetDesc }}</p>

        <!-- Reward SKU banner — same chosen-item-banner treatment as
             ClaimGiftSheet.vue's .sheet__banner, showing what's actually
             being claimed rather than leaving the reward as text-only copy. -->
        <div class="task-gift-sheet__banner">
          <div class="task-gift-sheet__banner-bg" aria-hidden="true"></div>
          <div class="task-gift-sheet__banner-content">
            <img
              v-if="rewardImage"
              :src="rewardImage"
              alt=""
              class="task-gift-sheet__banner-thumb task-gift-sheet__banner-thumb--img"
            />
            <div v-else class="task-gift-sheet__banner-thumb" aria-hidden="true"></div>
            <p class="task-gift-sheet__banner-amount text-style-heading-banner">{{ rewardAmount }}</p>
          </div>
        </div>

        <!-- Android has only one real requirement (Web Push doesn't need
             install there — see useTaskGiftClaim.js), so a 2-item checklist
             would show a redundant "done" first item. State the single
             requirement as prose instead. -->
        <p v-if="variant === 'android'" class="task-gift-sheet__desc text-style-paragraph-regular" data-poi="task-gift-sheet-android-body">{{ t?.androidBody }}</p>
        <ul v-else class="task-gift-sheet__steps">
          <li class="task-gift-sheet__step" :class="{ 'task-gift-sheet__step--done': stepDone.install }">
            <span class="task-gift-sheet__step-icon" aria-hidden="true">
              <MaterialIcon v-if="stepDone.install" name="check_circle" variant="round" :size="22" />
              <span v-else class="task-gift-sheet__step-number text-style-utility-label-regular">1</span>
            </span>
            <span class="task-gift-sheet__step-label text-style-utility-default-regular">{{ stepInstallLabel }}</span>
          </li>
          <li class="task-gift-sheet__step" :class="{ 'task-gift-sheet__step--done': stepDone.push }">
            <span class="task-gift-sheet__step-icon" aria-hidden="true">
              <MaterialIcon v-if="stepDone.push" name="check_circle" variant="round" :size="22" />
              <span v-else class="task-gift-sheet__step-number text-style-utility-label-regular">2</span>
            </span>
            <span class="task-gift-sheet__step-label text-style-utility-default-regular">{{ t?.stepPush }}</span>
          </li>
        </ul>

        <!-- Install instructions — media + numbered steps, shown INLINE
             right under the checklist while step is 'install' (ios/webview
             only — Android never reaches this step at all). This is the
             "merged" half of the sheet: the original standalone
             IosInstallSheet's content, folded in rather than hidden behind
             a tap. A divider + its own heading separate it from the
             checklist above, since the two read as distinct sections
             (progress checklist vs. how-to for step 1). -->
        <template v-if="step === 'install'">
          <div class="task-gift-sheet__divider" aria-hidden="true"></div>
          <div class="task-gift-sheet__install-instructions" data-poi="task-gift-sheet-instructions">
            <p class="task-gift-sheet__install-heading text-style-heading-subtitle">{{ installInstructionsHeading }}</p>
            <div class="task-gift-sheet__ios-media">
              <video v-if="isVideoDemo" :src="installDemoSrc" autoplay loop muted playsinline />
              <img v-else-if="installDemoSrc" :src="installDemoSrc" alt="" />
              <div v-else class="task-gift-sheet__ios-media-placeholder" aria-hidden="true">
                <MaterialIcon name="photo_camera" variant="round" :size="28" />
                <span class="text-style-utility-label-regular">400 × 225</span>
              </div>
            </div>
            <ol class="task-gift-sheet__ios-steps text-style-paragraph-regular">
              <li v-for="(instructionStep, i) in installSteps" :key="i">{{ instructionStep }}</li>
            </ol>
          </div>
        </template>
      </template>

      <template v-else>
        <p class="task-gift-sheet__claimed text-style-paragraph-regular">{{ t?.claimedBody }}</p>

        <!-- Upsell — same handoff/copy as ClaimGiftSheet.vue's own success
             view, so claiming either gift ends in the same "check out this
             offer" moment. -->
        <template v-if="upsellItem">
          <p class="task-gift-sheet__claimed text-style-paragraph-regular">{{ strings.page.giftClaimedUpsellIntro }}</p>
          <div class="task-gift-sheet__banner">
            <div class="task-gift-sheet__banner-bg" aria-hidden="true"></div>
            <div class="task-gift-sheet__banner-content">
              <img
                v-if="upsellItem.skuImage"
                :src="upsellItem.skuImage"
                alt=""
                class="task-gift-sheet__banner-thumb task-gift-sheet__banner-thumb--img"
              />
              <div v-else class="task-gift-sheet__banner-thumb" aria-hidden="true"></div>
              <div class="task-gift-sheet__banner-info">
                <p class="task-gift-sheet__banner-amount text-style-heading-banner">
                  {{ upsellItem.label || [formatNumber(upsellItem.amount), upsellItem.currencyLabel].filter(v => v != null && v !== '').join(' ') }}
                </p>
                <p v-if="upsellItem.subtitle" class="task-gift-sheet__banner-subtitle text-style-utility-label-regular">{{ upsellItem.subtitle }}</p>
                <p
                  v-if="upsellItem.baseAmount != null && upsellItem.bonusAmount != null"
                  class="task-gift-sheet__banner-bonus text-style-utility-label-regular"
                >
                  <span>{{ formatNumber(upsellItem.baseAmount) }} + </span>
                  <span class="task-gift-sheet__bonus text-style-utility-default-bold">{{ formatNumber(upsellItem.bonusAmount) }} {{ upsellItem.bonusLabel }}</span>
                </p>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- Debug-only reset (see the `allowGiftUnclaim` feature flag) — same
           control as GiftSkuCard's own unclaim button, so this sheet can
           also retest the flow without leaving it. -->
      <button
        v-if="showUnclaim"
        v-ripple v-haptic
        type="button"
        class="task-gift-sheet__unclaim"
        data-poi="task-gift-sheet-unclaim"
        @click="unclaim()"
      >
        <MaterialIcon name="replay" variant="round" :size="14" />
        <span class="text-style-utility-label-regular">Reset claim (debug)</span>
      </button>
    </div>

    <template #footer>
      <Transition name="task-gift-footer" mode="out-in">
        <Button
          :key="step"
          variant="primary"
          size="large"
          full-width
          :icon="footerIcon"
          :shimmer="step === 'claim' || (step === 'claimed' && upsellItem)"
          label-style="text-style-utility-action-uppercase"
          data-poi="task-gift-sheet-cta"
          class="task-gift-sheet__cta"
          @click="onFooterCta()"
        >{{ footerLabel }}</Button>
      </Transition>
    </template>

    <!-- Success bg glow — same one-shot recipe as ClaimGiftSheet.vue's own
         .sheet__success-overlay, fired the moment Claim is tapped. -->
    <template #panel-overlay>
      <div class="task-gift-sheet__success-overlay" :class="{ 'task-gift-sheet__success-overlay--active': justClaimed }" aria-hidden="true" />
    </template>
  </BaseSheet>
</template>

<style scoped>
/* Header title + close — overriding BaseSheet's #header slot means its own
   .sheet__title/.sheet__close rules don't apply here (scoped CSS only
   matches the owning component's markup) — redefined so the title still
   grows to push the close button right. Mirrors ClaimGiftSheet.vue exactly. */
.sheet__title {
  flex: 1;
  min-width: 0;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}
.sheet__close {
  flex-shrink: 0;
}

/* Header title crossfade — copy changes without teleporting */
.task-gift-title-leave-active {
  transition: opacity var(--x-motion-sys-duration-fast) var(--x-motion-sys-ease-accelerate);
}
.task-gift-title-leave-to { opacity: 0; }
.task-gift-title-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.task-gift-title-enter-from { opacity: 0; }

/* Success bg glow — radiates once across the panel on claim, mirrors
   ClaimGiftSheet.vue's .sheet__success-overlay exactly (same tokens/timing).
   Animation longhands — the easing token contains a comma, shorthand banned. */
.task-gift-sheet__success-overlay {
  position: absolute;
  inset: 0;
  background: var(--x-bg-indicator-success-default);
  pointer-events: none;
  opacity: 0;
}
.task-gift-sheet__success-overlay--active {
  animation-name: task-gift-success-glow;
  animation-duration: var(--x-motion-sys-duration-slowest);
  animation-delay: var(--x-motion-sys-duration-slow);
  animation-timing-function: var(--x-motion-sys-ease-decelerate);
  animation-fill-mode: forwards;
}
@keyframes task-gift-success-glow {
  0%   { opacity: 0; }
  15%  { opacity: 0.25; }
  100% { opacity: 0; }
}

.task-gift-sheet {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
}

.task-gift-sheet__desc {
  margin: 0;
  color: var(--x-text-body-default);
}

/* Reward SKU banner — mirrors ClaimGiftSheet.vue's .sheet__banner exactly
   (same tokens/structure), just under this component's own class names. */
.task-gift-sheet__banner {
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
.task-gift-sheet__banner-bg {
  position: absolute;
  inset: 0;
  background: var(--x-gradient-checkout-banner);
}
.task-gift-sheet__banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.task-gift-sheet__banner-thumb {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: var(--x-radius-container-xs);
  background: var(--x-gradient-thumb-gloss);
  border: var(--border-weight-default) solid var(--x-border-soft);
}
.task-gift-sheet__banner-thumb--img {
  object-fit: contain;
  background: none;
}
.task-gift-sheet__banner-amount {
  margin: 0;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}
/* Upsell-only — the reward banner above uses a single .banner-amount <p>
   directly; the upsell banner wraps amount/subtitle/bonus in this column so
   all three can stack, mirrors ClaimGiftSheet.vue's .sheet__banner-info. */
.task-gift-sheet__banner-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-tight);
}
.task-gift-sheet__banner-subtitle {
  margin: 0;
  color: var(--x-text-body-default);
}
.task-gift-sheet__banner-bonus {
  margin: 0;
  text-transform: uppercase;
  color: var(--x-text-header-strong);
  display: block;
}
.task-gift-sheet__bonus { color: var(--x-text-bonus-amount); }

.task-gift-sheet__steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
}

.task-gift-sheet__step {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  color: var(--x-text-body-soft);
  transition: color var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.task-gift-sheet__step--done { color: var(--x-text-body-default); }

.task-gift-sheet__step-icon {
  flex-shrink: 0;
  display: inline-flex;
  color: var(--x-text-body-soft);
  transition: color var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-standard);
}
.task-gift-sheet__step--done .task-gift-sheet__step-icon { color: var(--x-text-success-default); }

/* Pending-step marker — a radio-button-shaped circle with the step number
   inside instead of an empty donut, so the checklist reads as ordered steps
   (1, 2) rather than generic unchecked radios. Border/text both currentColor
   so it inherits the soft (pending) / default (done, though check_circle
   replaces it by then) colour from .task-gift-sheet__step-icon above. */
.task-gift-sheet__step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--x-radius-badge-full);
  border: var(--border-weight-default) solid currentColor;
  color: inherit;
}

.task-gift-sheet__claimed {
  margin: 0;
  color: var(--x-text-body-default);
}

.task-gift-sheet__unclaim {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  padding: 0;
  border: 0;
  background: none;
  color: var(--x-text-body-soft);
  cursor: pointer;
}

.task-gift-sheet__cta {
  --x-fx-ripple-color: var(--x-fx-ripple-color-dark);
}
.task-gift-sheet__cta:hover { filter: brightness(1.05); }

/* Footer CTA crossfade — copy/icon changes without teleporting, same recipe
   as ClaimGiftSheet.vue's .claim-footer-* transition. */
.task-gift-footer-leave-active {
  transition: opacity var(--x-motion-sys-duration-fast) var(--x-motion-sys-ease-accelerate);
}
.task-gift-footer-leave-to { opacity: 0; }
.task-gift-footer-enter-active {
  transition: opacity var(--x-motion-sys-duration-base) var(--x-motion-sys-ease-decelerate);
}
.task-gift-footer-enter-from { opacity: 0; }

/* Divider between the checklist and the install-instructions section below
   it — same token as NavDrawer's own footer divider. .task-gift-sheet's own
   flex `gap` already spaces it evenly above and below; no extra margin
   needed. */
.task-gift-sheet__divider {
  border-top: var(--border-weight-default) solid var(--x-border-divider);
}

.task-gift-sheet__install-heading {
  margin: 0;
  text-transform: uppercase;
  color: var(--x-text-header-default);
}

/* Install instructions (iOS Add-to-Home-Screen / webview open-in-browser) —
   shown inline under the checklist while step is 'install'. Own flex column
   so the media/steps pair keeps the same internal gap as before, now that
   they're one level deeper inside this wrapper instead of direct children
   of .task-gift-sheet (which still supplies the gap around the wrapper
   itself relative to the checklist above it). */
.task-gift-sheet__install-instructions {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-loose);
}

.task-gift-sheet__ios-media {
  border-radius: var(--x-radius-container-s);
  overflow: hidden;
  background: var(--x-bg-card-default);
}
.task-gift-sheet__ios-media img,
.task-gift-sheet__ios-media video {
  display: block;
  width: 100%;
  height: auto;
}
.task-gift-sheet__ios-media-placeholder {
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  background: var(--x-surface-ghost-2);
  color: var(--x-text-body-soft);
}
.task-gift-sheet__ios-steps {
  margin: 0;
  padding-left: 1.4em;
  list-style-type: decimal;
  color: var(--x-text-body-default);
}
.task-gift-sheet__ios-steps li {
  list-style-type: decimal;
  padding-left: var(--x-gap-content-narrow);
}
.task-gift-sheet__ios-steps li + li {
  margin-top: var(--x-gap-content-default);
}
</style>
