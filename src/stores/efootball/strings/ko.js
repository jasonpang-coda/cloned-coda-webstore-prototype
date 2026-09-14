/**
 * eFootball™ — Korean (ko) copy. PARTIAL override of ../store.js `strings`;
 * omitted keys fall back to English. Proper nouns / currency (eFootball, eFootball
 * Coins, myKONAMI, KONAMI ID) left untranslated. Arrays (nav, page.tabs) must be
 * supplied whole. Voice: clean commerce UI.
 */
export default {
  checkout: {
    actionLabel: '결제하기',
  },
  sku: {
    bonusLabel: '코인 보너스',
    bestSeller: '베스트셀러',
    bestValue:  '최고의 가치',
  },
  nav: {
    groups: [{
      label: '스토어',
      children: [
        { label: '충전',     anchor: 'top-ups' },
        { label: '코인 팩',  anchor: 'coin-packs' },
        { label: '특별 혜택', anchor: 'special-offers' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        '구매하려면 로그인하세요',
    accountLinkPrompt: '게임 계정을 KONAMI ID와 연동하는 방법',
    mykonami: {
      cta:        'KONAMI ID로 로그인',
      pagePrompt: '구매하려면 myKONAMI 계정에 로그인하세요',
      openingApp: 'myKONAMI 여는 중…',
    },
    efootball: {
      cta:           'eFootball로 로그인',
      openingApp:    'eFootball™ 여는 중…',
      qrInstruction: 'eFootball™ 계정에 로그인된 모바일 기기로 이 QR 코드를 스캔하세요',
      pagePrompt:    '구매하려면 eFootball™ 계정에 로그인하세요',
    },
  },
  account: {
    heading:            '내 eFootball™ 계정',
    playerIdLabel:      'eFootball™ 플레이어 ID',
    instructionsPrefix: 'eFootball™ 앱에서 다음으로 이동',
    playerCardLabel:    '플레이어 프로필',
  },
  page: {
    tabs:        ['충전', '코인 팩', '특별 혜택'],
    promoTitle:  '웹 전용: 보너스 eFootball Coins 받기',
    promoAction: '지금 구매',
  },
}
