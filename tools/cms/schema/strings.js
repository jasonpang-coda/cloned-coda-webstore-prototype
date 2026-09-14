/**
 * Store strings schema — the single source of truth for `store.js`'s `strings`
 * key (and the shape each `src/stores/<key>/strings/<lang>.js` partial override
 * may fill in).
 *
 * Universal groups exist in all 10 stores today. Optional groups are
 * capability-bearing: shipping `transactionHistory` at all is what turns on
 * the account-popover history link (there's no separate config flag for it) —
 * see App.vue / AccountPopover.vue. `itemSummary` / `gamerId` / `details` /
 * `zipCode` / `payment` belong to specific flows (config.bundle.itemSummary,
 * config.checkout.mode === 'inline').
 *
 * `richText: true` marks values that may contain inline HTML (`<strong>`,
 * `<sup>TM</sup>`) rendered via v-html — the CMS's field for these needs a
 * raw/rich toggle, not HTML-escaping.
 */

export const STRINGS_SCHEMA = {
  universal: true,
  groups: {
    currency: {
      fields: {
        name: { default: 'Credits', help: 'In-game currency display name, e.g. "CP", "FC Points", "Gems".' },
        abbr: { default: 'CR', help: 'Short abbreviation used in compact contexts.' },
      },
    },
    sku: {
      fields: {
        bonusLabel:  { default: 'BONUS', help: 'Label on the bonus-amount line of a SKU tile.' },
        bestSeller:  { default: 'BEST SELLER', help: 'Best-seller badge text.' },
        bestValue:   { default: 'BEST VALUE', help: 'Best-value badge text.' },
        bonusTag:    { default: null, optional: true, help: 'Alternate bonus-tag label some bundles use.' },
        exclusiveTag:    { default: null, optional: true, help: 'Free-form tag key target — resolved via a SKU\'s tagKey field.' },
        limitedTimeTag:  { default: null, optional: true, help: 'Free-form tag key target — resolved via a SKU\'s tagKey field.' },
        webExclusiveTag: { default: null, optional: true, help: 'Free-form tag key target — resolved via a SKU\'s tagKey field.' },
      },
    },
    nav: {
      fields: {
        groups: { default: [], type: 'array', shape: '[{ label, children: [{ label, anchor }] }]', help: 'Grouped nav-drawer entries. [] for a flat nav.' },
        items:  { default: [], type: 'array', shape: '[{ label, anchor }]', help: 'Ungrouped nav-drawer entries (e.g. "Code Redemption").' },
      },
    },
    signIn: {
      note: 'A single-flow store (config.signIn.flow) uses the flat cta/openingApp/qrInstruction fields. A device-split store (config.signIn.desktop/.mobile, e.g. efootball/ygodl/ygomd) instead nests copy per named flow (signIn.mykonami.cta, signIn.efootball.cta, …) and the flat fields become optional — SignInSheet.vue derives a single-item array from config.signIn.flow only for legacy (non-split) stores.',
      fields: {
        logoAlt:       { default: null, help: 'Alt text for the sign-in logomark.' },
        cta:           { default: 'Sign In', optional: true, help: 'Sign-in button label. Required unless the store is device-split (see note).' },
        openingApp:    { default: null, optional: true, help: 'Loader copy while the companion app opens. Required unless the store is device-split.' },
        qrInstruction: { default: null, optional: true, help: 'Instruction under the sign-in QR code. Required unless the store is device-split.' },
        pagePrompt:    { default: 'Sign in to your account to purchase', help: 'Prompt shown on the inline page sign-in section.' },
        accountLinkPrompt: { default: null, optional: true },
        mykonami:   { default: null, optional: true, shape: '{ cta, pagePrompt, … }', help: 'Per-flow copy for a named device-split flow.' },
        efootball:  { default: null, optional: true, shape: '{ cta, pagePrompt, … }' },
      },
    },
    account: {
      fields: {
        heading:            { default: 'YOUR ACCOUNT', help: 'Account page heading.' },
        playerIdLabel:      { default: 'Your Player ID', help: null },
        instructionsPrefix: { default: null, help: 'Prefix for the "In the <Game> App go to…" instruction copy.' },
        playerCardLabel:    { default: null, help: 'Label on the player-card summary block.' },
        disclosureLabel:    { default: null, optional: true },
        viewImageInstructions: { default: null, optional: true },
        chips: { default: [], optional: true, type: 'array',
          shape: '[{ id, label, lines: [{ type: "text"|"para", content }] }]',
          help: 'Guest-lookup instruction chips (e.g. UID / Player ID / Nickname), each with rich instructional copy.' },
      },
    },
    checkout: {
      fields: {
        actionLabel: { default: 'Buy Now', help: 'Primary checkout CTA label — this is a STRING, not a config flag.' },
      },
    },
    footer: {
      fields: {
        supportCta:    { default: 'Support Portal' },
        cookieLabel:   { default: 'Cookie Preference' },
        cookieCta:     { default: 'Manage Your Cookie Preference' },
        socialHeading: { default: 'Stay up to date with us' },
        disclaimer:    { default: null, richText: true, help: 'Long-form legal/reseller disclaimer. null hides the block entirely.' },
        legalLinks:    { default: [], type: 'array', shape: '[{ label, url }]' },
      },
    },
    page: {
      fields: {
        tabs:          { default: [], type: 'array', help: 'Ordered tab labels, zipped positionally to config.page.sections.' },
        promoTitle:    { default: null, richText: true },
        promoAction:   { default: 'SHOP NOW' },
        currencySection: { default: null },
        doubleCurrencyHeading: { default: null, optional: true },
        doubleCurrencyDesc:    { default: null, optional: true, richText: true },
        newUsersHeading: { default: null, optional: true },
        newUsersDesc:    { default: null, optional: true, richText: true },
        newUsersSub:     { default: null, optional: true },
        bestSellerDesc:  { default: null, optional: true },
        cpDealsHeading:  { default: null, optional: true },
        cpDealsDesc:     { default: null, optional: true },
        cpDealsSub:      { default: null, optional: true },
        cpImageSection:     { default: null, optional: true },
        cpImageSectionDesc: { default: null, optional: true },
        regularHeading:  { default: null, optional: true },
        limitedHeading:  { default: null, optional: true },
        giftsHeading:    { default: null, optional: true },
        giftLimit:       { default: 'Limit: 1', optional: true },
        giftClaimHeading:      { default: null, optional: true },
        giftClaimLabel:        { default: null, optional: true },
        giftClaimCta:          { default: null, optional: true },
        giftClaimDoneCta:      { default: null, optional: true },
        giftClaimedHeading:    { default: null, optional: true },
        giftClaimedBody:       { default: null, optional: true, richText: true },
        giftClaimedUpsellIntro: { default: null, optional: true },
        giftClaimedSnackTitle: { default: null, optional: true },
        giftClaimedSnackBody:  { default: null, optional: true },
        giftEndsLabel:      { default: null, optional: true },
        giftRefreshesLabel: { default: null, optional: true },
        giftTagLabel:       { default: null, optional: true },
        giftDailySub:       { default: null, optional: true },
        giftDailyTitle:     { default: null, optional: true },
        giftEmoteTitle:     { default: null, optional: true },
        giftGunTitle:       { default: null, optional: true },
        giftTitle:          { default: null, optional: true },
        giftSubtitle:       { default: null, optional: true },
        giftCta:            { default: null, optional: true },
      },
    },
  },

  // Optional groups — present only when the store uses the flow they belong to.
  optionalGroups: {
    itemSummary: {
      requiredWhen: 'config.bundle.itemSummary === true',
      fields: { heading: {}, receiveLabel: {}, orLabel: {}, endsLabel: {}, signInIdCta: {}, signedOutMessage: {}, taxNote: {} },
    },
    transactionHistory: {
      note: 'Presence alone gates the account-popover "transaction history" link — there is no separate config flag.',
      fields: { title: {}, popoverLink: {}, filterLabel: {}, ranges: { shape: '{ d7, d30, d90 }' }, row: {}, status: { shape: '{ fulfilled, pending, failed }' }, empty: {} },
    },
    gamerId: {
      requiredWhen: 'config.checkout.mode === "inline"',
      fields: { heading: {}, helperText: {}, serverLabel: {}, userIdLabel: {} },
    },
    details: {
      requiredWhen: 'config.checkout.mode === "inline"',
      fields: { heading: {}, helperText: {}, emailLabel: {}, consentLabel: {}, submitCta: {} },
    },
    zipCode: {
      requiredWhen: 'config.checkout.mode === "inline"',
      fields: { heading: {}, inputLabel: {} },
    },
    payment: {
      requiredWhen: 'config.checkout.mode === "inline"',
      fields: { heading: {} },
    },
    identity: {
      requiredWhen: 'config.page.layout === "split"',
      fields: { deliveryLabel: {} },
    },
  },
}

// Per-language partial overrides: src/stores/<key>/strings/<lang>.js, deep-merged
// over the English `strings` block by useStoreStrings.js (fall-through for any
// key a language doesn't override). The codm-translate / fcm-translate /
// tdr-translate skills already produce content in this shape — the CMS's
// translation tab should import their table output, not reimplement translation.
export const TRANSLATION_NOTE =
  'A store may ship 0 languages (translations: {}) or up to 8. English is always the fall-through.'
