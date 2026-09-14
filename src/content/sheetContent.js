import { parsePrice } from '../utils/parsePrice.js'
import { formatNumber } from '../utils/formatNumber.js'

/**
 * fetchSheetContent — the content seam for the purchase flow's sheet steps.
 *
 * Shaped like a call to a real content microservice: `fetchSheetContent(stepId,
 * ctx)` returns a plain, serializable descriptor (string/number/asset-URL
 * values only — no Vue refs, no functions). Today it resolves SYNCHRONOUSLY
 * from the existing whitelabel stores (useStoreConfig/useStoreStrings/
 * useStoreAssets) and the item passed into the flow; the signature and return
 * shape are exactly what an async service would emit, so swapping in a real
 * one later is `await fetch('/content/' + stepId)` inside THIS file only —
 * no other file changes.
 *
 * Descriptor schema:
 *   {
 *     stepId, view, title, sizeHint, dismissable,
 *     primaryAction: { kind, label, enabled },
 *     data: { ...resolved copy + item fields the step view renders },
 *   }
 *
 * The branching that used to live inside the sheet templates (config.
 * itemSummary.titleFromItem, showProduct:false, footer:'buyNow', etc.) moves
 * HERE — step views render `descriptor.data` and never read config/strings/
 * assets directly.
 *
 * ctx = { item, signedIn, guestVerified, playerName, guestPlayerName, config,
 *          strings, assets, common }
 */
export function fetchSheetContent(stepId, ctx) {
  if (stepId === 'info') return infoDescriptor(ctx)
  if (stepId === 'payment') return paymentDescriptor(ctx)
  if (stepId === 'checkout') return checkoutDescriptor(ctx)
  return null
}

// The account name shown across every step — the real signed-in display name
// (useAuth's playerName, which changes with the store's sign-in flow: COD:M's
// simulated loader, EA's email-prefix, KONAMI's email-prefix) once signed in,
// otherwise the guest's looked-up Player ID (useCheckout's guestPlayerName)
// once guest-verified. Never a literal — this used to be hardcoded 'codayw'
// in several places, which meant switching accounts didn't change what the
// sheet showed.
function resolveAccountName(ctx) {
  if (ctx.signedIn) return ctx.playerName || null
  return ctx.guestPlayerName || null
}

function infoDescriptor(ctx) {
  const { item: bundle, signedIn, guestVerified, config, strings, assets, common } = ctx
  if (!bundle) return null

  const itemSummaryCfg = config.itemSummary ?? {}
  const canBuy = signedIn || guestVerified
  const isFcmBuyNow = itemSummaryCfg.footer === 'buyNow'

  const rewardsLabel = (() => {
    const loyalty = config.checkout?.loyalty
    const points = bundle.loyaltyPoints
    if (!loyalty || points == null) return null
    return `${loyalty.label} ${formatNumber(points)}`
  })()

  const buyLabel = (() => {
    const action = strings.checkout?.actionLabel ?? 'Buy Now'
    return bundle.currentPrice ? `${action} • ${bundle.currentPrice}` : action
  })()

  return {
    stepId: 'info',
    view: 'InfoStepView',
    title: itemSummaryCfg.titleFromItem ? bundle.title : strings.itemSummary?.heading,
    sizeHint: itemSummaryCfg.showProduct === false ? 'compact' : 'content',
    dismissable: true,
    primaryAction: {
      kind: isFcmBuyNow ? 'buyNow' : 'buy',
      label: isFcmBuyNow ? common.checkout.buyNow : buyLabel,
      enabled: true,
    },
    data: {
      bundle,
      accountName: resolveAccountName(ctx),
      showProduct: itemSummaryCfg.showProduct !== false,
      compactAccordion: !!itemSummaryCfg.compactAccordion,
      footer: itemSummaryCfg.footer ?? 'default',
      canBuy,
      rewardsLabel,
      showRating: !!config.checkout?.showRating,
      logomark: assets.brand.logomark ?? null,
      loyaltyIcon: assets.brand.loyaltyIcon ?? null,
      receiveLabel: strings.itemSummary?.receiveLabel ?? null,
      signedOutMessage: strings.itemSummary?.signedOutMessage ?? null,
      endsLabel: strings.itemSummary?.endsLabel ?? null,
      signInCta: strings.signIn?.cta ?? null,
      orLabel: strings.itemSummary?.orLabel ?? null,
      signInIdCta: strings.itemSummary?.signInIdCta ?? null,
    },
  }
}

