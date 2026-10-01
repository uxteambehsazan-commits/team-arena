import { useState, useEffect, useRef } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'

// ─── WORD LIST ────────────────────────────────────────────────────────────────

const SECRET_WORDS = [
  'دریا', 'کوه', 'آفتاب', 'ماه', 'ستاره', 'باران', 'برف', 'باد', 'آتش', 'ابر',
  'پزشک', 'معلم', 'هنرمند', 'ورزشکار', 'دانشمند', 'کشاورز', 'آشپز', 'موسیقی‌دان',
  'سینما', 'رستوران', 'بیمارستان', 'مدرسه', 'دانشگاه', 'فرودگاه', 'بازار',
  'فوتبال', 'شنا', 'دویدن', 'شطرنج', 'کوه‌نوردی', 'تنیس', 'بسکتبال',
  'گربه', 'سگ', 'خرگوش', 'شیر', 'پرنده', 'ماهی', 'اسب', 'فیل', 'پلنگ',
  'کتاب', 'موسیقی', 'نقاشی', 'شعر', 'داستان', 'فیلم', 'تئاتر',
  'کیک', 'پیتزا', 'سوپ', 'نان', 'قهوه', 'عسل', 'شکلات', 'بستنی',
  'خورشید', 'ابر', 'رنگین‌کمان', 'طوفان', 'زلزله', 'آتشفشان',
  'قلعه', 'جزیره', 'صحرا', 'جنگل', 'رودخانه', 'غار', 'آبشار',
]

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Phase =
  | 'intro'
  | 'round_start'       // all players see: guesser name + word entry
  | 'enter_word'        // word-enterer types secret word (guesser looks away)
  | 'clue_gate'         // pass phone to next clue giver
  | 'clue_reveal'       // clue giver taps to reveal word
  | 'clue_input'        // clue giver types their clue
  | 'clue_submitted'    // brief feedback before passing to next
  | 'review'            // show all clues; eliminate duplicates
  | 'pass_to_guesser'   // pass phone back to guesser
  | 'guess'             // guesser sees clues, types answer
  | 'round_result'      // correct / wrong + reveal word
  | 'game_over'

interface Props {
  players: BehsazaniPlayer[]
  myPlayer?: BehsazaniPlayer
  isHost?: boolean
  isOnline?: boolean
  roomCode?: string
  hostPlayerId?: string
  onExit: () => void
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function randomWord(used: string[]): string {
  const pool = SECRET_WORDS.filter(w => !used.includes(w))
  if (!pool.length) return SECRET_WORDS[Math.floor(Math.random() * SECRET_WORDS.length)]
  return pool[Math.floor(Math.random() * pool.length)]
}

function computeClues(
  clueGivers: BehsazaniPlayer[],
  clues: Record<string, string>
): { playerId: string; name: string; clue: string; duplicate: boolean }[] {
  const entries = clueGivers.map(p => ({ playerId: p.id, name: p.name, clue: (clues[p.id] || '').trim() }))
  const texts = entries.map(e => e.clue.toLowerCase()).filter(Boolean)
  return entries.map(e => ({
    ...e,
    duplicate: e.clue !== '' && texts.filter(t => t === e.clue.toLowerCase()).length > 1,
  }))
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Screen({ children, dir = 'rtl' }: { children: React.ReactNode; dir?: string }) {
  return (
    <div className="h-full flex flex-col overflow-hidden" dir={dir}>
      {children}
    </div>
  )
}

function CenteredBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 overflow-y-auto py-6">
      {children}
    </div>
  )
}

function PrimaryBtn({ onClick, disabled, children, color = '#22c55e' }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; color?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full max-w-xs py-4 rounded-2xl font-black text-white text-lg transition-all"
      style={{
        background: disabled ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: disabled ? 'none' : `0 8px 24px ${color}44`,
        color: disabled ? '#555' : '#fff',
      }}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full max-w-xs py-3 rounded-2xl font-bold text-sm"
      style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {children}
    </button>
  )
}

function RoundBadge({ round, total }: { round: number; total: number }) {
  return (
    <div className="px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
      دور {round} از {total}
    </div>
  )
}

