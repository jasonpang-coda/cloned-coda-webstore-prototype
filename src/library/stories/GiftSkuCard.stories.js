import GiftSkuCard from '@/components/GiftSkuCard.vue'
import { defineStory } from '../story.js'

function giftImage (assets) {
  return assets.content?.giftSecretCache
    || assets.content?.giftEmote
    || assets.brand?.logomark
}

export default defineStory({
  id: 'gift-sku-card',
  title: 'Gift SKU Card',
  group: 'Cards',
  component: GiftSkuCard,
  tokens: [
    '--x-gap-content-loose',
    '--x-radius-container-s',
    '--x-bg-sku-card-default',
    '--x-blur-container',
    '--x-motion-sys-duration-slow',
    '--x-motion-sys-ease-decelerate',
    '--x-motion-sys-duration-base',
    '--x-bg-card-selected',
    '--x-shadow-card-selected',
    '--x-motion-sku-select',
    '--x-border-sku-card-selected',
    '--border-weight-selected',
    '--x-motion-sku-press-scale',
    '--x-motion-sku-press',
    '--border-weight-default',
    '--x-border-sku-card-default',
    '--x-pad-surface-s',
    '--x-radius-container-xs',
    '--x-motion-sys-ease-standard',
    '--x-pad-surface-xs',
    '--x-gap-content-tight',
    '--x-pad-surface-m',
    '--x-text-header-default',
    '--x-text-body-default',
    '--x-gap-content-narrow',
    '--x-text-hyperlink-default',
    '--x-text-body-soft',
    '--x-text-warning-default',
    '--x-text-error-default',
    '--x-text-body-subtle',
  ],
  states: ['default', 'hover'],
  notes:
    'A free-gift card with a claim CTA and an optional countdown. The confirmed-' +
    'claim state is keyed by `id` through useGiftClaim, so each gift remembers ' +
    'whether it has been claimed. With refreshesOnClaim the countdown prefix ' +
    'switches to the "Refreshes:" label once claimed.',
  rules: [
    'id, image and title are required — id keys the claim state.',
    'Localised prefixes come from endsLabel / refreshesLabel (pass the store strings).',
    'Without endsAt the card shows no countdown (resting gift).',
  ],
  variants: [
    {
      name: 'Resting',
      props: ({ assets }) => ({
        id: 'gift-resting',
        image: giftImage(assets),
        title: 'DAILY GIFT',
        subtitle: 'Come back every day',
        limitLabel: 'Limit: 1',
      }),
    },
    {
      name: 'With countdown',
      props: ({ assets }) => ({
        id: 'gift-countdown',
        image: giftImage(assets),
        title: 'WEEKEND GIFT',
        endsLabel: 'Ends:',
        endsAt: Date.now() + 13 * 60 * 60 * 1000,
      }),
    },
    {
      name: 'Refreshes on claim',
      props: ({ assets }) => ({
        id: 'gift-refreshes',
        image: giftImage(assets),
        title: 'DAILY GIFT',
        refreshesOnClaim: true,
        endsLabel: 'Ends:',
        refreshesLabel: 'Refreshes:',
        endsAt: Date.now() + 5 * 60 * 60 * 1000,
      }),
    },
  ],
})
