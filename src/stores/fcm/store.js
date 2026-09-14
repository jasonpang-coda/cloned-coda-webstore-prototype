/**
 * FC Mobile store module — everything that defines the EA SPORTS FC™ Mobile
 * store: theme CSS (side-effect import), capability config, user-visible copy,
 * the imagery registry, and the SKU catalogue (catalog.js). Imported only via
 * an active-stores manifest (the @active-stores virtual module, see vite.config.js), so a build that doesn't
 * include FCM never bundles these assets or theme rules.
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/fcm.css (imported here)
 *   imagery                   → assets
 *   structural capability     → config
 *   user-visible copy         → strings
 *   catalogue tree / featured → ./catalog.js
 */

import '@/tokens/ds/themes/fcm.css'
import { LOCALE_SETS } from '../../locale/sets.js'
import { catalog, featured } from './catalog.js'
import { buildFcmIntents } from './intents.js'
import { milestone } from './milestone.js'

// ── Localised copy (partial overrides of `strings`; en falls through) ──────────
// Phase-1 languages within FCM's locale set: ja, pt, es, ar, zh-Hant, th, id.
import ja     from './strings/ja.js'
import pt     from './strings/pt.js'
import es     from './strings/es.js'
import ar     from './strings/ar.js'
import zhHant from './strings/zh-Hant.js'
import th     from './strings/th.js'
import id     from './strings/id.js'

// ── Brand ─────────────────────────────────────────────────────────────────────
import wordmark     from './img/brand/fcm-wordmark.svg'
import logomark     from './img/brand/ea-logomark.svg'
import fcmLogomark  from './img/brand/FCM Logomark.svg'
import mpSimple from './img/brand/MP Simple.svg'
import mpColour from './img/brand/MP Colour.svg'

// Placeholders copied from COD:M — swap when FCM art arrives.
import qrCode        from './img/brand/qr-code.webp'
import qrPlaceholder from './img/brand/qr-placeholder.svg'
import cpIcon        from './img/brand/cp-icon.svg'
import apIcon        from './img/brand/ap-icon.svg'
import bg            from './img/brand/bg.webp'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda   from '@/shared/brand/coda.svg'
import rating from '@/shared/brand/rating.svg'

// ── Content ───────────────────────────────────────────────────────────────────
import fcmStory1 from './img/content/Stories/Carousel Image 1_ Player Athlete Brand Banner.jpg'
import fcmStory2 from './img/content/Stories/Carousel Image 2_ Daily Free Gift Banner.jpg'
import fcmStory3 from './img/content/Stories/Carousel Image 3_ Daily Booster.jpg'
import fcmStory4 from './img/content/Stories/Carousel Image 4_ Webstore Specials (main campaign SKU) - no player option.jpg'
import bestSellerImage from './img/content/SKU/Best Seller/Best Seller.webp'
import giftDailyImage      from './img/content/SKU/Gifts/Daily Gift.webp'
import giftFirstLoginImage from './img/content/SKU/Gifts/First Login Reward.webp'
// Placeholder copied from COD:M — swap when FCM avatar art arrives.
import avatar from './img/content/Avatar.webp'

