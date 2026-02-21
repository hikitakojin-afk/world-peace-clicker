'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Locale } from '@/lib/i18n'
import { translations } from '@/lib/i18n'

interface ClickChartProps {
  locale: Locale
  currentTotal: string
}

export function ClickChart({ locale, currentTotal }: ClickChartProps) {
  const t = translations[locale]
  
  // ダミーデータ生成（過去7日分）
  // 実際のデータ収集は別途実装予定
  const generateDummyData = () => {
    const data = []
    const today = new Date()
    const total = BigInt(currentTotal)
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
      
      // 簡易的な増加カーブ（最終日が現在の総数）
      const ratio = (7 - i) / 7
      const clicks = Number((total * BigInt(Math.floor(ratio * 100))) / BigInt(100))
      
      data.push({
        date: dateStr,
        clicks: clicks
      })
    }
    
    return data
  }

  const data = generateDummyData()

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
      <p className="text-sm text-gray-500 mt-4 text-center">
        ※ デモデータ（実際のデータ収集は今後実装予定）
      </p>
    </div>
  )
}
