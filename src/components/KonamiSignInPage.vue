<script setup>
import { ref } from 'vue'
import MaterialIcon from './MaterialIcon.vue'
import { useAuth } from '../composables/useAuth.js'

/**
 * KonamiSignInPage — simulated KONAMI ID sign-in overlay (eFootball myKONAMI flow).
 *
 * Mounted in the DeviceFrame #overlay slot alongside EaSignInPage; only one is
 * visible at a time (gated by konamiSignInOpen in useAuth). Tapping Log In calls
 * completeKonamiSignIn(), which sets signedIn = true and shows the snackbar.
 *
 * Visual fidelity: matches https://my.konami.net/en_US/signin —
 * light gray page, white card, KONAMI red CTA, dark passkey button.
 * Inputs are decorative; any tap on the Log In button completes the flow.
 */

const { konamiSignInOpen, completeKonamiSignIn, cancelKonamiSignIn } = useAuth()

const emailId = ref('')

function handleSignIn() {
  const name = emailId.value.trim().split('@')[0] || 'codayw'
  completeKonamiSignIn(name)
}
</script>

<template>
  <Transition name="konami-page">
    <div
      v-if="konamiSignInOpen"
      class="konami-page"
      role="dialog"
      aria-label="Sign in to your KONAMI ID"
    >
      <!-- Back arrow -->
      <button class="konami-page__back" type="button" aria-label="Return to store" @click="cancelKonamiSignIn()">
        <MaterialIcon name="arrow_back" variant="round" :size="24" />
      </button>

      <!-- KONAMI header bar -->
      <div class="konami-page__header">
        <span class="konami-page__wordmark" aria-label="KONAMI">KONAMI</span>
      </div>

      <!-- Scrollable content -->
      <div class="konami-page__scroll">
        <div class="konami-page__body" @click="handleSignIn()">

          <!-- Card -->
          <div class="konami-page__card">

            <h1 class="konami-page__heading text-style-heading-modal">KONAMI ID</h1>

            <!-- Service notice (decorative, matches the real page's notice banner) -->
            <div class="konami-page__notice" aria-hidden="true">
              <MaterialIcon name="play_arrow" variant="round" :size="16" class="konami-page__notice-icon" />
              <span class="konami-page__notice-text text-style-utility-default-regular">
                Notice of Service Termination in Russia and Belarus
              </span>
            </div>

            <!-- KONAMI ID / E-mail input -->
            <div class="konami-page__field">
              <input
                v-model="emailId"
                type="email"
                class="konami-page__input text-style-utility-default-regular"
                placeholder="KONAMI ID / E-mail address"
                autocomplete="email"
                @click.stop
              />
            </div>

            <!-- Log In CTA -->
            <button type="button" class="konami-page__cta text-style-utility-default-bold" @click.stop="handleSignIn()">
              Log In
            </button>

            <!-- OR separator -->
            <div class="konami-page__or">
              <div class="konami-page__or-line" />
              <span class="konami-page__or-text text-style-utility-default-regular">OR</span>
              <div class="konami-page__or-line" />
            </div>

            <!-- Passkey button -->
            <button type="button" class="konami-page__passkey text-style-utility-default-bold" @click.stop="handleSignIn()">
              <!-- Passkey icon (person + key) -->
              <svg class="konami-page__passkey-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
              Logging in With a Passkey
            </button>

            <!-- Passkey info link -->
            <button type="button" class="konami-page__link text-style-utility-default-regular" @click.stop>
              What is a Passkey?
            </button>

            <!-- Divider -->
            <div class="konami-page__divider" />

            <!-- Register -->
            <p class="konami-page__register text-style-utility-default-regular">
              Don't have a KONAMI ID?<br />
              <button type="button" class="konami-page__link" @click.stop>Register</button>
            </p>

          </div><!-- /.konami-page__card -->

          <!-- Footer links -->
          <div class="konami-page__footer">
            <button type="button" class="konami-page__footer-link text-style-utility-micro-regular" @click.stop>Terms of Use / Privacy</button>
            <button type="button" class="konami-page__footer-link text-style-utility-micro-regular" @click.stop>Trademarks</button>
            <button type="button" class="konami-page__footer-link text-style-utility-micro-regular" @click.stop>Company Information</button>
            <span class="konami-page__copyright text-style-utility-micro-regular">©2022 Konami Digital Entertainment</span>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Page shell ─────────────────────────────────────────────────────────────
   Light-theme full-screen overlay — sits at z-index 2, same as EaSignInPage.
   Both pages are mutually exclusive (only one konamiSignInOpen/eaSignInOpen
   is ever true at a time). */
.konami-page {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: var(--x-konami-page-bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

/* Back button — dark icon on light bg, top-left */
.konami-page__back {
  position: absolute;
  top: calc(var(--safe-top, 0px) + var(--x-pad-surface-s));
  left: var(--x-pad-surface-s);
  z-index: 10;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--x-radius-badge-full);
  background: transparent;
  color: var(--x-konami-text-dark);
  cursor: pointer;
  transition: background var(--x-motion-sku-hover);
}
.konami-page__back:hover { background: oklch(0 0 0 / 0.06); }

/* KONAMI header bar */
.konami-page__header {
  padding: calc(var(--safe-top, 0px) + var(--x-pad-surface-s)) var(--x-pad-surface-m) var(--x-pad-surface-s);
  background: var(--x-konami-header-bg);
  border-bottom: 1px solid var(--x-konami-card-border);
  display: flex;
  align-items: center;
  padding-left: 56px; /* clear back button */
}

/* KONAMI wordmark — brand red, bold, slightly condensed to read like a logo */
.konami-page__wordmark {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 22px;
  font-weight: 900;
  font-style: italic;
  color: var(--x-konami-red);
  letter-spacing: -0.02em;
  line-height: 1;
  transform: scaleX(0.9);
  transform-origin: left center;
  display: block;
}

/* Scroll container */
.konami-page__scroll {
  flex: 1;
  overflow-y: auto;
  /* Own containing block (like .device__screen) so comment-mode pins Teleported
     in here can be position:absolute and scroll natively with this box. */
  position: relative;
  scrollbar-width: none;
}
.konami-page__scroll::-webkit-scrollbar { display: none; }

/* Centred column — matches the real page layout */
.konami-page__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-loose);
  padding: var(--x-pad-surface-l) var(--x-pad-surface-m) var(--x-pad-surface-xl);
  cursor: default;
}

