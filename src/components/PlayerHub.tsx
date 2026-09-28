import { useMemo } from 'react'
import { loadProfile, getLevelProgress, calcRank, RANK_META, getActiveTitle } from '../lib/playerProfile'
import { getDailyMissions } from '../lib/missions'

interface Props {
  onOpenProfile: () => void
}

export default function PlayerHub({ onOpenProfile }: Props) {
  const profile = useMemo(() => loadProfile(), [])
  const progress = getLevelProgress(profile)
  const rank = calcRank(profile.wins)
  const rankMeta = RANK_META[rank]
  const title = getActiveTitle(profile)

  const daily = getDailyMissions()
  const completedToday = daily.filter(m => m.progress.completed).length

  let nextAction = ''
  const xpToNext = progress.needed - progress.current
  if (xpToNext > 0 && xpToNext <= 200) {
    nextAction = `${xpToNext} XP تا Level ${profile.level + 1}`
  } else {
    const incomplete = daily.find(m => !m.progress.completed)
    if (incomplete) nextAction = `ماموریت: ${incomplete.def.title}`
  }

  const pct = Math.round(progress.pct * 100)

  return (
    <button
      onClick={onOpenProfile}
      dir="rtl"
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 18,
        padding: '12px 14px',
        cursor: 'pointer',
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Row 1: avatar + info + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Avatar circle */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#5b21b6,#a855f7)',
          border: '2px solid rgba(168,85,247,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
          boxShadow: '0 0 12px rgba(168,85,247,0.3)',
        }}>
          🎮
        </div>

        {/* Name + rank */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>
              {profile.name || 'بازیکن'}
            </span>
            {title && (
              <span style={{
                color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700,
                background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '1px 6px',
              }}>
                {title.label}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <span style={{
              color: '#a855f7', fontSize: 11, fontWeight: 800,
              background: 'rgba(168,85,247,0.15)', borderRadius: 6, padding: '1px 6px',
            }}>
              Lv.{profile.level}
            </span>
            <span style={{ color: rankMeta.color, fontSize: 11, fontWeight: 700 }}>
              {rankMeta.icon} {rankMeta.label}
            </span>
            {profile.currentStreak >= 3 && (
              <span style={{ color: '#fb923c', fontSize: 11, fontWeight: 900 }}>
                🔥{profile.currentStreak}
              </span>
            )}
          </div>
        </div>

        {/* Right side: missions badge + arrow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          {completedToday > 0 && (
            <div style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.35)',
              borderRadius: 20, padding: '2px 8px',
              color: '#4ade80', fontSize: 10, fontWeight: 800,
            }}>
              {completedToday}/{daily.length} ✓
            </div>
          )}
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>←</span>
        </div>
      </div>

      {/* XP bar */}
      <div>
        <div style={{
          width: '100%', height: 6, borderRadius: 4,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: 'linear-gradient(90deg,#6d28d9,#a855f7,#c084fc)',
            width: `${pct}%`,
            transition: 'width 0.8s ease',
            boxShadow: '0 0 8px rgba(168,85,247,0.5)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
            {progress.current.toLocaleString()} / {progress.needed.toLocaleString()} XP
          </span>
          {nextAction && (
            <span style={{ color: 'rgba(168,85,247,0.8)', fontSize: 10, fontWeight: 700 }}>
              → {nextAction}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
