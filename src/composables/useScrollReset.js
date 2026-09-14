/**
 * scrollToTop — resets the store's scroll position. Two callers:
 *   - CommandConsole's "scroll to top" command (smooth: true, the default) —
 *     a user-invoked jump on the SAME page.
 *   - Every page-switch boundary (useOrderComplete/useTransactionHistory/
 *     useCodashopHome — smooth: false) — so navigating between pages
 *     (storefront/order-complete/transaction-history/codashop home-title)
 *     never leaves the new page scrolled to wherever the previous page was
 *     left; an instant jump reads correctly there since the content
 *     underneath is a different page, not a same-page reposition.
 *
 * Scroller resolution mirrors DeviceFrame: the framed device's own scroll
 * container (`.device__screen`) when present, else `window` for the
 * Responsive frame. `prefers-reduced-motion` always wins over `smooth`.
 */
export function scrollToTop({ smooth = true } = {}) {
  if (typeof document === 'undefined') return
  const reduced = typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  const scroller = document.querySelector('.device__screen') ?? window
  scroller.scrollTo?.({ top: 0, behavior: (smooth && !reduced) ? 'smooth' : 'auto' })
}
