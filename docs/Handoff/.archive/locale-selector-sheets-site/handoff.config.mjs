/**
 * Per-site handoff configuration for the Language & Region Selector Sheets
 * interactive handoff. The ONE file that varies per site — everything in
 * .vitepress/ and scripts/ is generic kit code.
 *
 * Consumed by:
 *  - scripts/sync-tokens.mjs   → vendor manifest (what to copy from the prototype)
 *  - .vitepress/config.mjs     → title / description / nav / sidebar
 *  - TokenSandbox.vue          → tokenCatalog (sliders + easing selects)
 */
export default {
  title: 'Language & Region Selector Sheets',
  description:
    'Interactive spec for RegionSelectorSheet and LanguageSelectorSheet — the searchable region picker and the flat language list, both driven by useLocale — all 19 §2 states reachable, wired to the real prototype tokens.',

  pages: [
    { text: 'Flow Spec', link: '/README' },
    { text: 'Motion Tokens', link: '/motion-tokens' },
    { text: 'Haptic Tokens', link: '/haptic-tokens' },
    { text: 'Component Breakdown', link: '/component-breakdown' },
    { text: 'Typography', link: '/typography' },
    { text: 'Playground', link: '/playground' },
  ],

  // The full 11-file cascade — the demo uses real colour (--text-hyperlink-default,
  // --bg-sheet, --border-card-default), typography (heading condense vs body
  // uncondense), spacing, radius, size, shadow and the scroll-fade gradient
  // straight from the prototype. No demo images needed — markets are represented
  // as coloured initial chips + regional-indicator emoji, matching the real
  // component's own emoji fallback for flags with no SVG art (see
  // component-breakdown.md's FlagTile note) rather than vendoring flag SVGs.
  vendor: {
    roots: {
      tokens: 'src/tokens',
      fonts: 'src/stores/codm/fonts',
      images: 'src/stores/codm/img/content',
    },
    tokens: [
      'ds/themes/codm.css',
      'ds/system.css',
      'ds/semantics.css',
      'ds/space.css',
      'ds/text-styles.css',
      'ds/extensions.css',
      'motion.css',
      'motion-sku.css',
      'keyframes.css',
      'effects.css',
      'reduced-motion.css',
    ],
    urlRewrites: [
      { in: 'codm.css', from: '../../../stores/codm/fonts/', to: '../fonts/' },
    ],
    fonts: [
      'HitmarkerNormal-Light.woff2', 'HitmarkerNormal-Light.woff',
      'HitmarkerNormal-Regular.woff2', 'HitmarkerNormal-Regular.woff',
      'HitmarkerNormal-Medium.woff2', 'HitmarkerNormal-Medium.woff',
      'HitmarkerNormal-Bold.woff2', 'HitmarkerNormal-Bold.woff',
      'HitmarkerNormal-Black.woff2', 'HitmarkerNormal-Black.woff',
    ],
    images: [],
  },

  // The sheets' CSS reads the composite aliases directly (--motion-modal-enter,
  // -exit, --motion-sku-hover, --motion-hover), each itself `var(--motion-sys-
  // duration-*) var(--motion-sys-ease-*)` (README §3.7). TokenSandbox can only
  // hand a slider/select a single scalar, so — mirroring bestseller-card-effects'
  // precedent of editing the underlying primitive rather than the composite —
  // the catalog below exposes the primitives. Because CSS custom properties
  // resolve var() references against the ELEMENT they're used on (not the
  // element where the composite was declared), overriding a primitive on the
  // sandbox root still reshapes every composite that reads it inside the demo
  // stage. `--motion-ripple` is in the spec's token_contract but is the tap-
  // feedback wave, not a sheet enter/exit/hover timing — left out of this
  // editable subset for the same reason bestseller-card-effects omitted
  // --motion-sku-enter.
  tokenCatalog: {
    durations: [
      { name: '--motion-sys-duration-slow', label: 'Entrance (drives --motion-modal-enter)', min: 100, max: 800, step: 10 },
      { name: '--motion-sys-duration-exit',  label: 'Exit (drives --motion-modal-exit)',      min: 50,  max: 500, step: 10 },
      { name: '--motion-sys-duration-fast',  label: 'Hover / scroll-fade (drives --motion-sku-hover, --motion-hover)', min: 50, max: 400, step: 10 },
    ],
    easings: [
      { name: '--motion-sys-ease-decelerate', label: 'Decelerate (entrance)' },
      { name: '--motion-sys-ease-accelerate', label: 'Accelerate (exit)' },
      { name: '--motion-sys-ease-standard',   label: 'Standard (hover, scroll-fade)' },
    ],
  },
}
