import type { GameState, GameAction } from '../types'
import { MISSIONS, PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'

interface Props {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

export default function MissionBriefing({ state, dispatch }: Props) {
  const mission = MISSIONS.filter(m => state.enabledMissions.includes(m.id))[state.currentMissionIndex]
  const activePlayers = state.players.filter(p => p.connected)
  const readyCount = activePlayers.filter(p => (state as any).briefingReady?.[p.id]).length
  const allReady = readyCount === activePlayers.length && activePlayers.length > 0

  const missionColors: Record<string, string> = {
    SPEED: '#f97316',
    MEMORY: '#a855f7',
    LOGIC: '#3b82f6',
    FASTEST: '#ef4444',
    TEAM: '#22c55e',
    FINAL: '#CC2229',
  }
  const accent = missionColors[mission.id] ?? '#CC2229'

  return (
    <div className="h-full flex flex-col overflow-hidden" dir="rtl">

      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="text-4xl">{mission.emoji}</div>
        <div>
          <p className="text-xs font-bold" style={{ color: accent }}>
            مأموریت {String(state.currentMissionIndex + 1).padStart(2, '0')} از ۰۶
          </p>
          <h1 className="font-display text-xl font-black text-white">{mission.name}</h1>
          <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>{mission.desc}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-4 h-px" style={{ background: `${accent}44` }} />

      {/* Rules */}
      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3 min-h-0">
        <p className="text-xs font-bold" style={{ color: '#6D6E71' }}>📋 قوانین این مرحله</p>

        <div className="flex flex-col gap-2">
          {((mission as any).rules as string[] ?? []).map((rule: string, i: number) => (
            <div key={i}
              className="glass-panel rounded-2xl px-4 py-3 flex items-start gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 0.07}s` }}>
              <span className="font-display font-black text-sm flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: `${accent}22`, color: accent }}>
                {i + 1}
              </span>
              <p className="text-sm text-white leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>

        {/* Scoring */}
        <div className="glass-panel rounded-2xl px-4 py-3 mt-1"
          style={{ border: `1px solid ${accent}33`, background: `${accent}08` }}>
          <p className="text-xs mb-1" style={{ color: accent }}>💰 امتیازدهی</p>
          <p className="text-sm font-bold text-white">{mission.scoring}</p>
        </div>

        {/* Player ready list */}
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: '#6D6E71' }}>
            آماده‌ها: {readyCount} / {activePlayers.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {activePlayers.map(p => {
              const isReady = !!(state as any).briefingReady?.[p.id]
              const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
              return (
                <button
                  key={p.id}
                  onClick={() => !isReady && dispatch({ type: 'FINAL_CLICK', playerId: p.id })}
                  className="btn-game flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: isReady ? `${color.bg}28` : '#1e1e20',
                    border: `1.5px solid ${isReady ? color.bg : '#2e2e32'}`,
                    opacity: isReady ? 1 : 0.7,
                  }}>
                  <img src={avatarSrc(p.avatar)} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <span className="text-sm font-bold truncate max-w-[80px]"
                    style={{ color: isReady ? color.light : '#9a9b9e' }}>
                    {p.name}
                  </span>
                  <span className="text-sm flex-shrink-0">{isReady ? '✓' : '...'}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* Bottom — ready button */}
      <div className="flex-shrink-0 px-5 py-4 glass-panel" style={{ borderTop: `1.5px solid ${accent}22` }}>
        {!allReady && (
          <p className="text-center text-xs mb-3" style={{ color: '#6D6E71' }}>
            {activePlayers.length - readyCount} نفر هنوز آماده نشدن — روی اسمتون بزنید
          </p>
        )}
        <button
          disabled={!allReady}
          onClick={() => {/* triggered automatically when all ready */}}
          className="btn-game w-full py-4 rounded-2xl font-black text-lg text-white disabled:opacity-30 transition-all"
          style={allReady
            ? { background: `linear-gradient(135deg,${accent},${accent}cc)`, boxShadow: `0 4px 28px ${accent}55` }
            : { background: '#1a1a1c' }}>
          {allReady ? `🚀 شروع ${mission.name}!` : `⏳ منتظر آماده شدن همه...`}
        </button>
      </div>
    </div>
  )
}
