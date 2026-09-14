/**
 * COD:M store module — everything that defines the Call of Duty: Mobile store:
 * theme CSS (side-effect import), capability config, user-visible copy, and the
 * imagery registry. Imported only via an active-stores manifest
 * (the @active-stores virtual module, see vite.config.js), so a build that doesn't include COD:M never pulls
 * these assets, fonts, or theme rules into the bundle.
 *
 * Layer decision rule (see web-store-whitelabel skill):
 *   colour / type / surface   → ../../tokens/ds/themes/codm.css (imported here)
 *   imagery                   → assets
 *   structural capability     → config
 *   user-visible copy         → strings
 */

import '@/tokens/ds/themes/codm.css'
import { LOCALE_SETS } from '../../locale/sets.js'
import { milestone } from './milestone.js'

// ── Localised copy (partial overrides of `strings`; en falls through) ──────────
// Phase-1 languages within COD:M's locale set: ja, pt, es, ar.
import ja from './strings/ja.js'
import pt from './strings/pt.js'
import es from './strings/es.js'
import ar from './strings/ar.js'

// ── Brand ─────────────────────────────────────────────────────────────────────
import wordmark      from './img/brand/codm-wordmark.svg'
import logomark      from './img/brand/codm-logomark.svg'
import qrCode        from './img/brand/qr-code.webp'
import qrPlaceholder from './img/brand/qr-placeholder.svg'
import cpIcon        from './img/brand/cp-icon.svg'
import apIcon        from './img/brand/ap-icon.svg'
import apIconColour  from './img/content/armory-point.webp'
// Real, generic (non-game-branded) badge art — same files ZZZ/Diablo Immortal
// reuse, see download-banner-bg import below for the per-store background.
import appStoreBadge   from './img/brand/app-store-badge.svg'
import googlePlayBadge from './img/brand/google-play-badge.svg'

// Coda-platform branding (checkout footer) — market-level, shared across stores.
import coda   from '@/shared/brand/coda.svg'
import rating from '@/shared/brand/rating.svg'

// ── Content (campaign / sku images) ───────────────────────────────────────────
import slideKuiJiLandscape   from './img/content/slide-kui-ji-landscape.jpg'
import slideKuiJiPortrait    from './img/content/slide-kui-ji-portrait.jpg'
import slideTheBoysLandscape from './img/content/slide-the-boys-landscape.jpg'
import slideTheBoysPortrait  from './img/content/slide-the-boys-portrait.jpg'
import bannerMidnightSun     from './img/content/midnight-sun-strongbox.webp'
import bannerTheBoys         from './img/content/the-boys-banner.webp'
import bannerTerminator2     from './img/content/terminator-2-banner.webp'
import downloadBannerBg      from './img/content/download-banner-bg.webp'
import orderCompleteHero     from './img/content/order-complete-hero.webp'
import giftsBannerBg         from './img/content/gifts-banner-bg.jpg'
import cpSkuBanner           from './img/content/SKU Banners/CP Banner.webp'
import skuCrate              from './img/content/crate.webp'
import skuCodPoint           from './img/content/cod-point.webp'
import skuVmpJudgementDay    from './img/content/vmp-judgement-day-sku.webp'
import itemVmpJudgementDay   from './img/content/vmp-judgement-day.webp'
// Per-SKU CP coin art, one file per exact CP amount. Looked up by App.vue's
// cpCoinFor() helper; skuCodPoint stays as the generic fallback.
import cpCoin88              from './img/content/CP/88.webp'
import cpCoin160             from './img/content/CP/160.webp'
import cpCoin420             from './img/content/CP/420.webp'
import cpCoin460             from './img/content/CP/460.webp'
import cpCoin960             from './img/content/CP/960.webp'
import cpCoin2600            from './img/content/CP/2600.webp'
import cpCoin4000            from './img/content/CP/4000.webp'
import cpCoin5400            from './img/content/CP/5400.webp'
import cpCoin11600           from './img/content/CP/11600.webp'
import cpCoin23200           from './img/content/CP/23200.webp'
import cpCoin34800           from './img/content/CP/34800.webp'
import cpCoin58000           from './img/content/CP/58000.webp'
import skuArmoryPoint        from './img/content/armory-point.webp'
import skuMidnightSunHero    from './img/content/midnight-sun-bundle-hero.webp'
import cpCategoryBg          from './img/content/cp-category-bg.webp'
import avatar                from './img/content/Avatar.webp'
import avatarPreviewVideo    from './img/content/media/avatar-preview.webm'
import giftSecretCache       from './img/content/Gifts/Secret_Caches.webp'
import giftEmote             from './img/content/Gifts/Affirmative_Epic_Emote.webp'
import giftGun               from './img/content/Gifts/LAG_53_-_New_Empire.webp'

