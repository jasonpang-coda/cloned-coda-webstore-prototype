/**
 * eFootball™ — Portuguese (pt) copy. PARTIAL override of ../store.js `strings`;
 * any key omitted here falls back to English. Proper nouns / currency (eFootball,
 * eFootball Coins, myKONAMI, KONAMI ID) are intentionally left untranslated.
 * Arrays (nav, page.tabs) must be supplied whole. Voice: clean commerce UI (pt-BR).
 */
export default {
  checkout: {
    actionLabel: 'Finalizar compra',
  },
  sku: {
    bonusLabel: 'Bônus de Coins',
    bestSeller: 'MAIS VENDIDO',
    bestValue:  'MELHOR OFERTA',
  },
  nav: {
    groups: [{
      label: 'Loja',
      children: [
        { label: 'Recargas',          anchor: 'top-ups' },
        { label: 'Pacotes de Coins',  anchor: 'coin-packs' },
        { label: 'Ofertas Especiais', anchor: 'special-offers' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'Entre para comprar',
    accountLinkPrompt: 'Como vincular sua conta do jogo ao seu KONAMI ID',
    mykonami: {
      cta:        'Entrar com KONAMI ID',
      pagePrompt: 'Entre na sua conta myKONAMI para comprar',
      openingApp: 'Abrindo myKONAMI…',
    },
    efootball: {
      cta:           'Entrar com eFootball',
      openingApp:    'Abrindo eFootball™…',
      qrInstruction: 'Escaneie este QR code com um dispositivo móvel conectado à sua conta eFootball™',
      pagePrompt:    'Entre na sua conta eFootball™ para comprar',
    },
  },
  account: {
    heading:            'SUA CONTA EFOOTBALL™',
    playerIdLabel:      'Seu ID de Jogador eFootball™',
    instructionsPrefix: 'No app eFootball™ acesse',
    playerCardLabel:    'Perfil do Jogador',
  },
  page: {
    tabs:        ['Recargas', 'Pacotes de Coins', 'Ofertas Especiais'],
    promoTitle:  'EXCLUSIVO NA WEB: GANHE eFootball Coins DE BÔNUS',
    promoAction: 'COMPRAR AGORA',
  },
}
