/**
 * FC Mobile — Portuguese (pt, pt-BR priority) copy. PARTIAL override of
 * ../store.js `strings`; omitted keys fall back to English. Proper nouns /
 * currency (FC Mobile, EA Sports FC™, FC Points, FC, MP, item names) left
 * untranslated. Brazilian Portuguese, FC Mobile brand voice.
 */
export default {
  checkout: {
    actionLabel: 'Finalizar compra',
  },
  sku: {
    bonusLabel: 'Bônus de FC Points',
    bestSeller: 'MAIS VENDIDO',
    bestValue:  'MELHOR VALOR',
  },
  nav: {
    groups: [{
      label: 'Loja',
      children: [
        { label: 'Suprimentos diários', anchor: 'daily-supplies' },
        { label: 'Ofertas limitadas',   anchor: 'limited-offers' },
        { label: 'Recargas',            anchor: 'top-ups' },
      ],
    }],
    items: [],
  },
  signIn: {
    cta:           'Entrar',
    openingApp:    'Abrindo o EA Sports FC<sup>TM</sup> Mobile…',
    qrInstruction: 'Escaneie este QR code com um dispositivo móvel logado na sua conta do EA Sports FC<sup>TM</sup> Mobile',
    pagePrompt:    'Entre na sua conta para comprar',
  },
  account: {
    heading:            'SUA CONTA DO FC MOBILE',
    playerIdLabel:      'Seu ID de jogador do FC Mobile',
    instructionsPrefix: 'No app do FC Mobile, acesse',
    playerCardLabel:    'Perfil do jogador',
  },
  transactionHistory: {
    title:       'Histórico de transações',
    popoverLink: 'Histórico de transações',
    filterLabel: 'Filtrar transações',
    ranges: { d7: 'Últimos 7 dias', d30: 'Últimos 30 dias', d90: 'Últimos 90 dias' },
    row: {
      paymentStatus: 'Status do pagamento',
      orderId:       'ID do pedido',
      transactionId: 'ID da transação',
      paymentMethod: 'Forma de pagamento',
      totalPayment:  'Pagamento total',
      noCharge:      'Sem cobrança',
    },
    status: { fulfilled: 'Concluído', pending: 'Em andamento', failed: 'Falhou' },
    empty:  'Nenhuma transação neste período.',
  },
  page: {
    tabs:                  ['Mais vendidos', '2x FC Points', 'Novos usuários', 'FC Points'],
    promoTitle:            'EXCLUSIVO WEB: GANHE FC POINTS BÔNUS + UM PRESENTE GRÁTIS',
    promoAction:           'COMPRAR AGORA',
    doubleCurrencyHeading: '2x FC Points',
    doubleCurrencyDesc:    'Ganhe <strong>100%</strong> de bônus em itens selecionados. Cada item pode ser comprado apenas UMA vez entre a loja web e o jogo.',
    newUsersHeading:       'PROMO NOVOS USUÁRIOS',
    newUsersDesc:          'Ganhe <strong>50%</strong> de desconto na sua primeira compra',
    newUsersSub:           'Você pode escolher apenas 1 item dos abaixo',
    currencySection:       'FC Points',
    giftsHeading:          'PRESENTES',
    giftLimit:             'Limite: 1',
    giftClaimHeading:      'Resgatar presente',
    giftClaimLabel:        'Você está prestes a resgatar',
    giftClaimCta:          'Resgatar presente',
    giftClaimDoneCta:      'Fechar',
    giftClaimedHeading:    'Presente resgatado',
    giftClaimedBody:       'foi enviado para a sua conta do FC Mobile.',
    giftClaimedUpsellIntro: 'Já que você está aqui, confira esta oferta feita para você',
  },
}
