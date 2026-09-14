/**
 * seo-block — the long-form SEO value-prop section: heading + rich-text body,
 * an optional "why top up here" benefit grid, and an optional FAQ accordion
 * (HomeFaq), plus an optional tiled backdrop texture. Entirely config-driven
 * off `strings.page.seo` (per-store copy) and `storeAssets.content.seoTile`
 * (per-store asset) — there is no dedicated .vue component, it's inline
 * markup in App.vue shared by every store, gated purely on data presence.
 * Currently only ZZZ and Diablo Immortal populate `strings.page.seo`, so
 * this is the first (and so far only) pair of stores that render it.
 *
 * Traced from: src/App.vue:2196-2277 (value-prop section), src/App.vue:2373-2386
 * (FAQ section, same `seo` object, independent section so it can reorder
 * around the download banner), src/App.vue:2775-2908 (scoped CSS),
 * src/stores/zzz/store.js:229-253, src/stores/diabloimmortal/store.js:263-283,
 * src/components/home/HomeFaq.vue.
 *
 * No choreography: this is static content with no scroll-reveal, enter/exit
 * transition, or interactive motion anywhere in the traced CSS — the only
 * "state changes" are content-presence gates and a responsive breakpoint.
 */
import { defineFlow } from '../flow.js'
import HomeFaq from '../../components/home/HomeFaq.vue'
import SeoValuePropComposed from './SeoValuePropComposed.vue'

const SAMPLE_FAQ = [
  { q: 'Is this free to play?', a: 'Yes — free to download, with optional in-app purchases.' },
  { q: 'Sample question two?', a: 'Sample answer two, for handoff preview purposes only.' },
]

