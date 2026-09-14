/**
 * tools/lib/color.mjs — shared OKLCH↔hex conversion and color-string
 * normalization.
 *
 * Every prototype color token resolves to an oklch(...) string (never hex);
 * a real Figma export or a hand-authored style-guide spec is hex/rgb. Both
 * figma-harness.mjs (Figma variable drift) and style-guide-check.mjs
 * (style-guide spec drift) need to compare the two, so the conversion lives
 * here once. Per the design-harness gotcha on duplicate extractors — don't
 * add a second, differently-rounded implementation elsewhere.
 */

/**
 * oklch(L C H[ / A]) -> lowercase hex. Standard CSS Color 4 / Ottosson OKLab
 * matrices (the same algorithm this repo's web-store-figma-tokens Python
 * script gets from the `coloraide` library — reimplemented here in JS since
 * a node CLI tool can't shell out to a Python dependency).
 */
export function oklchToHex(str) {
  const m = String(str).match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/i)
  if (!m) return null
  const L = Number(m[1])
  const C = Number(m[2])
  const Hdeg = Number(m[3])
  const H = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(H)
  const b = C * Math.sin(H)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const mm = m_ ** 3
  const s = s_ ** 3

  const rLin = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s
  const gLin = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s
  const bLin = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s

  const gammaEncode = (c) => {
    const clamped = Math.min(1, Math.max(0, c))
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055
  }
  const toByteHex = (c) => Math.round(gammaEncode(c) * 255).toString(16).padStart(2, '0')

  let hex = `#${toByteHex(rLin)}${toByteHex(gLin)}${toByteHex(bLin)}`
  if (m[4] !== undefined) {
    const alpha = m[4].endsWith('%') ? Number(m[4].slice(0, -1)) / 100 : Number(m[4])
    hex += Math.round(alpha * 255).toString(16).padStart(2, '0')
  }
  return hex
}

/**
 * Normalize a hex, rgb()/rgba(), or oklch() color string to lowercase
 * 6/8-digit hex, so a literal-string comparison isn't defeated by format,
 * case, or whitespace alone. Returns null (rather than throwing) for
 * anything it can't parse — an unparsed value must be reported as a
 * MISMATCH by the caller, never silently skipped.
 */
export function normalizeColor(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().toLowerCase()
  if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(trimmed)) return trimmed
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)$/)
  if (rgbMatch) {
    const [, r, g, b, a] = rgbMatch
    const toHex = (n) => Number(n).toString(16).padStart(2, '0')
    const alphaHex = a !== undefined ? toHex(Math.round(Number(a) * 255)) : ''
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`
  }
  if (trimmed.startsWith('oklch(')) return oklchToHex(trimmed)
  return null
}

/**
 * Compare two normalized hex colors allowing a small per-channel tolerance.
 * A theme author's inline `/* #rrggbb *\/` comment is the *source* hex a
 * value was authored from, but oklch(...) round-trips through floating-point
 * OKLab math — re-encoding it can land a few /255 off the original digit in
 * a channel (e.g. #abff00 -> oklch(...) -> #abff01; a saturated, near-gamut
 * -boundary seed like COD:M's #FFE700 rounds as far as #ffe703) even though
 * nothing about the brand color actually changed. An exact string comparison
 * would report that rounding noise as drift on every single ref-seed check,
 * which trains people to ignore the report. Default tolerance (4) catches
 * real edits (observed real drift in this repo's own specs differs by 10s of
 * /255 per channel at minimum) while absorbing conversion noise.
 */
export function colorsApproxEqual(hexA, hexB, tolerance = 4) {
  if (!hexA || !hexB) return false
  const a = hexA.replace('#', '')
  const b = hexB.replace('#', '')
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 2) {
    const diff = Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16))
    if (diff > tolerance) return false
  }
  return true
}
