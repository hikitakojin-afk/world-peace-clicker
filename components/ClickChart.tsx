'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Locale } from '@/lib/i18n'
import { translations } from '@/lib/i18n'
import { DailyStat } from '@/types'

interface ClickChartProps {
  locale: Locale
  dailyStats: DailyStat[]
}

export function ClickChart({ locale, dailyStats }: ClickChartProps) {
  const t = translations[locale]

  // Format dates for display (e.g. "MM/DD")
  const data = dailyStats.map(stat => {
    const d = new Date(stat.date)
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      clicks: Number(stat.clicks)
    }
  })

  // If there's no data yet, show an empty state or 0
  if (data.length === 0) {
    const today = new Date()
    data.push({ date: `${today.getMonth() + 1}/${today.getDate()}`, clicks: 0 })
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mt-12 max-w-6xl mx-auto">
      <h3 className="text-2xl font-bold text-blue-600 mb-6">{t.clickTrend}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
