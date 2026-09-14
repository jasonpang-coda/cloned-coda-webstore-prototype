/**
 * Resolves an element in the DOM using a CSS selector, [data-poi="..."] attribute, or callback function.
 * @param {string|Function|Element} selector
 * @returns {Element|null}
 */
export function resolveElement (selector) {
  if (!selector) return null
  if (typeof selector === 'function') {
    try {
      return selector()
    } catch {
      return null
    }
  }
  if (selector instanceof Element) return selector
  if (typeof selector === 'string') {
    // If it's a simple keyword without CSS symbols, try [data-poi="..."] first
    if (/^[a-zA-Z0-9_-]+$/.test(selector)) {
      const dataPoiEl = document.querySelector(`[data-poi="${selector}"]`)
      if (dataPoiEl) return dataPoiEl
    }
    // Fall back to standard query selector
    return document.querySelector(selector)
  }
  return null
}

/**
 * Polls for an element to appear in the DOM up to timeoutMs.
 * @param {string|Function|Element} selector
 * @param {number} [timeoutMs=3000]
 * @param {number} [intervalMs=50]
 * @returns {Promise<Element|null>}
 */
export async function waitForElement (selector, timeoutMs = 3000, intervalMs = 50) {
  const start = performance.now()
  while (performance.now() - start < timeoutMs) {
    const el = resolveElement(selector)
    if (el && el.isConnected) {
      const rect = el.getBoundingClientRect()
      // Make sure element has non-zero geometry
      if (rect.width > 0 || rect.height > 0 || el.getClientRects().length > 0) {
        return el
      }
    }
    await new Promise(r => setTimeout(r, intervalMs))
  }
  return resolveElement(selector)
}

/**
 * Computes bounding rectangle and viewport coordinates for an element.
 * @param {Element} el
 * @returns {{ top: number, left: number, width: number, height: number, right: number, bottom: number, cx: number, cy: number }}
 */
export function getElementRect (el) {
  if (!el || !el.getBoundingClientRect) {
    return { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0, cx: 0, cy: 0 }
  }
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom,
    cx: rect.left + rect.width / 2,
    cy: rect.top + rect.height / 2,
  }
}

/**
 * Finds the nearest scrollable parent container for an element.
 * @param {Element} el
 * @returns {Element|Window}
 */
export function getScrollContainer (el) {
  if (!el) return window
  let parent = el.parentElement
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = getComputedStyle(parent)
    const overflowY = style.overflowY
    const isScrollable = overflowY === 'auto' || overflowY === 'scroll'
    if (isScrollable && parent.scrollHeight > parent.clientHeight) {
      return parent
    }
    parent = parent.parentElement
  }
  return window
}

/**
 * Smoothly scrolls an element into view within its scroll container.
 * @param {Element} el
 * @param {boolean} [smooth=true]
 * @param {'center'|'start'|'end'|'nearest'} [block='center']
 */
export function scrollElementIntoView (el, smooth = true, block = 'center') {
  if (!el || !el.scrollIntoView) return
  try {
    el.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block,
      inline: 'nearest',
    })
  } catch {
    // Fallback if options object unsupported
    el.scrollIntoView(true)
  }
}
