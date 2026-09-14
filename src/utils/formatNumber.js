/** Returns a number formatted with commas (e.g. 10000 → "10,000").
 *  Non-numbers pass through unchanged so bundle titles (strings) are safe. */
export function formatNumber(n) {
  if (typeof n !== 'number' || isNaN(n)) return n
  return n.toLocaleString('en-US')
}
