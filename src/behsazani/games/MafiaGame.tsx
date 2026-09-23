import { useState, useEffect, useRef, useCallback } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'
import { supabase } from '../../lib/supabase'
import { usePrivateChannel } from '../../lib/multiplayer/usePrivateChannel'

type Role = 'citizen' | 'mafia' | 'mafia_boss' | 'detective' | 'doctor'
type GamePhase =
  | 'waiting_role'
  | 'role_reveal'
  | 'night'
  | 'mafia_action' | 'detective_action' | 'doctor_action'
  | 'day' | 'voting' | 'elimination' | 'result'

interface MafiaPlayer extends BehsazaniPlayer {
  role: Role
  alive: boolean
  savedThisNight: boolean
  investigatedThisNight: boolean
}

const ROLE_LABELS: Record<Role, { label: string; emoji: string; color: string; team: 'citizens' | 'mafia' }> = {
  citizen:     { label: 'شهروند',     emoji: '👤', color: '#22c55e', team: 'citizens' },
  mafia:       { label: 'مافیا',       emoji: '🔫', color: '#CC2229', team: 'mafia' },
  mafia_boss:  { label: 'رئیس مافیا', emoji: '👑', color: '#ef4444', team: 'mafia' },
  detective:   { label: 'کارآگاه',    emoji: '🔍', color: '#3b82f6', team: 'citizens' },
  doctor:      { label: 'دکتر',        emoji: '🏥', color: '#a855f7', team: 'citizens' },
}

function buildRoles(players: BehsazaniPlayer[]): MafiaPlayer[] {
  const n = players.length
  const roles: Role[] = []
  const mafiaCount = n <= 5 ? 1 : n <= 8 ? 2 : 3
  roles.push('mafia_boss')
  for (let i = 1; i < mafiaCount; i++) roles.push('mafia')
  roles.push('detective')
  if (n >= 6) roles.push('doctor')
  while (roles.length < n) roles.push('citizen')
  const shuffled = [...roles].sort(() => Math.random() - 0.5)
  return players.map((p, i) => ({
    ...p, role: shuffled[i], alive: true,
    savedThisNight: false, investigatedThisNight: false,
  }))
}

function checkWin(players: MafiaPlayer[]): 'mafia' | 'citizens' | null {
  const alive = players.filter(p => p.alive)
  const aliveMafia = alive.filter(p => ROLE_LABELS[p.role].team === 'mafia')
  const aliveCitizens = alive.filter(p => ROLE_LABELS[p.role].team === 'citizens')
  if (aliveMafia.length === 0) return 'citizens'
  if (aliveMafia.length >= aliveCitizens.length) return 'mafia'
  return null
}

interface MafiaPublicState {
  phase: GamePhase
  dayNum: number
  alivePlayers: { id: string; name: string }[]
  nightKilledName: string | null
  eliminatedId: string | null
  eliminatedRole: string | null
  winner: 'mafia' | 'citizens' | null
  votes: Record<string, string>
  nightActionsIn: { mafia: boolean; detective: boolean; doctor: boolean }
  revealedRoles?: { id: string; name: string; role: string; emoji: string; color: string; alive: boolean }[]
}

interface Props {
  players: BehsazaniPlayer[]
  myPlayer: BehsazaniPlayer
  isHost: boolean
  isOnline: boolean
  roomCode?: string
  hostPlayerId?: string
  onExit: () => void
}

