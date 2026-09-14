/**
 * Rogue Trader — Indonesian (id) copy. PARTIAL override of ../store.js `strings`; any
 * key omitted here falls back to English. Proper nouns / brand / currency (Warhammer
 * 40K, Rogue Trader, Voidfarer, Profit Factor / PF, item & edition names) left
 * untranslated. Arrays (nav, page.tabs) supplied whole.
 * Voice: neutral, clean commerce UI (Codashop) — concise, action-oriented.
 */
export default {
  checkout: {
    actionLabel: 'Peroleh',
  },
  sku: {
    bonusLabel: 'BONUS SURAT KUASA',
    bestSeller: 'PALING POPULER',
    bestValue:  'NILAI TERBAIK',
  },
  nav: {
    groups: [{
      label: 'Toko',
      children: [
        { label: 'Game & Edisi', anchor: 'cat-games' },
        { label: 'DLC',          anchor: 'cat-dlc' },
      ],
    }],
    items: [{ label: 'Tukar Kode', anchor: null }],
  },
  signIn: {
    cta:               'Masuk',
    openingApp:        'Membuka Rogue Trader…',
    qrInstruction:     'Pindai kode QR ini dengan perangkat seluler yang masuk ke akun Anda',
    pagePrompt:        'Masuk ke akun Anda untuk membeli',
    accountLinkPrompt: 'Tautkan akun Anda untuk melanjutkan',
  },
  account: {
    heading:            'Rogue Trader Warrant Anda',
    playerIdLabel:      'Rogue Trader ID Anda',
    instructionsPrefix: 'Di aplikasi Rogue Trader, buka',
  },
  page: {
    tabs:                  ['Game & Edisi', 'DLC'],
    promoTitle:            'WARRANT OF TRADE: DAPATKAN VOIDFARER EDITION',
    promoAction:           'BELI SEKARANG',
    bestSellerDesc:        'Edisi dan perbekalan paling diincar di Expanse.',
    doubleCurrencyDesc:    'Dapatkan bonus <strong>100%</strong> untuk surat kuasa terpilih.',
    giftsHeading:          'UPETI',
    giftDailyTitle:        'UPETI HARIAN',
    giftDailySub:          'Relic Cache',
    giftLimit:             'Batas:1',
    giftClaimHeading:      'Klaim Upeti',
    giftClaimLabel:        'Anda akan mengklaim',
    giftClaimCta:          'Klaim Upeti',
    giftClaimDoneCta:      'Tutup',
    giftClaimedHeading:      'Upeti Diklaim',
    giftClaimedBody:         'telah dikirim ke brankas dalam game Anda.',
    giftClaimedUpsellIntro:  'Karena Anda memimpin anjungan ini, pertimbangkan surat kuasa ini',
    newUsersHeading:       'SURAT KUASA VOIDFARERS BARU',
    newUsersDesc:          'Dapatkan diskon <strong>50%</strong> untuk pembelian pertama Anda',
    newUsersSub:           'Anda hanya dapat mengklaim 1 surat kuasa dari yang di bawah',
    cpDealsHeading:        'Voidfarers Baru',
    cpDealsDesc:           'Dapatkan diskon <strong>50%</strong> untuk surat kuasa Profit Factor pertama Anda',
    cpDealsSub:            'Anda hanya dapat mengklaim 1 surat kuasa dari yang di bawah',
    cpImageSectionDesc:    'Dapatkan Profit Factor untuk memperluas jangkauan dinasti Anda',
  },
}
