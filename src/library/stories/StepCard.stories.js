import StepCard from '@/components/checkout/StepCard.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'step-card',
  title: 'Step Card',
  group: 'Checkout',
  component: StepCard,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    'Shared white-surface primitive for Codashop\'s inline checkout right rail ' +
    '(config.checkout.mode === \'inline\'). Every step panel — Enter Gamer ID, ' +
    'Select Recharge, Select Payment, Zip Code, Enter Details — wraps its content ' +
    'in a StepCard for the title + card chrome (Figma node 2189:2729). The story ' +
    'renders the title only: the default slot is populated by the consuming ' +
    'Step* component and is not reproducible standalone through StoryStage, which ' +
    'binds only props — see StepGamerId/StepPayment/StepDetails/StepZipCode for ' +
    'the slot content in context.',
  rules: [
    'title is required — there is no fallback heading.',
    'Body content is entirely the default slot; StepCard itself owns no layout beyond the title + card chrome.',
    'Always the same white-surface card regardless of which step is inside it — do not fork this component per step.',
  ],
  variants: [
    {
      name: 'Default',
      props: ({ strings }) => ({
        title: strings.gamerId?.heading || 'Enter your Gamer ID',
      }),
    },
  ],
})
