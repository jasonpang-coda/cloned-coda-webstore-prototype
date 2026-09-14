/**
 * Rogue Trader — Traditional Chinese (zh-Hant) copy. PARTIAL override of ../store.js
 * `strings`; any key omitted here falls back to English. HK/TW standard forms only
 * (no Simplified). Proper nouns / brand / currency (Warhammer 40K, Rogue Trader,
 * Voidfarer, Profit Factor / PF, item & edition names) left untranslated. Arrays
 * (nav, page.tabs) supplied whole.
 * Voice: neutral, clean commerce UI (Codashop) — concise, action-oriented.
 */
export default {
  checkout: {
    actionLabel: '取得',
  },
  sku: {
    bonusLabel: '委任令獎勵',
    bestSeller: '最受歡迎',
    bestValue:  '超值之選',
  },
  nav: {
    groups: [{
      label: '商店',
      children: [
        { label: '遊戲與版本', anchor: 'cat-games' },
        { label: 'DLC',      anchor: 'cat-dlc' },
      ],
    }],
    items: [{ label: '兌換代碼', anchor: null }],
  },
  signIn: {
    cta:               '登入',
    openingApp:        '正在開啟 Rogue Trader…',
    qrInstruction:     '請使用已登入你帳戶的行動裝置掃描此 QR code',
    pagePrompt:        '登入你的帳戶以進行購買',
    accountLinkPrompt: '連結你的帳戶以繼續',
  },
  account: {
    heading:            '你的 Rogue Trader Warrant',
    playerIdLabel:      '你的 Rogue Trader ID',
    instructionsPrefix: '在 Rogue Trader 應用程式中前往',
  },
  page: {
    tabs:                  ['遊戲與版本', 'DLC'],
    promoTitle:            'WARRANT OF TRADE：入手 VOIDFARER EDITION',
    promoAction:           '立即購買',
    bestSellerDesc:        'Expanse 中最受追捧的版本與委任補給。',
    doubleCurrencyDesc:    '選定委任令可獲得 <strong>100%</strong> 獎勵。',
    giftsHeading:          '貢品',
    giftDailyTitle:        '每日貢品',
    giftDailySub:          'Relic Cache',
    giftLimit:             '限量:1',
    giftClaimHeading:      '領取貢品',
    giftClaimLabel:        '你即將領取',
    giftClaimCta:          '領取貢品',
    giftClaimDoneCta:      '關閉',
    giftClaimedHeading:      '已領取貢品',
    giftClaimedBody:         '已送至你的遊戲內寶庫。',
    giftClaimedUpsellIntro:  '既然你掌管這艘艦橋，不妨看看這份委任令',
    newUsersHeading:       '新 VOIDFARERS 委任令',
    newUsersDesc:          '首次購買可享 <strong>50%</strong> 折扣',
    newUsersSub:           '你只能從以下項目中領取 1 份委任令',
    cpDealsHeading:        '新晉 Voidfarers',
    cpDealsDesc:           '首次 Profit Factor 委任令可享 <strong>50%</strong> 折扣',
    cpDealsSub:            '你只能從以下項目中領取 1 份委任令',
    cpImageSectionDesc:    '取得 Profit Factor 以擴展你王朝的勢力',
  },
}
