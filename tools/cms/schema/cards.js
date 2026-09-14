/**
 * SKU card field schemas — mirrors each card component's `defineProps` exactly.
 * This is what the CMS's Catalog editor validates a SKU/bundle/gift entry
 * against before it's written into a store's `skus` override or `catalog.js`
 * tree. Source of truth is always the component; re-sync this file if a
 * component's props change.
 *
 * Golden rule embedded in the data itself: UI chrome (bonusLabel, tag text)
 * is never baked into card data — those come from `strings.sku.*` at render
 * time. A SKU only carries a `tagKey` when it needs an indirection (see
 * ygodl/ygomd's exclusiveTag/limitedTimeTag/webExclusiveTag pattern).
 */

export const SKU_CARD = {
  component: 'src/components/SkuCard.vue',
  fields: {
    amount:          { type: 'number', required: true, help: 'Headline currency amount, e.g. 460.' },
    baseAmount:      { type: 'number', help: 'Pre-bonus amount, e.g. 400.' },
    bonusAmount:     { type: 'number', help: 'Bonus amount, e.g. 60.' },
    bonusType:       { type: 'enum', options: ['codashop', 'cp'], default: 'codashop', help: 'Bonus-text colour only — not a copy source.' },
    originalPrice:   { type: 'string', help: 'Struck-through price, e.g. "$4.99".' },
    discountPercent: { type: 'string', help: 'e.g. "-49%".' },
    currentPrice:    { type: 'string', required: true, help: 'Pre-formatted display price, e.g. "$2.50" — NOT a number.' },
    isBestValue:     { type: 'boolean', default: false },
    tagLabel:        { type: 'string', help: 'Custom badge text; overrides isBestValue when set.' },
    tagKey:          { type: 'string', help: 'Indirection into strings.sku[tagKey] for a localised tag — preferred over a hardcoded tagLabel.' },
    skuImage:        { type: 'asset:square-1x1' },
    loyaltyPoints:   { type: 'number', help: 'null unless config.checkout.loyalty !== null.' },
    subtitle:        { type: 'string' },
    layout:          { type: 'enum', options: ['default', 'row'], default: 'default' },
  },
}

export const BUNDLE_SKU_CARD = {
  component: 'src/components/BundleSkuCard.vue',
  extends: SKU_CARD,
  fields: {
    bannerImage:  { type: 'asset:wide-banner', required: true, aspectRatio: '2.6 / 1' },
    skuOnBanner:  { type: 'boolean', default: false, help: 'Composite the 1:1 SKU art over the banner.' },
    title:        { type: 'string', required: true },
    items:        { type: 'array', of: 'BUNDLE_ITEM', help: 'Child breakdown tiles.' },
    limitLabel:   { type: 'string' },
    endsAt:       { type: 'number', help: 'Epoch-ms countdown target.' },
    claimed:      { type: 'boolean', default: false },
    refreshesOnClaim: { type: 'boolean', default: false },
    breakdownScrollable: { type: 'boolean', default: false },
  },
}

export const BUNDLE_ITEM = {
  component: 'src/components/BundleItem.vue',
  fields: {
    image:    { type: 'asset:square-1x1' },
    tileBg:   { type: 'string', help: 'A CSS gradient token (var(--rarity-gradient-common)) or an image URL.' },
    tag:      { type: 'object', shape: '{ label, variant }' },
    quantity: { type: 'string|number', help: 'Accepts a raw number or a formatted string like "10M" / "100+".' },
    // Item-Summary extension fields (config.bundle.itemSummary === true):
    name:        { type: 'string', optional: true },
    media:       { type: 'asset:video', optional: true },
    description: { type: 'string', optional: true },
  },
}

export const SKU_IMAGE_CARD = {
  component: 'src/components/SkuImageCard.vue',
  extends: SKU_CARD,
  fields: {
    currencyLabel:   { type: 'string' },
    backgroundImage: { type: 'asset:square-1x1' },
    loyaltyIcon:     { type: 'asset:icon' },
    variant:         { type: 'enum', options: ['panel', 'background'], default: 'panel' },
    items:           { type: 'array', of: 'BUNDLE_ITEM', optional: true },
  },
}

export const GIFT_SKU_CARD = {
  component: 'src/components/GiftSkuCard.vue',
  fields: {
    id:               { type: 'string', required: true, help: 'Keys claim state — must be stable and unique.' },
    image:            { type: 'asset:square-1x1', required: true },
    tagLabel:         { type: 'string', default: 'FREE GIFT' },
    title:            { type: 'string', required: true },
    subtitle:         { type: 'string' },
    limitLabel:       { type: 'string' },
    ctaLabel:         { type: 'string' },
    claimedLabel:     { type: 'string' },
    endsAt:           { type: 'number' },
    refreshesOnClaim: { type: 'boolean', default: false },
    endsLabel:        { type: 'string' },
    refreshesLabel:   { type: 'string' },
  },
}

export const HERO_SKU_CARD = {
  component: 'src/components/HeroSkuCard.vue',
  fields: {
    eyebrow:         { type: 'string' },
    title:           { type: 'string', required: true },
    description:     { type: 'string' },
    includes:        { type: 'array', of: 'string' },
    image:           { type: 'asset:wide-hero' },
    skuImage:        { type: 'asset:square-1x1' },
    currentPrice:    { type: 'string', required: true },
    originalPrice:   { type: 'string' },
    discountPercent: { type: 'string' },
    loyaltyPoints:   { type: 'number' },
  },
}

export const CARD_TYPES = {
  bundle: BUNDLE_SKU_CARD,
  sku: SKU_IMAGE_CARD,
  hero: HERO_SKU_CARD,
}

// Filter-model catalogue tree shape (config.catalog.mode === 'filter'):
//   [{ id, label, subcategories: [{ id, label, navLabel, cardType, promo, cardVariant, skuCardBg, items[] }] }]
// cardType selects which card schema above applies to `items`.
export const CATALOG_TREE_SHAPE = {
  category: { fields: { id: { required: true }, label: { required: true }, subcategories: { type: 'array', of: 'SUBCATEGORY' } } },
  subcategory: {
    fields: {
      id: { required: true }, label: { required: true }, navLabel: { optional: true, help: 'Compact label for the filter-nav tab, if different from label.' },
      cardType: { type: 'enum', options: ['bundle', 'sku', 'hero'], required: true },
      promo: { type: 'boolean', default: false, help: 'Renders a CategoryBanner instead of a plain heading.' },
      items: { type: 'array', of: 'CARD_TYPES[cardType]' },
    },
  },
}

// Prices are always pre-formatted USD display strings ('$0.99') — no numeric
// price, no currency code, no Intl.NumberFormat anywhere in this codebase.
// Countdowns are absolute epoch-ms (endsAt), resolved once at boot.
export const PRICING_NOTE =
  'Every currentPrice/originalPrice field is a pre-formatted string, always USD. There is no numeric-price or multi-currency support to onboard into.'
