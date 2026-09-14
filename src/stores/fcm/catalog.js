/**
 * FCM SKU catalogue tree + featured items
 *
 * Whitelabel data layer for the 'filter' page model (config.catalog.mode ===
 * 'filter'). Exports the built category tree and the featured/best-seller
 * items consumed via useStoreCatalog / useFeaturedItems.
 *
 * Lives inside the FCM store folder (not src/composables/) so the eager
 * import.meta.glob calls below are only reachable through the FCM store
 * module — a build without FCM never bundles these images.
 *
 * Structure:
 *   [ { id, label, subcategories: [ { id, label, cardType, items[] } ] } ]
 *
 * cardType 'bundle' → items shaped for BundleSkuCard
 * cardType 'sku'    → items are stubs (image + title); SkuCard rendering deferred
 *
 * Images are resolved at build time via import.meta.glob — no 37 manual imports.
 * Prices/loyalty are placeholders; swap for real data by replacing the helpers
 * below without touching any component.
 */

import mpColourIcon from './img/brand/MP Colour.svg'

// ── Image registry (resolved at build time) ──────────────────────────────────
// Keys: './img/content/SKU/<Category>/<Subcategory>/<Name>.webp'
// Values: bundled asset URL strings
const FCM_IMAGES = import.meta.glob(
  './img/content/SKU/**/*.webp',
  { eager: true, import: 'default' },
)

// Shared SKU banner backgrounds — one per campaign; keyed by campaign subcategory id.
const FCM_BANNERS = import.meta.glob(
  './img/content/SKU Banners/*.webp',
  { eager: true, import: 'default' },
)
const FCM_CAMPAIGN_BANNER =
  FCM_BANNERS['./img/content/SKU Banners/TWG BG.webp'] ?? null
const FCM_S9_BANNER =
  FCM_BANNERS['./img/content/SKU Banners/FCM S9 BG.webp'] ?? null
const FCM_S9_BG_LONG =
  FCM_BANNERS['./img/content/SKU Banners/S9 BG Long.webp'] ?? null
const FCM_TWG_BG_LONG =
  FCM_BANNERS['./img/content/SKU Banners/TWG BG Long.webp'] ?? null

// Standalone asset images used in bundle item breakdowns (player items, currencies, etc.)
const FCM_ASSETS = import.meta.glob(
  './img/content/Assets/**/*.webp',
  { eager: true, import: 'default' },
)
const FCM_TWG_PLAYER_ITEM =
  FCM_ASSETS['./img/content/Assets/Player Items/TWG Player Item.webp'] ?? null
const FCM_DRAFT_VOUCHER =
  FCM_ASSETS['./img/content/Assets/Currency/Draft Voucher.webp'] ?? null

// Pack Ultra SKU art — used as the hero image in the TWG campaign-packs promo banner.
const FCM_TWG_ULTRA_SKU =
  FCM_IMAGES['./img/content/SKU/Limited Offers/Campaign Packs/TWG26 Pack Ultra.webp'] ?? null

// Gift SKU images — flat folder (no subcategory level), referenced directly.
const FCM_GIFT_DAILY       = FCM_IMAGES['./img/content/SKU/Gifts/Daily Gift.webp'] ?? null
const FCM_GIFT_FIRST_LOGIN = FCM_IMAGES['./img/content/SKU/Gifts/First Login Reward.webp'] ?? null

// Gift bundle item (children) images.
const FCM_GIFT_FL_RANK_UP  = FCM_IMAGES['./img/content/SKU/Gifts/First Login Reward Children/Rank Up Currency.webp'] ?? null
const FCM_GIFT_FL_GEM      = FCM_IMAGES['./img/content/SKU/Gifts/First Login Reward Children/Gem.webp'] ?? null
const FCM_GIFT_DG_PLAYER   = FCM_IMAGES['./img/content/SKU/Gifts/Daily Gift Children/Player Item.webp'] ?? null
const FCM_GIFT_DG_GEM      = FCM_IMAGES['./img/content/SKU/Gifts/Daily Gift Children/Gem.webp'] ?? null
const FCM_GIFT_DG_COIN     = FCM_IMAGES['./img/content/SKU/Gifts/Daily Gift Children/Coin.webp'] ?? null

