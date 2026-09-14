/**
 * YGO:DL — Japanese (ja) copy. PARTIAL override of ../store.js `strings`; any key
 * omitted here falls back to English. Proper nouns / currency / in-game item names
 * (Yu-Gi-Oh! DUEL LINKS, KONAMI ID, Crystals, Crystal Packs) are intentionally left
 * untranslated. Arrays (nav, page.tabs) must be supplied whole; `anchor` unchanged.
 * Voice: natural JP UI register, concise.
 */
export default {
  checkout: {
    actionLabel: '今すぐ購入',
  },
  sku: {
    bonusLabel:      '無料',
    bestSeller:      'おすすめ',
    bestValue:       'お買い得',
    bonusTag:        'ボーナス',
    webExclusiveTag: 'ウェブストア限定',
  },
  nav: {
    groups: [{
      label: 'ストア',
      children: [
        { label: '通常',     anchor: 'cat-regular' },
        { label: '期間限定', anchor: 'cat-limited' },
        { label: '無料報酬', anchor: 'cat-free-rewards' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        '購入するにはサインインしてください',
    accountLinkPrompt: 'ゲームアカウントとKONAMI IDを連携する方法',
    mykonami: {
      cta:        'KONAMI IDでサインイン',
      pagePrompt: '購入するにはKONAMI IDアカウントにサインインしてください',
      openingApp: 'KONAMI IDを起動中…',
    },
  },
  account: {
    heading:            'あなたのKONAMI IDアカウント',
    playerIdLabel:      'あなたのプレイヤーID',
    instructionsPrefix: 'Yu-Gi-Oh! DUEL LINKSアプリで次の場所へ',
    playerCardLabel:    'プレイヤープロフィール',
  },
  page: {
    tabs:                   ['通常', '期間限定', '無料報酬'],
    promoTitle:             'ウェブストア限定',
    promoAction:            '今すぐ購入',
    limitedHeading:         '期間限定オファー',
    giftsHeading:           '無料報酬',
    giftTagLabel:           '無料ギフト',
    giftTitle:              'ウィークリーギフト',
    giftSubtitle:           '週に1回受け取れます',
    giftCta:                '受け取る',
    giftEndsLabel:          '更新まで：',
    giftRefreshesLabel:     '更新：',
    giftClaimHeading:       '報酬を受け取る',
    giftClaimLabel:         '受け取ろうとしているのは',
    giftClaimCta:           '報酬を受け取る',
    giftClaimDoneCta:       '閉じる',
    giftClaimedHeading:     '報酬受け取り完了',
    giftClaimedBody:        'がゲーム内の受信箱に送信されました。',
    giftClaimedUpsellIntro: 'せっかくなので、あなただけの特別オファーをチェック',
  },
}
