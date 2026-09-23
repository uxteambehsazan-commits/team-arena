import { useEffect, useState } from 'react'

export interface XPEvent {
  xp: number
  leveledUp?: boolean
  newLevel?: number
  missionXP?: number
  achievementNames?: string[]
}

interface Props {
  event: XPEvent | null
  onDone: () => void
}

export default function XPToast({ event, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!event) { setVisible(false); return }
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 3500)
    return () => clearTimeout(timer)
  }, [event])

  if (!event) return null

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : -80}px)`,
        opacity: visible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(.16,1,.3,1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'none',
      }}
    >
      {/* Main XP pill */}
      <div style={{
        background: 'rgba(16,12,28,0.96)',
        border: '1px solid rgba(168,85,247,0.5)',
        borderRadius: 20,
        padding: '8px 20px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(168,85,247,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 18 }}>⭐</span>
        <span style={{ color: '#a855f7', fontWeight: 900, fontSize: 18 }}>+{event.xp} XP</span>
        {event.missionXP ? (
          <span style={{ color: '#4ade80', fontWeight: 800, fontSize: 13 }}>+{event.missionXP} XP ماموریت</span>
        ) : null}
      </div>

      {/* Level up pill */}
      {event.leveledUp && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(168,85,247,0.9),rgba(236,72,153,0.9))',
          borderRadius: 16,
          padding: '6px 18px',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'levelup-pop 0.5s cubic-bezier(.16,1,.3,1)',
          boxShadow: '0 4px 20px rgba(168,85,247,0.5)',
        }}>
          <span style={{ fontSize: 16 }}>🎉</span>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>Level Up! → {event.newLevel}</span>
        </div>
      )}

      {/* Achievement pills */}
      {event.achievementNames?.map(name => (
        <div key={name} style={{
          background: 'rgba(16,12,28,0.96)',
          border: '1px solid rgba(250,204,21,0.5)',
          borderRadius: 16,
          padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 6,
          backdropFilter: 'blur(12px)',
        }}>
          <span style={{ fontSize: 15 }}>🏅</span>
          <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 13 }}>{name}</span>
        </div>
      ))}
    </div>
  )
}
