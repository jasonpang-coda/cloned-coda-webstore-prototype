import { ref } from 'vue'

/**
 * useItemSummary — shared singleton for the "ITEM SUMMARY" bottom sheet, the new
 * pre-checkout step for bundles. Tapping a child item tile inside a BundleSkuCard
 * calls openItemSummary() with the whole bundle; ItemSummarySheet reads the state.
 * Same module-level-singleton pattern as useCheckout / useGiftClaim — no
 * emit-drilling through the SKU lists.
 *
 * Unlike useCheckout there is NO sign-in gate here: the sheet opens regardless of
 * auth state and swaps its footer (Buy Now ↔ sign-in CTA) based on signedIn.
 */

const summaryOpen    = ref(false)
const selectedBundle = ref(null)
// Bundle saved across the sign-in flow so the sheet can re-open after auth.
const pendingReturn  = ref(null)

/**
 * @param {Object} bundle — { title, currentPrice, originalPrice, discountPercent,
 *   limitLabel, endsAt, bannerImage, skuImage, loyaltyPoints, items[] }
 */
function openItemSummary(bundle) {
  pendingReturn.value  = null
  selectedBundle.value = bundle
  summaryOpen.value    = true
}

function closeItemSummary() {
  summaryOpen.value = false
}

function savePendingReturn() {
  pendingReturn.value = selectedBundle.value
}

function clearPendingReturn() {
  pendingReturn.value = null
}

export function useItemSummary() {
  return {
    summaryOpen,
    selectedBundle,
    pendingReturn,
    openItemSummary,
    closeItemSummary,
    savePendingReturn,
    clearPendingReturn,
  }
}
