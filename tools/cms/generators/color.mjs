/**
 * generators/color.mjs — sRGB hex ↔ OKLCH, for ingesting style-guide seed
 * colours (docs/style-guides/<title>/spec.json stores seeds as hex; the
 * theme generator's `seeds` input is oklch() strings — see parseOklch/
 * formatOklch in generators/theme.mjs) and for exporting theme tokens back
 * out to sRGB-only consumers (e.g. Figma variables).
 *
 * Standard conversion (Björn Ottosson's OKLab, linear-sRGB ↔ OKLab matrix
 * form, then OKLab ↔ OKLCH polar coordinates) — the same math CSS Color
 * Module 4's oklch() is defined against. No dependency: this is the whole
 * algorithm both ways, about 70 lines total.
 */

const OKLCH_RE = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i

function srgbToLinear (c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearToSrgb (c) {
  const clamped = Math.min(1, Math.max(0, c))
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055
}

export function hexToOklch (hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) throw new Error(`Not a parseable 6-digit hex colour: ${hex}`)
  const int = parseInt(m[1], 16)
  const r = srgbToLinear(((int >> 16) & 255) / 255)
  const g = srgbToLinear(((int >> 8) & 255) / 255)
  const b = srgbToLinear((int & 255) / 255)

  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const l = Math.cbrt(l_), mm = Math.cbrt(m_), s = Math.cbrt(s_)

  const L = 0.2104542553 * l + 0.7936177850 * mm - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.4285922050 * mm + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * mm - 0.8086757660 * s

  const C = Math.sqrt(A * A + B * B)
  let H = Math.atan2(B, A) * 180 / Math.PI
  if (H < 0) H += 360

  return { l: L, c: C, h: H }
}

export function hexToOklchString (hex, precision = 3) {
  const { l, c, h } = hexToOklch(hex)
  const round = n => Number(n.toFixed(precision))
  return `oklch(${round(l)} ${round(c)} ${round(h)})`
}

// { l, c, h } → linear-sRGB { r, g, b }, unclamped (may fall outside [0,1]
// when the oklch value is out of the sRGB gamut — see oklchToHex).
function oklchToLinearSrgb ({ l: L, c: C, h: H }) {
  const hRad = H * Math.PI / 180
  const A = C * Math.cos(hRad)
  const B = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * A + 0.2158037573 * B
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B
  const s_ = L - 0.0894841775 * A - 1.2914855480 * B
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  }
}

function inSrgbGamut ({ r, g, b }, eps = 1e-4) {
  return r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps
}

/**
 * OKLCH → 6-digit sRGB hex. Accepts `{ l, c, h }` or an `oklch(...)` string.
 * Out-of-gamut colours are brought in by binary-searching chroma down at
 * fixed L/H (matches coloraide's "oklch-chroma" gamut-mapping method used by
 * the web-store-figma-tokens skill) rather than naive per-channel clipping,
 * which would shift hue/lightness.
 */
export function oklchToHex (input) {
  const oklch = typeof input === 'string' ? parseOklchString(input) : input
  let lo = 0, hi = oklch.c
  let rgb = oklchToLinearSrgb(oklch)
  if (!inSrgbGamut(rgb)) {
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2
      const candidate = oklchToLinearSrgb({ ...oklch, c: mid })
      if (inSrgbGamut(candidate)) lo = mid; else hi = mid
    }
    rgb = oklchToLinearSrgb({ ...oklch, c: lo })
  }

  const toByte = c => Math.round(linearToSrgb(c) * 255)
  const hex = n => n.toString(16).padStart(2, '0')
  return `#${hex(toByte(rgb.r))}${hex(toByte(rgb.g))}${hex(toByte(rgb.b))}`
}

export function parseOklchString (input) {
  if (typeof input === 'object' && input !== null) return input
  const m = OKLCH_RE.exec(String(input))
  if (!m) throw new Error(`Not a parseable oklch() value: ${input}`)
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) }
}