function paymentDescriptor(ctx) {
  const { item, config, strings, assets, common } = ctx
  if (!item) return null

  const parsed = parsePrice(item.currentPrice)
  const breakdown = (() => {
    if (!parsed) return null
    const fmt = (n) => `${parsed.prefix}${n.toFixed(2)}`
    // Mock breakdown (prototype-only — no real tax data): treats the SKU's
    // price as tax-inclusive at a flat 5% rate, rounds item/tax to 2dp so
    // item + tax reconstructs to the displayed total.
    const itemAmount = Math.round((parsed.amount / 1.05) * 100) / 100
    const tax = Math.round((parsed.amount - itemAmount) * 100) / 100
    return { item: fmt(itemAmount), tax: fmt(tax), total: fmt(parsed.amount) }
  })()

  const channels = (config.checkout?.channels ?? []).map((c) => ({
    ...c,
    logo: c.logoKey ? (assets.pc[c.logoKey] ?? null) : null,
    price: channelPrice(c, item.currentPrice, parsed),
  }))

  return {
    stepId: 'payment',
    view: 'PaymentStepView',
    title: common.checkout.orderSummary,
    sizeHint: 'full',
    dismissable: true,
    primaryAction: {
      kind: 'selectPayment',
      // Two possible labels — the step view switches between them locally as
      // the user picks a payment channel (selectedChannel is per-step UI
      // state, not content); it doesn't need a fresh descriptor to do that.
      label: strings.checkout?.actionLabel ?? common.checkout.selectPaymentCta,
      enabled: false,
    },
    data: {
      item,
      accountName: resolveAccountName(ctx),
      summaryLabel: item.label || [formatNumber(item.amount), item.currencyLabel].filter((v) => v != null && v !== '').join(' '),
      breakdown,
      totalDisplay: breakdown?.total ?? item.currentPrice,
      channels,
      actionLabel: strings.checkout?.actionLabel ?? null,
      selectPaymentCta: common.checkout.selectPaymentCta,
      accountLabel: common.checkout.accountLabel,
      itemPriceLabel: common.checkout.itemPrice,
      taxLabel: common.checkout.tax,
      totalLabel: common.checkout.totalPayment,
      selectPaymentHeading: common.checkout.selectPayment,
      // Promo code (OrderSummarySheet only) — the discount itself is local UI
      // state (PaymentStepBody owns it), this is just the row/modal copy.
      promoDiscountLabel: common.checkout.promoDiscountLabel,
      promoDetailsTitle: common.checkout.promoDetailsTitle,
      promoDetailsHeading: common.checkout.promoDetailsHeading,
      promoDetailsBody: common.checkout.promoDetailsBody,
      promoTermsHeading: common.checkout.promoTermsHeading,
      promoTermsBody: common.checkout.promoTermsBody,
      promoClose: common.checkout.promoClose,
      // Static legal bar + footer link that scrolls it into view. termsBody
      // names a specific publisher/EULA, so it comes from the store's own
      // strings (not the shared common dictionary) with a neutral fallback.
      termsHeading: common.checkout.termsHeading,
      termsBody: strings.checkout?.termsBody ?? common.checkout.termsBodyGeneric,
      viewTerms: common.checkout.viewTerms,
      loyalty: config.checkout?.loyalty ?? null,
      loyaltyPoints: item.loyaltyPoints ?? null,
      loyaltyIcon: assets.brand.loyaltyIcon ?? null,
    },
  }
}

// COD:M's (and every other default, non-FCM-Buy-Now store's) payment step —
// a single "SELECT PAYMENT" 2x2 channel grid + always-expanded terms bar,
// mirrors CheckoutSheet.vue's content 1:1. Unlike paymentDescriptor's
// config.checkout.channels-driven grid (per-SKU surcharge math for the FCM
// promo-code view), this grid is a literal 4-entry list — CheckoutSheet.vue
// never made it config-driven, so this preserves that exactly.
function checkoutDescriptor(ctx) {
  const { item, config, strings, assets, common } = ctx
  if (!item) return null

  const channels = [
    { key: 'googleApple', logo: assets.pc.googleApple, label: 'Google Pay / Apple Pay' },
    { key: 'creditCard', logo: assets.pc.creditCard, label: common.checkout.cardPayments },
    { key: 'paypalVenmo', logo: assets.pc.paypalVenmo, label: 'PayPal' },
    { key: 'cashApp', logo: assets.pc.cashApp, label: 'Cash App' },
    { key: 'boleto', logo: assets.pc.boleto, label: 'Boleto' },
  ]

  return {
    stepId: 'checkout',
    view: 'CheckoutStepView',
    title: common.checkout.orderSummary,
    sizeHint: 'tall',
    dismissable: true,
    primaryAction: {
      kind: 'checkout',
      // Scoped to this checkout step only — not strings.checkout.actionLabel,
      // which also drives the Info step's own CTA (InfoStepFooter) and the
      // FCM payment step's (PaymentStepFooter); those keep "Buy Now".
      label: 'Checkout',
      enabled: true,
    },
    data: {
      item,
      accountName: resolveAccountName(ctx),
      bonusLabelFallback: strings.sku.bonusLabel,
      itemInfoLabel: common.checkout.itemInfo,
      selectPaymentHeading: common.checkout.selectPayment,
      channels,
      subtotalLabel: common.checkout.subtotal,
      poweredByLabel: common.checkout.poweredBy,
      showPoweredByCoda: !!config.checkout.showPoweredByCoda,
      showRating: !!config.checkout.showRating,
      codaLogo: assets.brand.coda,
      ratingImage: assets.brand.rating,
      // Static legal bar + footer link that scrolls it into view. termsBody
      // names a specific publisher/EULA, so it comes from the store's own
      // strings (not the shared common dictionary) with a neutral fallback.
      termsHeading: common.checkout.termsHeading,
      termsBody: strings.checkout?.termsBody ?? common.checkout.termsBodyGeneric,
      viewTerms: common.checkout.viewTerms,
      loyalty: config.checkout?.loyalty ?? null,
      loyaltyPoints: item.loyaltyPoints ?? null,
      loyaltyIcon: assets.brand.loyaltyIcon ?? null,
    },
  }
}

// Proportional surcharge — scales with whatever SKU is selected, unlike a
// flat literal. Mirrors OrderSummarySheet's channelPrice() 1:1.
function channelPrice(c, baseRaw, parsedBase) {
  if (c.price) return c.price
  if (!c.feePercent || !baseRaw) return baseRaw
  if (!parsedBase) return baseRaw
  return `${parsedBase.prefix}${(parsedBase.amount * (1 + c.feePercent / 100)).toFixed(2)}`
}
