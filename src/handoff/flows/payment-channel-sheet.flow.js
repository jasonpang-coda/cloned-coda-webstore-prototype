/**
 * payment-channel-sheet — COD:M's (and every default, non-FCM-Buy-Now store's)
 * Payment/Checkout step: account row, chosen-item banner, the payment-channel
 * grid, and the static Terms & Conditions bar (CheckoutStepBody.vue) plus its
 * pinned footer (CheckoutStepFooter.vue) — both mounted by PurchaseSheet.vue
 * inside BaseSheet.vue.
 *
 * This handoff covers the FULL-SCREEN LANDSCAPE layout (Figma node 6060:3935)
 * added on top of the existing portrait bottom sheet, plus the two features
 * that ship alongside it: a promo-code field and the Boleto BR KYC form that
 * replaces this step's content when that channel is chosen.
 *
 * Traced from: src/components/base/BaseSheet.vue (`landscapeFull` prop + the
 * `.sheet--landscape-full` CSS block), src/components/steps/CheckoutStepBody.vue,
 * src/components/steps/CheckoutStepFooter.vue, src/components/checkout/BoletoKycForm.vue,
 * src/composables/useCheckout.js (selectedChannel/promoDiscountAmount/showBoletoKyc
 * singletons), src/composables/useOrientation.js, src/content/sheetContent.js
 * (checkoutDescriptor()), src/components/DeviceFrame.vue (the corner-squaring
 * this layout depends on).
 */
import { defineFlow } from '../flow.js'
import CheckoutStepBody from '../../components/steps/CheckoutStepBody.vue'
import CheckoutStepFooter from '../../components/steps/CheckoutStepFooter.vue'
import BoletoKycForm from '../../components/checkout/BoletoKycForm.vue'
import PaymentChannelSheetComposed from './PaymentChannelSheetComposed.vue'
import PaymentChannelSheetChoreographyStage from './PaymentChannelSheetChoreographyStage.vue'
import { useCheckout } from '../../composables/useCheckout.js'
import { useOrientation } from '../../composables/useOrientation.js'

import googleAppleLogo from '@/shared/pc/light/google-apple.svg'
import creditCardLogo  from '@/shared/pc/light/credit-card.svg'
import paypalVenmoLogo from '@/shared/pc/light/paypal-venmo.svg'
import cashAppLogo     from '@/shared/pc/light/cash-app.svg'
import boletoLogo      from '@/shared/pc/light/boleto.svg'

// Mirrors sheetContent.js's checkoutDescriptor() shape exactly — same field
// names, same 5-channel list (incl. `key`, added for Boleto detection) — so
// this demo data is a faithful stand-in, not an invented shape.
const SAMPLE_DATA = {
  item: {
    label: null,
    amount: 88,
    currencyLabel: 'CP',
    currentPrice: '$0.99',
    skuImage: null,
    subtitle: null,
    baseAmount: 80,
    bonusAmount: 8,
    bonusLabel: 'WEB BONUS',
  },
  accountName: '123456789',
  bonusLabelFallback: 'BONUS',
  itemInfoLabel: 'Item Info',
  selectPaymentHeading: 'Select Payment',
  channels: [
    { key: 'googleApple', logo: googleAppleLogo, label: 'Google Pay / Apple Pay' },
    { key: 'creditCard', logo: creditCardLogo, label: 'Card Payments' },
    { key: 'paypalVenmo', logo: paypalVenmoLogo, label: 'PayPal' },
    { key: 'cashApp', logo: cashAppLogo, label: 'Cash App' },
    { key: 'boleto', logo: boletoLogo, label: 'Boleto' },
  ],
  subtotalLabel: 'Subtotal',
  poweredByLabel: 'Powered by',
  showPoweredByCoda: true,
  showRating: false,
  codaLogo: null,
  ratingImage: null,
  termsHeading: 'Terms and Conditions',
  termsBody: 'By clicking "Checkout", I acknowledge that the purchase of this virtual item will be a license for its use.',
  viewTerms: 'View Terms and Conditions',
  loyalty: null,
  loyaltyPoints: null,
  loyaltyIcon: null,
}
const SAMPLE_PRIMARY_ACTION = { kind: 'checkout', label: 'Checkout', enabled: true }

