/**
 * FC Mobile — Indonesian (id) copy. PARTIAL override of ../store.js `strings`;
 * omitted keys fall back to English. Proper nouns / currency (FC Mobile,
 * EA Sports FC™, FC Points, FC, MP, item names) left untranslated. Natural UI
 * register; Indonesian strings are typically the same length as English or
 * shorter — low layout risk.
 */
export default {
  checkout: {
    actionLabel: 'Checkout',
  },
  sku: {
    bonusLabel: 'Bonus FC Points',
    bestSeller: 'TERLARIS',
    bestValue:  'NILAI TERBAIK',
  },
  nav: {
    groups: [{
      label: 'Toko',
      children: [
        { label: 'Perlengkapan Harian', anchor: 'daily-supplies' },
        { label: 'Penawaran Terbatas',  anchor: 'limited-offers' },
        { label: 'Isi Ulang',          anchor: 'top-ups' },
      ],
    }],
    items: [],
  },
  signIn: {
    cta:           'Masuk',
    openingApp:    'Membuka EA Sports FC<sup>TM</sup> Mobile…',
    qrInstruction: 'Pindai QR code ini dengan perangkat seluler yang sudah masuk ke akun EA Sports FC<sup>TM</sup> Mobile kamu',
    pagePrompt:    'Masuk ke akunmu untuk membeli',
  },
  account: {
    heading:            'AKUN FC MOBILE KAMU',
    playerIdLabel:      'ID Pemain FC Mobile kamu',
    instructionsPrefix: 'Di aplikasi FC Mobile, buka',
    playerCardLabel:    'Profil Pemain',
  },
  transactionHistory: {
    title:       'Riwayat Transaksi',
    popoverLink: 'Riwayat Transaksi',
    filterLabel: 'Filter Transaksi',
    ranges: { d7: '7 hari terakhir', d30: '30 hari terakhir', d90: '90 hari terakhir' },
    row: {
      paymentStatus: 'Status pembayaran',
      orderId:       'ID Pesanan',
      transactionId: 'ID Transaksi',
      paymentMethod: 'Metode Pembayaran',
      totalPayment:  'Total Pembayaran',
      noCharge:      'Tidak ada tagihan',
    },
    status: { fulfilled: 'Selesai', pending: 'Diproses', failed: 'Gagal' },
    empty:  'Tidak ada transaksi pada periode ini.',
  },
  page: {
    tabs:                  ['Terlaris', '2x FC Points', 'Pengguna Baru', 'FC Points'],
    promoTitle:            'EKSKLUSIF WEB: DAPATKAN BONUS FC POINTS + HADIAH GRATIS',
    promoAction:           'BELI SEKARANG',
    doubleCurrencyHeading: '2x FC Points',
    doubleCurrencyDesc:    'Dapatkan bonus <strong>100%</strong> untuk item terpilih. Setiap item hanya bisa dibeli SATU kali di web store maupun dalam game.',
    newUsersHeading:       'PROMO PENGGUNA BARU',
    newUsersDesc:          'Dapatkan diskon <strong>50%</strong> untuk pembelian pertamamu',
    newUsersSub:           'Kamu hanya bisa memilih 1 item dari daftar di bawah',
    currencySection:       'FC Points',
    giftsHeading:          'HADIAH',
    giftLimit:             'Batas: 1',
    giftClaimHeading:      'Klaim Hadiah',
    giftClaimLabel:        'Kamu akan mengklaim',
    giftClaimCta:          'Klaim Hadiah',
    giftClaimDoneCta:      'Tutup',
    giftClaimedHeading:    'Hadiah Diklaim',
    giftClaimedBody:       'telah dikirim ke akun FC Mobile kamu.',
    giftClaimedUpsellIntro: 'Mumpung kamu di sini, lihat penawaran yang dibuat khusus untukmu',
  },
}
