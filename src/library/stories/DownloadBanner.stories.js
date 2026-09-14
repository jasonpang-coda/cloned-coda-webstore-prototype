import DownloadBanner from '@/components/DownloadBanner.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'download-banner',
  title: 'Download Banner',
  group: 'Components',
  component: DownloadBanner,
  states: ['default', 'hover', 'pressed'],
  // docs/figma-code-connect/mappings.json's storyUrl/figmaNodeId for this story.
  // Component set imported into the "PWA" page of the COD:M v3 Flows Figma file
  // (figma.com/design/MfKZd6rReD6qZKRj0QIVr0), variants State=Default/Installed/Badges Hidden.
  figmaNodeId: '6144:22072',
  // Seed only — auto-derived and merged with the real component at export
  // time (scripts/export-handoff.mjs). Add here only a token the static
  // scan can't see (e.g. one resolved via a JS-computed inline style).
  tokens: [
    '--x-pad-surface-xl',
    '--x-pad-surface-l',
    '--x-radius-container-l',
    '--x-download-banner-border',
    '--x-gradient-download-banner-scrim',
    '--x-gap-content-default',
    '--x-text-header-default',
    '--x-gap-content-tight',
    '--x-text-body-default',
    '--x-gap-content-separation',
    '--x-gap-content-loose',
    '--x-gap-content-narrow',
    '--x-gap-control-m',
    '--x-size-control-m',
    '--x-radius-control-full',
    '--x-bg-action-primary',
    '--x-text-on-primary',
    '--x-fx-ripple-color-dark',
    '--x-motion-sku-hover',
  ],
  notes:
    'Extracted from App.vue\'s inline download-banner section (strings.page.download). ' +
    'Not installed: shows the PWA install upsell row (strings.page.pwaInstall), emitting ' +
    '`pwa-cta-click` for the parent to open TaskGiftSheet. Installed: swaps to the Web ' +
    'Push upsell row (strings.page.webPush), emitting `webpush-cta-click`. Store badges ' +
    'render inside the banner by default; set `hideBadges` when a store places them ' +
    'above the value-prop grid instead (see App.vue\'s config.content.badgesAboveValueProps, ' +
    'rendered via the sibling <StoreBadges> component in that case).',
  rules: [
    'heading is required; body/bgImage/badges/pwa/webPush rows are all optional.',
    'Only one of the PWA-install row or the Web-Push row shows at a time, gated on pwaInstalled.',
    'hideBadges suppresses the in-banner <StoreBadges> — the parent is responsible for rendering them elsewhere in that case.',
    'Parent owns the CTA side effects (TaskGiftSheet / Web Push toggle) via the pwa-cta-click / webpush-cta-click emits.',
  ],
  variants: [
    {
      name: 'Default (PWA install upsell)',
      props: ({ assets, strings }) => ({
        heading: strings.page?.download?.heading,
        body: strings.page?.download?.body,
        bgImage: assets.content?.downloadBannerBg,
        appStoreLabel: strings.page?.download?.appStoreLabel,
        appStoreUrl: strings.page?.download?.appStoreUrl,
        appStoreBadgeImg: assets.content?.appStoreBadge,
        googlePlayLabel: strings.page?.download?.googlePlayLabel,
        googlePlayUrl: strings.page?.download?.googlePlayUrl,
        googlePlayBadgeImg: assets.content?.googlePlayBadge,
        pwaInstalled: false,
        pwaInstallBody: strings.page?.pwaInstall?.body,
        pwaInstallCta: strings.page?.pwaInstall?.cta,
      }),
    },
    {
      name: 'Installed (Web Push upsell)',
      props: ({ assets, strings }) => ({
        heading: strings.page?.download?.heading,
        body: strings.page?.download?.body,
        bgImage: assets.content?.downloadBannerBg,
        appStoreLabel: strings.page?.download?.appStoreLabel,
        appStoreUrl: strings.page?.download?.appStoreUrl,
        appStoreBadgeImg: assets.content?.appStoreBadge,
        googlePlayLabel: strings.page?.download?.googlePlayLabel,
        googlePlayUrl: strings.page?.download?.googlePlayUrl,
        googlePlayBadgeImg: assets.content?.googlePlayBadge,
        pwaInstalled: true,
        webPushBody: strings.page?.webPush?.downloadBannerBody,
        webPushCta: strings.page?.webPush?.downloadBannerCta,
      }),
    },
    {
      name: 'Badges hidden (badgesAboveValueProps stores)',
      props: ({ assets, strings }) => ({
        heading: strings.page?.download?.heading,
        body: strings.page?.download?.body,
        bgImage: assets.content?.downloadBannerBg,
        hideBadges: true,
        pwaInstalled: false,
        pwaInstallBody: strings.page?.pwaInstall?.body,
        pwaInstallCta: strings.page?.pwaInstall?.cta,
      }),
    },
  ],
})