export default {
  key:   'fcm',
  label: 'FC Mobile',

  // ── Structural capabilities (was useStoreConfig CONFIG.fcm) ────────────────
  config: {
    // Footer "Need Help?" action (hidden when supportUrl is null) + per-network
    // social profile URLs (icons are shared/market-level — see useStoreAssets;
    // null hides that one icon regardless of asset availability).
    // TODO — supportUrl is a placeholder pending the real support destination.
    footer: {
      supportUrl: '#',
      social: { x: '#', facebook: '#', instagram: '#', youtube: '#', tiktok: '#', discord: '#' },
    },

    // Region/language switcher set — fcm-translate skill (28 languages).
    locale: LOCALE_SETS.fcm,

    skuList: { layout: 'wrap' },   // 2-up grid

    catalog: { mode: 'filter', reseller: true, featuredHero: true },   // category filter nav + standalone best-seller hero

    // Two-column split shell (see App.vue's .storefront / isSplit) — story
    // carousel moves into the sticky left rail, everything else (sign-in +
    // SKU listings) stays in the right column. heroColumn:'lead' tells
    // App.vue to render the carousel there instead of its normal top-of-
    // main-column spot. layoutRequiresProdCards: this pilot is scoped to the
    // current production SKU card designs only — previewing the new
    // (unreleased) designs via the fcmSkuCardModel flag falls back to a
    // single column with no parent container (see isSplit in App.vue).
    page: { layout: 'split', heroColumn: 'lead', layoutRequiresProdCards: true },

    // Multi-level (intent/category/subcategory) navigation pilot — FCM only.
    // Gates whether App reads useStoreIntents() at all and renders
    // CatalogNavStack (hardcoded to its 'flat' presentation — the runtime
    // nav-model flag that used to offer other variants has been retired);
    // every other store omits this key so the legacy nav is unaffected.
    // categoryJump: gates the end-of-category jump-to-category dropdown
    // behind the categoryJumpNav flag — see useFeatureFlags.js.
    nav: { multiLevel: true, categoryJump: true },

    // Production SKU card designs pilot — FCM only. Same two-gate pattern as
    // nav.multiLevel above: gates BOTH the flag's toolbar/console control
    // visibility (FLAG_DEFS['fcmSkuCardModel'].stores) AND whether App reads
    // the flag at all, so every other store's cards stay untouched even if
    // the shared flag value were somehow non-'new'.
    sku: { prodCardDesigns: true },

    checkout: {
      showPoweredByCoda: false,     // FCM checkout drops the Coda branding…
      showRating:        false,     // …and the store rating badge…
      loyalty:           { label: 'You will earn' }, // …and adds a points banner.
      allowGuest:        false,     // no guest flow — must sign in via EA Account
      // Capability gate for the Buy Now pilot — the fcmPaymentSheet flag is a
      // single shared value (not per-store), so THIS is what actually scopes
      // the sticky BuyNowBar/OrderSummarySheet flow to stores that opt in.
      // Every other store omits this key, so switching themes never docks the
      // bar there even while the flag is on. See useCheckout.usesBuyNowBar().
      buyNow:            true,
      // Buy Now pilot (fcmPaymentSheet flag) — the "SELECT PAYMENT METHOD" grid
      // in OrderSummarySheet. logoKey indexes useStoreAssets().pc.*. `price` is
      // a per-channel FLAT override — only for a channel unconditionally locked
      // to one price regardless of SKU (none currently). `feePercent` is a
      // proportional surcharge applied to whatever SKU is selected (mirrors the
      // Figma "Select Payment Method" list's differently-priced e-wallet rows,
      // e.g. ShopeePay/Rabbit LINE Pay at 3376:28488/28489 — but as a % so it
      // scales correctly across every SKU instead of a flat literal that only
      // looked right for one price point). Neither set → falls back to the
      // SKU's own currentPrice. Mock data, prototype-only.
      channels: [
        { logoKey: 'truemoney',     name: 'Truemoney',                        price: null },
        { logoKey: 'promptpay',     name: 'PromptPay',                        price: null },
        { logoKey: 'kplus',         name: 'K PLUS',                           price: null },
        { logoKey: 'dtac',          name: 'DTAC',                             price: null },
        { logoKey: 'bankTransfer',  name: 'Bank Transfer and Cash at Retail', price: null },
        { logoKey: 'ais',           name: 'AIS',                             price: null },
        { logoKey: 'cardPayment',   name: 'Card Payment',                    price: null },
        { logoKey: 'sevenEleven',   name: '7-Eleven Thailand',                price: null },
        { logoKey: 'shopeepay',     name: 'ShopeePay',                       feePercent: 5 },
        { logoKey: 'rabbitLinepay', name: 'Rabbit LINE Pay',                 feePercent: 5 },
        // Extra entries (generic shared PC logos, not from the Figma list) so the
        // grid reliably overflows for testing the accordion's auto-collapse-on-scroll.
        { logoKey: 'googleApple',   name: 'Google Pay / Apple Pay',          price: null },
        { logoKey: 'creditCard',    name: 'Credit Card',                    price: null },
        { logoKey: 'paypalVenmo',   name: 'PayPal',                         price: null },
        { logoKey: 'cashApp',       name: 'Cash App',                       feePercent: 5 },
      ],
    },

    // Redirects to EA Account sign-in page (simulated overlay).
    signIn: { flow: 'ea-redirect' },

    // SKU info bottom sheet (ItemSummarySheet) — FCM variant of COD:M's bundle
    // breakdown sheet. Opened via the (i) icon appended to a SKU card's title
    // (SkuImageCard/BundleSkuCard infoItems prop), not by tapping the card
    // itself. titleFromItem: the header reads the SKU's own title rather than
    // a static "Item Summary" heading; showProduct: false drops COD:M's
    // banner/account-chip block (FCM's Figma has none); footer: 'buyNow'
    // swaps the footer for the same price/CTA/rewards/terms content as
    // BuyNowBar; compactAccordion: rows are label + chevron only, no rarity
    // thumbnail (Figma's accordion has none for FCM).
    itemSummary: { titleFromItem: true, showProduct: false, footer: 'buyNow', compactAccordion: true },

    profile: {
      avatarStyle:     'icon',          // generic Material account_circle icon
      playerCard:      'nickname-only', // EA only surfaces the display name
      showLoyaltyPill: true,            // show MP points pill left of the account icon
    },

    chrome: { iconVariant: 'light' },
  },

  // ── User-visible copy (was useStoreStrings STRINGS.fcm) ────────────────────
  strings: {
    // Site footer (see Footer.vue). disclaimer/legalLinks are per-store —
    // null/empty hides that block.
    footer: {
      supportCta:    'Support Portal',
      cookieLabel:   'Cookie Preference',
      cookieCta:     'Manage Your Cookie Preference',
      socialHeading: 'Stay up to date with us',
      disclaimer:    null,
      legalLinks:    [],
    },
    currency: {
      name: 'FC Points',
      abbr: 'FC',
    },
    checkout: {
      actionLabel: 'Checkout',
      // Payment sheet's legal bar — names the actual publisher, so it lives
      // here (per-store) rather than in the shared common.checkout dictionary.
      // Named legal documents wrapped in .sheet__terms-link-inline (hyperlink
      // token styling) — rendered via v-html, same convention as
      // SignInLoader's openingApp/qrInstruction strings embedding a raw
      // <sup> tag.
      termsBody:
        'By clicking "Checkout", I acknowledge that the purchase of this virtual item will be a license for its use, subject to Electronic Arts\' <span class="sheet__terms-link-inline">User Agreement</span>. The virtual item will be made available to you by Electronic Arts.\n\nFurthermore:\n(i) I acknowledge that I have read, understand and agree to EA SPORTS FC™ Mobile Web Store’s <span class="sheet__terms-link-inline">Terms & Conditions</span> and <span class="sheet__terms-link-inline">Privacy Notice</span>; and\n(ii) I understand and agree that all sales are final and non-refundable.',
    },
    sku: {
      bonusLabel: 'FC Points Bonus',
      bestSeller: 'BEST SELLER',
      bestValue:  'BEST VALUE',
    },
    nav: {
      /** Expandable Store group — mirrors COD:M hierarchy; children are the top-level categories */
      groups: [{
        label: 'Store',
        children: [
          { label: 'Daily Supplies', anchor: 'daily-supplies' },
          { label: 'Limited Offers', anchor: 'limited-offers' },
          { label: 'Top Ups',        anchor: 'top-ups' },
        ],
      }],
      items: [],
    },
    signIn: {
      logoAlt:        'EA Sports FC™ Mobile',
      /** Short label — the EA logomark beside it provides the brand context */
      cta:            'Sign In',
      /** v-html rendered — <sup>TM</sup> for the full brand name */
      openingApp:     'Opening EA Sports FC<sup>TM</sup> Mobile…',
      qrInstruction:  'Scan this QR code with a mobile device logged into your EA Sports FC<sup>TM</sup> Mobile account',
      pagePrompt:     'Sign in to your account to purchase',
    },
    account: {
      heading:            'YOUR FC MOBILE ACCOUNT',
      playerIdLabel:      'Your FC Mobile Player ID',
      instructionsPrefix: 'In the FC Mobile App go to',
      playerCardLabel:    'Player Profile',
    },
    // Transaction History page (presence of this block also gates the account-popover link).
    transactionHistory: {
      title:       'Transaction History',
      popoverLink: 'Transaction History',
      filterLabel: 'Filter Transactions',
      ranges: { d7: 'Past 7 days', d30: 'Past 30 days', d90: 'Past 90 days' },
      row: {
        paymentStatus: 'Payment status',
        orderId:       'Order ID',
        transactionId: 'Transaction ID',
        paymentMethod: 'Payment Method',
        totalPayment:  'Total Payment',
        noCharge:      'No charge Made',
      },
      status: { fulfilled: 'Fulfilled', pending: 'In Progress', failed: 'Failed' },
      empty:  'No transactions in this period.',
    },
    page: {
      tabs:                  ['Best Sellers', '2x FC Points', 'New Users', 'FC Points'],
      promoTitle:            'WEB EXCLUSIVE: GET BONUS FC POINTS + A FREE GIFT',
      promoAction:           'SHOP NOW',
      doubleCurrencyHeading: '2x FC Points',
      doubleCurrencyDesc:    'Get <strong>100%</strong> Bonus on selected items. Each item can be purchased only ONCE across the web store and in-game.',
      newUsersHeading:       'NEW USERS PROMO',
      newUsersDesc:          'Get <strong>50%</strong> off your first purchase',
      newUsersSub:           'You may only get 1 item from the items below',
      currencySection:       'FC Points',
      giftsHeading:          'GIFTS',
      giftLimit:             'Limit: 1',
      giftClaimHeading:      'Claim Gift',
      giftClaimLabel:        'You are about to claim',
      giftClaimCta:          'Claim Gift',
      giftClaimDoneCta:      'Close',
      giftClaimedHeading:    'Gift Claimed',
      giftClaimedBody:       'has been sent to your FC Mobile account.',
      giftClaimedUpsellIntro: 'Since you are here, check out this offer just for you',
    },
  },

  // Per-language partial overrides of `strings`; deep-merged over the English
  // base by useStoreStrings for the language selected in useLocale. Any key not
  // present in an override falls back to English.
  translations: { ja, pt, es, ar, 'zh-Hant': zhHant, th, id },

  // ── Imagery (was useStoreAssets REGISTRY.fcm) ───────────────────────────────
  assets: {
    brand: {
      wordmark,                 // FCM store logo (navbar)
      logomark,                 // EA logo (sign-in button)
      favicon: fcmLogomark,     // FCM Logomark.svg — browser tab icon
      qrCode,                   // ← swap when FCM QR arrives
      qrPlaceholder,            // ← swap when FCM QR arrives
      coda,
      rating,
      cpIcon,                   // ← swap when FCM currency icon arrives
      apIcon,                   // ← swap when FCM AP icon arrives
      // Loyalty mark — every store provides BOTH a simple (mask/currentColor,
      // inline rows) and a decorative coloured (raw <img>, navbar pill) version.
      loyaltyIcon:       mpSimple, // MP (Match Points) simple mark — inline loyalty rows
      loyaltyIconColour: mpColour, // MP coloured mark — navbar rewards pill
      navSignInIcon:     mpColour, // icon inside the navbar SIGN IN button (FCM = MP Colour)
      bg,                       // full-cover page background art (fixed during scroll)
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      fcmStory1,
      fcmStory2,
      fcmStory3,
      fcmStory4,
      bestSellerImage,          // hero art for the pinned best-seller card
      giftDailyImage,
      giftFirstLoginImage,
      avatar,
    },
  },

  catalog,
  featured,

  // L1 "intent" tree for the multi-level navigation pilot (config.nav.multiLevel).
  // Store's categories ARE catalog — not duplicated; Loyalty & Rewards / Events
  // are pre-launch stubs (see ./intents.js). Ignored entirely by the legacy nav.
  intents: buildFcmIntents(catalog),

  // Real content for the "Milestone Rewards" intent (see ./milestone.js) —
  // rendered by App.vue's rewards-intent branch instead of the intent's own
  // "coming soon" stub categories.
  milestone,

  // Demo transactions for the Transaction History page. `daysAgo` keeps the
  // "Past N days" filter clock-robust (dates computed relative to runtime now).
  transactions: [
    { id: 'fcm-1', state: 'fulfilled', title: '1050 FC Points',  daysAgo: 3,  orderId: '8800112233', transactionId: '8800112233', paymentMethod: 'Card Payments', total: '$9.99' },
    { id: 'fcm-2', state: 'pending',   title: '500 FC Points',   daysAgo: 5,  orderId: '8800112234', transactionId: '8800112234', paymentMethod: 'PayPal',        total: '$4.99' },
    { id: 'fcm-3', state: 'failed',    title: '2800 FC Points',  daysAgo: 6,  orderId: '8800112235', transactionId: '8800112235', paymentMethod: 'Card Payments', total: null },
    { id: 'fcm-4', state: 'fulfilled', title: '5900 FC Points',  daysAgo: 20, orderId: '8800112236', transactionId: '8800112236', paymentMethod: 'Apple Pay',     total: '$49.99' },
    { id: 'fcm-5', state: 'fulfilled', title: '12000 FC Points', daysAgo: 27, orderId: '8800112237', transactionId: '8800112237', paymentMethod: 'Card Payments', total: '$99.99' },
    { id: 'fcm-6', state: 'fulfilled', title: '250 FC Points',   daysAgo: 75, orderId: '8800112238', transactionId: '8800112238', paymentMethod: 'Card Payments', total: '$4.99' },
  ],
}
