/**
 * YGO:DL — Traditional Chinese (zh-Hant, HK/TW forms) copy. PARTIAL override of
 * ../store.js `strings`; omitted keys fall back to English. Proper nouns / currency
 * / in-game item names (Yu-Gi-Oh! DUEL LINKS, KONAMI ID, Crystals, Crystal Packs)
 * left untranslated. Arrays supplied whole; `anchor` unchanged. Traditional
 * Chinese only (no Simplified). Clean commerce UI voice.
 */
export default {
  checkout: {
    actionLabel: '立即購買',
  },
  sku: {
    bonusLabel:      '免費',
    bestSeller:      '推薦',
    bestValue:       '最超值',
    bonusTag:        '贈品',
    webExclusiveTag: '網頁商店限定',
  },
  nav: {
    groups: [{
      label: '商店',
      children: [
        { label: '一般',   anchor: 'cat-regular' },
        { label: '限定',   anchor: 'cat-limited' },
        { label: '免費獎勵', anchor: 'cat-free-rewards' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        '登入以購買',
    accountLinkPrompt: '如何將遊戲帳號與您的 KONAMI ID 連結',
    mykonami: {
      cta:        '使用 KONAMI ID 登入',
      pagePrompt: '登入您的 KONAMI ID 帳號以購買',
      openingApp: '正在開啟 KONAMI ID…',
    },
  },
  account: {
    heading:            '您的 KONAMI ID 帳號',
    playerIdLabel:      '您的玩家 ID',
    instructionsPrefix: '在 Yu-Gi-Oh! DUEL LINKS 應用程式中前往',
    playerCardLabel:    '玩家檔案',
  },
  page: {
    tabs:                   ['一般', '限定', '免費獎勵'],
    promoTitle:             '網頁商店限定',
    promoAction:            '立即購買',
    limitedHeading:         '限定優惠',
    giftsHeading:           '免費獎勵',
    giftTagLabel:           '免費禮物',
    giftTitle:              '每週禮物',
    giftSubtitle:           '每週可領取一次',
    giftCta:                '領取',
    giftEndsLabel:          '重置倒數：',
    giftRefreshesLabel:     '重置：',
    giftClaimHeading:       '領取獎勵',
    giftClaimLabel:         '您即將領取',
    giftClaimCta:           '領取獎勵',
    giftClaimDoneCta:       '關閉',
    giftClaimedHeading:     '已領取獎勵',
    giftClaimedBody:        '已送至您的遊戲內收件匣。',
    giftClaimedUpsellIntro: '既然您來了，看看這個專為您準備的優惠',
  },
}
