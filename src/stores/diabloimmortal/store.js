/**
 * Diablo Immortal store module — theme CSS (side-effect import), capability
 * config, user-visible copy, and the imagery registry. Imported only via the
 * @active-stores virtual module (see vite.config.js's filesystem auto-discovery).
 *
 * SCAFFOLD STATUS: brand imagery is a mix of REAL art — key art harvested from
 * diabloimmortal.blizzard.com for the style guide at docs/style-guides/diablo-immortal/,
 * the real wordmark, Eternal Orb pack renders, and App Store / Google Play
 * badges all supplied by the user — and PLACEHOLDER art still pending (only
 * the logomark — a small icon-only mark for the sign-in/QR slot no isolated
 * asset has been supplied for). Pricing is PLACEHOLDER — industry-standard
 * price points at each confirmed denomination, not confirmed against real
 * Diablo Immortal pricing. Search "PLACEHOLDER" to find swap points. The
 * palette + typography are real, sourced from
 * docs/style-guides/diablo-immortal/spec.json (CSS-observed from the live
 * site, not guessed) — see src/tokens/ds/themes/diabloimmortal.css.
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/diabloimmortal.css (imported here)
 *   imagery                   → assets
 *   structural capability     → config
 *   user-visible copy         → strings
 */

import '@/tokens/ds/themes/diabloimmortal.css'
import { LOCALE_SETS } from '../../locale/sets.js'

// ── Brand ─────────────────────────────────────────────────────────────────
// Real official wordmark (user-supplied) — replaces the earlier text-rendered
// placeholder now that an isolated, transparent-background lockup exists.
import wordmark from './img/brand/wordmark.png'
import logomark from './img/brand/logomark.svg'
// Real official icon-only mark (user-supplied) — used for the navbar
// specifically (assets.brand.navLogomark), matching the live site's actual
// navbar chrome (a small brand mark, not the full text wordmark).
import navLogomark from './img/brand/nav-logomark.svg'
import cpIcon   from './img/brand/cp-icon.svg'

// App Store / Google Play badges — user-supplied real assets.
import appStoreBadge   from './img/brand/app-store-badge.svg'
import googlePlayBadge from './img/brand/google-play-badge.svg'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda from '@/shared/brand/coda.svg'

// ── Content ──────────────────────────────────────────────────────────────
// Real key art harvested from the live site (see docs/style-guides/diablo-immortal/refs/)
// for the hero slide; avatar is still a generic placeholder.
import heroKeyart        from './img/content/hero-keyart.jpg'
import skuBg             from './img/content/sku-bg.jpg'
// Real key art (user-supplied) — the download banner's background image.
import downloadBannerBg  from './img/content/download-banner-bg.jpg'
// Real key art (user-supplied) — the Eternal Orbs CategoryBanner's background.
import categoryBannerBg  from './img/content/category-banner-bg.jpg'
import seoTile           from './img/content/seo-tile.png'
import placeholderSquare from './img/content/placeholder-square.svg'
import avatar            from './img/content/avatar.svg'

// Eternal Orb pack renders — real user-supplied art, one per BASE denomination
// (before the web bonus). Filenames match the in-game pack size; the 12000
// pack ("not_final" in its source filename) has no corresponding entry in the
// requested SKU list below and is imported but not wired into any SKU yet —
// a possible future 7th tier pending confirmation.
import skuOrb60    from './img/content/SKU/60.png'
import skuOrb300   from './img/content/SKU/300.png'
import skuOrb600   from './img/content/SKU/600.png'
import skuOrb1500  from './img/content/SKU/1500.png'
import skuOrb3000  from './img/content/SKU/3000.png'
import skuOrb6000  from './img/content/SKU/6000.png'
// import skuOrb12000 from './img/content/SKU/12000.png' // unused — see comment above

