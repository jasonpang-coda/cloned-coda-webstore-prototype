/**
 * Rogue Trader — Arabic (ar) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Modern Standard Arabic (MSA). Proper nouns / brand /
 * currency (Warhammer 40K, Rogue Trader, Voidfarer, Profit Factor / PF, item &
 * edition names) left untranslated. Arrays (nav, page.tabs) supplied whole.
 * NOTE: Phase 1 renders this LTR — RTL layout mirroring is Phase 2.
 * Voice: neutral, clean commerce UI (Codashop) — concise, action-oriented.
 */
export default {
  checkout: {
    actionLabel: 'اقتنِ',
  },
  sku: {
    bonusLabel: 'مكافأة التفويض',
    bestSeller: 'الأكثر رواجًا',
    bestValue:  'أفضل قيمة',
  },
  nav: {
    groups: [{
      label: 'المتجر',
      children: [
        { label: 'الألعاب والإصدارات', anchor: 'cat-games' },
        { label: 'DLC',               anchor: 'cat-dlc' },
      ],
    }],
    items: [{ label: 'استبدال الرمز', anchor: null }],
  },
  signIn: {
    cta:               'تسجيل الدخول',
    openingApp:        'جارٍ فتح Rogue Trader…',
    qrInstruction:     'امسح رمز QR هذا بجهاز محمول مسجّل الدخول إلى حسابك',
    pagePrompt:        'سجّل الدخول إلى حسابك لإتمام الشراء',
    accountLinkPrompt: 'اربط حسابك للمتابعة',
  },
  account: {
    heading:            'الـ Rogue Trader Warrant الخاص بك',
    playerIdLabel:      'معرّف Rogue Trader الخاص بك',
    instructionsPrefix: 'في تطبيق Rogue Trader انتقل إلى',
  },
  page: {
    tabs:                  ['الألعاب والإصدارات', 'DLC'],
    promoTitle:            'WARRANT OF TRADE: احصل على الـ VOIDFARER EDITION',
    promoAction:           'تسوّق الآن',
    bestSellerDesc:        'أكثر الإصدارات والإمدادات رواجًا في الـ Expanse.',
    doubleCurrencyDesc:    'احصل على مكافأة <strong>100%</strong> على تفويضات مختارة.',
    giftsHeading:          'الجزية',
    giftDailyTitle:        'جزية يومية',
    giftDailySub:          'Relic Cache',
    giftLimit:             'الحد:1',
    giftClaimHeading:      'استلام الجزية',
    giftClaimLabel:        'أنت على وشك استلام',
    giftClaimCta:          'استلام الجزية',
    giftClaimDoneCta:      'إغلاق',
    giftClaimedHeading:      'تم استلام الجزية',
    giftClaimedBody:         'أُرسلت إلى خزنتك داخل اللعبة.',
    giftClaimedUpsellIntro:  'بما أنك تقود هذا الجسر، اطّلع على هذا التفويض',
    newUsersHeading:       'تفويض الـ Voidfarers الجدد',
    newUsersDesc:          'احصل على خصم <strong>50%</strong> على أول عملية شراء',
    newUsersSub:           'يمكنك استلام تفويض واحد فقط من التفويضات أدناه',
    cpDealsHeading:        'الـ Voidfarers الجدد',
    cpDealsDesc:           'احصل على خصم <strong>50%</strong> على أول تفويض Profit Factor',
    cpDealsSub:            'يمكنك استلام تفويض واحد فقط من التفويضات أدناه',
    cpImageSectionDesc:    'احصل على Profit Factor لتوسيع نفوذ سلالتك',
  },
}