function PlayerBubble({ name, label, color = '#22c55e' }: { name: string; label?: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl"
        style={{ background: `${color}18`, border: `2px solid ${color}55` }}>
        {name.charAt(0)}
      </div>
      <p className="font-black text-white text-lg">{name}</p>
      {label && <p className="text-xs" style={{ color: '#9a9b9e' }}>{label}</p>}
    </div>
  )
}

function TimerBar({ seconds, total, color = '#22c55e' }: { seconds: number; total: number; color?: string }) {
  const pct = Math.max(0, seconds / total) * 100
  const urgent = seconds <= 10
  return (
    <div className="w-full max-w-xs flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: urgent ? '#CC2229' : color }} />
      </div>
      <span className="font-black text-sm w-8 text-right" style={{ color: urgent ? '#CC2229' : '#9a9b9e', fontFamily: 'monospace' }}>
        {seconds}
      </span>
    </div>
  )
}

function useTimer(active: boolean, initial: number, onExpire?: () => void) {
  const [secs, setSecs] = useState(initial)
  const expiredRef = useRef(false)
  useEffect(() => {
    setSecs(initial)
    expiredRef.current = false
  }, [active, initial])
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          clearInterval(id)
          if (!expiredRef.current) { expiredRef.current = true; onExpire?.() }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [active, onExpire])
  return secs
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function OneWordGame({ players, onExit }: Props) {
  const totalRounds = players.length
  const [roundNum, setRoundNum] = useState(0)          // 0-indexed
  const [phase, setPhase] = useState<Phase>('intro')
  const [secretWord, setSecretWord] = useState('')
  const [wordInput, setWordInput] = useState('')
  const [clues, setClues] = useState<Record<string, string>>({})
  const [clueGiverIdx, setClueGiverIdx] = useState(0)
  const [clueRevealed, setClueRevealed] = useState(false)
  const [clueInput, setClueInput] = useState('')
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(players.map(p => [p.id, 0])))
  const [guessInput, setGuessInput] = useState('')
  const [guessResult, setGuessResult] = useState<'correct' | 'wrong' | null>(null)
  const [usedWords, setUsedWords] = useState<string[]>([])

  const guesserIdx = roundNum % players.length
  const guesser = players[guesserIdx]
  const clueGivers = players.filter(p => p.id !== guesser.id)
  const currentClueGiver = clueGivers[clueGiverIdx]
  const allClues = computeClues(clueGivers, clues)
  const validClues = allClues.filter(c => !c.duplicate && c.clue)

  const guessTimer = useTimer(phase === 'guess' && guessResult === null, 60, () => {
    if (guessResult === null) setGuessResult('wrong')
  })

  function startRound() {
    setSecretWord('')
    setWordInput('')
    setClues({})
    setClueGiverIdx(0)
    setClueRevealed(false)
    setClueInput('')
    setGuessInput('')
    setGuessResult(null)
    setPhase('round_start')
  }

  function handleWordSubmit() {
    const w = wordInput.trim()
    if (!w) return
    setSecretWord(w)
    setUsedWords(prev => [...prev, w])
    setPhase('clue_gate')
  }

  function handleClueSubmit() {
    const c = clueInput.trim()
    if (!c || !currentClueGiver) return
    setClues(prev => ({ ...prev, [currentClueGiver.id]: c }))
    setClueInput('')
    setClueRevealed(false)
    setPhase('clue_submitted')
  }

  function advanceClueGiver() {
    const next = clueGiverIdx + 1
    if (next >= clueGivers.length) {
      setPhase('review')
    } else {
      setClueGiverIdx(next)
      setPhase('clue_gate')
    }
  }

  function handleGuessSubmit() {
    const g = guessInput.trim()
    if (!g) return
    const correct = g.toLowerCase() === secretWord.toLowerCase()
    if (correct) setScores(prev => ({ ...prev, [guesser.id]: (prev[guesser.id] || 0) + 1 }))
    setGuessResult(correct ? 'correct' : 'wrong')
  }

  function handleSkipGuess() {
    setGuessResult('wrong')
  }

  function handleNextRound() {
    if (roundNum + 1 >= totalRounds) {
      setPhase('game_over')
    } else {
      setRoundNum(r => r + 1)
      startRound()
    }
  }

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <Screen>
      <CenteredBody>
        <div className="text-6xl" style={{ animation: 'pulse 2s ease-in-out infinite' }}>💬</div>
        <div className="text-center">
          <h1 className="font-black text-white text-2xl">یک کلمه</h1>
          <p className="text-sm mt-2" style={{ color: '#9a9b9e' }}>با یک کلمه، هم‌تیمی‌ات را راهنمایی کن!</p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-3">
          {[
            { icon: '👁️', step: '۱', text: 'یک نفر می‌شه حدس‌زننده و کلمه رو نمی‌بینه' },
            { icon: '💡', step: '۲', text: 'بقیه هر کدام یک سرنخ می‌دن (سرنخ‌های تکراری حذف می‌شن!)' },
            { icon: '🎯', step: '۳', text: 'حدس‌زننده با سرنخ‌های باقی‌مونده کلمه رو پیدا می‌کنه' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <span className="font-black text-xs" style={{ color: '#22c55e' }}>مرحله {item.step}</span>
                <p className="font-bold text-white text-sm mt-0.5">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <div className="flex gap-1.5">
            {players.map(p => (
              <div key={p.id} className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.07)', color: '#9a9b9e' }}>
                {p.name}
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: '#6D6E71' }}>{players.length} بازیکن — {totalRounds} دور</p>
        </div>

        <PrimaryBtn onClick={() => startRound()} color="#22c55e">
          شروع بازی ←
        </PrimaryBtn>
      </CenteredBody>
    </Screen>
  )

  // ── ROUND START ──────────────────────────────────────────────────────────────
  if (phase === 'round_start') return (
    <Screen>
      <CenteredBody>
        <RoundBadge round={roundNum + 1} total={totalRounds} />

        <div className="flex flex-col items-center gap-1 text-center">
          <div className="text-4xl">👁️</div>
          <h2 className="font-black text-white text-xl mt-1">
            <span style={{ color: '#22c55e' }}>{guesser.name}</span> حدس‌زننده این دوره
          </h2>
          <p className="text-sm" style={{ color: '#9a9b9e' }}>
            {guesser.name} باید گوشی رو نبینه — یه بازیکن دیگه کلمه رو وارد می‌کنه
          </p>
        </div>

        <div className="w-full max-w-xs px-5 py-4 rounded-2xl text-center"
          style={{ background: 'rgba(255,214,10,0.08)', border: '1.5px solid rgba(255,214,10,0.25)' }}>
          <p className="text-sm font-bold" style={{ color: '#ffd60a' }}>
            ⚠️ {guesser.name} گوشی رو نگاه نکن!
          </p>
          <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>گوشی رو بده به یه نفر دیگه تا کلمه رو وارد کنه</p>
        </div>

        <PrimaryBtn onClick={() => setPhase('enter_word')} color="#22c55e">
          📱 آماده‌ام، ادامه بده
        </PrimaryBtn>
      </CenteredBody>
    </Screen>
  )

  // ── ENTER WORD ───────────────────────────────────────────────────────────────
  if (phase === 'enter_word') return (
    <Screen>
      <CenteredBody>
        <RoundBadge round={roundNum + 1} total={totalRounds} />

        <div className="text-center">
          <div className="text-4xl">🔐</div>
          <h2 className="font-black text-white text-xl mt-2">کلمه مخفی رو وارد کن</h2>
          <p className="text-sm mt-1" style={{ color: '#9a9b9e' }}>
            مطمئن شو <span style={{ color: '#CC2229', fontWeight: 700 }}>{guesser.name}</span> نمی‌بینه
          </p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="relative">
            <input
              value={wordInput}
              onChange={e => setWordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && wordInput.trim() && handleWordSubmit()}
              placeholder="کلمه مخفی را بنویس..."
              autoFocus
              className="w-full px-4 py-4 rounded-2xl font-black text-white text-lg text-center"
              style={{
                background: 'rgba(20,20,22,0.95)',
                border: '2px solid rgba(34,197,94,0.4)',
                outline: 'none',
                fontFamily: "'IranSans', sans-serif",
              }}
            />
          </div>
          <p className="text-xs text-center" style={{ color: '#6D6E71' }}>یا از این کلمه‌ها استفاده کن:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[randomWord(usedWords), randomWord([...usedWords, wordInput]), randomWord([...usedWords, wordInput, ''])].slice(0, 3).map((w, i) => (
              <button key={i} onClick={() => setWordInput(w)}
                className="px-3 py-1.5 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                {w}
              </button>
            ))}
          </div>
        </div>

        <PrimaryBtn onClick={handleWordSubmit} disabled={!wordInput.trim()} color="#22c55e">
          تأیید و شروع سرنخ‌ها →
        </PrimaryBtn>
      </CenteredBody>
    </Screen>
  )

  // ── CLUE GATE (pass phone to next clue giver) ────────────────────────────────
  if (phase === 'clue_gate') return (
    <Screen>
      <CenteredBody>
        <RoundBadge round={roundNum + 1} total={totalRounds} />

        <PlayerBubble
          name={currentClueGiver?.name ?? ''}
          label={`سرنخ ${clueGiverIdx + 1} از ${clueGivers.length}`}
          color="#7c3aed"
        />

        <div className="text-center">
          <h2 className="font-black text-white text-xl">
            گوشی رو به <span style={{ color: '#c084fc' }}>{currentClueGiver?.name}</span> بده
          </h2>
          <p className="text-sm mt-2" style={{ color: '#9a9b9e' }}>
            {currentClueGiver?.name} باید یک کلمه سرنخ بده
          </p>
        </div>

        <div className="w-full max-w-xs px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs text-center" style={{ color: '#6D6E71' }}>سرنخ‌های داده‌شده:</p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {clueGivers.slice(0, clueGiverIdx).map(p => (
              <span key={p.id} className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                ✓ {p.name}
              </span>
            ))}
            {clueGivers.slice(clueGiverIdx).map(p => (
              <span key={p.id} className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}>
                {p.name}
              </span>
            ))}
          </div>
        </div>

        <PrimaryBtn onClick={() => setPhase('clue_reveal')} color="#7c3aed">
          📱 {currentClueGiver?.name} آماده‌ام
        </PrimaryBtn>
      </CenteredBody>
    </Screen>
  )

  // ── CLUE REVEAL (tap to see word) ────────────────────────────────────────────
  if (phase === 'clue_reveal') return (
    <Screen>
      <CenteredBody>
        <RoundBadge round={roundNum + 1} total={totalRounds} />

        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: '#c084fc' }}>
            {currentClueGiver?.name}، سرنخت رو آماده کن
          </p>
          <h2 className="font-black text-white text-xl mt-1">کلمه مخفی:</h2>
        </div>

        {!clueRevealed ? (
          <button
            onClick={() => setClueRevealed(true)}
            className="w-48 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
            style={{ background: 'rgba(124,58,237,0.15)', border: '2px dashed rgba(124,58,237,0.5)' }}>
            <span className="text-2xl">👆</span>
            <span className="text-sm font-bold" style={{ color: '#c084fc' }}>ضربه بزن تا ببینی</span>
          </button>
        ) : (
          <div className="w-full max-w-xs">
            <div className="py-6 rounded-2xl text-center"
              style={{ background: 'rgba(124,58,237,0.15)', border: '2px solid rgba(124,58,237,0.5)' }}>
              <p className="font-black text-white text-4xl">{secretWord}</p>
            </div>
            <p className="text-xs text-center mt-3" style={{ color: '#9a9b9e' }}>
              ⚠️ کلمه رو مستقیم نگو — فقط یک کلمه سرنخ بده!
            </p>
          </div>
        )}

        {clueRevealed && (
          <div className="w-full max-w-xs flex flex-col gap-3">
            <div className="relative">
              <input
                value={clueInput}
                onChange={e => {
                  // Only one word allowed
                  const v = e.target.value.replace(/\s+/g, '')
                  setClueInput(v)
                }}
                onKeyDown={e => e.key === 'Enter' && clueInput.trim() && handleClueSubmit()}
                placeholder="یک کلمه سرنخ..."
                autoFocus
                className="w-full px-4 py-4 rounded-2xl font-black text-white text-lg text-center"
                style={{
                  background: 'rgba(20,20,22,0.95)',
                  border: '2px solid rgba(124,58,237,0.4)',
                  outline: 'none',
                  fontFamily: "'IranSans', sans-serif",
                }}
              />
            </div>
            <p className="text-xs text-center" style={{ color: '#6D6E71' }}>فقط یک کلمه — بدون فاصله</p>
            <PrimaryBtn onClick={handleClueSubmit} disabled={!clueInput.trim()} color="#7c3aed">
              ارسال سرنخ ←
            </PrimaryBtn>
          </div>
        )}
      </CenteredBody>
    </Screen>
  )

  // ── CLUE SUBMITTED ───────────────────────────────────────────────────────────
  if (phase === 'clue_submitted') {
    const submitted = clueGivers.slice(0, clueGiverIdx + 1)
    const remaining = clueGivers.slice(clueGiverIdx + 1)
    return (
      <Screen>
        <CenteredBody>
          <RoundBadge round={roundNum + 1} total={totalRounds} />

          <div className="text-center">
            <div className="text-5xl">✅</div>
            <h2 className="font-black text-white text-xl mt-2">سرنخ ارسال شد!</h2>
            <p className="text-sm mt-1" style={{ color: '#9a9b9e' }}>
              {remaining.length > 0
                ? `${remaining.length} نفر دیگه سرنخ می‌دن`
                : 'همه سرنخ‌ها آماده‌ست!'
              }
            </p>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-1.5">
            {submitted.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span style={{ color: '#22c55e' }}>✓</span>
                <span className="font-bold text-white text-sm flex-1">{p.name}</span>
                <span className="text-xs" style={{ color: '#6D6E71' }}>ارسال شد</span>
              </div>
            ))}
            {remaining.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#555' }}>○</span>
                <span className="font-bold text-sm flex-1" style={{ color: '#6D6E71' }}>{p.name}</span>
                <span className="text-xs" style={{ color: '#555' }}>در انتظار</span>
              </div>
            ))}
          </div>

          <PrimaryBtn onClick={advanceClueGiver} color={remaining.length > 0 ? '#7c3aed' : '#22c55e'}>
            {remaining.length > 0
              ? `بعدی: ${remaining[0].name} ←`
              : '🎯 دیدن سرنخ‌های نهایی'
            }
          </PrimaryBtn>
        </CenteredBody>
      </Screen>
    )
  }

  // ── REVIEW (host sees all clues, eliminates duplicates) ──────────────────────
  if (phase === 'review') return (
    <Screen>
      <div className="flex-shrink-0 px-4 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <RoundBadge round={roundNum + 1} total={totalRounds} />
        <p className="text-xs" style={{ color: '#9a9b9e' }}>پیش از نشان دادن به {guesser.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <div className="text-center mb-1">
          <h2 className="font-black text-white text-lg">سرنخ‌های نهایی</h2>
          {allClues.some(c => c.duplicate) && (
            <p className="text-xs mt-1" style={{ color: '#ffd60a' }}>
              ⚠️ سرنخ‌های تکراری حذف شدن — قانون بازیه!
            </p>
          )}
        </div>

        {allClues.map(c => (
          <div key={c.playerId} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: c.duplicate ? 'rgba(109,110,113,0.06)' : 'rgba(34,197,94,0.08)',
              border: `1.5px solid ${c.duplicate ? 'rgba(255,255,255,0.05)' : 'rgba(34,197,94,0.25)'}`,
              opacity: c.duplicate ? 0.6 : 1,
            }}>
            {c.duplicate
              ? <span className="text-lg">🚫</span>
              : <span className="text-lg">✅</span>
            }
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{ color: '#6D6E71' }}>{c.name}</p>
              <p className="font-black text-white" style={{ textDecoration: c.duplicate ? 'line-through' : 'none' }}>
                {c.clue || <span style={{ color: '#555' }}>—</span>}
              </p>
            </div>
            {c.duplicate && <span className="text-xs px-2 py-0.5 rounded-lg font-bold" style={{ background: 'rgba(204,34,41,0.15)', color: '#CC2229' }}>تکراری</span>}
          </div>
        ))}

        {validClues.length === 0 && (
          <div className="px-4 py-4 rounded-2xl text-center"
            style={{ background: 'rgba(204,34,41,0.08)', border: '1px solid rgba(204,34,41,0.2)' }}>
            <p className="font-bold text-sm" style={{ color: '#CC2229' }}>همه سرنخ‌ها تکراری بودند!</p>
            <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>{guesser.name} بدون سرنخ حدس می‌زنه</p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 pb-5">
        <PrimaryBtn onClick={() => setPhase('pass_to_guesser')} color="#22c55e">
          📱 گوشی رو به {guesser.name} بده ←
        </PrimaryBtn>
      </div>
    </Screen>
  )

  // ── PASS TO GUESSER ──────────────────────────────────────────────────────────
  if (phase === 'pass_to_guesser') return (
    <Screen>
      <CenteredBody>
        <RoundBadge round={roundNum + 1} total={totalRounds} />

        <PlayerBubble name={guesser.name} label="نوبت حدس زدنه!" color="#22c55e" />

        <div className="w-full max-w-xs px-5 py-4 rounded-2xl text-center"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.25)' }}>
          <p className="font-bold text-white text-sm">
            {validClues.length} سرنخ برای {guesser.name} آماده‌ست
          </p>
          <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>
            {validClues.length === 0
              ? 'همه سرنخ‌ها حذف شدن — موفق باشی!'
              : 'سرنخ‌ها رو ببین و کلمه رو پیدا کن'}
          </p>
        </div>

        <PrimaryBtn onClick={() => setPhase('guess')} color="#22c55e">
          🎯 {guesser.name} آماده‌ام
        </PrimaryBtn>
      </CenteredBody>
    </Screen>
  )

  // ── GUESS ─────────────────────────────────────────────────────────────────────
  if (phase === 'guess') return (
    <Screen>
      <div className="flex-shrink-0 px-4 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <p className="text-xs font-bold" style={{ color: '#22c55e' }}>نوبت حدس زدن</p>
          <h2 className="font-black text-white text-lg">{guesser.name}</h2>
        </div>
        <RoundBadge round={roundNum + 1} total={totalRounds} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {guessResult === null && (
          <div className="flex flex-col items-center">
            <TimerBar seconds={guessTimer} total={60} color="#22c55e" />
          </div>
        )}

        {validClues.length > 0 ? (
          <>
            <p className="text-xs font-bold text-center" style={{ color: '#9a9b9e' }}>سرنخ‌های هم‌تیمی‌ها:</p>
            <div className="flex flex-col gap-2">
              {validClues.map(c => (
                <div key={c.playerId} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.25)' }}>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: '#6D6E71' }}>{c.name}:</span>
                  <span className="font-black text-white text-lg">{c.clue}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-4xl">😬</span>
            <p className="font-bold text-white text-center">همه سرنخ‌ها تکراری بودن!</p>
            <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>بدون سرنخ یه حدس بزن!</p>
          </div>
        )}

        {guessResult ? (
          <div className="flex flex-col items-center gap-4 mt-2">
            <div className="text-5xl">{guessResult === 'correct' ? '🎉' : '😔'}</div>
            <p className="font-black text-xl text-white">
              {guessResult === 'correct' ? 'درست حدس زدی!' : 'اشتباه بود'}
            </p>
            <div className="px-5 py-3 rounded-2xl text-center"
              style={{
                background: guessResult === 'correct' ? 'rgba(34,197,94,0.1)' : 'rgba(204,34,41,0.08)',
                border: `1.5px solid ${guessResult === 'correct' ? '#22c55e44' : '#CC222930'}`,
              }}>
              <p className="text-xs" style={{ color: '#9a9b9e' }}>کلمه مخفی بود:</p>
              <p className="font-black text-white text-2xl mt-1">{secretWord}</p>
              {guessResult === 'correct' && <p className="text-sm mt-1" style={{ color: '#22c55e' }}>+۱ امتیاز ✓</p>}
            </div>
            <PrimaryBtn onClick={() => setPhase('round_result')} color={guessResult === 'correct' ? '#22c55e' : '#7c3aed'}>
              {roundNum + 1 >= totalRounds ? '🏆 نتیجه نهایی' : 'دور بعدی →'}
            </PrimaryBtn>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-auto">
            <input
              value={guessInput}
              onChange={e => setGuessInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && guessInput.trim() && handleGuessSubmit()}
              placeholder="کلمه مخفی چیه؟"
              autoFocus
              className="w-full px-4 py-4 rounded-2xl font-black text-white text-lg text-center"
              style={{
                background: 'rgba(20,20,22,0.95)',
                border: '2px solid rgba(34,197,94,0.4)',
                outline: 'none',
                fontFamily: "'IranSans', sans-serif",
              }}
            />
            <PrimaryBtn onClick={handleGuessSubmit} disabled={!guessInput.trim()} color="#22c55e">
              🎯 حدس می‌زنم!
            </PrimaryBtn>
            <SecondaryBtn onClick={handleSkipGuess}>رد کردن — نمی‌دونم</SecondaryBtn>
          </div>
        )}
      </div>
    </Screen>
  )

  // ── ROUND RESULT ─────────────────────────────────────────────────────────────
  if (phase === 'round_result') {
    const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
    return (
      <Screen>
        <CenteredBody>
          <RoundBadge round={roundNum + 1} total={totalRounds} />

          <div className="text-center">
            <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>امتیازات فعلی</p>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-2">
            {sorted.map((p, i) => {
              const isGuesser = p.id === guesser.id
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{
                    background: i === 0 ? 'rgba(255,214,10,0.08)' : 'rgba(30,30,34,0.9)',
                    border: `1px solid ${isGuesser ? 'rgba(34,197,94,0.3)' : i === 0 ? 'rgba(255,214,10,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  <span className="font-black text-base w-5" style={{ color: i === 0 ? '#ffd60a' : '#555' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span className="font-bold text-white text-sm flex-1 truncate">{p.name}</span>
                  {isGuesser && <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>حدس‌زننده</span>}
                  <span className="font-black text-sm" style={{ color: i === 0 ? '#ffd60a' : '#9a9b9e' }}>{scores[p.id] || 0}</span>
                </div>
              )
            })}
          </div>

          <PrimaryBtn onClick={handleNextRound} color={roundNum + 1 >= totalRounds ? '#ffd60a' : '#22c55e'}>
            {roundNum + 1 >= totalRounds ? '🏆 نتیجه نهایی' : `دور ${roundNum + 2} →`}
          </PrimaryBtn>
        </CenteredBody>
      </Screen>
    )
  }

  // ── GAME OVER ─────────────────────────────────────────────────────────────────
  if (phase === 'game_over') {
    const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
    const winner = sorted[0]
    return (
      <Screen>
        <CenteredBody>
          <div className="text-6xl" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>🏆</div>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: '#ffd60a' }}>بازی تمام شد!</p>
            <h2 className="font-black text-white text-2xl mt-1">{winner?.name} برنده شد!</h2>
            <p className="font-black text-3xl mt-1" style={{ color: '#ffd60a' }}>{scores[winner?.id ?? ''] ?? 0} امتیاز</p>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-2">
            {sorted.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: i === 0 ? 'rgba(255,214,10,0.1)' : 'rgba(30,30,34,0.9)',
                  border: `1.5px solid ${i === 0 ? 'rgba(255,214,10,0.35)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <span className="font-black text-lg w-6">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className="font-bold text-white flex-1">{p.name}</span>
                <span className="font-black" style={{ color: i === 0 ? '#ffd60a' : '#9a9b9e' }}>
                  {scores[p.id] || 0} امتیاز
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <PrimaryBtn onClick={() => {
              setRoundNum(0)
              setScores(Object.fromEntries(players.map(p => [p.id, 0])))
              setUsedWords([])
              setPhase('intro')
            }} color="#22c55e">
              بازی دوباره ←
            </PrimaryBtn>
            <SecondaryBtn onClick={onExit}>بازگشت به میدان بازی</SecondaryBtn>
          </div>
        </CenteredBody>
      </Screen>
    )
  }

  return null
}
