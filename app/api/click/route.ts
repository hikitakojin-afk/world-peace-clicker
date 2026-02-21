import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ClickResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { countryCode, ageGroup, sessionId } = body

    // バリデーション
    if (!countryCode || !ageGroup || !sessionId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing required fields'
        }
      } as ClickResponse, { status: 400 })
    }

    // 現在のカウント取得
    const { data: currentData } = await supabaseAdmin
      .from('global_count')
      .select('total_clicks, clear_threshold, is_cleared, cleared_at')
      .eq('id', 1)
      .single()

    if (!currentData) throw new Error('Failed to fetch global count')

    // カウント更新
    const newCount = BigInt(currentData.total_clicks) + BigInt(1)
    const { data: globalData, error: globalError } = await supabaseAdmin
      .from('global_count')
      .update({ 
        total_clicks: newCount.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select('total_clicks, clear_threshold, is_cleared, cleared_at')
      .single()

    if (globalError) throw globalError

    // 国籍別カウント更新
    await supabaseAdmin.rpc('increment_country', {
      p_country_code: countryCode
    })

    // 年代別カウント更新
    await supabaseAdmin.rpc('increment_age_group', {
      p_age_group: ageGroup
    })

    // クリア判定
    let isCleared = globalData.is_cleared
    let clearedAt = globalData.cleared_at

    if (!isCleared && BigInt(globalData.total_clicks) >= BigInt(globalData.clear_threshold)) {
      const now = new Date().toISOString()
      await supabaseAdmin
        .from('global_count')
        .update({ is_cleared: true, cleared_at: now })
        .eq('id', 1)
      
      isCleared = true
      clearedAt = now
    }

    // 統計取得（ランキング）
    const { data: countryStats } = await supabaseAdmin
      .from('country_stats')
      .select('country_code, clicks')
      .order('clicks', { ascending: false })

    const { data: ageStats } = await supabaseAdmin
      .from('age_group_stats')
      .select('age_group, clicks')
      .order('clicks', { ascending: false })

    const countryRank = countryStats?.findIndex(s => s.country_code === countryCode) ?? -1
    const ageGroupRank = ageStats?.findIndex(s => s.age_group === ageGroup) ?? -1

    return NextResponse.json({
      success: true,
      data: {
        totalClicks: globalData.total_clicks.toString(),
        isCleared,
        clearedAt,
        countryRank: countryRank + 1,
        ageGroupRank: ageGroupRank + 1
      }
    } as ClickResponse)

  } catch (error) {
    console.error('Click API error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    } as ClickResponse, { status: 500 })
  }
}