export default {
  key:   'diabloimmortal',
  label: 'Diablo Immortal',

  // ── Structural capabilities (read via useStoreConfig) ────────────────────
  config: {
    footer: {
      supportUrl: '#',
      social: { x: '#', facebook: '#', instagram: '#', youtube: '#', tiktok: '#', discord: '#' },
    },

    // No dedicated diabloimmortal-translate skill yet — codashop's 27-language
    // set is the standard fallback (see locale/sets.js header), SG default to
    // match the requested navbar/footer region toggle.
    locale: LOCALE_SETS.codashop,

    skuList: { layout: 'columns' },

    // 'page' = bespoke single-scroll sections (mirrors TDR/COD:M). hideNav —
    // this store has a single SKU category, no bottom CategoryNav needed.
    catalog: { mode: 'page', hideNav: true },
    page: {
      sections: ['cp-img'],
      // SEO content (long-form copy + FAQ accordion) and the store-download
      // banner both render purely off the presence of strings.page.seo /
      // strings.page.download below — no separate flag needed here.

      // Hero key art shown ABOVE the Player ID step (every other inline-
      // checkout store keeps Player/Gamer ID first).
      heroBeforeGamerId: true,
      // CategoryBanner (art + heading + description) in place of the Eternal
      // Orbs section's plain text header.
      cpImgBanner: true,
      // The hero key art already has the "DIABLO IMMORTAL" wordmark baked in
      // — the app's own overlay wordmark on top of it would be a duplicate.
      storyHeroLogo: false,
    },

    // The hero key art is a fixed 700×365 landscape crop, not a portrait
    // square — StoryCarousel's default mobile frame (1:1) would crop most
    // of it away on narrow devices. Match the real art instead.
    carousel: { aspectRatio: '700 / 365' },

    checkout: {
      showPoweredByCoda: true,
      showRating:        false,
      loyalty:           null,   // no loyalty programme wired
      allowGuest:        true,
      mode:              'inline', // Player ID / Select Payment / Enter Your Details render as
                                    // stacked page cards (StepGamerId/StepPayment/StepDetails),
                                    // matching the requested page order — see App.vue.
      zipCodeStep:       false,  // this store's flow has no Zip Code step
      // Player ID for step 1 — single field, no Server field (Diablo Immortal
      // has no server selection).
      gamerId: { showServer: false },
      // Guided checkout button (InlineCheckoutCta.vue) instead of the button
      // living inside Enter Your Details — a bottom-docked sticky bar whose
      // label + progress donut advance as the SKU / payment-channel gates
      // clear. Its wallet(+) icon is hardcoded in that component, not
      // config-driven (unlike detailsCta.icon below, which only affects the
      // OTHER inline-checkout stores that still use StepDetails' own button).
      stepCta: true,
      // SG payment-channel set from the content reference. PayPal/Card Payment
      // reuse the existing shared logo marks; the other 5 (PayNow, GrabPay,
      // WeChat Pay, StarHub, M1, SingTel) have no logo asset yet, so they
      // render as icon+label tiles (see StepPayment.vue) rather than a
      // fabricated brand mark — swap in real logos under src/shared/pc/light/
      // when available.
      paymentChannels: ['payNow', 'paypalVenmo', 'grabPay', 'weChatPay', 'starHub', 'm1', 'singTel', 'creditCard'],
      // Same order/keys as paymentChannels above, just as {name} objects —
      // this is the shape BuyNowBar.vue's selectedChannelName lookup expects
      // (config.checkout.channels[i].name), so the guided-checkout handoff's
      // "SKU title · channel" eyebrow resolves correctly once selectedChannel
      // is set. StepPayment.vue's own CHANNEL_DEFS carries the icon/logo;
      // this list only needs to exist for the display name lookup.
      channels: [
        { name: 'PayNow' },
        { name: 'PayPal' },
        { name: 'GrabPay' },
        { name: 'WeChat Pay' },
        { name: 'StarHub' },
        { name: 'M1' },
        { name: 'Singtel' },
        { name: 'Card Payments' },
      ],
    },

    // No sign-in feature at all — guest Player ID lookup only.
    navbar: {
      hideSignIn: true,
      // Region/language toggle on by default for this store (rather than
      // behind the shared, prototype-wide `localeSwitcher` dev flag every
      // other store relies on).
      localeSwitcher: true,
      // "Official Store" appended right after the navbar wordmark.
      wordmarkSuffix: 'Official Store',
    },
    signIn: { flow: 'codm' }, // unused — allowGuest + inline checkout cover the whole flow

    profile: {
      avatarStyle:             'icon',
      playerCard:              'nickname-only',
      showLoyaltyPill:         false,
      showPlayerAccount:       false, // Player ID entry happens inline in StepGamerId instead
      showAccountInstructions: false,
      showPlayerRank:          false,
    },

    chrome: { iconVariant: 'light' },

    device: { default: 'none' }, // desktop-first single-scroll product page
  },

  // ── User-visible copy (read via useStoreStrings) ─────────────────────────
  strings: {
    footer: {
      supportCta:    'Support Portal',
      cookieLabel:   'Cookie Preference',
      cookieCta:     'Manage Your Cookie Preference',
      socialHeading: 'Stay up to date with us',
      disclaimer:    'CODA PAYMENTS IS AN AUTHORIZED RESELLER OF DIGITAL CONTENT FOR DIABLO IMMORTAL. DIABLO IMMORTAL IS A TRADEMARK OF BLIZZARD ENTERTAINMENT, INC.',
      legalLinks: [
        { label: 'Terms and Conditions of Sale', url: '#' },
        { label: 'Privacy Notice',               url: '#' },
        { label: 'Terms of Use',                 url: '#' },
      ],
    },
    currency: {
      name: 'Eternal Orbs',
      abbr: 'Orbs',
    },
    checkout: {
      actionLabel: 'Buy Now',
    },
    sku: {
      bonusLabel: 'WEB BONUS',
      bestSeller: 'BEST SELLER',
      bestValue:  'BEST VALUE',
    },
    nav: {
      groups: [],
      items: [
        { label: 'Eternal Orbs', anchor: 'cat-cp-img' },
        { label: 'Classes',      anchor: null },
        { label: 'News',         anchor: null },
      ],
    },
    signIn: {
      logoAlt:       'Diablo Immortal',
      cta:           'Sign in',
      openingApp:    'Opening Diablo Immortal…',
      qrInstruction: 'Scan this QR code with a mobile device logged into your account',
      pagePrompt:    'Sign in to your account to purchase',
    },
    gamerId: {
      heading:     'Player ID',
      userIdLabel: 'Player ID',
      serverLabel: 'Server',
      helperText:  'To find your Player ID, open the in-game menu and tap your portrait in the top-left corner. Your Player ID is shown beneath your name.',
    },
    payment: {
      heading: 'Select Payment',
    },
    details: {
      heading:      'Enter Your Details',
      helperText:   'OPTIONAL: enter an email address to receive purchase receipt',
      emailLabel:   'Please enter your email',
      consentLabel: 'Yes, sign me up for exclusive game news and promotions! In accordance with <a href="#">Publisher Privacy Policy</a> and <a href="#">Coda Privacy Policy</a>.',
      termsHeading: 'Terms & Conditions',
      termsBody:    'By clicking BUY NOW, I acknowledge that the purchase of this virtual item will be a license from the game publisher for its use, subject to the game publisher\'s <a href="#">End User License Agreement</a>.<br><br>Furthermore:<br>(i) I acknowledge that I have read, understand and agree to the game\'s <a href="#">Terms &amp; Conditions</a> and <a href="#">Privacy Policy</a>, and<br>(ii) I understand and agree that all sales are final and non-refundable',
      submitCta:    'Select Your Item',
      // InlineCheckoutCta's step-1 label (SKU picked, no payment channel yet).
      selectPaymentCta: 'Select Payment Method',
      // InlineCheckoutCta's demo "submit" snackbar (no real backend in this prototype).
      purchaseCompleteTitle: 'The Pact Is Sealed',
      purchaseCompleteText:  'Your Eternal Orbs are on their way to Sanctuary.',
    },
    account: {
      heading:            'YOUR ACCOUNT',
      playerIdLabel:       'Your Player ID',
      instructionsPrefix: 'In the Diablo Immortal app go to',
      playerCardLabel:    null,
    },
    page: {
      tabs:               ['Eternal Orbs'],
      promoTitle:         null,
      cpImageSection:      'Eternal Orbs',
      cpImageSectionDesc:  'Power your Warband — spend Eternal Orbs on gear, cosmetics, and Battle Pass tiers.',

      // SEO content (long-form copy + FAQ accordion) — renders as its own
      // page section purely from this object's presence; see App.vue.
      seo: {
        heading: 'Command Hell. Rule Every Battle in This Dark Fantasy Action MMORPG.',
        // Rich HTML (v-html — same trusted-copy precedent as CategoryBanner's
        // description / StepDetails' termsBody) — broken into short paragraphs
        // with bolded key terms instead of one unbroken wall of text.
        body: '<p>Diablo Immortal is a <strong>free-to-play action MMORPG</strong> developed by Blizzard Entertainment, set in the dark fantasy world of Sanctuary — torn by the Eternal Conflict between angels and demons.</p>' +
              '<p>Command the <strong>Warlock</strong>, a formidable new class harnessing forbidden magic and forming dark pacts, fighting alongside <strong>The Soulgorger</strong> — a permanent demon companion with no summons or cooldowns. Master positioning, control the battlefield, and shape real-time ARPG combat solo or with your clan.</p>' +
              '<p>Sanctuary is a living, evolving world: nonstop combat across solo play, co-op dungeons, raids, and PvP arenas, with <strong>seamless cross-platform play</strong> between mobile and PC, and frequent updates bringing new story chapters, world bosses, events, and seasonal challenges.</p>' +
              '<p>Form a <strong>Warband</strong> for small-group co-op, join a clan to dominate leaderboards, and trade loot in raids. With AAA production quality and endless ways to play, the war for Sanctuary is ongoing — download and become a legend.</p>',
        // "Why top up here" benefit grid — sits right above the FAQ accordion.
        // icon = a MaterialIcon name (round variant); renders purely off this
        // array's presence, same content-gate precedent as the rest of `seo`.
        benefitsHeading: 'Why Top Up on the Diablo Immortal Official Store?',
        benefitsDesc: 'Millions of players trust the Diablo Immortal Official Store for a seamless purchase experience — no account sign-up required, and your Eternal Orbs are added to your Warband instantly.',
        benefits: [
          { icon: 'bolt',         title: 'Easy and Fast',                       desc: 'It only takes a few seconds to complete a purchase on the Official Store.' },
          { icon: 'check_circle', title: 'Instant Delivery',                    desc: 'Your Eternal Orbs are delivered directly to your Player ID as soon as your payment is complete.' },
          { icon: 'credit_card',  title: 'Convenient Payment Methods',          desc: 'We\'ve partnered with the most popular local payment providers, including PayNow, GrabPay, and more.' },
          { icon: 'chat',         title: 'Speedy & Localized Customer Support', desc: 'Our friendly support team is always available to help.' },
          { icon: 'discount',     title: 'Exciting Promotions',                 desc: 'Keep a lookout for the best deals on Eternal Orbs and bonus tiers.' },
          { icon: 'stars',        title: 'More With Every Purchase',            desc: 'Every pack comes with a web bonus on top of your Eternal Orbs — more value, every time.' },
        ],
        faq: [
          { q: 'Is Diablo Immortal free to play?', a: 'Yes, Diablo Immortal is free to download and play, with optional in-app purchases available.' },
          { q: 'Can I play Diablo Immortal on both mobile and PC?', a: 'Yes, Diablo Immortal supports seamless cross-platform play, allowing you to play on both mobile devices and PC.' },
          { q: 'What multiplayer features does Diablo Immortal offer?', a: 'You can join clans, form Warbands for co-op play, participate in raids, trade loot, and compete in PvP arenas.' },
          { q: 'What are Eternal Orbs used for?', a: 'Eternal Orbs are Diablo Immortal\'s premium currency — spend them on gear, cosmetics, Battle Pass tiers, and other in-game upgrades.' },
          { q: 'How often does Diablo Immortal get new content?', a: 'The game receives regular updates that introduce new story chapters, world bosses, events, and seasonal challenges.' },
          { q: 'Do I need an account to top up?', a: 'No — enter your in-game Player ID directly on this page. No separate account sign-up is required to purchase Eternal Orbs.' },
        ],
      },

      // Download banner (app store / play store) — renders purely from this
      // object's presence; badge SVGs are PLACEHOLDER pending the user's own
      // assets (assets.content.appStoreBadge / googlePlayBadge below).
      download: {
        // Short label for the navbar download button (NavBar.vue) — the full
        // heading below is too long for that slot.
        navCta:  'Download',
        heading: 'Hell Doesn\'t Wait for a Better Connection',
        body:    'Take Sanctuary\'s war with you. Download Diablo Immortal free on iOS and Android, and keep your Warband moving anytime, anywhere.',
        appStoreLabel:    'Download on the App Store',
        googlePlayLabel:  'GET IT ON Google Play',
        appStoreUrl:      '#',
        googlePlayUrl:    '#',
      },
    },
  },

  // ── Localised copy overrides — none yet; falls through to English. ───────
  translations: {},

  // ── Imagery (read via useStoreAssets) ─────────────────────────────────────
  assets: {
    brand: {
      wordmark,
      logomark,
      navLogomark,
      signinLogomark: logomark,
      navSignInIcon:  logomark,
      // Real navbar mark (navLogomark) — matches what users actually see in
      // the tab, rather than the still-placeholder standalone logomark.
      favicon:        navLogomark,
      qrCode:         null,
      qrPlaceholder:  null,
      coda,
      rating:            null,
      cpIcon,
      apIcon:            null,
      loyaltyIcon:       null,
      loyaltyIconColour: null,
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      // Single hero slide — real key art harvested from the live site.
      storyHero: heroKeyart,
      // SKU art — PLACEHOLDER pending the user's own Eternal Orb renders.
      skuCrate:    placeholderSquare,
      skuCodPoint: cpIcon,
      avatar,
      // Eternal Orbs CategoryBanner icon (left of the heading/description) —
      // the 7200-Orb pack render (the largest denomination), per the user's
      // request. NOT a background image — CategoryBanner's icon slot.
      cpImgBannerIcon: skuOrb6000,
      // Eternal Orbs CategoryBanner background — real carved-stone key art
      // (user-supplied).
      cpImgBannerBg: categoryBannerBg,
      // Download banner background — real key art (the dragon/skull banner
      // the user supplied).
      downloadBannerBg,
      // SEO block background — a tileable leather/mortar texture, repeated
      // across the section (user-supplied).
      seoTile,
      // Real user-supplied badge art (rendered outside the visual banner —
      // see the strings.page.download comment).
      appStoreBadge:   appStoreBadge,
      googlePlayBadge: googlePlayBadge,
    },
  },

  // 'page' model — no category catalogue / featured carousel data.
  catalog:  null,
  featured: null,

  // Per-store SKU overrides — consumed by useStoreSkus() + App.vue cpImageRegular.
  // amount = base + web bonus; base/bonus split derived from the real pack art
  // filenames (60/300/600/1500/3000/6000 Orb Pack) matched against the
  // originally-requested display totals (60/320/650/1650/3450/7200) — the
  // implied bonus rate climbs with spend (0% / 6.7% / 8.3% / 10% / 15% / 20%),
  // which reads as a realistic tiered-bonus curve, but this split is INFERRED,
  // not confirmed — flag if the real bonus structure differs.
  // PLACEHOLDER pricing — industry-standard price points, not confirmed
  // against real Diablo Immortal pricing.
  skus: {
    cpImageRegular: [
      { amount: 60,   currentPrice: '$0.99',  skuImage: skuOrb60,   backgroundImage: skuBg },
      { amount: 320,  baseAmount: 300,  bonusAmount: 20,   currentPrice: '$4.99',  skuImage: skuOrb300,  backgroundImage: skuBg },
      { amount: 650,  baseAmount: 600,  bonusAmount: 50,   currentPrice: '$9.99',  skuImage: skuOrb600,  backgroundImage: skuBg },
      { amount: 1650, baseAmount: 1500, bonusAmount: 150,  currentPrice: '$24.99', skuImage: skuOrb1500, backgroundImage: skuBg },
      { amount: 3450, baseAmount: 3000, bonusAmount: 450,  currentPrice: '$49.99', skuImage: skuOrb3000, backgroundImage: skuBg },
      { amount: 7200, baseAmount: 6000, bonusAmount: 1200, currentPrice: '$99.99', skuImage: skuOrb6000, backgroundImage: skuBg },
    ],
  },
}
