import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { GlobalStats } from '@/types'

const TOP_COUNTRIES_COUNT = 20

export async function GET() {
  try {
    // 総カウント取得
    const { data: globalData, error: globalError } = await supabase
      .from('global_count')
      .select('*')
      .eq('id', 1)
      .single()

    if (globalError) throw globalError

    // 国籍別統計（全件取得）
    const { data: allCountryData, error: countryError } = await supabase
      .from('country_stats')
      .select('*')
      .order('clicks', { ascending: false })

    if (countryError) throw countryError

    const totalClicks = BigInt(globalData.total_clicks)

    // 統計から総クリック数を計算
    const countryTotalClicks = allCountryData.reduce((sum, c) => sum + BigInt(c.clicks), BigInt(0))

    const topCountries = allCountryData.slice(0, TOP_COUNTRIES_COUNT)
    const otherCountries = allCountryData.slice(TOP_COUNTRIES_COUNT)

    const countries = topCountries.map(c => ({
      code: c.country_code,
      name: c.country_name,
      clicks: c.clicks.toString(),
      percentage: countryTotalClicks > BigInt(0) ? Number((BigInt(c.clicks) * BigInt(10000)) / countryTotalClicks) / 100 : 0
    }))

    if (otherCountries.length > 0) {
      const otherClicks = otherCountries.reduce((sum, c) => sum + BigInt(c.clicks), BigInt(0))
      countries.push({
        code: 'OTHER',
        name: { en: 'Other', ja: 'その他', zh: '其他', ko: '기타', es: 'Otros', fr: 'Autres', de: 'Andere', pt: 'Outros', ru: 'Прочие', ar: 'آخرون' },
        clicks: otherClicks.toString(),
        percentage: countryTotalClicks > BigInt(0) ? Number((otherClicks * BigInt(10000)) / countryTotalClicks) / 100 : 0
      })
    }

    // 年代別統計
    const { data: ageData, error: ageError } = await supabase
      .from('age_group_stats')
      .select('*')
      .order('age_group', { ascending: true })

    if (ageError) throw ageError

    // 年代別の総クリック数を計算
    const ageTotalClicks = ageData.reduce((sum, a) => sum + BigInt(a.clicks), BigInt(0))

    const ageGroups = ageData.map(a => ({
      group: a.age_group,
      clicks: a.clicks.toString(),
      percentage: ageTotalClicks > BigInt(0) ? Number((BigInt(a.clicks) * BigInt(10000)) / ageTotalClicks) / 100 : 0
    }))

    // 日別統計 (過去7日分)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_stats')
      .select('*')
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (dailyError) throw dailyError

    const dailyStats = dailyData ? dailyData.map(d => ({
      date: d.date,
      clicks: d.clicks.toString()
    })) : []

    const stats: GlobalStats = {
      totalClicks: globalData.total_clicks.toString(),
      clearThreshold: globalData.clear_threshold.toString(),
      isCleared: globalData.is_cleared,
      clearedAt: globalData.cleared_at,
      countries,
      ageGroups,
      dailyStats
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}

// キャッシュ設定（5秒）
export const revalidate = 5
