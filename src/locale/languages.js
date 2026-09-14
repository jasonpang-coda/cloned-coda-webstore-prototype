/**
 * languages — canonical language registry (union of every store's supported set).
 *
 * Sources: the per-store translation skills (codm-translate 22 / fcm-translate 28 /
 * tdr-translate 29 / codashop-translate 27). Which subset a store actually offers
 * is declared in ./sets.js — this file is the shared, store-agnostic union (30).
 *
 * `endonym` is the language's own name for itself — the selector lists endonyms
 * (Figma 4016:6248 shows "English" / "中文"), never exonyms.
 */
export const LANGUAGES = {
  en:        { code: 'en',      endonym: 'English',          englishName: 'English',             rtl: false },
  es:        { code: 'es',      endonym: 'Español',          englishName: 'Spanish',             rtl: false },
  pt:        { code: 'pt',      endonym: 'Português',        englishName: 'Portuguese',          rtl: false },
  de:        { code: 'de',      endonym: 'Deutsch',          englishName: 'German',              rtl: false },
  fr:        { code: 'fr',      endonym: 'Français',         englishName: 'French',              rtl: false },
  it:        { code: 'it',      endonym: 'Italiano',         englishName: 'Italian',             rtl: false },
  nl:        { code: 'nl',      endonym: 'Nederlands',       englishName: 'Dutch',               rtl: false },
  da:        { code: 'da',      endonym: 'Dansk',            englishName: 'Danish',              rtl: false },
  no:        { code: 'no',      endonym: 'Norsk',            englishName: 'Norwegian',           rtl: false },
  sv:        { code: 'sv',      endonym: 'Svenska',          englishName: 'Swedish',             rtl: false },
  fi:        { code: 'fi',      endonym: 'Suomi',            englishName: 'Finnish',             rtl: false },
  pl:        { code: 'pl',      endonym: 'Polski',           englishName: 'Polish',              rtl: false },
  cs:        { code: 'cs',      endonym: 'Čeština',          englishName: 'Czech',               rtl: false },
  sk:        { code: 'sk',      endonym: 'Slovenčina',       englishName: 'Slovak',              rtl: false },
  hu:        { code: 'hu',      endonym: 'Magyar',           englishName: 'Hungarian',           rtl: false },
  ro:        { code: 'ro',      endonym: 'Română',           englishName: 'Romanian',            rtl: false },
  el:        { code: 'el',      endonym: 'Ελληνικά',         englishName: 'Greek',               rtl: false },
  tr:        { code: 'tr',      endonym: 'Türkçe',           englishName: 'Turkish',             rtl: false },
  ru:        { code: 'ru',      endonym: 'Русский',          englishName: 'Russian',             rtl: false },
  mn:        { code: 'mn',      endonym: 'Монгол',           englishName: 'Mongolian',           rtl: false },
  ar:        { code: 'ar',      endonym: 'العربية',          englishName: 'Arabic',              rtl: true  },
  'zh-Hant': { code: 'zh-Hant', endonym: '繁體中文',          englishName: 'Chinese Traditional', rtl: false },
  ja:        { code: 'ja',      endonym: '日本語',            englishName: 'Japanese',            rtl: false },
  ko:        { code: 'ko',      endonym: '한국어',            englishName: 'Korean',              rtl: false },
  th:        { code: 'th',      endonym: 'ไทย',              englishName: 'Thai',                rtl: false },
  vi:        { code: 'vi',      endonym: 'Tiếng Việt',       englishName: 'Vietnamese',          rtl: false },
  id:        { code: 'id',      endonym: 'Bahasa Indonesia', englishName: 'Indonesian',          rtl: false },
  km:        { code: 'km',      endonym: 'ខ្មែរ',             englishName: 'Khmer',               rtl: false },
  lo:        { code: 'lo',      endonym: 'ລາວ',              englishName: 'Lao',                 rtl: false },
  my:        { code: 'my',      endonym: 'မြန်မာ',            englishName: 'Burmese',             rtl: false },
}
