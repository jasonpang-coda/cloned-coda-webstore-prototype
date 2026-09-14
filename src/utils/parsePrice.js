/**
 * parsePrice — splits a pre-formatted price string ("S$2.09") into a currency
 * prefix + numeric amount. Returns null when the string doesn't match (no
 * price yet, or an unexpected format).
 */
export function parsePrice(str) {
  const m = typeof str === 'string' ? str.match(/^([^\d.,]*)([\d.,]+)$/) : null
  if (!m) return null
  const amount = parseFloat(m[2].replace(/,/g, ''))
  return isNaN(amount) ? null : { prefix: m[1], amount }
}
