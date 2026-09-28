import { useState, useEffect, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS } from '../constants'
import GameHUD from '../components/GameHUD'
import PlayerAvatar from '../components/PlayerAvatar'
import { avatarSrc } from '../lib/avatars'

interface Props { state: GameState; dispatch: React.Dispatch<GameAction> }

export default function LogicBreaker({ state, dispatch }: Props) {
  const currentId = state.turnOrder[state.currentTurnIndex]
  const currentPlayer = state.players.find(p => p.id === currentId)
  const color = currentPlayer ? PLAYER_COLORS[currentPlayer.colorIndex % PLAYER_COLORS.length] : null
  const done = state.submitted[currentId]
  const q = state.logicQuestion
  const [selected, setSelected] = useState<number | null>(null)
  const startTime = useRef(Date.now())

  useEffect(() => {
    setSelected(null)
    startTime.current = Date.now()
  }, [currentId])

  useEffect(() => {
    if (state.phase === 'PLAYING' && state.timeLeft === 0 && !done) {
      dispatch({ type: 'PLAYER_SUBMIT', playerId: currentId, answer: -1, responseTime: 15 })
    }
  }, [state.phase, state.timeLeft])

  function choose(optIdx: number) {
    if (done || selected !== null) return
    setSelected(optIdx)
    const rt = (Date.now() - startTime.current) / 1000
    setTimeout(() => {
      dispatch({ type: 'PLAYER_SUBMIT', playerId: currentId, answer: optIdx, responseTime: rt })
    }, 600)
  }

  if (!q) return null

  const isCorrect = selected !== null && selected === q.answer
  const isWrong = selected !== null && selected !== q.answer

  return (
    <div className="h-full flex flex-col">
      <GameHUD state={state} />

      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4">
        {currentPlayer && color && (
          <div className="flex items-center gap-3">
            <PlayerAvatar avatar={currentPlayer.avatar} colorIndex={currentPlayer.colorIndex} size="sm" />
            <div className="font-display text-xl font-black" style={{ color: color.light }}>{currentPlayer.name}</div>
          </div>
        )}

        {/* Question */}
        <div className="glass-panel rounded-2xl px-6 py-5 text-center w-full max-w-md animate-pop-in">
          <div className="text-xs text-purple-400 mb-3">الگو را کامل کن</div>
          <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
            {q.sequence.map((s, i) => (
              <div key={i} className={`text-4xl ${s === '?' ? 'font-display font-black text-yellow-400 text-5xl animate-pulse' : ''}`}>
                {s}
              </div>
            ))}
          </div>
          {done && (
            <div className="text-xs text-gray-400 mt-2">{q.hint}</div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {q.options.map((opt, i) => {
            const isThis = selected === i
            const showCorrect = done && i === q.answer
            const showWrong = done && isThis && i !== q.answer
            return (
              <button key={i} onClick={() => choose(i)} disabled={done || selected !== null}
                className={`btn-game glass-panel rounded-2xl py-5 text-4xl border-2 transition-all disabled:cursor-not-allowed ${showCorrect ? 'border-green-400 bg-green-900/30 scale-105' : showWrong ? 'border-red-400 bg-red-900/30 animate-shake' : isThis ? 'border-yellow-400 bg-yellow-900/20' : 'border-purple-800/50 hover:border-purple-500'}`}
                style={showCorrect ? { boxShadow: '0 0 20px #00ff88' } : {}}>
                {opt}
                {showCorrect && <div className="text-sm text-green-400 font-bold mt-1">✓ درست</div>}
                {showWrong && <div className="text-sm text-red-400 font-bold mt-1">✗ اشتباه</div>}
              </button>
            )
          })}
        </div>

        {done && (
          <div className={`text-center font-display text-2xl font-black animate-pop-in ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
            style={{ textShadow: isCorrect ? '0 0 20px #00ff88' : '0 0 20px #ff2d78' }}>
            {isCorrect ? '+۱۵۰ ✓' : selected === null ? 'زمان تمام شد! ۰' : 'اشتباه! ۰'}
          </div>
        )}

        {/* Waiting players */}
        <div className="flex gap-2 flex-wrap justify-center">
          {state.players.filter(p => p.connected && p.id !== currentId).map(p => {
            const c = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            const d = state.submitted[p.id]
            return (
              <div key={p.id} className="flex items-center gap-1 glass-panel rounded-full px-3 py-1"
                style={{ borderColor: `${c.bg}44`, opacity: d ? 0.6 : 1 }}>
                <img src={avatarSrc(p.avatar)} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="text-xs" style={{ color: c.light }}>{p.name}</span>
                {d && <span className="text-xs text-green-400">✓</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
