'use client'

import { Heart } from 'lucide-react'
import { useState } from 'react'

interface HeartButtonProps {
  onClick: () => Promise<void>
  locale: string
}

const thankYouMessages = [
  { text: 'Thank you', lang: 'en', pos: { top: '5%', left: '-25%' } },
  { text: 'ありがとう', lang: 'ja', pos: { top: '15%', right: '-30%' } },
  { text: '谢谢', lang: 'zh', pos: { top: '25%', left: '-35%' } },
  { text: '감사합니다', lang: 'ko', pos: { top: '35%', right: '-40%' } },
  { text: 'Merci', lang: 'fr', pos: { top: '45%', left: '-30%' } },
  { text: 'Gracias', lang: 'es', pos: { top: '55%', right: '-35%' } },
  { text: 'Danke', lang: 'de', pos: { top: '65%', left: '-25%' } },
  { text: 'Obrigado', lang: 'pt', pos: { top: '75%', right: '-40%' } },
  { text: 'Спасибо', lang: 'ru', pos: { bottom: '25%', left: '-35%' } },
  { text: 'شكرا', lang: 'ar', pos: { bottom: '15%', right: '-30%' } },
  { text: 'Grazie', lang: 'it', pos: { bottom: '5%', left: '-25%' } },
  { text: 'Tack', lang: 'sv', pos: { bottom: '35%', right: '-25%' } },
  { text: 'Kiitos', lang: 'fi', pos: { top: '10%', left: '-45%' } },
  { text: 'Dziękuję', lang: 'pl', pos: { top: '20%', right: '-45%' } },
  { text: 'Dank je', lang: 'nl', pos: { top: '30%', left: '-40%' } },
  { text: 'Ευχαριστώ', lang: 'el', pos: { top: '40%', right: '-48%' } },
  { text: 'Diolch', lang: 'cy', pos: { top: '50%', left: '-35%' } },
  { text: 'Hvala', lang: 'hr', pos: { top: '60%', right: '-30%' } },
  { text: 'Děkuji', lang: 'cs', pos: { top: '70%', left: '-30%' } },
  { text: 'Köszönöm', lang: 'hu', pos: { bottom: '30%', right: '-40%' } },
  { text: 'Mulțumesc', lang: 'ro', pos: { bottom: '20%', left: '-40%' } },
  { text: 'Terima kasih', lang: 'id', pos: { bottom: '10%', right: '-45%' } },
  { text: 'Salamat', lang: 'tl', pos: { bottom: '40%', left: '-30%' } },
  { text: 'धन्यवाद', lang: 'hi', pos: { top: '8%', right: '-25%' } },
  { text: 'ধন্যবাদ', lang: 'bn', pos: { top: '18%', left: '-38%' } },
  { text: 'நன்றி', lang: 'ta', pos: { top: '28%', right: '-28%' } },
  { text: 'ขอบคุณ', lang: 'th', pos: { top: '38%', left: '-28%' } },
  { text: 'Cảm ơn', lang: 'vi', pos: { top: '48%', right: '-38%' } },
  { text: 'Terima kasih', lang: 'ms', pos: { top: '58%', left: '-42%' } },
  { text: 'Asante', lang: 'sw', pos: { top: '68%', right: '-32%' } },
  { text: 'Takk', lang: 'no', pos: { bottom: '28%', left: '-28%' } },
  { text: 'Tak', lang: 'da', pos: { bottom: '18%', right: '-22%' } },
  { text: 'Aitäh', lang: 'et', pos: { bottom: '38%', right: '-28%' } },
  { text: 'Paldies', lang: 'lv', pos: { bottom: '8%', left: '-32%' } },
  { text: 'Ačiū', lang: 'lt', pos: { bottom: '48%', right: '-25%' } },
  { text: 'Grazas', lang: 'eu', pos: { bottom: '12%', left: '-38%' } },
]

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
          className="absolute bg-white/90 px-3 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 whitespace-nowrap"
          style={msg.pos}
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
