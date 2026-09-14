<script setup>
import { ref } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import { useAuth } from '../composables/useAuth.js'
import { useStoreAssets } from '../composables/useStoreAssets.js'

/**
 * EaSignInPage — simulated EA Account sign-in overlay (FCM flow only).
 *
 * Mounted in the DeviceFrame #overlay slot alongside SignInLoader; only one is
 * visible at a time (gated by signIn.flow in useStoreConfig). Tapping SIGN IN
 * calls completeEaSignIn(), which sets signedIn = true and shows the snackbar —
 * the same success path as the COD:M loader flow.
 *
 * Visual fidelity: matches the EA Account sign-in screen (dark navy, EA circle
 * logo, social-provider grid, email/password form, blue CTA). The inputs are
 * decorative; only the SIGN IN button matters for the prototype flow.
 */

const { eaSignInOpen, completeEaSignIn, cancelEaSignIn } = useAuth()
const assets = useStoreAssets()

const email    = ref('')
const password = ref('')
const showPw   = ref(false)
const remember = ref(true)

function handleSignIn() {
  // Use whatever was typed as the display name — fall back to 'EA Player'.
  const name = email.value.trim().split('@')[0] || 'codayw'
  completeEaSignIn(name)
}
</script>

<template>
  <Transition name="ea-page">
    <div
      v-if="eaSignInOpen"
      class="ea-page"
      role="dialog"
      aria-label="Sign in to your EA Account"
      @click="handleSignIn()"
    >
      <!-- Back arrow — bubbles up to the root @click handler -->
      <button class="ea-page__back" type="button" aria-label="Return to store">
        <MaterialIcon name="arrow_back" variant="round" :size="24" />
      </button>

      <!-- Scrollable content column -->
      <div class="ea-page__scroll">
        <div class="ea-page__body">

          <!-- EA logomark circle -->
          <div class="ea-page__logo-wrap">
            <img :src="assets.brand.logomark" alt="EA" class="ea-page__logo" />
          </div>

          <h1 class="ea-page__heading text-style-heading-modal">Sign in to your EA Account</h1>

          <!-- Social provider grid -->
          <div class="ea-page__social">
            <button class="ea-page__sp ea-page__sp--apple"  type="button" aria-label="Sign in with Apple">
              <svg viewBox="0 0 24 24" fill="currentColor" class="ea-page__sp-icon"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.29.06 2.19.72 3.03.72.84 0 2.43-.9 4.09-.76 1.39.11 2.63.65 3.57 1.67-3.27 2-2.74 6.01.61 7.35-.62 1.63-1.43 3.24-3.3 4.88zM12.03 7.3c-.17-2.45 1.92-4.56 4.25-4.74.31 2.78-2.46 4.96-4.25 4.74z"/></svg>
            </button>
            <button class="ea-page__sp ea-page__sp--google" type="button" aria-label="Sign in with Google">
              <svg viewBox="0 0 24 24" class="ea-page__sp-icon"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </button>
            <button class="ea-page__sp ea-page__sp--facebook" type="button" aria-label="Sign in with Facebook">
              <svg viewBox="0 0 24 24" fill="#fff" class="ea-page__sp-icon"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
            </button>
            <button class="ea-page__sp ea-page__sp--steam" type="button" aria-label="Sign in with Steam">
              <svg viewBox="0 0 24 24" fill="#c6d4df" class="ea-page__sp-icon"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/></svg>
            </button>
            <button class="ea-page__sp ea-page__sp--xbox"  type="button" aria-label="Sign in with Xbox">
              <svg viewBox="0 0 24 24" fill="#fff" class="ea-page__sp-icon"><path d="M5.912 2.853C7.554 1.677 9.696 1 12 1s4.446.677 6.088 1.853C15.373 5.704 12 10.26 12 10.26S8.627 5.704 5.912 2.853zM1.6 6.4A11 11 0 0 0 1 10c0 3.41 1.553 6.458 4 8.5C5.842 15.364 8.547 11.25 9.93 9c-2.56-3.157-5.65-5.373-8.33-2.6zm21.4 3.6a11 11 0 0 0-.6-3.6c-2.68-2.773-5.77-.557-8.33 2.6 1.383 2.25 4.088 6.364 5.93 9.5A11 11 0 0 0 23 10zM5.25 19.4A11 11 0 0 0 12 23a11 11 0 0 0 6.75-3.6C17.02 16.473 14.37 12.4 12 12.4c-2.37 0-5.02 4.073-6.75 7z"/></svg>
            </button>
            <button class="ea-page__sp ea-page__sp--ps" type="button" aria-label="Sign in with PlayStation">
              <svg viewBox="0 0 24 24" fill="#fff" class="ea-page__sp-icon"><path d="M8.984 2.596v14.044l3.77 1.18V6.336c0-.556.24-.87.624-.752.487.156.584.682.584 1.238v5.822c1.924.95 3.387-.12 3.387-2.854 0-2.81-1.002-4.14-3.93-5.202-1.12-.41-3.05-.87-3.435-.992zM2 17.952l4.352 1.533V17l-4.352-1.45v2.402zm18.96-6.1c-1.772-.572-4.1-.635-5.635-.167v1.648c1.252-.37 2.554-.39 3.452-.084.6.21.803.593.595.956-.173.302-.548.492-1.046.627V16.1c.896-.2 1.686-.534 2.232-1.05.9-.848.9-2.174.402-3.198z"/></svg>
            </button>
          </div>

          <!-- "or" separator -->
          <div class="ea-page__sep">
            <div class="ea-page__sep-line" />
            <span class="ea-page__sep-text text-style-utility-default-regular">or</span>
            <div class="ea-page__sep-line" />
          </div>

          <!-- Email / phone -->
          <div class="ea-page__field">
            <label class="ea-page__label text-style-utility-micro-bold" for="ea-email">PHONE OR EMAIL</label>
            <input
              id="ea-email"
              v-model="email"
              type="email"
              class="ea-page__input text-style-utility-default-regular"
              placeholder="Enter your phone or email"
              autocomplete="email"
            />
          </div>

          <!-- Password -->
          <div class="ea-page__field">
            <label class="ea-page__label text-style-utility-micro-bold" for="ea-pw">PASSWORD</label>
            <div class="ea-page__input-row">
              <input
                id="ea-pw"
                v-model="password"
                :type="showPw ? 'text' : 'password'"
                class="ea-page__input ea-page__input--pw text-style-utility-default-regular"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button type="button" class="ea-page__eye" tabindex="-1">
                <MaterialIcon :name="showPw ? 'visibility_off' : 'visibility'" variant="round" :size="20" />
              </button>
            </div>
          </div>

          <!-- Remember me -->
          <div class="ea-page__remember">
            <input id="ea-remember" v-model="remember" type="checkbox" class="ea-page__check" />
            <label for="ea-remember" class="ea-page__remember-label text-style-utility-default-regular">Remember me</label>
          </div>

          <!-- All interactive elements bubble up to root @click — any tap completes sign-in -->
          <button type="button" class="ea-page__cta text-style-utility-default-bold">SIGN IN</button>
          <button type="button" class="ea-page__link text-style-utility-default-regular">Forgot your password?</button>
          <button type="button" class="ea-page__create text-style-utility-default-bold">CREATE ACCOUNT</button>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Page shell ──────────────────────────────────────────────────────────────
   Same layer / full-bleed pattern as SignInLoader. Background matches the
   EA Account screen: very dark blue-black. */
