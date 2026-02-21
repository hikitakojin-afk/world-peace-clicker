'use client'

import { Heart } from 'lucide-react'
import { useState } from 'react'

interface HeartButtonProps {
  onClick: () => Promise<void>
  locale: string
}

// 36個の「ありがとう」を不規則に配置（固定パターン）
const thankYouData = [
  { text: 'Thank you', x: -280, y: -120 },
  { text: 'ありがとう', x: 260, y: -140 },
  { text: '谢谢', x: -320, y: 80 },
  { text: '감사합니다', x: 280, y: 100 },
  { text: 'Merci', x: -200, y: -200 },
  { text: 'Gracias', x: 220, y: -210 },
  { text: 'Danke', x: -340, y: -30 },
  { text: 'Obrigado', x: 320, y: -50 },
  { text: 'Спасибо', x: -180, y: 180 },
  { text: 'شكرا', x: 200, y: 190 },
  { text: 'Grazie', x: -260, y: 150 },
  { text: 'Tack', x: 240, y: 160 },
  { text: 'Kiitos', x: 0, y: -240 },
  { text: 'Dziękuję', x: 0, y: 220 },
  { text: 'Dank je', x: -300, y: -80 },
  { text: 'Ευχαριστώ', x: 300, y: 30 },
  { text: 'Diolch', x: -220, y: -160 },
  { text: 'Hvala', x: 210, y: -170 },
  { text: 'Děkuji', x: -360, y: 40 },
  { text: 'Köszönöm', x: 340, y: 60 },
  { text: 'Mulțumesc', x: -140, y: 210 },
  { text: 'Terima kasih', x: 160, y: 220 },
  { text: 'Salamat', x: -240, y: 120 },
  { text: 'धन्यवाद', x: 250, y: 130 },
  { text: 'ধন্যবাদ', x: -290, y: -120 },
  { text: 'நன்றி', x: 270, y: -110 },
  { text: 'ขอบคุณ', x: -160, y: -220 },
  { text: 'Cảm ơn', x: 180, y: -230 },
  { text: 'Asante', x: -340, y: 100 },
  { text: 'Takk', x: 330, y: -90 },
  { text: 'Tak', x: -200, y: 160 },
  { text: 'Aitäh', x: 220, y: 180 },
  { text: 'Paldies', x: -110, y: -240 },
  { text: 'Ačiū', x: 120, y: 240 },
  { text: 'Grazas', x: -380, y: -10 },
  { text: 'Mahalo', x: 360, y: 10 },
]

const thankYouMessages = thankYouData.map(({ text, x, y }) => ({
  text,
  style: {
    position: 'absolute' as const,
    left: '50%',
    top: '50%',
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
  }
}))

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
