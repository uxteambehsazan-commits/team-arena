import type { GameState } from '../types'
import { MISSIONS, PLAYER_COLORS } from '../constants'
import PlayerAvatar from '../components/PlayerAvatar'

interface Props { state: GameState }

export default function MissionResult({ state }: Props) {
  const mission = MISSIONS.filter(m => state.enabledMissions.includes(m.id))[state.currentMissionIndex]
  if (!mission) return null
  const ranked = [...state.players].sort((a, b) => {
    const ra = state.playerResults[a.id]?.missionScore ?? 0
    const rb = state.playerResults[b.id]?.missionScore ?? 0
    return rb - ra
  })

  return (
    <div className="h-full overflow-y-auto">
    <div className="min-h-full flex flex-col items-center justify-center gap-6 p-4 relative overflow-hidden">
      <div className="absolute w-full h-full pointer-events-none">
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at 50% 0%, #00ff88 0%, transparent 60%)' }} />
      </div>

      <div className="animate-pop-in text-center">
        <div className="text-5xl mb-2">{mission.emoji}</div>
        <div className="font-display text-2xl font-black mb-1 text-white">این راند تموم شد! 🎉</div>
        <div className="text-sm" style={{ color: '#6D6E71' }}>{mission.name}</div>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md">
        {ranked.map((p, i) => {
          const result = state.playerResults[p.id]
          const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
          const ms = result?.missionScore ?? 0
          return (
            <div key={p.id}
              className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s`, borderColor: ms > 0 ? `${color.bg}55` : '#2e2e32' }}>
              <span className="font-display text-lg font-black w-6 text-center" style={{ color: '#6D6E71' }}>#{i + 1}</span>
              <PlayerAvatar avatar={p.avatar} colorIndex={p.colorIndex} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-black text-white text-sm truncate">{p.name}</div>
                <div className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>{result?.detail || '—'}</div>
              </div>
              <div className="text-left flex-shrink-0">
                <div className={`font-display text-xl font-black ${ms > 0 ? 'text-green-400' : ms < 0 ? '' : 'text-gray-500'}`}
                  style={{ color: ms < 0 ? '#CC2229' : undefined }}>
                  {ms >= 0 ? '+' : ''}{ms}
                </div>
                <div className="text-xs text-left" style={{ color: '#6D6E71' }}>مجموع: {p.score}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </div>
  )
}
