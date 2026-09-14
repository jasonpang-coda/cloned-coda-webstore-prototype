<script setup>
/**
 * PageSignInSection — page-level sign-in prompt / player profile card.
 *
 * Signed-out: L1 card with prompt copy + one or more sign-in CTAs (flow-aware).
 * Signed-in:  PlayerCard in the store's configured variant.
 *
 * For multi-flow stores (eFootball mobile), renders all active flows inline —
 * same button structure as SignInSheet — instead of a single "open sheet" button.
 */
import { computed } from 'vue'
import PlayerCard from './PlayerCard.vue'
import { useAuth } from '../composables/useAuth.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'
import { useStoreConfig } from '../composables/useStoreConfig.js'
import { useStoreStrings } from '../composables/useStoreStrings.js'

const props = defineProps({
  isMobile: { type: Boolean, default: true },
})

const assets = useStoreAssets()
const config = useStoreConfig()
const strings = useStoreStrings()
const { signedIn, startEaSignIn, startSignIn, startKonamiSignIn, openSignInSheet, playerName } = useAuth()

// Mirror SignInSheet's activeFlows logic.
const activeFlows = computed(() => {
  const s = config.value.signIn
  if (s.desktop || s.mobile) {
    return props.isMobile ? (s.mobile ?? s.desktop ?? []) : (s.desktop ?? s.mobile ?? [])
  }
  return s.flow ? [s.flow] : []
})

function flowLabel(flow) {
  const s = strings.value.signIn
  return s[flow]?.cta ?? s.cta ?? ''
}

function flowIcon(flow) {
  if (flow === 'mykonami') return null
  return assets.value.brand.signinLogomark ?? assets.value.brand.logomark
}

function handleFlow(flow) {
  if (flow === 'ea-redirect') startEaSignIn()
  else if (flow === 'mykonami') startKonamiSignIn()
  else if (activeFlows.value.length > 1) startSignIn() // multi-flow: go direct, not sheet
  else openSignInSheet() // single-flow legacy: open sheet
}
</script>

<template>
  <div class="page-signin">
    <!-- Signed-in: player profile card -->
    <PlayerCard
      v-if="signedIn"
      :name="playerName"
      :variant="config.profile.playerCard"
      :label="strings.account.playerCardLabel"
    />

    <!-- Signed-out: prompt + sign-in CTAs -->
    <div v-else class="page-signin__card">
      <p class="page-signin__prompt text-style-utility-label-regular">
        {{ strings.signIn.pagePrompt }}
      </p>

      <div class="page-signin__actions">
        <button
          v-for="flow in activeFlows"
          :key="flow"
          v-ripple v-haptic
          type="button"
          class="page-signin__btn"
          :class="`page-signin__btn--${flow}`"
          @click="handleFlow(flow)"
        >
          <img
            v-if="flowIcon(flow)"
            :src="flowIcon(flow)"
            alt=""
            aria-hidden="true"
            class="page-signin__btn-icon"
          />
          <span class="page-signin__btn-label text-style-utility-action-bold">
            {{ flowLabel(flow) }}
          </span>
        </button>
      </div>

      <!-- Footer link — shown when store provides an account-link help URL/copy -->
      <button
        v-if="strings.signIn.accountLinkPrompt"
        type="button"
        class="page-signin__link text-style-utility-label-regular"
      >
        {{ strings.signIn.accountLinkPrompt }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.page-signin {
  width: 100%;
}

/* Sign-in prompt card — L1 surface treatment, centred content */
.page-signin__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-loose);
  padding: var(--x-pad-surface-l) var(--x-pad-surface-m);
  border: 0;
  border-radius: var(--x-radius-container-s);
  /* L1 card surface — consume the semantic, not the sys primitive directly. */
  background-image: var(--x-bg-sku-card-default);
  backdrop-filter: blur(var(--x-blur-container, 32px));
  -webkit-backdrop-filter: blur(var(--x-blur-container, 32px));
}

/* Gradient border — same mask-composite technique as SkuCard. */
.page-signin__card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: var(--border-weight-default);
  background: var(--x-border-sku-card-default);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  pointer-events: none;
}

/* Prompt copy */
.page-signin__prompt {
  margin: 0;
  width: 100%;
  color: var(--x-text-body-default);
  text-align: left;
}

/* Actions column — one button per active flow */
.page-signin__actions {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}

/* Sign-in CTA button — default: brand action colour */
.page-signin__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  width: 100%;
  height: 44px;
  padding: 0 var(--x-pad-surface-m);
  border: 0;
  border-radius: var(--x-radius-control-full);
  background: var(--x-bg-action-signin, var(--x-bg-action-primary));
  color: var(--x-text-on-primary);
  cursor: pointer;
  transition: filter var(--x-motion-sku-hover),
              opacity var(--x-motion-btn-activate),
              transform var(--x-motion-btn-activate);
}
.page-signin__btn:hover {
  filter: brightness(1.08);
}
.page-signin__btn:disabled {
  opacity: 0.4;
  transform: scale(0.97);
  pointer-events: none;
  cursor: not-allowed;
}

/* EA button — label uses body-default ink */
.page-signin__btn--ea-redirect {
  color: var(--x-text-body-default);
}

/* KONAMI ID button — KONAMI red, text only, white body text */
.page-signin__btn--mykonami {
  background: var(--x-bg-action-mykonami, var(--x-bg-action-signin));
  color: var(--x-text-body-default);
}

/* Brand icon — sits left of the label */
.page-signin__btn-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}
/* Label */
.page-signin__btn-label {
  text-transform: uppercase;
  display: inline-block;
  transform: scaleX(var(--x-hm-scale, 0.82));
  transform-origin: center center;
}
.page-signin__btn--efootball .page-signin__btn-label,
.page-signin__btn--mykonami .page-signin__btn-label {
  text-transform: none;
}

/* Footer link — account-link help copy */
.page-signin__link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--x-text-hyperlink-inverse);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: filter var(--x-motion-sku-hover);
}
.page-signin__link:hover {
  filter: brightness(1.1);
}
</style>
