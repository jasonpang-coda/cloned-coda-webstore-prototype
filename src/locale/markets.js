/**
 * markets — canonical market (region) registry, keyed by ISO 3166-1 alpha-2 code.
 *
 * Sources: the market→language mappings in the per-store translation skills
 * (codm-translate / fcm-translate / tdr-translate / codashop-translate). Which
 * subset a store serves is declared in ./sets.js — this is the shared union (68).
 *
 * `name` is the market's native form, with the English name in parens when the
 * native form is non-Latin or unfamiliar (matches Figma 4014:4802 rows —
 * "مصر (Egypt)", "Казахстан (Kazakhstan)", "Österreich").
 * `group` is the selector's continent grouping (Figma column headings).
 * `languages` lists the market's own languages ONLY — English is implicitly
 * available in every region (never duplicated here; useLocale adds it).
 *
 * `rtl` + `englishName` mark markets whose native `name` is Arabic script.
 * useLocale falls back to `englishName` for these when the active language
 * isn't itself RTL — an RTL string mixed into an otherwise LTR sheet reads
 * as a layout glitch (misaligned column, reversed punctuation order).
 */
export const GROUPS = [
  'Africa',
  'Americas',
  'Asia Pacific',
  'Central Asia',
  'Europe',
  'Middle East',
]

