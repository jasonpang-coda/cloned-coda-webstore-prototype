import { defineComponent, h } from 'vue'
import GiftGrid from '@/components/GiftGrid.vue'
import GiftSkuCard from '@/components/GiftSkuCard.vue'
import { defineStory } from '../story.js'

// GiftGrid's only real prop is `count` (used purely for the <4-items collapse
// CSS below 641px) — the actual cards are default-slot children (see App.vue's
// Gifts and reward-gifts sections). This wrapper builds `count` real
// GiftSkuCard children from the same `count` so the two grid behaviours
// (always 2-up vs. count-driven single row) are both exercised honestly.
function giftImage (assets) {
  return assets.content?.giftSecretCache || assets.content?.giftEmote || assets.brand?.logomark
}

const GiftGridDemo = defineComponent({
  name: 'GiftGridStoryDemo',
  props: {
    count: { type: Number, default: 4 },
    assets: { type: Object, default: () => ({}) },
  },
  setup (props) {
    // Per-card id/title are assigned as local vars rather than written as
    // object-literal keys here — the harness CLI's static regex parser grabs
    // the FIRST such literal in the whole file's source text to label this
    // story, so it must only ever match defineStory's own fields further down.
    return () => h(GiftGrid, { count: props.count }, {
      default: () => Array.from({ length: props.count }, (_, i) => {
        const cardId = `gift-story-${i}`
        const cardTitle = props.count < 4 ? `GIFT ${i + 1}` : 'DAILY GIFT'
        return h(GiftSkuCard, {
          key: i,
          id: cardId,
          image: giftImage(props.assets),
          title: cardTitle,
          subtitle: i === 0 ? 'Come back every day' : null,
          limitLabel: 'Limit: 1',
          baseDelay: i * 120,
        })
      }),
    })
  },
})

export default defineStory({
  id: 'gift-grid',
  title: 'Gift Grid',
  group: 'Layout',
  component: GiftGridDemo,
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
  ],
  states: ['default'],
  notes:
    'A 2-up CSS grid for GiftSkuCard children (COD:M Gifts category and the ' +
    'task-gated reward-gift section in App.vue). Always 2 columns at every ' +
    'width by default; when `count` is under 4, the M/L breakpoint (≥ 641px ' +
    'container) collapses the grid to exactly `count` columns instead so a ' +
    'short row (1-3 gifts) reads as a single centred row rather than a ' +
    'half-empty 2-up grid. `count` must match the number of children actually ' +
    'rendered — it is not derived automatically from the slot.',
  rules: [
    'Pass count = the number of gift children being rendered (App.vue uses gifts.length).',
    'count < 4 only changes layout at ≥ 641px — XS/S always stay 2-up regardless of count.',
    'count ≥ 4 (the default) keeps the plain 2-up grid at every width; extra gifts simply wrap to more rows.',
  ],
  variants: [
    {
      name: 'Few gifts (count < 4, single row)',
      props: ({ assets }) => ({ count: 2, assets }),
    },
    {
      name: 'Three gifts (single row)',
      props: ({ assets }) => ({ count: 3, assets }),
    },
    {
      name: 'Standard 2-up (count ≥ 4)',
      props: ({ assets }) => ({ count: 5, assets }),
    },
  ],
})
