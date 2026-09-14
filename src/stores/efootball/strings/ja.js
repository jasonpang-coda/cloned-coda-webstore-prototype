/**
 * eFootball™ — Japanese (ja) copy. PARTIAL override of ../store.js `strings`; any
 * key omitted here falls back to English. Proper nouns / currency (eFootball,
 * eFootball Coins, myKONAMI, KONAMI ID) are intentionally left untranslated.
 * Arrays (nav, page.tabs) must be supplied whole. Voice: natural JP UI register.
 */
export default {
  checkout: {
    actionLabel: '購入手続きへ',
  },
  sku: {
    bonusLabel: 'コインボーナス',
    bestSeller: 'ベストセラー',
    bestValue:  'お買い得',
  },
  nav: {
    groups: [{
      label: 'ストア',
      children: [
        { label: 'チャージ',   anchor: 'top-ups' },
        { label: 'コインパック', anchor: 'coin-packs' },
        { label: '特別オファー', anchor: 'special-offers' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        '購入するにはサインインしてください',
    accountLinkPrompt: 'KONAMI IDとゲームアカウントを連携する方法',
    mykonami: {
      cta:        'KONAMI IDでサインイン',
      pagePrompt: '購入するにはmyKONAMIアカウントにサインインしてください',
      openingApp: 'myKONAMIを起動中…',
    },
    efootball: {
      cta:           'eFootballでサインイン',
      openingApp:    'eFootball™を起動中…',
      qrInstruction: 'eFootball™アカウントにログイン済みのモバイル端末でこのQRコードをスキャンしてください',
      pagePrompt:    '購入するにはeFootball™アカウントにサインインしてください',
    },
  },
  account: {
    heading:            'あなたのeFootball™アカウント',
    playerIdLabel:      'eFootball™プレイヤーID',
    instructionsPrefix: 'eFootball™アプリで次の場所へ',
    playerCardLabel:    'プレイヤープロフィール',
  },
  page: {
    tabs:        ['チャージ', 'コインパック', '特別オファー'],
    promoTitle:  'ウェブ限定:ボーナスeFootball Coinsをゲット',
    promoAction: '今すぐ購入',
  },
}
