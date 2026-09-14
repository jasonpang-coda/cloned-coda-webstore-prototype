/**
 * Rogue Trader — Thai (th) copy. PARTIAL override of ../store.js `strings`; any key
 * omitted here falls back to English. Proper nouns / brand / currency (Warhammer
 * 40K, Rogue Trader, Voidfarer, Profit Factor / PF, item & edition names) left
 * untranslated. Arrays (nav, page.tabs) supplied whole.
 * Voice: neutral, clean commerce UI (Codashop) — concise, action-oriented.
 */
export default {
  checkout: {
    actionLabel: 'รับไว้',
  },
  sku: {
    bonusLabel: 'โบนัสใบมอบอำนาจ',
    bestSeller: 'ยอดนิยม',
    bestValue:  'คุ้มค่าที่สุด',
  },
  nav: {
    groups: [{
      label: 'ร้านค้า',
      children: [
        { label: 'เกมและรุ่น', anchor: 'cat-games' },
        { label: 'DLC',        anchor: 'cat-dlc' },
      ],
    }],
    items: [{ label: 'แลกโค้ด', anchor: null }],
  },
  signIn: {
    cta:               'เข้าสู่ระบบ',
    openingApp:        'กำลังเปิด Rogue Trader…',
    qrInstruction:     'สแกน QR code นี้ด้วยอุปกรณ์มือถือที่เข้าสู่ระบบบัญชีของคุณแล้ว',
    pagePrompt:        'เข้าสู่ระบบบัญชีของคุณเพื่อซื้อ',
    accountLinkPrompt: 'เชื่อมโยงบัญชีของคุณเพื่อดำเนินการต่อ',
  },
  account: {
    heading:            'Rogue Trader Warrant ของคุณ',
    playerIdLabel:      'Rogue Trader ID ของคุณ',
    instructionsPrefix: 'ในแอป Rogue Trader ไปที่',
  },
  page: {
    tabs:                  ['เกมและรุ่น', 'DLC'],
    promoTitle:            'WARRANT OF TRADE: รับ VOIDFARER EDITION',
    promoAction:           'ซื้อเลย',
    bestSellerDesc:        'รุ่นและเสบียงที่เป็นที่ต้องการมากที่สุดใน Expanse',
    doubleCurrencyDesc:    'รับโบนัส <strong>100%</strong> สำหรับใบมอบอำนาจที่เลือก',
    giftsHeading:          'เครื่องบรรณาการ',
    giftDailyTitle:        'เครื่องบรรณาการรายวัน',
    giftDailySub:          'Relic Cache',
    giftLimit:             'จำกัด:1',
    giftClaimHeading:      'รับเครื่องบรรณาการ',
    giftClaimLabel:        'คุณกำลังจะรับ',
    giftClaimCta:          'รับเครื่องบรรณาการ',
    giftClaimDoneCta:      'ปิด',
    giftClaimedHeading:      'รับเครื่องบรรณาการแล้ว',
    giftClaimedBody:         'ถูกส่งไปยังคลังในเกมของคุณแล้ว',
    giftClaimedUpsellIntro:  'ในเมื่อคุณบัญชาการสะพานเดินเรือนี้ ลองดูใบมอบอำนาจนี้',
    newUsersHeading:       'ใบมอบอำนาจสำหรับ VOIDFARERS ใหม่',
    newUsersDesc:          'รับส่วนลด <strong>50%</strong> สำหรับการซื้อครั้งแรกของคุณ',
    newUsersSub:           'คุณรับใบมอบอำนาจได้เพียง 1 รายการจากด้านล่างเท่านั้น',
    cpDealsHeading:        'Voidfarers ใหม่',
    cpDealsDesc:           'รับส่วนลด <strong>50%</strong> สำหรับใบมอบอำนาจ Profit Factor แรกของคุณ',
    cpDealsSub:            'คุณรับใบมอบอำนาจได้เพียง 1 รายการจากด้านล่างเท่านั้น',
    cpImageSectionDesc:    'รับ Profit Factor เพื่อขยายอิทธิพลของราชวงศ์ของคุณ',
  },
}
