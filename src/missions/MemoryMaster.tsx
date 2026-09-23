import { useState, useEffect, useRef } from 'react'
import type { GameState, GameAction, MemoryBoard, MemoryCard } from '../types'
import { PLAYER_COLORS, MEMORY_EMOJIS } from '../constants'
import GameHUD from '../components/GameHUD'
import PlayerAvatar from '../components/PlayerAvatar'
import { avatarSrc } from '../lib/avatars'

interface Props { state: GameState; dispatch: React.Dispatch<GameAction> }

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeBoard(): MemoryBoard {
  const pairs = shuffleArray(MEMORY_EMOJIS).slice(0, 6)
  const cards: MemoryCard[] = shuffleArray([...pairs, ...pairs].map((emoji, i) => ({ id: i, emoji, pairId: pairs.indexOf(emoji) })))
  return { cards, flipped: [], matched: [], score: 0, moves: 0, finished: false }
}

export default function MemoryMaster({ state, dispatch }: Props) {
  const currentId = state.turnOrder[state.currentTurnIndex]
  const currentPlayer = state.players.find(p => p.id === currentId)
  const color = currentPlayer ? PLAYER_COLORS[currentPlayer.colorIndex % PLAYER_COLORS.length] : null
  const done = state.submitted[currentId]

  const [board, setBoard] = useState<MemoryBoard>(makeBoard)
  const [tempFlipped, setTempFlipped] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const [feedback, setFeedback] = useState<'match' | 'miss' | null>(null)
  const [preview, setPreview] = useState(true)
  const turnStart = useRef(Date.now())
  // Tracks all pending flip timeouts so they can be cancelled on turn change
  const pendingFlipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset board when turn changes — cancel any in-flight flip timeout first
  useEffect(() => {
    if (pendingFlipTimeout.current) {
      clearTimeout(pendingFlipTimeout.current)
      pendingFlipTimeout.current = null
    }
    setBoard(makeBoard())
    setTempFlipped([])
    setLocked(true)
    setFeedback(null)
    setPreview(true)
    turnStart.current = Date.now()
    const t = setTimeout(() => {
      setPreview(false)
      setLocked(false)
    }, 1000)
    return () => clearTimeout(t)
  }, [currentId])

  // Submit when timer hits 0 during active play
  useEffect(() => {
    if (state.phase === 'PLAYING' && state.timeLeft === 0 && !done) {
      submitScore()
    }
  }, [state.phase, state.timeLeft])

  function submitScore() {
    if (done) return
    const rt = (Date.now() - turnStart.current) / 1000
    dispatch({ type: 'PLAYER_SUBMIT', playerId: currentId, answer: board.score, responseTime: rt })
  }

  function flipCard(idx: number) {
    if (locked || done) return
    if (board.matched.includes(idx)) return
    if (tempFlipped.includes(idx)) return
    if (tempFlipped.length === 2) return

    const newFlipped = [...tempFlipped, idx]
    setTempFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setLocked(true)
      const c1 = board.cards[newFlipped[0]]
      const c2 = board.cards[newFlipped[1]]
      const isMatch = c1.pairId === c2.pairId

      pendingFlipTimeout.current = setTimeout(() => {
        pendingFlipTimeout.current = null
        if (isMatch) {
          const newMatched = [...board.matched, ...newFlipped]
          const newScore = board.score + 100
          const finished = newMatched.length === board.cards.length
          setBoard(b => ({ ...b, matched: newMatched, score: newScore, moves: b.moves + 1, finished }))
          setTempFlipped([])
          setFeedback('match')
          setTimeout(() => setFeedback(null), 600)
          setLocked(false)
          // Keep global state in sync so TIMER_TICK uses the correct score on timeout
          dispatch({ type: 'MEMORY_SCORE_UPDATE', playerId: currentId, score: newScore })
          if (finished) {
            setTimeout(() => {
              const rt = (Date.now() - turnStart.current) / 1000
              dispatch({ type: 'PLAYER_SUBMIT', playerId: currentId, answer: newScore, responseTime: rt })
            }, 400)
          }
        } else {
          setBoard(b => ({ ...b, score: Math.max(-200, b.score - 20), moves: b.moves + 1 }))
          setFeedback('miss')
          setTimeout(() => {
            setTempFlipped([])
            setFeedback(null)
            setLocked(false)
          }, 400)
        }
      }, 700)
    }
  }

  const isRevealed = (idx: number) => preview || board.matched.includes(idx) || tempFlipped.includes(idx)

  return (
    <div className="h-full flex flex-col">
      <GameHUD state={state} />

      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-3 relative">
        {currentPlayer && color && (
          <div className="flex items-center gap-3">
            <PlayerAvatar avatar={currentPlayer.avatar} colorIndex={currentPlayer.colorIndex} size="sm" />
            <div className="font-display text-xl font-black" style={{ color: color.light }}>{currentPlayer.name}</div>
            <div className="glass-panel rounded-xl px-3 py-1 font-display text-lg font-black"
              style={{ color: board.score >= 0 ? '#00ff88' : '#ff2d78' }}>
              {board.score >= 0 ? '+' : ''}{board.score}
            </div>
          </div>
        )}

        {/* Feedback flash */}
        {feedback && (
          <div className={`fixed inset-0 pointer-events-none flex items-center justify-center z-50`}>
            <div className={`font-display text-8xl font-black animate-score-fly ${feedback === 'match' ? 'text-green-400' : 'text-red-400'}`}>
              {feedback === 'match' ? '+۱۰۰ ✓' : '−۲۰ ✗'}
            </div>
          </div>
        )}

        {preview && (
          <div className="font-display text-lg font-black text-yellow-400 animate-pulse text-center">👀 کارت‌ها رو حفظ کن!</div>
        )}

        {!done ? (
          <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
            {board.cards.map((card, idx) => {
              const revealed = isRevealed(idx)
              const matched = board.matched.includes(idx)
              return (
                <div key={idx} className="card-flip aspect-square" onClick={() => flipCard(idx)}>
                  <div className={`card-flip-inner w-full h-full rounded-xl cursor-pointer ${revealed ? 'flipped' : ''}`}>
                    {/* Back */}
                    <div className="card-back card-face w-full h-full rounded-xl glass-panel flex items-center justify-center text-xl"
                      style={{ border: '2px solid #a855f755', background: 'linear-gradient(135deg, #1c0840, #110428)' }}>
                      ❓
                    </div>
                    {/* Front */}
                    <div className={`card-front card-face w-full h-full rounded-xl flex items-center justify-center text-2xl border-2 transition-all ${matched ? 'border-green-500 bg-green-900/30' : 'border-purple-500/50 bg-purple-900/30'}`}>
                      {card.emoji}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl px-8 py-6 text-center animate-pop-in">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-xl font-black text-green-400">نوبت تموم شد!</div>
            <div className="text-purple-300 mt-1">امتیاز: <span className="font-black text-white">{board.score}</span></div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          حرکت‌ها: {board.moves} | جفت‌ها: {board.matched.length / 2} / ۶
        </div>

        {/* Other players */}
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

        {!done && (
          <button onClick={submitScore}
            className="btn-game glass-panel rounded-xl px-6 py-2 text-sm text-gray-400 border border-gray-700">
            پاس دادن
          </button>
        )}
      </div>
    </div>
  )
}