export const MARKETS = {
  /* ── Africa ── */
  EG: { code: 'EG', name: 'مصر (Egypt)',            group: 'Africa', languages: ['ar'], rtl: true, englishName: 'Egypt' },
  KE: { code: 'KE', name: 'Kenya',                  group: 'Africa', languages: [] },
  MA: { code: 'MA', name: 'المغرب (Morocco)',       group: 'Africa', languages: ['ar'], rtl: true, englishName: 'Morocco' },
  NG: { code: 'NG', name: 'Nigeria',                group: 'Africa', languages: [] },
  ZA: { code: 'ZA', name: 'South Africa',           group: 'Africa', languages: [] },

  /* ── Americas ── */
  AR: { code: 'AR', name: 'Argentina',              group: 'Americas', languages: ['es'] },
  BO: { code: 'BO', name: 'Bolivia',                group: 'Americas', languages: ['es'] },
  BR: { code: 'BR', name: 'Brasil',                 group: 'Americas', languages: ['pt'] },
  CA: { code: 'CA', name: 'Canada',                 group: 'Americas', languages: [] },
  CL: { code: 'CL', name: 'Chile',                  group: 'Americas', languages: ['es'] },
  CO: { code: 'CO', name: 'Colombia',               group: 'Americas', languages: ['es'] },
  EC: { code: 'EC', name: 'Ecuador',                group: 'Americas', languages: ['es'] },
  GT: { code: 'GT', name: 'Guatemala',              group: 'Americas', languages: ['es'] },
  MX: { code: 'MX', name: 'México',                 group: 'Americas', languages: ['es'] },
  PY: { code: 'PY', name: 'Paraguay',               group: 'Americas', languages: ['es'] },
  PE: { code: 'PE', name: 'Perú (Peru)',            group: 'Americas', languages: ['es'] },
  US: { code: 'US', name: 'United States',          group: 'Americas', languages: [] },
  UY: { code: 'UY', name: 'Uruguay',                group: 'Americas', languages: ['es'] },

  /* ── Asia Pacific ── */
  AU: { code: 'AU', name: 'Australia',              group: 'Asia Pacific', languages: [] },
  BD: { code: 'BD', name: 'বাংলাদেশ (Bangladesh)',   group: 'Asia Pacific', languages: [] },
  HK: { code: 'HK', name: '香港 (Hong Kong)',        group: 'Asia Pacific', languages: ['zh-Hant'] },
  IN: { code: 'IN', name: 'India',                  group: 'Asia Pacific', languages: [] },
  ID: { code: 'ID', name: 'Indonesia',              group: 'Asia Pacific', languages: ['id'] },
  JP: { code: 'JP', name: '日本 (Japan)',            group: 'Asia Pacific', languages: ['ja'] },
  KH: { code: 'KH', name: 'កម្ពុជា (Cambodia)',      group: 'Asia Pacific', languages: ['km'] },
  KR: { code: 'KR', name: '대한민국 (South Korea)',   group: 'Asia Pacific', languages: ['ko'] },
  LA: { code: 'LA', name: 'ລາວ (Laos)',             group: 'Asia Pacific', languages: ['lo'] },
  LK: { code: 'LK', name: 'Sri Lanka',              group: 'Asia Pacific', languages: [] },
  MM: { code: 'MM', name: 'မြန်မာ (Myanmar)',        group: 'Asia Pacific', languages: ['my'] },
  MY: { code: 'MY', name: 'Malaysia',               group: 'Asia Pacific', languages: [] },
  NP: { code: 'NP', name: 'नेपाल (Nepal)',           group: 'Asia Pacific', languages: [] },
  NZ: { code: 'NZ', name: 'New Zealand (Aotearoa)', group: 'Asia Pacific', languages: [] },
  PH: { code: 'PH', name: 'Philippines',            group: 'Asia Pacific', languages: [] },
  PK: { code: 'PK', name: 'Pakistan',               group: 'Asia Pacific', languages: [] },
  SG: { code: 'SG', name: 'Singapore',              group: 'Asia Pacific', languages: [] },
  TH: { code: 'TH', name: 'ไทย (Thailand)',         group: 'Asia Pacific', languages: ['th'] },
  TL: { code: 'TL', name: 'Timor-Leste',            group: 'Asia Pacific', languages: [] },
  TW: { code: 'TW', name: '台灣 (Taiwan)',           group: 'Asia Pacific', languages: ['zh-Hant'] },
  VN: { code: 'VN', name: 'Việt Nam (Vietnam)',     group: 'Asia Pacific', languages: ['vi'] },

  /* ── Central Asia ── */
  KZ: { code: 'KZ', name: 'Казахстан (Kazakhstan)', group: 'Central Asia', languages: ['ru'] },
  MN: { code: 'MN', name: 'Монгол Улс (Mongolia)',  group: 'Central Asia', languages: ['mn'] },

  /* ── Europe ── */
  AT: { code: 'AT', name: 'Österreich',             group: 'Europe', languages: ['de'] },
  BE: { code: 'BE', name: 'Belgique - België',      group: 'Europe', languages: ['nl'] },
  CZ: { code: 'CZ', name: 'Česko',                  group: 'Europe', languages: ['cs'] },
  DK: { code: 'DK', name: 'Danmark',                group: 'Europe', languages: ['da'] },
  FI: { code: 'FI', name: 'Suomi (Finland)',        group: 'Europe', languages: ['fi'] },
  FR: { code: 'FR', name: 'France',                 group: 'Europe', languages: ['fr'] },
  DE: { code: 'DE', name: 'Deutschland',            group: 'Europe', languages: ['de'] },
  GR: { code: 'GR', name: 'Ελλάδα (Greece)',        group: 'Europe', languages: ['el'] },
  HU: { code: 'HU', name: 'Magyarország (Hungary)', group: 'Europe', languages: ['hu'] },
  IE: { code: 'IE', name: 'Ireland',                group: 'Europe', languages: [] },
  IT: { code: 'IT', name: 'Italia',                 group: 'Europe', languages: ['it'] },
  NL: { code: 'NL', name: 'Nederland',              group: 'Europe', languages: ['nl'] },
  NO: { code: 'NO', name: 'Norge',                  group: 'Europe', languages: ['no'] },
  PL: { code: 'PL', name: 'Polska',                 group: 'Europe', languages: ['pl'] },
  PT: { code: 'PT', name: 'Portugal',               group: 'Europe', languages: ['pt'] },
  RO: { code: 'RO', name: 'România',                group: 'Europe', languages: ['ro'] },
  SK: { code: 'SK', name: 'Slovensko (Slovakia)',   group: 'Europe', languages: ['sk'] },
  ES: { code: 'ES', name: 'España',                 group: 'Europe', languages: ['es'] },
  SE: { code: 'SE', name: 'Sverige',                group: 'Europe', languages: ['sv'] },
  CH: { code: 'CH', name: 'Schweiz - Suisse',       group: 'Europe', languages: ['de'] },
  TR: { code: 'TR', name: 'Türkiye',                group: 'Europe', languages: ['tr'] },
  GB: { code: 'GB', name: 'United Kingdom',         group: 'Europe', languages: [] },

  /* ── Middle East ── */
  BH: { code: 'BH', name: 'البحرين (Bahrain)',      group: 'Middle East', languages: [], rtl: true, englishName: 'Bahrain' },
  IQ: { code: 'IQ', name: 'العراق (Iraq)',          group: 'Middle East', languages: ['ar'], rtl: true, englishName: 'Iraq' },
  KW: { code: 'KW', name: 'الكويت (Kuwait)',        group: 'Middle East', languages: [], rtl: true, englishName: 'Kuwait' },
  QA: { code: 'QA', name: 'قطر (Qatar)',            group: 'Middle East', languages: [], rtl: true, englishName: 'Qatar' },
  SA: { code: 'SA', name: 'السعودية (Saudi Arabia)', group: 'Middle East', languages: ['ar'], rtl: true, englishName: 'Saudi Arabia' },
  AE: { code: 'AE', name: 'الإمارات (UAE)',          group: 'Middle East', languages: [], rtl: true, englishName: 'UAE' },
}
