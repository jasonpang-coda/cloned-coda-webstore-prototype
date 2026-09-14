import { ref, reactive, watch } from 'vue'
import { useAuth } from './useAuth.js'
import { useCheckout } from './useCheckout.js'
import { triggerHaptic } from './useHaptics.js'

/**
 * useGiftClaim — shared singleton for the COD:M gift-claim sheet (sibling of
 * useCheckout). GiftSkuCard calls openGiftClaim() directly and ClaimGiftSheet
 * reads the state — no emit-drilling through GiftGrid.
 *
 * Unlike checkout, the sheet opens regardless of account state: a signed-out
 * guest taps a gift and identifies their account *inside* the sheet via the
 * embedded PlayerAccount form. requiresAccount (captured at open time) tells the
 * sheet whether to show that form; the Claim CTA stays disabled until signed in
 * OR guest-verified.
 *
 * Flow: openGiftClaim(gift) → confirm view → confirmClaim() flips to the success
 * view (sheet stays open, success bg glow fires) → closeGiftClaim().
 * The confirmed claim is tracked in claimedIds so the originating card can show
 * its CLAIMED state.
 */

const { signedIn } = useAuth()
const { guestVerified } = useCheckout()

const claimSheetOpen = ref(false)
const selectedGift   = ref(null)
const claimSuccess   = ref(false) // false = confirm view, true = success view
// Whether the embedded gamer-ID form is shown. Captured ONCE at open time (not
// derived reactively): if it flipped to false the moment guestVerified turned
// true, the form's v-if would unmount it, and PlayerAccount's onBeforeUnmount
// resets guestVerified → a remount/flicker loop. Frozen for the session, the
// form stays mounted and transitions to its own "found" PlayerCard internally.
const requiresAccount = ref(false)
// Reactive set of confirmed-claim ids (keyed by gift.id) — drives the card's CLAIMED state.
const claimedIds = reactive(new Set())

// EA-flow sign-in from the gift claim sheet: stores the pending gift so it can
// be auto-confirmed once EA sign-in completes. Set by ClaimGiftSheet before it
// closes and hands off to the EA sign-in overlay; cleared by the watcher below.
const pendingEaGift = ref(null)

// When sign-in completes while a gift is pending (EA-flow), wait for the sign-in
// overlay's leave transition (~200ms) then open the sheet directly in success state.
watch(signedIn, (isSignedIn) => {
  if (!isSignedIn) {
    claimedIds.clear()
    pendingEaGift.value = null
    return
  }
  if (!pendingEaGift.value) return
  const gift = pendingEaGift.value
  pendingEaGift.value = null
  setTimeout(() => {
    selectedGift.value = gift
    claimedIds.add(gift.id)
    claimSuccess.value = true
    claimSheetOpen.value = true
    triggerHaptic('success')
  }, 200)
})

function openGiftClaim(gift) {
  // Always opens — a signed-out guest identifies their account inside the sheet.
  // Show the form for ALL signed-out users (including already-verified guests) so
  // reopening the sheet restores their Player Card rather than hiding the form.
  requiresAccount.value = !signedIn.value
  selectedGift.value = gift
  claimSuccess.value = false
  claimSheetOpen.value = true
  return true // signals the caller it may fire its 'select' haptic
}

function confirmClaim() {
  const gift = selectedGift.value
  if (!gift) return
  claimedIds.add(gift.id)
  claimSuccess.value = true
  triggerHaptic('success')
}

function closeGiftClaim() {
  claimSheetOpen.value = false
}

function isClaimed(id) {
  return claimedIds.has(id)
}

// Debug-only reset (see the `allowGiftUnclaim` feature flag) — lets a claimed
// gift be retested without clearing localStorage/reactive state by hand.
function unclaimGift(id) {
  claimedIds.delete(id)
}

export function useGiftClaim() {
  return {
    claimSheetOpen,
    selectedGift,
    claimSuccess,
    requiresAccount,
    pendingEaGift,
    openGiftClaim,
    confirmClaim,
    closeGiftClaim,
    isClaimed,
    unclaimGift,
  }
}
