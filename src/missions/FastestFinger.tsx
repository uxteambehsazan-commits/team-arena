import { useEffect, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'
import GameHUD from '../components/GameHUD'

interface Props { state: GameState; dispatch: React.Dispatch<GameAction> }

export default function FastestFinger({ state, dispatch }: Props) {
  const { goSignalTime } = state
  const isGo = goSignalTime !== null
  const allDone = state.players.filter(p => p.connected).every(p => state.submitted[p.id])

  const sortedResults = Object.values(state.playerResults)
    .filter(r => r.responseTime > 0)
    .sort((a, b) => a.responseTime - b.responseTime)

  function press(playerId: string) {
    if (state.submitted[playerId]) return
    dispatch({ type: 'FASTEST_PRESS', playerId, timestamp: Date.now() })
  }

  return (
    <div className="h-full flex flex-col">
      <GameHUD state={state} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4 relative overflow-hidden">
        {/* GO signal */}
        <div className="text-center">
          {!isGo ? (
            <div className="animate-pulse">
              <div className="font-display text-3xl font-black text-purple-400">🎯 آماده باش!</div>
              <div className="text-gray-400 text-sm mt-1">صبر کن... وقتی GO! ظاهر شد دکمه‌ات رو بزن</div>
            </div>
          ) : (
            <div className="animate-reveal-big">
              <div className="font-display text-7xl font-black text-green-400"
                style={{ textShadow: '0 0 50px #00ff88' }}>
                🔥 GO!
              </div>
            </div>
          )}
        </div>

        {/* Player buttons */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
          {state.players.filter(p => p.connected).map(p => {
            const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            const pressed = state.submitted[p.id]
            const result = state.playerResults[p.id]
            const isFalseStart = result?.detail?.includes('استارت زود')
            const rank = sortedResults.findIndex(r => r.playerId === p.id)
            const rankEmoji = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null

            return (
              <button
                key={p.id}
                onClick={() => press(p.id)}
                disabled={pressed}
                className={`btn-game rounded-2xl py-5 flex flex-col items-center gap-2 transition-all disabled:cursor-not-allowed ${pressed ? 'scale-95' : isGo ? 'scale-100 animate-pulse' : 'scale-95 opacity-70'}`}
                style={{
                  background: pressed
                    ? (isFalseStart ? '#ff2d7844' : `${color.bg}44`)
                    : isGo ? `${color.bg}22` : '#1c0840',
                  border: `2px solid ${pressed ? (isFalseStart ? '#ff2d78' : color.bg) : isGo ? color.bg : '#333'}`,
                  boxShadow: isGo && !pressed ? `0 0 20px ${color.bg}` : 'none',
                }}>
                <img src={avatarSrc(p.avatar)} alt="" className="w-12 h-12 rounded-full object-cover" />
                <span className="font-black text-sm" style={{ color: pressed ? '#fff' : color.light }}>
                  {p.name}
                </span>
                {pressed && (
                  <div className="text-center">
                    {rankEmoji && <span className="text-2xl">{rankEmoji}</span>}
                    <div className={`text-sm font-bold ${isFalseStart ? 'text-red-400' : 'text-green-400'}`}>
                      {result?.detail}
                    </div>
                    {result && result.responseTime > 0 && (
                      <div className="text-xs text-gray-400">{result.responseTime.toFixed(2)} ثانیه</div>
                    )}
                  </div>
                )}
                {!pressed && isGo && (
                  <div className="text-xs text-green-400 font-bold animate-bounce">بزن!</div>
                )}
                {!pressed && !isGo && (
                  <div className="text-xs text-gray-600">صبر کن...</div>
                )}
              </button>
            )
          })}
        </div>

        {allDone && (
          <div className="animate-pop-in text-center">
            <div className="text-3xl font-display font-black text-yellow-400">نتایج محاسبه شد! 🎉</div>
          </div>
        )}
      </div>
    </div>
  )
}