export default defineFlow({
  slug: 'payment-channel-sheet',
  title: 'Payment Channel Sheet — Landscape',
  summary: 'CheckoutStepBody/Footer\'s full-screen landscape layout (Figma 6060:3935): a 2-col grid (5fr:3fr) replacing the portrait bottom sheet, plus a promo-code field and the Boleto BR KYC form.',

  components: [
    {
      id: 'Full sheet (landscape, composed)',
      component: PaymentChannelSheetComposed,
      props: { data: SAMPLE_DATA, primaryAction: SAMPLE_PRIMARY_ACTION },
      width: '956px',
      height: '440px', // landscape iPhone screen dims (DEVICES.iphone, W/H swapped) — see devices/index.js
      source: 'src/components/base/BaseSheet.vue + src/components/steps/CheckoutStepBody.vue + src/components/steps/CheckoutStepFooter.vue',
      notes: 'Composed preview only — mounts BaseSheet with both CheckoutStepBody and CheckoutStepFooter together (via PaymentChannelSheetComposed.vue, a handoff-only wrapper), so the actual 2-col landscape grid is visible in one render. The two entries below stage the body and footer in isolation instead — that\'s the right view for auditing each one\'s own contract/tokens, but neither shows the composed page. Not a real app component — no separate token contract of its own (covered by the two entries below).',
      tokens: [],
      onStage: () => { useOrientation().orientation.value = 'landscape'; useCheckout().selectedChannel.value = 0 },
      offStage: () => { useOrientation().orientation.value = 'portrait'; useCheckout().showBoletoKyc.value = false },
    },
    {
      id: 'CheckoutStepBody',
      component: CheckoutStepBody,
      props: { data: SAMPLE_DATA, isMobile: true },
      source: 'src/components/steps/CheckoutStepBody.vue',
      notes: 'Left column in landscape-full: heading + 3-up payment-channel grid (2-up in portrait) + PromoCode field (landscape only). Swaps its ENTIRE rendered content for BoletoKycForm (both orientations) when useCheckout().showBoletoKyc is set, via a <Transition mode="out-in"> cross-fade.',
      tokens: [
        '--x-bg-indicator-neutral-default', '--x-gradient-checkout-banner',
        '--x-size-img-xl', '--x-gradient-thumb-gloss', '--x-border-soft',
        '--x-text-header-default', '--x-text-body-default', '--x-text-header-strong', '--x-text-bonus-amount',
        '--x-text-hyperlink-default', '--x-text-body-soft', '--x-text-final-price',
        '--x-bg-card-default', '--x-bg-card-selected', '--x-border-sku-card-default', '--x-border-sku-card-hover',
        '--border-weight-default', '--border-weight-selected', '--x-border-divider',
        '--x-radius-container-xs',
        '--x-pad-surface-s', '--x-pad-surface-m',
        '--x-gap-content-tight', '--x-gap-content-narrow', '--x-gap-content-default', '--x-gap-content-loose',
        '--x-size-icon-l',
        '--x-motion-sku-hover', '--x-motion-sys-duration-fast', '--x-motion-sys-duration-base',
        '--x-motion-sys-ease-accelerate', '--x-motion-sys-ease-decelerate',
      ],
      onStage: () => { useOrientation().orientation.value = 'landscape'; useCheckout().selectedChannel.value = 0 },
      offStage: () => { useOrientation().orientation.value = 'portrait'; useCheckout().showBoletoKyc.value = false },
    },
    {
      id: 'CheckoutStepFooter',
      component: CheckoutStepFooter,
      props: { data: SAMPLE_DATA, primaryAction: SAMPLE_PRIMARY_ACTION, canScrollBody: false, isMobile: true },
      source: 'src/components/steps/CheckoutStepFooter.vue',
      notes: 'Right column in landscape-full: item (thumb + title/subtitle) + a Selected Payment row + Subtotal (net of any promo discount) + the Checkout CTA — all right-aligned. Checkout\'s onBuyNow() sets showBoletoKyc instead of emitting confirm when the Boleto channel is selected.',
      tokens: [
        '--x-size-img-xl', '--x-radius-container-xs', '--x-gradient-thumb-gloss', '--x-border-soft',
        '--x-text-header-default', '--x-text-body-default', '--x-text-hyperlink-default',
        '--x-border-divider', '--border-weight-default',
        '--x-gap-content-tight', '--x-gap-content-narrow', '--x-gap-content-default', '--x-gap-content-separation',
        '--x-pad-surface-s',
      ],
      onStage: () => { useOrientation().orientation.value = 'landscape'; useCheckout().selectedChannel.value = 0 },
      offStage: () => { useOrientation().orientation.value = 'portrait' },
    },
    {
      id: 'BoletoKycForm',
      component: BoletoKycForm,
      props: {},
      source: 'src/components/checkout/BoletoKycForm.vue',
      notes: 'Fixed Portuguese copy (Boleto is a Brazil-only instrument — not run through the locale system, same precedent as the channel grid\'s own hardcoded "PayPal"/"Cash App" labels). Prototype-only: local unwired inputs, no submit action. Field chrome copies StepZipCode.vue/StepDetails.vue\'s existing <input> convention — no shared Input component exists in this repo.',
      tokens: [
        '--x-border-input-default', '--x-border-input-focused', '--x-bg-input-default',
        '--x-text-body-default', '--x-text-placeholder',
        '--x-radius-input-s', '--x-size-input-m', '--border-weight-default',
        '--x-gap-content-tight', '--x-gap-content-narrow', '--x-gap-content-default', '--x-gap-content-loose',
        '--x-size-icon-m',
      ],
    },
    {
      // No standalone demo mount — BaseSheet wraps slot content and needs an
      // `open` host; the layout mechanics it owns are documented here by
      // source citation instead (same precedent as seo-block.flow.js's
      // SeoValueProp/SeoTileBackdrop entries for non-isolated pieces).
      id: 'BaseSheet (landscapeFull)',
      source: 'src/components/base/BaseSheet.vue',
      notes: 'Owns the actual full-screen mechanics: `landscapeFull` prop (true only when isMobile && useOrientation() === \'landscape\'); the panel goes edge-to-edge with a flat --x-bg-page fill (no --x-bg-sheet gradient/blur — this is a page, not a floating glass panel), grid-template-columns: 5fr 3fr, 12px panel padding/gap. The header uses the SAME chrome every other sheet gets (no override) plus an added 8px bottom padding. Both grid cells (.sheet__body / .sheet__footer) become their own L1 container — --x-bg-sku-card-default fill, --x-radius-container-s radius, 12px/8px padding, 8px gap, NO border (unlike the PC-card tiles inside them, which do have a border).',
      tokens: [
        '--x-bg-page', '--x-bg-sku-card-default', '--x-radius-container-s',
        '--x-pad-surface-m', '--x-pad-surface-s',
      ],
    },
    {
      id: 'DeviceFrame (landscape corner-square)',
      source: 'src/components/DeviceFrame.vue',
      notes: 'The framed device preview\'s overlay layer squares off ALL FOUR corners in landscape (previously only the bottom did, for CategoryNav\'s full-bleed bar) — without this, the full-screen sheet\'s square panel corners would still get visually clipped into a curve by the overlay\'s own rounded-corner mask, even though the panel\'s own border-radius is 0. Nothing else currently renders flush against the overlay\'s top corners, so this is a no-op everywhere else in the app.',
      tokens: [],
    },
  ],

  // Harvested from the v-if/v-else branches + :class bindings across
  // BaseSheet/CheckoutStepBody/CheckoutStepFooter/BoletoKycForm, plus the
  // useCheckout.js singleton refs each surface reads.
  states: [
    { id: 'layout_portrait', desc: 'Bottom sheet (85% height), single scrolling column: account row, item banner, 2-up payment grid, static T&Cs bar. Footer is a horizontal price+CTA bar.', entry: '!isMobile || useOrientation() !== \'landscape\'', exit: 'framed device rotates to landscape' },
    { id: 'layout_landscape_full', desc: 'Edge-to-edge full-screen page, square corners, 2-col grid (payment list : summary, 5fr:3fr). Account row, item banner, and T&Cs bar move out of the left column (banner content re-renders in the right column instead; account/T&Cs simply have no room and are omitted).', entry: 'isMobile && useOrientation() === \'landscape\'', exit: 'framed device rotates to portrait' },
    { id: 'pc_grid_2up', desc: 'Payment-channel cards, 2 per row, flex-grow:0 so a lone last-row card (5 channels is an odd count) stays half-width instead of stretching.', entry: 'layout_portrait', exit: 'layout_landscape_full' },
    { id: 'pc_grid_3up', desc: 'Payment-channel cards, 3 per row, same flex-grow:0 rule (a lone last-row card stays a third-width, not full-width). Every card also shows its price line, absent in earlier iterations.', entry: 'layout_landscape_full', exit: 'layout_portrait' },
    { id: 'pc_card_default', desc: 'Card shows logo (or, absent a logo, label text only — e.g. no fabricated Boleto mark before the real asset shipped) + label (+ price, once an item is selected upstream).', entry: 'selectedChannel !== this card\'s index', exit: 'card tapped' },
    { id: 'pc_card_selected', desc: '2px --x-text-hyperlink-default gradient ring (border-weight-selected) + --x-bg-card-selected fill.', entry: 'selectedChannel === this card\'s index — index 0 by default (see channel_preselected below)', exit: 'a different card tapped' },
    { id: 'channel_preselected', desc: 'The first channel (index 0) reads selected with no user interaction at all.', entry: 'useCheckout().selectedChannel defaults to 0 (was null before this feature)', exit: 'user taps a different card' },
    { id: 'promo_absent', desc: 'No promo-code field at all.', entry: 'layout_portrait', exit: 'layout_landscape_full' },
    { id: 'promo_collapsed', desc: '"Have a promo code?" accordion header only, form hidden.', entry: 'layout_landscape_full, PromoCode mounts closed', exit: 'header tapped' },
    { id: 'promo_expanded_form', desc: 'Code input + Apply button + helper text visible.', entry: 'accordion opened, status !== \'applied\'', exit: 'valid code applied, or accordion re-collapsed' },
    { id: 'promo_applied', desc: 'Success pill replaces the form; Subtotal in the right column drops by the discount amount.', entry: 'PromoCode emits applied(discount) — demo code SAVE10, 10% off', exit: 'pill\'s close (x) tapped' },
    { id: 'selected_payment_row_visible', desc: 'A row above Subtotal shows the chosen channel\'s label, right-aligned.', entry: 'layout_landscape_full and a channel is selected (always true — see channel_preselected)', exit: 'layout_portrait' },
    { id: 'boleto_form_hidden', desc: 'CheckoutStepBody renders its normal content (grid/banner/terms as appropriate to orientation).', entry: 'useCheckout().showBoletoKyc === false', exit: 'Checkout tapped with Boleto selected' },
    { id: 'boleto_form_shown', desc: 'CheckoutStepBody\'s ENTIRE content (both orientations) is replaced by BoletoKycForm — name/last-name/phone/email/DOB/CPF fields, Portuguese copy, a "Voltar" back link.', entry: 'CheckoutStepFooter\'s onBuyNow() sets showBoletoKyc = true, gated on data.channels[selectedChannel]?.key === \'boleto\'', exit: '"Voltar" tapped (returns to boleto_form_hidden, selection unchanged) or the whole sheet closes (useCheckout().closeCheckout() resets showBoletoKyc)' },
    { id: 'dob_field_default', desc: 'Bordered box, calendar_today icon (--x-text-body-default) + "Data de nascimento" placeholder.', entry: 'always, while boleto_form_shown', exit: 'n/a — no further state' },
    { id: 'phone_field_default', desc: 'Bordered box: a non-editable "+55" chip, a vertical divider, then the phone input.', entry: 'always, while boleto_form_shown', exit: 'n/a — no further state' },
    { id: 'header_close_default', desc: 'Standard close (×) button, same chrome as every other sheet\'s header.', entry: 'always', exit: 'n/a — this state has no variant; noted because an earlier iteration of this layout had a padding override that made the button intermittently disappear at some viewport scales (fixed, not a real state)' },
  ],

  transitions: [
    { from: 'layout_portrait', to: 'layout_landscape_full', trigger: 'framed device rotated to landscape (useOrientation().toggle(), DeviceToolbar\'s rotate control)' },
    { from: 'pc_card_default', to: 'pc_card_selected', trigger: 'tap', motion: ['--x-motion-sku-hover'] },
    { from: 'promo_collapsed', to: 'promo_expanded_form', trigger: 'accordion header tap' },
    { from: 'promo_expanded_form', to: 'promo_applied', trigger: 'Apply tapped with the valid demo code' },
    { from: 'boleto_form_hidden', to: 'boleto_form_shown', trigger: 'Checkout tapped, Boleto selected', motion: ['--x-motion-sys-duration-fast', '--x-motion-sys-ease-accelerate', '--x-motion-sys-duration-base', '--x-motion-sys-ease-decelerate'] },
    { from: 'boleto_form_shown', to: 'boleto_form_hidden', trigger: '"Voltar" tapped', motion: ['--x-motion-sys-duration-fast', '--x-motion-sys-ease-accelerate', '--x-motion-sys-duration-base', '--x-motion-sys-ease-decelerate'] },
  ],

  // The boleto_form_hidden <-> boleto_form_shown swap is the one animated
  // beat in this feature — a plain opacity cross-fade, NOT the resize/height
  // engine BaseSheet's contentKey prop drives for a step change elsewhere in
  // the purchase flow (this swap happens entirely inside one step, so
  // contentKey never bumps and no resize animation runs).
  choreography: [
    { beat: 'Old content (grid or form) fades out', delayMs: 0, duration: '--x-motion-sys-duration-fast', easing: '--x-motion-sys-ease-accelerate', target: '.checkout-step-body or BoletoKycForm root' },
    { beat: 'New content fades in', delayMs: 0, duration: '--x-motion-sys-duration-base', easing: '--x-motion-sys-ease-decelerate', target: '.checkout-step-body or BoletoKycForm root' },
  ],

  // Live visual stage for the Choreography tab's BeatTimeline — see
  // PaymentChannelSheetChoreographyStage.vue for why this is flow-specific
  // rather than a generic auto-render off the beats above.
  choreographyStage: {
    component: PaymentChannelSheetChoreographyStage,
    props: { data: SAMPLE_DATA },
  },

  flowChart: `flowchart TD
    portrait["Portrait: bottom sheet, 2-up grid"] -- rotate to landscape --> landscape["Landscape: full-screen, 2-col grid (5fr:3fr)"]
    landscape -- rotate to portrait --> portrait
    landscape --> pick["Tap a payment-channel card"]
    pick --> selected["pc_card_selected (index 0 pre-selected by default)"]
    selected --> promo{"Boleto selected?"}
    promo -- no --> checkout["Checkout tapped -> confirm emitted (normal flow)"]
    promo -- yes, Checkout tapped --> kyc["boleto_form_shown — CheckoutStepBody's content replaced by BoletoKycForm"]
    kyc -- Voltar --> selected`,

  stateChart: `stateDiagram-v2
    [*] --> layout_portrait
    layout_portrait --> layout_landscape_full: rotate to landscape
    layout_landscape_full --> layout_portrait: rotate to portrait
    layout_portrait --> pc_grid_2up
    layout_landscape_full --> pc_grid_3up
    pc_card_default --> pc_card_selected: tap
    [*] --> channel_preselected
    channel_preselected --> pc_card_selected
    promo_collapsed --> promo_expanded_form: header tap
    promo_expanded_form --> promo_applied: valid code
    boleto_form_hidden --> boleto_form_shown: Checkout tapped, Boleto selected
    boleto_form_shown --> boleto_form_hidden: Voltar tapped`,

  notes: {
    rationale: 'The landscape layout exists because the portrait bottom sheet wastes most of a landscape framed device\'s width on empty page background either side of a narrow centred column — going full-screen with a 2-col grid uses that width for the payment grid and order summary side by side instead of stacking them. Boleto BR needed a KYC form (a Brazilian payment instrument requires buyer identity/CPF up front) — it replaces this step\'s content in place rather than opening a new sheet, since the alternative (a whole new PurchaseSheet step wired through usePurchaseFlow.js) was unwarranted for a single payment-method\'s extra form.',
    gotchas: [
      'The landscape overlay corner-squaring lives in DeviceFrame.vue, not BaseSheet — a full-screen sheet\'s own border-radius:0 is not enough on its own; the PARENT overlay clips with its own rounded-corner mask regardless of the panel\'s own radius. Any future full-bleed-to-the-very-corner surface needs the same overlay-level fix, not a panel-level one.',
      'selectedChannel defaults to 0 (not null) app-wide, not just in this layout — dismissBuyNow() also resets it to 0, not null. checkoutReady\'s null-check (selectedChannel != null) still works since 0 != null.',
      'The Checkout CTA label ("Checkout") is a literal in sheetContent.js\'s checkoutDescriptor(), NOT the shared strings.checkout.actionLabel — that string still drives the Info step\'s and the FCM payment step\'s own CTAs, which keep "Buy Now". Do not repoint those to share this literal.',
      'The right column\'s "Selected Payment" row label is also a local literal in CheckoutStepFooter.vue, deliberately distinct from data.selectPaymentHeading (the picker\'s own "Select Payment" grid heading in the left column) — the same underlying string reused for both would read wrong on one side.',
      'Boleto\'s payment-tile logo is a real shipped asset (src/shared/pc/light/boleto.svg) — earlier iterations of this feature used a text-only tile (no fabricated brand mark) before the asset was provided; don\'t reintroduce a placeholder now that a real logo exists.',
      'BoletoKycForm\'s copy is fixed Portuguese regardless of the active store locale — it is not routed through the locale/strings system, the same way the payment-channel labels ("PayPal", "Cash App") are hardcoded English literals rather than localized strings.',
      'The DOB field\'s calendar icon needed a NEW entry in MaterialIcon.vue\'s icon allowlist (calendar_today was never registered) — that component resolves icons from an explicit imported map, not a generic dynamic import, so a new icon always needs a manifest entry there before it renders anything.',
    ],
    openQuestions: [
      'What happens after the Boleto KYC form is filled in and submitted — no submit action exists yet (prototype scope only, matching PromoCode.vue\'s own "no real backend" precedent). A production build needs a real submit behaviour and validation before this ships.',
      'Should Boleto also appear in the FCM payment-step view (PaymentStepBody/PaymentStepFooter, config.checkout.channels-driven)? This handoff only covers the default (non-FCM) checkout step CheckoutStepBody/Footer render.',
    ],
    buildOrder: [
      'T1 — Portrait layout unchanged (regression check): confirm the existing bottom-sheet/2-up-grid layout is untouched by this feature when not in landscape.',
      'T2 — Landscape full-screen shell: BaseSheet\'s landscapeFull grid (5fr:3fr), flat page background, square corners (both the panel and the parent overlay/device-frame level), L1 container columns with 12px/8px padding and 8px gap.',
      'T3 — Landscape content split: 3-up payment grid (equal-width cards) in the left column; item + Selected Payment row + Subtotal + Checkout CTA in the right column, right-aligned.',
      'T4 — Promo code: PromoCode field after the grid (landscape only), wired so its discount reaches the right column\'s Subtotal without a prop bridge.',
      'T5 — Boleto BR channel: 5th tile with its real logo; selecting it + tapping Checkout swaps the whole step\'s content (both orientations) for the KYC form via a cross-fade, with a working back link.',
    ],
    prohibitions: [
      'Never let a lone last-row payment card stretch to fill its row — every card in a row must stay equal width, in both the 2-up and 3-up grids.',
      'Never reuse the picker\'s "Select Payment" heading string for the summary column\'s "Selected Payment" row — they read correctly only because they are different strings.',
      'Never wire the Boleto form\'s copy through the locale/strings system — it is deliberately fixed Portuguese.',
      'Never invent a submit action for the Boleto KYC form — it is intentionally unwired in this prototype; a production port needs a real one, not an invented placeholder.',
      'Never square a sheet\'s own panel corners without ALSO squaring the parent overlay\'s corners in landscape — the panel-level fix alone is insufficient, the overlay still clips it.',
    ],
  },
})
