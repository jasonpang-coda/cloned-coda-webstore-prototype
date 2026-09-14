/**
 * Per-site handoff configuration for the Best Seller Card Effects interactive
 * handoff. The ONE file that varies per site — everything in .vitepress/ and
 * scripts/ is generic kit code.
 *
 * Consumed by:
 *  - scripts/sync-tokens.mjs   → vendor manifest (what to copy from the prototype)
 *  - .vitepress/config.mjs     → title / description / nav / sidebar
 *  - TokenSandbox.vue          → tokenCatalog (sliders + easing selects)
 */
export default {
  title: 'Best Seller Card Effects',
  description:
    'Interactive spec for the running border, breathing bloom, metallic shimmer, and mount entrance on COD:M\'s BestSellerCard — all seven §2 states reachable, wired to the real prototype tokens.',

  pages: [
    { text: 'Flow Spec', link: '/README' },
    { text: 'Playground', link: '/playground' },
  ],

  // The full 11-file cascade — the demo uses real colour (--hdr-glow/-hot,
  // --border-warm, --bg-card-selected), radius, border-weight, shadow, and the
  // .fx-glow-border-*/.fx-bloom effect classes straight from the prototype.
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
    // The demo draws the coin art as a CSS gradient placeholder (no real .webp
    // needed) — stays self-contained with zero image-path fragility.
    images: [],
  },

  // Pulled straight from README §3.7's motion token table — every duration and
  // easing the ring/bloom/entrance actually consume. `--motion-sku-enter` is in
  // the spec's token_contract but is a composite (duration+easing) alias no
  // component reads directly (see README §3.7's callout) — a single-value
  // slider can't represent it, so it's intentionally left out of this subset.
  tokenCatalog: {
    durations: [
      { name: '--motion-border-spin',        label: 'Running border rotation period', min: 800,  max: 6000, step: 100 },
      { name: '--motion-sku-bloom',           label: 'Bloom breathe period',           min: 1000, max: 6000, step: 100 },
      { name: '--motion-sys-duration-slow',   label: 'Mount entrance duration',        min: 100,  max: 800,  step: 10 },
    ],
    easings: [
      { name: '--motion-sys-ease-linear',      label: 'Linear (ring spin, shimmer)' },
      { name: '--motion-sys-ease-standard',    label: 'Standard (bloom breathe)' },
      { name: '--motion-sys-ease-decelerate',  label: 'Decelerate (mount entrance)' },
    ],
  },
}
