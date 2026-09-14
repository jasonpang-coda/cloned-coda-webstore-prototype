import CategoryBanner from '@/components/CategoryBanner.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'category-banner',
  title: 'Category Banner',
  group: 'Content',
  component: CategoryBanner,
  states: ['default'],
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-gap-content-default',
    '--x-category-banner-pad',
    '--x-pad-surface-s',
    '--x-category-banner-border',
    '--x-category-banner-border-bottom',
    '--x-border-divider',
    '--x-radius-container-xs',
    '--x-motion-sys-duration-base',
    '--x-motion-sys-ease-decelerate',
    '--x-scrim-strong',
    '--x-size-img-xxl',
    '--x-radius-circle',
    '--x-surface-ghost-2',
    '--x-gap-content-narrow',
    '--x-pad-surface-xxs',
    '--x-pad-surface-xs',
    '--x-surface-ghost-5',
    '--x-text-header-default',
    '--x-gap-content-tight',
  ],
  notes:
    'A generic promo/event header used above a catalog section (double-currency, ' +
    'new-users, gifts, CP deals). All text and imagery are optional — the banner ' +
    'renders with whatever subset of icon/title/description/subtext/background it ' +
    'is given. When `endsAt` is set it starts a 1s setInterval (cleared on unmount) ' +
    'driving a live "Xd 00h 00m" countdown chip; the description supports simple ' +
    'HTML via v-html for bold emphasis. The #action slot (e.g. a PWA-install CTA or ' +
    'a Web Push ToggleSwitch, see App.vue\'s gifts banner) sits as a flex sibling of ' +
    'the text column so it never gets squeezed by flex:1.',
  rules: [
    'Every prop is optional — title, description, subtext, icon and backgroundImage each render only when supplied.',
    'endsAt is an ms-epoch timestamp; omit it entirely to suppress the countdown chip (do not pass 0).',
    'description is rendered with v-html — only pass trusted/sanitized markup (<strong>/<b> supported).',
    'Use the #action slot for a single right-aligned control; it is a flex sibling of the text column, not nested inside it.',
  ],
  variants: [
    {
      name: 'Double currency (with countdown)',
      props: ({ assets, strings }) => ({
        backgroundImage: assets.content?.cpSkuBanner,
        icon: assets.content?.cpCoins?.[58000],
        title: strings.page?.doubleCurrencyHeading,
        description: strings.page?.doubleCurrencyDesc,
        countdownLabel: strings.common?.carousel?.eventEndsIn || 'Event ends in:',
        endsAt: Date.now() + (2 * 86400 + 5 * 3600 + 30 * 60) * 1000,
      }),
    },
    {
      name: 'New users (title + description + subtext)',
      props: ({ assets, strings }) => ({
        backgroundImage: assets.content?.cpSkuBanner,
        icon: assets.content?.cpCoins?.[58000],
        title: strings.page?.newUsersHeading,
        description: strings.page?.newUsersDesc,
        subtext: strings.page?.newUsersSub,
      }),
    },
    {
      name: 'Icon-less, description-only',
      props: ({ assets, strings }) => ({
        backgroundImage: assets.content?.cpImgBannerBg || assets.content?.cpSkuBanner,
        title: strings.page?.cpImageSection,
        description: strings.page?.cpImageSectionDesc,
      }),
    },
    {
      name: 'With action slot (gifts banner)',
      props: ({ assets, strings }) => ({
        backgroundImage: assets.content?.giftsBanner || assets.content?.cpSkuBanner,
        icon: assets.content?.cpCoins?.[88],
        title: strings.page?.giftsHeading,
        description: strings.page?.pwaInstall?.giftsBannerDesc || strings.page?.webPush?.giftsBannerDesc,
      }),
    },
  ],
})