// Category-level banner icons (subcategory hero art, not SKU product images).
const FCM_CAT_BANNERS = import.meta.glob(
  './img/content/Category Banner/*.webp',
  { eager: true, import: 'default' },
)
const FCM_DAILY_BOOSTER_BANNER =
  FCM_CAT_BANNERS['./img/content/Category Banner/Daily Booster.webp'] ?? null
const FCM_DAILY_FP_DEALS_BANNER =
  FCM_CAT_BANNERS['./img/content/Category Banner/Daily FP Deals.webp'] ?? null

// TWG in-game event ends July 30, 2026 23:59:59 UTC.
const TWG_ENDS_AT = 1_785_455_999_000

/**
 * Promo banner config keyed by subcategory id.
 * When present, CategoryCatalog renders a CategoryBanner instead of the plain heading.
 * Shape mirrors CategoryBanner props (title, description, backgroundImage, icon, endsAt).
 */
const SUBCATEGORY_PROMOS = {
  'daily-boosters': {
    title:           'Daily Booster',
    description:     'You may purchase only one Daily Booster per day across all available options.',
    backgroundImage: FCM_S9_BANNER,
    icon:            FCM_DAILY_BOOSTER_BANNER,
  },
  'daily-fp-deals': {
    title:           'Daily FP Deals',
    description:     'Purchase is limited to 1 of each offer per EA Account per day or per week.<br><br>Includes bonus FC Points as compared to the standard FC Points offer on the webstore for the same base amount of FC Points.',
    backgroundImage: FCM_S9_BANNER,
    icon:            FCM_DAILY_FP_DEALS_BANNER,
  },
  'campaign-packs': {
    title:           "The World's Game",
    description:     "Rep your nation — unlock exclusive international Player Items before the final whistle.",
    backgroundImage: FCM_CAMPAIGN_BANNER,
    icon:            FCM_TWG_ULTRA_SKU,
    endsAt:          TWG_ENDS_AT,
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Consistent slug — mirrors the nav id convention used elsewhere */
function slug(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/** Display title from a filename stem */
function titleFromStem(stem) {
  return stem
}

/**
 * Numeric sort key from a filename stem.
 * '1650 FC Bundle' → 1650 ; 'Daily Booster A Promo' → Infinity (non-numeric, sorts last)
 */
function sortKey(stem) {
  const m = stem.match(/^(\d+)/)
  return m ? parseInt(m[1], 10) : Infinity
}

/**
 * Bundle tier sort order so Pack < Pack Plus < Pack Ultra regardless of
 * how the files happen to be returned by the glob.
 */
const BUNDLE_TIER = { '': 0, Plus: 1, Ultra: 2 }
function bundleTier(title) {
  const m = title.match(/\b(Plus|Ultra)\b/)
  return BUNDLE_TIER[m ? m[1] : ''] ?? 99
}

/** Price for a bundle tier. */
function bundlePlaceholderPrice(title) {
  if (/Ultra/i.test(title)) return '$19.99'
  if (/Plus/i.test(title))  return '$9.99'
  return '$0.99'
}

/**
 * Breakdown items for each TWG pack tier, shaped for BundleItem.
 * Pack: 1 TWG Player Item + 1 Draft Voucher
 * Pack Plus: 1 TWG Player Item + 11 Draft Vouchers
 * Pack Ultra: 1 TWG Player Item + 23 Draft Vouchers
 * Always appends an MP Milestone tile showing the earnable loyalty points.
 */
function bundleItems(title, loyaltyPts) {
  const isUltra = /Ultra/i.test(title)
  const isPlus  = /Plus/i.test(title)
  const draftQty        = isUltra ? 23 : isPlus ? 11 : 1
  const playerItemLabel = isUltra ? '115-117 (U)' : isPlus ? '114-117 (U)' : '112-117 (U)'
  return [
    { image: FCM_TWG_PLAYER_ITEM, quantity: 1, tag: { label: playerItemLabel } },
    { image: FCM_DRAFT_VOUCHER,   quantity: draftQty },
    { image: mpColourIcon, quantity: loyaltyPts, tag: { label: 'Milestone' } },
  ]
}

/**
 * Accordion rows for the SKU info sheet (ItemSummarySheet, config.itemSummary),
 * shaped for ItemSummaryAccordion — { image, name, quantity, description }.
 * Mirrors the player-item + draft-voucher pair from bundleItems() above but
 * with a display name instead of a BundleItem tag, and omits the MP milestone
 * tile (the info sheet lists what's received, not the loyalty reward — that's
 * covered by the sheet's own footer).
 *
 * `description` is set to the row's own name for now — a placeholder so each
 * row is expandable (ItemSummaryAccordion only renders a chevron when
 * `media || description` is truthy) and shows *something* on expand, until
 * real per-SKU copy is written.
 */
function bundleInfoItems(title) {
  const isUltra = /Ultra/i.test(title)
  const isPlus  = /Plus/i.test(title)
  const draftQty        = isUltra ? 23 : isPlus ? 11 : 1
  const playerItemLabel = isUltra ? '115-117 (U)' : isPlus ? '114-117 (U)' : '112-117 (U)'
  const playerItemName  = `${playerItemLabel} Player (Untradeable)`
  const draftVoucherName = 'Draft Voucher'
  return [
    { image: FCM_TWG_PLAYER_ITEM, name: playerItemName, quantity: 1, description: playerItemName },
    { image: FCM_DRAFT_VOUCHER,   name: draftVoucherName, quantity: draftQty, description: draftVoucherName },
  ]
}

/**
 * Single-row accordion fallback for SKUs with no pack breakdown (Daily
 * Boosters, Daily FP Deals, Star Pass, Special Offers) — one row built from
 * the SKU's own art + display name, so every eligible SKU still opens a
 * consistent info sheet.
 */
function singleInfoItem(image, name, description) {
  return [{ image, name, description: description ?? null, quantity: null }]
}

/**
 * Image-led SKU card layout per Top Ups subcategory (see SkuImageCard `variant`).
 *  'background' — oversized bottom-anchored SKU art behind the text.
 *  'panel'      — SKU art in a 1:1 square frame at the top of the card.
 * Subcategories absent here keep their "Coming soon" stub.
 */
const SKU_CARD_VARIANTS = {
  '2x-fc-points':   'panel',
  'fc-points':      'panel',
  'silver':         'panel',
  'daily-fp-deals': 'panel',
  'daily-boosters': 'panel',
  'star-pass':      'panel',
  'special-offers': 'panel',
  'gifts':          'panel',
}

/**
 * Per-subcategory background image for panel-variant SKU cards.
 * Keyed by subcategory slug. Falls back to FCM_S9_BG_LONG when absent.
 */
const SUBCATEGORY_SKU_CARD_BG = {
  'star-pass': FCM_TWG_BG_LONG,
}

/**
 * Per-item display title overrides — keyed by filename stem.
 * Replaces the stem-derived currencyLabel shown on SkuImageCard.
 */
const ITEM_TITLE_OVERRIDES = {
  'Star Pass': 'TWG26 Starpass Ticket',
}

/**
 * Info-sheet accordion row name override — keyed by filename stem. The six
 * Daily FP Deals stems are named "<amount> FC Bundle" (the deal's own product
 * name — kept as-is on the card face / sheet header via currencyLabel), but
 * what the "you will receive" row should say is the underlying currency:
 * "<amount> FC Points". Scoped to the info-sheet row only; does not touch
 * currencyLabel or the sheet's own title.
 */
const INFO_ITEM_CURRENCY_OVERRIDES = {
  '165 FC Bundle':   'FC Points',
  '825 FC Bundle':   'FC Points',
  '1650 FC Bundle':  'FC Points',
  '3300 FC Bundle':  'FC Points',
  '8250 FC Bundle':  'FC Points',
  '16500 FC Bundle': 'FC Points',
}

const ITEM_SORT_OVERRIDES = {
  'Daily Booster D Promo': 0,
  'Daily Booster C Promo': 1,
  'Daily Booster A Promo': 2,
  'Daily Booster B Promo': 3,
}

const ITEM_SUBTITLES = {
  'TWG26 Pack':            'TWG26 Player (U) + 1 Draft Voucher',
  'TWG26 Pack Plus':       'TWG26 Player (U) + 11 Draft Voucher',
  'TWG26 Pack Ultra':      'TWG26 Player (U) + 23 Draft Voucher',
  'Daily Booster D Promo': '18% more FC Points than in-game*',
  'Daily Booster C Promo': '20% more FC Points than in-game*',
  'Daily Booster B Promo': '25% more FC Points than in-game*',
  'Star Pass':             'If owned, purchase converts to 449 Silver',
  'Web One-Time Offer':    '1000 FC Points',
}

// Default subtitle for every item in a subcategory, when no per-stem override exists.
const SUBCATEGORY_DEFAULT_SUBTITLES = {
  'daily-fp-deals': '10% more FC Points than in-game*',
}

// Returns the subtitle for a SKU item, falling back from stem → subcategory → computed.
function subtitleFor(stem, subId, amount) {
  if (ITEM_SUBTITLES[stem] !== undefined) return ITEM_SUBTITLES[stem]
  if (subId === '2x-fc-points' && amount !== null) {
    const half = amount / 2
    return `${half} FC Points + ${half} Bonus`
  }
  return SUBCATEGORY_DEFAULT_SUBTITLES[subId] ?? null
}

/** Leading numeric amount from a filename stem, e.g. '80 FC Points' → 80. Returns null for non-numeric names. */
function skuAmount(stem) {
  const m = stem.match(/^(\d+)/)
  return m ? parseInt(m[1], 10) : null
}

/**
 * Placeholder price for a top-up SKU, derived deterministically from its amount.
 * Will be replaced once real pricing data is available (mirrors bundlePlaceholderPrice).
 */
function skuPlaceholderPrice(amount) {
  const usd = Math.max(0.99, Math.round(amount / 100) - 0.01)
  return '$' + usd.toFixed(2)
}

/**
 * Per-item price overrides — keyed by filename stem.
 * Takes precedence over skuPlaceholderPrice when present.
 */
const ITEM_PRICES = {
  // Daily Boosters
  'Daily Booster D Promo': '$4.99',
  'Daily Booster C Promo': '$3.99',
  'Daily Booster B Promo': '$1.49',
  'Daily Booster A Promo': '$0.99',
  // Limited Offers
  'Star Pass':             '$4.49',
  'Web One-Time Offer':    '$1.99',
  // 2X FC Points
  '80 FC Points':          '$0.39',
  '200 FC Points':         '$0.99',
  '1000 FC Points':        '$4.99',
  '2000 FC Points':        '$9.99',
  '4000 FC Points':        '$19.99',
  '10000 FC Points':       '$49.99',
  '20000 FC Points':       '$99.99',
  // FC Points
  '40 FC Points':          '$0.39',
  '100 FC Points':         '$0.99',
  '520 FC Points':         '$4.99',
  '1070 FC Points':        '$9.99',
  '2200 FC Points':        '$19.99',
  '5750 FC Points':        '$49.99',
  '12000 FC Points':       '$99.99',
  '24500 FC Points':       '$199.99',
  '62000 FC Points':       '$499.99',
  // Daily FP Deals
  '165 FC Bundle':         '$0.99',
  '825 FC Bundle':         '$4.99',
  '1650 FC Bundle':        '$9.99',
  '3300 FC Bundle':        '$19.99',
  '8250 FC Bundle':        '$49.99',
  '16500 FC Bundle':       '$99.99',
  // Silver
  '39 Silver':             '$0.39',
  '99 Silver':             '$0.99',
  '499 Silver':            '$4.99',
  '999 Silver':            '$9.99',
  '1999 Silver':           '$19.99',
  '4999 Silver':           '$49.99',
  '9999 Silver':           '$99.99',
}

/**
 * Strikethrough (original) price per stem — shown when an item is on sale.
 * The discount % is computed automatically from the two prices.
 */
const ITEM_ORIGINAL_PRICES = {
  'Star Pass': '$4.99',
}

/**
 * Loyalty (MP) points earned from a purchase, computed as price × 100.
 * e.g. '$4.99' → 499. Returns null when the price string cannot be parsed.
 */
function loyaltyFromPrice(priceStr) {
  const m = String(priceStr).match(/[\d.]+/)
  return m ? Math.round(parseFloat(m[0]) * 100) : null
}

/**
 * Discount percentage label derived from current vs original price.
 * e.g. ('$4.49', '$4.99') → '-10%'. Returns null when not applicable.
 */
function discountPct(currentStr, originalStr) {
  if (!currentStr || !originalStr) return null
  const curr = parseFloat(String(currentStr).replace(/[^0-9.]/g, ''))
  const orig = parseFloat(String(originalStr).replace(/[^0-9.]/g, ''))
  if (!curr || !orig || orig <= curr) return null
  return `-${Math.round((1 - curr / orig) * 100)}%`
}

// ── Catalogue builder ─────────────────────────────────────────────────────────

/**
 * Canonical category / subcategory order for FCM.
 * Drives the sort of Map entries so display order is deterministic and
 * independent of filesystem traversal order.
 */
const CAT_ORDER = ['daily-supplies', 'limited-offers', 'top-ups', 'gifts']
const SUB_ORDER = {
  'daily-supplies': ['daily-boosters', 'daily-fp-deals'],
  'limited-offers': ['campaign-packs', 'special-offers', 'star-pass'],
  'top-ups':        ['2x-fc-points', 'fc-points', 'silver'],
  'gifts':          ['gifts'],
}

/**
 * Human-readable label overrides for subcategories whose display name differs
 * from the folder name on disk. Keyed by subcategory slug.
 * Add a new entry here when a campaign launches under a new folder name.
 */
const SUB_LABEL_OVERRIDES = {
  'campaign-packs': "The World's Game Packs",
}

/**
 * Short labels for the top subcategory nav tabs, where the full display heading
 * (SUB_LABEL_OVERRIDES / folder name) is too long for a compact tab. Keyed by
 * subcategory slug; falls back to the display label when no entry exists.
 */
const SUB_NAV_LABEL_OVERRIDES = {
  'campaign-packs': 'TWG',
}

/**
 * Shared banner image for each bundle subcategory (shown behind the SKU image).
 * The SKU product art composites on top via skuOnBanner: true.
 * Keyed by subcategory slug — add entries as new campaigns ship.
 */
const BUNDLE_BANNERS = {
  'campaign-packs': FCM_CAMPAIGN_BANNER,
}

// Info sheet (config.itemSummary) eligibility — excludes the whole Top Ups
// category (FC Points, 2x FC Points, Silver): plain currency top-ups have
// nothing to "receive" beyond the currency itself, so they skip the (i) icon
// and go straight to Buy Now. Every other category/subcategory gets one.
const INFO_SUMMARY_EXCLUDED_CATS = new Set(['top-ups'])

function buildFcmCatalog() {
  const PREFIX = './img/content/SKU/'
  const catMap  = new Map()

  for (const [key, url] of Object.entries(FCM_IMAGES)) {
    if (!key.endsWith('.webp')) continue
    const rel   = key.slice(PREFIX.length)   // 'Category/Subcategory/Name.webp'
    const parts = rel.split('/')
    if (parts.length !== 3) continue

    const [catLabel, subLabel, filename] = parts
    const stem      = filename.replace(/\.webp$/, '')
    const catId     = slug(catLabel)
    const subId     = slug(subLabel)
    const isBundle  = subId === 'campaign-packs'

    // Lazily create category entry
    if (!catMap.has(catId)) {
      catMap.set(catId, { id: catId, label: catLabel, subs: new Map() })
    }
    const cat = catMap.get(catId)

    // Lazily create subcategory entry
    if (!cat.subs.has(subId)) {
      cat.subs.set(subId, {
        id:       subId,
        label:    SUB_LABEL_OVERRIDES[subId] ?? subLabel,
        navLabel: SUB_NAV_LABEL_OVERRIDES[subId] ?? SUB_LABEL_OVERRIDES[subId] ?? subLabel,
        cardType:    isBundle ? 'bundle' : 'sku',
        promo:       SUBCATEGORY_PROMOS[subId] ?? null,
        cardVariant: SKU_CARD_VARIANTS[subId] ?? null,
        skuCardBg:   SUBCATEGORY_SKU_CARD_BG[subId] ?? FCM_S9_BG_LONG,
        items:       [],
      })
    }
    const sub = cat.subs.get(subId)

    const title = titleFromStem(stem)
    const infoEligible = !INFO_SUMMARY_EXCLUDED_CATS.has(catId)

    if (isBundle) {
      // Shape for BundleSkuCard — bannerImage is the shared campaign background
      // (TWG BG); skuImage is the pack-specific product art composited on top via
      // skuOnBanner. items[] is empty (Campaign Packs are self-contained).
      const banner = BUNDLE_BANNERS[subId] ?? url
      const bundlePrice = bundlePlaceholderPrice(title)
      sub.items.push({
        bannerImage:   banner,
        skuImage:      url,
        skuOnBanner:   true,
        title:         title.toUpperCase(),
        subtitle:      subtitleFor(stem, subId, null),
        currentPrice:  bundlePrice,
        loyaltyPoints: loyaltyFromPrice(bundlePrice),
        items:         bundleItems(title, loyaltyFromPrice(bundlePrice)),
        infoItems:     infoEligible ? bundleInfoItems(title) : null,
      })
    } else {
      // SKU top-up. Carries card-ready fields (amount + placeholder price + art)
      // for subcategories with a card variant; the stub branch in CategoryCatalog
      // still reads _title for subcategories without one ("Coming soon").
      const amount         = skuAmount(stem)
      const currentPrice   = ITEM_PRICES[stem] ?? skuPlaceholderPrice(amount)
      const originalPrice  = ITEM_ORIGINAL_PRICES[stem] ?? null
      const currencyLabel  = ITEM_TITLE_OVERRIDES[stem] ?? stem.replace(/^\d+\s*/, '')
      const subtitle       = subtitleFor(stem, subId, amount)
      // Single-SKU info row name — combine amount + label when both are
      // present (e.g. "165 FC Points"), else the label alone (e.g. "Star Pass").
      const infoCurrencyLabel = INFO_ITEM_CURRENCY_OVERRIDES[stem] ?? currencyLabel
      const infoName = amount !== null ? `${amount} ${infoCurrencyLabel}` : infoCurrencyLabel
      sub.items.push({
        amount,
        currencyLabel,
        subtitle,
        currentPrice,
        originalPrice,
        discountPercent: discountPct(currentPrice, originalPrice),
        loyaltyPoints:   loyaltyFromPrice(currentPrice),
        skuImage:        url,
        infoItems:       infoEligible ? singleInfoItem(url, infoName, subtitle) : null,
        _title:          title,
        _sortKey:        ITEM_SORT_OVERRIDES[stem] ?? sortKey(stem),
      })
    }
  }

  // Gifts — flat folder (no 3-level path), injected manually.
  // currentPrice 'Claim' renders in place of a price on each card.
  catMap.set('gifts', {
    id: 'gifts',
    label: 'Gifts',
    subs: new Map([
      ['gifts', {
        id:       'gifts',
        label:    'Gifts',
        navLabel: 'Gifts',
        cardType: 'bundle',
        promo:    null,
        items: [
          {
            bannerImage:   FCM_S9_BANNER,
            skuImage:      FCM_GIFT_FIRST_LOGIN,
            skuOnBanner:   true,
            title:         'FIRST LOGIN REWARD',
            subtitle:      'One-time reward for new players',
            currentPrice:  'Claim',
            loyaltyPoints: null,
            items: [
              { image: FCM_GIFT_FL_RANK_UP, quantity: 100 },
              { image: FCM_GIFT_FL_GEM,     quantity: 3000 },
            ],
          },
          {
            bannerImage:   FCM_S9_BANNER,
            skuImage:      FCM_GIFT_DAILY,
            skuOnBanner:   true,
            title:         'DAILY GIFT',
            subtitle:      'Available to claim once per day',
            currentPrice:  'Claim',
            loyaltyPoints: null,
            items: [
              { image: FCM_GIFT_DG_PLAYER, quantity: 1,        tag: { label: '75-84' } },
              { image: FCM_GIFT_DG_GEM,    quantity: '100+',     tag: { label: '30%+' } },
              { image: FCM_GIFT_DG_COIN,   quantity: '10M',    tag: { label: '1%' } },
              { image: FCM_GIFT_DG_COIN,   quantity: '50K',    tag: { label: '100%' } },
            ],
          },
        ],
      }],
    ]),
  })

  // Sort and flatten into the canonical array shape
  return CAT_ORDER
    .filter(catId => catMap.has(catId))
    .map(catId => {
      const cat      = catMap.get(catId)
      const subOrder = SUB_ORDER[catId] ?? []

      const subcategories = [...cat.subs.values()]
        .sort((a, b) => subOrder.indexOf(a.id) - subOrder.indexOf(b.id))
        .map(sub => {
          const sorted = sub.cardType === 'bundle'
            ? [...sub.items].sort((a, b) => bundleTier(a.title) - bundleTier(b.title))
            : [...sub.items].sort((a, b) => a._sortKey - b._sortKey)
          return { ...sub, items: sorted }
        })

      return { id: catId, label: cat.label, subcategories }
    })
}

// Built once at module initialisation — the glob is static (build-time resolved)
// so there is no reactive dependency; the theme gate lives in useStoreCatalog.
export const catalog = buildFcmCatalog()

// ── Featured / Best Sellers items (shown above ALL categories, not a nav tab) ──
// Shaped for FeaturedCarousel (BundleSkuCard props).
export const featured = [
  {
    bannerImage:  FCM_S9_BANNER,
    skuImage:     FCM_IMAGES['./img/content/SKU/Daily Supplies/Daily Boosters/Daily Booster D Promo.webp'] ?? null,
    skuOnBanner:  true,
    title:        'DAILY BOOSTER D',
    subtitle:     subtitleFor('Daily Booster D Promo', 'daily-boosters', null),
    currentPrice: ITEM_PRICES['Daily Booster D Promo'],
    loyaltyPoints: loyaltyFromPrice(ITEM_PRICES['Daily Booster D Promo']),
    items:        [],
    infoItems:    singleInfoItem(
      FCM_IMAGES['./img/content/SKU/Daily Supplies/Daily Boosters/Daily Booster D Promo.webp'] ?? null,
      'DAILY BOOSTER D',
      subtitleFor('Daily Booster D Promo', 'daily-boosters', null),
    ),
  },
  {
    bannerImage:  FCM_CAMPAIGN_BANNER,
    skuImage:     FCM_IMAGES['./img/content/SKU/Limited Offers/Campaign Packs/TWG26 Pack.webp'] ?? null,
    skuOnBanner:  true,
    title:        'TWG PACK',
    subtitle:     subtitleFor('TWG26 Pack', 'campaign-packs', null),
    currentPrice: '$0.99',
    loyaltyPoints: loyaltyFromPrice('$0.99'),
    items:        [],
    infoItems:    bundleInfoItems('TWG26 Pack'),
  },
  {
    bannerImage:  FCM_CAMPAIGN_BANNER,
    skuImage:     FCM_IMAGES['./img/content/SKU/Limited Offers/Star Pass/Star Pass.webp'] ?? null,
    skuOnBanner:  true,
    title:        'TWG26 STARPASS TICKET',
    subtitle:     subtitleFor('Star Pass', 'star-pass', null),
    currentPrice: ITEM_PRICES['Star Pass'],
    originalPrice: ITEM_ORIGINAL_PRICES['Star Pass'],
    discountPercent: discountPct(ITEM_PRICES['Star Pass'], ITEM_ORIGINAL_PRICES['Star Pass']),
    loyaltyPoints: loyaltyFromPrice(ITEM_PRICES['Star Pass']),
    items:        [],
    infoItems:    singleInfoItem(
      FCM_IMAGES['./img/content/SKU/Limited Offers/Star Pass/Star Pass.webp'] ?? null,
      'TWG26 STARPASS TICKET',
      subtitleFor('Star Pass', 'star-pass', null),
    ),
  },
]
