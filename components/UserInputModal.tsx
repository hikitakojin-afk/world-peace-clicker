'use client'

import { useState } from 'react'
import { countries } from '@/lib/countries'
import { AgeGroup, UserProfile } from '@/types'
import { Locale } from '@/lib/i18n'

interface UserInputModalProps {
  onSubmit: (profile: UserProfile) => void
  translations: Record<string, any>
  locale: Locale
}

const ageGroups: AgeGroup[] = ['0-12', '13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']

export function UserInputModal({ onSubmit, translations, locale }: UserInputModalProps) {
  const [countryCode, setCountryCode] = useState('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!countryCode || !ageGroup) return

    const country = countries.find(c => c.code === countryCode)
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    onSubmit({
      countryCode,
      countryName: country?.name[locale] || country?.name.en || countryCode,
      ageGroup: ageGroup as AgeGroup,
      sessionId
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-2 text-pink-600">
          {translations.inputModal.title}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {translations.inputModal.description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.inputModal.country}
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            >
              <option value="">Select...</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name[locale] || country.name.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.inputModal.age}
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            >
              <option value="">Select...</option>
              {ageGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg"
          >
            {translations.inputModal.submit}
          </button>
        </form>
      </div>
    </div>
  )
}
