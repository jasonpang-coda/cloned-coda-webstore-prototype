/**
 * commonStrings — shared, store-agnostic UI chrome copy, localised per language.
 *
 * Sibling to uiStrings.js (which is just the region/language selector chrome).
 * This dictionary holds app-wide chrome that is identical across all stores —
 * checkout sheet, sign-in sheet, account popover, nav drawer, carousels — so it
 * lives here once rather than duplicated into every store's `strings` block.
 *
 * Consumed via useLocale().common (deep-merged over the `en` base per key, so any
 * missing key falls back to English). Store-specific / brand copy still lives in
 * each store module's `strings` (read via useStoreStrings) — NOT here.
 *
 * Keys are language codes from ./languages.js. Brand/proper nouns (payment-provider
 * names, Coda) are intentionally NOT keyed here — they stay as literals in the
 * component. Covers EN + the 8 Phase-1 languages; extend as more locales ship.
 */
export const COMMON_STRINGS = {
  en: {
    checkout: {
      orderSummary:  'Order Summary',
      itemInfo:      'Item Info',
      selectPayment: 'Select Payment',
      subtotal:      'Subtotal',
      poweredBy:     'Powered by',
      cardPayments:  'Card Payments',
      // FCM Buy Now pilot (fcmPaymentSheet flag) — sticky bar CTA, its T&C
      // link, and the full sheet's disabled-CTA label before a channel is picked.
      buyNow:            'Buy Now',
      buyNowTerms:       'View Buy Now Terms & Conditions',
      selectPaymentCta:  'Select Payment',
      // Payment sheet's legal bar (below the PC list) + the footer's link
      // that scrolls to it. termsHeading is store-agnostic; termsBody names a
      // specific publisher/EULA, so it is NOT common — each store overrides
      // it in its own strings.checkout.termsBody (see e.g. stores/fcm/store.js,
      // stores/codm/store.js). termsBodyGeneric is the neutral fallback for
      // any store that hasn't defined one yet — it must never name a company.
      termsHeading: 'Terms and Conditions',
      termsBodyGeneric:
        'By clicking "Checkout", I acknowledge that the purchase of this virtual item will be a license for its use, subject to this store\'s Terms & Conditions and Privacy Notice.\n\nI understand and agree that all sales are final and non-refundable.',
      viewTerms:    'View Terms and Conditions',
      // OrderSummarySheet's expanded accordion line items.
      accountLabel:      'Player Nickname',
      itemPrice:         'Item Price',
      tax:               'Tax',
      total:             'Total',
      totalPayment:      'Total Payment',
      // Promo Code mini-accordion (OrderSummarySheet) — collapsed/expanded/
      // success/error states, its discount line, and the T&C details modal
      // it opens once a code is applied.
      promoCodeLabel:        'Have a promo code?',
      promoCodeAppliedLabel: 'Promo Code Applied',
      promoPlaceholder:      'Enter promo code',
      promoApply:            'Apply',
      promoHelper:           'Choose a payment method to apply the promo code',
      promoInvalid:          'Invalid promo code',
      promoSuccess:          'SUCCESS',
      promoViewTerms:        'Tap to see terms and conditions',
      promoDiscountLabel:    'Promo Discount',
      promoDetailsTitle:     'Promo Code Details',
      promoDetailsHeading:   'Promo Details:',
      promoDetailsBody:      'Save 10% on this purchase with a valid promo code.',
      promoTermsHeading:     'Terms & Conditions',
      promoTermsBody:        'Promo codes are single-use, non-transferable, and cannot be combined with other offers. Coda reserves the right to modify or withdraw a promotion at any time.',
      promoClose:            'Close',
    },
    signIn: {
      sheetTitle:         'Sign in',
      orSeparator:        'Or',
      guestCta:           'Check out as a guest',
      followInstructions: 'Follow the instructions in the app',
      willUpdate:         "This screen will update once you're signed in",
      userCodeLabel:      'User Code',
      cancelSignIn:       'Cancel sign in',
      snackbarTitle:      'Signed in',
      welcomePrefix:      'Welcome,',
    },
    account: {
      popoverTitle: 'Your account',
      signOut:      'Sign out',
    },
    nav: {
      drawerTitle: 'Menu',
    },
    carousel: {
      bestSellers: 'BEST SELLERS',
      eventEndsIn: 'Event ends in:',
    },
    sku: {
      limitLabel:     'Limit: 1',
      endsLabel:      'Ends:',
      refreshesLabel: 'Refreshes:',
    },
    footer: {
      needHelpLabel:   'Need Help?',
      regionLabel:     'Region',
      copyrightSuffix: 'Coda Payments Pte. Ltd. All Rights Reserved.',
    },
  },

  ja: {
    checkout: {
      orderSummary:  '注文内容',
      itemInfo:      'アイテム情報',
      selectPayment: '支払い方法を選択',
      subtotal:      '小計',
      poweredBy:     '提供:',
      cardPayments:  'カード決済',
      buyNow:            '今すぐ購入',
      buyNowTerms:       '購入に関する利用規約を見る',
      selectPaymentCta:  '支払い方法を選択',
      accountLabel:      'プレイヤーニックネーム',
      itemPrice:         '商品価格',
      tax:               '税金',
      total:             '合計',
    },
    signIn: {
      sheetTitle:         'サインイン',
      orSeparator:        'または',
      guestCta:           'ゲストとして購入',
      followInstructions: 'アプリの手順に従ってください',
      willUpdate:         'サインインが完了すると、この画面は自動的に更新されます',
      userCodeLabel:      'ユーザーコード',
      cancelSignIn:       'サインインをキャンセル',
      snackbarTitle:      'サインインしました',
      welcomePrefix:      'ようこそ、',
    },
    account: {
      popoverTitle: 'アカウント',
      signOut:      'サインアウト',
    },
    nav: {
      drawerTitle: 'メニュー',
    },
    carousel: {
      bestSellers: 'ベストセラー',
      eventEndsIn: '終了まで:',
    },
    sku: {
      limitLabel:     '制限:1',
      endsLabel:      '終了:',
      refreshesLabel: '更新:',
    },
  },

  pt: {
    checkout: {
      orderSummary:  'Resumo do pedido',
      itemInfo:      'Detalhes do item',
      selectPayment: 'Escolha o pagamento',
      subtotal:      'Subtotal',
      poweredBy:     'Fornecido por',
      cardPayments:  'Pagamentos com cartão',
      buyNow:            'Comprar agora',
      buyNowTerms:       'Ver Termos e Condições de Compra',
      selectPaymentCta:  'Escolha o pagamento',
      accountLabel:      'Nickname do jogador',
      itemPrice:         'Preço do item',
      tax:               'Imposto',
      total:             'Total',
    },
    signIn: {
      sheetTitle:         'Entrar',
      orSeparator:        'Ou',
      guestCta:           'Comprar como convidado',
      followInstructions: 'Siga as instruções no aplicativo',
      willUpdate:         'Esta tela será atualizada assim que você entrar',
      userCodeLabel:      'Código do usuário',
      cancelSignIn:       'Cancelar login',
      snackbarTitle:      'Login realizado',
      welcomePrefix:      'Bem-vindo,',
    },
    account: {
      popoverTitle: 'Sua conta',
      signOut:      'Sair',
    },
    nav: {
      drawerTitle: 'Menu',
    },
    carousel: {
      bestSellers: 'MAIS VENDIDOS',
      eventEndsIn: 'Termina em:',
    },
    sku: {
      limitLabel:     'Limite: 1',
      endsLabel:      'Termina:',
      refreshesLabel: 'Renova:',
    },
  },

  es: {
    checkout: {
      orderSummary:  'Resumen del pedido',
      itemInfo:      'Detalles del artículo',
      selectPayment: 'Elige el pago',
      subtotal:      'Subtotal',
      poweredBy:     'Con tecnología de',
      cardPayments:  'Pagos con tarjeta',
      buyNow:            'Comprar ahora',
      buyNowTerms:       'Ver Términos y Condiciones de Compra',
      selectPaymentCta:  'Elige el pago',
      accountLabel:      'Apodo del jugador',
      itemPrice:         'Precio del artículo',
      tax:               'Impuesto',
      total:             'Total',
    },
    signIn: {
      sheetTitle:         'Iniciar sesión',
      orSeparator:        'O',
      guestCta:           'Comprar como invitado',
      followInstructions: 'Sigue las instrucciones en la app',
      willUpdate:         'Esta pantalla se actualizará una vez que inicies sesión',
      userCodeLabel:      'Código de usuario',
      cancelSignIn:       'Cancelar inicio de sesión',
      snackbarTitle:      'Sesión iniciada',
      welcomePrefix:      'Bienvenido,',
    },
    account: {
      popoverTitle: 'Tu cuenta',
      signOut:      'Cerrar sesión',
    },
    nav: {
      drawerTitle: 'Menú',
    },
    carousel: {
      bestSellers: 'MÁS VENDIDOS',
      eventEndsIn: 'Termina en:',
    },
    sku: {
      limitLabel:     'Límite: 1',
      endsLabel:      'Termina:',
      refreshesLabel: 'Se renueva:',
    },
  },

  ar: {
    checkout: {
      orderSummary:  'ملخص الطلب',
      itemInfo:      'تفاصيل العنصر',
      selectPayment: 'اختر طريقة الدفع',
      subtotal:      'المجموع الفرعي',
      poweredBy:     'مشغّل بواسطة',
      cardPayments:  'الدفع بالبطاقة',
      buyNow:            'الشراء الآن',
      buyNowTerms:       'عرض شروط وأحكام الشراء الآن',
      selectPaymentCta:  'اختر طريقة الدفع',
      accountLabel:      'اسم اللاعب',
      itemPrice:         'سعر العنصر',
      tax:               'الضريبة',
      total:             'الإجمالي',
    },
    signIn: {
      sheetTitle:         'تسجيل الدخول',
      orSeparator:        'أو',
      guestCta:           'الشراء كضيف',
      followInstructions: 'اتبع التعليمات في التطبيق',
      willUpdate:         'ستتحدث هذه الشاشة بمجرد تسجيل الدخول',
      userCodeLabel:      'رمز المستخدم',
      cancelSignIn:       'إلغاء تسجيل الدخول',
      snackbarTitle:      'تم تسجيل الدخول',
      welcomePrefix:      'مرحبًا،',
    },
    account: {
      popoverTitle: 'حسابك',
      signOut:      'تسجيل الخروج',
    },
    nav: {
      drawerTitle: 'القائمة',
    },
    carousel: {
      bestSellers: 'الأكثر مبيعًا',
      eventEndsIn: 'ينتهي خلال:',
    },
    sku: {
      limitLabel:     'الحد: 1',
      endsLabel:      'ينتهي:',
      refreshesLabel: 'يتجدد:',
    },
  },

  'zh-Hant': {
    checkout: {
      orderSummary:  '訂單摘要',
      itemInfo:      '商品資訊',
      selectPayment: '選擇付款方式',
      subtotal:      '小計',
      poweredBy:     '技術支援',
      cardPayments:  '卡片付款',
      buyNow:            '立即購買',
      buyNowTerms:       '查看立即購買條款與條件',
      selectPaymentCta:  '選擇付款方式',
      accountLabel:      '玩家暱稱',
      itemPrice:         '商品價格',
      tax:               '稅金',
      total:             '總計',
    },
    signIn: {
      sheetTitle:         '登入',
      orSeparator:        '或',
      guestCta:           '以訪客身分結帳',
      followInstructions: '請依照應用程式中的指示操作',
      willUpdate:         '登入完成後，此畫面將自動更新',
      userCodeLabel:      '使用者代碼',
      cancelSignIn:       '取消登入',
      snackbarTitle:      '登入成功',
      welcomePrefix:      '歡迎，',
    },
    account: {
      popoverTitle: '你的帳戶',
      signOut:      '登出',
    },
    nav: {
      drawerTitle: '選單',
    },
    carousel: {
      bestSellers: '熱銷商品',
      eventEndsIn: '活動倒數:',
    },
    sku: {
      limitLabel:     '限購:1',
      endsLabel:      '結束:',
      refreshesLabel: '重置:',
    },
  },

  th: {
    checkout: {
      orderSummary:  'สรุปคำสั่งซื้อ',
      itemInfo:      'ข้อมูลไอเทม',
      selectPayment: 'เลือกการชำระเงิน',
      subtotal:      'ยอดรวมย่อย',
      poweredBy:     'ให้บริการโดย',
      cardPayments:  'ชำระด้วยบัตร',
      buyNow:            'ซื้อเลย',
      buyNowTerms:       'ดูข้อกำหนดและเงื่อนไขการซื้อเลย',
      selectPaymentCta:  'เลือกการชำระเงิน',
      accountLabel:      'ชื่อเล่นผู้เล่น',
      itemPrice:         'ราคาไอเทม',
      tax:               'ภาษี',
      total:             'ยอดรวม',
    },
    signIn: {
      sheetTitle:         'เข้าสู่ระบบ',
      orSeparator:        'หรือ',
      guestCta:           'ชำระเงินแบบผู้เยี่ยมชม',
      followInstructions: 'ทำตามคำแนะนำในแอป',
      willUpdate:         'หน้าจอนี้จะอัปเดตเมื่อคุณเข้าสู่ระบบสำเร็จ',
      userCodeLabel:      'รหัสผู้ใช้',
      cancelSignIn:       'ยกเลิกการเข้าสู่ระบบ',
      snackbarTitle:      'เข้าสู่ระบบสำเร็จ',
      welcomePrefix:      'ยินดีต้อนรับ,',
    },
    account: {
      popoverTitle: 'บัญชีของคุณ',
      signOut:      'ออกจากระบบ',
    },
    nav: {
      drawerTitle: 'เมนู',
    },
    carousel: {
      bestSellers: 'ขายดีที่สุด',
      eventEndsIn: 'อีเวนต์สิ้นสุดใน:',
    },
    sku: {
      limitLabel:     'จำกัด: 1',
      endsLabel:      'สิ้นสุด:',
      refreshesLabel: 'รีเซ็ต:',
    },
  },

  id: {
    checkout: {
      orderSummary:  'Ringkasan Pesanan',
      itemInfo:      'Info Item',
      selectPayment: 'Pilih Pembayaran',
      subtotal:      'Subtotal',
      poweredBy:     'Didukung oleh',
      cardPayments:  'Pembayaran Kartu',
      buyNow:            'Beli Sekarang',
      buyNowTerms:       'Lihat Syarat & Ketentuan Beli Sekarang',
      selectPaymentCta:  'Pilih Pembayaran',
      accountLabel:      'Nama Panggilan Pemain',
      itemPrice:         'Harga Item',
      tax:               'Pajak',
      total:             'Total',
    },
    signIn: {
      sheetTitle:         'Masuk',
      orSeparator:        'Atau',
      guestCta:           'Checkout sebagai tamu',
      followInstructions: 'Ikuti petunjuk di aplikasi',
      willUpdate:         'Layar ini akan diperbarui setelah Anda masuk',
      userCodeLabel:      'Kode Pengguna',
      cancelSignIn:       'Batalkan masuk',
      snackbarTitle:      'Berhasil masuk',
      welcomePrefix:      'Selamat datang,',
    },
    account: {
      popoverTitle: 'Akun Anda',
      signOut:      'Keluar',
    },
    nav: {
      drawerTitle: 'Menu',
    },
    carousel: {
      bestSellers: 'TERLARIS',
      eventEndsIn: 'Event berakhir dalam:',
    },
    sku: {
      limitLabel:     'Batas: 1',
      endsLabel:      'Berakhir:',
      refreshesLabel: 'Diperbarui:',
    },
  },

  ko: {
    checkout: {
      orderSummary:  '주문 요약',
      itemInfo:      '아이템 정보',
      selectPayment: '결제 수단 선택',
      subtotal:      '소계',
      poweredBy:     '제공:',
      cardPayments:  '카드 결제',
      buyNow:            '지금 구매',
      buyNowTerms:       '지금 구매 이용약관 보기',
      selectPaymentCta:  '결제 수단 선택',
      accountLabel:      '플레이어 닉네임',
      itemPrice:         '상품 가격',
      tax:               '세금',
      total:             '합계',
    },
    signIn: {
      sheetTitle:         '로그인',
      orSeparator:        '또는',
      guestCta:           '비회원으로 결제',
      followInstructions: '앱의 안내를 따라주세요',
      willUpdate:         '로그인이 완료되면 이 화면이 자동으로 업데이트됩니다',
      userCodeLabel:      '사용자 코드',
      cancelSignIn:       '로그인 취소',
      snackbarTitle:      '로그인 완료',
      welcomePrefix:      '환영합니다,',
    },
    account: {
      popoverTitle: '내 계정',
      signOut:      '로그아웃',
    },
    nav: {
      drawerTitle: '메뉴',
    },
    carousel: {
      bestSellers: '베스트셀러',
      eventEndsIn: '이벤트 종료까지:',
    },
    sku: {
      limitLabel:     '한정: 1',
      endsLabel:      '종료:',
      refreshesLabel: '갱신:',
    },
  },
}
