/**
 * YGO:DL — Indonesian (id) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Proper nouns / currency / in-game item names (Yu-Gi-Oh!
 * DUEL LINKS, KONAMI ID, Crystals, Crystal Packs) left untranslated. Arrays supplied
 * whole; `anchor` unchanged. Clean commerce UI voice.
 */
export default {
  checkout: {
    actionLabel: 'Beli Sekarang',
  },
  sku: {
    bonusLabel:      'Gratis',
    bestSeller:      'DIREKOMENDASIKAN',
    bestValue:       'NILAI TERBAIK',
    bonusTag:        'BONUS',
    webExclusiveTag: 'EKSKLUSIF TOKO WEB',
  },
  nav: {
    groups: [{
      label: 'Toko',
      children: [
        { label: 'Reguler',        anchor: 'cat-regular' },
        { label: 'Terbatas',       anchor: 'cat-limited' },
        { label: 'Hadiah Gratis',  anchor: 'cat-free-rewards' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'Masuk untuk membeli',
    accountLinkPrompt: 'Cara menautkan akun game Anda dengan KONAMI ID',
    mykonami: {
      cta:        'Masuk dengan KONAMI ID',
      pagePrompt: 'Masuk ke akun KONAMI ID Anda untuk membeli',
      openingApp: 'Membuka KONAMI ID…',
    },
  },
  account: {
    heading:            'AKUN KONAMI ID ANDA',
    playerIdLabel:      'ID Pemain Anda',
    instructionsPrefix: 'Di aplikasi Yu-Gi-Oh! DUEL LINKS, buka',
    playerCardLabel:    'Profil Pemain',
  },
  page: {
    tabs:                   ['Reguler', 'Terbatas', 'Hadiah Gratis'],
    promoTitle:             'EKSKLUSIF TOKO WEB',
    promoAction:            'BELI SEKARANG',
    limitedHeading:         'Penawaran Terbatas',
    giftsHeading:           'Hadiah Gratis',
    giftTagLabel:           'HADIAH GRATIS',
    giftTitle:              'HADIAH MINGGUAN',
    giftSubtitle:           'Tersedia sekali seminggu',
    giftCta:                'Klaim',
    giftEndsLabel:          'Diperbarui dalam:',
    giftRefreshesLabel:     'Diperbarui:',
    giftClaimHeading:       'Klaim hadiah',
    giftClaimLabel:         'Anda akan mengklaim',
    giftClaimCta:           'Klaim hadiah',
    giftClaimDoneCta:       'Tutup',
    giftClaimedHeading:     'Hadiah diklaim',
    giftClaimedBody:        'telah dikirim ke kotak masuk dalam game Anda.',
    giftClaimedUpsellIntro: 'Karena Anda di sini, lihat penawaran khusus untuk Anda ini',
  },
}
