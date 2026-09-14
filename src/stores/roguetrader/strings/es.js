/**
 * Rogue Trader — Spanish (es) copy. PARTIAL override of ../store.js `strings`; any
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
    bonusLabel: 'BONO DE MANDATO',
    bestSeller: 'MÁS POPULAR',
    bestValue:  'MEJOR VALOR',
  },
  nav: {
    groups: [{
      label: 'Tienda',
      children: [
        { label: 'Juegos y ediciones', anchor: 'cat-games' },
        { label: 'DLC',                anchor: 'cat-dlc' },
      ],
    }],
    items: [{ label: 'Canjear código', anchor: null }],
  },
  signIn: {
    cta:               'Iniciar sesión',
    openingApp:        'Abriendo Rogue Trader…',
    qrInstruction:     'Escanea este código QR con un dispositivo móvil conectado a tu cuenta',
    pagePrompt:        'Inicia sesión en tu cuenta para comprar',
    accountLinkPrompt: 'Vincula tu cuenta para continuar',
  },
  account: {
    heading:            'Tu Rogue Trader Warrant',
    playerIdLabel:      'Tu ID de Rogue Trader',
    instructionsPrefix: 'En la app de Rogue Trader ve a',
  },
  page: {
    tabs:                  ['Juegos y ediciones', 'DLC'],
    promoTitle:            'WARRANT OF TRADE: ADQUIERE LA VOIDFARER EDITION',
    promoAction:           'COMPRAR AHORA',
    bestSellerDesc:        'Las ediciones y suministros más codiciados del Expanse.',
    doubleCurrencyDesc:    'Consigue un <strong>100%</strong> de bono en mandatos seleccionados.',
    giftsHeading:          'TRIBUTO',
    giftDailyTitle:        'TRIBUTO DIARIO',
    giftDailySub:          'Relic Cache',
    giftLimit:             'Límite:1',
    giftClaimHeading:      'Reclamar tributo',
    giftClaimLabel:        'Estás a punto de reclamar',
    giftClaimCta:          'Reclamar tributo',
    giftClaimDoneCta:      'Cerrar',
    giftClaimedHeading:      'Tributo reclamado',
    giftClaimedBody:         'se ha enviado a tu bóveda en el juego.',
    giftClaimedUpsellIntro:  'Ya que comandas este puente, considera este mandato',
    newUsersHeading:       'MANDATO PARA NUEVOS VOIDFARERS',
    newUsersDesc:          'Consigue un <strong>50%</strong> de descuento en tu primera adquisición',
    newUsersSub:           'Solo puedes reclamar 1 mandato de los siguientes',
    cpDealsHeading:        'Nuevos Voidfarers',
    cpDealsDesc:           'Consigue un <strong>50%</strong> de descuento en tu primer mandato de Profit Factor',
    cpDealsSub:            'Solo puedes reclamar 1 mandato de los siguientes',
    cpImageSectionDesc:    'Adquiere Profit Factor para ampliar el alcance de tu dinastía',
  },
}
