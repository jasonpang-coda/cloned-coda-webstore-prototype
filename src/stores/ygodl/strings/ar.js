/**
 * YGO:DL — Arabic (ar) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Modern Standard Arabic (MSA). Proper nouns / currency
 * / in-game item names (Yu-Gi-Oh! DUEL LINKS, KONAMI ID, Crystals, Crystal Packs)
 * left untranslated. Arrays supplied whole; `anchor` unchanged. NOTE: Phase 1
 * renders this LTR — RTL layout mirroring is Phase 2.
 */
export default {
  checkout: {
    actionLabel: 'اشترِ الآن',
  },
  sku: {
    bonusLabel:      'مجاني',
    bestSeller:      'موصى به',
    bestValue:       'أفضل قيمة',
    bonusTag:        'مكافأة',
    webExclusiveTag: 'حصري على متجر الويب',
  },
  nav: {
    groups: [{
      label: 'المتجر',
      children: [
        { label: 'عادي',           anchor: 'cat-regular' },
        { label: 'محدود',          anchor: 'cat-limited' },
        { label: 'مكافآت مجانية', anchor: 'cat-free-rewards' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'سجّل الدخول للشراء',
    accountLinkPrompt: 'كيفية ربط حساب اللعبة بمعرّف KONAMI ID الخاص بك',
    mykonami: {
      cta:        'تسجيل الدخول عبر KONAMI ID',
      pagePrompt: 'سجّل الدخول إلى حساب KONAMI ID الخاص بك للشراء',
      openingApp: 'جارٍ فتح KONAMI ID…',
    },
  },
  account: {
    heading:            'حساب KONAMI ID الخاص بك',
    playerIdLabel:      'معرّف اللاعب الخاص بك',
    instructionsPrefix: 'في تطبيق Yu-Gi-Oh! DUEL LINKS انتقل إلى',
    playerCardLabel:    'ملف اللاعب',
  },
  page: {
    tabs:                   ['عادي', 'محدود', 'مكافآت مجانية'],
    promoTitle:             'حصري على متجر الويب',
    promoAction:            'تسوّق الآن',
    limitedHeading:         'عروض محدودة',
    giftsHeading:           'مكافآت مجانية',
    giftTagLabel:           'هدية مجانية',
    giftTitle:              'هدية أسبوعية',
    giftSubtitle:           'متاح مرة واحدة أسبوعيًا',
    giftCta:                'استلام',
    giftEndsLabel:          'يتجدد خلال:',
    giftRefreshesLabel:     'يتجدد:',
    giftClaimHeading:       'استلام المكافأة',
    giftClaimLabel:         'أنت على وشك استلام',
    giftClaimCta:           'استلام المكافأة',
    giftClaimDoneCta:       'إغلاق',
    giftClaimedHeading:     'تم استلام المكافأة',
    giftClaimedBody:        'أُرسلت إلى صندوق الوارد داخل اللعبة.',
    giftClaimedUpsellIntro: 'بما أنك هنا، اطّلع على هذا العرض المخصص لك',
  },
}
