/**
 * TDR — Thai (th) copy. PARTIAL override of ../store.js `strings`; omitted keys
 * fall back to English. Proper nouns / brand / currency (The Division Resurgence,
 * SHD, Agent, Premium Credits/PC, in-game item names) left untranslated. Complex
 * combining-mark script — ensure line-height ≥ 1.75 in multi-line contexts.
 */
export default {
  checkout: {
    actionLabel: 'ซื้อเลย',
  },
  sku: {
    bonusLabel: 'โบนัสเว็บ',
    bestSeller: 'ขายดีที่สุด',
    bestValue:  'คุ้มค่าที่สุด',
  },
  nav: {
    groups: [{
      label: 'ร้านค้า',
      children: [
        { label: 'ของขวัญ',  anchor: 'cat-gifts' },
        { label: 'เครดิต',   anchor: 'cat-cp' },
      ],
    }],
    items: [{ label: 'แลกรหัส', anchor: null }],
  },
  signIn: {
    cta:               'ลงชื่อเข้าใช้ด้วย The Division',
    openingApp:        'กำลังเปิด The Division Resurgence…',
    qrInstruction:     'สแกน QR code นี้ด้วยอุปกรณ์มือถือที่ลงชื่อเข้าใช้บัญชีของคุณแล้ว',
    pagePrompt:        'ลงชื่อเข้าใช้บัญชีเพื่อซื้อ',
    accountLinkPrompt: 'เชื่อมโยงบัญชีของคุณเพื่อดำเนินการต่อ',
  },
  account: {
    heading:            'บัญชี Division Resurgence ของคุณ',
    playerIdLabel:      'ID Division Resurgence ของคุณ',
    instructionsPrefix: 'ในแอป The Division Resurgence ไปที่',
  },
  page: {
    tabs:                  ['ขายดีที่สุด', '2x เครดิต', 'ของขวัญ', 'ผู้ใช้ใหม่', 'เครดิต'],
    promoTitle:            'พิเศษเฉพาะบนเว็บ: รับเครดิตโบนัส 100% + ของขวัญฟรี',
    promoAction:           'ซื้อเลย',
    bestSellerDesc:        'ยอดนิยมของชุมชน — ชุดรวมและอุปกรณ์เอเจนต์ที่ได้รับคะแนนสูงสุด',
    doubleCurrencyHeading: '2x เครดิต',
    doubleCurrencyDesc:    'รับโบนัส <strong>100%</strong> สำหรับไอเทมที่เลือก แต่ละไอเทมซื้อได้เพียงครั้งเดียวทั้งบนเว็บสโตร์และในเกม',
    giftsHeading:          'ของขวัญ',
    giftDailyTitle:        'ของขวัญประจำวัน',
    giftEmoteTitle:        'อิโมทเอเจนต์',
    giftGunTitle:          'สกินอาวุธ SHD',
    giftLimit:             'จำกัด:1',
    giftClaimHeading:      'รับของขวัญ',
    giftClaimLabel:        'คุณกำลังจะรับ',
    giftClaimCta:          'รับของขวัญ',
    giftClaimDoneCta:      'ปิด',
    giftClaimedHeading:      'รับของขวัญแล้ว',
    giftClaimedBody:         'ถูกส่งไปยังกล่องข้อความในเกมของคุณแล้ว',
    giftClaimedUpsellIntro:  'ในเมื่อคุณมาแล้ว ลองดูข้อเสนอนี้ที่จัดให้คุณโดยเฉพาะ',
    newUsersHeading:       'โปรโมชันเอเจนต์ใหม่',
    newUsersDesc:          'รับส่วนลด <strong>50%</strong> สำหรับการซื้อครั้งแรก',
    newUsersSub:           'คุณสามารถเลือกได้เพียง 1 ไอเทมจากรายการด้านล่าง',
    cpDealsHeading:        'เอเจนต์ใหม่',
    cpDealsDesc:           'รับส่วนลด <strong>50%</strong> สำหรับการเติมเครดิตครั้งแรก',
    cpDealsSub:            'คุณสามารถเลือกได้เพียง 1 ไอเทมจากรายการด้านล่าง',
    cpImageSectionDesc:    'รับส่วนลด 20% สำหรับการซื้อครั้งแรก',
  },
}
