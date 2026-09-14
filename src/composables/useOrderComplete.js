import { ref, computed } from 'vue'
import { useCheckout } from './useCheckout.js'
import { closeAllOverlays } from './useCloseAllOverlays.js'
import { scrollToTop } from './useScrollReset.js'

/**
 * useOrderComplete — shared singleton for the full-page Order Complete /
 * Purchase Success view (sibling of useTransactionHistory). Sits in App.vue's
 * DeviceFrame default slot alongside the storefront and Transaction History,
 * swapped in via `orderCompleteOpen` — a VIEW switch, not an overlay (no
 * scrim, no z-index; the NavBar stays mounted above it).
 *
 * Two ways in (see App.vue):
 *   - Real flow: checkout's final pay/confirm step calls openOrderComplete() —
 *     by then useCheckout().selectedItem already holds the SKU the user
 *     actually bought (set by SkuCard/BundleItem's openCheckout() call), so it
 *     persists onto this page with no extra wiring.
 *   - Dev/demo: DeviceToolbar's "Order Complete" button calls the same
 *     openOrderComplete(), straight from the storefront with no prior
 *     selection — selectedItem is null there.
 *
 * `order` merges selectedItem's SKU fields (amount/baseAmount/bonusAmount/
 * currentPrice/skuImage — the exact shape SkuCard/BundleItem already pass to
 * openCheckout(), see SkuCard.vue's onSelect()) OVER DEFAULT_ORDER field by
 * field, so a real purchase always wins per-field but nothing is ever blank:
 * a partial/legacy selectedItem (or none at all) still resolves every field
 * from the Figma default (node 335:61279).
 *
 * Player ID and Payment Method persist the same way, from the two other
 * pieces of live checkout state: useCheckout().guestPlayerName (the "Your
 * COD:M Player ID" field's typed value — see PlayerAccount.vue) and
 * selectedChannel (an index into CheckoutStepBody's 4-entry channel grid —
 * see sheetContent.js's checkoutDescriptor(), COD:M's actual payment step,
 * whose channel list is a hardcoded literal, not config-driven, hence the
 * mirrored PAYMENT_CHANNEL_LABELS below rather than reading it from config).
 * Nickname and Email have no live source yet, so they stay demo-static.
 */
const orderCompleteOpen = ref(false)

// Mirrors sheetContent.js's checkoutDescriptor() channel order exactly —
// selectedChannel is an index into that same 4-entry list.
const PAYMENT_CHANNEL_LABELS = ['Google Pay / Apple Pay', 'Card Payments', 'PayPal', 'Cash App']

// Figma default (node 335:61279) — fills whatever selectedItem/checkout state
// doesn't carry (dev-toolbar entry with no selection, or a field no live
// source sets).
const DEFAULT_ORDER = {
  sku: {
    amount: 460,
    baseAmount: 400,
    bonusAmount: 60,
    currentPrice: '$6.39',
    skuImage: null,
  },
  // No live "new user" state exists yet in useAuth/useCheckout — stays
  // demo-static until that data exists.
  isNewUser: true,
  player: {
    // Nickname/email have no live source yet — demo-static.
    nickname: 'codayw',
    email: 'codayw@coda.com',
    // Player ID and Payment Method DO have live sources — see useOrderComplete() below.
    playerId: 'HDB396',
    paymentMethod: 'Card Payments',
  },
}

function openOrderComplete() {
  orderCompleteOpen.value = true
  closeAllOverlays()
  scrollToTop({ smooth: false })
}

function closeOrderComplete() {
  orderCompleteOpen.value = false
  closeAllOverlays()
  scrollToTop({ smooth: false })
}

export function useOrderComplete() {
  const { selectedItem, guestPlayerName, selectedChannel } = useCheckout()

  // Field-by-field merge (not a spread) — selectedItem's fields are often
  // explicitly null (e.g. no skuImage supplied), and a spread would let that
  // null clobber DEFAULT_ORDER's fallback. `??` keeps the default per-field.
  const order = computed(() => {
    const item = selectedItem.value ?? {}
    return {
      ...DEFAULT_ORDER,
      sku: {
        amount:       item.amount       ?? DEFAULT_ORDER.sku.amount,
        baseAmount:   item.baseAmount   ?? DEFAULT_ORDER.sku.baseAmount,
        bonusAmount:  item.bonusAmount  ?? DEFAULT_ORDER.sku.bonusAmount,
        currentPrice: item.currentPrice ?? DEFAULT_ORDER.sku.currentPrice,
        skuImage:     item.skuImage     ?? DEFAULT_ORDER.sku.skuImage,
      },
      player: {
        ...DEFAULT_ORDER.player,
        // Persisted from the actual checkout flow — falls back to the
        // default only when nothing was ever entered/selected (dev-toolbar
        // entry with no prior checkout).
        playerId:      guestPlayerName.value || DEFAULT_ORDER.player.playerId,
        paymentMethod: PAYMENT_CHANNEL_LABELS[selectedChannel.value] ?? DEFAULT_ORDER.player.paymentMethod,
      },
    }
  })

  return { orderCompleteOpen, order, openOrderComplete, closeOrderComplete }
}
