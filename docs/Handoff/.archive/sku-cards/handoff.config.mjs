/**
 * Per-site handoff configuration for the SKU Cards interactive handoff.
 * The ONE file that varies per site — everything in .vitepress/ and scripts/
 * is generic kit code.
 *
 * Consumed by:
 *  - scripts/sync-tokens.mjs   → vendor manifest (what to copy from the prototype)
 *  - .vitepress/config.mjs     → title / description / nav / sidebar
 *  - TokenSandbox.vue          → tokenCatalog (sliders + easing selects)
 */
export default {
  title: 'SKU Cards',
  description:
    'Interactive spec for the entire SKU-card family — SkuCard, SkuImageCard, HeroSkuCard, BestSellerCard, BundleSkuCard, GiftSkuCard. Entrance cascade, price reveal, hover/press/selected states, conic borders and bloom, all wired to the real prototype tokens.',

  pages: [
    { text: 'Flow Spec', link: '/README' },
    { text: 'Motion Tokens', link: '/motion-tokens' },
    { text: 'Component Breakdown', link: '/component-breakdown' },
    { text: 'Haptics', link: '/haptic-tokens' },
    { text: 'Typography', link: '/typography' },
    { text: 'Playground', link: '/playground' },
  ],

  // The full 11-file cascade — the card demos use real colour, space, typography,
  // shadow, keyframes and the .fx-* effect classes. Order IS the CSS cascade order.
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
    // The demos draw their art with CSS gradients (no real .webp assets), so the
    // site stays self-contained with zero image-path fragility.
    images: [],
  },

  // The SKU motion tokens the cards actually consume — exposed as live sliders /
  // easing selects. Pulled from the §5 token table in README.md.
  tokenCatalog: {
    durations: [
      { name: '--motion-sys-duration-slow', label: 'Card entrance / price reveal', min: 100, max: 800, step: 10 },
      { name: '--motion-sys-duration-base', label: 'Select / bg transition',       min: 100, max: 600, step: 10 },
      { name: '--motion-sys-duration-fast', label: 'Hover return',                 min: 50,  max: 400, step: 10 },
      { name: '--motion-border-spin',       label: 'Conic border period',          min: 800, max: 6000, step: 100 },
      { name: '--motion-sku-bloom',         label: 'Bloom breathe period',         min: 1000, max: 6000, step: 100 },
    ],
    easings: [
      { name: '--motion-sys-ease-decelerate', label: 'Decelerate (entrances)' },
      { name: '--motion-sys-ease-standard',   label: 'Standard (hover / select)' },
      { name: '--motion-sys-ease-spring',     label: 'Spring (badge pop)' },
    ],
  },
}
