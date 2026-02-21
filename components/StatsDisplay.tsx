'use client'

import { useState } from 'react'
import { CountryStat, AgeGroupStat } from '@/types'
import { Locale } from '@/lib/i18n'
import { getCountryName } from '@/lib/country-names'
import { translations } from '@/lib/i18n'

interface StatsDisplayProps {
  countries: CountryStat[]
  ageGroups: AgeGroupStat[]
  countryLabel: string
  ageLabel: string
  locale: Locale
}

// 国コードから国旗絵文字を生成
function getFlagEmoji(countryCode: string): string {
  if (countryCode === 'OTHER') return '🌍'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function StatsDisplay({ countries, ageGroups, countryLabel, ageLabel, locale }: StatsDisplayProps) {
  const [showAllCountries, setShowAllCountries] = useState(false)
  
  const formatCount = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const t = translations[locale]
  const displayedCountries = showAllCountries ? countries : countries.slice(0, 8)

  return (
    <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-6xl mx-auto">
      {/* 国籍別統計 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-pink-600 mb-4">{countryLabel}</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {displayedCountries.map((country, index) => {
            // 正式国名をローカライズして取得
            const countryName = country.code === 'OTHER' 
              ? (country.name[locale] || country.name.en)
              : getCountryName(country.code, locale)
            
            return (
              <div key={country.code} className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gray-500 w-8">{index + 1}.</span>
                  <span className="text-4xl">{getFlagEmoji(country.code)}</span>
                  <span className="font-medium text-lg">{countryName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{country.percentage.toFixed(2)}%</span>
                  <span className="font-bold text-pink-600 text-lg">{formatCount(country.clicks)}</span>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Show more / Show less ボタン */}
        {countries.length > 8 && (
          <button
            onClick={() => setShowAllCountries(!showAllCountries)}
            className="mt-4 w-full py-2 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            {showAllCountries ? t.showLess : t.showMore}
          </button>
        )}
      </div>

      {/* 年代別統計 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h3 className="text-2xl font-bold text-purple-600 mb-4">{ageLabel}</h3>
        <div className="space-y-2">
          {ageGroups.map((group, index) => (
            <div key={group.group} className="flex items-center justify-between py-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-500 w-8">{index + 1}.</span>
                <span className="font-medium">{group.group}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{group.percentage.toFixed(2)}%</span>
                <span className="font-bold text-purple-600">{formatCount(group.clicks)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
