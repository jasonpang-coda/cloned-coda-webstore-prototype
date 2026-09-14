/**
 * useStoreTransactions — per-store demo transaction list for the Transaction
 * History page. Whitelabel data layer: mirrors useStoreCatalog's registry gate so
 * the page never branches on theme identity. Each store module exports a
 * `transactions` array (see src/stores/<store>/store.js); stores without one
 * resolve to an empty list.
 *
 * Item shape (display strings + a `daysAgo` offset so the "Past N days" filter is
 * clock-robust — dates are computed relative to runtime now, never hardcoded):
 *   { id, state: 'fulfilled'|'pending'|'failed', title, daysAgo,
 *     orderId, transactionId, paymentMethod, total: string|null }
 */
import { computed } from 'vue'
import { useTheme } from './useTheme.js'
import { ACTIVE_STORES } from '@active-stores'

const TRANSACTIONS_REGISTRY = Object.fromEntries(
  ACTIVE_STORES.map(s => [s.key, s.transactions ?? []]),
)

export function useStoreTransactions() {
  const { theme } = useTheme()
  return computed(() => TRANSACTIONS_REGISTRY[theme.value] ?? [])
}
