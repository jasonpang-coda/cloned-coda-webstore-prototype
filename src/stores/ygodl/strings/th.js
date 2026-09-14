/**
 * YGO:DL — Thai (th) copy. PARTIAL override of ../store.js `strings`; omitted keys
 * fall back to English. Proper nouns / currency / in-game item names (Yu-Gi-Oh!
 * DUEL LINKS, KONAMI ID, Crystals, Crystal Packs) left untranslated. Arrays
 * supplied whole; `anchor` unchanged. Clean commerce UI voice.
 */
export default {
  checkout: {
    actionLabel: 'ซื้อเลย',
  },
  sku: {
    bonusLabel:      'ฟรี',
    bestSeller:      'แนะนำ',
    bestValue:       'คุ้มค่าที่สุด',
    bonusTag:        'โบนัส',
    webExclusiveTag: 'พิเศษเฉพาะร้านค้าเว็บ',
  },
  nav: {
    groups: [{
      label: 'ร้านค้า',
      children: [
        { label: 'ทั่วไป',        anchor: 'cat-regular' },
        { label: 'จำกัด',         anchor: 'cat-limited' },
        { label: 'รางวัลฟรี',      anchor: 'cat-free-rewards' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'เข้าสู่ระบบเพื่อซื้อ',
    accountLinkPrompt: 'วิธีเชื่อมโยงบัญชีเกมของคุณกับ KONAMI ID',
    mykonami: {
      cta:        'เข้าสู่ระบบด้วย KONAMI ID',
      pagePrompt: 'เข้าสู่ระบบบัญชี KONAMI ID ของคุณเพื่อซื้อ',
      openingApp: 'กำลังเปิด KONAMI ID…',
    },
  },
  account: {
    heading:            'บัญชี KONAMI ID ของคุณ',
    playerIdLabel:      'ID ผู้เล่นของคุณ',
    instructionsPrefix: 'ในแอป Yu-Gi-Oh! DUEL LINKS ไปที่',
    playerCardLabel:    'โปรไฟล์ผู้เล่น',
  },
  page: {
    tabs:                   ['ทั่วไป', 'จำกัด', 'รางวัลฟรี'],
    promoTitle:             'พิเศษเฉพาะร้านค้าเว็บ',
    promoAction:            'ซื้อเลย',
    limitedHeading:         'ข้อเสนอจำกัด',
    giftsHeading:           'รางวัลฟรี',
    giftTagLabel:           'ของขวัญฟรี',
    giftTitle:              'ของขวัญรายสัปดาห์',
    giftSubtitle:           'รับได้สัปดาห์ละครั้ง',
    giftCta:                'รับของขวัญ',
    giftEndsLabel:          'รีเซ็ตใน:',
    giftRefreshesLabel:     'รีเซ็ต:',
    giftClaimHeading:       'รับรางวัล',
    giftClaimLabel:         'คุณกำลังจะรับ',
    giftClaimCta:           'รับรางวัล',
    giftClaimDoneCta:       'ปิด',
    giftClaimedHeading:     'รับรางวัลแล้ว',
    giftClaimedBody:        'ถูกส่งไปยังกล่องข้อความในเกมของคุณแล้ว',
    giftClaimedUpsellIntro: 'ในเมื่อคุณมาถึงแล้ว ลองดูข้อเสนอนี้ที่จัดไว้เพื่อคุณ',
  },
}
