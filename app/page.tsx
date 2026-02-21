'use client'

import { useEffect, useState } from 'react'
import { HeartButton } from '@/components/HeartButton'
import { CountDisplay } from '@/components/CountDisplay'
import { StatsDisplay } from '@/components/StatsDisplay'
import { UserInputModal } from '@/components/UserInputModal'
import { Footer } from '@/components/Footer'
import { supabase } from '@/lib/supabase-client'
import { UserProfile, GlobalStats, ClickResponse } from '@/types'
import { translations, getLocaleFromCountry, Locale } from '@/lib/i18n'

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [isClicking, setIsClicking] = useState(false)
  const [locale, setLocale] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // ローカルストレージからプロフィール読み込み
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setUserProfile(profile)
        setLocale(getLocaleFromCountry(profile.countryCode))
      } catch (err) {
        console.error('Failed to parse profile:', err)
        localStorage.removeItem('userProfile')
      }
    }

    // 統計データ取得
    fetchStats()

    // 5秒ごとに統計更新
    const interval = setInterval(() => {
      fetchStats()
    }, 5000)

    // グローバル関数としてリセットを登録
    if (typeof window !== 'undefined') {
      (window as any).resetAllData = async () => {
        if (confirm('本当に全データをリセットしますか？')) {
          const res = await fetch('/api/reset', { method: 'POST' })
          const data = await res.json()
          if (data.success) {
            console.log('✅ データをリセットしました')
            await fetchStats()
          } else {
            console.error('❌ リセット失敗:', data.error)
          }
        }
      }
    }

    return () => {
      clearInterval(interval)
    }
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile)
    setLocale(getLocaleFromCountry(profile.countryCode))
    localStorage.setItem('userProfile', JSON.stringify(profile))
  }

  const handleClick = async () => {
    if (!userProfile) return

    try {
      const res = await fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: userProfile.countryCode,
          ageGroup: userProfile.ageGroup,
          sessionId: userProfile.sessionId,
        })
      })

      const data: ClickResponse = await res.json()

      if (data.success && data.data) {
        // ローカルで即座に更新（楽観的UI）
        if (stats) {
          setStats({
            ...stats,
            totalClicks: data.data.totalClicks,
            isCleared: data.data.isCleared,
            clearedAt: data.data.clearedAt
          })
        }
        // 統計を手動更新
        fetchStats()
      } else if (data.error) {
        console.error('Click error:', data.error.message)
      }
    } catch (error) {
      console.error('Click failed:', error)
    }
  }

  const t = translations[locale]

  // サーバーサイドレンダリング時は何も表示しない
  if (!mounted) {
    return null
  }

  if (!userProfile) {
    return <UserInputModal onSubmit={handleProfileSubmit} translations={t} locale={locale} />
  }

  return (
    <main className="min-h-screen p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        {/* タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-4">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700">{t.subtitle}</p>
        </div>

        {/* クリア メッセージ */}
        {stats?.isCleared && (
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white text-center py-6 px-4 rounded-2xl mb-8 shadow-2xl animate-pulse">
            <p className="text-2xl md:text-3xl font-bold">{t.clearMessage}</p>
          </div>
        )}

        {/* カウンター */}
        {stats && (
          <CountDisplay 
            count={stats.totalClicks}
            threshold={stats.clearThreshold}
            label={t.totalClicks}
            isCleared={stats.isCleared}
            progressLabel={t.progress}
          />
        )}

        {/* ハートボタン */}
        <div className="flex justify-center mb-12">
          <HeartButton 
            onClick={handleClick} 
            locale={locale}
          />
        </div>

        {/* 統計表示 */}
        {stats && (
          <StatsDisplay
            countries={stats.countries}
            ageGroups={stats.ageGroups}
            countryLabel={t.countryStats}
            ageLabel={t.ageStats}
            locale={locale}
          />
        )}

        {/* Footer */}
        <Footer locale={locale} />
      </div>
    </main>
  )
}
