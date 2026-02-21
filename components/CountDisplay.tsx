'use client'

interface CountDisplayProps {
  count: string
  threshold: string
  label: string
  isCleared: boolean
  progressLabel: string
}

export function CountDisplay({ count, threshold, label, isCleared, progressLabel }: CountDisplayProps) {
  // BigIntを3桁区切りにフォーマット
  const formatCount = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // 進捗率計算
  const progress = (BigInt(count) * BigInt(100)) / BigInt(threshold)

  return (
    <div className="text-center mb-8">
      <p className="text-xl md:text-2xl text-gray-700 mb-2">{label}</p>
      <div className="flex items-center justify-center gap-4">
        <div className={`
          text-4xl md:text-6xl font-bold 
          ${isCleared ? 'text-yellow-500' : 'text-pink-600'}
          transition-colors duration-500
        `}>
          {formatCount(count)}
        </div>
        <div className="text-2xl md:text-3xl text-gray-500">
          / {formatCount(threshold)}
        </div>
      </div>
      <div className="mt-2 text-sm md:text-base text-gray-600">
        {progressLabel}: {progress.toString()}%
      </div>
    </div>
  )
}
