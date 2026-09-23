import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'
import GameHUD from '../components/GameHUD'

interface Props { state: GameState; dispatch: React.Dispatch<GameAction> }

const COMPONENT_LABELS = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪']
const COMPONENT_NAMES = ['آلفا', 'بتا', 'گاما', 'دلتا', 'اپسیلون', 'زتا', 'اتا', 'تتا']

export default function TeamChallenge({ state, dispatch }: Props) {
  const ts = state.teamState
  if (!ts) return null

  const { sequence, activated, success, failed } = ts
  const nextExpected = sequence[activated.length]

  function clickComponent(id: number) {
    if (success || failed) return
    dispatch({ type: 'TEAM_CLICK', componentId: id })
  }

  // Show sequence hint (partial - show first 3 steps)
  const visibleHint = sequence.slice(0, Math.min(3, sequence.length - activated.length + 1))

  return (
    <div className="h-full flex flex-col">
      <GameHUD state={state} />

      {/* Countdown */}
      {!ts.success && !ts.failed && (
        <div className="flex-shrink-0 text-center py-2">
          <div className="font-display text-5xl font-black"
            style={{ color: state.timeLeft <= 5 ? '#CC2229' : '#ffd60a', textShadow: state.timeLeft <= 5 ? '0 0 20px #CC222988' : '0 0 20px #ffd60a88' }}>
            {state.timeLeft}
          </div>
          <div className="text-xs" style={{ color: '#6D6E71' }}>ثانیه</div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 relative">
        {/* Status */}
        <div className="text-center animate-slide-up">
          {success ? (
            <div className="font-display text-4xl font-black text-green-400 animate-pop-in"
              style={{ textShadow: '0 0 30px #00ff88' }}>🎉 تیم برنده شد! +۳۰۰</div>
          ) : failed ? (
            <div className="font-display text-3xl font-black text-red-400 animate-pop-in">
              ❌ وقت تموم شد!
            </div>
          ) : (
            <div>
              <div className="text-purple-300 font-bold text-lg">🤝 با هم ماشین رو روشن کنید!</div>
              <div className="text-sm text-gray-400 mt-1">
                {activated.length} از {sequence.length} کامپوننت فعال شد
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>پیشرفت تیم</span>
            <span>{activated.length}/{sequence.length}</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(activated.length / sequence.length) * 100}%`,
                background: success ? '#00ff88' : 'linear-gradient(90deg, #9333ea, #00e5ff)',
                boxShadow: '0 0 10px #9333ea',
              }}
            />
          </div>
        </div>

        {/* Next hint */}
        {!success && !failed && (
          <div className="glass-panel rounded-xl px-4 py-2 text-center">
            <div className="text-xs text-purple-400 mb-1">بعدی باید:</div>
            <div className="font-bold text-yellow-400 text-lg">
              {COMPONENT_LABELS[nextExpected]} {COMPONENT_NAMES[nextExpected]}
            </div>
          </div>
        )}

        {/* Component grid */}
        <div className="grid grid-cols-4 gap-3 w-full max-w-md">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(id => {
            const isActivated = activated.includes(id)
            const isNext = id === nextExpected && !success && !failed
            const activatedOrder = activated.indexOf(id) + 1

            return (
              <button key={id} onClick={() => clickComponent(id)}
                disabled={success || failed}
                className={`rounded-2xl py-4 flex flex-col items-center gap-1 transition-all ${isActivated ? 'bg-green-900/40' : isNext ? 'animate-pulse' : 'btn-game glass-panel'}`}
                style={{
                  border: `2px solid ${isActivated ? '#00ff88' : isNext ? '#ffd60a' : '#a855f733'}`,
                  boxShadow: isNext ? '0 0 15px #ffd60a88' : isActivated ? '0 0 10px #00ff8866' : 'none',
                  opacity: success || failed ? 0.7 : 1,
                }}>
                <span className="text-2xl">{COMPONENT_LABELS[id]}</span>
                <span className="text-xs font-bold text-gray-400">{COMPONENT_NAMES[id]}</span>
                {isActivated && (
                  <span className="text-xs text-green-400 font-bold">✓ {activatedOrder}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Players row */}
        <div className="flex gap-3 flex-wrap justify-center">
          {state.players.filter(p => p.connected).map(p => {
            const c = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            return (
              <div key={p.id} className="flex items-center gap-2 glass-panel rounded-full px-3 py-1"
                style={{ borderColor: `${c.bg}55` }}>
                <img src={avatarSrc(p.avatar)} alt="" className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs font-bold" style={{ color: c.light }}>{p.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
