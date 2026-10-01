/**
 * جاسوس بهسازان — Spy Game v3.13
 *
 * LOCAL (pass-the-phone):
 *   intro → role_gate → role_reveal → discussion → vote_gate → vote → vote_tally
 *   → spy_escape (if spy was eliminated) → result
 *
 * ONLINE (independent clients):
 *   waiting_role → role_reveal → discussion → vote → spy_escape → result
 *   Host stores location in ref; validates spy guess via cmd channel.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'
import { supabase } from '../../lib/supabase'
import { usePrivateChannel } from '../../lib/multiplayer/usePrivateChannel'

// ─── LOCATIONS ────────────────────────────────────────────────────────────────

const LOCATIONS = [
  'فرودگاه', 'بیمارستان', 'مدرسه', 'رستوران', 'کافه', 'پارک',
  'شرکت', 'بانک', 'هتل', 'سینما', 'مسجد', 'ورزشگاه',
  'کتابخانه', 'موزه', 'خیابان', 'بازار', 'دانشگاه', 'اتوبوس',
  'استخر', 'بیابان', 'قطار', 'کشتی', 'کاخ', 'زندان',
]

const DISCUSSION_SECONDS = 8 * 60  // 8 minutes

// ─── TYPES ────────────────────────────────────────────────────────────────────

type LocalPhase =
  | 'intro'
  | 'role_gate'     // pass to player X
  | 'role_reveal'   // tap to see role
  | 'discussion'    // verbal Q&A with timer
  | 'vote_gate'     // pass to voter X
  | 'vote'          // secret ballot
  | 'vote_tally'    // show counts; tap to continue
  | 'spy_escape'    // spy guesses location
  | 'result'

type OnlinePhase =
  | 'waiting_role'
  | 'role_reveal'
  | 'discussion'
  | 'vote'
  | 'vote_waiting'
  | 'spy_escape'
  | 'result'

interface PublicSpyState {
  phase: 'discussion' | 'vote' | 'spy_escape' | 'result'
  questionerIdx: number
  answererIdx: number
  questionCount: number
  votes: Record<string, string>       // voterId → targetId
  eliminatedId: string | null
  spyCorrect: boolean | null          // set by host after spy guess
  winner: 'spy' | 'citizens' | null
  spyId: string                       // revealed to all only in result phase
  locationReveal: string              // revealed to all only in result phase
  seq: number
}

interface Props {
  players: BehsazaniPlayer[]
  myPlayer: BehsazaniPlayer
  isHost: boolean
  isOnline: boolean
  roomCode?: string
  onExit: () => void
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function useTimer(active: boolean, initial: number, onExpire?: () => void) {
  const [secs, setSecs] = useState(initial)
  const doneRef = useRef(false)
  useEffect(() => { setSecs(initial); doneRef.current = false }, [active, initial])
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          clearInterval(id)
          if (!doneRef.current) { doneRef.current = true; onExpire?.() }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [active, onExpire])
  return secs
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

// ─── SHARED SCREENS ──────────────────────────────────────────────────────────

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="h-full flex flex-col overflow-hidden" dir="rtl">{children}</div>
}

function CenteredBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 overflow-y-auto py-6">
      {children}
    </div>
  )
}

function PrimaryBtn({
  onClick, disabled = false, children, color = '#3b82f6',
}: { onClick: () => void; disabled?: boolean; children: React.ReactNode; color?: string }) {
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

function RoleCard({
  isSpy, name, location,
}: { isSpy: boolean; name: string; location?: string }) {
  return (
    <div className="w-full max-w-xs px-6 py-8 rounded-3xl flex flex-col items-center gap-3 border-2"
      style={{
        background: isSpy ? 'rgba(59,130,246,0.12)' : 'rgba(34,197,94,0.12)',
        borderColor: isSpy ? '#3b82f6' : '#22c55e',
        boxShadow: `0 0 40px ${isSpy ? '#3b82f633' : '#22c55e33'}`,
      }}>
      <span style={{ fontSize: 64 }}>{isSpy ? '🕵️' : '👤'}</span>
      <div className="text-center">
        <p className="font-black text-white text-2xl">{isSpy ? 'جاسوس!' : 'کارمند'}</p>
        {isSpy ? (
          <p className="text-sm mt-2" style={{ color: '#93c5fd' }}>مکان را نمی‌دانی — باید حدس بزنی</p>
        ) : (
          <>
            <p className="text-xs mt-2" style={{ color: '#9a9b9e' }}>مکان مخفی:</p>
            <p className="font-black text-2xl mt-1" style={{ color: '#22c55e' }}>{location}</p>
          </>
        )}
      </div>
      <p className="text-xs text-center mt-1 px-2 py-1 rounded-lg font-bold"
        style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>
        🔒 این اطلاعات فقط برای {name} است
      </p>
    </div>
  )
}

function GateScreen({
  playerName, subtext, onReady, btnLabel,
}: { playerName: string; subtext?: string; onReady: () => void; btnLabel: string }) {
  return (
    <Screen>
      <CenteredBody>
        <div className="text-5xl">📱</div>
        <div className="text-center">
          <h2 className="font-black text-white text-xl">
            گوشی را به <span style={{ color: '#ffd60a' }}>{playerName}</span> بده
          </h2>
          {subtext && <p className="text-sm mt-2" style={{ color: '#9a9b9e' }}>{subtext}</p>}
        </div>
        <PrimaryBtn onClick={onReady} color="#ffd60a">{btnLabel}</PrimaryBtn>
      </CenteredBody>
    </Screen>
  )
}

// ─── LOCAL MODE ───────────────────────────────────────────────────────────────

function LocalSpyGame({ players, onExit }: { players: BehsazaniPlayer[]; onExit: () => void }) {
  const [location] = useState(() => LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)])
  const [spyId] = useState(() => players[Math.floor(Math.random() * players.length)].id)

  const [phase, setPhase] = useState<LocalPhase>('intro')
  const [gateIdx, setGateIdx] = useState(0)        // which player to reveal next
  const [showRole, setShowRole] = useState(false)   // tap-to-reveal guard
  const [questionerIdx, setQuestionerIdx] = useState(0)
  const [answererIdx, setAnswererIdx] = useState(1)
  const [questionCount, setQuestionCount] = useState(0)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [voterIdx, setVoterIdx] = useState(0)
  const [spyGuessChoice, setSpyGuessChoice] = useState('')
  const [winner, setWinner] = useState<'spy' | 'citizens' | null>(null)

  const questioner = players[questionerIdx % players.length]
  const answerer = players[answererIdx % players.length]
  const spyPlayer = players.find(p => p.id === spyId)!

  const discussionTimer = useTimer(phase === 'discussion', DISCUSSION_SECONDS)

  const tally = (() => {
    const t: Record<string, number> = {}
    Object.values(votes).forEach(v => { t[v] = (t[v] || 0) + 1 })
    return t
  })()
  const maxVotes = Math.max(0, ...Object.values(tally))
  const topIds = Object.keys(tally).filter(id => tally[id] === maxVotes && maxVotes > 0)
  const elimId = topIds.length === 1 ? topIds[0] : null
  const elimPlayer = elimId ? players.find(p => p.id === elimId) : null

  function advanceDiscussion() {
    const nextQ = questionCount + 1
    setQuestionCount(nextQ)
    const nextQ_idx = answererIdx % players.length
    const nextA_idx = (answererIdx + 1) % players.length === questionerIdx % players.length
      ? (answererIdx + 2) % players.length
      : (answererIdx + 1) % players.length
    setQuestionerIdx(nextQ_idx)
    setAnswererIdx(nextA_idx)
    if (nextQ >= players.length * 2) setPhase('vote_gate')
  }

  function confirmElimination() {
    if (!elimId) return
    if (elimId === spyId) {
      // spy caught — give them a chance to guess
      setPhase('spy_escape')
    } else {
      // wrong person eliminated — citizens lose
      setWinner('citizens') // actually spy wins
      setWinner('spy')
      setPhase('result')
    }
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <Screen>
      <CenteredBody>
        <div className="text-6xl" style={{ animation: 'pulse 2s ease-in-out infinite' }}>🕵️</div>
        <div className="text-center">
          <h1 className="font-black text-white text-2xl">جاسوس بهسازان</h1>
          <p className="text-sm mt-2" style={{ color: '#9a9b9e' }}>همه یک راز می‌دانند — جز جاسوس!</p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-3">
          {[
            { icon: '📍', text: 'همه بازیکنان مکان مشترکی می‌دانند — به‌جز جاسوس' },
            { icon: '❓', text: 'هر کس از دیگری سؤال می‌پرسد تا جاسوس را پیدا کند — یا خودش را پنهان کند' },
            { icon: '🗳️', text: 'در پایان رأی‌گیری می‌کنید؛ اگر جاسوس شناخته شود آخرین فرصتش حدس مکان است' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <p className="font-bold text-white text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center">
          {players.map(p => (
            <span key={p.id} className="px-2 py-1 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#9a9b9e' }}>
              {p.name}
            </span>
          ))}
        </div>
        <p className="text-xs" style={{ color: '#6D6E71' }}>{players.length} بازیکن</p>

        <PrimaryBtn onClick={() => { setGateIdx(0); setPhase('role_gate') }} color="#3b82f6">
          شروع توزیع نقش‌ها ←
        </PrimaryBtn>
      </CenteredBody>
    </Screen>
  )

  // ── ROLE GATE ──────────────────────────────────────────────────────────────
  if (phase === 'role_gate') {
    const p = players[gateIdx]
    return (
      <GateScreen
        playerName={p.name}
        subtext="بقیه گوشی را نگاه نکنند"
        onReady={() => setPhase('role_reveal')}
        btnLabel={`${p.name} آماده‌ام، نشان بده`}
      />
    )
  }

  // ── ROLE REVEAL ────────────────────────────────────────────────────────────
  if (phase === 'role_reveal') {
    const p = players[gateIdx]
    const isSpy = p.id === spyId
    if (!showRole) return (
      <Screen>
        <CenteredBody>
          <div className="text-2xl font-black text-white">{p.name}</div>
          <button
            onClick={() => setShowRole(true)}
            className="w-48 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
            style={{ background: 'rgba(59,130,246,0.12)', border: '2px dashed rgba(59,130,246,0.4)' }}>
            <span className="text-3xl">👆</span>
            <span className="text-sm font-bold" style={{ color: '#93c5fd' }}>ضربه بزن تا نقشت را ببینی</span>
          </button>
          <p className="text-xs text-center" style={{ color: '#6D6E71' }}>بقیه نباید صفحه را ببینند</p>
        </CenteredBody>
      </Screen>
    )

    return (
      <Screen>
        <CenteredBody>
          <RoleCard isSpy={isSpy} name={p.name} location={isSpy ? undefined : location} />
          {isSpy && (
            <div className="w-full max-w-xs px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-xs font-bold text-center" style={{ color: '#93c5fd' }}>
                💡 با سؤال‌ها سعی کن مکان را حدس بزنی بدون اینکه لو بروی
              </p>
            </div>
          )}
          <PrimaryBtn
            onClick={() => {
              setShowRole(false)
              if (gateIdx + 1 < players.length) {
                setGateIdx(gateIdx + 1)
                setPhase('role_gate')
              } else {
                setPhase('discussion')
              }
            }}
            color="#3b82f6"
          >
            {gateIdx + 1 < players.length ? `نوبت ${players[gateIdx + 1].name} →` : '🎯 شروع بازی!'}
          </PrimaryBtn>
        </CenteredBody>
      </Screen>
    )
  }

  // ── DISCUSSION ─────────────────────────────────────────────────────────────
  if (phase === 'discussion') {
    const urgent = discussionTimer <= 60
    return (
      <Screen>
        <div className="flex-shrink-0 px-4 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>دور سؤال و جواب</p>
            <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>
              {Math.max(0, players.length * 2 - questionCount)} سؤال باقی‌مانده
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl text-center"
            style={{ background: urgent ? 'rgba(204,34,41,0.15)' : 'rgba(255,214,10,0.08)' }}>
            <span className="font-black text-xl" style={{ color: urgent ? '#CC2229' : '#ffd60a', fontFamily: 'monospace' }}>
              {fmtTime(discussionTimer)}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-xs font-bold text-center" style={{ color: '#9a9b9e' }}>الان:</p>

          <div className="w-full max-w-xs flex flex-col gap-2">
            <div className="px-4 py-4 rounded-2xl text-center"
              style={{ background: 'rgba(249,115,22,0.12)', border: '2px solid rgba(249,115,22,0.4)' }}>
              <p className="text-xs font-bold" style={{ color: '#f97316' }}>سؤال می‌پرسد:</p>
              <p className="font-black text-white text-2xl mt-1">{questioner.name}</p>
            </div>
            <div className="text-center text-xl" style={{ color: '#555' }}>↓</div>
            <div className="px-4 py-4 rounded-2xl text-center"
              style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.4)' }}>
              <p className="text-xs font-bold" style={{ color: '#22c55e' }}>پاسخ می‌دهد:</p>
              <p className="font-black text-white text-2xl mt-1">{answerer.name}</p>
            </div>
          </div>

          <p className="text-xs text-center px-4" style={{ color: '#6D6E71' }}>
            مکان را مستقیم نگویید — با سؤال‌های غیرمستقیم بازی کنید
          </p>
        </div>

        <div className="flex-shrink-0 px-4 pb-5 flex flex-col gap-2">
          <PrimaryBtn onClick={advanceDiscussion} color="#3b82f6">
            {questionCount + 1 >= players.length * 2 ? '🗳️ شروع رأی‌گیری' : 'سؤال بعدی →'}
          </PrimaryBtn>
          <SecondaryBtn onClick={() => { setVoterIdx(0); setPhase('vote_gate') }}>
            رأی‌گیری زودتر
          </SecondaryBtn>
        </div>
      </Screen>
    )
  }

  // ── VOTE GATE ──────────────────────────────────────────────────────────────
  if (phase === 'vote_gate') {
    const voter = players[voterIdx]
    return (
      <GateScreen
        playerName={voter.name}
        subtext="بقیه نگاه نکنند — رأی مخفی است"
        onReady={() => setPhase('vote')}
        btnLabel={`${voter.name} آماده‌ام`}
      />
    )
  }

  // ── VOTE ───────────────────────────────────────────────────────────────────
  if (phase === 'vote') {
    const voter = players[voterIdx]
    return (
      <Screen>
        <div className="flex-shrink-0 px-4 pt-4 pb-3 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-3xl">🗳️</div>
          <h2 className="font-black text-white text-lg mt-1">رأی {voter.name}</h2>
          <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>
            {voterIdx + 1} از {players.length} — به نظرت جاسوس کیست؟
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {players.filter(p => p.id !== voter.id).map(p => (
            <button
              key={p.id}
              onClick={() => {
                setVotes(prev => ({ ...prev, [voter.id]: p.id }))
                const next = voterIdx + 1
                if (next >= players.length) {
                  setPhase('vote_tally')
                } else {
                  setVoterIdx(next)
                  setPhase('vote_gate')
                }
              }}
              className="btn-game flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-white transition-all"
              style={{ background: 'rgba(30,30,34,0.9)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-xl">👤</span>
              <span className="text-lg">{p.name}</span>
            </button>
          ))}
        </div>
      </Screen>
    )
  }

  // ── VOTE TALLY ─────────────────────────────────────────────────────────────
  if (phase === 'vote_tally') {
    const sorted = [...players].sort((a, b) => (tally[b.id] || 0) - (tally[a.id] || 0))
    return (
      <Screen>
        <CenteredBody>
          <div className="text-5xl">📊</div>
          <h2 className="font-black text-white text-xl">نتیجه رأی‌گیری</h2>

          <div className="w-full max-w-xs flex flex-col gap-2">
            {sorted.map(p => {
              const v = tally[p.id] || 0
              const isTop = p.id === elimId
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: isTop ? 'rgba(204,34,41,0.1)' : 'rgba(30,30,34,0.9)',
                    border: `1.5px solid ${isTop ? 'rgba(204,34,41,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  <span className="font-bold text-white flex-1">{p.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: v }).map((_, i) => (
                      <div key={i} className="w-2 h-4 rounded-sm" style={{ background: '#CC2229' }} />
                    ))}
                    {Array.from({ length: players.length - 1 - v }).map((_, i) => (
                      <div key={i} className="w-2 h-4 rounded-sm" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <span className="font-black text-sm w-8 text-left" style={{ color: isTop ? '#CC2229' : '#555' }}>
                    {v}
                  </span>
                </div>
              )
            })}
          </div>

          {elimPlayer ? (
            <>
              <div className="w-full max-w-xs px-5 py-4 rounded-2xl text-center"
                style={{ background: 'rgba(204,34,41,0.08)', border: '1.5px solid rgba(204,34,41,0.3)' }}>
                <p className="text-sm font-bold text-white">بیشترین رأی:</p>
                <p className="font-black text-2xl mt-1" style={{ color: '#CC2229' }}>{elimPlayer.name}</p>
                <p className="text-xs mt-2" style={{ color: '#9a9b9e' }}>
                  {elimPlayer.id === spyId ? 'جاسوس یک فرصت دارد...' : 'آیا این فرد جاسوس است؟'}
                </p>
              </div>
              <PrimaryBtn onClick={confirmElimination} color="#CC2229">
                {elimPlayer.id === spyId ? '🕵️ جاسوس یافت شد — فرصت حدس' : '✓ تأیید حذف'}
              </PrimaryBtn>
            </>
          ) : (
            <>
              <div className="px-5 py-4 rounded-2xl text-center w-full max-w-xs"
                style={{ background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.25)' }}>
                <p className="font-bold text-white">تساوی آرا!</p>
                <p className="text-sm mt-1" style={{ color: '#9a9b9e' }}>بازی ادامه دارد</p>
              </div>
              <PrimaryBtn onClick={() => setPhase('discussion')} color="#3b82f6">ادامه سؤال ←</PrimaryBtn>
            </>
          )}
        </CenteredBody>
      </Screen>
    )
  }

  // ── SPY ESCAPE ─────────────────────────────────────────────────────────────
  if (phase === 'spy_escape') {
    const isSpyGuessing = true // local: everyone sees this
    return (
      <Screen>
        <div className="flex-shrink-0 px-4 pt-4 pb-3 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-3xl">🕵️</div>
          <h2 className="font-black text-white text-lg mt-1">آخرین فرصت جاسوس!</h2>
          <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>
            {spyPlayer.name}، مکان را درست حدس بزن تا برنده بشی
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {LOCATIONS.map(loc => (
              <button
                key={loc}
                onClick={() => setSpyGuessChoice(loc)}
                className="btn-game py-3 px-3 rounded-2xl font-bold text-sm text-white transition-all"
                style={{
                  background: spyGuessChoice === loc ? 'rgba(59,130,246,0.3)' : 'rgba(30,30,34,0.9)',
                  border: `1.5px solid ${spyGuessChoice === loc ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: spyGuessChoice === loc ? '0 4px 16px rgba(59,130,246,0.3)' : 'none',
                }}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 px-4 pb-5">
          <PrimaryBtn
            onClick={() => {
              const correct = spyGuessChoice === location
              setWinner(correct ? 'spy' : 'citizens')
              setPhase('result')
            }}
            disabled={!spyGuessChoice}
            color="#3b82f6"
          >
            {spyGuessChoice ? `تأیید: ${spyGuessChoice}` : 'یک مکان انتخاب کن'}
          </PrimaryBtn>
        </div>
      </Screen>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const spyWon = winner === 'spy'
    return (
      <Screen>
        <CenteredBody>
          <div className="text-6xl" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
            {spyWon ? '🕵️' : '🏆'}
          </div>
          <div className="text-center">
            <h2 className="font-black text-white text-3xl">
              {spyWon ? 'جاسوس برد!' : 'شهروندان بردند!'}
            </h2>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-3">
            <div className="px-5 py-4 rounded-2xl"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1.5px solid rgba(59,130,246,0.3)' }}>
              <p className="text-xs font-bold" style={{ color: '#93c5fd' }}>🕵️ جاسوس بود:</p>
              <p className="font-black text-white text-xl mt-1">{spyPlayer.name}</p>
            </div>
            <div className="px-5 py-4 rounded-2xl"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.25)' }}>
              <p className="text-xs font-bold" style={{ color: '#22c55e' }}>📍 مکان واقعی بود:</p>
              <p className="font-black text-white text-2xl mt-1">{location}</p>
            </div>
            {elimPlayer && (
              <div className="px-4 py-3 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs" style={{ color: '#9a9b9e' }}>
                  متهم اصلی: <span className="font-bold text-white">{elimPlayer.name}</span>
                  {elimPlayer.id === spyId ? ' ✓ جاسوس' : ' ✗ بی‌گناه'}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <PrimaryBtn onClick={() => window.location.reload()} color="#3b82f6">بازی دوباره ←</PrimaryBtn>
            <SecondaryBtn onClick={onExit}>بازگشت به میدان بازی</SecondaryBtn>
          </div>
        </CenteredBody>
      </Screen>
    )
  }

  return null
}

// ─── ONLINE MODE ──────────────────────────────────────────────────────────────

function OnlineSpyGame({
  players, myPlayer, isHost, roomCode = '', onExit,
}: {
  players: BehsazaniPlayer[]
  myPlayer: BehsazaniPlayer
  isHost: boolean
  roomCode: string
  onExit: () => void
}) {
  const [myRole, setMyRole] = useState<'spy' | 'employee' | null>(null)
  const [myLocation, setMyLocation] = useState<string | null>(null)
  const [onlinePhase, setOnlinePhase] = useState<OnlinePhase>('waiting_role')
  const [pubState, setPubState] = useState<PublicSpyState | null>(null)
  const [myVote, setMyVote] = useState<string | null>(null)
  const [spyGuessChoice, setSpyGuessChoice] = useState('')
  const [pubReady, setPubReady] = useState(false)
  const pubChRef = useRef<import('@supabase/supabase-js').RealtimeChannel | null>(null)
  const pubRef = useRef<PublicSpyState | null>(null)
  const hostLocationRef = useRef('')
  const hostSpyIdRef = useRef('')
  const lastSeqRef = useRef(-1)

  // Private channel — receive role
  const { sendPrivate } = usePrivateChannel(
    roomCode, myPlayer.id,
    useCallback((msg) => {
      if (msg.type === 'role_assign') {
        const d = msg.data as { role: 'spy' | 'employee'; location?: string }
        setMyRole(d.role)
        setMyLocation(d.location ?? null)
        setOnlinePhase('role_reveal')
      }
    }, []),
  )

  // Pub channel — host broadcasts, all receive
  useEffect(() => {
    if (!roomCode) return
    if (isHost) {
      const ch = supabase.channel(`beh-${roomCode}-spy-pub`, {
        config: { broadcast: { self: false, ack: false } },
      })
      ch.subscribe(s => { if (s === 'SUBSCRIBED') setPubReady(true) })
      pubChRef.current = ch

      const hb = setInterval(() => {
        if (pubRef.current && pubReady) {
          ch.send({ type: 'broadcast', event: 'spy_state', payload: { state: pubRef.current } }).catch(() => {})
        }
      }, 12000)
      return () => { clearInterval(hb); supabase.removeChannel(ch); setPubReady(false); pubChRef.current = null }
    } else {
      const ch = supabase.channel(`beh-${roomCode}-spy-pub`, {
        config: { broadcast: { self: false, ack: false } },
      })
      ch.on('broadcast', { event: 'spy_state' }, ({ payload }: any) => {
        if (!payload?.state) return
        const s = payload.state as PublicSpyState
        if (s.seq <= lastSeqRef.current) return
        lastSeqRef.current = s.seq
        setPubState(s)
        pubRef.current = s
        if (s.phase === 'discussion' && onlinePhase === 'role_reveal') setOnlinePhase('discussion')
        if (s.phase === 'vote') setOnlinePhase('vote')
        if (s.phase === 'spy_escape') setOnlinePhase('spy_escape')
        if (s.phase === 'result') setOnlinePhase('result')
      }).subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          // Request current state from host
          await ch.send({ type: 'broadcast', event: 'request_state', payload: {} }).catch(() => {})
        }
      })
      return () => { supabase.removeChannel(ch) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, roomCode])

  // Cmd channel — non-host sends commands to host
  const cmdChRef = useRef<import('@supabase/supabase-js').RealtimeChannel | null>(null)
  useEffect(() => {
    if (!roomCode || !isHost) return
    const ch = supabase.channel(`beh-${roomCode}-spy-cmd`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'vote' }, ({ payload }: any) => {
      const { voterId, targetId } = payload as { voterId: string; targetId: string }
      const cur = pubRef.current
      if (!cur || cur.votes[voterId]) return
      const newVotes = { ...cur.votes, [voterId]: targetId }
      const allVoted = Object.keys(newVotes).length >= players.length
      broadcastPub({ ...cur, votes: newVotes, phase: allVoted ? 'vote' : 'vote' })
    })
    ch.on('broadcast', { event: 'spy_guess' }, ({ payload }: any) => {
      const { loc } = payload as { loc: string }
      const correct = loc === hostLocationRef.current
      const cur = pubRef.current
      if (!cur) return
      broadcastPub({
        ...cur,
        phase: 'result',
        spyCorrect: correct,
        winner: correct ? 'spy' : 'citizens',
        spyId: hostSpyIdRef.current,
        locationReveal: hostLocationRef.current,
      })
    })
    ch.on('broadcast', { event: 'request_state' }, () => {
      const s = pubRef.current
      if (!s) return
      const pub = pubChRef.current
      if (!pub || !pubReady) return
      pub.send({ type: 'broadcast', event: 'spy_state', payload: { state: s } }).catch(() => {})
    })
    ch.subscribe()
    cmdChRef.current = ch
    return () => { supabase.removeChannel(ch); cmdChRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, isHost])

  const seqRef = useRef(0)
  const broadcastPub = useCallback(async (state: PublicSpyState) => {
    seqRef.current += 1
    const s = { ...state, seq: seqRef.current }
    setPubState(s)
    pubRef.current = s
    const ch = pubChRef.current
    if (!ch || !pubReady) return
    await ch.send({ type: 'broadcast', event: 'spy_state', payload: { state: s } }).catch(() => {})
  }, [pubReady])

  const sendCmd = useCallback(async (event: string, payload: unknown) => {
    const ch = supabase.channel(`beh-${roomCode}-spy-cmd`, {
      config: { broadcast: { self: false, ack: false } },
    })
    await new Promise<void>(res => {
      ch.subscribe(async s => {
        if (s === 'SUBSCRIBED') {
          await ch.send({ type: 'broadcast', event, payload }).catch(() => {})
          await supabase.removeChannel(ch)
          res()
        }
      })
    })
  }, [roomCode])

  // Host assigns roles on mount
  useEffect(() => {
    if (!isHost || !roomCode) return
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
    const spyIndex = Math.floor(Math.random() * players.length)
    hostLocationRef.current = loc
    hostSpyIdRef.current = players[spyIndex].id

    async function assignRoles() {
      for (let i = 0; i < players.length; i++) {
        const p = players[i]
        const isSpy = i === spyIndex
        await sendPrivate(p.id, {
          type: 'role_assign',
          data: isSpy ? { role: 'spy' } : { role: 'employee', location: loc },
        })
        if (p.id === myPlayer.id) {
          setMyRole(isSpy ? 'spy' : 'employee')
          setMyLocation(isSpy ? null : loc)
          setOnlinePhase('role_reveal')
        }
      }
      const init: PublicSpyState = {
        phase: 'discussion',
        questionerIdx: 0,
        answererIdx: 1,
        questionCount: 0,
        votes: {},
        eliminatedId: null,
        spyCorrect: null,
        winner: null,
        spyId: '',
        locationReveal: '',
        seq: 0,
      }
      await broadcastPub(init)
    }
    assignRoles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, roomCode])

  const pub = pubState
  const names = players.map(p => p.name)
  const myIdx = players.findIndex(p => p.id === myPlayer.id)

  // ── WAITING ROLE ──────────────────────────────────────────────────────────
  if (onlinePhase === 'waiting_role') return (
    <Screen>
      <CenteredBody>
        <div className="text-5xl" style={{ animation: 'spin 1.5s linear infinite' }}>🔍</div>
        <h2 className="font-black text-white text-xl">در حال دریافت نقش...</h2>
        <p className="text-xs" style={{ color: '#9a9b9e' }}>میزبان نقش‌ها را ارسال می‌کند</p>
      </CenteredBody>
    </Screen>
  )

  // ── ROLE REVEAL ───────────────────────────────────────────────────────────
  if (onlinePhase === 'role_reveal') {
    const isSpy = myRole === 'spy'
    return (
      <Screen>
        <CenteredBody>
          <p className="text-sm font-bold" style={{ color: '#9a9b9e' }}>نقش شما، {myPlayer.name}:</p>
          <RoleCard isSpy={isSpy} name={myPlayer.name} location={isSpy ? undefined : (myLocation ?? '')} />
          {isSpy && (
            <div className="w-full max-w-xs px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-xs text-center" style={{ color: '#93c5fd' }}>
                با دقت به سؤال‌ها گوش بده تا مکان را حدس بزنی
              </p>
            </div>
          )}
          <PrimaryBtn onClick={() => setOnlinePhase(pub?.phase ?? 'discussion')} color="#3b82f6">
            متوجه شدم — شروع بازی
          </PrimaryBtn>
        </CenteredBody>
      </Screen>
    )
  }

  if (!pub) return (
    <Screen>
      <CenteredBody>
        <div className="text-4xl" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
        <p className="font-black text-white">در حال همگام‌سازی...</p>
      </CenteredBody>
    </Screen>
  )

  const qer = players[pub.questionerIdx % players.length]
  const aer = players[pub.answererIdx % players.length]
  const iMyTurnQ = pub.questionerIdx % players.length === myIdx
  const iMyTurnA = pub.answererIdx % players.length === myIdx

  // ── DISCUSSION (online) ───────────────────────────────────────────────────
  if (onlinePhase === 'discussion' || pub.phase === 'discussion') {
    return (
      <Screen>
        <div className="flex-shrink-0 px-4 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-xs font-bold" style={{ color: myRole === 'spy' ? '#93c5fd' : '#9a9b9e' }}>
              {myRole === 'spy' ? '🕵️ جاسوس' : '👤 کارمند'}
            </p>
            {myRole !== 'spy' && myLocation && (
              <p className="text-xs font-bold mt-0.5" style={{ color: '#22c55e' }}>📍 {myLocation}</p>
            )}
          </div>
          <p className="text-xs" style={{ color: '#6D6E71' }}>
            سؤال {pub.questionCount + 1} از {players.length * 2}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          {(iMyTurnQ || iMyTurnA) ? (
            <div className="w-full max-w-xs px-5 py-4 rounded-2xl text-center"
              style={{
                background: iMyTurnQ ? 'rgba(249,115,22,0.15)' : 'rgba(34,197,94,0.15)',
                border: `2px solid ${iMyTurnQ ? '#f97316' : '#22c55e'}`,
              }}>
              <p className="font-black text-white text-xl">
                {iMyTurnQ ? '🎤 نوبت توست — سؤال بپرس' : '💬 نوبت توست — پاسخ بده'}
              </p>
              <p className="text-sm mt-2" style={{ color: '#9a9b9e' }}>
                {iMyTurnQ ? `از ${aer?.name} بپرس` : `به ${qer?.name} پاسخ بده`}
              </p>
              {myRole !== 'spy' && (
                <p className="text-xs mt-2" style={{ color: '#ffd60a' }}>مکان را مستقیم نگو!</p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-xs flex flex-col gap-2">
              <div className="px-4 py-3 rounded-2xl text-center"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <p className="text-xs" style={{ color: '#9a9b9e' }}>سؤال می‌پرسد:</p>
                <p className="font-black text-white text-xl">{qer?.name}</p>
              </div>
              <div className="text-center text-lg" style={{ color: '#555' }}>↓</div>
              <div className="px-4 py-3 rounded-2xl text-center"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <p className="text-xs" style={{ color: '#9a9b9e' }}>پاسخ می‌دهد:</p>
                <p className="font-black text-white text-xl">{aer?.name}</p>
              </div>
            </div>
          )}
        </div>

        {isHost && (
          <div className="flex-shrink-0 px-4 pb-5 flex flex-col gap-2">
            <PrimaryBtn
              onClick={async () => {
                const nextQ = pub.questionCount + 1
                const newState: PublicSpyState = {
                  ...pub,
                  questionCount: nextQ,
                  questionerIdx: pub.answererIdx,
                  answererIdx: (pub.answererIdx + 1) % players.length,
                  phase: nextQ >= players.length * 2 ? 'vote' : 'discussion',
                }
                await broadcastPub(newState)
                if (newState.phase === 'vote') setOnlinePhase('vote')
              }}
              color="#3b82f6"
            >
              {pub.questionCount + 1 >= players.length * 2 ? '🗳️ شروع رأی‌گیری' : 'سؤال بعدی →'}
            </PrimaryBtn>
            <SecondaryBtn onClick={async () => {
              await broadcastPub({ ...pub, phase: 'vote' })
              setOnlinePhase('vote')
            }}>رأی‌گیری زودتر</SecondaryBtn>
          </div>
        )}
      </Screen>
    )
  }

  // ── VOTE (online) ─────────────────────────────────────────────────────────
  if (onlinePhase === 'vote' || pub.phase === 'vote') {
    const allVoted = Object.keys(pub.votes).length >= players.length
    const hasVoted = !!myVote || !!pub.votes[myPlayer.id]

    if (!allVoted && !hasVoted) return (
      <Screen>
        <div className="flex-shrink-0 px-4 pt-4 pb-3 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-3xl">🗳️</div>
          <h2 className="font-black text-white text-lg mt-1">رأی شما</h2>
          <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>به نظرت جاسوس کیست؟</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {players.filter(p => p.id !== myPlayer.id).map(p => (
            <button
              key={p.id}
              onClick={async () => {
                setMyVote(p.id)
                if (isHost) {
                  const newVotes = { ...pub.votes, [myPlayer.id]: p.id }
                  await broadcastPub({ ...pub, votes: newVotes })
                } else {
                  await sendCmd('vote', { voterId: myPlayer.id, targetId: p.id })
                }
                setOnlinePhase('vote_waiting')
              }}
              className="btn-game flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-white"
              style={{ background: 'rgba(30,30,34,0.9)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            >
              <span>👤</span><span className="text-lg">{p.name}</span>
            </button>
          ))}
        </div>
      </Screen>
    )

    if (!allVoted && hasVoted) return (
      <Screen>
        <CenteredBody>
          <div className="text-5xl">✅</div>
          <p className="font-black text-white text-xl">رأی شما ثبت شد</p>
          <p className="text-sm" style={{ color: '#9a9b9e' }}>منتظر سایر بازیکنان...</p>
          <div className="px-5 py-3 rounded-2xl text-center"
            style={{ background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.2)' }}>
            <p className="font-bold text-white">{Object.keys(pub.votes).length} از {players.length} رأی</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {players.map(p => {
              const voted = !!pub.votes[p.id]
              return (
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(30,30,34,0.8)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: voted ? '#22c55e' : '#555' }} />
                  <span className="text-sm font-bold text-white">{p.name}</span>
                  {voted && <span className="text-xs ml-auto" style={{ color: '#22c55e' }}>✓ رأی داد</span>}
                </div>
              )
            })}
          </div>
        </CenteredBody>
      </Screen>
    )

    // All voted — show tally (host resolves)
    const tally: Record<string, number> = {}
    Object.values(pub.votes).forEach(v => { tally[v] = (tally[v] || 0) + 1 })
    const maxV = Math.max(0, ...Object.values(tally))
    const topIds = Object.keys(tally).filter(id => tally[id] === maxV)
    const elimId = topIds.length === 1 ? topIds[0] : null
    const elimPlayer = elimId ? players.find(p => p.id === elimId) : null
    const sorted = [...players].sort((a, b) => (tally[b.id] || 0) - (tally[a.id] || 0))

    return (
      <Screen>
        <CenteredBody>
          <div className="text-5xl">📊</div>
          <h2 className="font-black text-white text-xl">نتیجه رأی‌گیری</h2>

          <div className="w-full max-w-xs flex flex-col gap-2">
            {sorted.map(p => {
              const v = tally[p.id] || 0
              const isTop = p.id === elimId
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{
                    background: isTop ? 'rgba(204,34,41,0.1)' : 'rgba(30,30,34,0.9)',
                    border: `1.5px solid ${isTop ? 'rgba(204,34,41,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  <span className="font-bold text-white flex-1">{p.name}</span>
                  <span className="font-black text-sm" style={{ color: isTop ? '#CC2229' : '#555' }}>
                    {v} رأی
                  </span>
                </div>
              )
            })}
          </div>

          {isHost && (
            elimPlayer ? (
              <PrimaryBtn
                onClick={async () => {
                  const isSpy = elimPlayer.id === hostSpyIdRef.current
                  if (isSpy) {
                    // Give spy a chance to guess
                    await broadcastPub({
                      ...pub,
                      eliminatedId: elimId,
                      phase: 'spy_escape',
                    })
                    setOnlinePhase('spy_escape')
                  } else {
                    // Wrong person: spy wins
                    await broadcastPub({
                      ...pub,
                      eliminatedId: elimId,
                      phase: 'result',
                      winner: 'spy',
                      spyId: hostSpyIdRef.current,
                      locationReveal: hostLocationRef.current,
                    })
                    setOnlinePhase('result')
                  }
                }}
                color="#CC2229"
              >
                تأیید حذف: {elimPlayer.name}
              </PrimaryBtn>
            ) : (
              <PrimaryBtn onClick={async () => {
                await broadcastPub({ ...pub, phase: 'discussion' })
                setOnlinePhase('discussion')
              }} color="#3b82f6">
                تساوی — ادامه سؤال ←
              </PrimaryBtn>
            )
          )}
          {!isHost && <p className="text-xs" style={{ color: '#6D6E71' }}>میزبان نتیجه را اعلام می‌کند...</p>}
        </CenteredBody>
      </Screen>
    )
  }

  // ── SPY ESCAPE (online) ───────────────────────────────────────────────────
  if (onlinePhase === 'spy_escape' || pub.phase === 'spy_escape') {
    if (myRole === 'spy') return (
      <Screen>
        <div className="flex-shrink-0 px-4 pt-4 pb-3 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-3xl">🕵️</div>
          <h2 className="font-black text-white text-lg mt-1">آخرین فرصت شما!</h2>
          <p className="text-xs mt-1" style={{ color: '#93c5fd' }}>مکان را درست حدس بزنید تا برنده شوید</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {LOCATIONS.map(loc => (
              <button key={loc} onClick={() => setSpyGuessChoice(loc)}
                className="btn-game py-3 px-3 rounded-2xl font-bold text-sm text-white"
                style={{
                  background: spyGuessChoice === loc ? 'rgba(59,130,246,0.3)' : 'rgba(30,30,34,0.9)',
                  border: `1.5px solid ${spyGuessChoice === loc ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {loc}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 px-4 pb-5">
          <PrimaryBtn
            onClick={async () => {
              if (isHost) {
                const correct = spyGuessChoice === hostLocationRef.current
                await broadcastPub({
                  ...pub,
                  phase: 'result',
                  spyCorrect: correct,
                  winner: correct ? 'spy' : 'citizens',
                  spyId: hostSpyIdRef.current,
                  locationReveal: hostLocationRef.current,
                })
              } else {
                await sendCmd('spy_guess', { loc: spyGuessChoice })
              }
            }}
            disabled={!spyGuessChoice}
            color="#3b82f6"
          >
            {spyGuessChoice ? `تأیید: ${spyGuessChoice}` : 'مکان را انتخاب کن'}
          </PrimaryBtn>
        </div>
      </Screen>
    )

    return (
      <Screen>
        <CenteredBody>
          <div className="text-5xl" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>🕵️</div>
          <p className="font-black text-white text-xl text-center">جاسوس در حال حدس زدن است...</p>
          <p className="text-sm" style={{ color: '#9a9b9e' }}>صبر کنید</p>
        </CenteredBody>
      </Screen>
    )
  }

  // ── RESULT (online) ───────────────────────────────────────────────────────
  if (onlinePhase === 'result' || pub.phase === 'result') {
    const spyWon = pub.winner === 'spy'
    const spyPlayer = players.find(p => p.id === pub.spyId)
    return (
      <Screen>
        <CenteredBody>
          <div className="text-6xl" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
            {spyWon ? '🕵️' : '🏆'}
          </div>
          <h2 className="font-black text-white text-3xl text-center">
            {spyWon ? 'جاسوس برد!' : 'شهروندان بردند!'}
          </h2>
          <div className="w-full max-w-xs flex flex-col gap-3">
            {spyPlayer && (
              <div className="px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1.5px solid rgba(59,130,246,0.3)' }}>
                <p className="text-xs font-bold" style={{ color: '#93c5fd' }}>🕵️ جاسوس بود:</p>
                <p className="font-black text-white text-xl mt-1">{spyPlayer.name}</p>
                {pub.spyCorrect !== null && (
                  <p className="text-xs mt-1" style={{ color: pub.spyCorrect ? '#22c55e' : '#CC2229' }}>
                    {pub.spyCorrect ? '✓ مکان را درست حدس زد' : '✗ مکان را اشتباه حدس زد'}
                  </p>
                )}
              </div>
            )}
            {pub.locationReveal && (
              <div className="px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.25)' }}>
                <p className="text-xs font-bold" style={{ color: '#22c55e' }}>📍 مکان واقعی بود:</p>
                <p className="font-black text-white text-2xl mt-1">{pub.locationReveal}</p>
              </div>
            )}
          </div>
          <SecondaryBtn onClick={onExit}>بازگشت به میدان بازی</SecondaryBtn>
        </CenteredBody>
      </Screen>
    )
  }

  return null
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function SpyGame({ players, myPlayer, isHost, isOnline, roomCode, onExit }: Props) {
  if (isOnline) {
    return (
      <OnlineSpyGame
        players={players}
        myPlayer={myPlayer}
        isHost={isHost}
        roomCode={roomCode ?? ''}
        onExit={onExit}
      />
    )
  }
  return <LocalSpyGame players={players} onExit={onExit} />
}
