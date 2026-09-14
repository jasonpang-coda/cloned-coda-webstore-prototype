/**
 * YGO:DL — Portuguese (pt, pt-BR priority) copy. PARTIAL override of ../store.js
 * `strings`; omitted keys fall back to English. Proper nouns / currency / in-game
 * item names (Yu-Gi-Oh! DUEL LINKS, KONAMI ID, Crystals, Crystal Packs) left
 * untranslated. Arrays supplied whole; `anchor` unchanged. Brazilian Portuguese,
 * clean commerce UI voice.
 */
export default {
  checkout: {
    actionLabel: 'Comprar agora',
  },
  sku: {
    bonusLabel:      'Grátis',
    bestSeller:      'RECOMENDADO',
    bestValue:       'MELHOR VALOR',
    bonusTag:        'BÔNUS',
    webExclusiveTag: 'EXCLUSIVO DA LOJA WEB',
  },
  nav: {
    groups: [{
      label: 'Loja',
      children: [
        { label: 'Regular',            anchor: 'cat-regular' },
        { label: 'Limitado',           anchor: 'cat-limited' },
        { label: 'Recompensas Grátis', anchor: 'cat-free-rewards' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'Entre para comprar',
    accountLinkPrompt: 'Como vincular sua conta do jogo ao seu KONAMI ID',
    mykonami: {
      cta:        'Entrar com KONAMI ID',
      pagePrompt: 'Entre na sua conta KONAMI ID para comprar',
      openingApp: 'Abrindo o KONAMI ID…',
    },
  },
  account: {
    heading:            'SUA CONTA KONAMI ID',
    playerIdLabel:      'Seu ID de jogador',
    instructionsPrefix: 'No app Yu-Gi-Oh! DUEL LINKS, acesse',
    playerCardLabel:    'Perfil do jogador',
  },
  page: {
    tabs:                   ['Regular', 'Limitado', 'Recompensas Grátis'],
    promoTitle:             'EXCLUSIVO DA LOJA WEB',
    promoAction:            'COMPRAR AGORA',
    limitedHeading:         'Ofertas Limitadas',
    giftsHeading:           'Recompensas Grátis',
    giftTagLabel:           'PRESENTE GRÁTIS',
    giftTitle:              'PRESENTE SEMANAL',
    giftSubtitle:           'Disponível uma vez por semana',
    giftCta:                'Resgatar',
    giftEndsLabel:          'Renova em:',
    giftRefreshesLabel:     'Renova:',
    giftClaimHeading:       'Resgatar recompensa',
    giftClaimLabel:         'Você está prestes a resgatar',
    giftClaimCta:           'Resgatar recompensa',
    giftClaimDoneCta:       'Fechar',
    giftClaimedHeading:     'Recompensa resgatada',
    giftClaimedBody:        'foi enviada para sua caixa de entrada no jogo.',
    giftClaimedUpsellIntro: 'Já que você está aqui, confira esta oferta feita para você',
  },
}
