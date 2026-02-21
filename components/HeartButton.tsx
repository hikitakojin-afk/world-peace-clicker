'use client'

import { Heart } from 'lucide-react'
import { useState } from 'react'
import { thankYouTexts } from '@/lib/thank-you-messages'

interface HeartButtonProps {
  onClick: () => Promise<void>
  locale: string
}

// 195個の「ありがとう」を赤枠範囲内に不規則配置（固定パターン）
function generateThankYouPositions() {
  const positions: Array<{ text: string; x: number; y: number }> = []
  const gridCols = 15  // 横15個
  const gridRows = 13  // 縦13個 = 195個
  const xRange = { min: -500, max: 500 }  // 横範囲
  const yRange = { min: -250, max: 250 }  // 縦範囲
  const heartRadius = 150  // ハートボタンを避ける半径
  
  const xStep = (xRange.max - xRange.min) / (gridCols + 1)
  const yStep = (yRange.max - yRange.min) / (gridRows + 1)
  
  let textIndex = 0
  
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (textIndex >= thankYouTexts.length) break
      
      // グリッド位置を計算
      const baseX = xRange.min + (col + 1) * xStep
      const baseY = yRange.min + (row + 1) * yStep
      
      // ランダムオフセット（±15px）
      const offsetX = (Math.random() - 0.5) * 30
      const offsetY = (Math.random() - 0.5) * 30
      
      const x = baseX + offsetX
      const y = baseY + offsetY
      
      // ハートボタンと重ならないかチェック
      const distance = Math.sqrt(x * x + y * y)
      if (distance < heartRadius) {
        // ハートボタンと重なる場合は外側に押し出す
        const angle = Math.atan2(y, x)
        const newX = Math.cos(angle) * (heartRadius + 20)
        const newY = Math.sin(angle) * (heartRadius + 20)
        positions.push({ text: thankYouTexts[textIndex], x: newX, y: newY })
      } else {
        positions.push({ text: thankYouTexts[textIndex], x, y })
      }
      
      textIndex++
    }
  }
  
  return positions
}

// コンポーネント外で一度だけ生成（固定パターン）
const thankYouPositions = generateThankYouPositions()

export function HeartButton({ onClick, locale }: HeartButtonProps) {
  const [isGlowing, setIsGlowing] = useState(false)

  const handleClick = async () => {
    setIsGlowing(true)
    await onClick()
    setTimeout(() => setIsGlowing(false), 300)
  }

  return (
    <div className="relative">
      {/* 「ありがとう」吹き出し */}
      {thankYouPositions.map((pos, i) => (
        <div
          key={i}
          className="bg-white/85 px-2 py-1 rounded-full shadow-md text-xs font-medium text-gray-600 whitespace-nowrap"
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
