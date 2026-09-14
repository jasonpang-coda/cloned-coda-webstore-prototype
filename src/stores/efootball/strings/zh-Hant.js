/**
 * eFootball™ — Traditional Chinese (zh-Hant) copy. PARTIAL override of
 * ../store.js `strings`; omitted keys fall back to English. HK/TW standard forms
 * (no Simplified). Proper nouns / currency (eFootball, eFootball Coins, myKONAMI,
 * KONAMI ID) left untranslated. Arrays (nav, page.tabs) must be supplied whole.
 */
export default {
  checkout: {
    actionLabel: '前往結帳',
  },
  sku: {
    bonusLabel: '代幣獎勵',
    bestSeller: '暢銷商品',
    bestValue:  '超值優惠',
  },
  nav: {
    groups: [{
      label: '商店',
      children: [
        { label: '儲值',   anchor: 'top-ups' },
        { label: '代幣包', anchor: 'coin-packs' },
        { label: '特別優惠', anchor: 'special-offers' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        '登入以購買',
    accountLinkPrompt: '如何將你的遊戲帳號與 KONAMI ID 連結',
    mykonami: {
      cta:        '使用 KONAMI ID 登入',
      pagePrompt: '登入你的 myKONAMI 帳號以購買',
      openingApp: '正在開啟 myKONAMI…',
    },
    efootball: {
      cta:           '使用 eFootball 登入',
      openingApp:    '正在開啟 eFootball™…',
      qrInstruction: '請使用已登入 eFootball™ 帳號的行動裝置掃描此 QR code',
      pagePrompt:    '登入你的 eFootball™ 帳號以購買',
    },
  },
  account: {
    heading:            '你的 eFootball™ 帳號',
    playerIdLabel:      '你的 eFootball™ 玩家 ID',
    instructionsPrefix: '在 eFootball™ 應用程式中前往',
    playerCardLabel:    '玩家檔案',
  },
  page: {
    tabs:        ['儲值', '代幣包', '特別優惠'],
    promoTitle:  '網頁限定:獲得 eFootball Coins 獎勵',
    promoAction: '立即購買',
  },
}
