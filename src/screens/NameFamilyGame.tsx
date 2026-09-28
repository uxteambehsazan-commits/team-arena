// اسم‌فامیل — Standalone Game
// Modes: SINGLE_PLAYER_CPU | ONLINE_MULTIPLAYER
// NO single-device multiplayer.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  NF_CATEGORIES, PERSIAN_GAME_LETTERS, SCORE_RULES,
  validateAnswer, normalizePersian, getValidationMessage,
  generateCpuAnswers, getCpuResponseDelay, selectRandomLetter,
  scoreRound, determineWinner,
  ROUND_DURATION_MS, DEFAULT_TOTAL_ROUNDS,
  type NfMode, type NfDifficulty, type NfPhase, type NfSubmitState,
  type NfCategory, type NfPlayerRoundResult, type NfPublicState, type NfRoundResult,
} from '../lib/nameFamilyEngine'
import { supabase } from '../lib/supabase'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface LocalPlayer {
  id: string
  name: string
  isCpu: boolean
  difficulty?: NfDifficulty
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
  const [screen, setScreen] = useState<'mode_select' | 'cpu_setup' | 'online_setup' | 'online_join' | 'game'>('mode_select')
  const [mode, setMode] = useState<NfMode>('SINGLE_PLAYER_CPU')
  const [cpuDifficulty, setCpuDifficulty] = useState<NfDifficulty>('MEDIUM')
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [players, setPlayers] = useState<LocalPlayer[]>([])
  const [isHost, setIsHost] = useState(false)
  const [myId] = useState(() => genId())

  // ── Mode select ───────────────────────────────────────────────────────────
  if (screen === 'mode_select') {
    return (
      <div className="h-full flex flex-col" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-5 pb-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onExit} className="btn-game w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>←</button>
          <div>
            <h1 className="font-black text-white text-lg">اسم‌فامیل</h1>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>انتخاب حالت بازی</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
          <div className="text-6xl">🔤</div>
          <div className="w-full max-w-sm flex flex-col gap-4">
            <button
              onClick={() => setScreen('cpu_setup')}
              className="btn-game w-full p-5 rounded-3xl text-right"
              style={{ background: 'rgba(6,182,212,0.1)', border: '2px solid rgba(6,182,212,0.35)' }}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🤖</div>
                <div>
                  <p className="font-black text-white text-base">بازی تک‌نفره با CPU</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9a9b9e' }}>شما در برابر هوش مصنوعی بازی می‌کنید</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => { setMode('ONLINE_MULTIPLAYER'); setScreen('online_setup') }}
              className="btn-game w-full p-5 rounded-3xl text-right"
              style={{ background: 'rgba(124,58,237,0.1)', border: '2px solid rgba(124,58,237,0.35)' }}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🌐</div>
                <div>
                  <p className="font-black text-white text-base">بازی گروهی آنلاین</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9a9b9e' }}>هر بازیکن دستگاه مستقل خود را دارد</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── CPU setup ─────────────────────────────────────────────────────────────
  if (screen === 'cpu_setup') {
    return (
      <div className="h-full flex flex-col" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-5 pb-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => setScreen('mode_select')} className="btn-game w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>←</button>
          <h1 className="font-black text-white text-lg">تنظیمات بازی با CPU</h1>
        </div>
        <div className="flex-1 flex flex-col gap-5 px-5 py-6">
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
          <div>
            <label className="text-sm font-bold text-white block mb-3">سطح دشواری CPU</label>
            <div className="flex flex-col gap-2.5">
              {(['EASY', 'MEDIUM', 'HARD'] as NfDifficulty[]).map(d => {
                const meta = {
                  EASY: { label: 'آسان', desc: 'CPU جواب‌های کمتری می‌دهد و کندتر است', color: '#22c55e', icon: '😊' },
                  MEDIUM: { label: 'متوسط', desc: 'CPU سطح معقولی دارد', color: '#ffd60a', icon: '😐' },
                  HARD: { label: 'سخت', desc: 'CPU سریع و دقیق جواب می‌دهد', color: '#CC2229', icon: '😤' },
                }[d]
                return (
                  <button key={d} onClick={() => setCpuDifficulty(d)}
                    className="btn-game w-full p-4 rounded-2xl flex items-center gap-3 text-right"
                    style={{
                      background: cpuDifficulty === d ? `${meta.color}18` : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${cpuDifficulty === d ? meta.color + '66' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    <span className="text-2xl">{meta.icon}</span>
                    <div className="flex-1">
                      <p className="font-black text-white text-sm">{meta.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9a9b9e' }}>{meta.desc}</p>
                    </div>
                    {cpuDifficulty === d && <div className="w-4 h-4 rounded-full" style={{ background: meta.color }} />}
                  </button>
                )
              })}
            </div>
          </div>
          <button
            onClick={() => {
              if (!playerName.trim()) return
              const human: LocalPlayer = { id: myId, name: playerName.trim(), isCpu: false }
              const cpu: LocalPlayer = { id: 'cpu-1', name: 'CPU', isCpu: true, difficulty: cpuDifficulty }
              setPlayers([human, cpu])
              setMode('SINGLE_PLAYER_CPU')
              setIsHost(true)
              setScreen('game')
            }}
            disabled={!playerName.trim()}
            className="btn-game w-full py-4 rounded-2xl font-black text-white mt-auto"
            style={{
              background: playerName.trim() ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'rgba(255,255,255,0.05)',
              opacity: playerName.trim() ? 1 : 0.5,
              boxShadow: playerName.trim() ? '0 6px 20px rgba(6,182,212,0.35)' : 'none',
            }}>
            🚀 شروع بازی
          </button>
        </div>
      </div>
    )
  }

  // ── Online setup (host) ───────────────────────────────────────────────────
  if (screen === 'online_setup') {
    const code = useMemo(() => generateRoomCode(), [])
    return (
      <div className="h-full flex flex-col" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-5 pb-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => setScreen('mode_select')} className="btn-game w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>←</button>
          <h1 className="font-black text-white text-lg">ایجاد اتاق آنلاین</h1>
        </div>
        <div className="flex-1 flex flex-col gap-5 px-5 py-6">
          <div>
            <label className="text-sm font-bold text-white block mb-2">اسم شما</label>
            <input value={playerName} onChange={e => setPlayerName(e.target.value)}
              placeholder="نام خود را وارد کنید" dir="rtl" maxLength={20}
              className="w-full rounded-2xl px-4 py-3 text-white outline-none"
              style={{ background: '#1e1e20', border: '1.5px solid #2e2e32' }} />
          </div>
          <div className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1.5px solid rgba(124,58,237,0.3)' }}>
            <p className="text-xs mb-1" style={{ color: '#9a9b9e' }}>کد اتاق</p>
            <p className="font-black text-white text-3xl tracking-widest">{code}</p>
            <p className="text-xs mt-2" style={{ color: '#9a9b9e' }}>این کد را به دوستانت بده تا وارد شوند</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>
              ⚠️ بازی آنلاین: هر بازیکن باید دستگاه مستقل خود داشته باشد
            </p>
          </div>
          <button
            onClick={() => {
              if (!playerName.trim()) return
              const human: LocalPlayer = { id: myId, name: playerName.trim(), isCpu: false }
              setPlayers([human])
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
            🌐 ایجاد اتاق و انتظار
          </button>
          <button onClick={() => setScreen('online_join')}
            className="btn-game w-full py-3 rounded-2xl font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#9a9b9e' }}>
            یا با کد وارد شو
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
          <button onClick={() => setScreen('mode_select')} className="btn-game w-8 h-8 rounded-xl flex items-center justify-center"
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
              const human: LocalPlayer = { id: myId, name: playerName.trim(), isCpu: false }
              setPlayers([human])
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
  if (screen === 'game') {
    return (
      <NameFamilyGameSession
        mode={mode}
        myId={myId}
        myName={players.find(p => p.id === myId)?.name ?? 'بازیکن'}
        initialPlayers={players}
        isHost={isHost}
        roomCode={roomCode}
        onExit={onExit}
      />
    )
  }

  return null
}

// ─── GAME SESSION ─────────────────────────────────────────────────────────────

interface SessionProps {
  mode: NfMode
  myId: string
  myName: string
  initialPlayers: LocalPlayer[]
  isHost: boolean
  roomCode: string
  onExit: () => void
}

function NameFamilyGameSession({ mode, myId, myName, initialPlayers, isHost, roomCode, onExit }: SessionProps) {
  const categories = NF_CATEGORIES

  const [phase, setPhase] = useState<NfPhase>('lobby')
  const [onlinePlayers, setOnlinePlayers] = useState<LocalPlayer[]>(initialPlayers)
  const [letter, setLetter] = useState('')
  const [round, setRound] = useState(1)
  const [roundDeadline, setRoundDeadline] = useState(0)
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

  const totalRounds = DEFAULT_TOTAL_ROUNDS
  const isCpuMode = mode === 'SINGLE_PLAYER_CPU'

  const allAnswers = useRef<Record<string, Record<string, string>>>({})  // playerId -> catId -> answer
  const cpuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pubChRef = useRef<import('@supabase/supabase-js').RealtimeChannel | null>(null)
  const pubReadyRef = useRef(false)
  const seqRef = useRef(0)

  const players = isCpuMode ? initialPlayers : onlinePlayers

  const playerNames = useMemo(() => {
    const m: Record<string, string> = {}
    players.forEach(p => { m[p.id] = p.name })
    return m
  }, [players])

  // ── Online: subscribe to pub channel ────────────────────────────────────
  useEffect(() => {
    if (isCpuMode) return

    const ch = supabase.channel(`nf-${roomCode}`, {
      config: { broadcast: { self: false, ack: false }, presence: { key: myId } },
    })

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState<{ name: string; isCpu: boolean }>()
      const newPlayers: LocalPlayer[] = Object.entries(state).map(([pid, pArr]) => ({
        id: pid,
        name: (pArr[0] as any)?.name ?? pid,
        isCpu: false,
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
      await ch.track({ name: myName, isCpu: false })
    })

    pubChRef.current = ch
    return () => { supabase.removeChannel(ch); pubReadyRef.current = false; pubChRef.current = null }
  }, [isCpuMode, roomCode, myId, myName])

  function applyServerState(s: NfPublicState) {
    setPhase(s.phase)
    setLetter(s.letter)
    setRound(s.round)
    setRoundDeadline(s.roundDeadline)
    setSubmitStates(s.submitStates)
    setCumulativeScores(s.cumulativeScores)
    setRoundResults(s.roundResults)
    if (s.roundResults.length > 0 && (s.phase === 'score_breakdown' || s.phase === 'game_over')) {
      setCurrentBreakdown(s.roundResults[s.roundResults.length - 1])
    }
    if (s.phase === 'game_over') {
      setGameWinner(s.gameWinner)
      setIsGameTie(s.isGameTie)
    }
    if (s.phase === 'round_locked' || s.phase === 'score_breakdown') {
      setMySubmitState('SUBMITTED')
    }
  }

  // ── Broadcast state (host) ────────────────────────────────────────────────
  const broadcastState = useCallback(async (state: NfPublicState) => {
    if (isCpuMode) {
      applyServerState(state)
      return
    }
    const ch = pubChRef.current
    if (!ch || !pubReadyRef.current) return
    await ch.send({ type: 'broadcast', event: 'nf_state', payload: { state } }).catch(() => {})
  }, [isCpuMode])

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'round_playing' || !roundDeadline) return
    const tick = () => {
      const left = Math.max(0, Math.round((roundDeadline - Date.now()) / 1000))
      setTimeLeft(t => left !== t ? left : t)
    }
    tick()
    const id = setInterval(tick, 400)
    return () => clearInterval(id)
  }, [phase, roundDeadline])

  // ── Host: auto-end round on timer ─────────────────────────────────────────
  useEffect(() => {
    if (!isHost || phase !== 'round_playing' || !roundDeadline) return
    const delay = roundDeadline - Date.now()
    if (delay <= 0) { hostLockRound(); return }
    roundTimerRef.current = setTimeout(() => hostLockRound(), delay + 200)
    return () => { if (roundTimerRef.current) clearTimeout(roundTimerRef.current) }
  }, [phase, roundDeadline, isHost])

  // ── Host: start round ────────────────────────────────────────────────────
  const hostStartRound = useCallback(async (roundNum: number, cumScores: Record<string, number>, prevResults: NfRoundResult[]) => {
    const newLetter = selectRandomLetter(usedLetters)
    setUsedLetters(prev => [...prev, newLetter])
    setLetter(newLetter)
    setRound(roundNum)
    setMyAnswers({})
    setValidationErrors({})
    setMySubmitState('NOT_STARTED')
    allAnswers.current = {}

    const deadline = Date.now() + ROUND_DURATION_MS
    setRoundDeadline(deadline)

    const initSubmitStates: Record<string, NfSubmitState> = {}
    players.forEach(p => { initSubmitStates[p.id] = 'ANSWERING' })

    const s: NfPublicState = {
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
    }
    await broadcastState(s)

    // Schedule CPU answers if in CPU mode
    if (isCpuMode) {
      const cpuPlayer = players.find(p => p.isCpu)
      if (cpuPlayer) {
        const delay = getCpuResponseDelay(cpuPlayer.difficulty ?? 'MEDIUM')
        cpuTimerRef.current = setTimeout(() => {
          const humanAnswers: Record<string, string> = {}
          Object.values(allAnswers.current).forEach(ans => Object.assign(humanAnswers, ans))
          const cpuAns = generateCpuAnswers(newLetter, categories, cpuPlayer.difficulty ?? 'MEDIUM', humanAnswers)
          allAnswers.current[cpuPlayer.id] = cpuAns
          setSubmitStates(prev => ({ ...prev, [cpuPlayer.id]: 'SUBMITTED' }))
        }, Math.min(delay, ROUND_DURATION_MS - 2000))
      }
    }
  }, [players, usedLetters, categories, totalRounds, broadcastState, isCpuMode])

  // ── Host: lock round (timer expired or all submitted) ────────────────────
  const hostLockRound = useCallback(async () => {
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current)
    if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current)

    // Mark anyone not submitted as TIME_EXPIRED
    const finalSubmitStates = { ...submitStates }
    players.forEach(p => {
      if (finalSubmitStates[p.id] !== 'SUBMITTED') {
        finalSubmitStates[p.id] = 'TIME_EXPIRED'
        if (!allAnswers.current[p.id]) allAnswers.current[p.id] = {}
      }
    })

    // Make sure CPU answers are recorded
    const cpuPlayer = players.find(p => p.isCpu)
    if (cpuPlayer && !allAnswers.current[cpuPlayer.id]) {
      const cpuAns = generateCpuAnswers(letter, categories, cpuPlayer.difficulty ?? 'MEDIUM', {})
      allAnswers.current[cpuPlayer.id] = cpuAns
    }

    const s: NfPublicState = {
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
    }
    await broadcastState(s)

    // Score the round
    setTimeout(() => hostScoreRound(finalSubmitStates), 800)
  }, [players, submitStates, letter, round, totalRounds, roundDeadline, cumulativeScores, roundResults, categories, broadcastState])

  // ── Host: score round ─────────────────────────────────────────────────────
  const hostScoreRound = useCallback(async (finalSubmitStates: Record<string, NfSubmitState>) => {
    const result = scoreRound(letter, categories, allAnswers.current, playerNames)
    result.round = round

    // Update cumulative scores
    const newCumulative = { ...cumulativeScores }
    result.players.forEach(pr => {
      newCumulative[pr.playerId] = (newCumulative[pr.playerId] ?? 0) + pr.roundTotal
      pr.cumulativeTotal = newCumulative[pr.playerId]
    })

    // Determine round winner
    const roundScores: Record<string, number> = {}
    result.players.forEach(pr => { roundScores[pr.playerId] = pr.roundTotal })
    const { winner, isTie } = determineWinner(roundScores)
    result.winner = winner
    result.isTie = isTie

    const newResults = [...roundResults, result]
    setCurrentBreakdown(result)
    setCumulativeScores(newCumulative)
    setRoundResults(newResults)

    const s: NfPublicState = {
      phase: 'score_breakdown',
      round,
      totalRounds,
      letter,
      roundDeadline,
      categories,
      submitStates: finalSubmitStates,
      cumulativeScores: newCumulative,
      roundResults: newResults,
      gameWinner: null,
      isGameTie: false,
      seq: ++seqRef.current,
    }
    await broadcastState(s)
  }, [letter, categories, round, totalRounds, roundDeadline, cumulativeScores, roundResults, playerNames, broadcastState])

  // ── Host: next round or game over ─────────────────────────────────────────
  const hostNextRound = useCallback(async () => {
    const nextRound = round + 1
    if (nextRound > totalRounds) {
      // Game over
      const { winner, isTie, tiedPlayers } = determineWinner(cumulativeScores)
      setGameWinner(winner)
      setIsGameTie(isTie)

      const s: NfPublicState = {
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
      }
      await broadcastState(s)
    } else {
      await hostStartRound(nextRound, cumulativeScores, roundResults)
    }
  }, [round, totalRounds, cumulativeScores, letter, roundDeadline, submitStates, roundResults, categories, broadcastState, hostStartRound])

  // ── Player: type answer ───────────────────────────────────────────────────
  const typeAnswer = useCallback((catId: string, raw: string) => {
    if (mySubmitState === 'SUBMITTED' || mySubmitState === 'TIME_EXPIRED') return

    // Live validation: block invalid characters as they're typed
    const hasLatin = /[A-Za-z]/.test(raw)
    const hasDigits = /[0-9۰-۹٠-٩]/.test(raw)
    const hasSpecial = /[@#$%^&*()\-_=+\[\]{}|;':",./<>?\\`~!]/.test(raw)

    if (hasLatin) {
      setValidationErrors(prev => ({ ...prev, [catId]: 'لطفاً پاسخ را با حروف فارسی وارد کنید' }))
      return
    }
    if (hasDigits) {
      setValidationErrors(prev => ({ ...prev, [catId]: 'فقط حروف فارسی وارد کنید. اعداد مجاز نیستند' }))
      return
    }
    if (hasSpecial) {
      setValidationErrors(prev => ({ ...prev, [catId]: 'فقط حروف فارسی مجاز هستند' }))
      return
    }

    setValidationErrors(prev => ({ ...prev, [catId]: '' }))
    setMyAnswers(prev => ({ ...prev, [catId]: raw }))
    if (mySubmitState === 'NOT_STARTED') setMySubmitState('ANSWERING')
  }, [mySubmitState])

  // ── Player: submit answers ────────────────────────────────────────────────
  const submitAnswers = useCallback(async () => {
    if (mySubmitState === 'SUBMITTED') return

    // Validate all answers before submission
    const errors: Record<string, string> = {}
    let hasValidAnswer = false

    for (const cat of categories) {
      const raw = myAnswers[cat.id] ?? ''
      if (!raw.trim()) continue
      const v = validateAnswer(raw, letter)
      if (!v.valid) {
        errors[cat.id] = getValidationMessage(v)
      } else {
        hasValidAnswer = true
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Record my answers
    allAnswers.current[myId] = { ...myAnswers }
    setMySubmitState('SUBMITTED')

    const newStates = { ...submitStates, [myId]: 'SUBMITTED' as NfSubmitState }
    setSubmitStates(newStates)

    if (isCpuMode && isHost) {
      // Check if all players submitted
      const allSubmitted = players.every(p => newStates[p.id] === 'SUBMITTED' || newStates[p.id] === 'TIME_EXPIRED')
      if (allSubmitted) {
        if (roundTimerRef.current) clearTimeout(roundTimerRef.current)
        await hostLockRound()
      }
    } else if (!isCpuMode) {
      // Send submission to online channel
      const ch = pubChRef.current
      if (ch && pubReadyRef.current) {
        await ch.send({ type: 'broadcast', event: 'nf_submit', payload: { playerId: myId, answers: myAnswers } }).catch(() => {})
      }
    }
  }, [mySubmitState, myAnswers, letter, categories, myId, submitStates, players, isCpuMode, isHost, hostLockRound])

  // ── Online: receive submissions (host only) ────────────────────────────────
  useEffect(() => {
    if (isCpuMode || !isHost || !pubReadyRef.current) return
    const ch = pubChRef.current
    if (!ch) return
    ch.on('broadcast', { event: 'nf_submit' }, ({ payload }: any) => {
      const { playerId, answers } = payload as { playerId: string; answers: Record<string, string> }
      allAnswers.current[playerId] = answers
      setSubmitStates(prev => {
        const next = { ...prev, [playerId]: 'SUBMITTED' as NfSubmitState }
        // Check all submitted
        const nonHostPlayers = players.filter(p => !p.isCpu && p.id !== myId)
        const allDone = nonHostPlayers.every(p => next[p.id] === 'SUBMITTED')
        if (allDone && next[myId] === 'SUBMITTED') {
          if (roundTimerRef.current) clearTimeout(roundTimerRef.current)
          setTimeout(() => hostLockRound(), 300)
        }
        return next
      })
    })
  }, [isCpuMode, isHost, players, myId, hostLockRound])

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
            <p className="text-xs" style={{ color: '#9a9b9e' }}>
              {isCpuMode ? 'بازی با CPU' : `اتاق: ${roomCode}`}
            </p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5">
          {!isCpuMode && (
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCpuMode && (
            <div className="w-full max-w-xs">
              <div className="p-4 rounded-2xl mb-3" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)' }}>
                <p className="text-xs font-bold text-white mb-2">بازیکنان:</p>
                {players.map(p => (
                  <div key={p.id} className="flex items-center gap-2 py-1">
                    <span className="text-lg">{p.isCpu ? '🤖' : '👤'}</span>
                    <span className="text-sm text-white font-bold">{p.name}</span>
                    {p.isCpu && <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#9a9b9e' }}>
                      {p.difficulty === 'EASY' ? 'آسان' : p.difficulty === 'HARD' ? 'سخت' : 'متوسط'}
                    </span>}
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: '#9a9b9e' }}>
                <p className="font-bold text-white mb-1">قوانین امتیازدهی:</p>
                <p>✓ پاسخ یکتا: {SCORE_RULES.uniqueAnswer} امتیاز</p>
                <p>≈ پاسخ تکراری: {SCORE_RULES.duplicateAnswer} امتیاز</p>
                <p>✕ پاسخ نامعتبر: ۰ امتیاز</p>
              </div>
            </div>
          )}

          {isHost && (
            <button
              onClick={() => hostStartRound(1, {}, [])}
              className="btn-game px-8 py-4 rounded-2xl font-black text-white"
              style={{
                background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
                boxShadow: '0 6px 20px rgba(6,182,212,0.35)',
                opacity: (isCpuMode || players.length >= 2) ? 1 : 0.4,
              }}
              disabled={!isCpuMode && players.length < 2}>
              🚀 شروع بازی ({totalRounds} دور)
            </button>
          )}
          {!isHost && (
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
    const totalCount = players.length

    return (
      <div className="h-full flex flex-col overflow-hidden" dir="rtl">
        {/* Header */}
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
              <p className="text-xs" style={{ color: '#9a9b9e' }}>{submittedCount}/{totalCount} تموم کردن</p>
            </div>
          </div>
          <div className="text-center px-3 py-1.5 rounded-xl"
            style={{ background: timeLeft <= 10 ? 'rgba(204,34,41,0.15)' : 'rgba(255,255,255,0.06)' }}>
            <div className="font-black text-2xl" style={{ color: timeLeft <= 10 ? '#CC2229' : '#ffd60a', fontFamily: 'monospace' }}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Answers or waiting */}
        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
            <div className="text-5xl">⏳</div>
            <p className="font-black text-white text-lg">جواب‌هایت ثبت شد!</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {players.map(p => {
                const state = submitStates[p.id] ?? 'ANSWERING'
                return (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: 'rgba(30,30,34,0.9)', border: `1px solid ${state === 'SUBMITTED' ? '#22c55e33' : 'rgba(255,255,255,0.06)'}` }}>
                    <span className="text-sm">{p.isCpu ? '🤖' : '👤'}</span>
                    <span className="font-bold text-white text-sm flex-1">{p.name}</span>
                    <span style={{ color: state === 'SUBMITTED' ? '#22c55e' : '#6D6E71', fontSize: 12 }}>
                      {state === 'SUBMITTED' ? '✓ تموم' : state === 'TIME_EXPIRED' ? '⏰ تمام وقت' : '...'}
                    </span>
                  </div>
                )
              })}
            </div>
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
                        onPaste={e => {
                          e.preventDefault()
                          const text = e.clipboardData.getData('text')
                          typeAnswer(cat.id, text)
                        }}
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
                    {err && (
                      <p className="text-xs mt-1 mr-2 font-bold" style={{ color: '#CC2229' }}>⚠️ {err}</p>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={submitAnswers}
              className="btn-game w-full py-4 rounded-2xl font-black text-white mt-4"
              style={{
                background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
                boxShadow: '0 4px 20px rgba(6,182,212,0.35)',
              }}>
              ✓ ثبت جواب‌ها ({Object.values(myAnswers).filter(v => v.trim()).length}/{categories.length})
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── RENDER: Score breakdown ────────────────────────────────────────────────
  if (phase === 'score_breakdown' && currentBreakdown) {
    const br = currentBreakdown
    const selectedPlayer = br.players.find(p => p.playerId === breakdownTab) ?? br.players[0]

    return (
      <div className="h-full flex flex-col overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold" style={{ color: '#06b6d4' }}>دور {br.round} — حرف «{br.letter}»</p>
          <h2 className="font-black text-white text-lg mt-0.5">جدول امتیازات</h2>
          {br.isTie
            ? <p className="text-xs mt-1" style={{ color: '#ffd60a' }}>🤝 این دور مساوی شد!</p>
            : <p className="text-xs mt-1" style={{ color: '#22c55e' }}>🏆 برنده دور: {playerNames[br.winner ?? '']}</p>
          }
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
          {/* Round scores summary */}
          <div className="flex gap-2">
            {br.players.sort((a, b) => b.roundTotal - a.roundTotal).map((p, i) => (
              <div key={p.playerId} className="flex-1 p-3 rounded-2xl text-center"
                style={{
                  background: i === 0 ? 'rgba(255,214,10,0.08)' : 'rgba(30,30,34,0.9)',
                  border: `1.5px solid ${i === 0 ? 'rgba(255,214,10,0.3)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <p className="text-xs font-bold" style={{ color: i === 0 ? '#ffd60a' : '#9a9b9e' }}>{p.playerName}</p>
                <p className="font-black text-2xl mt-1" style={{ color: i === 0 ? '#ffd60a' : '#fff' }}>+{p.roundTotal}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>جمع: {p.cumulativeTotal}</p>
              </div>
            ))}
          </div>

          {/* Player selector tabs */}
          <div className="flex gap-1.5">
            {br.players.map(p => (
              <button key={p.playerId} onClick={() => setBreakdownTab(p.playerId)}
                className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
                style={{
                  background: breakdownTab === p.playerId ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)',
                  color: breakdownTab === p.playerId ? '#06b6d4' : '#6D6E71',
                  border: `1.5px solid ${breakdownTab === p.playerId ? '#06b6d455' : 'transparent'}`,
                }}>
                {p.playerName}
              </button>
            ))}
          </div>

          {/* Detailed breakdown for selected player */}
          {selectedPlayer && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-black" style={{ color: '#9a9b9e' }}>جزئیات امتیاز — {selectedPlayer.playerName}:</p>
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

          {/* Cumulative leaderboard */}
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

          {isHost && (
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
          )}
          {!isHost && (
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
            style={{
              background: isGameTie ? 'rgba(255,214,10,0.08)' : 'rgba(255,214,10,0.1)',
              border: `2px solid rgba(255,214,10,0.35)`,
            }}>
            {isGameTie ? (
              <>
                <p className="text-sm font-bold" style={{ color: '#ffd60a' }}>بازی مساوی شد!</p>
                <p className="font-black text-white text-2xl mt-1">هر دو برنده هستید!</p>
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

          {/* Per-round breakdown */}
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

          {/* Final leaderboard */}
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
