/**
 * Zenless Zone Zero store module — theme CSS (side-effect import), capability
 * config, user-visible copy, and the imagery registry. Imported only via the
 * @active-stores virtual module (see vite.config.js's filesystem auto-discovery).
 *
 * SCAFFOLD STATUS: brand imagery is the user-supplied squarish transparent
 * logo (navbar + favicon), the official wordmark (footer), 7 real
 * Monochrome/Inter-Knot pack-crate renders (one per SKU below), the
 * download banner's real user-supplied background art, and its App Store /
 * Google Play badges (reused from Diablo Immortal's store — generic
 * official Apple/Google artwork with no per-game branding, not a
 * placeholder) — no placeholder art of any kind. There is deliberately NO
 * hero key art and no CategoryBanner/SKU-card background photo: neither was
 * supplied, and per the "do not create placeholder assets" instruction this
 * store renders those surfaces as clean flat token-driven CSS instead of
 * inventing a photo. Pricing is PLACEHOLDER —
 * these SKU denominations (60 / 300+30 / 980+110 / 1980+260 / 3280+600 /
 * 6480+1600) match the standard HoYoverse premium-currency tier structure,
 * and the USD price points here follow that same publicly-known scale, but
 * they are NOT confirmed against the real live Zenless Zone Zero store —
 * search "PLACEHOLDER" to find swap points. The Inter-Knot Membership price
 * is likewise a placeholder (the common $4.99/mo price point for this genre
 * of subscription). The palette + typography are real, sourced from
 * docs/style-guides/zenless-zone-zero/spec.json (CSS-observed from the live
 * site, not guessed) — see src/tokens/ds/themes/zzz.css.
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/zzz.css (imported here)
 *   imagery                   → assets
 *   structural capability     → config
 *   user-visible copy         → strings
 */

import '@/tokens/ds/themes/zzz.css'
import { LOCALE_SETS } from '../../locale/sets.js'

// ── Brand ─────────────────────────────────────────────────────────────────
// User-supplied real assets — squarish transparent-background mark for the
// navbar/favicon, official wordmark lockup for the footer.
import logomark from './img/brand/logomark.svg'
import wordmark from './img/brand/wordmark.svg'

// App Store / Google Play badges — generic official Apple/Google artwork
// (no Diablo Immortal branding in either file), reused from that store's
// copy rather than re-fetched.
import appStoreBadge   from './img/brand/app-store-badge.svg'
import googlePlayBadge from './img/brand/google-play-badge.svg'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda from '@/shared/brand/coda.svg'

// ── Content ──────────────────────────────────────────────────────────────
// Download banner background — real key art (user-supplied): a dark collage
// of in-universe promo/guide-page typography (New Eridu Settlers Guide,
// Bangboo:Net, faction marks).
import downloadBannerBg from './img/content/download-banner-bg.jpg'

// Monochrome pack-crate renders — real user-supplied art, one per SKU tier.
// Filenames encode the display total (base + web bonus already summed).
import monochrome60   from './img/content/SKU/monochrome-60.png'
import monochrome330  from './img/content/SKU/monochrome-330.png'
import monochrome1090 from './img/content/SKU/monochrome-1090.png'
import monochrome2240 from './img/content/SKU/monochrome-2240.png'
import monochrome3880 from './img/content/SKU/monochrome-3880.png'
import monochrome8080 from './img/content/SKU/monochrome-8080.png'
import interKnotCrate  from './img/content/SKU/inter-knot-membership.png'