export default function MafiaGame({ players, myPlayer, isHost, isOnline, roomCode, hostPlayerId, onExit }: Props) {

  // ── Local state (shared by local and online mode) ───────────────────────
  const [mafia, setMafia] = useState<MafiaPlayer[]>(() => buildRoles(players))
  const [phase, setPhase] = useState<GamePhase>(isOnline ? 'waiting_role' : 'role_reveal')
  const [revealIdx, setRevealIdx] = useState(0)
  const [revealingRole, setRevealingRole] = useState(false)
  const [nightTarget, setNightTarget] = useState<string | null>(null)
  const [savedTarget, setSavedTarget] = useState<string | null>(null)
  const [investigateTarget, setInvestigateTarget] = useState<string | null>(null)
  const [investigateResult, setInvestigateResult] = useState<string | null>(null)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [eliminated, setEliminated] = useState<MafiaPlayer | null>(null)
  const [nightKilled, setNightKilled] = useState<MafiaPlayer | null>(null)
  const [winner, setWinner] = useState<'mafia' | 'citizens' | null>(null)
  const [dayNum, setDayNum] = useState(1)
  const [chat, setChat] = useState<string[]>([])
  const [chatInput, setChatInput] = useState('')
  const [currentVoter, setCurrentVoter] = useState(0)
  const chatRef = useRef<HTMLDivElement>(null)

  // ── Online-mode additional state ────────────────────────────────────────
  const [myRole, setMyRole] = useState<Role | null>(null)
  const [myMafiaTeam, setMyMafiaTeam] = useState<string[]>([]) // names of other mafia members
  const [pubState, setPubState] = useState<MafiaPublicState | null>(null)
  const [myVote, setMyVote] = useState<string | null>(null)
  const [nightActionSent, setNightActionSent] = useState(false)
  const [detectiveResult, setDetectiveResult] = useState<{ name: string; result: string } | null>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chat])

  // ── Host: night action tracking (online) ────────────────────────────────
  const nightActionsRef = useRef<{
    mafiaTarget?: string
    doctorSave?: string
    detectiveTarget?: string
  }>({})

  // ── Private channel: receive role + detective results ───────────────────
  const { sendPrivate } = usePrivateChannel(
    roomCode ?? '',
    myPlayer.id,
    useCallback((msg) => {
      if (msg.type === 'mafia_role') {
        const d = msg.data as { role: Role; mafiaTeam?: string[] }
        setMyRole(d.role)
        setMyMafiaTeam(d.mafiaTeam ?? [])
        setPhase('role_reveal')
      }
      if (msg.type === 'detective_result') {
        const d = msg.data as { name: string; result: string }
        setDetectiveResult(d)
      }
    }, []),
  )

  // ── Host: subscribe to host-actions channel (online) ───────────────────
  useEffect(() => {
    if (!isOnline || !isHost || !roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-mafia-actions`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'night_action' }, ({ payload }: any) => {
      const { type, targetId, fromId } = payload
      if (type === 'mafia_kill')      nightActionsRef.current.mafiaTarget = targetId
      if (type === 'doctor_save')     nightActionsRef.current.doctorSave = targetId
      if (type === 'detective_check') {
        nightActionsRef.current.detectiveTarget = targetId
        // Send detective result privately
        const target = mafia.find(p => p.id === targetId)
        if (target) {
          const r = ROLE_LABELS[target.role]
          sendPrivate(fromId, {
            type: 'detective_result',
            data: {
              name: target.name,
              result: r.team === 'mafia' ? `${r.emoji} ${r.label} — مافیاست!` : `${r.emoji} شهروند است`,
            },
          })
        }
      }
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, isHost, roomCode])

  // ── Public broadcast channel (online) ───────────────────────────────────
  useEffect(() => {
    if (!isOnline || !roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-mafia-pub`, {
      config: { broadcast: { self: true, ack: false } },
    })
    ch.on('broadcast', { event: 'mafia_state' }, ({ payload }: any) => {
      if (payload?.state) {
        const s = payload.state as MafiaPublicState
        setPubState(s)
        setPhase(s.phase)
        setDayNum(s.dayNum)
        setVotes(s.votes)
        if (s.winner) setWinner(s.winner)
      }
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [isOnline, roomCode])

  const broadcastPub = useCallback(async (state: MafiaPublicState) => {
    if (!roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-mafia-pub`, {
      config: { broadcast: { self: true, ack: false } },
    })
    await ch.send({ type: 'broadcast', event: 'mafia_state', payload: { state } }).catch(() => {})
  }, [roomCode])

  const sendNightAction = useCallback(async (type: string, targetId: string) => {
    if (!roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-mafia-actions`, {
      config: { broadcast: { self: false, ack: false } },
    })
    await new Promise<void>(res => {
      ch.subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await ch.send({
            type: 'broadcast', event: 'night_action',
            payload: { type, targetId, fromId: myPlayer.id },
          }).catch(() => {})
          await supabase.removeChannel(ch)
          res()
        }
      })
    })
    setNightActionSent(true)
  }, [roomCode, myPlayer.id])

  // ── Host: assign roles on mount (online) ────────────────────────────────
  useEffect(() => {
    if (!isOnline || !isHost || !roomCode) return
    const assigned = buildRoles(players)
    setMafia(assigned)
    const mafiaIds = assigned.filter(p => ROLE_LABELS[p.role].team === 'mafia').map(p => p.id)
    const mafiaNames = assigned.filter(p => ROLE_LABELS[p.role].team === 'mafia').map(p => p.name)

    async function assign() {
      for (const p of assigned) {
        const isMafia = ROLE_LABELS[p.role].team === 'mafia'
        await sendPrivate(p.id, {
          type: 'mafia_role',
          data: {
            role: p.role,
            mafiaTeam: isMafia ? mafiaNames.filter(n => n !== p.name) : undefined,
          },
        })
      }
      const aliveList = assigned.map(p => ({ id: p.id, name: p.name }))
      const initPub: MafiaPublicState = {
        phase: 'night',
        dayNum: 1,
        alivePlayers: aliveList,
        nightKilledName: null,
        eliminatedId: null,
        eliminatedRole: null,
        winner: null,
        votes: {},
        nightActionsIn: { mafia: false, detective: false, doctor: false },
      }
      await broadcastPub(initPub)
    }
    assign()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, isHost, roomCode])

  // ─── HOST: Resolve Night ─────────────────────────────────────────────────
  async function resolveNight() {
    if (!pubState) return
    const { mafiaTarget, doctorSave, detectiveTarget } = nightActionsRef.current
    let updated = [...mafia]
    let killed: MafiaPlayer | null = null

    if (mafiaTarget && mafiaTarget !== doctorSave) {
      const idx = updated.findIndex(p => p.id === mafiaTarget)
      if (idx !== -1 && updated[idx].alive) {
        updated[idx] = { ...updated[idx], alive: false }
        killed = updated[idx]
      }
    }

    setMafia(updated)
    setNightKilled(killed)
    nightActionsRef.current = {}

    const win = checkWin(updated)
    const aliveList = updated.filter(p => p.alive).map(p => ({ id: p.id, name: p.name }))
    const newState: MafiaPublicState = {
      ...pubState,
      phase: win ? 'result' : 'day',
      alivePlayers: aliveList,
      nightKilledName: killed?.name ?? null,
      winner: win,
      votes: {},
      nightActionsIn: { mafia: false, detective: false, doctor: false },
      revealedRoles: win ? updated.map(p => ({
        id: p.id, name: p.name, role: p.role,
        emoji: ROLE_LABELS[p.role].emoji, color: ROLE_LABELS[p.role].color, alive: p.alive,
      })) : undefined,
    }
    await broadcastPub(newState)
  }

  // ─── ONLINE MODE ─────────────────────────────────────────────────────────
  if (isOnline) {
    const pub = pubState
    const aliveNames = pub?.alivePlayers ?? players.map(p => ({ id: p.id, name: p.name }))
    const iAmAlive = aliveNames.some(p => p.id === myPlayer.id)
    const myRoleInfo = myRole ? ROLE_LABELS[myRole] : null

    if (phase === 'waiting_role') return (
      <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
        <div className="text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>🎭</div>
        <p className="font-black text-white text-xl">در حال دریافت نقش...</p>
        <p className="text-xs" style={{ color: '#9a9b9e' }}>میزبان نقش‌ها را تعیین می‌کند</p>
      </div>
    )

    if (phase === 'role_reveal' && myRoleInfo) return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <p className="font-black text-white text-lg">نقش شما، {myPlayer.name}:</p>
        <div className="w-48 h-48 rounded-3xl flex flex-col items-center justify-center gap-3 border-2"
          style={{ background: `${myRoleInfo.color}22`, borderColor: myRoleInfo.color, boxShadow: `0 0 32px ${myRoleInfo.color}44` }}>
          <span style={{ fontSize: 52 }}>{myRoleInfo.emoji}</span>
          <span className="font-black text-2xl" style={{ color: myRoleInfo.color }}>{myRoleInfo.label}</span>
        </div>
        {myRole === 'mafia' && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>تو مافیا هستی — در شب هدف را انتخاب کن</p>}
        {myRole === 'mafia_boss' && (
          <>
            <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>تو رئیس مافیا هستی — در شب هدف را انتخاب کن</p>
            {myMafiaTeam.length > 0 && (
              <p className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(204,34,41,0.15)', color: '#CC2229' }}>
                اعضای مافیا: {myMafiaTeam.join('، ')}
              </p>
            )}
          </>
        )}
        {myRole === 'detective' && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>تو کارآگاه هستی — هر شب یک نفر را بررسی کن</p>}
        {myRole === 'doctor' && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>تو دکتر هستی — هر شب یک نفر را نجات بده</p>}
        <p className="text-xs text-center" style={{ color: '#6D6E71' }}>این اطلاعات فقط برای شماست — به دیگران نشان ندهید</p>
        <button onClick={() => { if (pub) setPhase(pub.phase); else setPhase('night') }}
          className="btn-game px-8 py-4 rounded-2xl font-black text-lg text-white"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
          متوجه شدم — شروع بازی
        </button>
      </div>
    )

    if (!pub) return (
      <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
        <div className="text-4xl animate-pulse">⏳</div>
        <p className="font-black text-white">در حال همگام‌سازی...</p>
      </div>
    )

    if (pub.phase === 'night') {
      const isMafiaPlayer = myRole === 'mafia' || myRole === 'mafia_boss'

      return (
        <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
          <div className="text-6xl" style={{ filter: 'drop-shadow(0 0 20px #3b82f6)' }}>🌙</div>
          <h2 className="font-black text-white text-2xl">شب {pub.dayNum}</h2>
          <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>
            {nightActionSent ? 'اقدام شب شما ثبت شد — منتظر بمانید' : 'اقدام شبانه خود را انجام دهید'}
          </p>

          {!nightActionSent && iAmAlive && (
            <div className="w-full max-w-xs flex flex-col gap-2">
              {isMafiaPlayer && (
                <>
                  <p className="text-xs font-bold text-center" style={{ color: '#CC2229' }}>هدف مافیا را انتخاب کن:</p>
                  {pub.alivePlayers.filter(p => !mafia.find(m => m.id === p.id && ROLE_LABELS[m.role].team === 'mafia')).map(p => (
                    <button key={p.id} onClick={() => sendNightAction('mafia_kill', p.id)}
                      className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
                      style={{ background: 'rgba(204,34,41,0.2)', border: '1.5px solid rgba(204,34,41,0.4)' }}>
                      <span>👤</span><span>{p.name}</span>
                    </button>
                  ))}
                </>
              )}
              {myRole === 'detective' && (
                <>
                  <p className="text-xs font-bold text-center" style={{ color: '#3b82f6' }}>بررسی کارآگاه:</p>
                  {pub.alivePlayers.filter(p => p.id !== myPlayer.id).map(p => (
                    <button key={p.id} onClick={() => sendNightAction('detective_check', p.id)}
                      className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
                      style={{ background: 'rgba(59,130,246,0.2)', border: '1.5px solid rgba(59,130,246,0.4)' }}>
                      <span>👤</span><span>{p.name}</span>
                    </button>
                  ))}
                </>
              )}
              {myRole === 'doctor' && (
                <>
                  <p className="text-xs font-bold text-center" style={{ color: '#a855f7' }}>نجات دکتر:</p>
                  {pub.alivePlayers.map(p => (
                    <button key={p.id} onClick={() => sendNightAction('doctor_save', p.id)}
                      className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
                      style={{ background: 'rgba(168,85,247,0.2)', border: '1.5px solid rgba(168,85,247,0.4)' }}>
                      <span>👤</span><span>{p.name}</span>
                    </button>
                  ))}
                </>
              )}
              {myRole === 'citizen' && (
                <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>تو شهروند هستی — شب را صبر کن</p>
              )}
            </div>
          )}

          {detectiveResult && myRole === 'detective' && (
            <div className="px-6 py-4 rounded-2xl text-center"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1.5px solid #3b82f6' }}>
              <p className="font-black text-white">{detectiveResult.name}</p>
              <p className="text-sm mt-1" style={{ color: '#93c5fd' }}>{detectiveResult.result}</p>
            </div>
          )}

          {isHost && (
            <button onClick={resolveNight}
              className="btn-game px-8 py-3 rounded-2xl font-black text-white text-sm mt-2"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              ☀️ صبح شد — اعلام نتیجه
            </button>
          )}
        </div>
      )
    }

    if (pub.phase === 'day') {
      return (
        <div className="h-full flex flex-col" dir="rtl">
          <div className="flex-shrink-0 px-4 pt-4 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="font-black text-white text-lg">☀️ روز {pub.dayNum} — گفتگو</h2>
            {pub.nightKilledName
              ? <p className="text-xs mt-0.5" style={{ color: '#CC2229' }}>🔴 دیشب {pub.nightKilledName} حذف شد</p>
              : <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>💚 دیشب کسی حذف نشد</p>}
            <p className="text-xs mt-0.5" style={{ color: '#9a9b9e' }}>زنده: {pub.alivePlayers.length}</p>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1.5" style={{ minHeight: 0 }}>
            {chat.length === 0 && <p className="text-center text-xs mt-4" style={{ color: '#6D6E71' }}>گفتگو را شروع کنید...</p>}
            {chat.map((msg, i) => (
              <div key={i} className="px-3 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'rgba(30,30,34,0.8)' }}>{msg}</div>
            ))}
          </div>
          <div className="flex-shrink-0 px-4 py-2 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (() => { if (chatInput.trim()) { setChat(p => [...p, `${myPlayer.name}: ${chatInput.trim()}`]); setChatInput('') } })()}
              placeholder="پیام بنویس..."
              className="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.1)', outline: 'none' }} />
            <button onClick={() => { if (chatInput.trim()) { setChat(p => [...p, `${myPlayer.name}: ${chatInput.trim()}`]); setChatInput('') } }}
              className="btn-game px-3 py-2 rounded-xl font-black text-white text-sm"
              style={{ background: '#CC2229' }}>ارسال</button>
          </div>
          {isHost && (
            <div className="flex-shrink-0 px-4 pb-4">
              <button onClick={async () => {
                const newState: MafiaPublicState = { ...pub, phase: 'voting', votes: {} }
                await broadcastPub(newState)
              }}
                className="btn-game w-full py-3 rounded-2xl font-black text-white"
                style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
                🗳️ شروع رأی‌گیری
              </button>
            </div>
          )}
          {!isHost && (
            <p className="text-xs text-center py-3" style={{ color: '#6D6E71' }}>میزبان رأی‌گیری را شروع می‌کند</p>
          )}
        </div>
      )
    }

    if (pub.phase === 'voting') {
      const allVoted = Object.keys(pub.votes).length >= pub.alivePlayers.length
      const alreadyVoted = pub.votes[myPlayer.id]

      if (!allVoted && !alreadyVoted && iAmAlive) {
        return (
          <div className="h-full flex flex-col gap-4 px-6 py-8" dir="rtl">
            <div className="text-center">
              <div className="text-4xl mb-2">🗳️</div>
              <h2 className="font-black text-white text-xl">رأی خود را بدهید</h2>
            </div>
            <div className="flex flex-col gap-2">
              {pub.alivePlayers.filter(p => p.id !== myPlayer.id).map(p => (
                <button key={p.id} onClick={async () => {
                  setMyVote(p.id)
                  const newVotes = { ...pub.votes, [myPlayer.id]: p.id }
                  await broadcastPub({ ...pub, votes: newVotes })
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

      if (!allVoted) return (
        <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
          <div className="text-5xl">✅</div>
          <p className="font-black text-white text-xl">رأی شما ثبت شد</p>
          <p className="text-sm font-bold" style={{ color: '#ffd60a' }}>
            {Object.keys(pub.votes).length} از {pub.alivePlayers.length} رأی
          </p>
        </div>
      )

      // all voted — show tally
      const tally: Record<string, number> = {}
      Object.values(pub.votes).forEach(v => { tally[v] = (tally[v] || 0) + 1 })
      const maxV = Math.max(...Object.values(tally), 0)
      const topIds = Object.keys(tally).filter(id => tally[id] === maxV)
      const elimId = topIds.length === 1 ? topIds[0] : null
      const elimName = elimId ? pub.alivePlayers.find(p => p.id === elimId)?.name : null

      return (
        <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
          <h2 className="font-black text-white text-xl">نتیجه رأی‌گیری</h2>
          <div className="w-full max-w-xs flex flex-col gap-2">
            {pub.alivePlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2 rounded-xl"
                style={{ background: 'rgba(30,30,34,0.8)', border: p.id === elimId ? '1.5px solid #CC2229' : 'none' }}>
                <span className="font-bold text-white text-sm">{p.name}</span>
                <span className="font-black text-sm" style={{ color: '#CC2229' }}>{tally[p.id] || 0} رأی</span>
              </div>
            ))}
          </div>
          {elimName
            ? <p className="font-black text-lg text-center" style={{ color: '#CC2229' }}>{elimName} متهم است</p>
            : <p className="font-black text-lg text-center" style={{ color: '#ffd60a' }}>تساوی — کسی حذف نشد</p>}
          {isHost && (
            <button onClick={async () => {
              const elimPlayer = elimId ? mafia.find(p => p.id === elimId) : null
              let updated = [...mafia]
              if (elimPlayer) updated = mafia.map(p => p.id === elimId ? { ...p, alive: false } : p)
              setMafia(updated)
              const win = checkWin(updated)
              const aliveList = updated.filter(p => p.alive).map(p => ({ id: p.id, name: p.name }))
              const newState: MafiaPublicState = {
                ...pub,
                phase: win ? 'result' : 'elimination',
                alivePlayers: aliveList,
                eliminatedId: elimId ?? null,
                eliminatedRole: elimPlayer ? elimPlayer.role : null,
                winner: win,
                nightActionsIn: { mafia: false, detective: false, doctor: false },
                revealedRoles: win ? updated.map(p => ({
                  id: p.id, name: p.name, role: p.role,
                  emoji: ROLE_LABELS[p.role].emoji, color: ROLE_LABELS[p.role].color, alive: p.alive,
                })) : undefined,
              }
              await broadcastPub(newState)
            }}
              className="btn-game px-8 py-4 rounded-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
              {elimName ? `حذف ${elimName}` : 'ادامه بازی'}
            </button>
          )}
        </div>
      )
    }

    if (pub.phase === 'elimination') {
      const elimName = pub.eliminatedId ? pub.alivePlayers.find(p => p.id === pub.eliminatedId)?.name
        ?? players.find(p => p.id === pub.eliminatedId)?.name : null
      const elimRole = pub.eliminatedRole ? ROLE_LABELS[pub.eliminatedRole as Role] : null
      return (
        <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
          <div className="text-6xl">⚰️</div>
          {elimName ? (
            <>
              <h2 className="font-black text-white text-2xl text-center">{elimName} حذف شد</h2>
              {elimRole && (
                <div className="px-6 py-4 rounded-2xl text-center"
                  style={{ background: `${elimRole.color}22`, border: `1.5px solid ${elimRole.color}` }}>
                  <p className="text-3xl">{elimRole.emoji}</p>
                  <p className="font-black text-lg mt-1" style={{ color: elimRole.color }}>{elimRole.label}</p>
                </div>
              )}
            </>
          ) : <h2 className="font-black text-white text-2xl text-center">کسی حذف نشد</h2>}
          {isHost && (
            <button onClick={async () => {
              const newState: MafiaPublicState = {
                ...pub, phase: 'night', dayNum: pub.dayNum + 1,
                eliminatedId: null, eliminatedRole: null, nightKilledName: null,
                nightActionsIn: { mafia: false, detective: false, doctor: false }, votes: {},
              }
              setNightActionSent(false)
              setDetectiveResult(null)
              await broadcastPub(newState)
            }}
              className="btn-game px-8 py-4 rounded-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              🌙 شب بعدی
            </button>
          )}
          {!isHost && <p className="text-sm" style={{ color: '#9a9b9e' }}>میزبان شب بعد را شروع می‌کند...</p>}
        </div>
      )
    }

    if (pub.phase === 'result') {
      return (
        <div className="h-full overflow-y-auto" dir="rtl">
        <div className="min-h-full flex flex-col items-center justify-center gap-6 px-6 py-8">
          <div className="text-7xl">{pub.winner === 'citizens' ? '🏆' : '💀'}</div>
          <h2 className="font-black text-white text-3xl text-center">
            {pub.winner === 'citizens' ? 'شهروندان بردند!' : 'مافیا برد!'}
          </h2>
          {myRoleInfo && (
            <div className="px-4 py-3 rounded-2xl text-center"
              style={{ background: `${myRoleInfo.color}22`, border: `1px solid ${myRoleInfo.color}44` }}>
              <p className="text-xs" style={{ color: '#9a9b9e' }}>نقش شما:</p>
              <p className="font-black text-lg" style={{ color: myRoleInfo.color }}>{myRoleInfo.emoji} {myRoleInfo.label}</p>
            </div>
          )}
          {pub.revealedRoles && (
            <div className="w-full max-w-xs flex flex-col gap-2">
              <p className="text-center text-sm font-bold mb-1" style={{ color: '#9a9b9e' }}>نقش‌های همه:</p>
              {pub.revealedRoles.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(30,30,34,0.8)', border: `1px solid ${p.color}44`, opacity: p.alive ? 1 : 0.5 }}>
                  <span className="text-xl">{p.emoji}</span>
                  <span className="font-bold text-white text-sm flex-1">{p.name}</span>
                  <span className="text-xs font-bold" style={{ color: p.color }}>{ROLE_LABELS[p.role as Role]?.label}</span>
                  {!p.alive && <span className="text-xs" style={{ color: '#6D6E71' }}>حذف‌شده</span>}
                </div>
              ))}
            </div>
          )}
          <button onClick={onExit}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
            خروج
          </button>
        </div>
        </div>
      )
    }

    return null
  }

  // ─── LOCAL (PASS-THE-PHONE) MODE ─────────────────────────────────────────
  const alivePlayers = mafia.filter(p => p.alive)
  const aliveMafia = alivePlayers.filter(p => ROLE_LABELS[p.role].team === 'mafia')
  const aliveDetective = alivePlayers.find(p => p.role === 'detective')
  const aliveDoctor = alivePlayers.find(p => p.role === 'doctor')
  const currentPlayer = mafia[revealIdx]

  if (phase === 'role_reveal') {
    if (!revealingRole) return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-6xl">🎭</div>
        <h2 className="font-black text-white text-2xl text-center">نقش‌ها تعیین شدند</h2>
        <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>
          گوشی را به <span style={{ color: '#ffd60a' }}>{currentPlayer?.name}</span> بده
        </p>
        <button onClick={() => setRevealingRole(true)}
          className="btn-game px-8 py-4 rounded-2xl font-black text-lg text-white"
          style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
          نمایش نقش من
        </button>
      </div>
    )
    const role = ROLE_LABELS[currentPlayer.role]
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <p className="text-sm font-bold" style={{ color: '#9a9b9e' }}>نقش {currentPlayer.name}:</p>
        <div className="w-40 h-40 rounded-3xl flex flex-col items-center justify-center gap-3 border-2"
          style={{ background: `${role.color}22`, borderColor: role.color, boxShadow: `0 0 32px ${role.color}44` }}>
          <span style={{ fontSize: 52 }}>{role.emoji}</span>
          <span className="font-black text-xl" style={{ color: role.color }}>{role.label}</span>
        </div>
        {currentPlayer.role === 'mafia_boss' && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>رئیس مافیا — در شب هدف را انتخاب کن</p>}
        {currentPlayer.role === 'detective' && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>کارآگاه — هر شب یک نفر را بررسی کن</p>}
        {currentPlayer.role === 'doctor' && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>دکتر — هر شب یک نفر را نجات بده</p>}
        <button onClick={() => {
          setRevealingRole(false)
          if (revealIdx + 1 < mafia.length) setRevealIdx(revealIdx + 1)
          else setPhase('night')
        }}
          className="btn-game px-8 py-4 rounded-2xl font-black text-lg text-white"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
          {revealIdx + 1 < mafia.length ? `نوبت ${mafia[revealIdx + 1]?.name}` : 'شروع بازی 🌙'}
        </button>
      </div>
    )
  }

  if (phase === 'night') return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <div className="text-6xl" style={{ filter: 'drop-shadow(0 0 20px #3b82f6)' }}>🌙</div>
      <h2 className="font-black text-white text-2xl">شب {dayNum}</h2>
      <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>همه چشم‌ها بسته — نوبت اقدام شبانه</p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button onClick={() => setPhase('mafia_action')}
          className="btn-game px-6 py-3.5 rounded-2xl font-black text-white text-sm"
          style={{ background: 'rgba(204,34,41,0.2)', border: '1.5px solid #CC2229' }}>
          🔫 گوشی را به مافیا بده
        </button>
        {aliveDetective && (
          <button onClick={() => setPhase('detective_action')}
            className="btn-game px-6 py-3.5 rounded-2xl font-black text-white text-sm"
            style={{ background: 'rgba(59,130,246,0.2)', border: '1.5px solid #3b82f6' }}>
            🔍 گوشی را به کارآگاه بده
          </button>
        )}
        {aliveDoctor && (
          <button onClick={() => setPhase('doctor_action')}
            className="btn-game px-6 py-3.5 rounded-2xl font-black text-white text-sm"
            style={{ background: 'rgba(168,85,247,0.2)', border: '1.5px solid #a855f7' }}>
            🏥 گوشی را به دکتر بده
          </button>
        )}
        <button onClick={localResolveNight}
          className="btn-game px-6 py-3.5 rounded-2xl font-black text-white text-sm mt-2"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
          ☀️ صبح شد — نتیجه شب
        </button>
      </div>
    </div>
  )

  function localResolveNight() {
    let updated = mafia.map(p => ({ ...p, savedThisNight: p.id === savedTarget }))
    let killed: MafiaPlayer | null = null
    if (nightTarget) {
      const target = updated.find(p => p.id === nightTarget)
      if (target && !target.savedThisNight) {
        updated = updated.map(p => p.id === nightTarget ? { ...p, alive: false } : p)
        killed = target
      }
    }
    setMafia(updated)
    setNightKilled(killed)
    setNightTarget(null)
    setSavedTarget(null)
    setInvestigateTarget(null)
    setInvestigateResult(null)
    const w = checkWin(updated)
    if (w) { setWinner(w); setPhase('result') } else setPhase('day')
  }

  if (phase === 'mafia_action') return (
    <div className="h-full flex flex-col gap-4 px-6 py-8" dir="rtl">
      <div className="text-center">
        <div className="text-4xl mb-2">🔫</div>
        <h2 className="font-black text-white text-xl">مافیا — هدف را انتخاب کن</h2>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        {alivePlayers.filter(p => ROLE_LABELS[p.role].team === 'citizens').map(p => (
          <button key={p.id} onClick={() => { setNightTarget(p.id); setPhase('night') }}
            className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
            style={{ background: nightTarget === p.id ? 'rgba(204,34,41,0.3)' : 'rgba(30,30,34,0.9)', border: `1.5px solid ${nightTarget === p.id ? '#CC2229' : 'rgba(255,255,255,0.1)'}` }}>
            <span className="text-2xl">👤</span><span>{p.name}</span>
            {nightTarget === p.id && <span className="mr-auto text-xs text-red-400">هدف ✓</span>}
          </button>
        ))}
      </div>
      <button onClick={() => setPhase('night')}
        className="btn-game px-6 py-3 rounded-xl font-bold text-sm mt-auto"
        style={{ background: 'rgba(255,255,255,0.07)', color: '#9a9b9e' }}>
        بازگشت
      </button>
    </div>
  )

  if (phase === 'detective_action') return (
    <div className="h-full flex flex-col gap-4 px-6 py-8" dir="rtl">
      <div className="text-center">
        <div className="text-4xl mb-2">🔍</div>
        <h2 className="font-black text-white text-xl">کارآگاه — یک نفر را بررسی کن</h2>
      </div>
      {investigateResult ? (
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="px-6 py-4 rounded-2xl text-center"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1.5px solid #3b82f6' }}>
            <p className="font-black text-white text-lg">{investigateTarget && mafia.find(p => p.id === investigateTarget)?.name}</p>
            <p className="text-sm mt-1" style={{ color: ROLE_LABELS[mafia.find(p => p.id === investigateTarget)?.role || 'citizen'].color }}>{investigateResult}</p>
          </div>
          <button onClick={() => setPhase('night')}
            className="btn-game px-6 py-3 rounded-xl font-black text-white"
            style={{ background: 'rgba(59,130,246,0.3)', border: '1.5px solid #3b82f6' }}>
            بازگشت
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {alivePlayers.filter(p => p.role !== 'detective').map(p => (
            <button key={p.id} onClick={() => {
              setInvestigateTarget(p.id)
              const r = ROLE_LABELS[p.role]
              setInvestigateResult(r.team === 'mafia' ? `${r.emoji} ${r.label} — مافیاست!` : `${r.emoji} ${r.label} — شهروند است`)
            }}
              className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
              style={{ background: 'rgba(30,30,34,0.9)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
              <span className="text-2xl">👤</span><span>{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  if (phase === 'doctor_action') return (
    <div className="h-full flex flex-col gap-4 px-6 py-8" dir="rtl">
      <div className="text-center">
        <div className="text-4xl mb-2">🏥</div>
        <h2 className="font-black text-white text-xl">دکتر — یک نفر را نجات بده</h2>
      </div>
      <div className="flex flex-col gap-2">
        {alivePlayers.map(p => (
          <button key={p.id} onClick={() => { setSavedTarget(p.id); setPhase('night') }}
            className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
            style={{ background: savedTarget === p.id ? 'rgba(168,85,247,0.3)' : 'rgba(30,30,34,0.9)', border: `1.5px solid ${savedTarget === p.id ? '#a855f7' : 'rgba(255,255,255,0.1)'}` }}>
            <span className="text-2xl">👤</span><span>{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  )

  if (phase === 'day') {
    const sendChat = () => {
      if (!chatInput.trim()) return
      setChat(prev => [...prev, chatInput.trim()])
      setChatInput('')
    }
    return (
      <div className="h-full flex flex-col" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-white text-lg">☀️ روز {dayNum} — گفتگو</h2>
              {nightKilled
                ? <p className="text-xs mt-0.5" style={{ color: '#CC2229' }}>🔴 دیشب {nightKilled.name} حذف شد</p>
                : <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>💚 دیشب کسی حذف نشد</p>}
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: '#9a9b9e' }}>زنده: {alivePlayers.length}</p>
              <p className="text-xs" style={{ color: '#CC2229' }}>مافیا: {aliveMafia.length}</p>
            </div>
          </div>
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1.5" style={{ minHeight: 0 }}>
          {chat.length === 0 && <p className="text-center text-xs mt-4" style={{ color: '#6D6E71' }}>گفتگو را شروع کنید...</p>}
          {chat.map((msg, i) => (
            <div key={i} className="px-3 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'rgba(30,30,34,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {msg}
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 px-4 py-2 flex gap-2">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChat()}
            placeholder="پیام بنویس..."
            className="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.1)', outline: 'none', fontFamily: "'IranSans', sans-serif" }} />
          <button onClick={sendChat} className="btn-game px-3 py-2 rounded-xl font-black text-white text-sm"
            style={{ background: '#CC2229' }}>ارسال</button>
        </div>
        <div className="flex-shrink-0 px-4 pb-4">
          <button onClick={() => { setVotes({}); setCurrentVoter(0); setPhase('voting') }}
            className="btn-game w-full py-3 rounded-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
            🗳️ رأی‌گیری
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'voting') {
    const voter = alivePlayers[currentVoter]
    if (!voter) {
      const tally: Record<string, number> = {}
      Object.values(votes).forEach(v => { tally[v] = (tally[v] || 0) + 1 })
      const maxVotes = Math.max(...Object.values(tally), 0)
      const topIds = Object.keys(tally).filter(id => tally[id] === maxVotes)
      const eliminatedId = topIds.length === 1 ? topIds[0] : null
      const eliminatedPlayer = eliminatedId ? mafia.find(p => p.id === eliminatedId) || null : null
      return (
        <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
          <h2 className="font-black text-white text-xl">نتیجه رأی‌گیری</h2>
          <div className="w-full max-w-xs flex flex-col gap-2">
            {alivePlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2 rounded-xl"
                style={{ background: 'rgba(30,30,34,0.8)' }}>
                <span className="font-bold text-white text-sm">{p.name}</span>
                <span className="font-black text-sm" style={{ color: '#CC2229' }}>{tally[p.id] || 0} رأی</span>
              </div>
            ))}
          </div>
          {eliminatedPlayer
            ? <p className="font-black text-lg text-center" style={{ color: '#CC2229' }}>{eliminatedPlayer.name} حذف می‌شود</p>
            : <p className="font-black text-lg text-center" style={{ color: '#ffd60a' }}>تساوی — کسی حذف نشد</p>}
          <button onClick={() => {
            let updated = mafia
            if (eliminatedPlayer) {
              updated = mafia.map(p => p.id === eliminatedPlayer.id ? { ...p, alive: false } : p)
              setMafia(updated)
              setEliminated(eliminatedPlayer)
            }
            const w = checkWin(updated)
            if (w) { setWinner(w); setPhase('result') } else setPhase('elimination')
          }}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
            {eliminatedPlayer ? `حذف ${eliminatedPlayer.name}` : 'ادامه بازی'}
          </button>
        </div>
      )
    }
    return (
      <div className="h-full flex flex-col gap-4 px-6 py-8" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-2">🗳️</div>
          <h2 className="font-black text-white text-xl">رأی {voter.name}</h2>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {alivePlayers.filter(p => p.id !== voter.id).map(p => (
            <button key={p.id} onClick={() => {
              setVotes(prev => ({ ...prev, [voter.id]: p.id }))
              setCurrentVoter(c => c + 1)
            }}
              className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
              style={{ background: 'rgba(30,30,34,0.9)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
              <span className="text-2xl">👤</span><span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'elimination') return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <div className="text-6xl">⚰️</div>
      {eliminated ? (
        <>
          <h2 className="font-black text-white text-2xl text-center">{eliminated.name} حذف شد</h2>
          <div className="px-6 py-4 rounded-2xl text-center"
            style={{ background: `${ROLE_LABELS[eliminated.role].color}22`, border: `1.5px solid ${ROLE_LABELS[eliminated.role].color}` }}>
            <p className="text-3xl">{ROLE_LABELS[eliminated.role].emoji}</p>
            <p className="font-black text-lg mt-1" style={{ color: ROLE_LABELS[eliminated.role].color }}>
              {ROLE_LABELS[eliminated.role].label}
            </p>
          </div>
        </>
      ) : <h2 className="font-black text-white text-2xl text-center">کسی حذف نشد</h2>}
      <button onClick={() => {
        setEliminated(null); setNightKilled(null); setDayNum(d => d + 1); setPhase('night')
      }}
        className="btn-game px-8 py-4 rounded-2xl font-black text-white text-lg"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
        🌙 شب بعدی
      </button>
    </div>
  )

  if (phase === 'result') return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <div className="text-7xl">{winner === 'citizens' ? '🏆' : '💀'}</div>
      <h2 className="font-black text-white text-3xl text-center">
        {winner === 'citizens' ? 'شهروندان بردند!' : 'مافیا برد!'}
      </h2>
      <div className="w-full max-w-xs flex flex-col gap-2">
        <p className="text-center text-sm font-bold mb-2" style={{ color: '#9a9b9e' }}>نقش‌های همه:</p>
        {mafia.map(p => {
          const r = ROLE_LABELS[p.role]
          return (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(30,30,34,0.8)', border: `1px solid ${r.color}44`, opacity: p.alive ? 1 : 0.5 }}>
              <span className="text-xl">{r.emoji}</span>
              <span className="font-bold text-white text-sm flex-1">{p.name}</span>
              <span className="text-xs font-bold" style={{ color: r.color }}>{r.label}</span>
              {!p.alive && <span className="text-xs" style={{ color: '#6D6E71' }}>حذف‌شده</span>}
            </div>
          )
        })}
      </div>
      <button onClick={onExit}
        className="btn-game px-8 py-4 rounded-2xl font-black text-white text-lg"
        style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
        خروج از بازی
      </button>
    </div>
  )

  return null
}
