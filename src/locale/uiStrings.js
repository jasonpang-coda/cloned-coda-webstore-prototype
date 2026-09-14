/**
 * uiStrings — the switcher's own UI copy, localised per language.
 *
 * Scope is deliberately tiny (the store content itself stays English for now):
 * the two selector titles + the search placeholder. Keys are language codes
 * from ./languages.js; useLocale falls back to `en` for any missing key.
 */
export const UI_STRINGS = {
  en:        { selectRegion: 'Select Region',            selectLanguage: 'Select Language',          search: 'Search' },
  es:        { selectRegion: 'Selecciona la región',     selectLanguage: 'Selecciona el idioma',     search: 'Buscar' },
  pt:        { selectRegion: 'Selecionar região',        selectLanguage: 'Selecionar idioma',        search: 'Pesquisar' },
  de:        { selectRegion: 'Region auswählen',         selectLanguage: 'Sprache auswählen',        search: 'Suchen' },
  fr:        { selectRegion: 'Sélectionner la région',   selectLanguage: 'Sélectionner la langue',   search: 'Rechercher' },
  it:        { selectRegion: 'Seleziona la regione',     selectLanguage: 'Seleziona la lingua',      search: 'Cerca' },
  nl:        { selectRegion: 'Regio selecteren',         selectLanguage: 'Taal selecteren',          search: 'Zoeken' },
  da:        { selectRegion: 'Vælg region',              selectLanguage: 'Vælg sprog',               search: 'Søg' },
  no:        { selectRegion: 'Velg region',              selectLanguage: 'Velg språk',               search: 'Søk' },
  sv:        { selectRegion: 'Välj region',              selectLanguage: 'Välj språk',               search: 'Sök' },
  fi:        { selectRegion: 'Valitse alue',             selectLanguage: 'Valitse kieli',            search: 'Hae' },
  pl:        { selectRegion: 'Wybierz region',           selectLanguage: 'Wybierz język',            search: 'Szukaj' },
  cs:        { selectRegion: 'Vyberte region',           selectLanguage: 'Vyberte jazyk',            search: 'Hledat' },
  sk:        { selectRegion: 'Vyberte región',           selectLanguage: 'Vyberte jazyk',            search: 'Hľadať' },
  hu:        { selectRegion: 'Régió kiválasztása',       selectLanguage: 'Nyelv kiválasztása',       search: 'Keresés' },
  ro:        { selectRegion: 'Selectează regiunea',      selectLanguage: 'Selectează limba',         search: 'Caută' },
  el:        { selectRegion: 'Επιλογή περιοχής',         selectLanguage: 'Επιλογή γλώσσας',          search: 'Αναζήτηση' },
  tr:        { selectRegion: 'Bölge seçin',              selectLanguage: 'Dil seçin',                search: 'Ara' },
  ru:        { selectRegion: 'Выберите регион',          selectLanguage: 'Выберите язык',            search: 'Поиск' },
  mn:        { selectRegion: 'Бүс нутгаа сонгох',        selectLanguage: 'Хэлээ сонгох',             search: 'Хайх' },
  ar:        { selectRegion: 'اختر المنطقة',             selectLanguage: 'اختر اللغة',               search: 'بحث' },
  'zh-Hant': { selectRegion: '選擇地區',                  selectLanguage: '選擇語言',                  search: '搜尋' },
  ja:        { selectRegion: '地域を選択',                selectLanguage: '言語を選択',                search: '検索' },
  ko:        { selectRegion: '지역 선택',                 selectLanguage: '언어 선택',                 search: '검색' },
  th:        { selectRegion: 'เลือกภูมิภาค',              selectLanguage: 'เลือกภาษา',                search: 'ค้นหา' },
  vi:        { selectRegion: 'Chọn khu vực',             selectLanguage: 'Chọn ngôn ngữ',            search: 'Tìm kiếm' },
  id:        { selectRegion: 'Pilih Wilayah',            selectLanguage: 'Pilih Bahasa',             search: 'Cari' },
  km:        { selectRegion: 'ជ្រើសរើសតំបន់',             selectLanguage: 'ជ្រើសរើសភាសា',             search: 'ស្វែងរក' },
  lo:        { selectRegion: 'ເລືອກພາກພື້ນ',              selectLanguage: 'ເລືອກພາສາ',                search: 'ຄົ້ນຫາ' },
  my:        { selectRegion: 'ဒေသရွေးချယ်ရန်',            selectLanguage: 'ဘာသာစကားရွေးချယ်ရန်',       search: 'ရှာဖွေရန်' },
}
