'use client'

import { Locale } from '@/lib/i18n'
import { translations } from '@/lib/i18n'

interface FooterProps {
  locale: Locale
}

export function Footer({ locale }: FooterProps) {
  const t = translations[locale]

  return (
    <footer className="mt-16 mb-8 text-center flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 text-gray-600 mb-8">
        <span className="text-sm">{t.createdBy}:</span>
        <a
          href="https://x.com/ChoroUduki"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {/* Xロゴ（旧Twitterロゴ） */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-current"
            aria-label="X (Twitter)"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          @ChoroUduki
        </a>
      </div>

      {/* 広告用プレースホルダー */}
      <div className="w-full max-w-[728px] h-[90px] bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm mt-4">
        Advertisement Space (728x90)
      </div>
    </footer >
  )
}
