/**
 * Rogue Trader — Portuguese (pt) copy. PARTIAL override of ../store.js `strings`; any
 * key omitted here falls back to English. Proper nouns / brand / currency
 * (Warhammer 40K, Rogue Trader, Voidfarer, Profit Factor / PF, item & edition names)
 * are intentionally left untranslated. Arrays (nav, page.tabs) must be supplied whole.
 * Voice: neutral, clean commerce UI (Codashop) — concise, action-oriented.
 */
export default {
  checkout: {
    actionLabel: 'Adquirir',
  },
  sku: {
    bonusLabel: 'BÔNUS DE MANDADO',
    bestSeller: 'MAIS POPULAR',
    bestValue:  'MELHOR OFERTA',
  },
  nav: {
    groups: [{
      label: 'Loja',
      children: [
        { label: 'Jogos e edições', anchor: 'cat-games' },
        { label: 'DLC',             anchor: 'cat-dlc' },
      ],
    }],
    items: [{ label: 'Resgatar código', anchor: null }],
  },
  signIn: {
    cta:               'Entrar',
    openingApp:        'Abrindo Rogue Trader…',
    qrInstruction:     'Escaneie este código QR com um dispositivo móvel conectado à sua conta',
    pagePrompt:        'Entre na sua conta para comprar',
    accountLinkPrompt: 'Vincule sua conta para continuar',
  },
  account: {
    heading:            'Seu Rogue Trader Warrant',
    playerIdLabel:      'Seu ID de Rogue Trader',
    instructionsPrefix: 'No app de Rogue Trader, vá para',
  },
  page: {
    tabs:                  ['Jogos e edições', 'DLC'],
    promoTitle:            'WARRANT OF TRADE: ADQUIRA A VOIDFARER EDITION',
    promoAction:           'COMPRAR AGORA',
    bestSellerDesc:        'As edições e suprimentos mais cobiçados do Expanse.',
    doubleCurrencyDesc:    'Ganhe <strong>100%</strong> de bônus em mandados selecionados.',
    giftsHeading:          'TRIBUTO',
    giftDailyTitle:        'TRIBUTO DIÁRIO',
    giftDailySub:          'Relic Cache',
    giftLimit:             'Limite:1',
    giftClaimHeading:      'Resgatar tributo',
    giftClaimLabel:        'Você está prestes a resgatar',
    giftClaimCta:          'Resgatar tributo',
    giftClaimDoneCta:      'Fechar',
    giftClaimedHeading:      'Tributo resgatado',
    giftClaimedBody:         'foi enviado ao seu cofre no jogo.',
    giftClaimedUpsellIntro:  'Já que você comanda esta ponte, considere este mandado',
    newUsersHeading:       'MANDADO PARA NOVOS VOIDFARERS',
    newUsersDesc:          'Ganhe <strong>50%</strong> de desconto na sua primeira aquisição',
    newUsersSub:           'Você só pode resgatar 1 mandado dentre os abaixo',
    cpDealsHeading:        'Novos Voidfarers',
    cpDealsDesc:           'Ganhe <strong>50%</strong> de desconto no seu primeiro mandado de Profit Factor',
    cpDealsSub:            'Você só pode resgatar 1 mandado dentre os abaixo',
    cpImageSectionDesc:    'Adquira Profit Factor para estender o alcance da sua dinastia',
  },
}
