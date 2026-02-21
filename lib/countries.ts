import { Country } from '@/types'

export const countries: Country[] = [
  { code: 'JP', name: { en: 'Japan', ja: '日本', zh: '日本', ko: '일본', es: 'Japón', fr: 'Japon', de: 'Japan', pt: 'Japão', ru: 'Япония', ar: 'اليابان' } },
  { code: 'US', name: { en: 'United States', ja: 'アメリカ', zh: '美国', ko: '미국', es: 'Estados Unidos', fr: 'États-Unis', de: 'USA', pt: 'EUA', ru: 'США', ar: 'الولايات المتحدة' } },
  { code: 'CN', name: { en: 'China', ja: '中国', zh: '中国', ko: '중국', es: 'China', fr: 'Chine', de: 'China', pt: 'China', ru: 'Китай', ar: 'الصين' } },
  { code: 'IN', name: { en: 'India', ja: 'インド', zh: '印度', ko: '인도', es: 'India', fr: 'Inde', de: 'Indien', pt: 'Índia', ru: 'Индия', ar: 'الهند' } },
  { code: 'BR', name: { en: 'Brazil', ja: 'ブラジル', zh: '巴西', ko: '브라질', es: 'Brasil', fr: 'Brésil', de: 'Brasilien', pt: 'Brasil', ru: 'Бразилия', ar: 'البرازيل' } },
  { code: 'GB', name: { en: 'United Kingdom', ja: 'イギリス', zh: '英国', ko: '영국', es: 'Reino Unido', fr: 'Royaume-Uni', de: 'UK', pt: 'Reino Unido', ru: 'Великобритания', ar: 'المملكة المتحدة' } },
  { code: 'FR', name: { en: 'France', ja: 'フランス', zh: '法国', ko: '프랑스', es: 'Francia', fr: 'France', de: 'Frankreich', pt: 'França', ru: 'Франция', ar: 'فرنسا' } },
  { code: 'DE', name: { en: 'Germany', ja: 'ドイツ', zh: '德国', ko: '독일', es: 'Alemania', fr: 'Allemagne', de: 'Deutschland', pt: 'Alemanha', ru: 'Германия', ar: 'ألمانيا' } },
  { code: 'KR', name: { en: 'South Korea', ja: '韓国', zh: '韩国', ko: '대한민국', es: 'Corea del Sur', fr: 'Corée du Sud', de: 'Südkorea', pt: 'Coreia do Sul', ru: 'Южная Корея', ar: 'كوريا الجنوبية' } },
  { code: 'ES', name: { en: 'Spain', ja: 'スペイン', zh: '西班牙', ko: '스페인', es: 'España', fr: 'Espagne', de: 'Spanien', pt: 'Espanha', ru: 'Испания', ar: 'إسبانيا' } },
  { code: 'RU', name: { en: 'Russia', ja: 'ロシア', zh: '俄罗斯', ko: '러시아', es: 'Rusia', fr: 'Russie', de: 'Russland', pt: 'Rússia', ru: 'Россия', ar: 'روسيا' } },
  { code: 'MX', name: { en: 'Mexico', ja: 'メキシコ', zh: '墨西哥', ko: '멕시코', es: 'México', fr: 'Mexique', de: 'Mexiko', pt: 'México', ru: 'Мексика', ar: 'المكسيك' } },
  { code: 'AU', name: { en: 'Australia', ja: 'オーストラリア', zh: '澳大利亚', ko: '호주', es: 'Australia', fr: 'Australie', de: 'Australien', pt: 'Austrália', ru: 'Австралия', ar: 'أستراليا' } },
  { code: 'CA', name: { en: 'Canada', ja: 'カナダ', zh: '加拿大', ko: '캐나다', es: 'Canadá', fr: 'Canada', de: 'Kanada', pt: 'Canadá', ru: 'Канада', ar: 'كندا' } },
  { code: 'IT', name: { en: 'Italy', ja: 'イタリア', zh: '意大利', ko: '이탈리아', es: 'Italia', fr: 'Italie', de: 'Italien', pt: 'Itália', ru: 'Италия', ar: 'إيطاليا' } },
]

export function getCountryName(code: string, locale: string): string {
  const country = countries.find(c => c.code === code)
  return country?.name[locale] || country?.name.en || code
}
