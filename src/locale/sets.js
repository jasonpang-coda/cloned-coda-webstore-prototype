/**
 * sets — per-store locale sets (which languages + markets each store serves).
 *
 * Faithful to the translation skills' market lists:
 *  - CODM     → codm-translate     (22 languages / 55 markets)
 *  - FCM      → fcm-translate      (28 languages / 66 markets)
 *  - TDR      → tdr-translate      (29 languages / 65 markets)
 *  - CODASHOP → codashop-translate (27 languages / 64 markets) — the standard
 *    fallback set for stores with no dedicated skill (eFootball, Rogue Trader,
 *    Yu-Gi-Oh! Duel Links).
 *
 * A store module wires one of these into its config (`locale: LOCALE_SETS.fcm`);
 * components never read this file directly — they go through useLocale.
 */

const EU_CORE = ['ES', 'PT', 'DE', 'AT', 'CH', 'FR', 'IT', 'NL', 'DK', 'NO', 'SE', 'PL', 'CZ', 'HU', 'RO', 'TR', 'GB']
const LATAM   = ['AR', 'BO', 'CL', 'CO', 'EC', 'MX', 'PY', 'PE', 'UY', 'BR']
const AFRICA  = ['EG', 'KE', 'MA', 'NG', 'ZA']

export const LOCALE_SETS = {
  codm: {
    defaultMarket: 'US',
    languages: ['en', 'es', 'pt', 'de', 'fr', 'it', 'nl', 'da', 'no', 'sv', 'fi', 'pl', 'cs', 'sk', 'hu', 'ro', 'el', 'tr', 'ru', 'mn', 'ar', 'ja'],
    markets: [
      'US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'IN', 'PK', 'LK', 'NP',
      ...AFRICA, 'BH', 'KW', 'QA', 'AE', 'IQ', 'SA',
      ...LATAM, 'GT', ...EU_CORE.filter(c => c !== 'GB'), 'BE', 'FI', 'SK', 'GR',
      'KZ', 'MN', 'JP',
    ],
  },

  fcm: {
    defaultMarket: 'SG',
    languages: ['en', 'es', 'pt', 'de', 'fr', 'it', 'nl', 'da', 'no', 'sv', 'fi', 'pl', 'cs', 'sk', 'hu', 'ro', 'el', 'tr', 'ru', 'mn', 'ar', 'zh-Hant', 'ja', 'th', 'id', 'km', 'lo', 'my'],
    markets: [
      'US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'IN', 'PK', 'LK', 'NP', 'BD', 'MY', 'PH', 'SG', 'TL',
      ...AFRICA, 'BH', 'KW', 'QA', 'AE', 'IQ', 'SA',
      ...LATAM, 'GT', ...EU_CORE.filter(c => c !== 'GB'), 'FI', 'SK', 'GR',
      'KZ', 'MN',
      'HK', 'TW', 'JP', 'TH', 'ID', 'KH', 'LA', 'MM',
    ],
  },

  tdr: {
    defaultMarket: 'SG',
    languages: ['en', 'es', 'pt', 'de', 'fr', 'it', 'nl', 'da', 'no', 'sv', 'fi', 'pl', 'cs', 'sk', 'hu', 'ro', 'el', 'tr', 'ru', 'mn', 'ar', 'zh-Hant', 'ja', 'ko', 'th', 'id', 'km', 'lo', 'my'],
    markets: [
      'US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'IN', 'PK', 'LK', 'NP', 'MY', 'PH', 'SG', 'TL',
      ...AFRICA, 'KW', 'QA', 'AE', 'SA',
      ...LATAM, 'GT', ...EU_CORE.filter(c => c !== 'GB'), 'BE', 'FI', 'SK', 'GR',
      'KZ', 'MN',
      'HK', 'TW', 'JP', 'KR', 'TH', 'ID', 'KH', 'LA', 'MM',
    ],
  },

  codashop: {
    defaultMarket: 'SG',
    languages: ['en', 'es', 'pt', 'de', 'fr', 'it', 'nl', 'da', 'no', 'sv', 'pl', 'cs', 'hu', 'ro', 'tr', 'ru', 'mn', 'ar', 'zh-Hant', 'ja', 'ko', 'th', 'vi', 'id', 'km', 'lo', 'my'],
    markets: [
      'US', 'CA', 'GB', 'AU', 'NZ', 'IN', 'PK', 'LK', 'NP', 'BD', 'MY', 'PH', 'SG', 'TL',
      ...AFRICA, 'BH', 'KW', 'QA', 'AE', 'IQ', 'SA',
      ...LATAM, ...EU_CORE.filter(c => c !== 'GB'), 'BE',
      'KZ', 'MN',
      'HK', 'TW', 'JP', 'KR', 'TH', 'VN', 'ID', 'KH', 'LA', 'MM',
    ],
  },
}
