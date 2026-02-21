'use client'

import { Heart } from 'lucide-react'
import { useState } from 'react'

interface HeartButtonProps {
  onClick: () => Promise<void>
  locale: string
}

// 36個の「ありがとう」を円周上に均等配置
const thankYouMessages = [
  'Thank you', 'ありがとう', '谢谢', '감사합니다', 'Merci', 'Gracias',
  'Danke', 'Obrigado', 'Спасибо', 'شكرا', 'Grazie', 'Tack',
  'Kiitos', 'Dziękuję', 'Dank je', 'Ευχαριστώ', 'Diolch', 'Hvala',
  'Děkuji', 'Köszönöm', 'Mulțumesc', 'Terima kasih', 'Salamat', 'धन्यवाद',
  'ধন্যবাদ', 'நன்றி', 'ขอบคุณ', 'Cảm ơn', 'Asante', 'Takk',
  'Tak', 'Aitäh', 'Paldies', 'Ačiū', 'Grazas', 'Mahalo'
].map((text, i) => {
  const angle = (i * 360) / 36  // 10度ずつ
  const radius = 200  // ボタンから200px離す
  const rad = (angle - 90) * (Math.PI / 180)  // -90は12時方向から開始
  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius
  
  return {
    text,
    style: {
      position: 'absolute' as const,
      left: '50%',
      top: '50%',
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    }
  }
})

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
      {thankYouMessages.map((msg, i) => (
        <div
          key={i}
          className="bg-white/90 px-3 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 whitespace-nowrap"
          style={msg.style}
        >
          {msg.text}
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
