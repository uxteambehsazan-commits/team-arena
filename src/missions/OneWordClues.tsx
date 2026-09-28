import { useState, useEffect } from 'react'
import type { GameState, GameAction } from '../types'
import { ONE_WORD_QUESTIONS, PLAYER_COLORS } from '../constants'
import GameHUD from '../components/GameHUD'
import { avatarSrc } from '../lib/avatars'

interface Props {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  localPlayerId?: string
}

const CLUE_SCORES = [300, 200, 100, 50]

export default function OneWordClues({ state, dispatch, localPlayerId }: Props) {
  const ow = state.oneWordState
  const activePlayers = state.players.filter(p => p.connected)
  // In online mode: use localPlayerId. In local mode: player picker
  const [localTab, setLocalTab] = useState<string>(activePlayers[0]?.id ?? '')
  const myId = localPlayerId ?? localTab
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const isLocalMode = !localPlayerId

  useEffect(() => {
    if (!ow) return
    const q = ONE_WORD_QUESTIONS[ow.questionIndex % ONE_WORD_QUESTIONS.length]
    if (ow.revealedClues >= q.clues.length || ow.winner) return
    const t = setTimeout(() => dispatch({ type: 'REVEAL_CLUE' }), 12000)
    return () => clearTimeout(t)
  }, [ow?.revealedClues, ow?.winner])

  if (!ow) return null

  const question = ONE_WORD_QUESTIONS[ow.questionIndex % ONE_WORD_QUESTIONS.length]
  const visibleClues = question.clues.slice(0, ow.revealedClues)
  const myWrong = ow.wrongGuesses[myId] ?? 0
  const mySubmitted = state.submitted[myId]
  const winner = ow.winner
  const currentScore = CLUE_SCORES[Math.min(ow.revealedClues - 1, CLUE_SCORES.length - 1)]

  function submitGuess() {
    const g = guess.trim()
    if (!g || mySubmitted || myWrong >= 3) return
    dispatch({ type: 'ONE_WORD_GUESS', playerId: myId, guess: g })
    const isCorrect = g.toLowerCase() === question.answer.toLowerCase()
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setTimeout(() => setFeedback(null), 800)
    if (!isCorrect) setGuess('')
  }

  return (
    <div className="h-full flex flex-col">
      <GameHUD state={state} />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">

        {/* Score potential */}
        <div className="text-center animate-pop-in">
          <p className="text-xs mb-1" style={{ color: '#6D6E71' }}>امتیاز الان اگه درست بزنی:</p>
          <div className="font-display text-5xl font-black"
            style={{ color: '#ffd60a', textShadow: '0 0 20px #ffd60a88' }}>
            +{currentScore}
          </div>
        </div>

        {/* Clues revealed */}
        <div className="w-full max-w-sm flex flex-col gap-2">
          {CLUE_SCORES.map((score, i) => {
            const clue = question.clues[i]
            const revealed = i < ow.revealedClues
            return (
              <div key={i} className="flex items-center gap-3 glass-panel rounded-2xl px-4 py-3 transition-all"
                style={{
                  opacity: revealed ? 1 : 0.25,
                  border: `1.5px solid ${revealed ? '#ffd60a44' : '#2e2e32'}`,
                  transform: revealed ? 'scale(1)' : 'scale(0.97)',
                }}>
                <div className="w-12 text-center">
                  <div className="font-display text-xs font-black"
                    style={{ color: revealed ? '#ffd60a' : '#555' }}>
                    +{score}
                  </div>
                </div>
                <div className="flex-1 text-center">
                  {revealed ? (
                    <span className="font-bold text-white text-lg animate-pop-in">{clue}</span>
                  ) : (
                    <span className="text-gray-600 text-sm">سرنخ {i + 1}</span>
                  )}
                </div>
                {revealed && (
                  <div className="w-2 h-2 rounded-full" style={{ background: '#ffd60a' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Winner announcement */}
        {winner && (
          <div className="glass-panel rounded-2xl px-6 py-4 text-center w-full max-w-sm animate-pop-in"
            style={{ border: '2px solid #ffd60a44' }}>
            <div className="text-3xl mb-1">🎉</div>
            <p className="font-display text-xl font-black text-white">
              {state.players.find(p => p.id === winner)?.name} برنده شد!
            </p>
            <p className="text-2xl font-black mt-1" style={{ color: '#ffd60a' }}>
              جواب: {question.answer}
            </p>
          </div>
        )}

        {/* Local mode: player picker */}
        {isLocalMode && !winner && (
          <div className="flex gap-1.5 flex-wrap justify-center w-full max-w-sm">
            {activePlayers.map(p => {
              const c = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
              const done = state.submitted[p.id] || (ow.wrongGuesses[p.id] ?? 0) >= 3
              const isMe = myId === p.id
              return (
                <button key={p.id}
                  onClick={() => { if (!done) { setLocalTab(p.id); setGuess(''); setFeedback(null) } }}
                  className="btn-game flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{
                    background: isMe ? `${c.bg}33` : '#1a1a1c',
                    border: `2px solid ${isMe ? c.bg : done ? '#22c55e44' : '#2e2e32'}`,
                    color: isMe ? c.light : done ? '#22c55e' : '#6D6E71',
                    opacity: done && !isMe ? 0.6 : 1,
                  }}>
                  <img src={avatarSrc(p.avatar)} alt="" className="w-4 h-4 rounded-full object-cover" />
                  {p.name}
                  {done && <span>✓</span>}
                  {(ow.wrongGuesses[p.id] ?? 0) > 0 && !done && <span style={{ color: '#CC2229' }}>×{ow.wrongGuesses[p.id]}</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Allow guessing until submitted or 3 wrong; phase change handles game-over */}
        {!mySubmitted && myWrong < 3 && (
          <div className="w-full max-w-sm flex gap-2">
            <input
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitGuess()}
              placeholder="حدست رو بنویس..."
              dir="rtl"
              className="flex-1 rounded-2xl px-4 py-3 text-white outline-none text-sm"
              style={{
                background: '#1e1e20',
                border: `1.5px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#CC2229' : '#2e2e32'}`,
                transition: 'border-color 0.2s',
              }}
            />
            <button
              onClick={submitGuess}
              disabled={!guess.trim()}
              className="btn-game px-5 rounded-2xl font-black text-white disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg,#ffd60a,#e6ac00)', color: '#111' }}>
              ➤
            </button>
          </div>
        )}

        {myWrong >= 3 && !mySubmitted && (
          <div className="glass-panel rounded-2xl px-5 py-3 text-center w-full max-w-sm"
            style={{ border: '1px solid #CC222944' }}>
            <p className="text-red-400 font-bold">۳ بار اشتباه زدی!</p>
            <p className="text-xs mt-1" style={{ color: '#6D6E71' }}>صبر کن تا بقیه جواب بدن</p>
          </div>
        )}

        {mySubmitted && !winner && (
          <div className="glass-panel rounded-2xl px-5 py-3 text-center w-full max-w-sm"
            style={{ border: '1px solid #22c55e44' }}>
            <p className="text-green-400 font-bold text-lg">✓ جواب درست!</p>
            <p className="text-xs mt-1" style={{ color: '#6D6E71' }}>منتظر بقیه...</p>
          </div>
        )}

        {/* Wrong tries indicator */}
        {myWrong > 0 && !mySubmitted && (
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-3 h-3 rounded-full"
                style={{ background: i < myWrong ? '#CC2229' : '#2e2e32' }} />
            ))}
            <span className="text-xs mr-1" style={{ color: '#6D6E71' }}>اشتباه</span>
          </div>
        )}

        {/* Players row */}
        <div className="flex gap-2 flex-wrap justify-center">
          {activePlayers.map(p => {
            const c = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            const done = state.submitted[p.id] || p.id === winner
            return (
              <div key={p.id} className="flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{ background: `${c.bg}22`, border: `1px solid ${c.bg}44` }}>
                <img src={avatarSrc(p.avatar)} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span className="text-xs" style={{ color: c.light }}>{p.name}</span>
                {done && <span className="text-green-400 text-xs">✓</span>}
                {(ow.wrongGuesses[p.id] ?? 0) > 0 && !done && (
                  <span className="text-red-400 text-xs">×{ow.wrongGuesses[p.id]}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