export default {
  key:   'zzz',
  label: 'Zenless Zone Zero',

  // ── Structural capabilities (read via useStoreConfig) ────────────────────
  config: {
    footer: {
      supportUrl: '#',
      social: { x: '#', facebook: '#', instagram: '#', youtube: '#', tiktok: '#', discord: '#' },
    },

    // No dedicated zzz-translate skill yet — codashop's 27-language set is
    // the standard fallback (see locale/sets.js header).
    locale: LOCALE_SETS.codashop,

    skuList: { layout: 'columns' },

    // 'page' = bespoke single-scroll sections (mirrors Diablo Immortal /
    // TDR). hideNav — the sticky bottom CategoryNav is skipped because this
    // store's sticky guided-checkout bar (checkout.stepCta below) already
    // docks in that exact same bottom slot (both are position:absolute,
    // bottom:0, and would fully overlap — see page.topNav below for the nav
    // this store uses instead).
    catalog: { mode: 'page', hideNav: true },
    page: {
      sections: ['best-seller-img', 'cp-img'],
      // Top-docked category nav (App.vue's showPageTopNav) — appears once
      // scrolled past the UID card into the Best Sellers/Monochrome
      // sections, hides again once scrolled past them into the SEO/FAQ
      // content. Sidesteps the bottom-dock conflict noted above.
      topNav: true,
      // No hero key art supplied — StoryCarousel self-omits when
      // assets.content.storyHero is null (see App.vue), so this flag is
      // inert either way; left true for parity with the cloned store.
      heroBeforeGamerId: true,
      // CategoryBanner (icon + heading + description) in place of the
      // Monochrome section's plain text header. No background photo was
      // supplied, so its backgroundImage stays null below — CategoryBanner
      // renders its own flat token-driven fill in that case.
      cpImgBanner: true,
      storyHeroLogo: false,
    },

    checkout: {
      showPoweredByCoda: true,
      showRating:        false,
      loyalty:           null,   // no loyalty programme wired
      allowGuest:        true,
      mode:              'inline', // Player ID / Select Payment / Enter Your Details render as
                                    // stacked page cards, matching the cloned store's flow.
      zipCodeStep:       false,
      // Default payment-channel set (googleApple/creditCard/paypalVenmo/
      // cashApp) — the only four with real shipped logo assets; omitted here
      // deliberately rather than listing a regional mix with no real logo,
      // per the "no fabricated brand marks" precedent (see StepPayment.vue).
      stepCta: true,
    },

    navbar: {
      hideSignIn: true,
      localeSwitcher: true,
      wordmarkSuffix: 'Official Store',
    },
    signIn: { flow: 'codm' }, // unused — allowGuest + inline checkout cover the whole flow

    profile: {
      avatarStyle:             'icon',
      playerCard:              'nickname-only',
      showLoyaltyPill:         false,
      showPlayerAccount:       false,
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
      disclaimer:    'CODA PAYMENTS IS AN AUTHORIZED RESELLER OF DIGITAL CONTENT FOR ZENLESS ZONE ZERO. ZENLESS ZONE ZERO IS A TRADEMARK OF COGNOSPHERE PTE. LTD.',
      legalLinks: [
        { label: 'Terms and Conditions of Sale', url: '#' },
        { label: 'Privacy Notice',               url: '#' },
        { label: 'Terms of Use',                 url: '#' },
      ],
    },
    currency: {
      name: 'Monochrome',
      abbr: 'Mono',
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
        { label: 'Monochrome', anchor: 'cat-cp-img' },
        { label: 'Characters', anchor: null },
        { label: 'Videos',     anchor: null },
        { label: 'News & Info', anchor: null },
      ],
    },
    signIn: {
      logoAlt:       'Zenless Zone Zero',
      cta:           'Sign in',
      openingApp:    'Opening Zenless Zone Zero…',
      qrInstruction: 'Scan this QR code with a mobile device logged into your account',
      pagePrompt:    'Sign in to your account to purchase',
    },
    gamerId: {
      heading:     'UID',
      userIdLabel: 'UID',
      serverLabel: 'Server',
      helperText:  'To find your UID, open the in-game menu and tap your profile in the top-left corner. Your UID is shown beneath your name.',
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
      selectPaymentCta: 'Select Payment Method',
      // In-voice confirmation copy — "Return to Ridu" is a verbatim phrase
      // observed on the live site's navbar (docs/style-guides/zenless-zone-zero
      // /spec.json generic.voice.pillars).
      purchaseCompleteTitle: 'Delivery Complete',
      purchaseCompleteText:  'Your Monochrome has been added. Return to Ridu.',
    },
    account: {
      heading:            'YOUR ACCOUNT',
      playerIdLabel:       'Your UID',
      instructionsPrefix: 'In the Zenless Zone Zero app go to',
      playerCardLabel:    null,
    },
    page: {
      // Positional — zips to config.page.sections by index (see App.vue's
      // `categories` computed): 'best-seller-img' → tabs[0], 'cp-img' → tabs[1].
      // Drives the sticky bottom CategoryNav's tab labels.
      tabs:               ['Best Sellers', 'Monochrome'],
      promoTitle:         null,
      cpImageSection:      'Monochrome',
      cpImageSectionDesc:  'Restock your Monochrome — spend it on Agent signal searches, Bangboo units, and more.',
      bestSellerImageSection: 'Best Sellers',

      seo: {
        heading: 'Suit Up, Proxy. New Eridu Doesn\'t Wait.',
        body: '<p>Zenless Zone Zero is a <strong>free-to-play urban action RPG</strong> developed by HoYoverse, set in New Eridu — one of the last cities left standing after mysterious dimensional rifts called Hollows tore the world apart.</p>' +
              '<p>As a <strong>Proxy</strong>, you guide teams of Agents into the Hollows to complete jobs for New Eridu\'s many factions — from the Cunning Hares to Belobog Heavy Industries — fighting alongside your Bangboo companion in fast, stylish, combo-driven combat.</p>' +
              '<p>New Eridu is constantly evolving: new Agents, story chapters, and limited-time events arrive with every version update, each one framed as its own named "Special Program" rather than a routine patch.</p>' +
              '<p>Recruit a full roster of Agents, build the team that matches your playstyle, and keep New Eridu\'s lights on — download and start your first job today.</p>',
        benefitsHeading: 'Why Top Up on the Zenless Zone Zero Official Store?',
        benefitsDesc: 'Players trust the Zenless Zone Zero Official Store for a seamless purchase experience — no account sign-up required, and your Monochrome is added to your UID instantly.',
        benefits: [
          { icon: 'bolt',         title: 'Easy and Fast',                       desc: 'It only takes a few seconds to complete a purchase on the Official Store.' },
          { icon: 'check_circle', title: 'Instant Delivery',                    desc: 'Your Monochrome is delivered directly to your UID as soon as your payment is complete.' },
          { icon: 'credit_card',  title: 'Convenient Payment Methods',          desc: 'We\'ve partnered with popular global payment providers, including PayPal, Google Pay, and Apple Pay.' },
          { icon: 'chat',         title: 'Speedy & Localized Customer Support', desc: 'Our friendly support team is always available to help.' },
          { icon: 'discount',     title: 'Exciting Promotions',                 desc: 'Keep a lookout for the best deals on Monochrome and bonus tiers.' },
          { icon: 'stars',        title: 'More With Every Purchase',            desc: 'Every pack comes with a web bonus on top of your Monochrome — more value, every time.' },
        ],
        faq: [
          { q: 'Is Zenless Zone Zero free to play?', a: 'Yes, Zenless Zone Zero is free to download and play, with optional in-app purchases available.' },
          { q: 'Can I play Zenless Zone Zero on multiple platforms?', a: 'Yes, Zenless Zone Zero supports cross-platform play across PC, mobile, and PlayStation, all under one UID.' },
          { q: 'What is Monochrome used for?', a: 'Monochrome is Zenless Zone Zero\'s premium currency — spend it on Agent signal searches, Bangboo units, and other in-game content.' },
          { q: 'What is the Inter-Knot Membership?', a: 'A recurring monthly pass that delivers a daily Monochrome stipend plus bonus perks directly to your UID for as long as it stays active.' },
          { q: 'How often does Zenless Zone Zero get new content?', a: 'Each version update ships as its own named "Special Program" with new Agents, story chapters, and limited-time events.' },
          { q: 'Do I need an account to top up?', a: 'No — enter your in-game UID directly on this page. No separate account sign-up is required to purchase Monochrome.' },
        ],
      },

      // Download banner — no App Store / Google Play badge SVGs or banner
      // background photo were supplied for this store, so both render via
      // App.vue's existing graceful fallbacks: a text-style-utility pill
      // instead of a badge image (assets.content.appStoreBadge/
      // googlePlayBadge stay null below), and a flat token-coloured
      // background instead of a photo (downloadBannerBg stays null).
      download: {
        navCta:  'Download',
        heading: 'New Eridu Is Waiting, Proxy',
        body:    'Take the fight to the Hollows. Download Zenless Zone Zero free on PC, mobile, and PlayStation, and keep your Agents ready anywhere.',
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
      navLogomark: logomark,
      signinLogomark: logomark,
      navSignInIcon:  logomark,
      favicon:        logomark,
      qrCode:         null,
      qrPlaceholder:  null,
      coda,
      rating:            null,
      cpIcon:            null,
      apIcon:            null,
      loyaltyIcon:       null,
      loyaltyIconColour: null,
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      // No hero key art supplied — StoryCarousel self-omits.
      storyHero: null,
      skuCrate:    null,
      skuCodPoint: null,
      avatar:      null,
      // Monochrome CategoryBanner icon — the largest denomination pack
      // render, matching the cloned store's own convention.
      cpImgBannerIcon: monochrome8080,
      // No background photo supplied — CategoryBanner renders its own flat
      // token-driven fill instead.
      cpImgBannerBg: null,
      // Download banner — real user-supplied background art; App Store /
      // Google Play badges reuse Diablo Immortal's real generic Apple/
      // Google artwork (no per-game branding in either file — see the
      // import comment above).
      downloadBannerBg,
      appStoreBadge,
      googlePlayBadge,
    },
  },

  // 'page' model — no category catalogue / featured carousel data.
  catalog:  null,
  featured: null,

  // Per-store SKU overrides — consumed by useStoreSkus() + App.vue's
  // cpImageRegular/bestSellerImage computeds. amount = base + web bonus.
  // These six denominations (60 / 300+30 / 980+110 / 1980+260 / 3280+600 /
  // 6480+1600) match the standard HoYoverse premium-currency tier structure
  // exactly. PLACEHOLDER pricing — USD price points follow that same
  // publicly-known scale, not confirmed against the real live Zenless Zone
  // Zero store. The Inter-Knot Membership is a non-numeric SKU (amount:
  // null, title set instead) — SkuImageCard/SkuImageList already support
  // this shape for named products. The highest Monochrome tier and the
  // Inter-Knot Membership are featured in their own "Best Seller" section
  // above the main grid rather than duplicated in both.
  skus: {
    bestSeller: [
      { amount: 8080, baseAmount: 6480, bonusAmount: 1600, currentPrice: '$99.99', skuImage: monochrome8080 },
      { amount: null, title: 'Inter-Knot Membership', currentPrice: '$4.99', skuImage: interKnotCrate },
    ],
    cpImageRegular: [
      { amount: 60,   currentPrice: '$0.99',  skuImage: monochrome60 },
      { amount: 330,  baseAmount: 300,  bonusAmount: 30,   currentPrice: '$4.99',  skuImage: monochrome330 },
      { amount: 1090, baseAmount: 980,  bonusAmount: 110,  currentPrice: '$19.99', skuImage: monochrome1090 },
      { amount: 2240, baseAmount: 1980, bonusAmount: 260,  currentPrice: '$32.99', skuImage: monochrome2240 },
      { amount: 3880, baseAmount: 3280, bonusAmount: 600,  currentPrice: '$54.99', skuImage: monochrome3880 },
    ],
  },
}
