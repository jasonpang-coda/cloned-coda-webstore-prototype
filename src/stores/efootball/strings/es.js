/**
 * eFootball™ — Spanish (es) copy. PARTIAL override of ../store.js `strings`; any
 * key omitted here falls back to English. Proper nouns / currency (eFootball,
 * eFootball Coins, myKONAMI, KONAMI ID) are intentionally left untranslated.
 * Arrays (nav, page.tabs) must be supplied whole. Voice: clean commerce UI.
 */
export default {
  checkout: {
    actionLabel: 'Finalizar compra',
  },
  sku: {
    bonusLabel: 'Bono de Coins',
    bestSeller: 'MÁS VENDIDO',
    bestValue:  'MEJOR OFERTA',
  },
  nav: {
    groups: [{
      label: 'Tienda',
      children: [
        { label: 'Recargas',          anchor: 'top-ups' },
        { label: 'Paquetes de Coins', anchor: 'coin-packs' },
        { label: 'Ofertas Especiales', anchor: 'special-offers' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'Inicia sesión para comprar',
    accountLinkPrompt: 'Cómo vincular tu cuenta del juego con tu KONAMI ID',
    mykonami: {
      cta:        'Iniciar sesión con KONAMI ID',
      pagePrompt: 'Inicia sesión en tu cuenta myKONAMI para comprar',
      openingApp: 'Abriendo myKONAMI…',
    },
    efootball: {
      cta:           'Iniciar sesión con eFootball',
      openingApp:    'Abriendo eFootball™…',
      qrInstruction: 'Escanea este código QR con un dispositivo móvil que tenga sesión iniciada en tu cuenta de eFootball™',
      pagePrompt:    'Inicia sesión en tu cuenta de eFootball™ para comprar',
    },
  },
  account: {
    heading:            'TU CUENTA DE EFOOTBALL™',
    playerIdLabel:      'Tu ID de jugador de eFootball™',
    instructionsPrefix: 'En la app de eFootball™ ve a',
    playerCardLabel:    'Perfil del jugador',
  },
  page: {
    tabs:        ['Recargas', 'Paquetes de Coins', 'Ofertas Especiales'],
    promoTitle:  'EXCLUSIVO WEB: CONSIGUE eFootball Coins DE BONO',
    promoAction: 'COMPRAR AHORA',
  },
}
