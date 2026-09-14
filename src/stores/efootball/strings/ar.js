/**
 * eFootball™ — Arabic (ar) copy. PARTIAL override of ../store.js `strings`;
 * omitted keys fall back to English. Modern Standard Arabic (MSA). Proper nouns /
 * currency (eFootball, eFootball Coins, myKONAMI, KONAMI ID) left untranslated.
 * Arrays (nav, page.tabs) must be supplied whole. NOTE: Phase 1 renders this LTR —
 * RTL layout mirroring is Phase 2.
 */
export default {
  checkout: {
    actionLabel: 'إتمام الشراء',
  },
  sku: {
    bonusLabel: 'مكافأة العملات',
    bestSeller: 'الأكثر مبيعًا',
    bestValue:  'أفضل قيمة',
  },
  nav: {
    groups: [{
      label: 'المتجر',
      children: [
        { label: 'الشحن',          anchor: 'top-ups' },
        { label: 'حزم العملات',    anchor: 'coin-packs' },
        { label: 'عروض خاصة',      anchor: 'special-offers' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'سجّل الدخول لإتمام الشراء',
    accountLinkPrompt: 'كيفية ربط حساب اللعبة بمعرّف KONAMI ID الخاص بك',
    mykonami: {
      cta:        'تسجيل الدخول عبر KONAMI ID',
      pagePrompt: 'سجّل الدخول إلى حساب myKONAMI لإتمام الشراء',
      openingApp: 'جارٍ فتح myKONAMI…',
    },
    efootball: {
      cta:           'تسجيل الدخول عبر eFootball',
      openingApp:    'جارٍ فتح eFootball™…',
      qrInstruction: 'امسح رمز QR هذا بجهاز محمول مسجّل الدخول إلى حساب eFootball™ الخاص بك',
      pagePrompt:    'سجّل الدخول إلى حساب eFootball™ لإتمام الشراء',
    },
  },
  account: {
    heading:            'حساب eFootball™ الخاص بك',
    playerIdLabel:      'معرّف اللاعب في eFootball™',
    instructionsPrefix: 'في تطبيق eFootball™ انتقل إلى',
    playerCardLabel:    'ملف اللاعب',
  },
  page: {
    tabs:        ['الشحن', 'حزم العملات', 'عروض خاصة'],
    promoTitle:  'حصري على الويب: احصل على مكافأة eFootball Coins',
    promoAction: 'تسوّق الآن',
  },
}
