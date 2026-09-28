import { useState, useEffect, useCallback } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'
import { supabase } from '../../lib/supabase'
import { usePrivateChannel } from '../../lib/multiplayer/usePrivateChannel'

const LOCATIONS = [
  'فرودگاه', 'بیمارستان', 'مدرسه', 'رستوران', 'کافه', 'پارک',
  'شرکت', 'بانک', 'هتل', 'سینما', 'مسجد', 'ورزشگاه',
  'کتابخانه', 'موزه', 'خیابان', 'بازار', 'دانشگاه', 'اتوبوس',
]

type Phase = 'waiting_role' | 'role_reveal' | 'reveal_idx' | 'question' | 'vote' | 'spy_guess' | 'result'

interface PublicSpyState {
  phase: Phase
  questionerIdx: number
  answererIdx: number
  questionCount: number
  votes: Record<string, string>
  currentVoter: number
  spyGuess: string
  winner: 'spy' | 'citizens' | null
  eliminatedId: string | null
  playerNames: string[]
}

interface Props {
  players: BehsazaniPlayer[]
  myPlayer: BehsazaniPlayer
  isHost: boolean
  isOnline: boolean
  roomCode?: string
  onExit: () => void
}

export default function SpyGame({ players, myPlayer, isHost, isOnline, roomCode, onExit }: Props) {
  // ── Local (pass-the-phone) state ────────────────────────────────────────
  const [location] = useState(() => LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)])
  const [spyId] = useState(() => players[Math.floor(Math.random() * players.length)].id)
  const [localPhase, setLocalPhase] = useState<Phase>('role_reveal')
  const [revealIdx, setRevealIdx] = useState(0)
  const [showRole, setShowRole] = useState(false)
  const [questionerIdx, setQuestionerIdx] = useState(0)
  const [answererIdx, setAnswererIdx] = useState(1)
  const [questionCount, setQuestionCount] = useState(0)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [currentVoter, setCurrentVoter] = useState(0)
  const [spyGuess, setSpyGuess] = useState('')
  const [winner, setWinner] = useState<'spy' | 'citizens' | null>(null)
  const [eliminatedId, setEliminatedId] = useState<string | null>(null)

  // ── Online-mode state ───────────────────────────────────────────────────
  const [myRole, setMyRole] = useState<'spy' | 'employee' | null>(null)
  const [myLocation, setMyLocation] = useState<string | null>(null)
  const [pubState, setPubState] = useState<PublicSpyState | null>(null)
  const [onlinePhase, setOnlinePhase] = useState<Phase>('waiting_role')
  const [myVote, setMyVote] = useState<string | null>(null)
  const [mySpyGuess, setMySpyGuess] = useState('')

  // ── Private channel (online only) ───────────────────────────────────────
  const { sendPrivate } = usePrivateChannel(
    roomCode ?? '',
    myPlayer.id,
    useCallback((msg) => {
      if (msg.type === 'role_assign') {
        const d = msg.data as { role: 'spy' | 'employee'; location?: string }
        setMyRole(d.role)
        setMyLocation(d.location ?? null)
        setOnlinePhase('role_reveal')
      }
    }, []),
  )

  // ── Public broadcast channel for game events (online) ───────────────────
  useEffect(() => {
    if (!isOnline || !roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-spy-pub`, {
      config: { broadcast: { self: true, ack: false } },
    })
    ch.on('broadcast', { event: 'spy_state' }, ({ payload }: any) => {
      if (payload?.state) setPubState(payload.state as PublicSpyState)
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [isOnline, roomCode])

  const broadcastState = useCallback(async (state: PublicSpyState) => {
    if (!roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-spy-pub`, {
      config: { broadcast: { self: true, ack: false } },
    })
    await ch.send({ type: 'broadcast', event: 'spy_state', payload: { state } }).catch(() => {})
  }, [roomCode])

  // ── Host: assign roles on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !isHost || !roomCode) return
    const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
    const spyIndex = Math.floor(Math.random() * players.length)

    async function assignRoles() {
      for (let i = 0; i < players.length; i++) {
        const p = players[i]
        const role = i === spyIndex ? 'spy' : 'employee'
        const data = role === 'spy' ? { role } : { role, location: loc }
        await sendPrivate(p.id, { type: 'role_assign', data })
      }
      const initialPub: PublicSpyState = {
        phase: 'question',
        questionerIdx: 0,
        answererIdx: 1,
        questionCount: 0,
        votes: {},
        currentVoter: 0,
        spyGuess: '',
        winner: null,
        eliminatedId: null,
        playerNames: players.map(p => p.name),
      }
      await broadcastState(initialPub)
    }

    assignRoles()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, isHost, roomCode])

  // ── ONLINE MODE RENDER ───────────────────────────────────────────────────
  if (isOnline) {
    const pub = pubState
    const names = pub?.playerNames ?? players.map(p => p.name)

    if (onlinePhase === 'waiting_role') {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
          <div className="text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>🔍</div>
          <p className="font-black text-white text-xl">در حال دریافت نقش...</p>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>صبر کنید — میزبان نقش‌ها را در حال ارسال است</p>
        </div>
      )
    }

    if (onlinePhase === 'role_reveal') {
      const isSpy = myRole === 'spy'
      return (
        <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
          <p className="font-black text-white text-lg">نقش شما، {myPlayer.name}:</p>
          {isSpy ? (
            <div className="w-56 px-8 py-8 rounded-3xl flex flex-col items-center gap-3 border-2"
              style={{ background: '#3b82f622', borderColor: '#3b82f6', boxShadow: '0 0 32px #3b82f644' }}>
              <span style={{ fontSize: 60 }}>🕵️</span>
              <span className="font-black text-xl text-white">جاسوس!</span>
              <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>مکان را نمی‌دانی — باید حدس بزنی</p>
            </div>
          ) : (
            <div className="w-56 px-8 py-8 rounded-3xl flex flex-col items-center gap-3 border-2"
              style={{ background: '#22c55e22', borderColor: '#22c55e', boxShadow: '0 0 32px #22c55e44' }}>
              <span style={{ fontSize: 44 }}>📍</span>
              <span className="font-black text-xl text-white">کارمند</span>
              <span className="font-black text-2xl" style={{ color: '#22c55e' }}>{myLocation}</span>
            </div>
          )}
          <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>این اطلاعات فقط برای شماست</p>
          <button onClick={() => setOnlinePhase(pub?.phase ?? 'question')}
            className="btn-game px-8 py-4 rounded-2xl font-black text-lg text-white"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            متوجه شدم — شروع بازی
          </button>
        </div>
      )
    }

    if (!pub) return (
      <div className="h-full flex flex-col items-center justify-center" dir="rtl">
        <div className="text-4xl animate-pulse">⏳</div>
        <p className="font-black text-white mt-4">در حال همگام‌سازی...</p>
      </div>
    )

    const qer = names[pub.questionerIdx % names.length]
    const aer = names[pub.answererIdx % names.length]
    const iMyTurnQuestion = pub.questionerIdx % players.length === players.findIndex(p => p.id === myPlayer.id)
    const iMyTurnAnswer = pub.answererIdx % players.length === players.findIndex(p => p.id === myPlayer.id)
    const iMyTurnVote = pub.currentVoter === players.findIndex(p => p.id === myPlayer.id)

    async function advanceQuestion() {
      if (!pub) return
      const nextQ = pub.questionCount + 1
      const newState: PublicSpyState = {
        ...pub,
        questionCount: nextQ,
        questionerIdx: pub.answererIdx,
        answererIdx: (pub.answererIdx + 1) % players.length,
        phase: nextQ >= players.length * 2 ? 'vote' : 'question',
        currentVoter: 0,
      }
      await broadcastState(newState)
    }

    async function submitVote(targetId: string) {
      if (!pub || myVote) return
      setMyVote(targetId)
      const newVotes = { ...pub.votes, [myPlayer.id]: targetId }
      const nextVoter = pub.currentVoter + 1
      const newState: PublicSpyState = {
        ...pub,
        votes: newVotes,
        currentVoter: nextVoter,
        phase: nextVoter >= players.length ? 'vote' : 'vote',
      }
      await broadcastState(newState)
    }

    async function submitSpyGuess(loc: string) {
      if (!pub) return
      const isCorrect = loc === myLocation
      const newState: PublicSpyState = {
        ...pub,
        spyGuess: loc,
        winner: isCorrect ? 'spy' : 'citizens',
        phase: 'result',
      }
      await broadcastState(newState)
    }

    if (pub.phase === 'question') {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
          <div className="text-4xl">❓</div>
          <h2 className="font-black text-white text-xl text-center">دور سؤال و جواب</h2>
          <div className="w-full max-w-xs flex flex-col gap-3">
            <div className="px-4 py-3 rounded-2xl text-center"
              style={{ background: iMyTurnQuestion ? 'rgba(249,115,22,0.3)' : 'rgba(249,115,22,0.15)', border: `1.5px solid ${iMyTurnQuestion ? '#f97316' : '#f9731655'}` }}>
              <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>سؤال می‌پرسد:</p>
              <p className="font-black text-white text-lg">{qer} {iMyTurnQuestion ? '← شما' : ''}</p>
            </div>
            <div className="text-center text-2xl">↓</div>
            <div className="px-4 py-3 rounded-2xl text-center"
              style={{ background: iMyTurnAnswer ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.15)', border: `1.5px solid ${iMyTurnAnswer ? '#22c55e' : '#22c55e55'}` }}>
              <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>جواب می‌دهد:</p>
              <p className="font-black text-white text-lg">{aer} {iMyTurnAnswer ? '← شما' : ''}</p>
            </div>
          </div>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>سؤال‌های باقیمانده: {Math.max(0, players.length * 2 - pub.questionCount)}</p>
          {myRole === 'spy' && (
            <p className="text-xs px-3 py-1.5 rounded-xl" style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd' }}>
              شما جاسوس هستید — مکان را نمی‌دانید
            </p>
          )}
          {isHost && (
            <div className="flex gap-2 w-full max-w-xs">
              <button onClick={advanceQuestion}
                className="btn-game flex-1 py-3 rounded-xl font-black text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                سؤال بعدی →
              </button>
              <button onClick={async () => { if (pub) await broadcastState({ ...pub, phase: 'vote', currentVoter: 0 }) }}
                className="btn-game flex-1 py-3 rounded-xl font-black text-white text-sm"
                style={{ background: 'rgba(204,34,41,0.2)', border: '1.5px solid #CC2229' }}>
                رأی‌گیری
              </button>
            </div>
          )}
          {myRole === 'spy' && (
            <button onClick={async () => { if (pub) await broadcastState({ ...pub, phase: 'spy_guess' }) }}
              className="btn-game px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid #3b82f644' }}>
              🕵️ حدس مکان
            </button>
          )}
        </div>
      )
    }

    if (pub.phase === 'vote') {
      const allVoted = Object.keys(pub.votes).length >= players.length
      if (!allVoted && !myVote) {
        return (
          <div className="h-full flex flex-col gap-4 px-6 py-8" dir="rtl">
            <div className="text-center">
              <div className="text-4xl mb-2">🗳️</div>
              <h2 className="font-black text-white text-xl">به چه کسی رأی می‌دهید؟</h2>
            </div>
            <div className="flex flex-col gap-2">
              {players.filter(p => p.id !== myPlayer.id).map(p => (
                <button key={p.id} onClick={() => submitVote(p.id)}
                  className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
                  style={{ background: 'rgba(30,30,34,0.9)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
                  <span>👤</span><span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )
      }

      if (!allVoted && myVote) {
        return (
          <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
            <div className="text-5xl">✅</div>
            <p className="font-black text-white text-xl">رأی شما ثبت شد</p>
            <p className="text-sm" style={{ color: '#9a9b9e' }}>منتظر سایر بازیکنان...</p>
            <p className="text-sm font-bold" style={{ color: '#ffd60a' }}>
              {Object.keys(pub.votes).length} از {players.length} رأی
            </p>
          </div>
        )
      }

      // all voted — show tally
      const tally: Record<string, number> = {}
      Object.values(pub.votes).forEach(v => { tally[v] = (tally[v] || 0) + 1 })
      const maxV = Math.max(...Object.values(tally), 0)
      const topIds = Object.keys(tally).filter(id => tally[id] === maxV)
      const elimId = topIds.length === 1 ? topIds[0] : null
      const elimPlayer = elimId ? players.find(p => p.id === elimId) : null

      return (
        <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
          <h2 className="font-black text-white text-xl">نتیجه رأی‌گیری</h2>
          <div className="w-full max-w-xs flex flex-col gap-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2 rounded-xl"
                style={{ background: 'rgba(30,30,34,0.8)', border: p.id === elimId ? '1.5px solid #CC2229' : 'none' }}>
                <span className="font-bold text-white text-sm">{p.name}</span>
                <span className="font-black text-sm" style={{ color: '#CC2229' }}>{tally[p.id] || 0} رأی</span>
              </div>
            ))}
          </div>
          {elimPlayer && isHost && (
            <button onClick={async () => {
              const isSpy = elimPlayer.id === (pubState?.eliminatedId ?? '') || false
              const newState: PublicSpyState = { ...pub, eliminatedId: elimId, phase: 'result', winner: 'citizens' }
              await broadcastState(newState)
            }}
              className="btn-game px-8 py-3 rounded-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
              اعلام حذف: {elimPlayer.name}
            </button>
          )}
        </div>
      )
    }

    if (pub.phase === 'spy_guess' && myRole === 'spy') {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
          <div className="text-5xl">🕵️</div>
          <h2 className="font-black text-white text-xl text-center">مکان را حدس بزنید</h2>
          <div className="grid gap-2 w-full max-w-xs" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {LOCATIONS.map(loc => (
              <button key={loc} onClick={() => setMySpyGuess(loc)}
                className="btn-game py-2.5 px-3 rounded-xl font-bold text-sm text-white"
                style={{
                  background: mySpyGuess === loc ? 'rgba(59,130,246,0.35)' : 'rgba(30,30,34,0.9)',
                  border: `1.5px solid ${mySpyGuess === loc ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {loc}
              </button>
            ))}
          </div>
          {mySpyGuess && (
            <button onClick={() => submitSpyGuess(mySpyGuess)}
              className="btn-game px-8 py-4 rounded-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              تأیید: {mySpyGuess}
            </button>
          )}
        </div>
      )
    }

    if (pub.phase === 'spy_guess' && myRole !== 'spy') {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
          <div className="text-5xl animate-pulse">🕵️</div>
          <p className="font-black text-white text-xl">جاسوس در حال حدس زدن است...</p>
          <p className="text-sm" style={{ color: '#9a9b9e' }}>صبر کنید</p>
        </div>
      )
    }

    if (pub.phase === 'result') {
      const spyPlayer = players.find(p => p.id === pub.eliminatedId) ?? players[0]
      return (
        <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
          <div className="text-7xl">{pub.winner === 'spy' ? '🕵️' : '🏆'}</div>
          <h2 className="font-black text-white text-3xl text-center">
            {pub.winner === 'spy' ? 'جاسوس برد!' : 'کارمندان بردند!'}
          </h2>
          <div className="px-6 py-4 rounded-2xl text-center w-full max-w-xs"
            style={{ background: 'rgba(30,30,34,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {myRole === 'employee' && (
              <>
                <p className="text-sm" style={{ color: '#9a9b9e' }}>مکان واقعی:</p>
                <p className="font-black text-2xl text-white mt-1">{myLocation}</p>
              </>
            )}
            {myRole === 'spy' && (
              <p className="font-black text-lg" style={{ color: '#3b82f6' }}>شما جاسوس بودید</p>
            )}
          </div>
          <button onClick={onExit}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
            خروج
          </button>
        </div>
      )
    }

    return null
  }

  // ── LOCAL (PASS THE PHONE) MODE ─────────────────────────────────────────
  const questioner = players[questionerIdx % players.length]
  const answerer = players[answererIdx % players.length]

  if (localPhase === 'role_reveal') {
    const player = players[revealIdx]
    if (!showRole) return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-6xl">🔍</div>
        <h2 className="font-black text-white text-2xl text-center">گوشی را به <span style={{ color: '#ffd60a' }}>{player.name}</span> بده</h2>
        <button onClick={() => setShowRole(true)}
          className="btn-game px-8 py-4 rounded-2xl font-black text-lg text-white"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
          نمایش نقش من
        </button>
      </div>
    )

    const isSpy = player.id === spyId
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <p className="text-sm font-bold" style={{ color: '#9a9b9e' }}>نقش {player.name}:</p>
        {isSpy ? (
          <div className="w-48 px-8 py-8 rounded-3xl flex flex-col items-center gap-3 border-2"
            style={{ background: '#3b82f622', borderColor: '#3b82f6', boxShadow: '0 0 32px #3b82f644' }}>
            <span style={{ fontSize: 60 }}>🕵️</span>
            <span className="font-black text-xl text-white">جاسوس!</span>
            <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>مکان را نمی‌دانی — باید حدس بزنی</p>
          </div>
        ) : (
          <div className="w-48 px-8 py-8 rounded-3xl flex flex-col items-center gap-3 border-2"
            style={{ background: '#22c55e22', borderColor: '#22c55e', boxShadow: '0 0 32px #22c55e44' }}>
            <span style={{ fontSize: 44 }}>📍</span>
            <span className="font-black text-xl text-white">مکان:</span>
            <span className="font-black text-2xl" style={{ color: '#22c55e' }}>{location}</span>
          </div>
        )}
        <button onClick={() => {
          setShowRole(false)
          if (revealIdx + 1 < players.length) setRevealIdx(revealIdx + 1)
          else setLocalPhase('question')
        }}
          className="btn-game px-8 py-4 rounded-2xl font-black text-lg text-white"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
          {revealIdx + 1 < players.length ? `نوبت ${players[revealIdx + 1]?.name}` : 'شروع بازی!'}
        </button>
      </div>
    )
  }

  if (localPhase === 'question') {
    const roundsLeft = players.length * 2 - questionCount
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <div className="text-4xl">❓</div>
        <h2 className="font-black text-white text-xl text-center">دور سؤال و جواب</h2>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="px-4 py-3 rounded-2xl text-center"
            style={{ background: 'rgba(249,115,22,0.15)', border: '1.5px solid #f97316' }}>
            <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>سؤال می‌پرسد:</p>
            <p className="font-black text-white text-lg">{questioner?.name}</p>
          </div>
          <div className="text-center text-2xl">↓</div>
          <div className="px-4 py-3 rounded-2xl text-center"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1.5px solid #22c55e' }}>
            <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>جواب می‌دهد:</p>
            <p className="font-black text-white text-lg">{answerer?.name}</p>
          </div>
        </div>
        <p className="text-xs" style={{ color: '#9a9b9e' }}>سؤال‌های باقیمانده: {Math.max(0, roundsLeft)}</p>
        <div className="flex gap-2 w-full max-w-xs">
          <button onClick={() => {
            const nextQ = questionCount + 1
            setQuestionCount(nextQ)
            setQuestionerIdx(answererIdx)
            setAnswererIdx((answererIdx + 1) % players.length === questionerIdx % players.length
              ? (answererIdx + 2) % players.length
              : (answererIdx + 1) % players.length)
            if (nextQ >= players.length * 2) setLocalPhase('vote')
          }}
            className="btn-game flex-1 py-3 rounded-xl font-black text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            سؤال بعدی →
          </button>
          <button onClick={() => setLocalPhase('vote')}
            className="btn-game flex-1 py-3 rounded-xl font-black text-white text-sm"
            style={{ background: 'rgba(204,34,41,0.2)', border: '1.5px solid #CC2229' }}>
            رأی‌گیری
          </button>
        </div>
        <button onClick={() => setLocalPhase('spy_guess')}
          className="btn-game px-4 py-2 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid #3b82f644' }}>
          🕵️ جاسوس می‌خواهد مکان را حدس بزند
        </button>
      </div>
    )
  }

  if (localPhase === 'vote') {
    const voter = players[currentVoter]
    if (!voter) {
      const tally: Record<string, number> = {}
      Object.values(votes).forEach(v => { tally[v] = (tally[v] || 0) + 1 })
      const maxV = Math.max(...Object.values(tally), 0)
      const topIds = Object.keys(tally).filter(id => tally[id] === maxV)
      const elim = topIds.length === 1 ? topIds[0] : null
      const elimPlayer = elim ? players.find(p => p.id === elim) : null

      return (
        <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
          <h2 className="font-black text-white text-xl">نتیجه رأی‌گیری</h2>
          <div className="w-full max-w-xs flex flex-col gap-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2 rounded-xl"
                style={{ background: 'rgba(30,30,34,0.8)' }}>
                <span className="font-bold text-white text-sm">{p.name}</span>
                <span className="font-black text-sm" style={{ color: '#CC2229' }}>{tally[p.id] || 0} رأی</span>
              </div>
            ))}
          </div>
          {elimPlayer && (
            <div className="text-center">
              <p className="font-black text-lg" style={{ color: '#CC2229' }}>{elimPlayer.name} متهم است</p>
              {elimPlayer.id === spyId
                ? <p className="text-sm mt-1" style={{ color: '#22c55e' }}>✓ جاسوس شناسایی شد! شهروندان بردند!</p>
                : <p className="text-sm mt-1" style={{ color: '#f97316' }}>✗ این فرد جاسوس نبود!</p>
              }
            </div>
          )}
          <div className="flex gap-2 w-full max-w-xs">
            {elimPlayer && (
              <button onClick={() => {
                setEliminatedId(elim)
                if (elim === spyId) { setWinner('citizens'); setLocalPhase('result') }
                else { setLocalPhase('spy_guess') }
              }}
                className="btn-game flex-1 py-3 rounded-xl font-black text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
                تأیید حذف
              </button>
            )}
            <button onClick={() => setLocalPhase('question')}
              className="btn-game flex-1 py-3 rounded-xl font-black text-white text-sm"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              ادامه سؤال
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col gap-4 px-6 py-8" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-2">🗳️</div>
          <h2 className="font-black text-white text-xl">رأی {voter.name}</h2>
        </div>
        <div className="flex flex-col gap-2">
          {players.filter(p => p.id !== voter.id).map(p => (
            <button key={p.id} onClick={() => {
              setVotes(prev => ({ ...prev, [voter.id]: p.id }))
              setCurrentVoter(c => c + 1)
            }}
              className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
              style={{ background: 'rgba(30,30,34,0.9)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
              <span>👤</span><span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (localPhase === 'spy_guess') {
    const spy = players.find(p => p.id === spyId)!
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-5xl">🕵️</div>
        <h2 className="font-black text-white text-xl text-center">{spy.name} (جاسوس) مکان را حدس می‌زند</h2>
        <div className="grid gap-2 w-full max-w-xs" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {LOCATIONS.map(loc => (
            <button key={loc} onClick={() => setSpyGuess(loc)}
              className="btn-game py-2.5 px-3 rounded-xl font-bold text-sm text-white"
              style={{
                background: spyGuess === loc ? 'rgba(59,130,246,0.35)' : 'rgba(30,30,34,0.9)',
                border: `1.5px solid ${spyGuess === loc ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
              }}>
              {loc}
            </button>
          ))}
        </div>
        {spyGuess && (
          <button onClick={() => {
            if (spyGuess === location) { setWinner('spy') }
            else { setWinner('citizens') }
            setLocalPhase('result')
          }}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            تأیید حدس: {spyGuess}
          </button>
        )}
      </div>
    )
  }

  if (localPhase === 'result') return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <div className="text-7xl">{winner === 'spy' ? '🕵️' : '🏆'}</div>
      <h2 className="font-black text-white text-3xl text-center">
        {winner === 'spy' ? 'جاسوس برد!' : 'شهروندان بردند!'}
      </h2>
      <div className="px-6 py-4 rounded-2xl text-center w-full max-w-xs"
        style={{ background: 'rgba(30,30,34,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-sm" style={{ color: '#9a9b9e' }}>مکان واقعی:</p>
        <p className="font-black text-2xl text-white mt-1">{location}</p>
        <p className="text-sm mt-2" style={{ color: '#9a9b9e' }}>جاسوس:</p>
        <p className="font-black text-xl" style={{ color: '#3b82f6' }}>{players.find(p => p.id === spyId)?.name}</p>
      </div>
      <button onClick={onExit}
        className="btn-game px-8 py-4 rounded-2xl font-black text-white"
        style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
        خروج
      </button>
    </div>
  )

  return null
}
