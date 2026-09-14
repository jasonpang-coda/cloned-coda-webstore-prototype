/**
 * COD:M — Japanese (ja) copy. PARTIAL override of ../store.js `strings`; any key
 * omitted here falls back to English. Proper nouns / currency (COD:M, CP, item
 * names) are intentionally left untranslated. Arrays (nav, page.tabs) must be
 * supplied whole. Voice: natural JP UI register (not keigo), punchy.
 */
export default {
  checkout: {
    actionLabel: '今すぐ購入',
  },
  sku: {
    bonusLabel: 'WEBボーナス',
    bestSeller: 'ベストセラー',
    bestValue:  'お買い得',
    bonusTag:   'ボーナス',
  },
  nav: {
    groups: [{
      label: 'ストア',
      children: [
        { label: 'ギフト', anchor: 'cat-gifts' },
        { label: 'CP',    anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'コード引き換え', anchor: null }],
  },
  itemSummary: {
    heading:          'アイテム概要',
    receiveLabel:     '受け取るアイテム',
    endsLabel:        '終了:',
    taxNote:          '税金は次のステップで加算されます',
    signedOutMessage: 'このアイテムを購入するにはCOD:Mアカウントにサインインしてください',
    orLabel:          'または',
    signInIdCta:      'COD:M IDでサインイン',
  },
  signIn: {
    cta:           'サインイン',
    openingApp:    'COD:Mアプリを起動中…',
    qrInstruction: 'COD:Mアカウントにログイン済みのモバイル端末でこのQRコードをスキャンしてください',
    pagePrompt:    '購入するにはアカウントにサインインしてください',
  },
  account: {
    heading:            'あなたのCOD:Mアカウント',
    playerIdLabel:      'COD:MプレイヤーID',
    instructionsPrefix: 'COD:Mアプリで次の場所へ',
    disclosureLabel:      'COD:Mアカウントの確認方法',
    viewImageInstructions: '画像で見る',
    chips: [
      {
        id: 'uid', label: 'UIDを確認',
        lines: [
          { type: 'text', content: 'UID：19～20桁の数字で構成されています' },
          { type: 'para', content: 'COD:Mアプリで次の場所へ\n  •  プレイヤープロフィール ＞ 基本情報' },
        ],
      },
      {
        id: 'player-id', label: 'プレイヤーIDを確認',
        lines: [
          { type: 'text', content: 'プレイヤーID：アカウントを識別する短い数字' },
          { type: 'para', content: 'COD:Mアプリで次の場所へ\n  •  プレイヤープロフィール ＞ 基本情報' },
        ],
      },
      {
        id: 'nickname', label: 'ニックネームを確認',
        lines: [
          { type: 'text', content: 'ニックネーム：ゲーム内の表示名' },
          { type: 'para', content: 'COD:Mアプリで次の場所へ\n  •  プレイヤープロフィール ＞ 基本情報' },
        ],
      },
    ],
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
    tabs:                  ['ベストセラー', '2x CP', 'ギフト', '新規ユーザー', 'CP', '新規ユーザー(画像)', 'CP(画像)'],
    giftTagLabel:          '無料ギフト',
    giftEndsLabel:         '終了:',
    giftRefreshesLabel:    '更新:',
    promoTitle:            'ウェブ限定:100%ボーナスCP＋無料ギフトをゲット',
    promoAction:           '今すぐ購入',
    bestSellerDesc:        'コミュニティ人気No.1 — 高評価のバンドルとオペレーター装備。',
    doubleCurrencyDesc:    '対象アイテムで<strong>100%</strong>ボーナス。各アイテムはウェブストアとゲーム内を通じて1回のみ購入できます。',
    giftsHeading:          'ギフト',
    giftDailyTitle:        'デイリーギフト',
    giftDailySub:          'エピック シークレットキャッシュ',
    giftLimit:             '制限:1',
    giftClaimHeading:      'ギフトを受け取る',
    giftClaimLabel:        '受け取ろうとしているのは',
    giftClaimCta:          'ギフトを受け取る',
    giftClaimDoneCta:      '閉じる',
    giftClaimedSnackTitle: 'ギフト受け取り完了',
    giftClaimedSnackBody:  'COD:Mの受信箱に送信されました',
    giftClaimedHeading:    'ギフト受け取り完了',
    giftClaimedBody:       'がCOD:Mの受信箱に送信されました。',
    giftClaimedUpsellIntro:'せっかくなので、あなただけの特別オファーをチェック',
    newUsersHeading:       '新規ユーザープロモ',
    newUsersDesc:          '初回購入が<strong>50%</strong>オフ',
    newUsersSub:           '以下のアイテムから1つのみ購入できます',
    cpDealsHeading:        '新規ユーザー(画像)',
    cpDealsDesc:           '初回CPチャージが<strong>50%</strong>オフ',
    cpDealsSub:            '以下のアイテムから1つのみ購入できます',
    cpImageSection:        'CP(画像)',
  },
}
