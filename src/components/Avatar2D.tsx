import { useState } from 'react'
import { avatarSrc, AVATAR_NAMES } from '../lib/avatars'
import type { AvatarState, FrameId, AuraId } from '../lib/playerProfile'
import { RANK_META, calcRank } from '../lib/playerProfile'

interface Props {
  avatarId: string
  state?: AvatarState
  frameId?: FrameId
  auraId?: AuraId
  wins?: number
  streak?: number
  size?: number
  showFrame?: boolean
  showAura?: boolean
  interactive?: boolean
  onTap?: () => void
  label?: string
  className?: string
}

const FRAME_STYLES: Record<FrameId, { border: string; glow: string }> = {
  default:  { border: '2px solid rgba(255,255,255,0.15)', glow: 'none' },
  bronze:   { border: '2px solid #cd7f32', glow: '0 0 16px #cd7f3266' },
  silver:   { border: '2px solid #c0c0c0', glow: '0 0 16px #c0c0c055' },
  gold:     { border: '2px solid #ffd700', glow: '0 0 24px #ffd70088' },
  champion: { border: '2.5px solid #a855f7', glow: '0 0 32px #a855f799' },
  event:    { border: '2.5px solid #f472b6', glow: '0 0 28px #f472b677' },
}

const AURA_STYLES: Record<AuraId, { className: string; style: React.CSSProperties }> = {
  none:     { className: '', style: {} },
  fire:     { className: 'avatar-aura-fire', style: {} },
  champion: { className: 'avatar-aura-champion', style: {} },
  ice:      { className: 'avatar-aura-ice', style: {} },
  galaxy:   { className: 'avatar-aura-galaxy', style: {} },
}

const STATE_ANIMATION: Record<AvatarState, string> = {
  idle:    'avatar-idle',
  hover:   'avatar-hover',
  selected:'avatar-selected',
  win:     'avatar-win',
  lose:    'avatar-lose',
  levelup: 'avatar-levelup',
  streak:  'avatar-streak',
  top:     'avatar-top',
}

export default function Avatar2D({
  avatarId,
  state = 'idle',
  frameId = 'default',
  auraId = 'none',
  wins = 0,
  streak = 0,
  size = 120,
  showFrame = true,
  showAura = true,
  interactive = false,
  onTap,
  label,
  className = '',
}: Props) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  const effectiveState: AvatarState = interactive && hovered ? 'hover' : state
  const frame = FRAME_STYLES[frameId]
  const aura = AURA_STYLES[auraId]
  const rank = calcRank(wins)
  const rankMeta = RANK_META[rank]
  const isTop = wins >= 200
  const hasStreak = streak >= 3

  const avatarName = AVATAR_NAMES[parseInt(avatarId, 10)] ?? 'بازیکن'

  return (
    <div
      className={`avatar-2d-root ${className}`}
      style={{ position: 'relative', width: size, height: size, cursor: onTap ? 'pointer' : 'default', flexShrink: 0 }}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
      onTouchStart={() => interactive && setHovered(true)}
      onTouchEnd={() => interactive && setHovered(false)}
      onClick={onTap}
      role={onTap ? 'button' : undefined}
      aria-label={label ?? avatarName}
      tabIndex={onTap ? 0 : undefined}
      onKeyDown={e => e.key === 'Enter' && onTap?.()}
    >
      {/* Aura layer — behind everything */}
      {showAura && auraId !== 'none' && (
        <div
          className={`avatar-aura ${aura.className}`}
          style={{
            position: 'absolute',
            inset: -size * 0.15,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Streak fire ring */}
      {hasStreak && (
        <div className="avatar-streak-ring" style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
      )}

      {/* Main avatar container */}
      <div
        className={`avatar-2d ${STATE_ANIMATION[effectiveState]}`}
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          ...(showFrame ? {
            border: frame.border,
            boxShadow: frame.glow,
          } : {}),
          zIndex: 2,
          background: 'rgba(30,20,40,0.85)',
        }}
      >
        {/* Avatar image */}
        {imgError ? (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.45,
            background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
          }}>
            {avatarName[0]}
          </div>
        ) : (
          <img
            src={avatarSrc(avatarId)}
            alt={avatarName}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
            }}
          />
        )}

        {/* Win overlay flash */}
        {state === 'win' && (
          <div className="avatar-win-flash" style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
        )}
      </div>

      {/* Crown for top/champion */}
      {(isTop || state === 'top') && (
        <div style={{
          position: 'absolute',
          top: -size * 0.18,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: size * 0.28,
          zIndex: 5,
          filter: 'drop-shadow(0 2px 8px #ffd70099)',
          animation: 'avatar-crown-bob 2.5s ease-in-out infinite',
        }}>
          👑
        </div>
      )}

      {/* Rank badge (bottom right) */}
      {showFrame && wins > 0 && (
        <div style={{
          position: 'absolute',
          bottom: -4,
          right: -4,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: '50%',
          background: '#111112',
          border: `1.5px solid ${rankMeta.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.16,
          zIndex: 6,
          boxShadow: `0 0 8px ${rankMeta.color}66`,
        }}>
          {rankMeta.icon}
        </div>
      )}

      {/* Streak indicator (bottom left) */}
      {hasStreak && (
        <div style={{
          position: 'absolute',
          bottom: -4,
          left: -4,
          padding: '2px 5px',
          borderRadius: 8,
          background: 'rgba(239,68,68,0.9)',
          fontSize: size * 0.12,
          fontWeight: 900,
          color: '#fff',
          zIndex: 6,
          boxShadow: '0 0 8px rgba(239,68,68,0.6)',
          whiteSpace: 'nowrap',
        }}>
          🔥{streak}
        </div>
      )}

      {/* Selected ring */}
      {state === 'selected' && (
        <div className="avatar-selected-ring" style={{
          position: 'absolute',
          inset: -3,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 3,
        }} />
      )}

      {/* Particles for win/levelup/selected */}
      {(state === 'win' || state === 'levelup') && (
        <div className="avatar-particles" style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 7,
          overflow: 'visible',
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="avatar-particle"
              style={{
                position: 'absolute',
                width: size * 0.07, height: size * 0.07,
                borderRadius: '50%',
                background: state === 'win' ? '#ffd700' : '#a855f7',
                left: '50%', top: '50%',
                animationDelay: `${i * 0.1}s`,
              }} />
          ))}
        </div>
      )}
    </div>
  )
}
