import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth.js'
import { useStoreConfig } from './useStoreConfig.js'
import { useFeatureFlags } from './useFeatureFlags.js'

/**
 * useCheckout — shared singleton for checkout state. SKU cards call
 * openCheckout() directly; CheckoutSheet (or the inline Step components)
 * read the state — no emit-drilling through SkuList / BestSellerCarousel.
 *
 * Three checkout presentations, chosen by config.checkout.mode PLUS the
 * fcmPaymentSheet feature flag (FCM pilot only):
 *   'sheet'  (default) — the overlay CheckoutSheet bottom sheet/modal. Gate:
 *            opens once signed in OR once a guest has verified a Player ID
 *            (PlayerAccount sets guestVerified) — tapping a SKU before either
 *            is a no-op, since this is the step *after* identifying the account.
 *   'inline' — Codashop's page-step checkout (see src/components/checkout/*).
 *            Gamer ID entry is itself the first step on the page, so there is
 *            no signed-in/guest-verified gate and no sheet ever opens —
 *            openCheckout() just records the selection so the SKU card can
 *            show its selected state and the step cards can read it.
 *   'buy-now-bar' — fcmPaymentSheet flag on (and mode !== 'inline'): a tap
 *            docks the sticky BuyNowBar (buyNowVisible) instead of opening
 *            the sheet directly. The bar's CTA is itself the auth gate
 *            (SIGN IN when signed out, BUY NOW → openPaymentSheet() when
 *            signed in) — so openCheckout() records the selection
 *            unconditionally here, with no upfront auth check.
 */

const { signedIn } = useAuth()
const { isEnabled } = useFeatureFlags()

const sheetOpen   = ref(false)
const selectedItem = ref(null)
const selectedKey  = ref(null)
// FCM Buy Now pilot — sticky bar visibility + the payment channel chosen
// inside OrderSummarySheet (index into config.checkout.channels). Defaults
// to the first channel (Figma's "Returning users with previously selected
// PC" state doubles as the first-time default: pre-selected, CTA already
// enabled) rather than an unselected null.
const buyNowVisible  = ref(false)
const selectedChannel = ref(0)
// Promo-code discount (numeric amount, or null when no code applied) — the
// checkout step's landscape-full layout puts PromoCode in the left column
// (CheckoutStepBody) but the price it discounts renders in the right column
// (CheckoutStepFooter); a shared singleton, same no-prop-bridge pattern as
// selectedChannel, keeps the two in sync.
const promoDiscountAmount = ref(null)
// Boleto BR — tapping Buy Now with the Boleto channel selected (CheckoutStepFooter)
// shows a KYC form in place of the channel grid/promo code instead of proceeding
// (CheckoutStepBody, both orientations — same shared-singleton pattern as
// selectedChannel/promoDiscountAmount, no prop bridge between the two).
const showBoletoKyc = ref(false)
// Guest path: PlayerAccount flips these once a Player ID has been "found".
const guestVerified = ref(false)
const guestPlayerName = ref('')

// Buy Now pilot — set by BuyNowBar/ItemSummarySheet just before they hand off
// to the EA sign-in overlay, so the watcher below knows to auto-promote into
// OrderSummarySheet once sign-in completes rather than leaving the user back
// on the bar (or, from the info sheet, reopening that sheet — see the
// pendingReturn/pendingEaGift sibling patterns in useItemSummary/useGiftClaim).
const pendingBuyNowSignIn = ref(false)

function setGuestVerified(value) {
  guestVerified.value = value
  if (!value) guestPlayerName.value = ''
}

function setGuestPlayerName(name) {
  guestPlayerName.value = name
}

// Read fresh on every call rather than memoised — checkout.mode never changes
// mid-session (it's per-store), but keeping this a plain read avoids any
// import-order coupling with useStoreConfig's own computed.
function isInlineMode() {
  return useStoreConfig().value.checkout?.mode === 'inline'
}

// fcmPaymentSheet is a single shared flag (not per-store — see
// useFeatureFlags), so the capability gate (config.checkout.buyNow) is what
// actually scopes the bar to stores that opt in (FCM); the flag just lets
// those stores turn it on/off. Without the capability check, switching the
// theme to any other store while the (now default-on) flag is enabled would
// dock the bar there too. Read fresh each call, same rationale as isInlineMode().
function usesBuyNowBar() {
  return !isInlineMode() && !!useStoreConfig().value.checkout?.buyNow && isEnabled('fcmPaymentSheet')
}

