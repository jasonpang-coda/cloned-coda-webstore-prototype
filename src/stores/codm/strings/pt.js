/**
 * COD:M — Portuguese (pt, pt-BR priority) copy. PARTIAL override of ../store.js
 * `strings`; omitted keys fall back to English. Proper nouns / currency (COD:M,
 * CP, item names) left untranslated. Brazilian Portuguese, COD:M brand voice.
 */
export default {
  checkout: {
    actionLabel: 'Comprar agora',
  },
  sku: {
    bonusLabel: 'BÔNUS WEB',
    bestSeller: 'MAIS VENDIDO',
    bestValue:  'MELHOR VALOR',
    bonusTag:   'BÔNUS',
  },
  nav: {
    groups: [{
      label: 'Loja',
      children: [
        { label: 'Presentes', anchor: 'cat-gifts' },
        { label: 'CP',        anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'Resgate de código', anchor: null }],
  },
  itemSummary: {
    heading:          'Resumo do item',
    receiveLabel:     'Você vai receber',
    endsLabel:        'Termina:',
    taxNote:          'Os impostos serão adicionados na próxima etapa',
    signedOutMessage: 'Entre na sua conta COD:M para comprar este item',
    orLabel:          'ou',
    signInIdCta:      'Entrar com seu ID COD:M',
  },
  signIn: {
    cta:           'Entrar',
    openingApp:    'Abrindo o app COD:M…',
    qrInstruction: 'Escaneie este QR code com um dispositivo móvel logado na sua conta COD:M',
    pagePrompt:    'Entre na sua conta para comprar',
  },
  account: {
    heading:            'SUA CONTA COD:M',
    playerIdLabel:      'Seu ID de jogador COD:M',
    instructionsPrefix: 'No app COD:M, acesse',
    disclosureLabel:      'Como encontrar sua conta COD:M',
    viewImageInstructions: 'Ver instruções com imagens',
    chips: [
      {
        id: 'uid', label: 'Encontrar UID',
        lines: [
          { type: 'text', content: 'UID: seu ID tem de 19 a 20 números' },
          { type: 'para', content: 'No app COD:M, acesse\n  •  Perfil do jogador > BÁSICO' },
        ],
      },
      {
        id: 'player-id', label: 'Encontrar ID de jogador',
        lines: [
          { type: 'text', content: 'ID de jogador: um identificador numérico mais curto para sua conta' },
          { type: 'para', content: 'No app COD:M, acesse\n  •  Perfil do jogador > BÁSICO' },
        ],
      },
      {
        id: 'nickname', label: 'Encontrar apelido',
        lines: [
          { type: 'text', content: 'Apelido: seu nome de exibição no jogo' },
          { type: 'para', content: 'No app COD:M, acesse\n  •  Perfil do jogador > BÁSICO' },
        ],
      },
    ],
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
    tabs:                  ['Mais vendidos', '2x CP', 'Presentes', 'Novos usuários', 'CP', 'Novos usuários (Imagem)', 'CP (Imagem)'],
    giftTagLabel:          'PRESENTE GRÁTIS',
    giftEndsLabel:         'Termina:',
    giftRefreshesLabel:    'Renova:',
    promoTitle:            'EXCLUSIVO WEB: GANHE 100% DE CP BÔNUS + UM PRESENTE GRÁTIS',
    promoAction:           'COMPRAR AGORA',
    bestSellerDesc:        'Favoritos da comunidade — os pacotes e equipamentos de operador mais bem avaliados.',
    doubleCurrencyDesc:    'Ganhe <strong>100%</strong> de bônus em itens selecionados. Cada item pode ser comprado apenas UMA vez entre a loja web e o jogo.',
    giftsHeading:          'PRESENTES',
    giftDailyTitle:        'PRESENTE DIÁRIO',
    giftDailySub:          'Baú Secreto Épico',
    giftLimit:             'Limite:1',
    giftClaimHeading:      'Resgatar presente',
    giftClaimLabel:        'Você está prestes a resgatar',
    giftClaimCta:          'Resgatar presente',
    giftClaimDoneCta:      'Fechar',
    giftClaimedSnackTitle: 'Presente resgatado',
    giftClaimedSnackBody:  'enviado para sua caixa de entrada COD:M',
    giftClaimedHeading:    'Presente resgatado',
    giftClaimedBody:       'foi enviado para sua caixa de entrada COD:M.',
    giftClaimedUpsellIntro:'Já que você está aqui, confira esta oferta feita para você',
    newUsersHeading:       'PROMO NOVOS USUÁRIOS',
    newUsersDesc:          'Ganhe <strong>50%</strong> de desconto na sua primeira compra',
    newUsersSub:           'Você pode escolher apenas 1 item dos abaixo',
    cpDealsHeading:        'Novos usuários (Imagem)',
    cpDealsDesc:           'Ganhe <strong>50%</strong> de desconto na sua primeira recarga de CP',
    cpDealsSub:            'Você pode escolher apenas 1 item dos abaixo',
    cpImageSection:        'CP (Imagem)',
  },
}
