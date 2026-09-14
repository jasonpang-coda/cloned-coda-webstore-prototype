/**
 * Rogue Trader — Korean (ko) copy. PARTIAL override of ../store.js `strings`; any key
 * omitted here falls back to English. Proper nouns / brand / currency (Warhammer
 * 40K, Rogue Trader, Voidfarer, Profit Factor / PF, item & edition names) left
 * untranslated. Arrays (nav, page.tabs) supplied whole.
 * Voice: neutral, clean commerce UI (Codashop) — concise, action-oriented.
 */
export default {
  checkout: {
    actionLabel: '획득하기',
  },
  sku: {
    bonusLabel: '위임장 보너스',
    bestSeller: '인기 상품',
    bestValue:  '최고의 가치',
  },
  nav: {
    groups: [{
      label: '스토어',
      children: [
        { label: '게임 및 에디션', anchor: 'cat-games' },
        { label: 'DLC',         anchor: 'cat-dlc' },
      ],
    }],
    items: [{ label: '코드 교환', anchor: null }],
  },
  signIn: {
    cta:               '로그인',
    openingApp:        'Rogue Trader 실행 중…',
    qrInstruction:     '계정에 로그인된 모바일 기기로 이 QR 코드를 스캔하세요',
    pagePrompt:        '구매하려면 계정에 로그인하세요',
    accountLinkPrompt: '계속하려면 계정을 연결하세요',
  },
  account: {
    heading:            '내 Rogue Trader Warrant',
    playerIdLabel:      '내 Rogue Trader ID',
    instructionsPrefix: 'Rogue Trader 앱에서 다음으로 이동',
  },
  page: {
    tabs:                  ['게임 및 에디션', 'DLC'],
    promoTitle:            'WARRANT OF TRADE: VOIDFARER EDITION 획득',
    promoAction:           '지금 구매',
    bestSellerDesc:        'Expanse에서 가장 인기 있는 에디션과 위임 보급품.',
    doubleCurrencyDesc:    '선택한 위임장에서 <strong>100%</strong> 보너스를 받으세요.',
    giftsHeading:          '공물',
    giftDailyTitle:        '일일 공물',
    giftDailySub:          'Relic Cache',
    giftLimit:             '제한:1',
    giftClaimHeading:      '공물 받기',
    giftClaimLabel:        '받으려는 항목',
    giftClaimCta:          '공물 받기',
    giftClaimDoneCta:      '닫기',
    giftClaimedHeading:      '공물 수령 완료',
    giftClaimedBody:         '님의 게임 내 금고로 전송되었습니다.',
    giftClaimedUpsellIntro:  '이 함교를 지휘하는 김에, 이 위임장도 확인해 보세요',
    newUsersHeading:       '신규 VOIDFARERS 위임장',
    newUsersDesc:          '첫 구매 시 <strong>50%</strong> 할인',
    newUsersSub:           '아래 항목 중 위임장 1개만 받을 수 있습니다',
    cpDealsHeading:        '신규 Voidfarers',
    cpDealsDesc:           '첫 Profit Factor 위임장 <strong>50%</strong> 할인',
    cpDealsSub:            '아래 항목 중 위임장 1개만 받을 수 있습니다',
    cpImageSectionDesc:    'Profit Factor를 획득하여 왕조의 세력을 확장하세요',
  },
}
