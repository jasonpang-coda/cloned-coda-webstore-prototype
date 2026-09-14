/**
 * TDR — Japanese (ja) copy. PARTIAL override of ../store.js `strings`; any key
 * omitted here falls back to English. Proper nouns / brand / currency (The
 * Division Resurgence, SHD, Agent, Premium Credits/PC, in-game item names like
 * "Field Cache") are intentionally left untranslated. Arrays (nav, page.tabs)
 * must be supplied whole. Voice: natural JP UI register, punchy/action-oriented.
 */
export default {
  checkout: {
    actionLabel: '今すぐ購入',
  },
  sku: {
    bonusLabel: 'WEBボーナス',
    bestSeller: 'ベストセラー',
    bestValue:  'お買い得',
  },
  nav: {
    groups: [{
      label: 'ストア',
      children: [
        { label: 'ギフト',       anchor: 'cat-gifts' },
        { label: 'クレジット',   anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'コード引き換え', anchor: null }],
  },
  signIn: {
    cta:               'The Divisionでサインイン',
    openingApp:        'The Division Resurgenceを起動中…',
    qrInstruction:     'アカウントにログイン済みのモバイル端末でこのQRコードをスキャンしてください',
    pagePrompt:        '購入するにはアカウントにサインインしてください',
    accountLinkPrompt: '続けるにはアカウントを連携してください',
  },
  account: {
    heading:            'あなたのDivision Resurgenceアカウント',
    playerIdLabel:      'あなたのDivision Resurgence ID',
    instructionsPrefix: 'The Division Resurgenceアプリで次の場所へ',
  },
  page: {
    tabs:                  ['ベストセラー', '2xクレジット', 'ギフト', '新規ユーザー', 'クレジット'],
    promoTitle:            'ウェブ限定:100%ボーナスクレジット＋無料ギフトをゲット',
    promoAction:           '今すぐ購入',
    bestSellerDesc:        'コミュニティ人気No.1 — 高評価のバンドルとエージェント装備。',
    doubleCurrencyHeading: '2xクレジット',
    doubleCurrencyDesc:    '対象アイテムで<strong>100%</strong>ボーナス。各アイテムはウェブストアとゲーム内を通じて1回のみ購入できます。',
    giftsHeading:          'ギフト',
    giftDailyTitle:        'デイリーギフト',
    giftEmoteTitle:        'エージェントエモート',
    giftGunTitle:          'SHDウェポンスキン',
    giftLimit:             '制限:1',
    giftClaimHeading:      'ギフトを受け取る',
    giftClaimLabel:        '受け取ろうとしているのは',
    giftClaimCta:          'ギフトを受け取る',
    giftClaimDoneCta:      '閉じる',
    giftClaimedHeading:      'ギフト受け取り完了',
    giftClaimedBody:         'がゲーム内の受信箱に送信されました。',
    giftClaimedUpsellIntro:  'せっかくなので、あなただけの特別オファーをチェック',
    newUsersHeading:       '新規エージェントプロモ',
    newUsersDesc:          '初回購入が<strong>50%</strong>オフ',
    newUsersSub:           '以下のアイテムから1つのみ購入できます',
    cpDealsHeading:        '新規エージェント',
    cpDealsDesc:           '初回クレジットチャージが<strong>50%</strong>オフ',
    cpDealsSub:            '以下のアイテムから1つのみ購入できます',
    cpImageSectionDesc:    '初回購入で20%割引',
  },
}
