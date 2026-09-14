/**
 * Rogue Trader — Japanese (ja) copy. PARTIAL override of ../store.js `strings`; any
 * key omitted here falls back to English. Proper nouns / brand / currency
 * (Warhammer 40K, Rogue Trader, Voidfarer, Profit Factor / PF, item & edition names)
 * are intentionally left untranslated. Arrays (nav, page.tabs) must be supplied whole.
 * Voice: neutral, clean commerce UI (Codashop) — concise, action-oriented.
 */
export default {
  checkout: {
    actionLabel: '獲得する',
  },
  sku: {
    bonusLabel: 'ウォラントボーナス',
    bestSeller: '人気No.1',
    bestValue:  'お買い得',
  },
  nav: {
    groups: [{
      label: 'ストア',
      children: [
        { label: 'ゲーム＆エディション', anchor: 'cat-games' },
        { label: 'DLC',                anchor: 'cat-dlc' },
      ],
    }],
    items: [{ label: 'コード引き換え', anchor: null }],
  },
  signIn: {
    cta:               'サインイン',
    openingApp:        'Rogue Traderを起動中…',
    qrInstruction:     'アカウントにログイン済みのモバイル端末でこのQRコードをスキャンしてください',
    pagePrompt:        '購入するにはアカウントにサインインしてください',
    accountLinkPrompt: '続行するにはアカウントを連携してください',
  },
  account: {
    heading:            'あなたのRogue Trader Warrant',
    playerIdLabel:      'あなたのRogue Trader ID',
    instructionsPrefix: 'Rogue Traderアプリで次の場所へ',
  },
  page: {
    tabs:                  ['ゲーム＆エディション', 'DLC'],
    promoTitle:            'WARRANT OF TRADE: VOIDFARER EDITIONを手に入れよう',
    promoAction:           '今すぐ購入',
    bestSellerDesc:        'Expanseで最も人気のエディションとウォラント補給品。',
    doubleCurrencyDesc:    '対象ウォラントで<strong>100%</strong>ボーナスを獲得。',
    giftsHeading:          '貢ぎ物',
    giftDailyTitle:        'デイリーボーナス',
    giftDailySub:          'レリックキャッシュ',
    giftLimit:             '制限:1',
    giftClaimHeading:      '貢ぎ物を受け取る',
    giftClaimLabel:        '受け取ろうとしているのは',
    giftClaimCta:          '貢ぎ物を受け取る',
    giftClaimDoneCta:      '閉じる',
    giftClaimedHeading:      '貢ぎ物受け取り完了',
    giftClaimedBody:         'がゲーム内の保管庫に送信されました。',
    giftClaimedUpsellIntro:  'せっかくなので、こちらのウォラントもチェック',
    newUsersHeading:       '新規Voidfarer向けウォラント',
    newUsersDesc:          '初回購入が<strong>50%</strong>オフ',
    newUsersSub:           '以下から1つのウォラントのみ受け取れます',
    cpDealsHeading:        '新規Voidfarer',
    cpDealsDesc:           '初回のProfit Factorウォラントが<strong>50%</strong>オフ',
    cpDealsSub:            '以下から1つのウォラントのみ受け取れます',
    cpImageSectionDesc:    'Profit Factorを獲得してダイナスティの勢力を拡大しよう',
  },
}
