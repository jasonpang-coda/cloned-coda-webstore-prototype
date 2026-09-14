/**
 * FC Mobile — Arabic (ar) copy. PARTIAL override of ../store.js `strings`;
 * omitted keys fall back to English. Modern Standard Arabic (MSA). Proper nouns /
 * currency (FC Mobile, EA Sports FC™, FC Points, FC, MP, item names) left
 * untranslated. NOTE: Phase 1 renders this LTR — RTL layout mirroring is a
 * later phase.
 */
export default {
  checkout: {
    actionLabel: 'إتمام الشراء',
  },
  sku: {
    bonusLabel: 'مكافأة FC Points',
    bestSeller: 'الأكثر مبيعًا',
    bestValue:  'أفضل قيمة',
  },
  nav: {
    groups: [{
      label: 'المتجر',
      children: [
        { label: 'الإمدادات اليومية', anchor: 'daily-supplies' },
        { label: 'العروض المحدودة',   anchor: 'limited-offers' },
        { label: 'الشحن',            anchor: 'top-ups' },
      ],
    }],
    items: [],
  },
  signIn: {
    cta:           'تسجيل الدخول',
    openingApp:    'جارٍ فتح EA Sports FC<sup>TM</sup> Mobile…',
    qrInstruction: 'امسح رمز QR هذا بجهاز محمول مسجّل الدخول إلى حساب EA Sports FC<sup>TM</sup> Mobile الخاص بك',
    pagePrompt:    'سجّل الدخول إلى حسابك لإتمام الشراء',
  },
  account: {
    heading:            'حساب FC Mobile الخاص بك',
    playerIdLabel:      'معرّف اللاعب في FC Mobile',
    instructionsPrefix: 'في تطبيق FC Mobile انتقل إلى',
    playerCardLabel:    'الملف الشخصي للاعب',
  },
  transactionHistory: {
    title:       'سجل المعاملات',
    popoverLink: 'سجل المعاملات',
    filterLabel: 'تصفية المعاملات',
    ranges: { d7: 'آخر 7 أيام', d30: 'آخر 30 يومًا', d90: 'آخر 90 يومًا' },
    row: {
      paymentStatus: 'حالة الدفع',
      orderId:       'رقم الطلب',
      transactionId: 'رقم المعاملة',
      paymentMethod: 'طريقة الدفع',
      totalPayment:  'إجمالي الدفع',
      noCharge:      'لم يتم أي خصم',
    },
    status: { fulfilled: 'مكتمل', pending: 'قيد التنفيذ', failed: 'فشل' },
    empty:  'لا توجد معاملات في هذه الفترة.',
  },
  page: {
    tabs:                  ['الأكثر مبيعًا', '2x FC Points', 'المستخدمون الجدد', 'FC Points'],
    promoTitle:            'حصري على الويب: احصل على FC Points إضافية + هدية مجانية',
    promoAction:           'تسوّق الآن',
    doubleCurrencyHeading: '2x FC Points',
    doubleCurrencyDesc:    'احصل على مكافأة <strong>100%</strong> على عناصر مختارة. يمكن شراء كل عنصر مرة واحدة فقط عبر متجر الويب واللعبة.',
    newUsersHeading:       'عرض المستخدمين الجدد',
    newUsersDesc:          'احصل على خصم <strong>50%</strong> على أول عملية شراء',
    newUsersSub:           'يمكنك الحصول على عنصر واحد فقط من العناصر أدناه',
    currencySection:       'FC Points',
    giftsHeading:          'الهدايا',
    giftLimit:             'الحد: 1',
    giftClaimHeading:      'استلام الهدية',
    giftClaimLabel:        'أنت على وشك استلام',
    giftClaimCta:          'استلام الهدية',
    giftClaimDoneCta:      'إغلاق',
    giftClaimedHeading:    'تم استلام الهدية',
    giftClaimedBody:       'أُرسلت إلى حساب FC Mobile الخاص بك.',
    giftClaimedUpsellIntro: 'بما أنك هنا، اطّلع على هذا العرض المخصص لك',
  },
}
