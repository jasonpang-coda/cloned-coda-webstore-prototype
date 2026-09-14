<script setup>
import { useAuth } from '../composables/useAuth.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useLocale } from '../composables/useLocale.js'
const assets = useStoreAssets()
const strings = useStoreStrings()
// Shared, store-agnostic chrome copy (localised via the language switcher).
const { common } = useLocale()

/**
 * SignInLoader — full-screen sign-in overlay shown while the simulated sign-in
 * is in flight. Two device-driven variants (mobile detection uses the device
 * frame as a proxy — see App.vue passing `device !== 'none'`):
 *   • Mobile (isMobile): "Opening COD:M app…" loader (Figma 4990:12116).
 *   • Non-mobile: QR-code sign-in (Figma 5031:15622).
 *
 * Mounted in DeviceFrame's #overlay slot. Reads `signingIn` from the shared
 * useAuth singleton; the "Cancel Sign In" link aborts the flow. The blurred
 * scrim captures pointer events so the screen underneath is inert.
 */
defineProps({
  isMobile: { type: Boolean, default: true },
})
const { signingIn, cancelSignIn } = useAuth()
</script>

<template>
  <Transition name="loader">
    <div v-if="signingIn" class="loader" :class="{ 'loader--desktop': !isMobile }" role="status" aria-live="polite">
      <div class="loader__body">
        <!-- Mobile: opening-app loader -->
        <template v-if="isMobile">
          <div class="loader__indicator">
            <img :src="assets.brand.wordmark" :alt="strings.signIn.logoAlt" class="loader__logo" />
            <div class="loader__bar"><span class="loader__bar-fill"></span></div>
          </div>

          <div class="loader__copy">
            <p class="loader__title text-style-heading-modal" v-html="strings.signIn.openingApp"></p>
            <p class="loader__text text-style-utility-default-regular">
              {{ common.signIn.followInstructions }}<br />
              {{ common.signIn.willUpdate }}
            </p>
          </div>
        </template>

        <!-- Non-mobile: QR-code sign-in -->
        <template v-else>
          <div class="loader__qr-block">
            <div class="loader__copy">
              <p class="loader__title loader__title--qr text-style-heading-page-title">{{ common.signIn.sheetTitle }}</p>
              <p class="loader__text loader__text--qr text-style-utility-default-regular" v-html="strings.signIn.qrInstruction"></p>
            </div>

            <div class="loader__qr">
              <img :src="assets.brand.qrCode" alt="Sign-in QR code" class="loader__qr-img" />
              <img :src="assets.brand.logomark" alt="" class="loader__qr-logo" />
            </div>

            <div class="loader__code">
              <p class="loader__code-label text-style-utility-default-regular">{{ common.signIn.userCodeLabel }}</p>
              <div class="loader__code-box"><span class="loader__code-value text-style-heading-display-hero">NLVF-FYBF</span></div>
            </div>
          </div>
        </template>

        <div class="loader__action">
          <button type="button" class="loader__cancel text-style-utility-default-regular" @click="cancelSignIn()">
            {{ common.signIn.cancelSignIn }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Scrim — page colour at 60% + heavy blur (matches --x-bg-overlay usage).
   Framed (mobile): absolute, bounded to the device screen box. */
.loader {
  position: absolute;
  inset: 0;
  z-index: 2; /* above the nav drawer (z:1) within the overlay layer */
  background: var(--x-scrim);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  pointer-events: auto; /* block the screen underneath */
  padding: calc(var(--safe-top, 0px) + var(--x-pad-surface-xl)) var(--x-pad-surface-m) var(--x-pad-surface-xl);
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* safety: very short viewports can still reach the cancel link */
}

/* Desktop / responsive: the overlay layer spans the full (tall) scrolling page,
   so `absolute; inset:0` would stretch to the entire page height. `position:fixed`
   pins it to the viewport (100vh) so the centered content + cancel stay visible.
   Safe here because the responsive `.device--none` has no transformed ancestor. */
.loader--desktop {
  position: fixed;
}

/* Content column — vertically centred as one block (loader/QR + copy + cancel),
   so the cancel link sits right after the content (per Figma 4990:12116 /
   5031:15622), never pinned far at the bottom. */
.loader__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: var(--x-gap-content-loose);
}

.loader__indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-default);
}

.loader__logo {
  height: 32px;
  width: auto;
  display: block;
}

/* Indeterminate bar — fixed track clips a sliding fill (continuous/linear). */
.loader__bar {
  width: 80px;
  height: 4px;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-bg-indicator-neutral-subtle);
  overflow: hidden;
}
.loader__bar-fill {
  display: block;
  width: 40%;
  height: 100%;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-bg-action-primary);
  animation: loading-indeterminate 1.4s var(--x-motion-sys-ease-linear) infinite;
  will-change: transform;
}

.loader__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-default);
  text-align: center;
  color: var(--x-text-body-default);
}
.loader__title {
  text-transform: uppercase;
  transform-origin: center center;
}
.loader__text {
  transform-origin: center center;
}

/* Brand TM superscript — sized so it doesn't stretch the heading line-height.
   text-transform:uppercase on the parent would capitalise it too, so reset here. */
.loader__title sup,
.loader__text sup {
  font-size: 0.55em;
  vertical-align: super;
  line-height: 0;
  text-transform: none;
  font-weight: inherit;
  letter-spacing: 0;
}

/* ── QR variant (non-mobile, Figma 5031:15622) ─────────────────────────────── */
.loader__qr-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-pad-surface-xl);
  max-width: 336px;
}
.loader__title--qr {
  /* font-size / letter-spacing handled by text-style-heading-page-title */
}
.loader__text--qr {
  max-width: 336px;
}

.loader__qr {
  position: relative;
  width: 189px;
  height: 189px;
}
.loader__qr-img {
  width: 100%;
  height: 100%;
  display: block;
}
/* COD:M logomark nested in the QR centre (matches the design). */
.loader__qr-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 34px;
  height: 34px;
  transform: translate(-50%, -50%);
  /* sit on a small page-coloured tile so it reads cleanly over the modules */
  padding: var(--x-pad-surface-xs);
  background: var(--x-bg-page);
  border-radius: var(--x-radius-container-xs);
}

.loader__code {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-default);
  color: var(--x-text-body-default);
}
/* utility/default/regular: handled by text-style-utility-default-regular */
.loader__code-label {
  line-height: 1;
}
.loader__code-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-s) var(--x-pad-surface-xl);
  border: var(--border-weight-default) solid var(--x-border-soft-2);
  border-radius: var(--x-radius-control-xs);
}
.loader__code-value {
  color: var(--x-text-body-default);
  transform-origin: center center;
  white-space: nowrap;
}

/* Cancel — underlined link in the content flow, directly after the copy/QR
   block (no divider, no bottom-pin). 24px vertical padding per the design. */
.loader__action {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: var(--x-pad-surface-xl) 0;
}
.loader__cancel {
  border: 0;
  background: transparent;
  color: var(--x-text-header-default);
  text-decoration: underline;
  cursor: pointer;
  padding: var(--x-pad-surface-s);
  transform-origin: center center;
}

/* ── Loader fade ───────────────────────────────────────────────────────────
   Enters decelerating (modal-enter), exits accelerating away (modal-exit).
   Reduced-motion collapses these globally. */
.loader-enter-active { transition: opacity var(--x-motion-modal-enter); }
.loader-leave-active { transition: opacity var(--x-motion-modal-exit); }
.loader-enter-from,
.loader-leave-to { opacity: 0; }
</style>
