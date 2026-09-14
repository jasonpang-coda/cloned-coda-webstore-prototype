/**
 * FC Mobile — Thai (th) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Proper nouns / currency (FC Mobile, EA Sports FC™,
 * FC Points, FC, MP, item names) left untranslated. Thai is a combining-mark
 * script — ensure line-height ≥ 1.75 in multi-line contexts to avoid clipping.
 */
export default {
  checkout: {
    actionLabel: 'ชำระเงิน',
  },
  sku: {
    bonusLabel: 'โบนัส FC Points',
    bestSeller: 'ขายดีที่สุด',
    bestValue:  'คุ้มค่าที่สุด',
  },
  nav: {
    groups: [{
      label: 'ร้านค้า',
      children: [
        { label: 'ของแจกประจำวัน', anchor: 'daily-supplies' },
        { label: 'ข้อเสนอจำกัด',   anchor: 'limited-offers' },
        { label: 'เติมเงิน',       anchor: 'top-ups' },
      ],
    }],
    items: [],
  },
  signIn: {
    cta:           'เข้าสู่ระบบ',
    openingApp:    'กำลังเปิด EA Sports FC<sup>TM</sup> Mobile…',
    qrInstruction: 'สแกน QR code นี้ด้วยอุปกรณ์มือถือที่เข้าสู่ระบบบัญชี EA Sports FC<sup>TM</sup> Mobile ของคุณ',
    pagePrompt:    'เข้าสู่ระบบบัญชีของคุณเพื่อซื้อ',
  },
  account: {
    heading:            'บัญชี FC Mobile ของคุณ',
    playerIdLabel:      'ID ผู้เล่น FC Mobile ของคุณ',
    instructionsPrefix: 'ในแอป FC Mobile ให้ไปที่',
    playerCardLabel:    'โปรไฟล์ผู้เล่น',
  },
  transactionHistory: {
    title:       'ประวัติการทำรายการ',
    popoverLink: 'ประวัติการทำรายการ',
    filterLabel: 'กรองรายการ',
    ranges: { d7: '7 วันที่ผ่านมา', d30: '30 วันที่ผ่านมา', d90: '90 วันที่ผ่านมา' },
    row: {
      paymentStatus: 'สถานะการชำระเงิน',
      orderId:       'หมายเลขคำสั่งซื้อ',
      transactionId: 'หมายเลขรายการ',
      paymentMethod: 'วิธีการชำระเงิน',
      totalPayment:  'ยอดชำระทั้งหมด',
      noCharge:      'ไม่มีการเรียกเก็บเงิน',
    },
    status: { fulfilled: 'สำเร็จ', pending: 'กำลังดำเนินการ', failed: 'ล้มเหลว' },
    empty:  'ไม่มีรายการในช่วงเวลานี้',
  },
  page: {
    tabs:                  ['ขายดีที่สุด', '2x FC Points', 'ผู้ใช้ใหม่', 'FC Points'],
    promoTitle:            'เฉพาะบนเว็บ: รับ FC Points โบนัส + ของขวัญฟรี',
    promoAction:           'ช้อปเลย',
    doubleCurrencyHeading: '2x FC Points',
    doubleCurrencyDesc:    'รับโบนัส <strong>100%</strong> สำหรับไอเทมที่เลือก แต่ละไอเทมซื้อได้เพียงครั้งเดียวทั้งบนเว็บสโตร์และในเกม',
    newUsersHeading:       'โปรโมชันผู้ใช้ใหม่',
    newUsersDesc:          'รับส่วนลด <strong>50%</strong> สำหรับการซื้อครั้งแรก',
    newUsersSub:           'คุณเลือกได้เพียง 1 ไอเทมจากรายการด้านล่าง',
    currencySection:       'FC Points',
    giftsHeading:          'ของขวัญ',
    giftLimit:             'จำกัด: 1',
    giftClaimHeading:      'รับของขวัญ',
    giftClaimLabel:        'คุณกำลังจะรับ',
    giftClaimCta:          'รับของขวัญ',
    giftClaimDoneCta:      'ปิด',
    giftClaimedHeading:    'รับของขวัญแล้ว',
    giftClaimedBody:       'ถูกส่งไปยังบัญชี FC Mobile ของคุณแล้ว',
    giftClaimedUpsellIntro: 'ในเมื่อคุณอยู่ที่นี่แล้ว ลองดูข้อเสนอนี้ที่จัดมาเพื่อคุณ',
  },
}
