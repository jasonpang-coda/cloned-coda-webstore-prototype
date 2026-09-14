/**
 * YGO:DL — Korean (ko) copy. PARTIAL override of ../store.js `strings`; omitted keys
 * fall back to English. Proper nouns / currency / in-game item names (Yu-Gi-Oh!
 * DUEL LINKS, KONAMI ID, Crystals, Crystal Packs) left untranslated. Arrays supplied
 * whole; `anchor` unchanged. Clean commerce UI voice.
 */
export default {
  checkout: {
    actionLabel: '지금 구매',
  },
  sku: {
    bonusLabel:      '무료',
    bestSeller:      '추천',
    bestValue:       '최고의 가치',
    bonusTag:        '보너스',
    webExclusiveTag: '웹 상점 한정',
  },
  nav: {
    groups: [{
      label: '상점',
      children: [
        { label: '일반',     anchor: 'cat-regular' },
        { label: '한정',     anchor: 'cat-limited' },
        { label: '무료 보상', anchor: 'cat-free-rewards' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        '구매하려면 로그인하세요',
    accountLinkPrompt: '게임 계정을 KONAMI ID와 연동하는 방법',
    mykonami: {
      cta:        'KONAMI ID로 로그인',
      pagePrompt: '구매하려면 KONAMI ID 계정에 로그인하세요',
      openingApp: 'KONAMI ID 여는 중…',
    },
  },
  account: {
    heading:            '내 KONAMI ID 계정',
    playerIdLabel:      '내 플레이어 ID',
    instructionsPrefix: 'Yu-Gi-Oh! DUEL LINKS 앱에서 다음으로 이동',
    playerCardLabel:    '플레이어 프로필',
  },
  page: {
    tabs:                   ['일반', '한정', '무료 보상'],
    promoTitle:             '웹 상점 한정',
    promoAction:            '지금 구매',
    limitedHeading:         '한정 혜택',
    giftsHeading:           '무료 보상',
    giftTagLabel:           '무료 선물',
    giftTitle:              '주간 선물',
    giftSubtitle:           '주 1회 수령 가능',
    giftCta:                '받기',
    giftEndsLabel:          '갱신까지:',
    giftRefreshesLabel:     '갱신:',
    giftClaimHeading:       '보상 받기',
    giftClaimLabel:         '받으려는 항목',
    giftClaimCta:           '보상 받기',
    giftClaimDoneCta:       '닫기',
    giftClaimedHeading:     '보상 수령 완료',
    giftClaimedBody:        '님의 게임 내 우편함으로 전송되었습니다.',
    giftClaimedUpsellIntro: '오신 김에 회원님만을 위한 이 혜택을 확인해 보세요',
  },
}
