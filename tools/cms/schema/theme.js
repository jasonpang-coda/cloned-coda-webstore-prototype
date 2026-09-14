/**
 * Theme token schema — describes `src/tokens/ds/themes/<key>.css` structurally,
 * so `generators/theme.mjs` knows what to emit from a small set of CMS inputs
 * (seeds + font choices + a handful of overrides) and what to leave as a
 * preserved hand-authored region on regeneration.
 *
 * The 6 spectrum ramps are NOT independently authored per store — they follow
 * a shared lightness/chroma curve seeded by the single `--ref-<role>` value
 * (the 500 step aliases the seed exactly; the other 10 steps are generated).
 * That curve is `RAMP_CURVE` below, reverse-engineered from codm.css / pvz3.css
 * / fcm.css — it must be validated against a few more themes before Phase 2
 * trusts it on anything but a brand-new store.
 */

export const SEED_ROLES = [
  'primary', 'secondary', 'tertiary',
  'statusPositive', 'statusCaution', 'statusNegative',
  'neutral',
]

// Relative offsets from the seed (500 step), fit against pvz3.css's primary
// ramp (seed oklch(0.72 0.19 142.5) — a mid-lightness seed, the common case).
// Chroma scales cleanly as a ratio of the seed's chroma across every ramp
// checked (primary, secondary, tertiary in both codm.css and pvz3.css) — that
// part of the curve is trustworthy.
//
// Lightness is NOT a clean additive offset — it's fit here from a
// mid-lightness seed, but a light seed (e.g. pvz3's secondary at L=0.85)
// compresses toward L=1 well before the 50 step, because lightness is bounded
// [0,1] and hand-tuned ramps interpolate proportionally to remaining headroom,
// not by a fixed additive step. generators/theme.mjs must therefore scale
// these offsets by the seed's distance to the nearer bound (0 for dark seeds,
// 1 for light seeds) rather than applying them as flat additions — and this
// whole curve should be spot-checked against a couple more themes (fcm, tdr)
// before Phase 2 trusts it on anything but a brand-new store (see
// setup-checklist.md's guidance to let a store override individual ramp steps
// by hand when the generated curve doesn't match).
export const RAMP_CURVE = {
  steps: [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50],
  lightnessOffsetFrom500: {
    950: -0.508, 900: -0.449, 800: -0.355, 700: -0.26, 600: -0.13,
    500: 0, 400: +0.05, 300: +0.10, 200: +0.15, 100: +0.19, 50: +0.22,
  },
  chromaScaleFrom500: {
    950: 0.57, 900: 0.74, 800: 0.895, 700: 1.0, 600: 1.03,
    500: 1, 400: 0.84, 300: 0.68, 200: 0.50, 100: 0.32, 50: 0.16,
  },
}

export const TYPOGRAPHY_FIELDS = [
  { path: 'sysFontFamilyHeading', default: "'Inter', system-ui, sans-serif", help: 'Heading/display face.' },
  { path: 'sysFontFamilyBody',    default: "'Inter', system-ui, sans-serif", help: 'Body face.' },
  { path: 'sysFontCondense',      type: 'number', default: 1, help: 'Horizontal scale compensating for a face that renders wider/narrower than Inter (e.g. 0.82 for Hitmarker).' },
  { path: 'sysWeightRegular',     type: 'number', default: 400, help: 'Default body weight — bump to 500 for a Medium-weight body face.' },
  { path: 'sysLetterSpacingBase', default: null, optional: true },
]

// Groups emitted after the ramps — see codm.css lines 175-254 for the full set.
// The CMS only needs to ask about these when a store wants to deviate from the
// system default; everything else inherits from the base :root tiers.
export const SEMANTIC_OVERRIDE_FIELDS = [
  { path: 'borderCardDefault', help: 'Default card border colour (often a translucent white/black at low opacity).' },
  { path: 'bgActionSignin', help: 'Sign-in button background.' },
  { path: 'bgActionInverse', help: 'Secondary/inverse action background.' },
  { path: 'bgTagBonus', help: 'Bonus/best-value tag background.' },
  { path: 'textTagBonus', help: 'Bonus/best-value tag text colour.' },
  { path: 'bgLoyaltyBanner', help: 'Loyalty-points banner background (only matters if checkout.loyalty is set).' },
  { path: 'rarityGradients', shape: '{ mythic, legendary, epic, rare, neutral }',
    help: 'Per-rarity bundle-item gradients. A store with no rarity system maps all five to one neutral surface (see FCM).' },
]

// Tokens that MUST be set from the higher-specificity html[data-theme="<key>"]
// block rather than the bare [data-theme="<key>"] block — because a later
// :root tier (system/semantics/space/text-styles/extensions) also defines
// them, and :root vs [data-theme] are equal specificity (0,1,0), so later
// import wins unless html[data-theme] (0,1,1) is used. See
// docs/multi-store-whitelabel.md §2 for the two real regressions this caused.
export const HTML_SCOPE_TOKENS = [
  '--radius-control-full',
  '--sys-colour-hyperlink-inverse',
  '--checkout-loyalty-overlap',
  '--shadow-checkout-footer',
  '--border-signin-btn',
]

// Theme files that carry raw component selectors (not just custom
// properties) — fcm.css styles .bundle__current/.sku-card__amount; ygodl.css/
// ygomd.css/efootball.css style .device__screen. The generator must preserve
// these verbatim inside a `/* --- custom (hand-authored, preserved) --- */`
// region rather than attempt to regenerate them.
export const THEMES_WITH_CUSTOM_CSS = ['fcm', 'ygodl', 'ygomd', 'efootball']

// Stores whose Google-Fonts <link> lives in the shared index.html rather than
// a local @font-face — a new store using a Google Font needs that shared file
// touched (or should self-host a .woff2 instead to avoid it).
export const GOOGLE_FONTS_STORES = {
  codm: 'Inter (body)',
  roguetrader: 'Open Sans (body)',
  mgsse: 'Oswald (fallback)',
}
