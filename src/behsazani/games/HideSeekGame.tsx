import { useState, useEffect, useRef, useCallback } from 'react'

const EMOJI_SETS = [
  ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮'],
  ['🍎','🍊','🍋','🍇','🍓','🍑','🥝','🍒','🫐','🍍','🥭','🍌'],
  ['⚽','🏀','🎾','🏈','🎱','🏐','🏉','🎳','🏸','🥊','🎯','🪃'],
  ['🚀','✈️','🚂','🚁','⛵','🏎️','🛸','🚤','🚲','🛻','🚃','🛵'],
]

type Difficulty = 'آسان' | 'متوسط' | 'سخت'

interface Config { pairs: number; previewSec: number; timeSec: number; emoji: string }
const CONFIGS: Record<Difficulty, Config> = {
  آسان:    { pairs: 6,  previewSec: 3, timeSec: 60,  emoji: '🟢' },
  متوسط:  { pairs: 8,  previewSec: 2, timeSec: 50,  emoji: '🟡' },
  سخت:    { pairs: 10, previewSec: 1, timeSec: 40,  emoji: '🔴' },
}

interface Card { id: number; emoji: string; pairId: number; flipped: boolean; matched: boolean }

function makeCards(pairs: number): Card[] {
  const set = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)]
  const chosen = [...set].sort(() => Math.random() - 0.5).slice(0, pairs)
  const cards: Card[] = [...chosen, ...chosen]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, pairId: chosen.indexOf(emoji), flipped: false, matched: false }))
  return cards
}

interface Props { onExit: () => void }

type Phase = 'menu' | 'preview' | 'playing' | 'won' | 'lost'

