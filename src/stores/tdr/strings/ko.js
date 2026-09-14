/**
 * TDR — Korean (ko) copy. PARTIAL override of ../store.js `strings`; omitted keys
 * fall back to English. Natural modern UI register (avoid heavy honorifics).
 * Proper nouns / brand / currency (The Division Resurgence, SHD, Agent, Premium
 * Credits/PC, in-game item names) left untranslated. Hangul renders full-width
 * (CJK) — treat as double-width for layout.
 */
export default {
  checkout: {
    actionLabel: '지금 구매',
  },
  sku: {
    bonusLabel: '웹 보너스',
    bestSeller: '베스트셀러',
    bestValue:  '최고 가치',
  },
  nav: {
    groups: [{
      label: '상점',
      children: [
        { label: '선물',   anchor: 'cat-gifts' },
        { label: '크레딧', anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: '코드 교환', anchor: null }],
  },
  signIn: {
    cta:               'The Division으로 로그인',
    openingApp:        'The Division Resurgence 실행 중…',
    qrInstruction:     '계정에 로그인된 모바일 기기로 이 QR 코드를 스캔하세요',
    pagePrompt:        '구매하려면 계정에 로그인하세요',
    accountLinkPrompt: '계속하려면 계정을 연결하세요',
  },
  account: {
    heading:            '내 Division Resurgence 계정',
    playerIdLabel:      '내 Division Resurgence ID',
    instructionsPrefix: 'The Division Resurgence 앱에서 다음으로 이동',
  },
  page: {
    tabs:                  ['베스트셀러', '2배 크레딧', '선물', '신규 사용자', '크레딧'],
    promoTitle:            '웹 전용: 100% 보너스 크레딧 + 무료 선물 받기',
    promoAction:           '지금 구매',
    bestSellerDesc:        '커뮤니티 인기 상품 — 최고 평점의 번들과 요원 장비.',
    doubleCurrencyHeading: '2배 크레딧',
    doubleCurrencyDesc:    '선택 상품에서 <strong>100%</strong> 보너스를 받으세요. 각 상품은 웹 상점과 게임 내에서 한 번만 구매할 수 있습니다.',
    giftsHeading:          '선물',
    giftDailyTitle:        '일일 선물',
    giftEmoteTitle:        '요원 감정 표현',
    giftGunTitle:          'SHD 무기 스킨',
    giftLimit:             '제한:1',
    giftClaimHeading:      '선물 받기',
    giftClaimLabel:        '받으려는 항목',
    giftClaimCta:          '선물 받기',
    giftClaimDoneCta:      '닫기',
    giftClaimedHeading:      '선물 수령 완료',
    giftClaimedBody:         '게임 내 우편함으로 전송되었습니다.',
    giftClaimedUpsellIntro:  '오신 김에, 회원님만을 위한 이 혜택을 확인해 보세요',
    newUsersHeading:       '신규 요원 프로모션',
    newUsersDesc:          '첫 구매 시 <strong>50%</strong> 할인',
    newUsersSub:           '아래 상품 중 1개만 받을 수 있습니다',
    cpDealsHeading:        '신규 요원',
    cpDealsDesc:           '첫 크레딧 충전 시 <strong>50%</strong> 할인',
    cpDealsSub:            '아래 상품 중 1개만 받을 수 있습니다',
    cpImageSectionDesc:    '첫 구매 시 20% 할인',
  },
}
