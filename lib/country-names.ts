import { Locale } from './i18n'

// 国コードから正式国名を返す（ローカライズ対応）
export function getCountryName(countryCode: string, locale: Locale): string {
  const names = countryNames[countryCode]
  if (!names) return countryCode // フォールバック
  return names[locale] || names.en || countryCode
}

// 主要国の正式国名（10言語対応）
const countryNames: Record<string, Partial<Record<Locale, string>>> = {
  // 主要国30か国
  JP: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본', es: 'Japón', fr: 'Japon', de: 'Japan', pt: 'Japão', ru: 'Япония', ar: 'اليابان' },
  US: { ja: 'アメリカ合衆国', en: 'United States', zh: '美国', ko: '미국', es: 'Estados Unidos', fr: 'États-Unis', de: 'Vereinigte Staaten', pt: 'Estados Unidos', ru: 'США', ar: 'الولايات المتحدة' },
  CN: { ja: '中国', en: 'China', zh: '中国', ko: '중국', es: 'China', fr: 'Chine', de: 'China', pt: 'China', ru: 'Китай', ar: 'الصين' },
  KR: { ja: '韓国', en: 'South Korea', zh: '韩国', ko: '대한민국', es: 'Corea del Sur', fr: 'Corée du Sud', de: 'Südkorea', pt: 'Coreia do Sul', ru: 'Южная Корея', ar: 'كوريا الجنوبية' },
  GB: { ja: 'イギリス', en: 'United Kingdom', zh: '英国', ko: '영국', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich', pt: 'Reino Unido', ru: 'Великобритания', ar: 'المملكة المتحدة' },
  FR: { ja: 'フランス', en: 'France', zh: '法国', ko: '프랑스', es: 'Francia', fr: 'France', de: 'Frankreich', pt: 'França', ru: 'Франция', ar: 'فرنسا' },
  DE: { ja: 'ドイツ', en: 'Germany', zh: '德国', ko: '독일', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', pt: 'Alemanha', ru: 'Германия', ar: 'ألمانيا' },
  IT: { ja: 'イタリア', en: 'Italy', zh: '意大利', ko: '이탈리아', es: 'Italia', fr: 'Italie', de: 'Italien', pt: 'Itália', ru: 'Италия', ar: 'إيطاليا' },
  ES: { ja: 'スペイン', en: 'Spain', zh: '西班牙', ko: '스페인', es: 'España', fr: 'Espagne', de: 'Spanien', pt: 'Espanha', ru: 'Испания', ar: 'إسبانيا' },
  BR: { ja: 'ブラジル', en: 'Brazil', zh: '巴西', ko: '브라질', es: 'Brasil', fr: 'Brésil', de: 'Brasilien', pt: 'Brasil', ru: 'Бразилия', ar: 'البرازيل' },
  RU: { ja: 'ロシア', en: 'Russia', zh: '俄罗斯', ko: '러시아', es: 'Rusia', fr: 'Russie', de: 'Russland', pt: 'Rússia', ru: 'Россия', ar: 'روسيا' },
  IN: { ja: 'インド', en: 'India', zh: '印度', ko: '인도', es: 'India', fr: 'Inde', de: 'Indien', pt: 'Índia', ru: 'Индия', ar: 'الهند' },
  CA: { ja: 'カナダ', en: 'Canada', zh: '加拿大', ko: '캐나다', es: 'Canadá', fr: 'Canada', de: 'Kanada', pt: 'Canadá', ru: 'Канада', ar: 'كندا' },
  AU: { ja: 'オーストラリア', en: 'Australia', zh: '澳大利亚', ko: '호주', es: 'Australia', fr: 'Australie', de: 'Australien', pt: 'Austrália', ru: 'Австралия', ar: 'أستراليا' },
  MX: { ja: 'メキシコ', en: 'Mexico', zh: '墨西哥', ko: '멕시코', es: 'México', fr: 'Mexique', de: 'Mexiko', pt: 'México', ru: 'Мексика', ar: 'المكسيك' },
  ID: { ja: 'インドネシア', en: 'Indonesia', zh: '印度尼西亚', ko: '인도네시아', es: 'Indonesia', fr: 'Indonésie', de: 'Indonesien', pt: 'Indonésia', ru: 'Индонезия', ar: 'إندونيسيا' },
  NL: { ja: 'オランダ', en: 'Netherlands', zh: '荷兰', ko: '네덜란드', es: 'Países Bajos', fr: 'Pays-Bas', de: 'Niederlande', pt: 'Países Baixos', ru: 'Нидерланды', ar: 'هولندا' },
  SA: { ja: 'サウジアラビア', en: 'Saudi Arabia', zh: '沙特阿拉伯', ko: '사우디아라비아', es: 'Arabia Saudita', fr: 'Arabie saoudite', de: 'Saudi-Arabien', pt: 'Arábia Saudita', ru: 'Саудовская Аравия', ar: 'المملكة العربية السعودية' },
  TR: { ja: 'トルコ', en: 'Turkey', zh: '土耳其', ko: '튀르키예', es: 'Turquía', fr: 'Turquie', de: 'Türkei', pt: 'Turquia', ru: 'Турция', ar: 'تركيا' },
  CH: { ja: 'スイス', en: 'Switzerland', zh: '瑞士', ko: '스위스', es: 'Suiza', fr: 'Suisse', de: 'Schweiz', pt: 'Suíça', ru: 'Швейцария', ar: 'سويسرا' },
  SE: { ja: 'スウェーデン', en: 'Sweden', zh: '瑞典', ko: '스웨덴', es: 'Suecia', fr: 'Suède', de: 'Schweden', pt: 'Suécia', ru: 'Швеция', ar: 'السويد' },
  PL: { ja: 'ポーランド', en: 'Poland', zh: '波兰', ko: '폴란드', es: 'Polonia', fr: 'Pologne', de: 'Polen', pt: 'Polônia', ru: 'Польша', ar: 'بولندا' },
  BE: { ja: 'ベルギー', en: 'Belgium', zh: '比利时', ko: '벨기에', es: 'Bélgica', fr: 'Belgique', de: 'Belgien', pt: 'Bélgica', ru: 'Бельгия', ar: 'بلجيكا' },
  AR: { ja: 'アルゼンチン', en: 'Argentina', zh: '阿根廷', ko: '아르헨티나', es: 'Argentina', fr: 'Argentine', de: 'Argentinien', pt: 'Argentina', ru: 'Аргентина', ar: 'الأرجنتين' },
  TH: { ja: 'タイ', en: 'Thailand', zh: '泰国', ko: '태국', es: 'Tailandia', fr: 'Thaïlande', de: 'Thailand', pt: 'Tailândia', ru: 'Таиланд', ar: 'تايلاند' },
  VN: { ja: 'ベトナム', en: 'Vietnam', zh: '越南', ko: '베트남', es: 'Vietnam', fr: 'Vietnam', de: 'Vietnam', pt: 'Vietnã', ru: 'Вьетнам', ar: 'فيتنام' },
  PH: { ja: 'フィリピン', en: 'Philippines', zh: '菲律宾', ko: '필리핀', es: 'Filipinas', fr: 'Philippines', de: 'Philippinen', pt: 'Filipinas', ru: 'Филиппины', ar: 'الفلبين' },
  EG: { ja: 'エジプト', en: 'Egypt', zh: '埃及', ko: '이집트', es: 'Egipto', fr: 'Égypte', de: 'Ägypten', pt: 'Egito', ru: 'Египет', ar: 'مصر' },
  ZA: { ja: '南アフリカ', en: 'South Africa', zh: '南非', ko: '남아프리카', es: 'Sudáfrica', fr: 'Afrique du Sud', de: 'Südafrika', pt: 'África do Sul', ru: 'ЮАР', ar: 'جنوب أفريقيا' },
  NG: { ja: 'ナイジェリア', en: 'Nigeria', zh: '尼日利亚', ko: '나이지리아', es: 'Nigeria', fr: 'Nigeria', de: 'Nigeria', pt: 'Nigéria', ru: 'Нигерия', ar: 'نيجيريا' },
  
  // その他の国はここに追加可能
  // フォールバックとして英語名が使われる
}

export default countryNames
