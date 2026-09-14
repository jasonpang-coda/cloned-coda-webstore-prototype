/**
 * TDR — Indonesian (id) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Proper nouns / brand / currency (The Division
 * Resurgence, SHD, Agent, Premium Credits/PC, in-game item names) left
 * untranslated. Natural UI register; strings are typically ≈ English length.
 */
export default {
  checkout: {
    actionLabel: 'Beli Sekarang',
  },
  sku: {
    bonusLabel: 'BONUS WEB',
    bestSeller: 'TERLARIS',
    bestValue:  'PALING HEMAT',
  },
  nav: {
    groups: [{
      label: 'Toko',
      children: [
        { label: 'Hadiah', anchor: 'cat-gifts' },
        { label: 'Kredit', anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'Penukaran Kode', anchor: null }],
  },
  signIn: {
    cta:               'Masuk dengan The Division',
    openingApp:        'Membuka The Division Resurgence…',
    qrInstruction:     'Pindai kode QR ini dengan perangkat seluler yang masuk ke akun Anda',
    pagePrompt:        'Masuk ke akun Anda untuk membeli',
    accountLinkPrompt: 'Tautkan akun Anda untuk melanjutkan',
  },
  account: {
    heading:            'Akun Division Resurgence Anda',
    playerIdLabel:      'ID Division Resurgence Anda',
    instructionsPrefix: 'Di aplikasi The Division Resurgence buka',
  },
  page: {
    tabs:                  ['Terlaris', '2x Kredit', 'Hadiah', 'Pengguna Baru', 'Kredit'],
    promoTitle:            'EKSKLUSIF WEB: DAPATKAN 100% BONUS KREDIT + HADIAH GRATIS',
    promoAction:           'BELI SEKARANG',
    bestSellerDesc:        'Favorit komunitas — paket dan perlengkapan agen dengan rating tertinggi.',
    doubleCurrencyHeading: '2x Kredit',
    doubleCurrencyDesc:    'Dapatkan bonus <strong>100%</strong> untuk item tertentu. Setiap item hanya dapat dibeli SEKALI di toko web dan dalam game.',
    giftsHeading:          'HADIAH',
    giftDailyTitle:        'HADIAH HARIAN',
    giftEmoteTitle:        'EMOTE AGEN',
    giftGunTitle:          'SKIN SENJATA SHD',
    giftLimit:             'Batas:1',
    giftClaimHeading:      'Klaim Hadiah',
    giftClaimLabel:        'Anda akan mengklaim',
    giftClaimCta:          'Klaim Hadiah',
    giftClaimDoneCta:      'Tutup',
    giftClaimedHeading:      'Hadiah Diklaim',
    giftClaimedBody:         'telah dikirim ke kotak masuk dalam game Anda.',
    giftClaimedUpsellIntro:  'Mumpung di sini, lihat penawaran khusus untuk Anda ini',
    newUsersHeading:       'PROMO AGEN BARU',
    newUsersDesc:          'Dapatkan diskon <strong>50%</strong> untuk pembelian pertama Anda',
    newUsersSub:           'Anda hanya dapat memperoleh 1 item dari daftar di bawah',
    cpDealsHeading:        'Agen Baru',
    cpDealsDesc:           'Dapatkan diskon <strong>50%</strong> untuk pengisian Kredit pertama Anda',
    cpDealsSub:            'Anda hanya dapat memperoleh 1 item dari daftar di bawah',
    cpImageSectionDesc:    'Dapatkan diskon 20% untuk pembelian pertama Anda',
  },
}
