import type { ReactNode } from 'react'

const BASE_BG = 'linear-gradient(160deg, #0e0e0f, #16101a, #0e1214)'

interface GameConnectingProps {
  roomCode?: string
  message?: string
  onCancel?: () => void
}

export function GameConnecting({ roomCode, message, onCancel }: GameConnectingProps) {
  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <div className="min-h-full flex flex-col items-center justify-center gap-5 px-6 py-8"
        style={{ background: BASE_BG }}>
        <div className="text-5xl" style={{ animation: 'spin 1.2s linear infinite' }}>⚙️</div>
        <p className="font-black text-white text-xl">{message ?? 'در حال اتصال...'}</p>
        {roomCode && (
          <p className="text-sm" style={{ color: '#9a9b9e' }}>
            کد: <span style={{ color: '#a855f7', fontFamily: 'monospace', letterSpacing: '0.12em' }}>{roomCode}</span>
          </p>
        )}
        {onCancel && (
          <button onClick={onCancel} className="btn-game px-5 py-2 rounded-xl text-sm font-bold mt-4"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>انصراف</button>
        )}
      </div>
    </div>
  )
}

interface GameErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  onBack?: () => void
  children?: ReactNode
}

export function GameError({ title, message, onRetry, onBack, children }: GameErrorProps) {
  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <div className="min-h-full flex flex-col items-center justify-center gap-5 px-6 py-8"
        style={{ background: BASE_BG }}>
        <div className="text-5xl">⚠️</div>
        <p className="font-black text-white text-xl">{title ?? 'خطا'}</p>
        {message && (
          <p className="text-sm text-center" style={{ color: '#9a9b9e', maxWidth: 280 }}>{message}</p>
        )}
        {children}
        <div className="flex gap-3 flex-wrap justify-center">
          {onRetry && (
            <button onClick={onRetry} className="btn-game px-6 py-3 rounded-xl font-black text-white"
              style={{ background: 'rgba(168,85,247,0.7)' }}>🔄 تلاش مجدد</button>
          )}
          {onBack && (
            <button onClick={onBack} className="btn-game px-6 py-3 rounded-xl font-black text-white"
              style={{ background: '#CC2229' }}>بازگشت</button>
          )}
        </div>
      </div>
    </div>
  )
}

interface GameWaitingProps {
  title: string
  subtitle?: string
  icon?: string
  children?: ReactNode
}

export function GameWaiting({ title, subtitle, icon = '⏳', children }: GameWaitingProps) {
  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <div className="min-h-full flex flex-col items-center justify-center gap-5 px-6 py-8"
        style={{ background: BASE_BG }}>
        <div className="text-5xl">{icon}</div>
        <p className="font-black text-white text-xl text-center">{title}</p>
        {subtitle && <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
