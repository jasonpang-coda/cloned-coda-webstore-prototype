import BaseSheet from '@/components/base/BaseSheet.vue'
import { defineStory } from '../story.js'

export default defineStory({
  id: 'base-sheet',
  title: 'Base Sheet',
  group: 'Overlays',
  component: BaseSheet,
  overlay: true,
  tokens: [
    '--x-scrim',
    '--x-pad-surface-l',
    '--x-border-sheet',
    '--x-radius-container-s',
    '--x-bg-sheet',
    '--x-bg-page',
    '--x-blur-container',
    '--x-shadow-sheet',
    '--x-gap-content-default',
    '--x-pad-surface-m',
    '--x-text-header-default',
    '--x-size-icon-l',
    '--x-motion-sku-hover',
    '--x-text-header-strong',
    '--x-gap-content-loose',
    '--x-pad-surface-xl',
    '--x-size-img-xl',
    '--x-gradient-scroll-fade-bottom',
    '--x-motion-hover',
    '--x-border-divider',
    '--x-radius-container-m',
    '--x-bg-sheet-footer',
    '--x-shadow-checkout-footer',
    '--x-checkout-loyalty-overlap',
    '--x-motion-modal-enter',
    '--x-motion-sys-duration-modal-panel-delay',
    '--x-motion-modal-exit',
    '--x-motion-sys-duration-footer-delay',
    '--x-motion-sys-distance-lg',
  ],
  states: ['default'],
  notes:
    'The one bottom-sheet/modal shell every overlay in this app (CheckoutSheet, ' +
    'PurchaseSheet, ClaimGiftSheet, SignInSheet, RegionSelectorSheet, ' +
    'LanguageSelectorSheet, TaskGiftSheet) is built on. Owns the scrim, the ' +
    'frosted L3 panel, the slide-up / responsive-centered-modal transition, the ' +
    'bottom scroll scrim, Escape-to-close, and (when scrim=false) outside-tap-to- ' +
    'close. Consumers own state (open/contentKey/sizeHint from their own ' +
    'composables) and content (slots) — BaseSheet owns none of it. Bumping ' +
    '`contentKey` while `open` stays true drives the auto-size engine: the panel ' +
    'measures its old height, lets the new slot content patch in clipped at that ' +
    'height, then grows/shrinks to the new natural height — the resize itself is ' +
    'the transition between two views of the same sheet.',
  rules: [
    "When overriding this shared chrome for a new layout mode (e.g. .sheet__header padding), check whether ANY ancestor (e.g. DeviceFrame's overlay) applies a competing rounded-corner clip at a different radius before removing padding as 'redundant' — it may be the only thing keeping content out of that clip zone. Happened twice: diagnosing the landscape corner-square fix, then a regression (missing close button) from stripping this exact padding.",
    '`open` is required to mount anything — BaseSheet renders nothing at all when false.',
    'scrim=false (SignInSheet\'s pattern) leaves the page behind interactive; BaseSheet falls back to a document-level outside-tap listener for dismissal instead.',
    'sizeHint maps to a fixed mobile/framed height policy: tall (85%), full (95%), compact (auto, max 95%), content (max 85%, no fixed height), content-full (max 100%, no fixed height).',
    'dismissable=false suppresses close() entirely — Escape, scrim click, and the close button all become no-ops.',
    'Changing contentKey while open triggers the resize + cross-fade engine; it must be a stable per-view identity (a step id), never something that changes on every render.',
  ],
  variants: [
    {
      name: 'Default (tall)',
      props: ({ strings }) => ({
        open: true,
        isMobile: true,
        title: strings.page?.giftClaimHeading || 'Sheet Title',
        sizeHint: 'tall',
      }),
    },
    {
      name: 'Content-hugging',
      props: ({ strings }) => ({
        open: true,
        isMobile: true,
        title: strings.ui?.selectLanguage || 'Select Language',
        sizeHint: 'content',
      }),
    },
    {
      name: 'No scrim (content-full)',
      props: ({ strings }) => ({
        open: true,
        isMobile: true,
        scrim: false,
        ariaModal: false,
        title: strings.signIn?.sheetTitle || 'Sign In',
        sizeHint: 'content-full',
      }),
    },
    {
      name: 'Responsive (desktop modal)',
      props: ({ strings }) => ({
        open: true,
        isMobile: false,
        title: strings.page?.giftClaimHeading || 'Sheet Title',
        sizeHint: 'tall',
        maxWidth: 560,
      }),
    },
  ],
})
