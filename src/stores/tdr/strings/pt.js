/**
 * TDR — Portuguese (pt, pt-BR priority) copy. PARTIAL override of ../store.js
 * `strings`; omitted keys fall back to English. Proper nouns / brand / currency
 * (The Division Resurgence, SHD, Agent, Premium Credits/PC, in-game item names)
 * left untranslated. Brazilian Portuguese, concise/action-oriented UI voice.
 */
export default {
  checkout: {
    actionLabel: 'Comprar agora',
  },
  sku: {
    bonusLabel: 'BÔNUS WEB',
    bestSeller: 'MAIS VENDIDO',
    bestValue:  'MELHOR VALOR',
  },
  nav: {
    groups: [{
      label: 'Loja',
      children: [
        { label: 'Presentes', anchor: 'cat-gifts' },
        { label: 'Créditos',  anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'Resgate de código', anchor: null }],
  },
  signIn: {
    cta:               'Entrar com The Division',
    openingApp:        'Abrindo The Division Resurgence…',
    qrInstruction:     'Escaneie este QR code com um dispositivo móvel conectado à sua conta',
    pagePrompt:        'Entre na sua conta para comprar',
    accountLinkPrompt: 'Vincule sua conta para continuar',
  },
  account: {
    heading:            'Sua conta do Division Resurgence',
    playerIdLabel:      'Seu ID do Division Resurgence',
    instructionsPrefix: 'No app The Division Resurgence vá até',
  },
  page: {
    tabs:                  ['Mais vendidos', '2x Créditos', 'Presentes', 'Novos usuários', 'Créditos'],
    promoTitle:            'EXCLUSIVO WEB: GANHE 100% DE CRÉDITOS EXTRA + UM PRESENTE GRÁTIS',
    promoAction:           'COMPRAR AGORA',
    bestSellerDesc:        'Favoritos da comunidade — pacotes e equipamentos de agente mais bem avaliados.',
    doubleCurrencyHeading: '2x Créditos',
    doubleCurrencyDesc:    'Ganhe <strong>100%</strong> de bônus em itens selecionados. Cada item pode ser comprado apenas UMA vez entre a loja web e o jogo.',
    giftsHeading:          'PRESENTES',
    giftDailyTitle:        'PRESENTE DIÁRIO',
    giftEmoteTitle:        'EMOTE DE AGENTE',
    giftGunTitle:          'SKIN DE ARMA SHD',
    giftLimit:             'Limite:1',
    giftClaimHeading:      'Resgatar presente',
    giftClaimLabel:        'Você está prestes a resgatar',
    giftClaimCta:          'Resgatar presente',
    giftClaimDoneCta:      'Fechar',
    giftClaimedHeading:      'Presente resgatado',
    giftClaimedBody:         'foi enviado para sua caixa de entrada no jogo.',
    giftClaimedUpsellIntro:  'Já que está aqui, confira esta oferta feita para você',
    newUsersHeading:       'PROMO NOVOS AGENTES',
    newUsersDesc:          'Ganhe <strong>50%</strong> de desconto na sua primeira compra',
    newUsersSub:           'Você só pode obter 1 item da lista abaixo',
    cpDealsHeading:        'Novos agentes',
    cpDealsDesc:           'Ganhe <strong>50%</strong> de desconto na sua primeira recarga de Créditos',
    cpDealsSub:            'Você só pode obter 1 item da lista abaixo',
    cpImageSectionDesc:    'Ganhe 20% de desconto na sua primeira compra',
  },
}
