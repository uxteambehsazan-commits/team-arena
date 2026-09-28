import type { GameState } from '../types'
import { MISSIONS, PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'
import { MISSION_ART } from '../lib/missionArt'

interface Props { state: GameState }

export default function MissionIntro({ state }: Props) {
  const enabledList = MISSIONS.filter(m => state.enabledMissions.includes(m.id))
  const mission = enabledList[state.currentMissionIndex]
  const firstPlayerId = state.turnOrder[0]
  const firstPlayer = state.players.find(p => p.id === firstPlayerId)
  const firstColor = firstPlayer ? PLAYER_COLORS[firstPlayer.colorIndex % PLAYER_COLORS.length] : null
  const art = mission ? MISSION_ART[mission.id] : null

  return (
    <div className="h-full overflow-y-auto" dir="rtl">
    <div className="min-h-full flex flex-col items-center justify-center relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #9333ea20 0%, transparent 65%)' }} />

      {/* Artwork hero */}
      {art && (
        <div className="relative flex-shrink-0 mb-2 animate-pop-in">
          <img
            src={art}
            alt={mission?.name}
            className="object-contain animate-art-float"
            style={{
              height: '180px',
              width: 'auto',
              maxWidth: '260px',
              filter: 'drop-shadow(0 8px 28px rgba(147,51,234,0.4)) drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
            }}
          />
        </div>
      )}

      {/* Mission title */}
      {mission && (
        <div className="text-center animate-fade-up px-6" style={{ animationDelay: '0.1s' }}>
          {!art && <div className="text-7xl mb-3 animate-float">{mission.emoji}</div>}
          <div className="text-purple-400 font-bold text-sm tracking-wider mb-1">
            راند {String(state.currentMissionIndex + 1).padStart(2, '0')} از {String(enabledList.length).padStart(2, '0')}
          </div>
          <h1 className="font-display text-4xl font-black text-white mb-2"
            style={{ textShadow: '0 0 28px #a855f7' }}>
            {mission.name}
          </h1>
          <p className="text-purple-300 text-base">{mission.desc}</p>
        </div>
      )}

      {/* Scoring info */}
      {mission && (
        <div className="glass-panel rounded-2xl px-6 py-3 text-center mt-4 max-w-xs mx-4 animate-fade-up"
          style={{ animationDelay: '0.2s' }}>
          <div className="text-xs text-gray-400 mb-1">امتیازدهی</div>
          <div className="text-purple-200 font-bold text-sm">{mission.scoring}</div>
        </div>
      )}

      {/* Turn info */}
      {mission?.type === 'turn' && firstPlayer && firstColor && (
        <div className="animate-fade-up mt-4 text-center" style={{ animationDelay: '0.3s' }}>
          <div className="text-xs text-gray-400 mb-2">👑 شروع‌کننده راند</div>
          <div className="flex items-center gap-3 glass-panel rounded-2xl px-5 py-3">
            <img src={avatarSrc(firstPlayer.avatar)} alt="" className="w-10 h-10 rounded-full object-cover" />
            <span className="font-black text-lg" style={{ color: firstColor.light }}>{firstPlayer.name}</span>
          </div>
        </div>
      )}
      {mission?.type === 'simultaneous' && (
        <div className="mt-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-yellow-400 font-bold text-base">⚡ همه با هم بازی می‌کنید!</div>
        </div>
      )}
      {mission?.type === 'cooperative' && (
        <div className="mt-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-green-400 font-bold text-base">🤝 با هم کار کنید!</div>
        </div>
      )}

      {/* Countdown */}
      <div className="mt-5 font-display text-6xl font-black animate-timer-warning"
        style={{ color: state.timeLeft <= 2 ? '#ff2d78' : '#ffd60a' }}>
        {state.timeLeft > 0 ? state.timeLeft : ''}
      </div>
    </div>
    </div>
  )
}
