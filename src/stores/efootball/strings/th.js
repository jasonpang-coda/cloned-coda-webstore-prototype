/**
 * eFootball™ — Thai (th) copy. PARTIAL override of ../store.js `strings`; omitted
 * keys fall back to English. Proper nouns / currency (eFootball, eFootball Coins,
 * myKONAMI, KONAMI ID) left untranslated. Arrays (nav, page.tabs) must be supplied
 * whole. Voice: clean commerce UI.
 */
export default {
  checkout: {
    actionLabel: 'ชำระเงิน',
  },
  sku: {
    bonusLabel: 'โบนัสเหรียญ',
    bestSeller: 'ขายดีที่สุด',
    bestValue:  'คุ้มค่าที่สุด',
  },
  nav: {
    groups: [{
      label: 'ร้านค้า',
      children: [
        { label: 'เติมเงิน',       anchor: 'top-ups' },
        { label: 'แพ็กเหรียญ',     anchor: 'coin-packs' },
        { label: 'ข้อเสนอพิเศษ',   anchor: 'special-offers' },
      ],
    }],
    items: [],
  },
  signIn: {
    pagePrompt:        'ลงชื่อเข้าใช้เพื่อซื้อ',
    accountLinkPrompt: 'วิธีเชื่อมบัญชีเกมของคุณกับ KONAMI ID',
    mykonami: {
      cta:        'ลงชื่อเข้าใช้ด้วย KONAMI ID',
      pagePrompt: 'ลงชื่อเข้าใช้บัญชี myKONAMI ของคุณเพื่อซื้อ',
      openingApp: 'กำลังเปิด myKONAMI…',
    },
    efootball: {
      cta:           'ลงชื่อเข้าใช้ด้วย eFootball',
      openingApp:    'กำลังเปิด eFootball™…',
      qrInstruction: 'สแกน QR code นี้ด้วยอุปกรณ์มือถือที่ลงชื่อเข้าใช้บัญชี eFootball™ ของคุณ',
      pagePrompt:    'ลงชื่อเข้าใช้บัญชี eFootball™ ของคุณเพื่อซื้อ',
    },
  },
  account: {
    heading:            'บัญชี eFootball™ ของคุณ',
    playerIdLabel:      'ID ผู้เล่น eFootball™ ของคุณ',
    instructionsPrefix: 'ในแอป eFootball™ ไปที่',
    playerCardLabel:    'โปรไฟล์ผู้เล่น',
  },
  page: {
    tabs:        ['เติมเงิน', 'แพ็กเหรียญ', 'ข้อเสนอพิเศษ'],
    promoTitle:  'เฉพาะบนเว็บ: รับโบนัส eFootball Coins',
    promoAction: 'ซื้อเลย',
  },
}
