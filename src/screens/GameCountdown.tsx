import { useEffect, useState } from 'react'

interface Props { value: number }

const labels: Record<number, { text: string; color: string }> = {
  3: { text: '۳', color: '#ff2d78' },
  2: { text: '۲', color: '#ffd60a' },
  1: { text: '۱', color: '#00ff88' },
  0: { text: '🚀 بریم!', color: '#00e5ff' },
}

export default function GameCountdown({ value }: Props) {
  const [key, setKey] = useState(value)

  useEffect(() => { setKey(v => v + 1) }, [value])

  const info = labels[value] ?? { text: String(value), color: '#fff' }

  return (
    <div className="h-full overflow-y-auto">
    <div className="min-h-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-32 h-32 rounded-full blur-3xl animate-float opacity-20"
            style={{
              background: ['#9333ea','#00e5ff','#ff2d78','#ffd60a','#00ff88','#ff6d00'][i],
              left: `${10 + i * 15}%`, top: `${20 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div key={key} className="animate-reveal-big text-center relative z-10">
        <div
          className="font-display font-black leading-none"
          style={{
            fontSize: value === 0 ? '5rem' : '12rem',
            color: info.color,
            textShadow: `0 0 60px ${info.color}`,
          }}>
          {info.text}
        </div>
      </div>

      {value > 0 && (
        <div className="mt-8 text-purple-300 text-lg animate-slide-up">آماده باش...</div>
      )}
    </div>
    </div>
  )
}
