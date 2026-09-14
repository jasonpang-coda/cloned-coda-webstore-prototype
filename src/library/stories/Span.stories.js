import { defineComponent, h } from 'vue'
// Span must be imported first — tools/harness-cli.mjs's list/token-sweep
// resolves a story's underlying component file via the FIRST `@/components/*.vue`
// import in the file (a static regex scan, not the actual `component:` binding),
// so importing Grid before Span here would silently attribute Grid's tokens to
// this story. See src/library/stories/Grid.stories.js for the mirror case.
import Span from '@/components/Span.vue'
import Grid from '@/components/Grid.vue'
import { defineStory } from '../story.js'

// Span itself only takes a `size` prop and a default slot — its whole job is
// column placement inside a Grid, so this story wraps it in a Grid + a
// labelled content block (same shape as real usage: `<Grid><Span
// size="..."><section /></Span></Grid>`). The wrapper's own `size` prop is a
// story-only knob, not part of Span's API.
const SpanDemo = defineComponent({
  name: 'SpanStoryDemo',
  props: {
    size: { type: String, default: 'fluid' },
  },
  setup (props) {
    return () => h(Grid, null, {
      default: () => h(Span, { size: props.size }, () =>
        h('div', { class: 'story-span-demo__block' }, `size="${props.size}"`)),
    })
  },
})

export default defineStory({
  id: 'span',
  title: 'Span',
  group: 'Atoms',
  component: SpanDemo,
  tokens: [],
  tokenFree: true,
  states: ['default'],
  // A layout primitive (column placement only) — no interactive affordance
  // of its own, same reasoning as Grid.
  presentational: true,
  notes:
    'A column-span slot that must live inside a Grid — it houses a section\'s ' +
    'actual content and its column width changes per breakpoint via container ' +
    'queries, never @media. Used throughout the page templates (HomeStandard, ' +
    'HomeBlob, CategoryCatalog, TransactionHistoryPage, OrderCompletePage, ' +
    'MilestoneRewards, Footer, NavBar) to wrap each section\'s content inside the ' +
    'shared Grid. Grid itself has no items prop — Span is the only thing that ' +
    'claims columns.',
  rules: [
    'size is one of "fluid" (default, full width at all breakpoints) | "content" ' +
      '(full width XS/S, centred 6-of-12 on M/L) | "full" (alias of fluid) | ' +
      '"carousel" (full-bleed edge-to-edge on XS/S, same centred 6-of-12 as content ' +
      'on M/L) | "col-lead" (4-of-12 left rail on M/L) | "col-main" (8-of-12 right ' +
      'rail on M/L) — col-lead/col-main are full width on XS/S.',
    'A `bare` mode is injected (not a prop) from a split-layout ancestor via ' +
      'GRID_BARE_KEY — an inner Span inside a split column must not re-centre or ' +
      'cap its own width since the outer split shell already owns placement.',
  ],
  variants: [
    { name: 'Fluid (full width)',   props: { size: 'fluid' } },
    { name: 'Content (centred)',    props: { size: 'content' } },
    { name: 'Carousel (full bleed)', props: { size: 'carousel' } },
    { name: 'Col-lead (split rail)', props: { size: 'col-lead' } },
  ],
})
