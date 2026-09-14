import StepDetails from '@/components/checkout/StepDetails.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'step-details',
  title: 'Step Details',
  group: 'Checkout',
  component: StepDetails,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [],
  notes:
    '"Enter Details" step (Figma 2198:5139), the final panel of the inline ' +
    'checkout. Has NO real props at all — email/consent are local state, and ' +
    'every other difference (the optional Terms & Conditions block, the CTA\'s ' +
    'leading icon, whether the CTA renders here at all) is entirely driven by ' +
    'useStoreStrings()/useStoreConfig() singletons rather than anything a story ' +
    'variant can set. Only one variant is shown here since there is nothing to ' +
    'vary from the outside — see the live app under a store with ' +
    'config.checkout.mode === \'inline\' (Codashop, Diablo Immortal, ZZZ) to see ' +
    'the terms-block / stepCta-hides-the-button branches in context.',
  rules: [
    'consentLabel/termsBody render via v-html — store copy is trusted, authored content, same precedent as CategoryBanner\'s description prop.',
    'strings.details.termsBody === null hides the whole Terms & Conditions block (every store before Diablo Immortal).',
    'config.checkout.stepCta: true removes the CTA from this card entirely — InlineCheckoutCta.vue renders it instead as its own sticky section (Diablo Immortal only).',
  ],
  variants: [
    {
      name: 'Default',
      props: () => ({}),
    },
  ],
})
