/**
 * FC Mobile — Japanese (ja) copy. PARTIAL override of ../store.js `strings`; any
 * key omitted here falls back to English. Proper nouns / currency (FC Mobile,
 * EA Sports FC™, FC Points, FC, MP, item names) are intentionally left
 * untranslated. Arrays (nav.groups, page.tabs) must be supplied whole. Voice:
 * natural JP UI register (not keigo), football-forward.
 */
export default {
  checkout: {
    actionLabel: '購入手続きへ',
  },
  sku: {
    bonusLabel: 'FC Points ボーナス',
    bestSeller: 'ベストセラー',
    bestValue:  'お買い得',
  },
  nav: {
    groups: [{
      label: 'ストア',
      children: [
        { label: 'デイリー補給',   anchor: 'daily-supplies' },
        { label: '期間限定オファー', anchor: 'limited-offers' },
        { label: 'チャージ',       anchor: 'top-ups' },
      ],
    }],
    items: [],
  },
  signIn: {
    cta:           'サインイン',
    openingApp:    'EA Sports FC<sup>TM</sup> Mobile を起動中…',
    qrInstruction: 'EA Sports FC<sup>TM</sup> Mobile アカウントにログイン済みのモバイル端末でこのQRコードをスキャンしてください',
    pagePrompt:    '購入するにはアカウントにサインインしてください',
  },
  account: {
    heading:            'あなたの FC Mobile アカウント',
    playerIdLabel:      'FC Mobile プレイヤーID',
    instructionsPrefix: 'FC Mobile アプリで次の場所へ',
    playerCardLabel:    'プレイヤープロフィール',
  },
  transactionHistory: {
    title:       '取引履歴',
    popoverLink: '取引履歴',
    filterLabel: '取引を絞り込む',
    ranges: { d7: '過去7日間', d30: '過去30日間', d90: '過去90日間' },
    row: {
      paymentStatus: '支払い状況',
      orderId:       '注文ID',
      transactionId: '取引ID',
      paymentMethod: '支払い方法',
      totalPayment:  '合計金額',
      noCharge:      '請求なし',
    },
    status: { fulfilled: '完了', pending: '処理中', failed: '失敗' },
    empty:  'この期間の取引はありません。',
  },
  page: {
    tabs:                  ['ベストセラー', '2x FC Points', '新規ユーザー', 'FC Points'],
    promoTitle:            'ウェブ限定：ボーナス FC Points ＋無料ギフトをゲット',
    promoAction:           '今すぐ購入',
    doubleCurrencyHeading: '2x FC Points',
    doubleCurrencyDesc:    '対象アイテムで<strong>100%</strong>ボーナス。各アイテムはウェブストアとゲーム内を通じて1回のみ購入できます。',
    newUsersHeading:       '新規ユーザープロモ',
    newUsersDesc:          '初回購入が<strong>50%</strong>オフ',
    newUsersSub:           '以下のアイテムから1つのみ購入できます',
    currencySection:       'FC Points',
    giftsHeading:          'ギフト',
    giftLimit:             '制限：1',
    giftClaimHeading:      'ギフトを受け取る',
    giftClaimLabel:        '受け取ろうとしているのは',
    giftClaimCta:          'ギフトを受け取る',
    giftClaimDoneCta:      '閉じる',
    giftClaimedHeading:    'ギフト受け取り完了',
    giftClaimedBody:       'があなたの FC Mobile アカウントに送信されました。',
    giftClaimedUpsellIntro: 'せっかくなので、あなただけの特別オファーをチェック',
  },
}
