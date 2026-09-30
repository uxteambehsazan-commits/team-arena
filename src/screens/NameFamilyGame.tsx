// اسم‌فامیل — Online Multiplayer Only
// Peer-review voting: each player validates other players' answers after answering phase.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  NF_CATEGORIES, VALIDATION_DURATION_MS,
  validateAnswer, getValidationMessage,
  selectRandomLetter, scoreRoundWithVotes, determineWinner,
  ROUND_DURATION_MS, DEFAULT_TOTAL_ROUNDS,
  type NfPhase, type NfSubmitState,
  type NfCategory, type NfPublicState, type NfRoundResult,
} from '../lib/nameFamilyEngine'
import { supabase } from '../lib/supabase'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface LocalPlayer {
  id: string
  name: string
}

interface Props {
  onExit: () => void
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function genId() { return Math.random().toString(36).slice(2, 9) }

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s.slice(0, 3) + '-' + s.slice(3)
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function NameFamilyGame({ onExit }: Props) {
  const [screen, setScreen] = useState<'online_setup' | 'online_join' | 'game'>('online_setup')
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [players, setPlayers] = useState<LocalPlayer[]>([])
  const [isHost, setIsHost] = useState(false)
  const [myId] = useState(() => genId())

  // ── Online setup (host creates room) ─────────────────────────────────────
  if (screen === 'online_setup') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const code = useMemo(() => generateRoomCode(), [])
    return (
      <div className="h-full flex flex-col" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-5 pb-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onExit} className="btn-game w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>←</button>
          <div>
            <h1 className="font-black text-white text-lg">اسم‌فامیل</h1>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>بازی گروهی آنلاین</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-5 px-5 py-6">
          <div className="text-center py-4">
            <div className="text-5xl mb-2">🔤</div>
            <p className="text-sm" style={{ color: '#9a9b9e' }}>هر بازیکن دستگاه مستقل خود را دارد</p>
          </div>
          <div>
            <label className="text-sm font-bold text-white block mb-2">اسم شما</label>
            <input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="نام خود را وارد کنید"
              dir="rtl"
              maxLength={20}
              className="w-full rounded-2xl px-4 py-3 text-white outline-none"
              style={{ background: '#1e1e20', border: '1.5px solid #2e2e32' }}
            />
          </div>
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1.5px solid rgba(124,58,237,0.3)' }}>
            <p className="text-xs mb-1" style={{ color: '#9a9b9e' }}>کد اتاق</p>
            <p className="font-black text-white text-3xl tracking-widest">{code}</p>
            <p className="text-xs mt-2" style={{ color: '#9a9b9e' }}>این کد را به دوستانت بده</p>
          </div>
          <div className="p-3 rounded-xl text-xs text-center" style={{ background: 'rgba(6,182,212,0.06)', color: '#9a9b9e' }}>
            ✓ پس از پاسخ‌دهی، بازیکنان پاسخ یکدیگر را رأی‌گیری می‌کنند
          </div>
          <button
            onClick={() => {
              if (!playerName.trim()) return
              setPlayers([{ id: myId, name: playerName.trim() }])
              setRoomCode(code)
              setIsHost(true)
              setScreen('game')
            }}
            disabled={!playerName.trim()}
            className="btn-game w-full py-4 rounded-2xl font-black text-white mt-auto"
            style={{
              background: playerName.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.05)',
              opacity: playerName.trim() ? 1 : 0.5,
              boxShadow: playerName.trim() ? '0 6px 20px rgba(124,58,237,0.35)' : 'none',
            }}>
            🌐 ایجاد اتاق
          </button>
          <button onClick={() => setScreen('online_join')}
            className="btn-game w-full py-3 rounded-2xl font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#9a9b9e' }}>
            یا با کد وارد اتاق شو
          </button>
        </div>
      </div>
    )
  }

  // ── Online join ───────────────────────────────────────────────────────────
  if (screen === 'online_join') {
    return (
      <div className="h-full flex flex-col" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-5 pb-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => setScreen('online_setup')} className="btn-game w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>←</button>
          <h1 className="font-black text-white text-lg">ورود به اتاق</h1>
        </div>
        <div className="flex-1 flex flex-col gap-5 px-5 py-6">
          <div>
            <label className="text-sm font-bold text-white block mb-2">اسم شما</label>
            <input value={playerName} onChange={e => setPlayerName(e.target.value)}
              placeholder="نام خود را وارد کنید" dir="rtl" maxLength={20}
              className="w-full rounded-2xl px-4 py-3 text-white outline-none"
              style={{ background: '#1e1e20', border: '1.5px solid #2e2e32' }} />
          </div>
          <div>
            <label className="text-sm font-bold text-white block mb-2">کد اتاق</label>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="XXX-XXX" dir="ltr" maxLength={7}
              className="w-full rounded-2xl px-4 py-3 text-white outline-none text-center text-xl font-black tracking-widest"
              style={{ background: '#1e1e20', border: '1.5px solid #2e2e32' }} />
          </div>
          <button
            onClick={() => {
              if (!playerName.trim() || joinCode.length < 6) return
              setPlayers([{ id: myId, name: playerName.trim() }])
              setRoomCode(joinCode)
              setIsHost(false)
              setScreen('game')
            }}
            disabled={!playerName.trim() || joinCode.length < 6}
            className="btn-game w-full py-4 rounded-2xl font-black text-white mt-auto"
            style={{
              background: (playerName.trim() && joinCode.length >= 6) ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.05)',
              opacity: (playerName.trim() && joinCode.length >= 6) ? 1 : 0.5,
            }}>
            🚪 ورود به اتاق
          </button>
        </div>
      </div>
    )
  }

  // ── Game screen ───────────────────────────────────────────────────────────
  return (
    <NameFamilyGameSession
      myId={myId}
      myName={players.find(p => p.id === myId)?.name ?? 'بازیکن'}
      initialPlayers={players}
      isHost={isHost}
      roomCode={roomCode}
      onExit={onExit}
    />
  )
}

