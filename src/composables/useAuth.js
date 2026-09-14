import { ref } from 'vue'
import { useHaptics } from './useHaptics.js'
import { useLocale } from './useLocale.js'

const { haptic } = useHaptics()
const { common } = useLocale()

/**
 * useAuth — shared singleton for the simulated COD:M sign-in flow.
 *
 * Module-level refs (declared once, outside the factory) make this a singleton:
 * NavBar, NavDrawer, SignInLoader and Snackbar all import `useAuth()` and read
 * the SAME reactive state — no prop-drilling through DeviceFrame's overlay slot.
 * Mirrors the existing composable pattern (see useDeviceScale.js).
 *
 * Flow: startSignIn() → loader shows for SIGN_IN_DELAY → signed-in state +
 * success snackbar (auto-dismiss after SNACKBAR_DURATION). It's a prototype
 * simulation, so the transition is purely time-driven.
 */

// Timing — tweak here if the demo needs a faster/slower beat.
const SIGN_IN_DELAY = 5000      // loader → signed-in (5s)
const SNACKBAR_DURATION = 5000  // snackbar auto-dismiss (5s)

// Singleton state
const signedIn = ref(false)           // navbar variant (sign-in button vs avatar)
const signingIn = ref(false)          // full-screen loader visible (COD:M flow)
const eaSignInOpen = ref(false)       // EA Account sign-in overlay visible (FCM flow)
const konamiSignInOpen = ref(false)   // KONAMI ID sign-in overlay visible (eFootball myKONAMI flow)
const playerName = ref('codayw')      // display name shown in the account popover
const loyaltyPoints = ref(1000)    // demo MP balance for the navbar rewards pill (FCM)
const snackbarVisible = ref(false) // success snackbar visible
const snackbarContent = ref({ title: common.value.signIn.snackbarTitle, text: `${common.value.signIn.welcomePrefix} codayw` }) // data-driven toast copy
const signInSheetOpen = ref(false) // "SIGN IN TO PURCHASE" bottom sheet visible
const accountMenuOpen = ref(false) // "YOUR ACCOUNT" popover visible (signed-in)

// Timer handles (module-scoped so cancel/dismiss can clear them)
let signInTimer = null
let snackbarTimer = null

function showSnackbar(content) {
  clearTimeout(snackbarTimer)
  // Default to the sign-in copy; callers (e.g. gift claim) pass their own.
  snackbarContent.value = content || { title: common.value.signIn.snackbarTitle, text: `${common.value.signIn.welcomePrefix} ${playerName.value}` }
  snackbarVisible.value = true
  haptic('success') // tactile double-pulse on success
  snackbarTimer = setTimeout(dismissSnackbar, SNACKBAR_DURATION)
}

function dismissSnackbar() {
  clearTimeout(snackbarTimer)
  snackbarTimer = null
  snackbarVisible.value = false
}

function startSignIn() {
  // Re-entrancy guard: ignore taps while already signing in or signed in.
  if (signingIn.value || signedIn.value) return
  signingIn.value = true
  signInTimer = setTimeout(() => {
    signInTimer = null
    signingIn.value = false
    signedIn.value = true
    // Brief pause before the snackbar: lets the loader fade out and the navbar
    // swap complete before the toast bounces in — feels choreographed, not rushed.
    setTimeout(showSnackbar, 500)
  }, SIGN_IN_DELAY)
}

function cancelSignIn() {
  clearTimeout(signInTimer)
  signInTimer = null
  signingIn.value = false
}

// ── EA Account sign-in flow (FCM) ─────────────────────────────────────────────
// Opens a simulated EA Account page overlay; clicking SIGN IN there completes
// the auth immediately (no timer — the "work" happens in the EA page interaction).
function startEaSignIn() {
  if (signingIn.value || signedIn.value) return
  eaSignInOpen.value = true
}

function completeEaSignIn(name = 'codayw') {
  eaSignInOpen.value = false
  playerName.value = name || 'codayw'
  signedIn.value = true
  setTimeout(showSnackbar, 300)
}

function cancelEaSignIn() {
  eaSignInOpen.value = false
}

// ── KONAMI ID sign-in flow (eFootball — myKONAMI redirect) ───────────────────
// Opens a simulated KONAMI ID page overlay; clicking Log In completes auth
// immediately (same instant-complete pattern as the EA flow).
function startKonamiSignIn() {
  if (signingIn.value || signedIn.value) return
  konamiSignInOpen.value = true
}

function completeKonamiSignIn(name = 'codayw') {
  konamiSignInOpen.value = false
  playerName.value = name || 'codayw'
  signedIn.value = true
  setTimeout(showSnackbar, 300)
}

function cancelKonamiSignIn() {
  konamiSignInOpen.value = false
}

function signOut() {
  // Demo reset — replay the flow from the avatar tap.
  haptic('error') // destructive action buzz
  signedIn.value = false
  playerName.value = 'codayw'  // reset to default display name
  loyaltyPoints.value = 1000   // reset demo MP balance
  accountMenuOpen.value = false
  dismissSnackbar()
}

// ── Sign-in sheet ("SIGN IN TO PURCHASE") ─────────────────────────────────────
// Opened from the navbar SIGN IN button; its "Sign in with COD:M" action then
// runs the existing startSignIn() loader flow.
function openSignInSheet() {
  if (signedIn.value) return
  signInSheetOpen.value = true
}
function closeSignInSheet() {
  signInSheetOpen.value = false
}

// ── Account popover ("YOUR ACCOUNT") ──────────────────────────────────────────
// Opened by tapping the in-game avatar in the navbar (signed-in state).
function openAccountMenu() {
  accountMenuOpen.value = true
}
function closeAccountMenu() {
  accountMenuOpen.value = false
}
// The avatar button toggles rather than only-opens — tapping it again while
// the popover is already showing should close it, not re-trigger an open.
function toggleAccountMenu() {
  accountMenuOpen.value = !accountMenuOpen.value
}

export function useAuth() {
  return {
    signedIn,
    signingIn,
    eaSignInOpen,
    konamiSignInOpen,
    playerName,
    loyaltyPoints,
    snackbarVisible,
    snackbarContent,
    showSnackbar,
    signInSheetOpen,
    accountMenuOpen,
    startSignIn,
    cancelSignIn,
    startEaSignIn,
    completeEaSignIn,
    cancelEaSignIn,
    startKonamiSignIn,
    completeKonamiSignIn,
    cancelKonamiSignIn,
    dismissSnackbar,
    signOut,
    openSignInSheet,
    closeSignInSheet,
    openAccountMenu,
    closeAccountMenu,
    toggleAccountMenu,
  }
}
