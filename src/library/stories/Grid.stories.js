import { defineComponent, h, provide } from 'vue'
import Grid from '@/components/Grid.vue'
import Span from '@/components/Span.vue'
import SkuCard from '@/components/SkuCard.vue'
import { GRID_BARE_KEY } from '@/composables/gridBare.js'
import { defineStory } from '../story.js'

// Grid itself only takes an `as` prop and a default slot — it has no
// items/content prop to vary, so this story wraps it in a tiny presentational
// component that supplies real Span + SkuCard children (the same shape as its
// real usage in App.vue: `<Grid><Span size="..."><section content /></Span></Grid>`).
// The wrapper's own props (below) are story-only knobs, not part of Grid's API.
function coin (assets, i) {
  return assets.content?.cpCoins?.[i] || assets.brand?.cpIcon || assets.brand?.logomark
}

function demoCards (assets) {
  return [
    { amount: 160, currentPrice: '$1.99', skuImage: coin(assets, 160) },
    { amount: 420, currentPrice: '$4.99', skuImage: coin(assets, 420) },
    { amount: 960, currentPrice: '$9.99', skuImage: coin(assets, 960) },
    { amount: 2400, currentPrice: '$19.99', skuImage: coin(assets, 2400) },
  ]
}

const GridDemo = defineComponent({
  name: 'GridStoryDemo',
  props: {
    as: { type: String, default: 'div' },
    bare: { type: Boolean, default: false },
    split: { type: Boolean, default: false },
    assets: { type: Object, default: () => ({}) },
  },
  setup (props) {
    // Mirrors App.vue: split-layout stores `provide(GRID_BARE_KEY, true)`
    // around a Grid so it (and any nested Span) collapses to an unstyled
    // flow instead of laying out a second nested 12-col grid.
    if (props.bare) provide(GRID_BARE_KEY, true)
    return () => h(Grid, { as: props.as }, {
      default: () => props.split
        ? [
            h(Span, { size: 'col-lead' }, () => h('div', { class: 'story-grid-demo__block' }, 'col-lead (4/12)')),
            h(Span, { size: 'col-main' }, () => h(Grid, null, {
              default: () => h(Span, { size: 'content' }, () => demoCards(props.assets).map((c, i) =>
                h(SkuCard, { key: i, ...c }))),
            })),
          ]
        : [
            h(Span, { size: 'content' }, () => demoCards(props.assets).map((c, i) =>
              h(SkuCard, { key: i, ...c }))),
          ],
    })
  },
})

export default defineStory({
  id: 'grid',
  title: 'Grid',
  group: 'Layout',
  component: GridDemo,
  // The Figma component SET (all 4 Width=XS/S/M/L variants), not one variant —
  // see plans/tickets/in-progress/figma-token-sync.md Batch 1. Code Connect already maps each
  // variant instance (1386:1378/1420:1837/1386:1382/1386:1387) to this same
  // Grid.vue; this is the one-string field figma-sync.mjs reads to generate
  // docs/figma-code-connect/mappings.json's storyUrl/figmaNodeId for this story.
  figmaNodeId: '1386:1381',
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-grid-gutter',
    '--x-gap-grid-row-default',
    '--x-gap-grid-margin',
    '--x-gap-grid-gutter-m',
  ],
  states: ['default'],
  // A layout primitive (column/gutter math only) — no interactive
  // affordance of its own.
  presentational: true,
  notes:
    'The Commerce Engine\'s responsive column grid — the structural container ' +
    'every page section sits inside, driven entirely by @container queries ' +
    'against the device-screen width (never @media): 8 columns at XS/S ' +
    '(< 801px), 12 columns at M/L (≥ 801px), with column gap, row gap and ' +
    'side padding all escalating per breakpoint via dedicated --x-gap-grid-* ' +
    'tokens. It never renders content directly — a `Span` child claims one or ' +
    'more columns and holds the actual section content. This story wraps it ' +
    'in a small demo component so the grid math is visible against real SKU ' +
    'cards; Grid itself has no items prop.',
  rules: [
    'Grid takes no content props — it only lays out whatever Span (or other) children it is given.',
    '`as` renders a different root tag (e.g. "section") while keeping the same grid CSS.',
    'The injected (non-prop) "bare" mode collapses Grid/Span to an unstyled flow at ≥ 801px — used only inside a split-layout column (config.page.layout === "split", e.g. Codashop) so a nested Grid does not lay out a second 12-col grid inside an already-gridded column. Below 801px a bare Grid still uses the normal 8-col rules, since the split collapses to one column there.',
  ],
  variants: [
    {
      name: 'Default (content section)',
      props: ({ assets }) => ({ assets }),
    },
    {
      name: 'As <section>',
      props: ({ assets }) => ({ as: 'section', assets }),
    },
    {
      name: 'Split layout (col-lead / col-main)',
      props: ({ assets }) => ({ split: true, assets }),
    },
    {
      name: 'Bare (nested inside a split column)',
      props: ({ assets }) => ({ split: true, bare: true, assets }),
    },
  ],
})
