/**
 * generators/theme.mjs — seeds + typography + a few overrides → a full
 * src/tokens/ds/themes/<key>.css file.
 *
 * Ramp math: only the 500 step is ever hand-specified (the seed); the other
 * ten steps are derived from RAMP_CURVE (tools/cms/schema/theme.js), which was
 * fit against real ramps in the repo. Chroma scales as a clean ratio of the
 * seed's chroma across every ramp checked. Lightness does NOT scale as a flat
 * additive offset — a seed near L=1 (a pale secondary) or near L=0 would blow
 * past the [0,1] bound with a flat offset — so lightness offsets are scaled
 * proportionally to the seed's headroom toward the nearer bound (1 for the
 * lighter steps above 500, 0 for the darker steps below 500). This is a
 * first-cut approximation: validate it against a real brand kit before
 * trusting the generated ramp wholesale, and let a store override individual
 * steps by hand (via `overrides.ramps`) when it doesn't read right.
 */

import { RAMP_CURVE, SEED_ROLES, HTML_SCOPE_TOKENS, THEMES_WITH_CUSTOM_CSS } from '../schema/theme.js'

const OKLCH_RE = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i

export function parseOklch (input) {
  if (typeof input === 'object' && input !== null) return input
  const m = OKLCH_RE.exec(String(input))
  if (!m) throw new Error(`Not a parseable oklch() value: ${input}`)
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) }
}

export function formatOklch ({ l, c, h }, precision = 3) {
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))
  const round = n => Number(n.toFixed(precision))
  return `oklch(${round(clamp(l, 0.02, 0.99))} ${round(clamp(c, 0, 0.4))} ${round(h)})`
}

// Reference fit point (see schema/theme.js) — the seed lightness the curve's
// normalized offsets were derived against, used to compute per-seed headroom.
const REFERENCE_SEED_L = 0.72

function normalizedLightnessOffsets () {
  const { steps, lightnessOffsetFrom500 } = RAMP_CURVE
  const lighterHeadroom = 1 - REFERENCE_SEED_L
  const darkerHeadroom = REFERENCE_SEED_L
  const out = {}
  for (const step of steps) {
    const offset = lightnessOffsetFrom500[step]
    out[step] = offset === 0 ? 0 : offset / (offset > 0 ? lighterHeadroom : darkerHeadroom)
  }
  return out
}

const NORMALIZED_OFFSETS = normalizedLightnessOffsets()

export function buildRamp (seed, roleName, roleOverrides = {}) {
  const { l: l500, c: c500, h } = parseOklch(seed)
  const lighterHeadroom = 1 - l500
  const darkerHeadroom = l500
  const ramp = {}
  for (const step of RAMP_CURVE.steps) {
    if (roleOverrides[step]) { ramp[step] = parseOklch(roleOverrides[step]); continue }
    if (step === 500) { ramp[step] = { l: l500, c: c500, h }; continue }
    const norm = NORMALIZED_OFFSETS[step]
    const l = l500 + norm * (norm > 0 ? lighterHeadroom : darkerHeadroom)
    const c = c500 * RAMP_CURVE.chromaScaleFrom500[step]
    ramp[step] = { l, c, h }
  }
  return ramp
}

function kebab (roleName) {
  return roleName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function fontFaceBlock (fonts = []) {
  if (!fonts.length) return ''
  return fonts.map(f => `@font-face {
  font-family: '${f.family}';
  src: url('../../../stores/${f.storeKey}/fonts/${f.file}') format('woff2');
  font-weight: ${f.weight ?? 400};
  font-style: ${f.style ?? 'normal'};
  font-display: swap;
}`).join('\n\n')
}

/**
 * @param {object} def
 * @param {string} def.key
 * @param {Record<string, string|{l,c,h}>} def.seeds - one per SEED_ROLES entry
 * @param {Array<{family,file,weight,style,storeKey}>} [def.fonts]
 * @param {object} [def.typography] - overrides for TYPOGRAPHY_FIELDS in schema/theme.js
 * @param {Record<number, string>} [def.overrides.ramps] - per-role, per-step raw oklch overrides
 * @param {string} [def.customCss] - hand-authored region preserved verbatim on regeneration
 *   (component-selector rules, gradients) — see THEMES_WITH_CUSTOM_CSS.
 */
export function generateThemeCss (def) {
  const { key, seeds, fonts = [], typography = {}, overrides = {}, customCss = '' } = def
  for (const role of SEED_ROLES) {
    if (!seeds[role]) throw new Error(`Missing seed for role "${role}" — all ${SEED_ROLES.length} seeds are required.`)
  }

  const ramps = {}
  for (const role of SEED_ROLES) {
    ramps[role] = buildRamp(seeds[role], role, overrides.ramps?.[role])
  }

  const seedLines = SEED_ROLES.map(role =>
    `  --ref-${kebab(role)}: ${formatOklch(parseOklch(seeds[role]))};`
  ).join('\n')

  const rampBlocks = SEED_ROLES.map(role => {
    const roleKebab = kebab(role)
    const lines = RAMP_CURVE.steps.map(step =>
      step === 500
        ? `  --palette-${roleKebab}-500: var(--ref-${roleKebab});`
        : `  --palette-${roleKebab}-${step}: ${formatOklch(ramps[role][step])};`
    ).join('\n')
    return `  /* ${role} */\n${lines}`
  }).join('\n\n')

  const typo = {
    sysFontFamilyHeading: "'Inter', system-ui, sans-serif",
    sysFontFamilyBody: "'Inter', system-ui, sans-serif",
    sysFontCondense: 1,
    sysWeightRegular: 400,
    ...typography,
  }

  const htmlScopeLines = HTML_SCOPE_TOKENS
    .filter(t => overrides.htmlScope?.[t])
    .map(t => `  ${t}: ${overrides.htmlScope[t]};`)
    .join('\n')

  const customNote = THEMES_WITH_CUSTOM_CSS.includes(key)
    ? '\n/* --- custom (hand-authored, preserved on regeneration) --- */\n' + customCss + '\n'
    : (customCss ? `\n/* --- custom (hand-authored, preserved on regeneration) --- */\n${customCss}\n` : '')

  return `/* ============================================================================
   ${key.toUpperCase()} THEME  —  [data-theme="${key}"]
   ----------------------------------------------------------------------------
   GENERATED by tools/cms/generators/theme.mjs from seeds + typography.
   The ramps below are derived from the 7 seeds — do not hand-edit a --palette-*
   value directly; change the seed (or add a per-step override) and regenerate.
   Anything in the "custom (hand-authored, preserved)" region survives
   regeneration verbatim — put component-selector rules and gradients there.
   ============================================================================ */

${fontFaceBlock(fonts)}

[data-theme="${key}"] {
  /* ── Seeds ──────────────────────────────────────────────────────────────── */
${seedLines}

  /* ── Spectrums (generated from seeds — see RAMP_CURVE) ───────────────────── */
${rampBlocks}

  /* ── Typography ───────────────────────────────────────────────────────────── */
  --sys-font-family-heading: ${typo.sysFontFamilyHeading};
  --sys-font-family-body: ${typo.sysFontFamilyBody};
  --sys-font-condense: ${typo.sysFontCondense};
  --sys-weight-regular: ${typo.sysWeightRegular};
}
${htmlScopeLines ? `\nhtml[data-theme="${key}"] {\n${htmlScopeLines}\n}\n` : ''}${customNote}`
}
