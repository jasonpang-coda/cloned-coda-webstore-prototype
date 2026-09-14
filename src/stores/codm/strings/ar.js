/**
 * COD:M — Arabic (ar) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Modern Standard Arabic (MSA). Proper nouns / currency
 * (COD:M, CP, item names) left untranslated. NOTE: Phase 1 renders this LTR — RTL
 * layout mirroring is Phase 2.
 */
export default {
  checkout: {
    actionLabel: 'اشترِ الآن',
  },
  sku: {
    bonusLabel: 'مكافأة الويب',
    bestSeller: 'الأكثر مبيعًا',
    bestValue:  'أفضل قيمة',
    bonusTag:   'مكافأة',
  },
  nav: {
    groups: [{
      label: 'المتجر',
      children: [
        { label: 'الهدايا', anchor: 'cat-gifts' },
        { label: 'CP',      anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'استبدال الرمز', anchor: null }],
  },
  itemSummary: {
    heading:          'ملخص العنصر',
    receiveLabel:     'سوف تحصل على',
    endsLabel:        'ينتهي:',
    taxNote:          'ستتم إضافة الضريبة في الخطوة التالية',
    signedOutMessage: 'سجّل الدخول إلى حساب COD:M لشراء هذا العنصر',
    orLabel:          'أو',
    signInIdCta:      'سجّل الدخول باستخدام معرّف COD:M',
  },
  signIn: {
    cta:           'تسجيل الدخول',
    openingApp:    'جارٍ فتح تطبيق COD:M…',
    qrInstruction: 'امسح رمز QR هذا بجهاز محمول مسجّل الدخول إلى حساب COD:M الخاص بك',
    pagePrompt:    'سجّل الدخول إلى حسابك لإتمام الشراء',
  },
  account: {
    heading:            'حساب COD:M الخاص بك',
    playerIdLabel:      'معرّف اللاعب في COD:M',
    instructionsPrefix: 'في تطبيق COD:M انتقل إلى',
    disclosureLabel:      'كيفية العثور على حساب COD:M الخاص بك',
    viewImageInstructions: 'عرض التعليمات بالصور',
    chips: [
      {
        id: 'uid', label: 'العثور على UID',
        lines: [
          { type: 'text', content: 'UID: يتكوّن معرّفك من 19 إلى 20 رقمًا' },
          { type: 'para', content: 'في تطبيق COD:M انتقل إلى\n  •  الملف الشخصي للاعب > أساسي' },
        ],
      },
      {
        id: 'player-id', label: 'العثور على معرّف اللاعب',
        lines: [
          { type: 'text', content: 'معرّف اللاعب: معرّف رقمي أقصر لحسابك' },
          { type: 'para', content: 'في تطبيق COD:M انتقل إلى\n  •  الملف الشخصي للاعب > أساسي' },
        ],
      },
      {
        id: 'nickname', label: 'العثور على اللقب',
        lines: [
          { type: 'text', content: 'اللقب: اسم العرض الخاص بك داخل اللعبة' },
          { type: 'para', content: 'في تطبيق COD:M انتقل إلى\n  •  الملف الشخصي للاعب > أساسي' },
        ],
      },
    ],
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
    tabs:                  ['الأكثر مبيعًا', '2x CP', 'الهدايا', 'المستخدمون الجدد', 'CP', 'المستخدمون الجدد (صورة)', 'CP (صورة)'],
    giftTagLabel:          'هدية مجانية',
    giftEndsLabel:         'ينتهي:',
    giftRefreshesLabel:    'يتجدد:',
    promoTitle:            'حصري على الويب: احصل على 100% مكافأة CP + هدية مجانية',
    promoAction:           'تسوّق الآن',
    bestSellerDesc:        'الأكثر تفضيلًا لدى المجتمع — أفضل الحزم ومعدات المحاربين تقييمًا.',
    doubleCurrencyDesc:    'احصل على مكافأة <strong>100%</strong> على عناصر مختارة. يمكن شراء كل عنصر مرة واحدة فقط عبر متجر الويب واللعبة.',
    giftsHeading:          'الهدايا',
    giftDailyTitle:        'هدية يومية',
    giftDailySub:          'صندوق سري ملحمي',
    giftLimit:             'الحد:1',
    giftClaimHeading:      'استلام الهدية',
    giftClaimLabel:        'أنت على وشك استلام',
    giftClaimCta:          'استلام الهدية',
    giftClaimDoneCta:      'إغلاق',
    giftClaimedSnackTitle: 'تم استلام الهدية',
    giftClaimedSnackBody:  'أُرسلت إلى صندوق وارد COD:M',
    giftClaimedHeading:    'تم استلام الهدية',
    giftClaimedBody:       'أُرسلت إلى صندوق وارد COD:M.',
    giftClaimedUpsellIntro:'بما أنك هنا، اطّلع على هذا العرض المخصص لك',
    newUsersHeading:       'عرض المستخدمين الجدد',
    newUsersDesc:          'احصل على خصم <strong>50%</strong> على أول عملية شراء',
    newUsersSub:           'يمكنك الحصول على عنصر واحد فقط من العناصر أدناه',
    cpDealsHeading:        'المستخدمون الجدد (صورة)',
    cpDealsDesc:           'احصل على خصم <strong>50%</strong> على أول شحن CP',
    cpDealsSub:            'يمكنك الحصول على عنصر واحد فقط من العناصر أدناه',
    cpImageSection:        'CP (صورة)',
  },
}
