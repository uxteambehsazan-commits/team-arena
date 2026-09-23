import { useState, useEffect, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS } from '../constants'
import GameHUD from '../components/GameHUD'
import PlayerAvatar from '../components/PlayerAvatar'
import { avatarSrc } from '../lib/avatars'

interface Props { state: GameState; dispatch: React.Dispatch<GameAction> }

export default function SpeedAttack({ state, dispatch }: Props) {
  const currentId = state.turnOrder[state.currentTurnIndex]
  const currentPlayer = state.players.find(p => p.id === currentId)
  const color = currentPlayer ? PLAYER_COLORS[currentPlayer.colorIndex % PLAYER_COLORS.length] : null
  const [hitResult, setHitResult] = useState<{ correct: boolean; show: boolean } | null>(null)
  const startTime = useRef(Date.now())
  const done = state.submitted[currentId]

  useEffect(() => {
    startTime.current = Date.now()
    setHitResult(null)
  }, [currentId])

  function handleHit(isTarget: boolean) {
    if (done) return
    const rt = (Date.now() - startTime.current) / 1000
    setHitResult({ correct: isTarget, show: true })
    setTimeout(() => setHitResult(null), 800)
    dispatch({ type: 'SPEED_HIT', playerId: currentId, isCorrect: isTarget, responseTime: rt })
  }

  const targets = state.speedTargets || []
  const targetEmoji = targets.find(t => t.isTarget)?.emoji || '⭐'

  return (
    <div className="h-full flex flex-col">
      <GameHUD state={state} />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 relative">
        {/* Player turn indicator */}
        {currentPlayer && color && (
          <div className="text-center animate-slide-up">
            <div className="flex items-center gap-3 justify-center">
              <PlayerAvatar avatar={currentPlayer.avatar} colorIndex={currentPlayer.colorIndex} size="sm" />
              <div>
                <div className="text-xs text-gray-400">نوبت</div>
                <div className="font-display text-xl font-black" style={{ color: color.light }}>{currentPlayer.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Target to hit */}
        <div className="glass-panel rounded-2xl px-8 py-3 text-center">
          <div className="text-xs text-gray-400 mb-1">هدف رو بزن!</div>
          <div className="text-5xl">{targetEmoji}</div>
        </div>

        {/* Grid of targets */}
        {!done ? (
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {targets.map(t => (
              <button
                key={t.id}
                onClick={() => handleHit(t.isTarget)}
                disabled={done}
                className="btn-game aspect-square rounded-2xl text-4xl flex items-center justify-center glass-panel hover:scale-110 active:scale-95 transition-all disabled:opacity-40"
                style={{ border: '2px solid #CC222933' }}>
                {t.emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl px-8 py-6 text-center animate-pop-in">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-xl font-black text-green-400">نوبت تموم شد!</div>
          </div>
        )}

        {/* Result flash */}
        {hitResult?.show && (
          <div className={`fixed inset-0 pointer-events-none flex items-center justify-center z-50`}>
            <div className={`font-display text-7xl font-black animate-score-fly ${hitResult.correct ? 'text-green-400' : 'text-red-400'}`}
              style={{ textShadow: hitResult.correct ? '0 0 30px #00ff88' : '0 0 30px #ff2d78' }}>
              {hitResult.correct ? '✓' : '✗'}
            </div>
          </div>
        )}

        {/* Waiting players */}
        <div className="flex gap-2 flex-wrap justify-center">
          {state.players.filter(p => p.connected && p.id !== currentId).map(p => {
            const c = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            const done2 = state.submitted[p.id]
            return (
              <div key={p.id} className="flex items-center gap-1 glass-panel rounded-full px-3 py-1"
                style={{ borderColor: `${c.bg}44`, opacity: done2 ? 0.5 : 1 }}>
                <img src={avatarSrc(p.avatar)} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="text-xs" style={{ color: c.light }}>{p.name}</span>
                {done2 && <span className="text-xs text-green-400">✓</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