// ─── GAME SESSION ─────────────────────────────────────────────────────────────

interface SessionProps {
  myId: string
  myName: string
  initialPlayers: LocalPlayer[]
  isHost: boolean
  roomCode: string
  onExit: () => void
}

function NameFamilyGameSession({ myId, myName, initialPlayers, isHost, roomCode, onExit }: SessionProps) {
  const categories = NF_CATEGORIES

  const [phase, setPhase] = useState<NfPhase>('lobby')
  const [onlinePlayers, setOnlinePlayers] = useState<LocalPlayer[]>(initialPlayers)
  const [letter, setLetter] = useState('')
  const [round, setRound] = useState(1)
  const [roundDeadline, setRoundDeadline] = useState(0)
  const [validationDeadline, setValidationDeadline] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [myAnswers, setMyAnswers] = useState<Record<string, string>>({})
  const [mySubmitState, setMySubmitState] = useState<NfSubmitState>('NOT_STARTED')
  const [submitStates, setSubmitStates] = useState<Record<string, NfSubmitState>>({})
  const [cumulativeScores, setCumulativeScores] = useState<Record<string, number>>({})
  const [roundResults, setRoundResults] = useState<NfRoundResult[]>([])
  const [currentBreakdown, setCurrentBreakdown] = useState<NfRoundResult | null>(null)
  const [gameWinner, setGameWinner] = useState<string | null>(null)
  const [isGameTie, setIsGameTie] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [usedLetters, setUsedLetters] = useState<string[]>([])
  const [breakdownTab, setBreakdownTab] = useState<string>(myId)
  const [copied, setCopied] = useState(false)
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, Record<string, string>>>({})
  const [myVotes, setMyVotes] = useState<Record<string, 'valid' | 'invalid'>>({})

  const totalRounds = DEFAULT_TOTAL_ROUNDS
  const players = onlinePlayers

  const allAnswers = useRef<Record<string, Record<string, string>>>({})
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pubChRef = useRef<import('@supabase/supabase-js').RealtimeChannel | null>(null)
  const pubReadyRef = useRef(false)
  const seqRef = useRef(0)
  const votesRef = useRef<Record<string, Record<string, 'valid' | 'invalid'>>>({})

  const playerNames = useMemo(() => {
    const m: Record<string, string> = {}
    players.forEach(p => { m[p.id] = p.name })
    return m
  }, [players])

  // ── Online: subscribe to channel ─────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel(`nf-${roomCode}`, {
      config: { broadcast: { self: false, ack: false }, presence: { key: myId } },
    })

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState<{ name: string }>()
      const newPlayers: LocalPlayer[] = Object.entries(state).map(([pid, pArr]) => ({
        id: pid,
        name: (pArr[0] as any)?.name ?? pid,
      }))
      setOnlinePlayers(newPlayers)
    })

    ch.on('broadcast', { event: 'nf_state' }, ({ payload }: any) => {
      const s = payload?.state as NfPublicState
      if (!s || s.seq <= seqRef.current) return
      seqRef.current = s.seq
      applyServerState(s)
    })

    ch.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      pubReadyRef.current = true
      await ch.track({ name: myName })
    })

    pubChRef.current = ch
    return () => { supabase.removeChannel(ch); pubReadyRef.current = false; pubChRef.current = null }
  }, [roomCode, myId, myName])

  // ── Host: listen for player submissions and votes ─────────────────────────
  useEffect(() => {
    if (!isHost) return
    const ch = pubChRef.current
    if (!ch) return

    ch.on('broadcast', { event: 'nf_submit' }, ({ payload }: any) => {
      const { playerId, answers } = payload as { playerId: string; answers: Record<string, string> }
      allAnswers.current[playerId] = answers
      setSubmitStates(prev => {
        const next = { ...prev, [playerId]: 'SUBMITTED' as NfSubmitState }
        const allDone = players.every(p => next[p.id] === 'SUBMITTED' || next[p.id] === 'TIME_EXPIRED')
        if (allDone && next[myId] === 'SUBMITTED') {
          if (roundTimerRef.current) clearTimeout(roundTimerRef.current)
          setTimeout(() => hostLockRound(), 300)
        }
        return next
      })
    })

    ch.on('broadcast', { event: 'nf_vote' }, ({ payload }: any) => {
      const { voterId, answerKey, vote } = payload as {
        voterId: string; answerKey: string; vote: 'valid' | 'invalid'
      }
      const [answerOwnerId] = answerKey.split('::')
      if (voterId === answerOwnerId) return  // anti-cheat: no self-vote
      if (!votesRef.current[answerKey]) votesRef.current[answerKey] = {}
      votesRef.current[answerKey][voterId] = vote
    })
  }, [isHost, players, myId])

  function applyServerState(s: NfPublicState) {
    setPhase(s.phase)
    setLetter(s.letter)
    setRound(s.round)
    setRoundDeadline(s.roundDeadline)
    setSubmitStates(s.submitStates)
    setCumulativeScores(s.cumulativeScores)
    setRoundResults(s.roundResults)
    if (s.validationDeadline) setValidationDeadline(s.validationDeadline)
    if (s.revealedAnswers) setRevealedAnswers(s.revealedAnswers)
    if (s.phase === 'validation') setMyVotes({})
    if (s.roundResults.length > 0 && (s.phase === 'score_breakdown' || s.phase === 'game_over')) {
      setCurrentBreakdown(s.roundResults[s.roundResults.length - 1])
    }
    if (s.phase === 'game_over') {
      setGameWinner(s.gameWinner)
      setIsGameTie(s.isGameTie)
    }
    if (s.phase === 'round_locked' || s.phase === 'score_breakdown' || s.phase === 'validation') {
      setMySubmitState('SUBMITTED')
    }
  }

  const broadcastState = useCallback(async (state: NfPublicState) => {
    applyServerState(state)
    const ch = pubChRef.current
    if (!ch || !pubReadyRef.current) return
    await ch.send({ type: 'broadcast', event: 'nf_state', payload: { state } }).catch(() => {})
  }, [])

  // ── Timers ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'round_playing' || !roundDeadline) return
    const tick = () => { const left = Math.max(0, Math.round((roundDeadline - Date.now()) / 1000)); setTimeLeft(t => left !== t ? left : t) }
    tick(); const id = setInterval(tick, 400); return () => clearInterval(id)
  }, [phase, roundDeadline])

  useEffect(() => {
    if (phase !== 'validation' || !validationDeadline) return
    const tick = () => { const left = Math.max(0, Math.round((validationDeadline - Date.now()) / 1000)); setTimeLeft(t => left !== t ? left : t) }
    tick(); const id = setInterval(tick, 400); return () => clearInterval(id)
  }, [phase, validationDeadline])

  useEffect(() => {
    if (!isHost || phase !== 'round_playing' || !roundDeadline) return
    const delay = roundDeadline - Date.now()
    if (delay <= 0) { hostLockRound(); return }
    roundTimerRef.current = setTimeout(() => hostLockRound(), delay + 200)
    return () => { if (roundTimerRef.current) clearTimeout(roundTimerRef.current) }
  }, [phase, roundDeadline, isHost])

  useEffect(() => {
    if (!isHost || phase !== 'validation' || !validationDeadline) return
    const delay = validationDeadline - Date.now()
    if (delay <= 0) { hostEndValidation(); return }
    validationTimerRef.current = setTimeout(() => hostEndValidation(), delay + 200)
    return () => { if (validationTimerRef.current) clearTimeout(validationTimerRef.current) }
  }, [phase, validationDeadline, isHost])

  // ── Host: start round ────────────────────────────────────────────────────
  const hostStartRound = useCallback(async (roundNum: number, cumScores: Record<string, number>, prevResults: NfRoundResult[]) => {
    const newLetter = selectRandomLetter(usedLetters)
    setUsedLetters(prev => [...prev, newLetter])
    setMyAnswers({})
    setValidationErrors({})
    setMySubmitState('NOT_STARTED')
    setMyVotes({})
    allAnswers.current = {}
    votesRef.current = {}

    const deadline = Date.now() + ROUND_DURATION_MS
    const initSubmitStates: Record<string, NfSubmitState> = {}
    players.forEach(p => { initSubmitStates[p.id] = 'ANSWERING' })

    await broadcastState({
      phase: 'round_playing',
      round: roundNum,
      totalRounds,
      letter: newLetter,
      roundDeadline: deadline,
      categories,
      submitStates: initSubmitStates,
      cumulativeScores: cumScores,
      roundResults: prevResults,
      gameWinner: null,
      isGameTie: false,
      seq: ++seqRef.current,
    })
  }, [players, usedLetters, categories, totalRounds, broadcastState])

  // ── Host: lock round ─────────────────────────────────────────────────────
  const hostLockRound = useCallback(async () => {
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current)

    const finalSubmitStates = { ...submitStates }
    players.forEach(p => {
      if (finalSubmitStates[p.id] !== 'SUBMITTED') {
        finalSubmitStates[p.id] = 'TIME_EXPIRED'
        if (!allAnswers.current[p.id]) allAnswers.current[p.id] = {}
      }
    })

    await broadcastState({
      phase: 'round_locked',
      round,
      totalRounds,
      letter,
      roundDeadline,
      categories,
      submitStates: finalSubmitStates,
      cumulativeScores,
      roundResults,
      gameWinner: null,
      isGameTie: false,
      seq: ++seqRef.current,
    })

    setTimeout(() => hostStartValidation(finalSubmitStates), 800)
  }, [players, submitStates, letter, round, totalRounds, roundDeadline, cumulativeScores, roundResults, categories, broadcastState])

  // ── Host: start validation ────────────────────────────────────────────────
  const hostStartValidation = useCallback(async (finalSubmitStates: Record<string, NfSubmitState>) => {
    votesRef.current = {}
    const vDeadline = Date.now() + VALIDATION_DURATION_MS

    await broadcastState({
      phase: 'validation',
      round,
      totalRounds,
      letter,
      roundDeadline,
      categories,
      submitStates: finalSubmitStates,
      cumulativeScores,
      roundResults,
      gameWinner: null,
      isGameTie: false,
      seq: ++seqRef.current,
      revealedAnswers: { ...allAnswers.current },
      validationDeadline: vDeadline,
    })
  }, [round, totalRounds, letter, roundDeadline, categories, cumulativeScores, roundResults, broadcastState])

  // ── Host: end validation + score ──────────────────────────────────────────
  const hostEndValidation = useCallback(async () => {
    if (validationTimerRef.current) clearTimeout(validationTimerRef.current)

    const result = scoreRoundWithVotes(letter, categories, allAnswers.current, playerNames, votesRef.current)
    result.round = round

    const newCumulative = { ...cumulativeScores }
    result.players.forEach(pr => {
      newCumulative[pr.playerId] = (newCumulative[pr.playerId] ?? 0) + pr.roundTotal
      pr.cumulativeTotal = newCumulative[pr.playerId]
    })

    const roundScores: Record<string, number> = {}
    result.players.forEach(pr => { roundScores[pr.playerId] = pr.roundTotal })
    const { winner, isTie } = determineWinner(roundScores)
    result.winner = winner
    result.isTie = isTie

    const newResults = [...roundResults, result]
    setCumulativeScores(newCumulative)
    setRoundResults(newResults)
    setCurrentBreakdown(result)

    await broadcastState({
      phase: 'score_breakdown',
      round,
      totalRounds,
      letter,
      roundDeadline,
      categories,
      submitStates,
      cumulativeScores: newCumulative,
      roundResults: newResults,
      gameWinner: null,
      isGameTie: false,
      seq: ++seqRef.current,
    })
  }, [letter, categories, round, totalRounds, roundDeadline, cumulativeScores, roundResults, submitStates, playerNames, broadcastState])

  // ── Host: next round or game over ─────────────────────────────────────────
  const hostNextRound = useCallback(async () => {
    const nextRound = round + 1
    if (nextRound > totalRounds) {
      const { winner, isTie } = determineWinner(cumulativeScores)
      setGameWinner(winner)
      setIsGameTie(isTie)
      await broadcastState({
        phase: 'game_over',
        round,
        totalRounds,
        letter,
        roundDeadline,
        categories,
        submitStates,
        cumulativeScores,
        roundResults,
        gameWinner: winner,
        isGameTie: isTie,
        seq: ++seqRef.current,
      })
    } else {
      await hostStartRound(nextRound, cumulativeScores, roundResults)
    }
  }, [round, totalRounds, cumulativeScores, letter, roundDeadline, submitStates, roundResults, categories, broadcastState, hostStartRound])

  // ── Player: type answer ───────────────────────────────────────────────────
  const typeAnswer = useCallback((catId: string, raw: string) => {
    if (mySubmitState === 'SUBMITTED' || mySubmitState === 'TIME_EXPIRED') return
    if (/[A-Za-z]/.test(raw)) { setValidationErrors(prev => ({ ...prev, [catId]: 'لطفاً پاسخ را با حروف فارسی وارد کنید' })); return }
    if (/[0-9۰-۹٠-٩]/.test(raw)) { setValidationErrors(prev => ({ ...prev, [catId]: 'فقط حروف فارسی وارد کنید. اعداد مجاز نیستند' })); return }
    if (/[@#$%^&*()\-_=+\[\]{}|;':",./<>?\\`~!]/.test(raw)) { setValidationErrors(prev => ({ ...prev, [catId]: 'فقط حروف فارسی مجاز هستند' })); return }
    setValidationErrors(prev => ({ ...prev, [catId]: '' }))
    setMyAnswers(prev => ({ ...prev, [catId]: raw }))
    if (mySubmitState === 'NOT_STARTED') setMySubmitState('ANSWERING')
  }, [mySubmitState])

  // ── Player: submit answers ────────────────────────────────────────────────
  const submitAnswers = useCallback(async () => {
    if (mySubmitState === 'SUBMITTED') return

    const errors: Record<string, string> = {}
    for (const cat of categories) {
      const raw = myAnswers[cat.id] ?? ''
      if (!raw.trim()) continue
      const v = validateAnswer(raw, letter)
      if (!v.valid) errors[cat.id] = getValidationMessage(v)
    }
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); return }

    allAnswers.current[myId] = { ...myAnswers }
    setMySubmitState('SUBMITTED')
    const newStates = { ...submitStates, [myId]: 'SUBMITTED' as NfSubmitState }
    setSubmitStates(newStates)

    const ch = pubChRef.current
    if (ch && pubReadyRef.current) {
      await ch.send({ type: 'broadcast', event: 'nf_submit', payload: { playerId: myId, answers: myAnswers } }).catch(() => {})
    }

    if (isHost) {
      const allDone = players.every(p => newStates[p.id] === 'SUBMITTED' || newStates[p.id] === 'TIME_EXPIRED')
      if (allDone) {
        if (roundTimerRef.current) clearTimeout(roundTimerRef.current)
        await hostLockRound()
      }
    }
  }, [mySubmitState, myAnswers, letter, categories, myId, submitStates, players, isHost, hostLockRound])

  // ── Player: cast vote ─────────────────────────────────────────────────────
  const castVote = useCallback(async (answerKey: string, vote: 'valid' | 'invalid') => {
    const [answerOwnerId] = answerKey.split('::')
    if (answerOwnerId === myId) return  // cannot vote on own answer

    setMyVotes(prev => ({ ...prev, [answerKey]: vote }))

    if (isHost) {
      // Host stores own votes directly since channel doesn't echo to self
      if (!votesRef.current[answerKey]) votesRef.current[answerKey] = {}
      votesRef.current[answerKey][myId] = vote
    }

    const ch = pubChRef.current
    if (ch && pubReadyRef.current) {
      await ch.send({ type: 'broadcast', event: 'nf_vote', payload: { voterId: myId, answerKey, vote } }).catch(() => {})
    }
  }, [myId, isHost])

  // ── RENDER: Lobby ─────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="h-full flex flex-col" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-4 pb-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onExit} className="btn-game w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>←</button>
          <div>
            <h1 className="font-black text-white">اسم‌فامیل</h1>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>اتاق: {roomCode}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5">
          <div className="w-full max-w-xs">
            <div className="p-4 rounded-2xl text-center mb-4"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1.5px solid rgba(124,58,237,0.3)' }}>
              <p className="text-xs" style={{ color: '#9a9b9e' }}>کد اتاق</p>
              <p className="font-black text-white text-2xl tracking-widest mt-1">{roomCode}</p>
              <button onClick={() => { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="mt-2 text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)', color: '#c084fc' }}>
                {copied ? '✓ کپی شد' : 'کپی کد'}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {players.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(30,30,34,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                  <span className="font-bold text-white text-sm">{p.name}</span>
                  {p.id === myId && <span className="text-xs" style={{ color: '#9a9b9e' }}>(شما)</span>}
                  {isHost && p.id === myId && (
                    <span className="text-xs px-2 py-0.5 rounded-full ml-auto"
                      style={{ background: 'rgba(124,58,237,0.2)', color: '#c084fc' }}>میزبان</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-xl text-xs text-center" style={{ background: 'rgba(255,255,255,0.04)', color: '#9a9b9e' }}>
              ✓ پس از پاسخ‌دهی، بازیکنان پاسخ‌های یکدیگر را رأی‌گیری می‌کنند
            </div>
          </div>

          {isHost ? (
            <>
              <button
                onClick={() => hostStartRound(1, {}, [])}
                disabled={players.length < 2}
                className="btn-game px-8 py-4 rounded-2xl font-black text-white"
                style={{
                  background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
                  boxShadow: '0 6px 20px rgba(6,182,212,0.35)',
                  opacity: players.length >= 2 ? 1 : 0.4,
                }}>
                🚀 شروع بازی ({totalRounds} دور)
              </button>
              {players.length < 2 && (
                <p className="text-xs" style={{ color: '#9a9b9e' }}>برای شروع حداقل ۲ بازیکن لازم است</p>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: '#9a9b9e' }}>منتظر میزبان برای شروع...</p>
          )}
        </div>
      </div>
    )
  }

  // ── RENDER: Round playing ─────────────────────────────────────────────────
  if (phase === 'round_playing' || phase === 'round_locked') {
    const submitted = mySubmitState === 'SUBMITTED' || mySubmitState === 'TIME_EXPIRED'
    const submittedCount = Object.values(submitStates).filter(s => s === 'SUBMITTED').length

    return (
      <div className="h-full flex flex-col overflow-hidden" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-center justify-between gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="text-center px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
              <div className="font-display font-black text-3xl" style={{ color: '#06b6d4', lineHeight: 1 }}>{letter}</div>
              <div className="text-xs mt-0.5" style={{ color: '#9a9b9e' }}>حرف دور</div>
            </div>
            <div>
              <p className="font-black text-white text-sm">دور {round} از {totalRounds}</p>
              <p className="text-xs" style={{ color: '#9a9b9e' }}>{submittedCount}/{players.length} تموم کردن</p>
            </div>
          </div>
          <div className="text-center px-3 py-1.5 rounded-xl"
            style={{ background: timeLeft <= 10 ? 'rgba(204,34,41,0.15)' : 'rgba(255,255,255,0.06)' }}>
            <div className="font-black text-2xl" style={{ color: timeLeft <= 10 ? '#CC2229' : '#ffd60a', fontFamily: 'monospace' }}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
            <div className="text-5xl">⏳</div>
            <p className="font-black text-white text-lg">جواب‌هایت ثبت شد!</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {players.map(p => {
                const st = submitStates[p.id] ?? 'ANSWERING'
                return (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: 'rgba(30,30,34,0.9)', border: `1px solid ${st === 'SUBMITTED' ? '#22c55e33' : 'rgba(255,255,255,0.06)'}` }}>
                    <span className="font-bold text-white text-sm flex-1">{p.name}</span>
                    <span style={{ color: st === 'SUBMITTED' ? '#22c55e' : '#6D6E71', fontSize: 12 }}>
                      {st === 'SUBMITTED' ? '✓ تموم' : st === 'TIME_EXPIRED' ? '⏰ تمام وقت' : '...'}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>به زودی مرحله بررسی پاسخ‌ها شروع می‌شود...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-2.5">
              {categories.map(cat => {
                const val = myAnswers[cat.id] ?? ''
                const err = validationErrors[cat.id]
                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{
                        background: '#1a1a1c',
                        border: `1.5px solid ${err ? '#CC222966' : val.trim() ? '#06b6d455' : '#2e2e32'}`,
                      }}>
                      <div className="w-18 flex-shrink-0 text-right">
                        <span className="text-lg">{cat.emoji}</span>
                        <p className="font-bold text-white text-xs mt-0.5">{cat.label}</p>
                      </div>
                      <input
                        value={val}
                        onChange={e => typeAnswer(cat.id, e.target.value)}
                        onPaste={e => { e.preventDefault(); typeAnswer(cat.id, e.clipboardData.getData('text')) }}
                        disabled={submitted}
                        placeholder={`${letter}...`}
                        dir="rtl"
                        className="flex-1 bg-transparent text-white outline-none text-sm"
                        style={{ caretColor: '#06b6d4' }}
                      />
                      {val.trim() && !err && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: '#06b6d4' }}>
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    {err && <p className="text-xs mt-1 mr-2 font-bold" style={{ color: '#CC2229' }}>⚠️ {err}</p>}
                  </div>
                )
              })}
            </div>
            <button
              onClick={submitAnswers}
              className="btn-game w-full py-4 rounded-2xl font-black text-white mt-4"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', boxShadow: '0 4px 20px rgba(6,182,212,0.35)' }}>
              ✓ ثبت جواب‌ها ({Object.values(myAnswers).filter(v => v.trim()).length}/{categories.length})
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── RENDER: Validation phase ──────────────────────────────────────────────
  if (phase === 'validation') {
    const otherPlayers = players.filter(p => p.id !== myId)
    let totalVotable = 0
    let votedCount = 0
    for (const p of otherPlayers) {
      for (const cat of categories) {
        const raw = revealedAnswers[p.id]?.[cat.id] ?? ''
        if (!raw.trim()) continue
        const v = validateAnswer(raw, letter)
        if (!v.valid) continue
        totalVotable++
        if (myVotes[`${p.id}::${cat.id}`]) votedCount++
      }
    }

    return (
      <div className="h-full flex flex-col overflow-hidden" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-center justify-between gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="font-black text-white text-sm">مرحله بررسی — دور {round}</p>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>
              {votedCount}/{totalVotable} رأی ثبت شد — حرف: «{letter}»
            </p>
          </div>
          <div className="text-center px-3 py-1.5 rounded-xl"
            style={{ background: timeLeft <= 10 ? 'rgba(204,34,41,0.15)' : 'rgba(255,214,10,0.1)', border: '1px solid rgba(255,214,10,0.2)' }}>
            <div className="font-black text-2xl" style={{ color: timeLeft <= 10 ? '#CC2229' : '#ffd60a', fontFamily: 'monospace' }}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
          <div className="p-3 rounded-xl text-xs text-center" style={{ background: 'rgba(255,214,10,0.06)', color: '#ffd60a' }}>
            پاسخ‌های بازیکنان دیگر را بررسی کن — رأی بده: ✓ درست / ✗ غلط
          </div>

          {otherPlayers.map(p => {
            const pAnswers = revealedAnswers[p.id] ?? {}
            return (
              <div key={p.id} className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(26,26,28,0.9)' }}>
                <div className="px-4 py-2.5 flex items-center gap-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                  <span className="font-black text-white text-sm">{p.name}</span>
                </div>
                <div className="flex flex-col">
                  {categories.map((cat, catIdx) => {
                    const raw = pAnswers[cat.id] ?? ''
                    const key = `${p.id}::${cat.id}`
                    const myVote = myVotes[key]

                    return (
                      <div key={cat.id} className="flex items-center gap-3 px-4 py-3"
                        style={{ borderTop: catIdx > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                        <span className="text-base flex-shrink-0">{cat.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs" style={{ color: '#9a9b9e' }}>{cat.label}</p>
                          {!raw.trim() ? (
                            <p className="text-sm" style={{ color: '#6D6E71' }}>— پاسخی نداد —</p>
                          ) : (() => {
                            const tv = validateAnswer(raw, letter)
                            return tv.valid
                              ? <p className="text-sm font-black text-white truncate">{raw}</p>
                              : <p className="text-sm font-bold truncate" style={{ color: '#CC2229' }}>{raw}</p>
                          })()}
                        </div>
                        {!raw.trim() ? (
                          <span className="text-xs flex-shrink-0" style={{ color: '#6D6E71' }}>—</span>
                        ) : (() => {
                          const tv = validateAnswer(raw, letter)
                          if (!tv.valid) {
                            return (
                              <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                                style={{ background: 'rgba(204,34,41,0.15)', color: '#CC2229' }}>
                                ✗ فنی
                              </span>
                            )
                          }
                          return (
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => castVote(key, 'valid')}
                                className="btn-game px-2.5 py-1.5 rounded-xl text-xs font-black"
                                style={{
                                  background: myVote === 'valid' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.06)',
                                  border: `1.5px solid ${myVote === 'valid' ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                                  color: myVote === 'valid' ? '#22c55e' : '#6D6E71',
                                }}>
                                ✓
                              </button>
                              <button
                                onClick={() => castVote(key, 'invalid')}
                                className="btn-game px-2.5 py-1.5 rounded-xl text-xs font-black"
                                style={{
                                  background: myVote === 'invalid' ? 'rgba(204,34,41,0.2)' : 'rgba(255,255,255,0.06)',
                                  border: `1.5px solid ${myVote === 'invalid' ? '#CC2229' : 'rgba(255,255,255,0.1)'}`,
                                  color: myVote === 'invalid' ? '#CC2229' : '#6D6E71',
                                }}>
                                ✗
                              </button>
                            </div>
                          )
                        })()}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* My answers (read-only reference) */}
          <div className="rounded-2xl overflow-hidden opacity-60"
            style={{ border: '1px solid rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.03)' }}>
            <div className="px-4 py-2.5 flex items-center gap-2"
              style={{ borderBottom: '1px solid rgba(6,182,212,0.1)' }}>
              <span className="font-black text-sm" style={{ color: '#06b6d4' }}>پاسخ‌های شما</span>
              <span className="text-xs" style={{ color: '#9a9b9e' }}>(رأی‌گیری ندارد)</span>
            </div>
            {categories.map((cat, catIdx) => {
              const raw = myAnswers[cat.id] ?? ''
              return (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderTop: catIdx > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-xs flex-1" style={{ color: '#9a9b9e' }}>{cat.label}</span>
                  <span className="text-sm font-bold" style={{ color: raw.trim() ? '#06b6d4' : '#6D6E71' }}>
                    {raw.trim() || '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── RENDER: Score breakdown ────────────────────────────────────────────────
  if (phase === 'score_breakdown' && currentBreakdown) {
    const br = currentBreakdown
    const selectedPlayer = br.players.find(p => p.playerId === breakdownTab) ?? br.players[0]

    return (
      <div className="h-full flex flex-col overflow-hidden" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-4 pb-3 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold" style={{ color: '#06b6d4' }}>دور {br.round} — حرف «{br.letter}»</p>
          <h2 className="font-black text-white text-lg mt-0.5">نتایج بررسی</h2>
          {br.isTie
            ? <p className="text-xs mt-1" style={{ color: '#ffd60a' }}>🤝 این دور مساوی شد!</p>
            : <p className="text-xs mt-1" style={{ color: '#22c55e' }}>🏆 برنده دور: {playerNames[br.winner ?? '']}</p>
          }
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            {br.players.sort((a, b) => b.roundTotal - a.roundTotal).map((p, i) => (
              <div key={p.playerId} className="flex-1 p-3 rounded-2xl text-center"
                style={{
                  background: i === 0 ? 'rgba(255,214,10,0.08)' : 'rgba(30,30,34,0.9)',
                  border: `1.5px solid ${i === 0 ? 'rgba(255,214,10,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  minWidth: 80,
                }}>
                <p className="text-xs font-bold" style={{ color: i === 0 ? '#ffd60a' : '#9a9b9e' }}>{p.playerName}</p>
                <p className="font-black text-2xl mt-1" style={{ color: i === 0 ? '#ffd60a' : '#fff' }}>+{p.roundTotal}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>جمع: {p.cumulativeTotal}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {br.players.map(p => (
              <button key={p.playerId} onClick={() => setBreakdownTab(p.playerId)}
                className="flex-1 py-2 rounded-xl text-xs font-black"
                style={{
                  background: breakdownTab === p.playerId ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)',
                  color: breakdownTab === p.playerId ? '#06b6d4' : '#6D6E71',
                  border: `1.5px solid ${breakdownTab === p.playerId ? '#06b6d455' : 'transparent'}`,
                  minWidth: 60,
                }}>
                {p.playerName}
              </button>
            ))}
          </div>

          {selectedPlayer && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-black" style={{ color: '#9a9b9e' }}>جزئیات — {selectedPlayer.playerName}:</p>
              {categories.map(cat => {
                const ar = selectedPlayer.answers[cat.id]
                if (!ar) return (
                  <div key={cat.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(26,26,28,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>{cat.emoji}</span>
                    <span className="font-bold text-sm flex-1" style={{ color: '#6D6E71' }}>{cat.label}</span>
                    <span className="text-xs" style={{ color: '#6D6E71' }}>— بدون جواب — ۰</span>
                  </div>
                )
                return (
                  <div key={cat.id} className="px-4 py-3 rounded-xl"
                    style={{
                      background: ar.score > 0 ? 'rgba(26,26,28,0.9)' : 'rgba(204,34,41,0.06)',
                      border: `1px solid ${ar.score > 0 ? 'rgba(255,255,255,0.07)' : 'rgba(204,34,41,0.2)'}`,
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span className="font-bold text-white text-sm">{cat.label}</span>
                      </div>
                      <span className="font-black text-sm" style={{ color: ar.score > 0 ? '#22c55e' : '#CC2229' }}>
                        {ar.score > 0 ? `+${ar.score}` : '۰'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-0.5">
                      {ar.scoreDetails.map((d, i) => (
                        <p key={i} className="text-xs" style={{ color: '#9a9b9e' }}>{d}</p>
                      ))}
                      <p className="text-xs font-bold mt-1" style={{ color: ar.score > 0 ? '#06b6d4' : '#CC2229' }}>
                        {ar.scoreReason}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div className="px-4 py-3 rounded-xl flex justify-between items-center"
                style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)' }}>
                <span className="font-bold text-white text-sm">جمع این دور</span>
                <span className="font-black text-lg" style={{ color: '#06b6d4' }}>+{selectedPlayer.roundTotal}</span>
              </div>
              <div className="px-4 py-3 rounded-xl flex justify-between items-center"
                style={{ background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.2)' }}>
                <span className="font-bold text-white text-sm">جمع کل</span>
                <span className="font-black text-lg" style={{ color: '#ffd60a' }}>{selectedPlayer.cumulativeTotal}</span>
              </div>
            </div>
          )}

          <div className="mt-2">
            <p className="text-xs font-black mb-2" style={{ color: '#9a9b9e' }}>جدول کلی:</p>
            {[...br.players].sort((a, b) => b.cumulativeTotal - a.cumulativeTotal).map((p, i) => (
              <div key={p.playerId} className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1.5"
                style={{
                  background: i === 0 ? 'rgba(255,214,10,0.06)' : 'rgba(26,26,28,0.8)',
                  border: `1px solid ${i === 0 ? 'rgba(255,214,10,0.2)' : 'rgba(255,255,255,0.05)'}`,
                }}>
                <span className="font-black text-xs w-5" style={{ color: i === 0 ? '#ffd60a' : '#6D6E71' }}>#{i + 1}</span>
                <span className="font-bold text-white text-sm flex-1">{p.playerName}</span>
                <span className="font-black text-sm" style={{ color: i === 0 ? '#ffd60a' : '#9a9b9e' }}>{p.cumulativeTotal}</span>
              </div>
            ))}
          </div>

          {isHost ? (
            <button onClick={hostNextRound}
              className="btn-game w-full py-4 rounded-2xl font-black text-white mt-2"
              style={{
                background: round < totalRounds
                  ? 'linear-gradient(135deg,#06b6d4,#0891b2)'
                  : 'linear-gradient(135deg,#ffd60a,#f59e0b)',
                color: round < totalRounds ? '#fff' : '#000',
                boxShadow: '0 6px 20px rgba(6,182,212,0.3)',
              }}>
              {round < totalRounds ? `دور بعدی (${round + 1}/${totalRounds}) ➜` : '🏆 نتایج نهایی'}
            </button>
          ) : (
            <p className="text-xs text-center" style={{ color: '#6D6E71' }}>میزبان دور بعدی را شروع می‌کند...</p>
          )}
        </div>
      </div>
    )
  }

  // ── RENDER: Game over ──────────────────────────────────────────────────────
  if (phase === 'game_over') {
    const sortedPlayers = [...(roundResults[roundResults.length - 1]?.players ?? [])].sort(
      (a, b) => b.cumulativeTotal - a.cumulativeTotal
    )

    return (
      <div className="h-full overflow-y-auto" dir="rtl">
        <div className="min-h-full flex flex-col items-center gap-6 px-4 py-8">
          <div className="text-6xl">{isGameTie ? '🤝' : '🏆'}</div>
          <div className="w-full rounded-3xl py-5 text-center"
            style={{ background: 'rgba(255,214,10,0.1)', border: '2px solid rgba(255,214,10,0.35)' }}>
            {isGameTie ? (
              <>
                <p className="text-sm font-bold" style={{ color: '#ffd60a' }}>بازی مساوی شد!</p>
                <p className="font-black text-white text-2xl mt-1">همه برنده هستید!</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold" style={{ color: '#ffd60a' }}>برنده بازی</p>
                <p className="font-black text-white text-2xl mt-1">{playerNames[gameWinner ?? ''] ?? '—'}</p>
                <p className="font-black text-2xl mt-1" style={{ color: '#ffd60a' }}>
                  {cumulativeScores[gameWinner ?? ''] ?? 0} امتیاز
                </p>
              </>
            )}
          </div>

          <div className="w-full max-w-sm">
            <p className="text-xs font-black mb-3" style={{ color: '#9a9b9e' }}>نتایج هر دور:</p>
            {roundResults.map(rr => (
              <div key={rr.round} className="mb-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(26,26,28,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#9a9b9e' }}>دور {rr.round} — حرف «{rr.letter}»</p>
                {[...rr.players].sort((a, b) => b.roundTotal - a.roundTotal).map((p, i) => (
                  <div key={p.playerId} className="flex items-center gap-2 py-1">
                    <span className="text-xs w-4" style={{ color: i === 0 ? '#ffd60a' : '#6D6E71' }}>#{i + 1}</span>
                    <span className="text-sm text-white flex-1">{p.playerName}</span>
                    <span className="text-xs font-black" style={{ color: '#06b6d4' }}>+{p.roundTotal}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="w-full max-w-sm">
            <p className="text-xs font-black mb-3" style={{ color: '#9a9b9e' }}>جدول نهایی:</p>
            {sortedPlayers.map((p, i) => (
              <div key={p.playerId} className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2"
                style={{
                  background: i === 0 ? 'rgba(255,214,10,0.08)' : 'rgba(26,26,28,0.8)',
                  border: `1px solid ${i === 0 ? 'rgba(255,214,10,0.3)' : 'rgba(255,255,255,0.05)'}`,
                }}>
                <span className="font-black text-sm" style={{ color: i === 0 ? '#ffd60a' : '#6D6E71' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </span>
                <span className="font-bold text-white text-sm flex-1">{p.playerName}</span>
                <span className="font-black text-base" style={{ color: i === 0 ? '#ffd60a' : '#9a9b9e' }}>
                  {p.cumulativeTotal}
                </span>
              </div>
            ))}
          </div>

          <button onClick={onExit}
            className="btn-game w-full max-w-sm py-4 rounded-2xl font-black text-white"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
            خروج
          </button>
        </div>
      </div>
    )
  }

  return null
}
