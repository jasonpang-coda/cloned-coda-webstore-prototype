/**
 * TDR — Arabic (ar) copy. PARTIAL override of ../store.js `strings`; omitted keys
 * fall back to English. Modern Standard Arabic (MSA). Proper nouns / brand /
 * currency (The Division Resurgence, SHD, Agent, Premium Credits/PC, in-game item
 * names) left untranslated. NOTE: Phase 1 renders this LTR — RTL layout mirroring
 * is Phase 2.
 */
export default {
  checkout: {
    actionLabel: 'اشترِ الآن',
  },
  sku: {
    bonusLabel: 'مكافأة الويب',
    bestSeller: 'الأكثر مبيعًا',
    bestValue:  'أفضل قيمة',
  },
  nav: {
    groups: [{
      label: 'المتجر',
      children: [
        { label: 'الهدايا',   anchor: 'cat-gifts' },
        { label: 'الرصيد',    anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'استبدال الرمز', anchor: null }],
  },
  signIn: {
    cta:               'تسجيل الدخول عبر The Division',
    openingApp:        'جارٍ فتح The Division Resurgence…',
    qrInstruction:     'امسح رمز QR هذا بجهاز محمول مسجّل الدخول إلى حسابك',
    pagePrompt:        'سجّل الدخول إلى حسابك لإتمام الشراء',
    accountLinkPrompt: 'اربط حسابك للمتابعة',
  },
  account: {
    heading:            'حساب Division Resurgence الخاص بك',
    playerIdLabel:      'معرّفك في Division Resurgence',
    instructionsPrefix: 'في تطبيق The Division Resurgence انتقل إلى',
  },
  page: {
    tabs:                  ['الأكثر مبيعًا', '2x رصيد', 'الهدايا', 'المستخدمون الجدد', 'الرصيد'],
    promoTitle:            'حصري على الويب: احصل على 100% رصيد إضافي + هدية مجانية',
    promoAction:           'تسوّق الآن',
    bestSellerDesc:        'الأكثر تفضيلًا لدى المجتمع — أفضل الحزم ومعدات العملاء تقييمًا.',
    doubleCurrencyHeading: '2x رصيد',
    doubleCurrencyDesc:    'احصل على مكافأة <strong>100%</strong> على عناصر مختارة. يمكن شراء كل عنصر مرة واحدة فقط عبر متجر الويب واللعبة.',
    giftsHeading:          'الهدايا',
    giftDailyTitle:        'هدية يومية',
    giftEmoteTitle:        'حركة تعبيرية للعميل',
    giftGunTitle:          'مظهر سلاح SHD',
    giftLimit:             'الحد:1',
    giftClaimHeading:      'استلام الهدية',
    giftClaimLabel:        'أنت على وشك استلام',
    giftClaimCta:          'استلام الهدية',
    giftClaimDoneCta:      'إغلاق',
    giftClaimedHeading:      'تم استلام الهدية',
    giftClaimedBody:         'أُرسلت إلى صندوق الوارد داخل اللعبة.',
    giftClaimedUpsellIntro:  'بما أنك هنا، اطّلع على هذا العرض المخصص لك',
    newUsersHeading:       'عرض العملاء الجدد',
    newUsersDesc:          'احصل على خصم <strong>50%</strong> على أول عملية شراء',
    newUsersSub:           'يمكنك الحصول على عنصر واحد فقط من العناصر أدناه',
    cpDealsHeading:        'العملاء الجدد',
    cpDealsDesc:           'احصل على خصم <strong>50%</strong> على أول عملية شحن للرصيد',
    cpDealsSub:            'يمكنك الحصول على عنصر واحد فقط من العناصر أدناه',
    cpImageSectionDesc:    'احصل على خصم 20% على أول عملية شراء',
  },
}
