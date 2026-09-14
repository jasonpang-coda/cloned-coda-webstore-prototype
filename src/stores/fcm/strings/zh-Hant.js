/**
 * FC Mobile — Traditional Chinese (zh-Hant, HK/TW) copy. PARTIAL override of
 * ../store.js `strings`; omitted keys fall back to English. Traditional Chinese
 * forms only (no Simplified). Proper nouns / currency (FC Mobile, EA Sports FC™,
 * FC Points, FC, MP, item names) left untranslated. Arrays supplied whole.
 */
export default {
  checkout: {
    actionLabel: '前往結帳',
  },
  sku: {
    bonusLabel: 'FC Points 獎勵',
    bestSeller: '熱銷商品',
    bestValue:  '超值優惠',
  },
  nav: {
    groups: [{
      label: '商店',
      children: [
        { label: '每日補給', anchor: 'daily-supplies' },
        { label: '限時優惠', anchor: 'limited-offers' },
        { label: '儲值',    anchor: 'top-ups' },
      ],
    }],
    items: [],
  },
  signIn: {
    cta:           '登入',
    openingApp:    '正在開啟 EA Sports FC<sup>TM</sup> Mobile…',
    qrInstruction: '請使用已登入 EA Sports FC<sup>TM</sup> Mobile 帳號的行動裝置掃描此 QR code',
    pagePrompt:    '請登入你的帳號以進行購買',
  },
  account: {
    heading:            '你的 FC Mobile 帳號',
    playerIdLabel:      'FC Mobile 玩家 ID',
    instructionsPrefix: '在 FC Mobile 應用程式中前往',
    playerCardLabel:    '玩家檔案',
  },
  transactionHistory: {
    title:       '交易紀錄',
    popoverLink: '交易紀錄',
    filterLabel: '篩選交易',
    ranges: { d7: '過去 7 天', d30: '過去 30 天', d90: '過去 90 天' },
    row: {
      paymentStatus: '付款狀態',
      orderId:       '訂單編號',
      transactionId: '交易編號',
      paymentMethod: '付款方式',
      totalPayment:  '付款總額',
      noCharge:      '未收取費用',
    },
    status: { fulfilled: '已完成', pending: '處理中', failed: '失敗' },
    empty:  '此期間內沒有交易。',
  },
  page: {
    tabs:                  ['熱銷商品', '2x FC Points', '新玩家', 'FC Points'],
    promoTitle:            '網頁限定：獲得額外 FC Points ＋免費禮物',
    promoAction:           '立即購買',
    doubleCurrencyHeading: '2x FC Points',
    doubleCurrencyDesc:    '精選商品可獲得 <strong>100%</strong> 獎勵。每項商品在網頁商店與遊戲內僅能購買一次。',
    newUsersHeading:       '新玩家優惠',
    newUsersDesc:          '首次購買享 <strong>50%</strong> 折扣',
    newUsersSub:           '以下商品僅能選購 1 項',
    currencySection:       'FC Points',
    giftsHeading:          '禮物',
    giftLimit:             '限量：1',
    giftClaimHeading:      '領取禮物',
    giftClaimLabel:        '你即將領取',
    giftClaimCta:          '領取禮物',
    giftClaimDoneCta:      '關閉',
    giftClaimedHeading:    '已領取禮物',
    giftClaimedBody:       '已送至你的 FC Mobile 帳號。',
    giftClaimedUpsellIntro: '既然你在這裡，看看這個專為你準備的優惠',
  },
}
