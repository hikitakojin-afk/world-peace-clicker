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

    // トランザクションとして全てのカウントを記録する単一のRPCを呼び出す
    const today = new Date().toISOString().split('T')[0]
    const { data: txData, error: txError } = await supabaseAdmin.rpc('record_click', {
      p_country_code: countryCode,
      p_age_group: ageGroup,
      p_date: today
    })

    if (txError) throw txError
    if (!txData || txData.length === 0) throw new Error('Failed to update counts atomically')

    const clickResult = txData[0] // Record_click は TABLE を返すため、最初の行を取得

    // RPC内で目標達成済みと判定された場合
    if (!clickResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'GOAL_REACHED',
          message: 'Goal already reached'
        }
      } as ClickResponse, { status: 403 })
    }

    const { total_clicks: updatedTotal, is_cleared: isCleared, cleared_at: clearedAt } = clickResult

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
        totalClicks: updatedTotal.toString(),
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