/* White card */
.konami-page__card {
  width: 100%;
  max-width: 520px;
  background: var(--x-konami-card-bg);
  border: 1px solid var(--x-konami-card-border);
  border-radius: var(--x-radius-container-s);
  padding: var(--x-pad-surface-l) var(--x-pad-surface-l) var(--x-pad-surface-l);
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
}

/* "KONAMI ID" heading */
.konami-page__heading {
  margin: 0;
  color: var(--x-konami-text-dark);
  text-align: center;
  font-size: 20px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 700;
  letter-spacing: 0.08em;
}

/* Notice banner — red ring, arrow icon */
.konami-page__notice {
  display: flex;
  align-items: flex-start;
  gap: var(--x-gap-content-narrow);
  border: 1px solid var(--x-konami-notice-border);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-konami-notice-bg);
  padding: var(--x-pad-surface-s) var(--x-pad-surface-s);
  color: var(--x-konami-text-dark);
}
.konami-page__notice-icon {
  color: var(--x-konami-red);
  flex-shrink: 0;
  margin-top: 1px;
}
.konami-page__notice-text { line-height: 1.4; }

/* Input field */
.konami-page__field { width: 100%; }
.konami-page__input {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 var(--x-pad-surface-s);
  border: 1px solid var(--x-konami-input-border);
  border-radius: var(--x-radius-container-xs);
  background: var(--x-konami-input-bg);
  color: var(--x-konami-text-dark);
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--x-motion-sku-hover);
}
.konami-page__input::placeholder { color: var(--x-konami-text-muted); }
.konami-page__input:focus { border-color: var(--x-konami-input-border-focus); }

/* Log In — KONAMI red primary CTA */
.konami-page__cta {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: var(--x-radius-container-xs);
  background: var(--x-konami-red);
  color: oklch(1 0 0);
  cursor: pointer;
  font-family: inherit;
  transition: background var(--x-motion-sku-hover);
}
.konami-page__cta:hover { background: var(--x-konami-red-hover); }

/* OR separator */
.konami-page__or {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-default);
  padding: var(--x-pad-surface-xs) 0;
}
.konami-page__or-line {
  flex: 1;
  height: 1px;
  background: var(--x-konami-separator);
}
.konami-page__or-text {
  color: var(--x-konami-text-muted);
  font-family: inherit;
}

/* Passkey button — dark, full-width */
.konami-page__passkey {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--x-gap-content-narrow);
  border: 0;
  border-radius: var(--x-radius-container-xs);
  background: var(--x-konami-passkey-bg);
  color: oklch(1 0 0);
  cursor: pointer;
  font-family: inherit;
  transition: background var(--x-motion-sku-hover);
}
.konami-page__passkey:hover { background: var(--x-konami-passkey-hover); }
.konami-page__passkey-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Text links */
.konami-page__link {
  background: transparent;
  border: 0;
  color: var(--x-konami-link);
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-align: center;
  display: block;
  width: 100%;
}
.konami-page__link:hover { opacity: 0.8; }

/* Divider */
.konami-page__divider {
  height: 1px;
  background: var(--x-konami-separator);
  margin: var(--x-pad-surface-xs) 0;
}

/* Register block */
.konami-page__register {
  margin: 0;
  color: var(--x-konami-text-muted);
  text-align: center;
  line-height: 1.6;
  font-family: inherit;
}
.konami-page__register .konami-page__link {
  display: inline;
  width: auto;
}

/* Footer links */
.konami-page__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  padding-bottom: var(--x-pad-surface-l);
}
.konami-page__footer-link {
  background: transparent;
  border: 0;
  color: var(--x-konami-text-muted);
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  transition: opacity var(--x-motion-sku-hover);
}
.konami-page__footer-link:hover { opacity: 0.7; }
.konami-page__copyright {
  color: var(--x-konami-text-muted);
  font-family: inherit;
}

/* ── Slide-up transition — matches EaSignInPage ─────────────────────────── */
.konami-page-enter-active { transition: transform var(--x-motion-modal-enter), opacity var(--x-motion-modal-enter); }
.konami-page-leave-active { transition: transform var(--x-motion-modal-exit),  opacity var(--x-motion-modal-exit); }
.konami-page-enter-from,
.konami-page-leave-to {
  transform: translateY(24px);
  opacity: 0;
}
</style>