export default function HideSeekGame({ onExit }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('آسان')
  const [phase, setPhase] = useState<Phase>('menu')
  const [level, setLevel] = useState(1)
  const [totalScore, setTotalScore] = useState(0)
  const [cards, setCards] = useState<Card[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [previewLeft, setPreviewLeft] = useState(0)
  const [moves, setMoves] = useState(0)
  const [combo, setCombo] = useState(0)
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cfg = CONFIGS[difficulty]

  function showFeedback(text: string, color: string) {
    setFeedback({ text, color })
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedback(null), 800)
  }

  const startLevel = useCallback((lvl: number, diff: Difficulty) => {
    const c = CONFIGS[diff]
    const newCards = makeCards(c.pairs)
    setCards(newCards.map(card => ({ ...card, flipped: true })))
    setSelected([])
    setLocked(true)
    setMoves(0)
    setCombo(0)
    setPreviewLeft(c.previewSec)
    setPhase('preview')

    let pre = c.previewSec
    const preInterval = setInterval(() => {
      pre--
      setPreviewLeft(pre)
      if (pre <= 0) {
        clearInterval(preInterval)
        setCards(newCards.map(card => ({ ...card, flipped: false })))
        setLocked(false)
        setTimeLeft(c.timeSec)
        setPhase('playing')
      }
    }, 1000)
  }, [])

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setPhase('lost')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  function flipCard(idx: number) {
    if (locked || phase !== 'playing') return
    const card = cards[idx]
    if (card.flipped || card.matched) return
    if (selected.includes(idx)) return

    const newSelected = [...selected, idx]
    const newCards = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c)
    setCards(newCards)
    setSelected(newSelected)

    if (newSelected.length === 2) {
      setLocked(true)
      setMoves(m => m + 1)
      const [i1, i2] = newSelected
      const c1 = newCards[i1], c2 = newCards[i2]

      if (c1.pairId === c2.pairId) {
        const newCombo = combo + 1
        setCombo(newCombo)
        const pts = 100 + (newCombo > 1 ? (newCombo - 1) * 50 : 0)
        setTotalScore(s => s + pts)
        showFeedback(newCombo > 2 ? `🔥 کمبو ×${newCombo} +${pts}` : `✅ +${pts}`, '#22c55e')

        setTimeout(() => {
          const matched = newCards.map((c, i) =>
            i === i1 || i === i2 ? { ...c, matched: true } : c
          )
          setCards(matched)
          setSelected([])
          setLocked(false)
          if (matched.every(c => c.matched)) {
            clearInterval(timerRef.current!)
            const timeBonus = timeLeft * 5
            setTotalScore(s => s + timeBonus)
            showFeedback(`🏆 لِوِل ${level} تمام! +${timeBonus} بونوس زمان`, '#ffd60a')
            setTimeout(() => setPhase('won'), 900)
          }
        }, 500)
      } else {
        setCombo(0)
        showFeedback('❌ اشتباه', '#CC2229')
        setTimeout(() => {
          setCards(newCards.map((c, i) =>
            i === i1 || i === i2 ? { ...c, flipped: false } : c
          ))
          setSelected([])
          setLocked(false)
        }, 800)
      }
    }
  }

  const matched = cards.filter(c => c.matched).length / 2
  const total = cards.length / 2
  const progress = total > 0 ? matched / total : 0

  if (phase === 'menu') return (
    <div className="h-full overflow-y-auto" dir="rtl">
    <div className="min-h-full flex flex-col items-center justify-center gap-6 px-6 py-8"
      style={{ background: 'linear-gradient(135deg, #0e0e0f, #181618, #1a1010)' }}>
      <div className="flex flex-col items-center gap-2">
        <div className="text-6xl" style={{ filter: 'drop-shadow(0 0 20px #a855f7)' }}>🃏</div>
        <h1 className="font-black text-white text-3xl">قایم‌باشک</h1>
        <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>جفت کارت‌های یکسان را پیدا کن</p>
      </div>

      {totalScore > 0 && (
        <div className="px-5 py-2 rounded-2xl"
          style={{ background: 'rgba(255,214,10,0.1)', border: '1px solid #ffd60a44' }}>
          <span className="font-black text-white">امتیاز کل: </span>
          <span className="font-black text-2xl" style={{ color: '#ffd60a' }}>{totalScore}</span>
        </div>
      )}

      <div className="w-full max-w-xs flex flex-col gap-2">
        <p className="text-xs font-bold text-center mb-1" style={{ color: '#9a9b9e' }}>سطح دشواری</p>
        {(Object.keys(CONFIGS) as Difficulty[]).map(d => {
          const c = CONFIGS[d]
          const sel = difficulty === d
          return (
            <button key={d} onClick={() => setDifficulty(d)}
              className="btn-game flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-white"
              style={{
                background: sel ? 'rgba(168,85,247,0.25)' : 'rgba(26,26,28,0.8)',
                border: `1.5px solid ${sel ? '#a855f7' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: sel ? '0 0 18px rgba(168,85,247,0.3)' : 'none',
              }}>
              <span>{c.emoji} {d}</span>
              <span className="text-xs font-bold" style={{ color: '#9a9b9e' }}>
                {c.pairs} جفت • {c.timeSec} ثانیه
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={() => { setLevel(1); setTotalScore(0); startLevel(1, difficulty) }}
          className="btn-game flex-1 py-4 rounded-2xl font-black text-white text-lg"
          style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
          شروع بازی!
        </button>
        <button onClick={onExit}
          className="btn-game px-4 py-4 rounded-2xl font-bold text-sm"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#9a9b9e' }}>
          خروج
        </button>
      </div>
    </div>
    </div>
  )

  if (phase === 'preview' || phase === 'playing') {
    const cols = total <= 6 ? 3 : total <= 8 ? 4 : 4
    const timerPct = timeLeft / cfg.timeSec
    const timerColor = timerPct > 0.5 ? '#22c55e' : timerPct > 0.25 ? '#ffd60a' : '#CC2229'

    return (
      <div className="h-full flex flex-col" dir="rtl"
        style={{ background: 'linear-gradient(135deg, #0e0e0f, #181618, #1a1010)' }}>

        {/* Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2 flex items-center justify-between">
          <button onClick={() => { clearInterval(timerRef.current!); setPhase('menu') }}
            className="btn-game w-9 h-9 rounded-xl flex items-center justify-center font-black text-white"
            style={{ background: 'rgba(255,255,255,0.07)' }}>→</button>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>لِوِل</p>
              <p className="font-black text-white">{level}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>امتیاز</p>
              <p className="font-black" style={{ color: '#ffd60a' }}>{totalScore}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>حرکت</p>
              <p className="font-black text-white">{moves}</p>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-lg"
            style={{ background: `${timerColor}22`, border: `2px solid ${timerColor}`, color: timerColor }}>
            {phase === 'preview' ? previewLeft : timeLeft}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #a855f7, #6366f1)' }} />
          </div>
          <p className="text-xs mt-1 text-center" style={{ color: '#9a9b9e' }}>
            {phase === 'preview'
              ? `👀 کارت‌ها را حفظ کن! (${previewLeft})`
              : `${matched} از ${total} جفت پیدا شد`}
          </p>
        </div>

        {/* Combo badge */}
        {combo > 1 && (
          <div className="flex-shrink-0 flex justify-center pb-1">
            <div className="px-3 py-1 rounded-full text-xs font-black"
              style={{ background: 'rgba(249,115,22,0.25)', border: '1.5px solid #f97316', color: '#f97316' }}>
              🔥 کمبو ×{combo}
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div className="flex-1 flex items-center justify-center px-4 py-2 min-h-0">
          <div className="grid gap-2 w-full max-w-sm"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {cards.map((card, idx) => {
              const isFlipped = card.flipped || card.matched
              const isMatched = card.matched
              return (
                <div key={card.id} onClick={() => flipCard(idx)}
                  className="aspect-square card-flip"
                  style={{ cursor: isFlipped ? 'default' : 'pointer' }}>
                  <div className={`card-flip-inner w-full h-full rounded-xl ${isFlipped ? 'flipped' : ''}`}
                    style={{ transition: 'transform 0.35s' }}>
                    {/* Back */}
                    <div className="card-back card-face w-full h-full rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        background: 'linear-gradient(135deg, #1c0840, #110428)',
                        border: '2px solid rgba(168,85,247,0.3)',
                        boxShadow: '0 0 8px rgba(168,85,247,0.15)',
                      }}>
                      🔮
                    </div>
                    {/* Front */}
                    <div className="card-front card-face w-full h-full rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        background: isMatched
                          ? 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.1))'
                          : 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(99,102,241,0.1))',
                        border: `2px solid ${isMatched ? '#22c55e88' : '#a855f788'}`,
                        boxShadow: isMatched ? '0 0 16px rgba(34,197,94,0.4)' : '0 0 12px rgba(168,85,247,0.3)',
                        transform: isMatched ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }}>
                      {card.emoji}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback flash */}
        {feedback && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            <div className="font-black text-4xl px-6 py-3 rounded-2xl animate-pop-in"
              style={{ color: feedback.color, background: `${feedback.color}22`, border: `2px solid ${feedback.color}55` }}>
              {feedback.text}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (phase === 'won') return (
    <div className="h-full overflow-y-auto" dir="rtl">
    <div className="min-h-full flex flex-col items-center justify-center gap-6 px-6 py-8"
      style={{ background: 'linear-gradient(135deg, #0e0e0f, #181618, #1a1010)' }}>
      <div className="text-7xl animate-pop-in" style={{ filter: 'drop-shadow(0 0 30px #ffd60a)' }}>🏆</div>
      <h2 className="font-black text-white text-3xl text-center">لِوِل {level} تمام!</h2>
      <div className="flex gap-4">
        <div className="px-4 py-3 rounded-xl text-center" style={{ background: 'rgba(255,214,10,0.1)', border: '1px solid #ffd60a44' }}>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>امتیاز کل</p>
          <p className="font-black text-2xl" style={{ color: '#ffd60a' }}>{totalScore}</p>
        </div>
        <div className="px-4 py-3 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e44' }}>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>حرکت‌ها</p>
          <p className="font-black text-2xl text-white">{moves}</p>
        </div>
        <div className="px-4 py-3 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid #a855f744' }}>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>زمان</p>
          <p className="font-black text-2xl text-white">{timeLeft}s</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button onClick={() => { const nextLevel = level + 1; setLevel(nextLevel); startLevel(nextLevel, difficulty) }}
          className="btn-game py-4 rounded-2xl font-black text-white text-lg"
          style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
          لِوِل {level + 1} →
        </button>
        <button onClick={() => { setLevel(1); setTotalScore(0); setPhase('menu') }}
          className="btn-game py-3 rounded-2xl font-bold text-sm"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#9a9b9e' }}>
          منوی اصلی
        </button>
      </div>
    </div>
    </div>
  )

  if (phase === 'lost') return (
    <div className="h-full overflow-y-auto" dir="rtl">
    <div className="min-h-full flex flex-col items-center justify-center gap-6 px-6 py-8"
      style={{ background: 'linear-gradient(135deg, #0e0e0f, #181618, #1a1010)' }}>
      <div className="text-7xl">💔</div>
      <h2 className="font-black text-white text-2xl text-center">وقت تموم شد!</h2>
      <div className="flex gap-4">
        <div className="px-4 py-3 rounded-xl text-center" style={{ background: 'rgba(255,214,10,0.1)' }}>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>امتیاز</p>
          <p className="font-black text-2xl" style={{ color: '#ffd60a' }}>{totalScore}</p>
        </div>
        <div className="px-4 py-3 rounded-xl text-center" style={{ background: 'rgba(204,34,41,0.1)' }}>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>جفت‌های پیدا شده</p>
          <p className="font-black text-2xl text-white">{matched}/{total}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button onClick={() => startLevel(level, difficulty)}
          className="btn-game py-4 rounded-2xl font-black text-white text-lg"
          style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
          دوباره امتحان کن
        </button>
        <button onClick={() => { setLevel(1); setTotalScore(0); setPhase('menu') }}
          className="btn-game py-3 rounded-2xl font-bold text-sm"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#9a9b9e' }}>
          منوی اصلی
        </button>
      </div>
    </div>
    </div>
  )

  return null
}