function openCheckout(item, key = null) {
  const inline  = isInlineMode()
  const buyNow  = !inline && usesBuyNowBar()

  // Sheet mode gate — taps do nothing until the account is identified (signed
  // in or guest-verified). Inline mode has no such gate: Gamer ID is itself
  // step 1 of the page, so a SKU tap always registers the selection. The
  // Buy Now bar is its own gate (SIGN IN vs BUY NOW), so it skips this check
  // entirely — a signed-out tap still docks the bar.
  if (!inline && !buyNow && !signedIn.value && !guestVerified.value) return false

  // selectedChannel is intentionally NOT reset here, even for a different
  // item — a "returning user" who picked a channel keeps it selected when
  // they close the sheet and tap a different SKU (Figma's "Returning users
  // with previously selected PC" state: pre-selected, CTA already enabled).
  // Channels are a single store-wide list (config.checkout.channels), not
  // per-item, so the index stays valid across every SKU.

  selectedItem.value = item
  selectedKey.value  = key
  if (buyNow) buyNowVisible.value = true
  else if (!inline) sheetOpen.value = true
  return true // signals the caller it may fire its 'select' haptic
}

// BuyNowBar's BUY NOW tap — promotes the docked bar into the full
// Order-Summary / Select-Payment sheet. No-op outside the Buy Now presentation.
function openPaymentSheet() {
  if (!usesBuyNowBar()) return
  sheetOpen.value = true
}

// When sign-in completes while pendingBuyNowSignIn is set, jump straight to
// the payment sheet instead of leaving the user wherever they started (the
// docked bar, or — from ItemSummarySheet — nowhere at all). setTimeout
// mirrors useGiftClaim's pendingEaGift: lets the EA sign-in overlay's leave
// transition (~200ms) finish before the payment sheet enters.
watch(signedIn, (isSignedIn) => {
  if (!isSignedIn) { pendingBuyNowSignIn.value = false; return }
  if (!pendingBuyNowSignIn.value) return
  pendingBuyNowSignIn.value = false
  setTimeout(() => { openPaymentSheet() }, 200)
})

function closeCheckout() {
  sheetOpen.value   = false
  // Sheet-mode presentations (non Buy-Now) also clear the selection on close;
  // the Buy Now bar stays docked underneath so the user can re-open it.
  if (!usesBuyNowBar()) selectedKey.value = null
  // Ephemeral per-visit state — same reasoning PaymentStepBody's own promo
  // state gave for resetting on remount, just centralised here since this
  // one is a shared singleton rather than component-local state.
  promoDiscountAmount.value = null
  showBoletoKyc.value = false
}

// Dismisses the sticky Buy Now bar entirely (e.g. a future close affordance) —
// clears the whole selection, unlike closeCheckout() which just closes the sheet.
function dismissBuyNow() {
  buyNowVisible.value   = false
  sheetOpen.value       = false
  selectedKey.value     = null
  selectedChannel.value = 0
}

/**
 * isItemSelected — whether the given item key is the active selection,
 * regardless of presentation. Sheet mode also requires sheetOpen (the sheet
 * itself gates card-selected styling to while it's actually open); inline
 * mode has no sheet, so selectedKey alone drives the SKU card's selected
 * state once a tap has registered it. The Buy Now bar gates on buyNowVisible
 * instead, so the card reads selected as soon as the bar docks — before the
 * full sheet ever opens.
 */
function isItemSelected(key) {
  if (selectedKey.value !== key) return false
  if (usesBuyNowBar()) return buyNowVisible.value
  return isInlineMode() || sheetOpen.value
}

// checkoutReady — both real gates cleared (a SKU AND a payment channel),
// regardless of presentation. Inline-checkout stores with a guided-checkout
// CTA (config.checkout.stepCta — see InlineCheckoutCta.vue) read this to know
// when to hand off to the Buy Now widget instead of their own step label.
const checkoutReady = computed(() => !!selectedItem.value && selectedChannel.value != null)

export function useCheckout() {
  return {
    sheetOpen,
    selectedItem,
    selectedKey,
    buyNowVisible,
    selectedChannel,
    promoDiscountAmount,
    showBoletoKyc,
    pendingBuyNowSignIn,
    guestVerified,
    guestPlayerName,
    checkoutReady,
    setGuestVerified,
    setGuestPlayerName,
    openCheckout,
    openPaymentSheet,
    closeCheckout,
    dismissBuyNow,
    isItemSelected,
  }
}