.ea-page {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: var(--x-ea-page-bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* The overlay slot is pointer-events:none (children opt back in) — without this
     every click passes through to the store and the page never dismisses. */
  pointer-events: auto;
}

/* Back button — top-left, above the scroll area */
.ea-page__back {
  position: absolute;
  top: calc(var(--safe-top, 0px) + var(--x-pad-surface-m));
  left: var(--x-pad-surface-m);
  z-index: 1;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--x-radius-badge-full);
  background: transparent;
  color: var(--x-text-header-strong);
  cursor: pointer;
  transition: background var(--x-motion-sku-hover);
}
.ea-page__back:hover { background: var(--x-surface-ghost-2); }

/* Scroll container */
.ea-page__scroll {
  flex: 1;
  overflow-y: auto;
  /* Own containing block (like .device__screen) so comment-mode pins Teleported
     in here can be position:absolute and scroll natively with this box. */
  position: relative;
  scrollbar-width: none;
  padding-top: calc(var(--safe-top, 0px) + 56px); /* clear back button */
  padding-bottom: var(--x-pad-surface-xl);
}
.ea-page__scroll::-webkit-scrollbar { display: none; }

/* Content column — centred, max 320px */
.ea-page__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-loose);
  padding: 0 var(--x-pad-surface-l);
  max-width: 360px;
  margin: 0 auto;
}

