/**
 * FC Mobile — Spanish (es) copy. PARTIAL override of ../store.js `strings`;
 * omitted keys fall back to English. Proper nouns / currency (FC Mobile,
 * EA Sports FC™, FC Points, FC, MP, item names) left untranslated. Neutral
 * Latin-American Spanish, FC Mobile brand voice (informal "tu").
 */
export default {
  checkout: {
    actionLabel: 'Finalizar compra',
  },
  sku: {
    bonusLabel: 'Bono de FC Points',
    bestSeller: 'MÁS VENDIDO',
    bestValue:  'MEJOR VALOR',
  },
  nav: {
    groups: [{
      label: 'Tienda',
      children: [
        { label: 'Suministros diarios', anchor: 'daily-supplies' },
        { label: 'Ofertas limitadas',   anchor: 'limited-offers' },
        { label: 'Recargas',            anchor: 'top-ups' },
      ],
    }],
    items: [],
  },
  signIn: {
    cta:           'Iniciar sesión',
    openingApp:    'Abriendo EA Sports FC<sup>TM</sup> Mobile…',
    qrInstruction: 'Escanea este código QR con un dispositivo móvil con sesión iniciada en tu cuenta de EA Sports FC<sup>TM</sup> Mobile',
    pagePrompt:    'Inicia sesión en tu cuenta para comprar',
  },
  account: {
    heading:            'TU CUENTA DE FC MOBILE',
    playerIdLabel:      'Tu ID de jugador de FC Mobile',
    instructionsPrefix: 'En la app de FC Mobile, ve a',
    playerCardLabel:    'Perfil del jugador',
  },
  transactionHistory: {
    title:       'Historial de transacciones',
    popoverLink: 'Historial de transacciones',
    filterLabel: 'Filtrar transacciones',
    ranges: { d7: 'Últimos 7 días', d30: 'Últimos 30 días', d90: 'Últimos 90 días' },
    row: {
      paymentStatus: 'Estado del pago',
      orderId:       'ID del pedido',
      transactionId: 'ID de la transacción',
      paymentMethod: 'Método de pago',
      totalPayment:  'Pago total',
      noCharge:      'Sin cargo',
    },
    status: { fulfilled: 'Completado', pending: 'En curso', failed: 'Fallido' },
    empty:  'No hay transacciones en este período.',
  },
  page: {
    tabs:                  ['Más vendidos', '2x FC Points', 'Nuevos usuarios', 'FC Points'],
    promoTitle:            'EXCLUSIVO WEB: CONSIGUE FC POINTS DE BONO + UN REGALO GRATIS',
    promoAction:           'COMPRAR AHORA',
    doubleCurrencyHeading: '2x FC Points',
    doubleCurrencyDesc:    'Consigue un <strong>100%</strong> de bono en artículos seleccionados. Cada artículo se puede comprar solo UNA vez entre la tienda web y el juego.',
    newUsersHeading:       'PROMO NUEVOS USUARIOS',
    newUsersDesc:          'Consigue un <strong>50%</strong> de descuento en tu primera compra',
    newUsersSub:           'Solo puedes elegir 1 artículo de los siguientes',
    currencySection:       'FC Points',
    giftsHeading:          'REGALOS',
    giftLimit:             'Límite: 1',
    giftClaimHeading:      'Reclamar regalo',
    giftClaimLabel:        'Estás a punto de reclamar',
    giftClaimCta:          'Reclamar regalo',
    giftClaimDoneCta:      'Cerrar',
    giftClaimedHeading:    'Regalo reclamado',
    giftClaimedBody:       'se ha enviado a tu cuenta de FC Mobile.',
    giftClaimedUpsellIntro: 'Ya que estás aquí, echa un vistazo a esta oferta hecha para ti',
  },
}