export default defineFlow({
  slug: 'seo-block',
  title: 'SEO Value-Prop Block',
  summary: 'Heading/body + benefit grid + FAQ accordion, gated purely on strings.page.seo presence — currently ZZZ and Diablo Immortal only.',
  stores: ['zzz', 'diabloimmortal'],

  components: [
    {
      id: 'Full section (composed, live theme)',
      component: SeoValuePropComposed,
      width: '760px',
      source: 'src/App.vue:2190-2270 (value-prop), 2366-2379 (FAQ), 2712-2908 (shared CSS)',
      notes: 'Composed preview only — no extracted component exists in the real app (this is inline App.vue markup, shared by every store), so this mounts a handoff-only wrapper (SeoValuePropComposed.vue) that mirrors that markup/CSS verbatim and reads the REAL strings.page.seo / storeAssets.content.seoTile live. Switch the theme picker above to ZZZ or Diablo Immortal to see it populated — every other store correctly renders nothing, matching value_prop_absent. Not a real app component — no separate token contract of its own (covered by the two entries below).',
      tokens: [],
    },
    {
      id: 'SeoValueProp',
      // No standalone component — inline template block in App.vue, shared
      // by every store. TokenContract skips the live ComponentStage render
      // when `component` is absent and still shows the token table, which is
      // the right fit here (see pwa-web-push.flow.js's WebPushSurfaces for
      // the same "inline block, no isolated component" precedent).
      source: 'src/App.vue:2196-2277',
      notes: 'Heading + v-html rich-text body + optional benefit grid. Renders only when strings.page.seo is truthy; the benefit grid independently gates on seo.benefits?.length. Centred heading/body (44ch/90ch measure), left-aligned benefit grid (1 col mobile, 2 col at container ≥641px).',
      tokens: [
        '--x-text-header-default', '--x-text-body-default', '--x-text-body-soft',
        '--x-gap-content-loose', '--x-gap-content-default', '--x-gap-content-narrow',
        '--x-gap-content-separation', '--x-gap-content-tight',
        '--x-size-img-xl', '--x-radius-circle', '--x-bg-indicator-neutral-subtle',
      ],
    },
    {
      id: 'SeoTileBackdrop',
      source: 'src/App.vue:2200-2207, 2376-2380, 2793-2811',
      notes: 'Optional full-bleed repeating texture (storeAssets.content.seoTile) behind BOTH the value-prop section and the FAQ section — same asset, two independent mount points since the sections can reorder around the download banner. Diablo Immortal supplies seo-tile.png (leather/mortar); ZZZ supplies none, so its SEO sections render on the plain page background. Uses a lighter scrim (--x-scrim-strong) than a photo backdrop would, since the default 88%-dark scrim reads as solid black over a subtle tiled grain.',
      tokens: ['--x-scrim-strong'],
    },
    {
      id: 'HomeFaq',
      component: HomeFaq,
      props: { faq: SAMPLE_FAQ, layout: 'grid' },
      source: 'src/components/home/HomeFaq.vue',
      notes: 'Same strings.page.seo.faq data, rendered as its own section so it can independently reorder around the download banner. Gets a visible card border here (--x-home-surface-border overridden to --x-border-card-default by .section--seo) — the only other HomeFaq consumer besides HomeVisual to override that fallback.',
      tokens: [
        '--home-faq-cols', '--x-bg-card-default', '--x-bg-tag-neutral',
        '--x-gap-content-default', '--x-home-surface-blur', '--x-home-surface-border',
        '--x-pad-surface-l', '--x-radius-container-s', '--x-shadow-card',
        '--x-text-body-default', '--x-text-header-default',
      ],
    },
  ],

  // Harvested from the v-if/v-else-if gates in App.vue:2196-2386 plus the
  // one @container breakpoint in the scoped CSS.
  states: [
    { id: 'value_prop_absent', desc: 'Section does not mount at all.', entry: 'strings.page.seo is falsy (every store except ZZZ / Diablo Immortal today)', exit: 'store config adds a seo object' },
    { id: 'value_prop_present', desc: 'Heading + rich-text body render, centred, 44ch/90ch max-width.', entry: 'strings.page.seo truthy', exit: 'seo removed from config' },
    { id: 'benefits_absent', desc: 'No benefit grid — value-prop section is just heading + body.', entry: 'seo.benefits missing or empty array', exit: 'benefits array gains ≥1 entry' },
    { id: 'benefits_present', desc: 'Benefits heading + optional desc + icon/title/desc card grid render below the body.', entry: 'seo.benefits?.length > 0', exit: 'benefits array emptied' },
    { id: 'benefits_grid_mobile', desc: 'Single-column card stack.', entry: 'container width < 641px', exit: 'container widens past 641px' },
    { id: 'benefits_grid_wide', desc: '2-column card grid.', entry: 'container width ≥ 641px', exit: 'container narrows below 641px' },
    { id: 'tile_backdrop_absent', desc: 'Plain page background behind both SEO sections (ZZZ today).', entry: 'storeAssets.content.seoTile is null', exit: 'store supplies a seoTile asset' },
    { id: 'tile_backdrop_present', desc: 'Repeating texture + light scrim fill both sections\' full-bleed background (Diablo Immortal today).', entry: 'storeAssets.content.seoTile set', exit: 'asset removed' },
    { id: 'faq_absent', desc: 'FAQ section does not mount.', entry: 'seo.faq missing or empty array', exit: 'faq array gains ≥1 entry' },
    { id: 'faq_present', desc: 'HomeFaq renders in grid layout, bordered card.', entry: 'seo.faq?.length > 0', exit: 'faq array emptied' },
    { id: 'group_order_default', desc: 'Value-prop section then FAQ section, in that order, before the download banner.', entry: 'config.content?.downloadBannerFirst is falsy (ZZZ, Diablo Immortal today)', exit: 'flag flips true' },
    { id: 'group_order_banner_first', desc: 'Download banner sits between the value-prop section and the FAQ section instead; divider moves accordingly.', entry: 'config.content?.downloadBannerFirst is true (COD:M today, which has no seo config so this state is currently unreachable FOR this feature — noted for when a store combines both)', exit: 'flag flips false' },
  ],

  // No interactive transitions — every entry above is a data/config presence
  // gate or a CSS container-query breakpoint, not a user-triggered state
  // change. Left empty deliberately rather than inventing motion that isn't
  // in the traced code.
  transitions: [],
  choreography: [],

  flowChart: `flowchart TD
    config["store.js: strings.page.seo present?"] -- no --> hidden["Section absent entirely"]
    config -- yes --> heading["Heading + rich-text body render"]
    heading --> benefitsGate{"seo.benefits?.length"}
    benefitsGate -- yes --> benefits["Benefit grid renders (1/2 col by container width)"]
    benefitsGate -- no --> skipBenefits["No benefit grid"]
    heading --> tileGate{"storeAssets.content.seoTile set?"}
    tileGate -- yes --> tile["Tiled backdrop + light scrim behind section"]
    tileGate -- no --> plain["Plain page background"]
    config --> faqGate{"seo.faq?.length"}
    faqGate -- yes --> faq["HomeFaq section renders (own reorderable section)"]
    faqGate -- no --> skipFaq["FAQ section absent"]`,

  stateChart: `stateDiagram-v2
    [*] --> value_prop_absent
    value_prop_absent --> value_prop_present: strings.page.seo set
    value_prop_present --> value_prop_absent: strings.page.seo removed
    value_prop_present --> benefits_absent
    value_prop_present --> tile_backdrop_absent
    value_prop_present --> tile_backdrop_present: storeAssets.content.seoTile set
    benefits_absent --> benefits_present: seo.benefits gains entries
    benefits_present --> benefits_absent: seo.benefits emptied
    benefits_present --> benefits_grid_mobile
    benefits_present --> benefits_grid_wide: container >= 641px
    [*] --> faq_absent
    faq_absent --> faq_present: seo.faq gains entries
    faq_present --> faq_absent: seo.faq emptied`,

  notes: {
    rationale: 'Purely config-driven content block, not a feature with a state machine to build — the point of this handoff is the DATA CONTRACT (what strings.page.seo/benefits/faq/storeAssets.content.seoTile must shape up as) and the TOKEN CONTRACT (what each rendered piece consumes), not choreography. Documented ZZZ + Diablo Immortal together because they are, today, the only two stores exercising every gate (tile present/absent, benefits present, faq present) between them.',
    gotchas: [
      'The value-prop section and the FAQ section are two INDEPENDENT sections sharing one data object (seo) and one asset (seoTile) — they can reorder around the download banner independently (config.content.downloadBannerFirst), so never assume they are adjacent in the DOM.',
      'seo.body is rendered with v-html — it is trusted rich text (short <p> paragraphs, <strong> for emphasis), not plain copy. A production port must keep it a sanitised-HTML field, not flatten it to a plain string.',
      '--x-home-surface-border is normally transparent for every other HomeFaq consumer; this section is one of only two places (with HomeVisual) that overrides it to a visible card border. Do not "fix" this to match the transparent default elsewhere.',
      'The tiled backdrop bleeds behind the FULL section, not just the copy column — it reuses the same section__bg layer other categories use for a cover photo, just repeating instead of cover-fit.',
      'ZZZ has no seoTile asset at all — this is the graceful-absent path, not a missing asset to backfill. Do not require a tile texture for every store that adopts this block.',
    ],
    openQuestions: [
      'Should benefits/faq ever be independently absent while the other is present in a NEW store\'s config (today both ZZZ and Diablo Immortal supply all three: body, benefits, faq)? The gating code supports it; no store currently exercises that combination to verify against.',
      'group_order_banner_first (config.content.downloadBannerFirst) has no store today combining it with a populated seo config — worth a design check before a future store tries both flags together.',
    ],
    buildOrder: [
      'T1 — Static structure: heading + v-html body, content-gated on seo presence, correct max-width/centring.',
      'T2 — Benefit grid: icon/title/desc cards, content-gated on benefits?.length, 1/2-column responsive breakpoint at 641px.',
      'T3 — FAQ section: HomeFaq in grid layout, content-gated on faq?.length, bordered-card override.',
      'T4 — Tiled backdrop: full-bleed repeating texture + light scrim, gated on storeAssets.content.seoTile, applied to both sections independently.',
      'T5 — Section reordering: config.content.downloadBannerFirst swapping the download banner between the two SEO sections.',
    ],
    prohibitions: [
      'Never require benefits or faq for the section to render — both are independently optional; heading+body alone is a valid, complete state.',
      'Never treat seo.body as plain text — it carries real markup (paragraphs, <strong>) via v-html.',
      'Never hardcode a resolved token value — every value in the token contract is read live per store theme.',
      'Never assume a tile backdrop is required — ZZZ\'s absence of one is the graceful-absent default, not a gap.',
    ],
  },
})
