import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // 総カウントリセット
    await supabaseAdmin
      .from('global_count')
      .update({
        total_clicks: '0',
        is_cleared: false,
        cleared_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)

    // 国籍別統計削除
    await supabaseAdmin
      .from('country_stats')
      .delete()
      .neq('country_code', '')

    // 年代別統計リセット
    const ageGroups = ['0-12', '13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    for (const group of ageGroups) {
      await supabaseAdmin
        .from('age_group_stats')
        .update({ clicks: 0, updated_at: new Date().toISOString() })
        .eq('age_group', group)
    }

    // レート制限削除
    await supabaseAdmin
      .from('rate_limits')
      .delete()
      .neq('id', '')

    return NextResponse.json({
      success: true,
      message: 'All data has been reset'
    })

  } catch (error) {
    console.error('Reset API error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}
