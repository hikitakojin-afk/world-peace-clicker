import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// 日別統計を手動で集計するAPI
// ブラウザコンソールから collectDailyStats() を実行して呼び出す
export async function POST() {
  try {
    // 現在の総クリック数を取得
    const { data: globalData, error: globalError } = await supabaseAdmin
      .from('global_count')
      .select('total_clicks')
      .eq('id', 1)
      .single()

    if (globalError) throw globalError
    if (!globalData) throw new Error('Failed to fetch global count')

    // 今日の日付（UTC）
    const today = new Date().toISOString().split('T')[0]

    // daily_statsテーブルに保存（存在しない場合は作成を促す）
    const { error: insertError } = await supabaseAdmin
      .from('daily_stats')
      .upsert({
        date: today,
        total_clicks: globalData.total_clicks,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date'
      })

    if (insertError) {
      // テーブルが存在しない場合のエラーメッセージ
      if (insertError.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: {
            code: 'TABLE_NOT_FOUND',
            message: 'daily_stats table does not exist. Please create it with: CREATE TABLE daily_stats (date DATE PRIMARY KEY, total_clicks BIGINT NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());'
          }
        }, { status: 500 })
      }
      throw insertError
    }

    return NextResponse.json({
      success: true,
      data: {
        date: today,
        totalClicks: globalData.total_clicks
      }
    })

  } catch (error) {
    console.error('Collect daily stats error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Internal server error'
      }
    }, { status: 500 })
  }
}