/* EA logo — white circle with the EA wordmark inside */
.ea-page__logo-wrap {
  width: 72px;
  height: 72px;
  border-radius: var(--x-radius-badge-full);
  background: var(--x-ea-logo-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ea-page__logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  /* The EA logomark SVG is white-on-dark — invert to read on white bg */
  filter: invert(1);
}

/* "Sign in to your EA Account" */
.ea-page__heading {
  margin: 0;
  color: var(--x-text-header-strong);
  text-align: center;
  display: block;
}

/* Social provider grid — 4 + 2, centred */
.ea-page__social {
  display: grid;
  grid-template-columns: repeat(4, 48px);
  grid-template-rows: repeat(2, 48px);
  gap: var(--x-gap-content-default);
  justify-content: center;
}
/* Last two items centred in a 4-col grid: columns 2 and 3 */
.ea-page__sp:nth-child(5) { grid-column: 2; }
.ea-page__sp:nth-child(6) { grid-column: 3; }

.ea-page__sp {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter var(--x-motion-sku-hover);
}
.ea-page__sp:hover { filter: brightness(1.12); }

.ea-page__sp--apple    { background: var(--x-brand-apple); color: var(--x-text-header-strong); }
.ea-page__sp--google   { background: var(--x-ea-logo-bg); }
.ea-page__sp--facebook { background: var(--x-brand-meta); }
.ea-page__sp--steam    { background: var(--x-brand-steam); }
.ea-page__sp--xbox     { background: var(--x-brand-xbox); }
.ea-page__sp--ps       { background: var(--x-brand-playstation); }

.ea-page__sp-icon {
  width: 26px;
  height: 26px;
}

/* "or" separator */
.ea-page__sep {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  width: 100%;
}
.ea-page__sep-line {
  flex: 1;
  height: 1px;
  background: var(--x-ea-input-bg);
}
.ea-page__sep-text {
  color: var(--x-text-icon-faint);
  white-space: nowrap;
}

/* Form fields */
.ea-page__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.ea-page__label {
  color: var(--x-ea-label-dim);
  display: block;
}
.ea-page__input {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 var(--x-pad-surface-s);
  border: var(--border-weight-default) solid var(--x-ea-input-border);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-ea-input-bg);
  color: var(--x-text-header-strong);
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--x-motion-sku-hover);
}
.ea-page__input::placeholder { color: var(--x-ea-placeholder); }
.ea-page__input:focus { border-color: var(--x-ea-input-border-focus); }

/* Password field wrapper — input + eye toggle */
.ea-page__input-row {
  position: relative;
  width: 100%;
}
.ea-page__input--pw {
  padding-right: 44px;
}
.ea-page__eye {
  position: absolute;
  top: 50%;
  right: var(--x-pad-surface-s);
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--x-text-icon-faint);
  cursor: pointer;
}

/* Remember me */
.ea-page__remember {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  width: 100%;
}
.ea-page__check {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  accent-color: var(--x-ea-cta-default);
  cursor: pointer;
  flex-shrink: 0;
}
.ea-page__remember-label {
  color: var(--x-ea-text-muted);
  cursor: pointer;
}

/* Primary CTA — EA brand blue */
.ea-page__cta {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: var(--x-radius-control-full);
  background: var(--x-ea-cta-default);
  color: var(--x-text-header-strong);
  cursor: pointer;
  transition: background var(--x-motion-sku-hover);
  display: block;
}
.ea-page__cta:hover { background: var(--x-ea-cta-hover); }

/* Secondary text link */
.ea-page__link {
  background: transparent;
  border: 0;
  color: var(--x-ea-cta-soft);
  cursor: pointer;
  padding: 0;
}
.ea-page__link:hover { text-decoration: underline; }

/* "CREATE ACCOUNT" outlined button */
.ea-page__create {
  width: 100%;
  height: 48px;
  border: var(--border-weight-default) solid var(--x-ea-create-border);
  border-radius: var(--x-radius-control-full);
  background: transparent;
  color: var(--x-text-header-strong);
  cursor: pointer;
  transition: background var(--x-motion-sku-hover);
  display: block;
}
.ea-page__create:hover { background: var(--x-ea-input-bg); }

/* ── Enter/leave transition — slides up from bottom like the sign-in sheet ── */
.ea-page-enter-active { transition: transform var(--x-motion-modal-enter), opacity var(--x-motion-modal-enter); }
.ea-page-leave-active { transition: transform var(--x-motion-modal-exit),  opacity var(--x-motion-modal-exit); }
.ea-page-enter-from,
.ea-page-leave-to {
  transform: translateY(24px);
  opacity: 0;
}
</style>
