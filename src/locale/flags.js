/**
 * flags — flag artwork lookup for market codes.
 *
 * SVGs live in src/shared/flags/ named `XX.svg` (XX = ISO country code,
 * uppercased). Flags are country facts, not brand assets, so this is
 * shared — NOT part of useStoreAssets.
 *
 * `flagUrl(code)` → bundled SVG url, or null when no artwork exists.
 * Consumers (FlagTile) fall back to `flagEmoji(code)`.
 */
const FILES = import.meta.glob('../shared/flags/*.svg', { eager: true, query: '?url', import: 'default' })

const BY_CODE = {}
for (const [path, url] of Object.entries(FILES)) {
  const code = path.split('/').pop().replace(/\.svg$/, '')
  BY_CODE[code] = url
}

export function flagUrl (code) {
  return BY_CODE[code] ?? null
}

/** Regional-indicator emoji fallback, e.g. 'SG' → 🇸🇬 */
export function flagEmoji (code) {
  if (!code || code.length !== 2) return '🌐'
  const BASE = 0x1f1e6 // regional indicator 'A'
  const A = 'A'.charCodeAt(0)
  return String.fromCodePoint(
    BASE + code.charCodeAt(0) - A,
    BASE + code.charCodeAt(1) - A,
  )
}
