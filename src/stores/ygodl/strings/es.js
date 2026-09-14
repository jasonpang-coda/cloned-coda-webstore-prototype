/**
 * YGO:DL — Spanish (es) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Proper nouns / currency / in-game item names
 * (Yu-Gi-Oh! DUEL LINKS, KONAMI ID, Crystals, Crystal Packs) left untranslated.
 * Arrays supplied whole; `anchor` unchanged. Latin-American Spanish, clean
 * commerce UI voice.
 */
export default {
  checkout: {
    actionLabel: 'Comprar ahora',
  },
  sku: {
    bonusLabel:      'Gratis',
    bestSeller:      'RECOMENDADO',
    bestValue:       'MEJOR VALOR',
    bonusTag:        'BONO',
    webExclusiveTag: 'EXCLUSIVO DE LA TIENDA WEB',
  },
  nav: {
    groups: [{
      label: 'Tienda',
      children: [
        { label: 'Regular',           anchor: 'cat-regular' },
        { label: 'Limitado',          anchor: 'cat-limited' },
        { label: 'Recompensas gratis', anchor: 'cat-free-rewards' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'Inicia sesión para comprar',
    accountLinkPrompt: 'Cómo vincular tu cuenta del juego con tu KONAMI ID',
    mykonami: {
      cta:        'Iniciar sesión con KONAMI ID',
      pagePrompt: 'Inicia sesión en tu cuenta KONAMI ID para comprar',
      openingApp: 'Abriendo KONAMI ID…',
    },
  },
  account: {
    heading:            'TU CUENTA KONAMI ID',
    playerIdLabel:      'Tu ID de jugador',
    instructionsPrefix: 'En la app de Yu-Gi-Oh! DUEL LINKS ve a',
    playerCardLabel:    'Perfil del jugador',
  },
  page: {
    tabs:                   ['Regular', 'Limitado', 'Recompensas gratis'],
    promoTitle:             'EXCLUSIVO DE LA TIENDA WEB',
    promoAction:            'COMPRAR AHORA',
    limitedHeading:         'Ofertas limitadas',
    giftsHeading:           'Recompensas gratis',
    giftTagLabel:           'REGALO GRATIS',
    giftTitle:              'REGALO SEMANAL',
    giftSubtitle:           'Disponible una vez por semana',
    giftCta:                'Reclamar',
    giftEndsLabel:          'Se renueva en:',
    giftRefreshesLabel:     'Se renueva:',
    giftClaimHeading:       'Reclamar recompensa',
    giftClaimLabel:         'Estás por reclamar',
    giftClaimCta:           'Reclamar recompensa',
    giftClaimDoneCta:       'Cerrar',
    giftClaimedHeading:     'Recompensa reclamada',
    giftClaimedBody:        'se envió a tu bandeja de entrada del juego.',
    giftClaimedUpsellIntro: 'Ya que estás aquí, mira esta oferta hecha para ti',
  },
}
