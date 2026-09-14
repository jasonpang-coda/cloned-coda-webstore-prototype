<script setup>
import { computed, nextTick } from 'vue'
import BaseSheet from './base/BaseSheet.vue'
import Button from './Button.vue'
import { useAuth } from '../composables/useAuth.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useLocale } from '../composables/useLocale.js'
const assets = useStoreAssets()
const strings = useStoreStrings()
const config = useStoreConfig()
// Shared, store-agnostic chrome copy (localised via the language switcher).
const { common } = useLocale()

/**
 * SignInSheet — "SIGN IN TO PURCHASE" bottom sheet (Figma 4863:14324), opened
 * from the navbar SIGN IN button. Rendered on BaseSheet with no dimming scrim
 * — the page behind stays visible and interactive; BaseSheet falls back to a
 * document-level outside-tap listener for dismissal.
 *
 * "Sign in with COD:M" runs the existing full-screen loader (startSignIn).
 * "Check out as a guest" closes the sheet and scrolls to the Player Account
 * section (the real guest-checkout entry).
 */
const props = defineProps({
  isMobile: { type: Boolean, default: true },
})

const { signInSheetOpen, closeSignInSheet, startSignIn, startEaSignIn, startKonamiSignIn } = useAuth()

// Device-split flow config (eFootball) vs legacy single-flow (codm/fcm).
// For eFootball: desktop = ['mykonami'], mobile = ['mykonami','efootball'].
// For legacy stores: derive a single-item array from config.signIn.flow.
const activeFlows = computed(() => {
  const s = config.value.signIn
  if (s.desktop || s.mobile) {
    return props.isMobile ? (s.mobile ?? s.desktop ?? []) : (s.desktop ?? s.mobile ?? [])
  }
  return s.flow ? [s.flow] : []
})

// CTA label per flow — multi-flow stores key by flow name; legacy stores use .cta.
function flowLabel(flow) {
  const s = strings.value.signIn
  return s[flow]?.cta ?? s.cta ?? ''
}

function handleFlow(flow) {
  closeSignInSheet()
  if (flow === 'ea-redirect') startEaSignIn()
  else if (flow === 'mykonami') startKonamiSignIn()
  else startSignIn() // 'codm', 'efootball' (in-app QR/loader)
}

function brandForFlow(flow) {
  return flow === 'mykonami' ? 'mykonami' : 'signin'
}
// Whitelabel golden rule: keyed off the store's own ctaCasing capability flag
// (config.signIn.ctaCasing), not by testing which flow is active — see
// plans/tickets/in-progress/ds-remediation.md Phase 4 for why the old `flow === 'codm'` check was
// really a disguised store-identity branch (every OTHER store that also
// reuses the 'codm' flow value hides this button entirely via navbar.hideSignIn).
const ctaLabelStyle = computed(() => (
  config.value.signIn.ctaCasing === 'uppercase'
    ? 'text-style-utility-default-uppercase'
    : 'text-style-utility-default-regular'
))

function checkoutAsGuest() {
  closeSignInSheet()
  // Route to the guest Player-ID lookup section (rendered in App.vue while signed out).
  nextTick(() => {
    const section = document.getElementById('player-account')
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Focus the input after the sheet exit animation + scroll settle (~500ms).
    setTimeout(() => section?.querySelector('input')?.focus(), 500)
  })
}
</script>

<template>
  <BaseSheet
    :open="signInSheetOpen"
    :is-mobile="isMobile"
    :scrim="false"
    :aria-modal="false"
    aria-label="Sign in to purchase"
    :title="common.signIn.sheetTitle"
    size-hint="content-full"
    :duration="{ enter: 350, leave: 200 }"
    @close="closeSignInSheet()"
  >
    <Button
      v-for="flow in activeFlows"
      :key="flow"
      variant="primary"
      size="large"
      full-width
      :brand="brandForFlow(flow)"
      :label-style="ctaLabelStyle"
      class="signin-sheet__codm"
      :class="`signin-sheet__codm--${flow}`"
      @click="handleFlow(flow)"
    >
      <template v-if="flow !== 'mykonami'" #icon>
        <img
          :src="assets.brand.signinLogomark ?? assets.brand.logomark"
          alt=""
          class="signin-sheet__codm-icon"
        />
      </template>
      {{ flowLabel(flow) }}
    </Button>

    <template v-if="config.checkout.allowGuest">
      <div class="signin-sheet__separator">
        <span class="signin-sheet__separator-text text-style-utility-label-regular">⸺ {{ common.signIn.orSeparator }} ⸺</span>
      </div>

      <Button variant="link" full-width class="signin-sheet__guest" @click="checkoutAsGuest()">{{ common.signIn.guestCta }}</Button>
    </template>
  </BaseSheet>
</template>

<style scoped>
/* Sign-in flow buttons — brand fill comes from the `brand` prop per flow;
   codm/mykonami flows need body-default text over their brand fill instead
   of Button's default on-primary text. */
.signin-sheet__codm:hover { filter: brightness(1.2); }
.signin-sheet__codm:disabled { transform: scale(0.97); }
.signin-sheet__codm--codm,
.signin-sheet__codm--mykonami {
  --btn-text-color: var(--x-text-body-default);
}
.signin-sheet__codm-icon {
  width: var(--x-size-icon-m);
  height: var(--x-size-icon-m);
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}

/* "— Or —" separator */
.signin-sheet__separator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--x-pad-surface-xs) 0;
}
.signin-sheet__separator-text {
  color: var(--x-text-body-soft);
  transform-origin: center center;
}
</style>
