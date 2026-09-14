/**
 * eFootball™ — Indonesian (id) copy. PARTIAL override of ../store.js `strings`;
 * omitted keys fall back to English. Proper nouns / currency (eFootball, eFootball
 * Coins, myKONAMI, KONAMI ID) left untranslated. Arrays (nav, page.tabs) must be
 * supplied whole. Voice: clean commerce UI.
 */
export default {
  checkout: {
    actionLabel: 'Checkout',
  },
  sku: {
    bonusLabel: 'Bonus Coins',
    bestSeller: 'TERLARIS',
    bestValue:  'PALING HEMAT',
  },
  nav: {
    groups: [{
      label: 'Toko',
      children: [
        { label: 'Isi Ulang',      anchor: 'top-ups' },
        { label: 'Paket Coins',    anchor: 'coin-packs' },
        { label: 'Penawaran Khusus', anchor: 'special-offers' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'Masuk untuk membeli',
    accountLinkPrompt: 'Cara menautkan akun game Anda dengan KONAMI ID',
    mykonami: {
      cta:        'Masuk dengan KONAMI ID',
      pagePrompt: 'Masuk ke akun myKONAMI Anda untuk membeli',
      openingApp: 'Membuka myKONAMI…',
    },
    efootball: {
      cta:           'Masuk dengan eFootball',
      openingApp:    'Membuka eFootball™…',
      qrInstruction: 'Pindai kode QR ini dengan perangkat seluler yang masuk ke akun eFootball™ Anda',
      pagePrompt:    'Masuk ke akun eFootball™ Anda untuk membeli',
    },
  },
  account: {
    heading:            'AKUN EFOOTBALL™ ANDA',
    playerIdLabel:      'ID Pemain eFootball™ Anda',
    instructionsPrefix: 'Di aplikasi eFootball™ buka',
    playerCardLabel:    'Profil Pemain',
  },
  page: {
    tabs:        ['Isi Ulang', 'Paket Coins', 'Penawaran Khusus'],
    promoTitle:  'EKSKLUSIF WEB: DAPATKAN BONUS eFootball Coins',
    promoAction: 'BELI SEKARANG',
  },
}
