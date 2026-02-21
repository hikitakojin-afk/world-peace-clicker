'use client'

import { Heart } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { thankYouTexts } from '@/lib/thank-you-messages'

interface HeartButtonProps {
  onClick: () => Promise<void>
  locale: string
}

// 36言語の「ありがとう」をハートボタンの両サイドに配置
function generateThankYouPositions() {
  const positions: Array<{ text: string; x: number; y: number; delay: number }> = []
  const messages = thankYouTexts.slice(0, 36) // 36言語のみ使用
  
  // ハートボタンの左右に配置
  const leftSide: Array<{ x: number; y: number }> = []
  const rightSide: Array<{ x: number; y: number }> = []
  
  // 左側（x: -200 ~ -350, y: -100 ~ 200）
  for (let i = 0; i < 18; i++) {
    leftSide.push({
      x: -200 - Math.random() * 150,
      y: -100 + Math.random() * 300,
    })
  }
  
  // 右側（x: 200 ~ 350, y: -100 ~ 200）
  for (let i = 0; i < 18; i++) {
    rightSide.push({
      x: 200 + Math.random() * 150,
      y: -100 + Math.random() * 300,
    })
  }
  
  // 配置を混ぜる
  const allPositions = [...leftSide, ...rightSide]
  
  // メッセージとランダム遅延を追加
  messages.forEach((text, i) => {
    positions.push({
      text,
      x: allPositions[i].x,
      y: allPositions[i].y,
      delay: 5000 + Math.random() * 10000, // 5~15秒
    })
  })
  
  return positions
}

// コンポーネント外で一度だけ生成（固定パターン）
const thankYouPositions = generateThankYouPositions()

export function HeartButton({ onClick, locale }: HeartButtonProps) {
  const [isGlowing, setIsGlowing] = useState(false)
  const [bubbleStates, setBubbleStates] = useState<Array<{ isPink: boolean; isShaking: boolean }>>(
    thankYouPositions.map(() => ({ isPink: false, isShaking: false }))
  )
  const audioContextRef = useRef<AudioContext | null>(null)

  // Web Audio APIでシンプルなクリックSE生成
  const playClickSound = () => {
    if (typeof window === 'undefined') return
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    // 短くて柔らかい音（周波数800Hz、0.05秒）
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }

  const handleClick = async () => {
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
      {thankYouPositions.map((pos, i) => (
        <div
          key={i}
          className={`
            px-2 py-1 rounded-full shadow-sm text-xs font-medium whitespace-nowrap
            transition-all duration-500
            ${bubbleStates[i].isPink ? 'bg-pink-300/90 text-white' : 'bg-white/80 text-gray-600'}
            ${bubbleStates[i].isShaking ? 'animate-shake' : ''}
          `}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
          }}
        >
          {pos.text}
        </div>
      ))}

      {/* ハートボタン */}
      <button
        onClick={handleClick}
        className={`
          relative w-48 h-48 md:w-64 md:h-64 
          rounded-full 
          bg-gradient-to-br from-pink-400 via-red-400 to-pink-500
          hover:from-pink-500 hover:via-red-500 hover:to-pink-600
          shadow-2xl hover:shadow-pink-500/50
          transition-all duration-200
          active:scale-95
          ${isGlowing ? 'shadow-pink-400/80 shadow-[0_0_40px_10px_rgba(251,113,133,0.6)]' : ''}
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
