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
  const done = state.submitted[currentId]

  const [flash, setFlash] = useState<{ correct: boolean; show: boolean } | null>(null)
  const [streak, setStreak] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalWrong, setTotalWrong] = useState(0)
  const hitTimeRef = useRef(Date.now())

  useEffect(() => {
    setFlash(null)
    setStreak(0)
    setTotalCorrect(0)
    setTotalWrong(0)
    hitTimeRef.current = Date.now()
  }, [currentId])

  useEffect(() => {
    hitTimeRef.current = Date.now()
  }, [state.speedTargets])

  function handleHit(isTarget: boolean) {
    if (done) return
    const rt = (Date.now() - hitTimeRef.current) / 1000
    setFlash({ correct: isTarget, show: true })
    setTimeout(() => setFlash(null), 500)
    if (isTarget) {
      setStreak(s => s + 1)
      setTotalCorrect(c => c + 1)
    } else {
      setStreak(0)
      setTotalWrong(w => w + 1)
    }
    dispatch({ type: 'SPEED_HIT', playerId: currentId, isCorrect: isTarget, responseTime: rt })
  }

  const targets = state.speedTargets || []
  const targetEmoji = targets.find(t => t.isTarget)?.emoji || '⭐'
  const currentScore = state.playerResults[currentId]?.missionScore ?? 0

  return (
    <div className="h-full flex flex-col">
      <GameHUD state={state} />

      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 relative">

        {currentPlayer && color && (
          <div className="flex items-center justify-between w-full max-w-xs animate-slide-up">
            <div className="flex items-center gap-2">
              <PlayerAvatar avatar={currentPlayer.avatar} colorIndex={currentPlayer.colorIndex} size="sm" />
              <div>
                <div className="text-xs text-gray-400">نوبت</div>
                <div className="font-display text-base font-black" style={{ color: color.light }}>{currentPlayer.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">امتیاز</div>
              <div className="font-display text-xl font-black"
                style={{ color: currentScore >= 0 ? '#4ade80' : '#f87171', textShadow: `0 0 12px ${currentScore >= 0 ? '#4ade8066' : '#f8717166'}` }}>
                {currentScore >= 0 ? '+' : ''}{currentScore}
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel rounded-2xl px-8 py-3 text-center w-full max-w-xs"
          style={{ border: '2px solid #ffd60a33' }}>
          <div className="text-xs text-gray-400 mb-1">این رو پیدا کن!</div>
          <div className="text-5xl">{targetEmoji}</div>
        </div>

        {streak >= 2 && !done && (
          <div className="animate-pop-in font-display text-base font-black px-4 py-1 rounded-full"
            style={{ background: 'linear-gradient(135deg,#ffd60a,#e6ac00)', color: '#111' }}>
            {streak}× کومبو! 🔥
          </div>
        )}

        {!done ? (
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {targets.map(t => (
              <button
                key={t.id}
                onClick={() => handleHit(t.isTarget)}
                className="btn-game aspect-square rounded-2xl text-4xl flex items-center justify-center glass-panel hover:scale-110 active:scale-90 transition-all"
                style={{ border: '2px solid #CC222933' }}>
                {t.emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl px-8 py-6 text-center animate-pop-in w-full max-w-xs">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-xl font-black text-yellow-400">نوبت تموم شد!</div>
            <div className="flex justify-center gap-6 mt-3 text-sm">
              <span className="text-green-400">✓ {totalCorrect} درست</span>
              <span className="text-red-400">✗ {totalWrong} اشتباه</span>
            </div>
            <div className="font-display text-2xl font-black mt-2"
              style={{ color: currentScore >= 0 ? '#4ade80' : '#f87171' }}>
              {currentScore >= 0 ? '+' : ''}{currentScore} امتیاز
            </div>
          </div>
        )}

        {flash?.show && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            <div className={`font-display text-8xl font-black ${flash.correct ? 'text-green-400' : 'text-red-400'}`}
              style={{ textShadow: flash.correct ? '0 0 40px #00ff88' : '0 0 40px #ff2d78' }}>
              {flash.correct ? '✓' : '✗'}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap justify-center">
          {state.players.filter(p => p.connected && p.id !== currentId).map(p => {
            const c = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            const isDone = state.submitted[p.id]
            const theirScore = state.playerResults[p.id]?.missionScore ?? 0
            return (
              <div key={p.id} className="flex items-center gap-1 glass-panel rounded-full px-3 py-1"
                style={{ borderColor: `${c.bg}44`, opacity: isDone ? 0.7 : 1 }}>
                <img src={avatarSrc(p.avatar)} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="text-xs" style={{ color: c.light }}>{p.name}</span>
                {isDone && <span className="text-xs text-green-400">+{theirScore}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
