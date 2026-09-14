/**
 * TDR — Traditional Chinese (zh-Hant) copy. PARTIAL override of ../store.js
 * `strings`; omitted keys fall back to English. HK/TW standard forms only (no
 * Simplified). Proper nouns / brand / currency (The Division Resurgence, SHD,
 * Agent, Premium Credits/PC, in-game item names) left untranslated. Concise UI
 * voice.
 */
export default {
  checkout: {
    actionLabel: '立即購買',
  },
  sku: {
    bonusLabel: '網頁專屬獎勵',
    bestSeller: '熱銷商品',
    bestValue:  '超值之選',
  },
  nav: {
    groups: [{
      label: '商店',
      children: [
        { label: '禮物', anchor: 'cat-gifts' },
        { label: '點數', anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: '兌換代碼', anchor: null }],
  },
  signIn: {
    cta:               '使用 The Division 登入',
    openingApp:        '正在開啟 The Division Resurgence…',
    qrInstruction:     '請使用已登入帳號的行動裝置掃描此 QR code',
    pagePrompt:        '登入帳號以進行購買',
    accountLinkPrompt: '連結帳號以繼續',
  },
  account: {
    heading:            '你的 Division Resurgence 帳號',
    playerIdLabel:      '你的 Division Resurgence ID',
    instructionsPrefix: '在 The Division Resurgence 應用程式中前往',
  },
  page: {
    tabs:                  ['熱銷商品', '2倍點數', '禮物', '新玩家', '點數'],
    promoTitle:            '網頁專屬:獲得 100% 額外點數 + 免費禮物',
    promoAction:           '立即購買',
    bestSellerDesc:        '社群最愛 — 評價最高的組合包與探員裝備。',
    doubleCurrencyHeading: '2倍點數',
    doubleCurrencyDesc:    '選定商品可獲得 <strong>100%</strong> 額外獎勵。每項商品在網頁商店與遊戲內僅能購買一次。',
    giftsHeading:          '禮物',
    giftDailyTitle:        '每日禮物',
    giftEmoteTitle:        '探員動作',
    giftGunTitle:          'SHD 武器造型',
    giftLimit:             '限制:1',
    giftClaimHeading:      '領取禮物',
    giftClaimLabel:        '你即將領取',
    giftClaimCta:          '領取禮物',
    giftClaimDoneCta:      '關閉',
    giftClaimedHeading:      '已領取禮物',
    giftClaimedBody:         '已送至你的遊戲內收件匣。',
    giftClaimedUpsellIntro:  '既然來了,來看看專屬於你的優惠',
    newUsersHeading:       '新探員優惠',
    newUsersDesc:          '首次購買享 <strong>50%</strong> 折扣',
    newUsersSub:           '以下商品僅能選購 1 項',
    cpDealsHeading:        '新探員',
    cpDealsDesc:           '首次儲值點數享 <strong>50%</strong> 折扣',
    cpDealsSub:            '以下商品僅能選購 1 項',
    cpImageSectionDesc:    '首次購買享 20% 折扣',
  },
}
