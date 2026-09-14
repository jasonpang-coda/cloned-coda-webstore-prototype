/**
 * TDR — Spanish (es) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Proper nouns / brand / currency (The Division
 * Resurgence, SHD, Agent, Premium Credits/PC, in-game item names) left
 * untranslated. Latin-American Spanish, concise/imperative UI voice.
 */
export default {
  checkout: {
    actionLabel: 'Comprar ahora',
  },
  sku: {
    bonusLabel: 'BONO WEB',
    bestSeller: 'MÁS VENDIDO',
    bestValue:  'MEJOR VALOR',
  },
  nav: {
    groups: [{
      label: 'Tienda',
      children: [
        { label: 'Regalos',  anchor: 'cat-gifts' },
        { label: 'Créditos', anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'Canje de código', anchor: null }],
  },
  signIn: {
    cta:               'Iniciar sesión con The Division',
    openingApp:        'Abriendo The Division Resurgence…',
    qrInstruction:     'Escanea este código QR con un dispositivo móvil con sesión iniciada en tu cuenta',
    pagePrompt:        'Inicia sesión en tu cuenta para comprar',
    accountLinkPrompt: 'Vincula tu cuenta para continuar',
  },
  account: {
    heading:            'Tu cuenta de Division Resurgence',
    playerIdLabel:      'Tu ID de Division Resurgence',
    instructionsPrefix: 'En la app de The Division Resurgence ve a',
  },
  page: {
    tabs:                  ['Más vendidos', '2x Créditos', 'Regalos', 'Nuevos usuarios', 'Créditos'],
    promoTitle:            'EXCLUSIVO WEB: OBTÉN 100% DE CRÉDITOS EXTRA + UN REGALO GRATIS',
    promoAction:           'COMPRAR AHORA',
    bestSellerDesc:        'Favoritos de la comunidad — paquetes y equipo de agente mejor valorados.',
    doubleCurrencyHeading: '2x Créditos',
    doubleCurrencyDesc:    'Obtén <strong>100%</strong> de bono en artículos seleccionados. Cada artículo se puede comprar solo UNA vez entre la tienda web y el juego.',
    giftsHeading:          'REGALOS',
    giftDailyTitle:        'REGALO DIARIO',
    giftEmoteTitle:        'EMOTE DE AGENTE',
    giftGunTitle:          'SKIN DE ARMA SHD',
    giftLimit:             'Límite:1',
    giftClaimHeading:      'Reclamar regalo',
    giftClaimLabel:        'Estás por reclamar',
    giftClaimCta:          'Reclamar regalo',
    giftClaimDoneCta:      'Cerrar',
    giftClaimedHeading:      'Regalo reclamado',
    giftClaimedBody:         'se envió a tu bandeja de entrada en el juego.',
    giftClaimedUpsellIntro:  'Ya que estás aquí, mira esta oferta hecha para ti',
    newUsersHeading:       'PROMO NUEVOS AGENTES',
    newUsersDesc:          'Obtén <strong>50%</strong> de descuento en tu primera compra',
    newUsersSub:           'Solo puedes obtener 1 artículo de los siguientes',
    cpDealsHeading:        'Nuevos agentes',
    cpDealsDesc:           'Obtén <strong>50%</strong> de descuento en tu primera recarga de Créditos',
    cpDealsSub:            'Solo puedes obtener 1 artículo de los siguientes',
    cpImageSectionDesc:    'Obtén 20% de descuento en tu primera compra',
  },
}
