/**
 * COD:M — Spanish (es) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Proper nouns / currency (COD:M, CP, item names) left
 * untranslated. Latin-American Spanish, COD:M brand voice — direct, imperative.
 */
export default {
  checkout: {
    actionLabel: 'Comprar ahora',
  },
  sku: {
    bonusLabel: 'BONO WEB',
    bestSeller: 'MÁS VENDIDO',
    bestValue:  'MEJOR VALOR',
    bonusTag:   'BONO',
  },
  nav: {
    groups: [{
      label: 'Tienda',
      children: [
        { label: 'Regalos', anchor: 'cat-gifts' },
        { label: 'CP',      anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'Canje de código', anchor: null }],
  },
  itemSummary: {
    heading:          'Resumen del artículo',
    receiveLabel:     'Recibirás',
    endsLabel:        'Termina:',
    taxNote:          'Los impuestos se agregarán en el siguiente paso',
    signedOutMessage: 'Inicia sesión en tu cuenta de COD:M para comprar este artículo',
    orLabel:          'o',
    signInIdCta:      'Inicia sesión con tu ID de COD:M',
  },
  signIn: {
    cta:           'Iniciar sesión',
    openingApp:    'Abriendo la app de COD:M…',
    qrInstruction: 'Escanea este código QR con un dispositivo móvil con sesión iniciada en tu cuenta de COD:M',
    pagePrompt:    'Inicia sesión en tu cuenta para comprar',
  },
  account: {
    heading:            'TU CUENTA DE COD:M',
    playerIdLabel:      'Tu ID de jugador de COD:M',
    instructionsPrefix: 'En la app de COD:M ve a',
    disclosureLabel:      'Cómo encontrar tu cuenta de COD:M',
    viewImageInstructions: 'Ver instrucciones con imágenes',
    chips: [
      {
        id: 'uid', label: 'Buscar UID',
        lines: [
          { type: 'text', content: 'UID: tu ID consta de 19 a 20 números' },
          { type: 'para', content: 'En la app de COD:M ve a\n  •  Perfil de jugador > BÁSICO' },
        ],
      },
      {
        id: 'player-id', label: 'Buscar ID de jugador',
        lines: [
          { type: 'text', content: 'ID de jugador: un identificador numérico más corto para tu cuenta' },
          { type: 'para', content: 'En la app de COD:M ve a\n  •  Perfil de jugador > BÁSICO' },
        ],
      },
      {
        id: 'nickname', label: 'Buscar apodo',
        lines: [
          { type: 'text', content: 'Apodo: tu nombre visible dentro del juego' },
          { type: 'para', content: 'En la app de COD:M ve a\n  •  Perfil de jugador > BÁSICO' },
        ],
      },
    ],
  },
  transactionHistory: {
    title:       'Historial de transacciones',
    popoverLink: 'Historial de transacciones',
    filterLabel: 'Filtrar transacciones',
    ranges: { d7: 'Últimos 7 días', d30: 'Últimos 30 días', d90: 'Últimos 90 días' },
    row: {
      paymentStatus: 'Estado del pago',
      orderId:       'ID de pedido',
      transactionId: 'ID de transacción',
      paymentMethod: 'Método de pago',
      totalPayment:  'Pago total',
      noCharge:      'Sin cargo',
    },
    status: { fulfilled: 'Completado', pending: 'En curso', failed: 'Fallido' },
    empty:  'No hay transacciones en este período.',
  },
  page: {
    tabs:                  ['Más vendidos', '2x CP', 'Regalos', 'Nuevos usuarios', 'CP', 'Nuevos usuarios (Imagen)', 'CP (Imagen)'],
    giftTagLabel:          'REGALO GRATIS',
    giftEndsLabel:         'Termina:',
    giftRefreshesLabel:    'Se renueva:',
    promoTitle:            'EXCLUSIVO WEB: OBTÉN 100% DE CP EXTRA + UN REGALO GRATIS',
    promoAction:           'COMPRAR AHORA',
    bestSellerDesc:        'Favoritos de la comunidad: paquetes y equipo de operador mejor valorados.',
    doubleCurrencyDesc:    'Obtén <strong>100%</strong> de bono en artículos seleccionados. Cada artículo se puede comprar solo UNA vez entre la tienda web y el juego.',
    giftsHeading:          'REGALOS',
    giftDailyTitle:        'REGALO DIARIO',
    giftDailySub:          'Caja secreta épica',
    giftLimit:             'Límite:1',
    giftClaimHeading:      'Reclamar regalo',
    giftClaimLabel:        'Estás por reclamar',
    giftClaimCta:          'Reclamar regalo',
    giftClaimDoneCta:      'Cerrar',
    giftClaimedSnackTitle: 'Regalo reclamado',
    giftClaimedSnackBody:  'enviado a tu bandeja de COD:M',
    giftClaimedHeading:    'Regalo reclamado',
    giftClaimedBody:       'se envió a tu bandeja de COD:M.',
    giftClaimedUpsellIntro:'Ya que estás aquí, mira esta oferta hecha para ti',
    newUsersHeading:       'PROMO NUEVOS USUARIOS',
    newUsersDesc:          'Obtén <strong>50%</strong> de descuento en tu primera compra',
    newUsersSub:           'Solo puedes obtener 1 artículo de los siguientes',
    cpDealsHeading:        'Nuevos usuarios (Imagen)',
    cpDealsDesc:           'Obtén <strong>50%</strong> de descuento en tu primera recarga de CP',
    cpDealsSub:            'Solo puedes obtener 1 artículo de los siguientes',
    cpImageSection:        'CP (Imagen)',
  },
}