export default {
  key:   'codm',
  label: 'COD:M',

  // ── Structural capabilities (was useStoreConfig CONFIG.codm) ───────────────
  config: {
    // Footer "Need Help?" action (hidden when supportUrl is null) + per-network
    // social profile URLs (icons are shared/market-level — see useStoreAssets;
    // null hides that one icon regardless of asset availability).
    footer: {
      supportUrl: 'https://support.activision.com/call-of-duty-mobile',
      social: { x: '#', facebook: '#', instagram: '#', youtube: '#', tiktok: '#', discord: '#' },
    },

    // Region/language switcher set — codm-translate skill (22 languages).
    locale: LOCALE_SETS.codm,

    // SkuList arrangement for the regular SKU sections (see SkuList `layout` prop).
    skuList: { layout: 'columns' },

    // Page model: 'page' = bespoke single-scroll sections (COD:M); 'filter' = category
    // filter nav with hide/show catalogue (FCM). Components read this flag — never
    // branch on theme identity directly.
    catalog: { mode: 'page' },

    // Lightweight L1 tab pilot (Store / Milestone Rewards) — COD:M only.
    // Unlike FCM's nav.multiLevel (which swaps the ENTIRE page over to the
    // category-filter/CatalogNavStack rendering model), this just names the
    // dev flag that gates a second navbar tab; App.vue owns a small local
    // "active section" ref that toggles between the existing page-mode
    // content and MilestoneRewards.vue when this flag is on. Every other
    // store omits this key, so its navbar/page rendering is unaffected.
    nav: { milestoneFlag: 'codmMilestoneRewards' },

    checkout: {
      showPoweredByCoda: true,
      showRating:        true,
      // Loyalty (Armory Point) is pre-wired but not yet launched — see
      // loyaltyFlag below. `loyalty` itself is set (mirrors FCM's shape) so
      // flipping the flag "just works" with zero component edits; when the
      // flag is off, useStoreConfig.js nulls this out for every consumer.
      loyalty:           { label: 'You will earn' },
      loyaltyFlag:       'codmMilestoneRewards',
      allowGuest:        true,     // show Player-ID lookup + "check out as guest"
    },

    // Sign-in flow variant. 'codm' = in-app loader + QR; 'ea-redirect' = EA Account page overlay.
    // ctaCasing: SignInSheet's CTA label style for this store — uppercase is a COD:M-specific
    // brand choice, not shared by any other store that also happens to reuse the 'codm' flow
    // value below (see ds-remediation.md Phase 4). Every other store omits this key, so
    // SignInSheet's `?? 'regular'` fallback applies.
    signIn: { flow: 'codm', ctaCasing: 'uppercase' },

    // Bundle behaviour. itemSummary: tapping a child item tile in a BundleSkuCard
    // opens the ItemSummarySheet (the pre-checkout breakdown). Other stores omit
    // this flag, so their item taps keep the existing direct-to-checkout behaviour.
    bundle: { itemSummary: true },

    // Signed-in profile presentation.
    profile: {
      avatarStyle:     'image',   // 'image' = in-game avatar; 'icon' = generic account icon
      playerCard:      'full',    // 'full' = name + ID + level + rank; 'nickname-only' = name only
      showLoyaltyPill: true,      // show AP points pill in the navbar once loyalty is enabled
    },

    // Payment-channel logo polarity. PC logos are market-shared (not per-store);
    // 'light' = light logos for a dark UI. A future light-theme store uses 'dark'.
    chrome: { iconVariant: 'light' },

    // Page-content ordering escape hatch (see App.vue's .seo-download-group).
    // COD:M wants the download banner (with its PWA install CTA) to lead,
    // ahead of the SEO copy/FAQ accordion. Every other store omits this key,
    // so their existing SEO-then-download order is unaffected.
    // badgesAboveValueProps moves the App Store / Google Play badges out of
    // the banner box and into the value-prop section instead, right after
    // the benefit grid — COD:M only; every other store keeps the badges
    // inside the banner (App.vue's default).
    content: { downloadBannerFirst: true, badgesAboveValueProps: true },
  },

  // ── User-visible copy (was useStoreStrings STRINGS.codm) ───────────────────
  strings: {
    // Site footer (see Footer.vue). disclaimer/legalLinks are per-store —
    // null/empty hides that block.
    footer: {
      supportCta:    'Support Portal',
      cookieLabel:   'Cookie Preference',
      cookieCta:     'Manage Your Cookie Preference',
      socialHeading: 'Stay up to date with us',
      disclaimer:    'THE OFFICIAL CALL OF DUTY: MOBILE WEB STORE IS OPERATED BY CODA. CODA IS AN AUTHORIZED RESELLER OF DIGITAL CONTENT FOR CALL OF DUTY: MOBILE.',
      legalLinks: [
        { label: 'Terms & Conditions', url: 'https://www.activision.com/legal/ap-eula' },
        { label: 'Privacy Policy',     url: 'https://www.activision.com/privacy-policy' },
      ],
    },
    currency: {
      name: 'CP',
      abbr: 'CP',
    },
    checkout: {
      actionLabel: 'Buy Now',
      // Payment sheet's legal bar — names the actual publisher, so it lives
      // here (per-store) rather than in the shared common.checkout dictionary.
      termsBody:
        'By clicking "Checkout", I acknowledge that the purchase of this virtual item will be a license for its use, subject to Activision\'s User Agreement. The virtual item will be made available to you by Activision.\n\nFurthermore:\n(i) I acknowledge that I have read, understand and agree to Call of Duty®: Mobile Web Store’s Terms & Conditions and Privacy Notice; and\n(ii) I understand and agree that all sales are final and non-refundable.',
    },
    sku: {
      bonusLabel: 'WEB BONUS',
      bestSeller: 'BEST SELLER',
      bestValue:  'BEST VALUE',
      bonusTag:   'BONUS',
    },
    nav: {
      /** Expandable L1 groups: [{ label, children[] }] — empty = flat nav */
      groups: [{
        label: 'Store',
        children: [
          { label: 'Gifts', anchor: 'cat-gifts' },
          { label: 'CP',    anchor: 'cat-cp' },
        ],
      }],
      /** Flat L1 items shown below any groups. anchor: null = no scroll target. */
      items: [{ label: 'Code Redemption', anchor: null }],
    },
    // Item Summary sheet — bundle breakdown shown before checkout.
    itemSummary: {
      heading:           'Item Summary',
      receiveLabel:      'You will receive',
      endsLabel:         'Ends:',
      taxNote:           'Tax will be added in the next step',
      signedOutMessage:  'Sign into your COD:M account to purchase this item',
      orLabel:           'or',
      signInIdCta:       'Sign in with your COD:M ID',
    },
    signIn: {
      logoAlt:        'Call of Duty Mobile',
      cta:            'Sign in',
      openingApp:     'Opening COD:M app…',
      qrInstruction:  'Scan this QR code with a mobile device logged into your COD:M account',
      pagePrompt:     'Sign in to your account to purchase',
    },
    account: {
      heading:            'YOUR COD:M ACCOUNT',
      playerIdLabel:      'Your COD:M Player ID',
      instructionsPrefix: 'In the COD:M App go to',
      playerCardLabel:    null,   // COD:M uses the full PlayerCard variant (no label needed)
      disclosureLabel:      'How to find your COD:M account',
      viewImageInstructions: 'View image instructions',
      // Guest lookup disclosure chips (Figma 5147:22653) — self-contained per
      // language (each chip's instruction line embeds the full localised sentence
      // rather than interpolating instructionsPrefix, so translations read naturally).
      chips: [
        {
          id: 'uid', label: 'Find UID',
          lines: [
            { type: 'text', content: 'UID: Your ID consists of 19–20 numbers' },
            { type: 'para', content: 'In the COD:M App go to\n  •  Player Profile > BASIC' },
          ],
        },
        {
          id: 'player-id', label: 'Find Player ID',
          lines: [
            { type: 'text', content: 'Player ID: A shorter numeric identifier for your account' },
            { type: 'para', content: 'In the COD:M App go to\n  •  Player Profile > BASIC' },
          ],
        },
        {
          id: 'nickname', label: 'Find Nickname',
          lines: [
            { type: 'text', content: 'Nickname: Your in-game display name' },
            { type: 'para', content: 'In the COD:M App go to\n  •  Player Profile > BASIC' },
          ],
        },
      ],
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
      tabs:                  ['Best Sellers', '2x CP', 'Gifts', 'New Users', 'CP', 'New Users (Image)', 'CP (Image)'],
      promoTitle:            'WEB EXCLUSIVE: GET 100% BONUS CP + A FREE GIFT',
      promoAction:           'SHOP NOW',
      bestSellerDesc:        'Community favourites — top-rated bundles and operator gear.',
      doubleCurrencyHeading: '2x CP',
      doubleCurrencyDesc:    'Get <strong>100%</strong> Bonus on selected items. Each item can be purchased only ONCE across the web store and in-game.',
      giftsHeading:          'GIFTS',
      giftTagLabel:          'FREE GIFT',
      giftDailyTitle:        'DAILY GIFT',
      giftDailySub:          'Epic Secret Cache',
      giftEmoteTitle:        'AFFIRMATIVE EPIC EMOTE',
      giftGunTitle:          'LAG 53 - NEW EMPIRE',
      giftLimit:             'Limit:1',
      giftEndsLabel:         'Ends:',
      giftRefreshesLabel:    'Refreshes:',
      giftClaimHeading:      'Claim Gift',
      giftClaimLabel:        'You are about to claim',
      giftClaimCta:          'Claim Gift',
      giftClaimDoneCta:      'Close',
      giftClaimedSnackTitle:   'Gift Claimed',
      giftClaimedSnackBody:    'sent to your COD:M inbox',
      giftClaimedHeading:      'Gift Claimed',
      giftClaimedBody:         'has been sent to your COD:M inbox.',
      giftClaimedUpsellIntro:  'Since you are here, check out this offer just for you',
      newUsersHeading:       'NEW USERS PROMO',
      newUsersDesc:          'Get <strong>50%</strong> off your first purchase',
      newUsersSub:           'You may only get 1 item from the items below',
      currencySection:       'CP',
      cpDealsHeading:        'New Users (Image)',
      cpDealsDesc:           'Get <strong>50%</strong> off your first CP top-up',
      cpDealsSub:            'You may only get 1 item from the items below',
      cpImageSection:        'CP (Image)',

      // SEO content — long-form copy + benefit grid + FAQ accordion,
      // ported from the live store.callofdutymobile.com/en-us/codm SEO
      // block. Renders purely off this key's presence (see App.vue's
      // `v-if="strings.page.seo"`), same precedent as ZZZ/Diablo Immortal.
      seo: {
        heading: 'Purchase COD Points on the COD:M Store',
        body: '<p>You are seconds away from buying COD Points. Buying COD Points is made easy, secure and convenient. We are trusted by gamers around the world. No registration or login is required!</p>',
        benefitsHeading: 'Why Choose the COD:M Store for Call of Duty: Mobile COD Points purchases?',
        benefits: [
          { icon: 'bolt',         title: 'Easy and Fast',                 desc: 'It only takes a few seconds to complete a purchase.' },
          { icon: 'check_circle', title: 'Instant Delivery',              desc: 'COD Points are delivered straight to your in-game account.' },
          { icon: 'credit_card',  title: 'Convenient Payment Methods',    desc: 'Pay using some of the most popular payment methods around.' },
          { icon: 'chat',         title: 'World-Class Customer Support',  desc: 'The Coda Payments support team is always ready to help.' },
          { icon: 'discount',     title: 'Exciting Promotions',           desc: 'Never miss out on COD:M deals, giveaways, and more!' },
        ],
        faq: [
          {
            q: 'How to buy COD Points?',
            a: 'Enter your Call of Duty Player ID, select the amount of COD Points you wish to purchase, choose your preferred mode of payment, then review your order and complete the payment — your COD Points will be instantly credited to your Call of Duty: Mobile account.',
          },
          {
            q: 'How to send gifts in Call of Duty: Mobile?',
            a: 'Enter the Call of Duty Player ID of a friend in your region, choose the number of COD Points you wish to purchase, then enter your payment details and click "Buy Now" — the COD Points will be automatically credited to your recipient\'s account.',
          },
        ],
      },

      // Download banner — badges render above the banner, in the value-prop
      // section, per config.content.badgesAboveValueProps. No badge SVGs or
      // banner background photo were supplied for COD:M yet, so both render
      // via App.vue's existing graceful fallbacks (text pill / flat token
      // background), same precedent as ZZZ.
      download: {
        heading: 'Never miss another promo',
        body:    'Install the COD:M Store to be the first to hear about news and promo',
        appStoreLabel:   'Download on the App Store',
        googlePlayLabel: 'GET IT ON Google Play',
        appStoreUrl:     '#',
        googlePlayUrl:   '#',
      },

      // Order Complete / Purchase Success page (Figma node 335:61272) — the
      // full-page view shown after a successful checkout. Gated on this key's
      // presence (see OrderCompletePage.vue's `v-if="t"`), same precedent as
      // page.seo/page.pwaInstall, so other stores no-op until they add copy.
      orderComplete: {
        heroTitle:      'Purchase Success',
        heroSubtitle:   'Your item has been delivered to your COD:M account',
        continueShopping: 'Continue Shopping',
        summaryTitle:   'Order Summary',
        newUserTag:     'New User',
        bonusLabel:     'Bonus',
        backToGame:     'Back to Game',
        nickname:       'Player Nickname:',
        playerId:       'Player ID:',
        email:          'Email:',
        paymentMethod:  'Payment Method:',
        price:          'Price:',
        needHelpTitle:  'Need Help?',
        needHelp: [
          { label: 'Payment & Purchase Issues', url: '#' },
          { label: 'Promotions',                url: '#' },
          { label: 'Service Announcements',     url: '#' },
          { label: 'Others',                    url: '#' },
        ],
      },

      // Task-gated 88 CP gift — reward for installing the PWA + turning on
      // web push (see useTaskGiftClaim.js / GiftSkuCard.vue's taskGift prop /
      // TaskGiftSheet.vue). One block holds every string this touchpoint
      // touches: the Gifts-grid card, the instructions sheet, and the Order
      // Complete banner (see OrderCompletePage.vue).
      giftTask: {
        cardTitle:     '88 CP REWARD',
        cardSubtitle:  'Install + enable notifications',
        cardCta:       'Learn More',
        sheetTitle:    'Unlock 88 CP',
        sheetDesc:     'Complete both steps below to claim 88 CP, free.',
        stepInstall:   'Install the COD:M Store',
        // Split from stepInstall for the in-app-WebView variant — a WebView
        // can't install anything, so its checklist item is "leave to a real
        // browser", not "install" (see TaskGiftSheet.vue's variant branching).
        stepOpenBrowser: 'Open in your browser',
        stepPush:      'Turn on notifications',
        ctaEnablePush: 'Turn on notifications',
        ctaClaim:      'Claim 88 CP',
        gotIt:         'Got it',
        // Heading above the inline install-instructions block (media +
        // numbered steps) — split per variant same as stepOpenBrowser above.
        installInstructionsHeading: 'How to Install COD:M Store',
        openBrowserInstructionsHeading: 'How to Open in Your Browser',
        // Android body copy — Android has only one real requirement (Web
        // Push doesn't need install there), so its variant skips the 2-item
        // checklist UI entirely and states the single requirement as prose.
        androidBody:   'Turn on notifications to claim 88 CP, free.',
        claimedHeading: '88 CP Claimed',
        claimedBody:   '88 CP has been sent to your COD:M inbox.',
        orderCompleteBannerTitle: 'Claim your 88 CP',
        orderCompleteBannerDesc: 'Install the COD:M Store and turn on notifications to claim 88 CP, free.',
        // Home-carousel reward nudge (see App.vue's `stories` computed) —
        // pre-install slide slot, same one pwaInstall.storySlideHeading used
        // before this touchpoint existed.
        storySlideHeading: 'Install + enable notifications for 88 CP, free',
      },

      // PWA install CTA — own prominent row inside the download banner (see
      // App.vue's .download-banner__pwa). iosSteps/webviewSteps drive
      // TaskGiftSheet's inline steps-detour numbered-steps half;
      // assets.content.iosInstallDemo/webviewOpenDemo (nullable, neither
      // supplied yet) drive its media half.
      pwaInstall: {
        cta:           'Install the COD:M Store',
        // Shorter label for the Gifts-banner CTA (same install action,
        // different surface — see App.vue's CategoryBanner #action slot
        // usage) — sign-in-button styled, so a compact "Install" fits its
        // pill without wrapping.
        bannerCta:     'Install',
        // Gifts CategoryBanner's description line — calls out the 88 CP
        // task-gated reward (see page.giftTask / useTaskGiftClaim.js).
        giftsBannerDesc: 'Install the COD:M Store and turn on notifications to claim 88 CP, free.',
        iosSheetTitle: 'Install the COD:M Store',
        iosSteps: [
          'Tap the Share icon in Safari’s toolbar',
          'Scroll down and tap “Add to Home Screen”',
          'Tap “Add” to confirm',
        ],
        // In-app WebView variant (Instagram/TikTok/etc. — see
        // useWebviewDetect.js) of the same media+steps detour — generic copy
        // since the exact menu differs per host app.
        webviewSheetTitle: 'Open in Your Browser',
        webviewSteps: [
          'Tap the menu icon (⋮ or •••) in the corner of the screen',
          'Choose “Open in Browser” (or “Open in Chrome / Safari”)',
          'Continue from there to install and enable notifications',
        ],
        gotIt: 'Got it',
        // Drawer footer row label (see NavDrawer.vue's .nav-drawer__pwa) —
        // placeholder, swap for final copy later.
        drawerCta: 'Install COD:M Store',
        // First story-carousel slide (see App.vue's `stories` computed).
        storySlideHeading: 'Get faster access to COD:M Store',
        storySlideCta: 'Install COD:M Store',
        // Order Complete page's slim install bar (see OrderCompletePage.vue).
        postPurchaseCta: 'Get faster access next time — install the COD:M Store',
      },

      // Web Push upsell — replaces every pwaInstall signpost once the store
      // is treated as installed (see the `pwaInstalledState` variant flag and
      // usePwaInstall.js's isInstalled). Same surfaces as pwaInstall above,
      // now a toggle/bell rather than an install CTA (see useWebPush.js).
      webPush: {
        // Gifts CategoryBanner description + toggle (see App.vue's
        // CategoryBanner #action slot usage).
        giftsBannerDesc: 'Turn on notifications to claim 88 CP, free.',
        giftsBannerAriaLabel: 'Notify me about daily gifts',
        // Order Complete page's slim bar (see OrderCompletePage.vue).
        postPurchaseTitle: 'Stay in the loop',
        postPurchaseDesc: 'Get notified about order updates and daily gifts.',
        postPurchaseAriaLabel: 'Notify me about order updates',
        // Drawer footer row label (see NavDrawer.vue's .nav-drawer__pwa row).
        drawerLabel: 'Notifications',
        drawerAriaLabel: 'Turn on notifications',
        // First story-carousel slide (see App.vue's `stories` computed) —
        // replaces the PWA-install slide once installed.
        storySlideHeading: 'Never miss a drop',
        storySlideCta: 'Turn on notifications',
        // Confirmed-state copy for the same slide, once subscribed — swaps in
        // via the out-in crossfade (see App.vue's `stories` computed).
        storySlideConfirmedHeading: 'You’re all set',
        storySlideConfirmedLabel: 'Notifications on',
        // Download banner's PWA row, once installed (see App.vue's
        // #download-banner section) — replaces pwaInstall.cta there.
        downloadBannerCta: 'Turn on notifications',
      },
    },
  },

  // ── Localised copy overrides, keyed by language code (see ./strings/*) ─────
  translations: { ja, pt, es, ar },

  // ── Imagery (was useStoreAssets REGISTRY.codm) ──────────────────────────────
  assets: {
    brand: {
      wordmark,
      logomark,
      qrCode,
      qrPlaceholder,
      coda,
      rating,
      cpIcon,                    // round CP coin icon (used inline in SKU cards)
      // Loyalty (AP) is pre-wired but gated behind the codmMilestoneRewards
      // dev flag (config.checkout.loyaltyFlag) — off by default, so no loyalty
      // rows render until the flag is flipped. Every store provides BOTH a
      // simple (mask/currentColor, inline rows) and a decorative coloured
      // (raw <img>, navbar pill) loyalty mark.
      loyaltyIcon:       apIcon, // simple AP mark — inline loyalty rows
      loyaltyIconColour: apIconColour, // decorative/coloured AP mark — armory-point.webp
      navSignInIcon:     logomark, // icon inside the navbar SIGN IN button
      favicon:           logomark, // codm-logomark.svg — browser tab icon
    },
    // pc is merged in by useStoreAssets() from the shared PC map (per polarity).
    content: {
      slideKuiJiLandscape,
      slideKuiJiPortrait,
      slideTheBoysLandscape,
      slideTheBoysPortrait,
      bannerMidnightSun,
      bannerTheBoys,
      bannerTerminator2,
      cpSkuBanner,
      skuCrate,
      skuCodPoint,
      skuVmpJudgementDay,
      itemVmpJudgementDay,
      cpCoins: {
        88: cpCoin88, 160: cpCoin160, 420: cpCoin420, 460: cpCoin460,
        960: cpCoin960, 2600: cpCoin2600, 4000: cpCoin4000, 5400: cpCoin5400,
        11600: cpCoin11600, 23200: cpCoin23200, 34800: cpCoin34800, 58000: cpCoin58000,
      },
      skuArmoryPoint,
      skuMidnightSunHero,
      cpCategoryBg,
      avatar,                  // in-game player avatar (navbar, account popover)
      avatarPreviewVideo,      // demo clip for Item Summary accordion (video media path)
      giftSecretCache,         // Gifts category — Epic Secret Cache art
      giftEmote,               // Gifts category — Affirmative Epic Emote art
      giftGun,                 // Gifts category — LAG 53 New Empire art
      giftsBanner: giftsBannerBg, // Gifts CategoryBanner background — COD:M squad key art
      downloadBannerBg,        // download banner background (Terminator 2: Judgment Day key art)
      orderCompleteHero,       // Order Complete hero background (CP coin stack)
      appStoreBadge,           // real generic Apple badge art (same file ZZZ/Diablo Immortal reuse)
      googlePlayBadge,         // real generic Google Play badge art (same file ZZZ/Diablo Immortal reuse)
    },
  },

  // COD:M uses the 'page' model — no category catalogue / featured carousel data.
  catalog:  null,
  featured: null,

  // Real content for the lightweight "Milestone Rewards" tab (see
  // ./milestone.js) — rendered by App.vue's local active-section branch
  // instead of the bespoke page-mode content when the tab is active.
  milestone,

  // Demo transactions for the Transaction History page. `daysAgo` keeps the
  // "Past N days" filter clock-robust (dates computed relative to runtime now).
  transactions: [
    { id: 'codm-1', state: 'fulfilled', title: '88 CP',   daysAgo: 4,  orderId: '1234567890', transactionId: '1234567890', paymentMethod: 'Card Payments', total: '$1.08' },
    { id: 'codm-2', state: 'pending',   title: '420 CP',  daysAgo: 5,  orderId: '1234567891', transactionId: '1234567891', paymentMethod: 'Card Payments', total: '$4.99' },
    { id: 'codm-3', state: 'failed',    title: '880 CP',  daysAgo: 6,  orderId: '1234567892', transactionId: '1234567892', paymentMethod: 'GCash',         total: null },
    { id: 'codm-4', state: 'fulfilled', title: '2400 CP', daysAgo: 18, orderId: '1234567893', transactionId: '1234567893', paymentMethod: 'Card Payments', total: '$24.99' },
    { id: 'codm-5', state: 'fulfilled', title: '1200 CP', daysAgo: 26, orderId: '1234567894', transactionId: '1234567894', paymentMethod: 'Apple Pay',     total: '$12.99' },
    { id: 'codm-6', state: 'fulfilled', title: '5000 CP', daysAgo: 62, orderId: '1234567895', transactionId: '1234567895', paymentMethod: 'Card Payments', total: '$49.99' },
  ],
}
