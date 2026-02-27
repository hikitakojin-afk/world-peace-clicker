'use client'

import { Heart } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { thankYouTexts } from '@/lib/thank-you-messages'

interface HeartButtonProps {
  onClick: () => Promise<void>
  locale: string
  disabled?: boolean
}

// 196個の「ありがとう」をハートボタンの両サイドに配置
// スマホ版はハートの近くに配置
function generateThankYouPositions() {
  const positions: Array<{ text: string; x: number; y: number; delay: number }> = []
  const messages = thankYouTexts.slice(0, 196) // 196個使用

  messages.forEach((text, i) => {
    // 左右に均等に振り分ける
    const isLeft = i % 2 === 0
    // ハートが中央（半径約130px）にあるため、最低でも180pxは離す
    const baseX = 180 + Math.random() * 250
    // 縦方向も適度にばらけさせる
    const baseY = (Math.random() - 0.5) * 500

    positions.push({
      text,
      // 左側ならマイナス、右側ならプラス
      x: isLeft ? -baseX : baseX,
      y: baseY,
      // 発生タイミングをバラバラに (0〜15秒)
      delay: Math.random() * 15000,
    })
  })

  return positions
}

// コンポーネント外で一度だけ生成（固定パターン）
const thankYouPositions = generateThankYouPositions()

export function HeartButton({ onClick, locale, disabled = false }: HeartButtonProps) {
  const [isGlowing, setIsGlowing] = useState(false)
  const [bubbleStates, setBubbleStates] = useState<Array<{ isPink: boolean; isShaking: boolean }>>(
    thankYouPositions.map(() => ({ isPink: false, isShaking: false }))
  )
  const [isMobile, setIsMobile] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // モバイル判定
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Web Audio APIで綺麗なクリックSE生成（ピアノ風和音）
  const playClickSound = () => {
    if (typeof window === 'undefined') return

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    // C major和音（ド・ミ・ソ）
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      // ピアノ風エンベロープ（ADSR）
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01) // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.05) // Decay
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3) // Sustain + Release

      oscillator.start(now)
      oscillator.stop(now + 0.3)
    })
  }

  const handleClick = async () => {
    if (disabled) return
    setIsGlowing(true)
    playClickSound()
    await onClick()
    setTimeout(() => setIsGlowing(false), 150) // 一瞬のエフェクト
  }

  // フキダシのランダムピンクフェード＋シェイク
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    bubbleStates.forEach((_, index) => {
      const scheduleAnimation = () => {
        const delay = thankYouPositions[index].delay

        const timer = setTimeout(() => {
          // ピンクフェード＋シェイク開始
          setBubbleStates(prev => {
            const newStates = [...prev]
            newStates[index] = { isPink: true, isShaking: true }
            return newStates
          })

          // 1秒後に元に戻す
          setTimeout(() => {
            setBubbleStates(prev => {
              const newStates = [...prev]
              newStates[index] = { isPink: false, isShaking: false }
              return newStates
            })

            // 次のアニメーションをスケジュール
            scheduleAnimation()
          }, 1000)
        }, delay)

        timers.push(timer)
      }

      scheduleAnimation()
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [])

  return (
    <div className="relative">
      {/* 「ありがとう」吹き出し */}
      {thankYouPositions.map((pos, i) => {
        // スマホ版のX座標: 最低 110px は離す
        let finalX = pos.x;
        let finalY = pos.y;
        if (isMobile) {
          finalX = pos.x > 0 ? Math.max(120, pos.x * 0.6) : Math.min(-120, pos.x * 0.6);
          finalY = pos.y * 0.6;
        }

        return (
          <div
            key={i}
            className={`
              px-2 py-1 rounded-full shadow-sm text-xs font-medium whitespace-nowrap
              transition-all duration-500 z-[-10] pointer-events-none
              ${bubbleStates[i].isPink ? 'bg-pink-300/90 text-white' : 'bg-white/80 text-gray-600'}
              ${bubbleStates[i].isShaking ? 'animate-shake' : ''}
            `}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`,
            }}
          >
            {pos.text}
          </div>
        )
      })}

      {/* ハートボタン */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative w-48 h-48 md:w-64 md:h-64 z-50
          rounded-full 
          shadow-2xl
          transition-all duration-200
          ${disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-br from-pink-400 via-red-400 to-pink-500 hover:from-pink-500 hover:via-red-500 hover:to-pink-600 hover:shadow-pink-500/50 active:scale-95'
          }
          ${isGlowing && !disabled ? 'shadow-pink-400/80 shadow-[0_0_40px_10px_rgba(251,113,133,0.6)]' : ''}
        `}
      >
        <Heart
          className="absolute inset-0 m-auto text-white drop-shadow-lg"
          size={120}
          fill="currentColor"
        />
      </button>
    </div>
  )
}
