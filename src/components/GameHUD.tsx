import { MISSIONS, PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'
import type { GameState } from '../types'

interface Props {
  state: GameState
}

function toPersian(n: number) {
  return n.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

export default function GameHUD({ state }: Props) {
  const enabledList = MISSIONS.filter(m => state.enabledMissions.includes(m.id))
  const currentMission = enabledList[state.currentMissionIndex]
  const totalMissions = enabledList.length
  const currentNum = state.currentMissionIndex + 1

  const isWarning = state.timeLeft <= 5 && state.timeLeft > 0
  const isCritical = state.timeLeft <= 3 && state.timeLeft > 0
  const showTimer = state.timeLeft > 0

  const sortedPlayers = [...state.players].filter(p => p.connected).sort((a, b) => b.score - a.score)

  const timerColor = isCritical ? '#ef4444' : isWarning ? '#f97316' : '#ffd60a'

  return (
    <div className="flex-shrink-0" dir="rtl">

      {/* ── Compact strip ── */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: 'rgba(14,14,15,0.92)', borderBottom: '1px solid #1e1e22', backdropFilter: 'blur(12px)' }}>

        {/* Mission badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0" style={{ maxWidth: '38%' }}>
          <span className="text-base leading-none flex-shrink-0">{currentMission?.emoji ?? '🎮'}</span>
          <span className="text-xs font-black text-white truncate">{currentMission?.name ?? '—'}</span>
        </div>

        {/* Progress bars — fill center */}
        <div className="flex items-center gap-1 flex-1 min-w-0 px-1">
          {enabledList.map((m, i) => (
            <div
              key={m.id}
              className="h-1 rounded-full flex-1 transition-all"
              style={{
                background: i < state.currentMissionIndex
                  ? '#22c55e'
                  : i === state.currentMissionIndex
                  ? '#CC2229'
                  : '#2a2a2e',
              }}
            />
          ))}
        </div>

        {/* Player scores + submitted indicators */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {sortedPlayers.slice(0, 4).map(p => {
            const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            const submitted = !!state.submitted[p.id]
            return (
              <div key={p.id} className="flex flex-col items-center gap-0.5">
                <div className="relative">
                  <img src={avatarSrc(p.avatar)} alt="" className="w-5 h-5 rounded-full object-cover" />
                  {submitted && (
                    <div
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full flex items-center justify-center"
                      style={{ background: '#22c55e', fontSize: 7, lineHeight: 1, color: '#fff', fontWeight: 900 }}>
                      ✓
                    </div>
                  )}
                </div>
                <span className="text-xs font-black leading-none" style={{ color: color.light, fontSize: 9 }}>
                  {toPersian(p.score)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Round counter */}
        <div
          className="flex-shrink-0 rounded-lg px-2 py-0.5 text-center"
          style={{ background: '#CC222918', border: '1px solid #CC222940' }}>
          <span className="text-xs font-black" style={{ color: '#e84249' }}>
            {toPersian(currentNum)}/{toPersian(totalMissions)}
          </span>
        </div>
      </div>

      {/* ── Timer hero — isolated, visually dominant ── */}
      {showTimer && (
        <div
          className={`flex flex-col items-center justify-center py-2.5 ${isCritical ? 'animate-timer-warning' : ''}`}
          style={{
            background: isCritical
              ? 'rgba(239,68,68,0.07)'
              : isWarning
              ? 'rgba(249,115,22,0.05)'
              : 'rgba(255,214,10,0.04)',
            borderBottom: `1px solid ${isCritical ? '#ef444430' : isWarning ? '#f9731620' : '#ffd60a18'}`,
          }}>
          <span
            className="font-display font-black leading-none"
            style={{
              fontSize: 'clamp(2.5rem, 10vw, 3.5rem)',
              color: timerColor,
              textShadow: `0 0 24px ${timerColor}66`,
              letterSpacing: '-0.02em',
            }}>
            {String(state.timeLeft).padStart(2, '0')}
          </span>
          <span className="text-xs font-bold mt-0.5" style={{ color: `${timerColor}99`, letterSpacing: '0.06em' }}>
            ثانیه
          </span>
        </div>
      )}
    </div>
  )
}
