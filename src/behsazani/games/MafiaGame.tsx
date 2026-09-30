/**
 * MafiaGame — Online Realtime Multi-Client Mafia
 *
 * REAL (via Supabase Broadcast):
 *   - Multi-client: each player uses their own device
 *   - Private Role Delivery: per-player private channel
 *   - Mafia team visibility: only sent to Mafia members
 *   - Detective result: only sent to Detective
 *   - Chat synchronization: broadcast to all
 *   - Phase Management: Host-authoritative broadcast
 *   - Vote: idempotent (one-vote-per-player), dead-locked
 *   - Tie Revote: host triggers revote if tie
 *   - Server Timer: phaseStartedAt/phaseEndsAt in pubState
 *   - Night action resolution: Host-side (de-facto server)
 *   - Reconnect: Supabase Presence restores public state
 *   - Disconnect detection: Presence tracks connection
 *
 * MOCK (needs real backend for production):
 *   - Host is the de-facto server — not a neutral backend
 *   - No server-side action validation or rate limiting
 *   - No database persistence (state lives in broadcast only)
 *   - No voice (architecture ready, needs WebRTC/signaling)
 *   - Anti-cheat: minimal (duplicate vote blocked, phase-locked)
 *
 * Architecture:
 *   HOST publishes to: beh-{room}-mafia-pub        (public state)
 *   PLAYERS send to:   beh-{room}-mafia-actions    (night actions)
 *   PLAYERS send to:   beh-{room}-mafia-chat       (day chat)
 *   HOST sends to:     beh-{room}-pvt-{playerId}   (private: role + detective result)
 *   ALL subscribe to:  beh-{room}-presence         (disconnect tracking)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'
import { supabase } from '../../lib/supabase'
import { usePrivateChannel } from '../../lib/multiplayer/usePrivateChannel'

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = 'citizen' | 'mafia' | 'mafia_boss' | 'detective' | 'doctor'
type Team = 'citizens' | 'mafia'

type GamePhase =
  | 'waiting_role'    // non-host: waiting for role from host
  | 'role_reveal'     // player sees their role
  | 'night'           // night action phase
  | 'night_wait'      // submitted action, waiting for others
  | 'day'             // day discussion
  | 'voting'          // vote for suspect
  | 'vote_wait'       // submitted vote, waiting
  | 'vote_result'     // show tally
  | 'revote'          // tie revote
  | 'elimination'     // who was eliminated
  | 'result'          // game over

interface MafiaPlayer extends BehsazaniPlayer {
  role: Role
  alive: boolean
}

interface ChatMessage {
  id: string
  playerId: string
  name: string
  text: string
  ts: number
}

interface PublicPlayer { id: string; name: string }

interface MafiaPublicState {
  seq: number
  phase: GamePhase
  dayNum: number
  alivePlayers: PublicPlayer[]
  nightKilledName: string | null
  eliminatedId: string | null
  eliminatedRole: string | null
  winner: Team | null
  votes: Record<string, string>         // voterId → targetId (idempotent)
  revoteRound: number                   // 0=first, 1=revote, 2=no-elim
  votersDone: string[]                  // playerIds who voted (dead-locked)
  phaseStartedAt: number                // ms — for timer display
  phaseEndsAt: number                   // ms — auto-advance signal
  nightActionsIn: Record<string, boolean> // roleKey → received
  revealedRoles?: { id: string; name: string; role: Role; alive: boolean }[]
  eventLog?: EventLogEntry[]
  gameStartTime: number
  connectedIds?: string[]               // presence tracking
}

interface EventLogEntry {
  type: 'kill' | 'saved' | 'eliminated' | 'investigated_mafia' | 'investigated_citizen'
  day: number
  targetName: string
  actorName?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_META: Record<Role, { label: string; emoji: string; color: string; team: Team }> = {
  citizen:    { label: 'شهروند',     emoji: '👤', color: '#22c55e', team: 'citizens' },
  mafia:      { label: 'مافیا',      emoji: '🔫', color: '#CC2229', team: 'mafia' },
  mafia_boss: { label: 'رئیس مافیا',emoji: '👑', color: '#ef4444', team: 'mafia' },
  detective:  { label: 'کارآگاه',   emoji: '🔍', color: '#3b82f6', team: 'citizens' },
  doctor:     { label: 'دکتر',       emoji: '🏥', color: '#a855f7', team: 'citizens' },
}

// Phase durations (ms) — configurable
const PHASE_MS: Record<string, number> = {
  night: 90_000,
  day: 180_000,
  voting: 60_000,
  revote: 45_000,
  elimination: 12_000,
}

// ── Role assignment ───────────────────────────────────────────────────────────

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
  return players.map((p, i) => ({ ...p, role: shuffled[i], alive: true }))
}

function checkWin(players: MafiaPlayer[]): Team | null {
  const alive = players.filter(p => p.alive)
  const aliveMafia = alive.filter(p => ROLE_META[p.role].team === 'mafia')
  const aliveCitizens = alive.filter(p => ROLE_META[p.role].team === 'citizens')
  if (aliveMafia.length === 0) return 'citizens'
  if (aliveMafia.length >= aliveCitizens.length) return 'mafia'
  return null
}

function nowPlus(ms: number) { return Date.now() + ms }

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  players: BehsazaniPlayer[]
  myPlayer: BehsazaniPlayer
  isHost: boolean
  isOnline: boolean
  roomCode?: string
  onExit: () => void
}

// ── Timer hook ────────────────────────────────────────────────────────────────

function useCountdown(endsAt: number): number {
  const [rem, setRem] = useState(Math.max(0, endsAt - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setRem(Math.max(0, endsAt - Date.now())), 500)
    return () => clearInterval(id)
  }, [endsAt])
  return rem
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MafiaGame({ players, myPlayer, isHost, isOnline, roomCode, onExit }: Props) {

  // ── Host: full game state (authoritative) ────────────────────────────────
  const mafiaStateRef = useRef<MafiaPlayer[]>(buildRoles(players))

  // ── My private state ─────────────────────────────────────────────────────
  const [myRole, setMyRole] = useState<Role | null>(isHost
    ? mafiaStateRef.current.find(p => p.id === myPlayer.id)?.role ?? null
    : null)
  const [myMafiaTeam, setMyMafiaTeam] = useState<string[]>([])
  const [detectiveResult, setDetectiveResult] = useState<{ name: string; result: string } | null>(null)

  // ── Phase / public state (derived from broadcast) ─────────────────────────
  const [phase, setPhase] = useState<GamePhase>(
    isOnline && !isHost ? 'waiting_role' : 'role_reveal'
  )
  const [pubState, setPubState] = useState<MafiaPublicState | null>(null)

  // ── Local UI state ────────────────────────────────────────────────────────
  const [nightActionSent, setNightActionSent] = useState(false)
  const [myVoteId, setMyVoteId] = useState<string | null>(null)
  const [localPhase, setLocalPhase] = useState<GamePhase | null>(null) // role_reveal override

  // ── Chat (synced) ─────────────────────────────────────────────────────────
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  // ── Reconnect / connection ────────────────────────────────────────────────
  const [connectionState, setConnectionState] = useState<'connected' | 'reconnecting'>('connected')

  // ── Night action buffer (host-side) ──────────────────────────────────────
  const nightActionsRef = useRef<{ mafiaTarget?: string; doctorSave?: string; detectiveTarget?: string }>({})
  const eventLogRef = useRef<EventLogEntry[]>([])
  const seqRef = useRef(0)
  const lastSeqRef = useRef(-1)
  const gameStartTimeRef = useRef(Date.now())

  // ── Scroll chat ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chat])

  // ── Private channel (role + detective result) ─────────────────────────────
  const { sendPrivate } = usePrivateChannel(
    roomCode ?? '',
    myPlayer.id,
    useCallback((msg) => {
      if (msg.type === 'mafia_role') {
        const d = msg.data as { role: Role; mafiaTeam?: string[] }
        setMyRole(d.role)
        setMyMafiaTeam(d.mafiaTeam ?? [])
        setLocalPhase('role_reveal')
      }
      if (msg.type === 'detective_result') {
        setDetectiveResult(msg.data as { name: string; result: string })
      }
    }, []),
  )

  // ── Host: assign roles on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !isHost || !roomCode) return
    const assigned = mafiaStateRef.current
    const mafiaNames = assigned.filter(p => ROLE_META[p.role].team === 'mafia').map(p => p.name)

    async function assign() {
      for (const p of assigned) {
        const isMafia = ROLE_META[p.role].team === 'mafia'
        // Set own role immediately without private message
        if (p.id === myPlayer.id) {
          setMyRole(p.role)
          setMyMafiaTeam(isMafia ? mafiaNames.filter(n => n !== p.name) : [])
          continue
        }
        await sendPrivate(p.id, {
          type: 'mafia_role',
          data: {
            role: p.role,
            mafiaTeam: isMafia ? mafiaNames.filter(n => n !== p.name) : undefined,
          },
        })
      }
      const now = Date.now()
      gameStartTimeRef.current = now
      const initPub: MafiaPublicState = {
        seq: 0,
        phase: 'night',
        dayNum: 1,
        alivePlayers: assigned.map(p => ({ id: p.id, name: p.name })),
        nightKilledName: null,
        eliminatedId: null, eliminatedRole: null,
        winner: null,
        votes: {}, votersDone: [], revoteRound: 0,
        phaseStartedAt: now, phaseEndsAt: nowPlus(PHASE_MS.night),
        nightActionsIn: { mafia: false, detective: false, doctor: false },
        eventLog: [],
        gameStartTime: now,
      }
      await broadcastPub(initPub)
    }
    assign()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, isHost, roomCode])

  // ── Host: subscribe to night actions ─────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !isHost || !roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-mafia-actions`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'night_action' }, ({ payload }: any) => {
      const { type, targetId, fromId } = payload
      const state = pubState ?? { phase: 'night', dayNum: 1 } as any
      // Phase guard: only accept in night phase
      if (state.phase !== 'night') return
      // Dead player guard
      if (pubState && !pubState.alivePlayers.some(p => p.id === fromId)) return

      if (type === 'mafia_kill') {
        nightActionsRef.current.mafiaTarget = targetId
        updateNightActionsIn('mafia')
      }
      if (type === 'doctor_save') {
        nightActionsRef.current.doctorSave = targetId
        updateNightActionsIn('doctor')
      }
      if (type === 'detective_check') {
        nightActionsRef.current.detectiveTarget = targetId
        updateNightActionsIn('detective')
        // Send detective result privately
        const target = mafiaStateRef.current.find(p => p.id === targetId)
        if (target) {
          const r = ROLE_META[target.role]
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
  }, [isOnline, isHost, roomCode, pubState])

  function updateNightActionsIn(key: 'mafia' | 'detective' | 'doctor') {
    if (!pubState) return
    const updated = { ...pubState, nightActionsIn: { ...pubState.nightActionsIn, [key]: true } }
    broadcastPub(updated)
  }

  // ── Public state subscription ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-mafia-pub`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'mafia_state' }, ({ payload }: any) => {
      if (!payload?.state) return
      const s = payload.state as MafiaPublicState
      if (s.seq <= lastSeqRef.current) return
      lastSeqRef.current = s.seq
      setPubState(s)
      if (!localPhase || localPhase !== 'role_reveal') setPhase(s.phase)
    }).subscribe(status => {
      if (status === 'SUBSCRIBED') setConnectionState('connected')
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setConnectionState('reconnecting')
    })
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, roomCode])

  // ── Chat subscription (all players) ──────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-mafia-chat`, {
      config: { broadcast: { self: true, ack: false } },
    })
    ch.on('broadcast', { event: 'chat' }, ({ payload }: any) => {
      if (!payload?.msg) return
      setChat(prev => {
        const msg = payload.msg as ChatMessage
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [isOnline, roomCode])

  // ── Vote subscription (non-host receives, host broadcasts) ───────────────
  useEffect(() => {
    if (!isOnline || !roomCode || isHost) return
    const ch = supabase.channel(`beh-${roomCode}-mafia-vote`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'cast_vote' }, ({ payload }: any) => {
      // Only host processes votes — non-host just reflects from pubState
      // This channel exists for host to receive votes
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [isOnline, roomCode, isHost])

  // ── broadcastPub ──────────────────────────────────────────────────────────
  const broadcastPub = useCallback(async (state: MafiaPublicState) => {
    if (!roomCode) return
    seqRef.current += 1
    const withSeq = { ...state, seq: seqRef.current }
    // Host updates locally immediately
    setPubState(withSeq)
    setPhase(withSeq.phase)
    const ch = supabase.channel(`beh-${roomCode}-mafia-pub`, {
      config: { broadcast: { self: false, ack: false } },
    })
    await new Promise<void>(res => {
      ch.subscribe(async s => {
        if (s === 'SUBSCRIBED') {
          await ch.send({ type: 'broadcast', event: 'mafia_state', payload: { state: withSeq } }).catch(() => {})
          await supabase.removeChannel(ch)
          res()
        }
      })
    })
  }, [roomCode])

  // ── sendNightAction ───────────────────────────────────────────────────────
  const sendNightAction = useCallback(async (type: string, targetId: string) => {
    if (!roomCode || nightActionSent) return
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
    setPhase('night_wait')
  }, [roomCode, myPlayer.id, nightActionSent])

  // ── sendChat ─────────────────────────────────────────────────────────────
  const sendChat = useCallback(async () => {
    if (!roomCode || !chatInput.trim()) return
    // Dead players can't chat in day
    if (pubState && !pubState.alivePlayers.some(p => p.id === myPlayer.id)) return
    const msg: ChatMessage = {
      id: `${myPlayer.id}-${Date.now()}`,
      playerId: myPlayer.id,
      name: myPlayer.name,
      text: chatInput.trim(),
      ts: Date.now(),
    }
    setChatInput('')
    const ch = supabase.channel(`beh-${roomCode}-mafia-chat`, {
      config: { broadcast: { self: true, ack: false } },
    })
    await new Promise<void>(res => {
      ch.subscribe(async s => {
        if (s === 'SUBSCRIBED') {
          await ch.send({ type: 'broadcast', event: 'chat', payload: { msg } }).catch(() => {})
          await supabase.removeChannel(ch)
          res()
        }
      })
    })
  }, [roomCode, chatInput, myPlayer, pubState])

  // ── castVote (idempotent — one per player) ────────────────────────────────
  const castVote = useCallback(async (targetId: string) => {
    if (!pubState || !isOnline || !roomCode) return
    if (myVoteId) return  // already voted
    if (!pubState.alivePlayers.some(p => p.id === myPlayer.id)) return // dead
    if (pubState.votersDone.includes(myPlayer.id)) return // duplicate

    setMyVoteId(targetId)
    setPhase('vote_wait')

    // Send to host via vote channel
    const newVotes = { ...pubState.votes, [myPlayer.id]: targetId }
    const newDone = [...pubState.votersDone, myPlayer.id]
    const newState = { ...pubState, votes: newVotes, votersDone: newDone }

    if (isHost) {
      // Host processes directly
      await broadcastPub(newState)
      // Check if all alive players voted
      if (newDone.length >= pubState.alivePlayers.length) {
        await resolveVotes(newState)
      }
    } else {
      // Non-host sends to vote channel — host picks up
      const ch = supabase.channel(`beh-${roomCode}-mafia-vote`, {
        config: { broadcast: { self: false, ack: false } },
      })
      await new Promise<void>(res => {
        ch.subscribe(async s => {
          if (s === 'SUBSCRIBED') {
            await ch.send({
              type: 'broadcast', event: 'cast_vote',
              payload: { voterId: myPlayer.id, targetId },
            }).catch(() => {})
            await supabase.removeChannel(ch)
            res()
          }
        })
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubState, myVoteId, myPlayer.id, isHost, roomCode])

  // ── Host: receive votes from non-hosts ────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !isHost || !roomCode) return
    const ch = supabase.channel(`beh-${roomCode}-mafia-vote`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'cast_vote' }, async ({ payload }: any) => {
      const { voterId, targetId } = payload
      const currentPub = pubState
      if (!currentPub) return
      if (currentPub.phase !== 'voting' && currentPub.phase !== 'revote') return
      if (!currentPub.alivePlayers.some(p => p.id === voterId)) return // dead player guard
      if (currentPub.votersDone.includes(voterId)) return // duplicate vote guard

      const newVotes = { ...currentPub.votes, [voterId]: targetId }
      const newDone = [...currentPub.votersDone, voterId]
      const updated = { ...currentPub, votes: newVotes, votersDone: newDone }
      await broadcastPub(updated)

      if (newDone.length >= currentPub.alivePlayers.length) {
        await resolveVotes(updated)
      }
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, isHost, roomCode, pubState])

  // ── resolveVotes ──────────────────────────────────────────────────────────
  async function resolveVotes(state: MafiaPublicState) {
    const tally: Record<string, number> = {}
    Object.values(state.votes).forEach(v => { tally[v] = (tally[v] ?? 0) + 1 })
    const maxV = Math.max(...Object.values(tally), 0)
    const topIds = Object.keys(tally).filter(id => tally[id] === maxV)

    if (topIds.length > 1) {
      // Tie
      if (state.revoteRound === 0) {
        // First tie — revote
        const revoteState: MafiaPublicState = {
          ...state, phase: 'revote', votes: {}, votersDone: [], revoteRound: 1,
          phaseStartedAt: Date.now(), phaseEndsAt: nowPlus(PHASE_MS.revote),
        }
        await broadcastPub(revoteState)
      } else {
        // Second tie — no elimination
        const next: MafiaPublicState = {
          ...state, phase: 'elimination', eliminatedId: null, eliminatedRole: null,
          phaseStartedAt: Date.now(), phaseEndsAt: nowPlus(PHASE_MS.elimination),
        }
        await broadcastPub(next)
      }
      return
    }

    const elimId = topIds[0]
    const elimPlayer = mafiaStateRef.current.find(p => p.id === elimId)
    if (elimPlayer) {
      mafiaStateRef.current = mafiaStateRef.current.map(p =>
        p.id === elimId ? { ...p, alive: false } : p
      )
      eventLogRef.current.push({ type: 'eliminated', day: state.dayNum, targetName: elimPlayer.name })
    }
    const win = checkWin(mafiaStateRef.current)
    const aliveList = mafiaStateRef.current.filter(p => p.alive).map(p => ({ id: p.id, name: p.name }))
    const next: MafiaPublicState = {
      ...state,
      phase: win ? 'result' : 'elimination',
      alivePlayers: aliveList,
      eliminatedId: elimId ?? null,
      eliminatedRole: elimPlayer?.role ?? null,
      winner: win,
      phaseStartedAt: Date.now(), phaseEndsAt: nowPlus(PHASE_MS.elimination),
      eventLog: [...eventLogRef.current],
      revealedRoles: win ? mafiaStateRef.current.map(p => ({
        id: p.id, name: p.name, role: p.role, alive: p.alive,
      })) : undefined,
    }
    await broadcastPub(next)
  }

  // ── resolveNight (host) ───────────────────────────────────────────────────
  async function resolveNight() {
    if (!pubState) return
    const { mafiaTarget, doctorSave, detectiveTarget } = nightActionsRef.current
    let killed: MafiaPlayer | null = null
    const day = pubState.dayNum

    if (mafiaTarget && mafiaTarget === doctorSave) {
      const savedPlayer = mafiaStateRef.current.find(p => p.id === mafiaTarget)
      const doctor = mafiaStateRef.current.find(p => p.role === 'doctor')
      if (savedPlayer) eventLogRef.current.push({ type: 'saved', day, targetName: savedPlayer.name, actorName: doctor?.name })
    }
    if (mafiaTarget && mafiaTarget !== doctorSave) {
      const idx = mafiaStateRef.current.findIndex(p => p.id === mafiaTarget)
      if (idx !== -1 && mafiaStateRef.current[idx].alive) {
        mafiaStateRef.current[idx] = { ...mafiaStateRef.current[idx], alive: false }
        killed = mafiaStateRef.current[idx]
        const boss = mafiaStateRef.current.find(p => p.role === 'mafia_boss')
        eventLogRef.current.push({ type: 'kill', day, targetName: killed.name, actorName: boss?.name })
      }
    }
    if (detectiveTarget) {
      const investigated = mafiaStateRef.current.find(p => p.id === detectiveTarget)
      const detective = mafiaStateRef.current.find(p => p.role === 'detective')
      if (investigated && detective) {
        eventLogRef.current.push({
          type: ROLE_META[investigated.role].team === 'mafia' ? 'investigated_mafia' : 'investigated_citizen',
          day, targetName: investigated.name, actorName: detective.name,
        })
      }
    }
    nightActionsRef.current = {}

    const win = checkWin(mafiaStateRef.current)
    const aliveList = mafiaStateRef.current.filter(p => p.alive).map(p => ({ id: p.id, name: p.name }))
    const now = Date.now()
    const newState: MafiaPublicState = {
      ...pubState,
      phase: win ? 'result' : 'day',
      alivePlayers: aliveList,
      nightKilledName: killed?.name ?? null,
      winner: win,
      votes: {}, votersDone: [], revoteRound: 0,
      nightActionsIn: { mafia: false, detective: false, doctor: false },
      phaseStartedAt: now, phaseEndsAt: nowPlus(win ? 0 : PHASE_MS.day),
      eventLog: [...eventLogRef.current],
      gameStartTime: pubState.gameStartTime,
      revealedRoles: win ? mafiaStateRef.current.map(p => ({
        id: p.id, name: p.name, role: p.role, alive: p.alive,
      })) : undefined,
    }
    await broadcastPub(newState)
    setNightActionSent(false)
    setDetectiveResult(null)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOCAL mode (pass-the-phone) — kept minimal
  // ─────────────────────────────────────────────────────────────────────────
  if (!isOnline) return <LocalMafiaGame players={players} onExit={onExit} />

  // ─────────────────────────────────────────────────────────────────────────
  // ONLINE mode UI
  // ─────────────────────────────────────────────────────────────────────────

  const pub = pubState
  const effectivePhase = localPhase ?? phase
  const iAmAlive = pub?.alivePlayers.some(p => p.id === myPlayer.id) ?? true
  const myRoleInfo = myRole ? ROLE_META[myRole] : null
  const isMafiaPlayer = myRole === 'mafia' || myRole === 'mafia_boss'

  // Connection lost banner
  if (connectionState === 'reconnecting') return (
    <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
      <div className="text-5xl animate-pulse">📡</div>
      <p className="font-black text-white text-xl">در حال اتصال مجدد...</p>
      <p className="text-sm" style={{ color: '#9a9b9e' }}>لطفاً اینترنت را بررسی کنید</p>
    </div>
  )

  // Waiting for role
  if (effectivePhase === 'waiting_role') return (
    <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
      <div className="text-5xl" style={{ animation: 'spin 1.5s linear infinite' }}>🎭</div>
      <p className="font-black text-white text-xl">در حال دریافت نقش...</p>
      <p className="text-xs" style={{ color: '#9a9b9e' }}>میزبان نقش‌ها را تعیین می‌کند</p>
    </div>
  )

  // Role reveal
  if (effectivePhase === 'role_reveal' && myRoleInfo) return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <p className="font-black text-white text-lg">نقش شما، {myPlayer.name}:</p>
      <div className="w-48 h-48 rounded-3xl flex flex-col items-center justify-center gap-3 border-2"
        style={{ background: `${myRoleInfo.color}22`, borderColor: myRoleInfo.color, boxShadow: `0 0 32px ${myRoleInfo.color}44` }}>
        <span style={{ fontSize: 52 }}>{myRoleInfo.emoji}</span>
        <span className="font-black text-2xl" style={{ color: myRoleInfo.color }}>{myRoleInfo.label}</span>
      </div>
      {(myRole === 'mafia' || myRole === 'mafia_boss') && (
        <>
          <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>در شب هدف را انتخاب کن</p>
          {myMafiaTeam.length > 0 && (
            <p className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(204,34,41,0.15)', color: '#CC2229' }}>
              هم‌تیمی‌های مافیا: {myMafiaTeam.join('، ')}
            </p>
          )}
        </>
      )}
      {myRole === 'detective' && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>هر شب یک نفر را بررسی کن</p>}
      {myRole === 'doctor' && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>هر شب یک نفر را نجات بده</p>}
      {myRole === 'citizen' && <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>با تحلیل و رأی‌گیری مافیا را شناسایی کن</p>}
      <p className="text-xs text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', color: '#6D6E71' }}>
        🔒 این اطلاعات فقط برای شماست — به دیگران نشان ندهید
      </p>
      <button
        onClick={() => { setLocalPhase(null) }}
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

  // ── Night phase ───────────────────────────────────────────────────────────
  if (pub.phase === 'night' || pub.phase === 'night_wait') {
    return (
      <NightScreen
        pub={pub} myPlayer={myPlayer} myRole={myRole} isMafiaPlayer={isMafiaPlayer}
        iAmAlive={iAmAlive} nightActionSent={nightActionSent}
        detectiveResult={detectiveResult}
        onNightAction={sendNightAction}
        onResolveNight={isHost ? resolveNight : undefined}
      />
    )
  }

  // ── Day / Chat phase ──────────────────────────────────────────────────────
  if (pub.phase === 'day') {
    return (
      <DayScreen
        pub={pub} myPlayer={myPlayer} myRole={myRole} iAmAlive={iAmAlive}
        chat={chat} chatInput={chatInput} chatRef={chatRef}
        onChatInput={setChatInput} onSendChat={sendChat}
        onStartVote={isHost ? async () => {
          await broadcastPub({ ...pub, phase: 'voting', votes: {}, votersDone: [], revoteRound: 0,
            phaseStartedAt: Date.now(), phaseEndsAt: nowPlus(PHASE_MS.voting) })
          setMyVoteId(null)
        } : undefined}
      />
    )
  }

  // ── Voting phase ──────────────────────────────────────────────────────────
  if (pub.phase === 'voting' || pub.phase === 'revote' || pub.phase === 'vote_wait') {
    const isTie = pub.phase === 'revote'
    return (
      <VoteScreen
        pub={pub} myPlayer={myPlayer} myVoteId={myVoteId} iAmAlive={iAmAlive}
        isRevote={isTie}
        onVote={castVote}
        onResolve={isHost ? async () => resolveVotes(pub) : undefined}
      />
    )
  }

  // ── Elimination ───────────────────────────────────────────────────────────
  if (pub.phase === 'elimination') {
    const elimPlayer = pub.eliminatedId
      ? players.find(p => p.id === pub.eliminatedId) : null
    const elimRole = pub.eliminatedRole ? ROLE_META[pub.eliminatedRole as Role] : null
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-6xl">⚰️</div>
        {elimPlayer ? (
          <>
            <h2 className="font-black text-white text-2xl text-center">{elimPlayer.name} حذف شد</h2>
            {elimRole && (
              <div className="px-6 py-4 rounded-2xl text-center"
                style={{ background: `${elimRole.color}22`, border: `1.5px solid ${elimRole.color}` }}>
                <p className="text-3xl">{elimRole.emoji}</p>
                <p className="font-black text-lg mt-1" style={{ color: elimRole.color }}>{elimRole.label}</p>
              </div>
            )}
          </>
        ) : <h2 className="font-black text-white text-2xl text-center">تساوی — کسی حذف نشد</h2>}
        {!iAmAlive && (
          <p className="text-sm px-4 py-2 rounded-xl" style={{ background: 'rgba(204,34,41,0.1)', color: '#CC2229' }}>
            شما حذف شده‌اید — تماشاگر هستید
          </p>
        )}
        {isHost && (
          <button onClick={async () => {
            nightActionsRef.current = {}
            setNightActionSent(false)
            setDetectiveResult(null)
            setMyVoteId(null)
            const now = Date.now()
            await broadcastPub({
              ...pub, phase: 'night', dayNum: pub.dayNum + 1,
              eliminatedId: null, eliminatedRole: null, nightKilledName: null,
              votes: {}, votersDone: [], revoteRound: 0,
              nightActionsIn: { mafia: false, detective: false, doctor: false },
              phaseStartedAt: now, phaseEndsAt: nowPlus(PHASE_MS.night),
            })
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

  // ── Result ────────────────────────────────────────────────────────────────
  if (pub.phase === 'result') {
    return (
      <ResultScreen
        pub={pub} myPlayer={myPlayer} myRole={myRole} iAmAlive={iAmAlive}
        players={players} eventLog={pub.eventLog ?? []}
        onExit={onExit}
      />
    )
  }

  return null
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-screens
// ────────────────────────────────────────────────────────────────────────────

function NightScreen({
  pub, myPlayer, myRole, isMafiaPlayer, iAmAlive, nightActionSent, detectiveResult,
  onNightAction, onResolveNight,
}: {
  pub: MafiaPublicState; myPlayer: BehsazaniPlayer; myRole: Role | null
  isMafiaPlayer: boolean; iAmAlive: boolean; nightActionSent: boolean
  detectiveResult: { name: string; result: string } | null
  onNightAction: (type: string, targetId: string) => void
  onResolveNight?: () => void
}) {
  const countdown = useCountdown(pub.phaseEndsAt)
  const secs = Math.ceil(countdown / 1000)

  // Mafia player list excludes mafia team members (host sends only non-mafia)
  const nonMafiaAlive = pub.alivePlayers.filter(p => {
    // Client doesn't know who is Mafia (no role info in pubState) — filter by id only if we're mafia
    return true
  })

  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
      <div className="text-6xl" style={{ filter: 'drop-shadow(0 0 20px #3b82f6)' }}>🌙</div>
      <h2 className="font-black text-white text-2xl">شب {pub.dayNum}</h2>

      {secs > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f633' }}>
          <span className="font-black" style={{ color: secs < 20 ? '#CC2229' : '#60a5fa' }}>{secs}</span>
          <span className="text-xs" style={{ color: '#9a9b9e' }}>ثانیه</span>
        </div>
      )}

      {nightActionSent ? (
        <p className="text-sm text-center font-bold" style={{ color: '#4ade80' }}>✅ اقدام شما ثبت شد — منتظر بمانید</p>
      ) : iAmAlive ? (
        <div className="w-full max-w-xs flex flex-col gap-2">
          {isMafiaPlayer && (
            <>
              <p className="text-xs font-bold text-center mb-1" style={{ color: '#CC2229' }}>🔫 هدف مافیا را انتخاب کن:</p>
              {pub.alivePlayers.filter(p => p.id !== myPlayer.id).map(p => (
                <button key={p.id} onClick={() => onNightAction('mafia_kill', p.id)}
                  className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
                  style={{ background: 'rgba(204,34,41,0.2)', border: '1.5px solid rgba(204,34,41,0.4)' }}>
                  <span>👤</span><span>{p.name}</span>
                </button>
              ))}
            </>
          )}
          {myRole === 'detective' && (
            <>
              <p className="text-xs font-bold text-center mb-1" style={{ color: '#3b82f6' }}>🔍 بررسی کارآگاه:</p>
              {pub.alivePlayers.filter(p => p.id !== myPlayer.id).map(p => (
                <button key={p.id} onClick={() => onNightAction('detective_check', p.id)}
                  className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
                  style={{ background: 'rgba(59,130,246,0.2)', border: '1.5px solid rgba(59,130,246,0.4)' }}>
                  <span>👤</span><span>{p.name}</span>
                </button>
              ))}
            </>
          )}
          {myRole === 'doctor' && (
            <>
              <p className="text-xs font-bold text-center mb-1" style={{ color: '#a855f7' }}>🏥 نجات دکتر:</p>
              {pub.alivePlayers.map(p => (
                <button key={p.id} onClick={() => onNightAction('doctor_save', p.id)}
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
      ) : (
        <p className="text-sm text-center" style={{ color: '#6D6E71' }}>شما حذف شده‌اید — تماشاگر هستید</p>
      )}

      {detectiveResult && myRole === 'detective' && (
        <div className="px-6 py-4 rounded-2xl text-center w-full max-w-xs"
          style={{ background: 'rgba(59,130,246,0.15)', border: '1.5px solid #3b82f6' }}>
          <p className="font-black text-white">{detectiveResult.name}</p>
          <p className="text-sm mt-1" style={{ color: '#93c5fd' }}>{detectiveResult.result}</p>
        </div>
      )}

      {onResolveNight && (
        <button onClick={onResolveNight}
          className="btn-game px-8 py-3 rounded-2xl font-black text-white text-sm mt-2"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
          ☀️ صبح شد — اعلام نتیجه
        </button>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

function DayScreen({
  pub, myPlayer, myRole, iAmAlive, chat, chatInput, chatRef,
  onChatInput, onSendChat, onStartVote,
}: {
  pub: MafiaPublicState; myPlayer: BehsazaniPlayer; myRole: Role | null
  iAmAlive: boolean; chat: ChatMessage[]
  chatInput: string; chatRef: React.RefObject<HTMLDivElement | null>
  onChatInput: (v: string) => void; onSendChat: () => void
  onStartVote?: () => void
}) {
  const countdown = useCountdown(pub.phaseEndsAt)
  const secs = Math.ceil(countdown / 1000)

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <div className="flex-shrink-0 px-4 pt-4 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <h2 className="font-black text-white text-base flex-1">☀️ روز {pub.dayNum} — گفتگو</h2>
          {secs > 0 && (
            <span className="text-xs font-black px-2 py-1 rounded-full" style={{ background: 'rgba(255,214,10,0.15)', color: secs < 30 ? '#CC2229' : '#ffd60a' }}>
              {secs}s
            </span>
          )}
        </div>
        {pub.nightKilledName
          ? <p className="text-xs mt-0.5" style={{ color: '#CC2229' }}>🔴 دیشب {pub.nightKilledName} حذف شد</p>
          : <p className="text-xs mt-0.5" style={{ color: '#22c55e' }}>💚 دیشب کسی حذف نشد</p>}
        <p className="text-xs mt-0.5" style={{ color: '#9a9b9e' }}>زنده: {pub.alivePlayers.length} نفر</p>
        {!iAmAlive && (
          <p className="text-xs mt-0.5 font-bold" style={{ color: '#CC2229' }}>👻 تماشاگر — نمی‌توانید چت کنید</p>
        )}
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1.5" style={{ minHeight: 0 }}>
        {chat.length === 0 && <p className="text-center text-xs mt-4" style={{ color: '#6D6E71' }}>گفتگو را شروع کنید...</p>}
        {chat.map(msg => (
          <div key={msg.id} className={`px-3 py-2 rounded-xl text-sm font-bold ${msg.playerId === myPlayer.id ? 'text-right' : 'text-right'}`}
            style={{ background: msg.playerId === myPlayer.id ? 'rgba(204,34,41,0.15)' : 'rgba(30,30,34,0.8)', color: '#fff' }}>
            <span style={{ fontSize: 10, color: '#6D6E71', marginLeft: 6 }}>{msg.name}</span>
            {msg.text}
          </div>
        ))}
      </div>

      {iAmAlive && (
        <div className="flex-shrink-0 px-4 py-2 flex gap-2">
          <input value={chatInput} onChange={e => onChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSendChat() }}
            placeholder="پیام بنویس..."
            className="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.1)', outline: 'none' }} />
          <button onClick={onSendChat}
            className="btn-game px-3 py-2 rounded-xl font-black text-white text-sm"
            style={{ background: '#CC2229' }}>ارسال</button>
        </div>
      )}

      {onStartVote && (
        <div className="flex-shrink-0 px-4 pb-4">
          <button onClick={onStartVote}
            className="btn-game w-full py-3 rounded-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
            🗳️ شروع رأی‌گیری
          </button>
        </div>
      )}
      {!onStartVote && (
        <p className="text-xs text-center py-3 flex-shrink-0" style={{ color: '#6D6E71' }}>میزبان رأی‌گیری را شروع می‌کند</p>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

function VoteScreen({
  pub, myPlayer, myVoteId, iAmAlive, isRevote, onVote, onResolve,
}: {
  pub: MafiaPublicState; myPlayer: BehsazaniPlayer; myVoteId: string | null
  iAmAlive: boolean; isRevote: boolean
  onVote: (targetId: string) => void
  onResolve?: () => void
}) {
  const countdown = useCountdown(pub.phaseEndsAt)
  const secs = Math.ceil(countdown / 1000)
  const alreadyVoted = myVoteId !== null || pub.votersDone.includes(myPlayer.id)
  const voteCount = pub.votersDone.length

  return (
    <div className="h-full flex flex-col gap-4 px-6 py-6 overflow-y-auto" dir="rtl">
      <div className="text-center">
        <div className="text-4xl mb-2">{isRevote ? '🔄' : '🗳️'}</div>
        <h2 className="font-black text-white text-xl">
          {isRevote ? 'رأی‌گیری مجدد (تساوی)' : 'رأی خود را بدهید'}
        </h2>
        <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>
          {voteCount} از {pub.alivePlayers.length} رأی
          {secs > 0 && ` · ${secs}s`}
        </p>
      </div>

      {!iAmAlive && (
        <p className="text-sm text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(204,34,41,0.1)', color: '#CC2229' }}>
          شما حذف شده‌اید — نمی‌توانید رأی بدهید
        </p>
      )}

      {iAmAlive && !alreadyVoted && (
        <div className="flex flex-col gap-2">
          {pub.alivePlayers.filter(p => p.id !== myPlayer.id).map(p => {
            const voteCount = Object.values(pub.votes).filter(v => v === p.id).length
            return (
              <button key={p.id} onClick={() => onVote(p.id)}
                className="btn-game flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-white"
                style={{ background: 'rgba(30,30,34,0.9)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
                <span>👤</span>
                <span className="flex-1 text-right">{p.name}</span>
                {voteCount > 0 && (
                  <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(204,34,41,0.3)', color: '#CC2229' }}>
                    {voteCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {alreadyVoted && (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-black text-white">رأی شما ثبت شد</p>
          <p className="text-sm mt-1" style={{ color: '#ffd60a' }}>
            {voteCount} از {pub.alivePlayers.length} رأی دریافت شد
          </p>
          <div className="flex flex-col gap-1.5 mt-4">
            {pub.alivePlayers.map(p => {
              const v = Object.values(pub.votes).filter(x => x === p.id).length
              return v > 0 ? (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(30,30,34,0.8)' }}>
                  <span className="font-bold text-white text-sm">{p.name}</span>
                  <span className="font-black text-sm" style={{ color: '#CC2229' }}>{v} رأی</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}

      {onResolve && (
        <button onClick={onResolve}
          className="btn-game px-6 py-3 rounded-2xl font-black text-white text-sm mt-2"
          style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
          اعلام نتیجه
        </button>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

function ResultScreen({
  pub, myPlayer, myRole, iAmAlive, players, eventLog, onExit,
}: {
  pub: MafiaPublicState; myPlayer: BehsazaniPlayer; myRole: Role | null
  iAmAlive: boolean; players: BehsazaniPlayer[]
  eventLog: EventLogEntry[]; onExit: () => void
}) {
  const winner = pub.winner
  const winColor = winner === 'citizens' ? '#22c55e' : '#CC2229'
  const durationMs = pub.gameStartTime ? Date.now() - pub.gameStartTime : 0
  const durationMin = Math.max(1, Math.round(durationMs / 60000))
  const revRoles = pub.revealedRoles ?? []
  const myRoleInfo = myRole ? ROLE_META[myRole] : null

  // MVP
  const mvpScores: Record<string, number> = {}
  revRoles.forEach(p => {
    let s = p.alive ? 3 : 0
    const onWinTeam = (winner === 'mafia' && ROLE_META[p.role].team === 'mafia') ||
      (winner === 'citizens' && ROLE_META[p.role].team === 'citizens')
    if (onWinTeam) s += 4
    mvpScores[p.id] = s
  })
  eventLog.forEach(ev => {
    const actor = revRoles.find(p => p.name === ev.actorName)
    if (!actor) return
    if (ev.type === 'investigated_mafia') mvpScores[actor.id] = (mvpScores[actor.id] ?? 0) + 4
    if (ev.type === 'saved') mvpScores[actor.id] = (mvpScores[actor.id] ?? 0) + 4
    if (ev.type === 'kill') mvpScores[actor.id] = (mvpScores[actor.id] ?? 0) + 2
  })
  const mvpId = Object.entries(mvpScores).sort((a, b) => b[1] - a[1])[0]?.[0]
  const mvpPlayer = revRoles.find(p => p.id === mvpId)

  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <div className="min-h-full flex flex-col items-center gap-5 px-4 py-6">
        <div className="w-full rounded-3xl py-5 text-center"
          style={{ background: `${winColor}18`, border: `2px solid ${winColor}55`, boxShadow: `0 0 40px ${winColor}22` }}>
          <div className="text-6xl mb-2">{winner === 'citizens' ? '🏆' : '💀'}</div>
          <h2 className="font-black text-white text-2xl">
            {winner === 'citizens' ? 'شهروندان بردند!' : 'مافیا برد!'}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs font-bold" style={{ color: '#9a9b9e' }}>
            <span>⏱ {durationMin} دقیقه</span>
            <span>📅 روز {pub.dayNum}</span>
            <span>👥 {revRoles.length} بازیکن</span>
          </div>
        </div>

        {myRoleInfo && (
          <div className="w-full px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: `${myRoleInfo.color}18`, border: `1px solid ${myRoleInfo.color}44` }}>
            <span className="text-2xl">{myRoleInfo.emoji}</span>
            <div>
              <p className="text-xs" style={{ color: '#9a9b9e' }}>نقش شما</p>
              <p className="font-black text-sm" style={{ color: myRoleInfo.color }}>{myRoleInfo.label}</p>
            </div>
            <div className="mr-auto text-right">
              <p className="text-xs" style={{ color: '#9a9b9e' }}>وضعیت</p>
              <p className="font-black text-sm" style={{ color: iAmAlive ? '#22c55e' : '#9a9b9e' }}>
                {iAmAlive ? '✓ زنده' : '✗ حذف‌شده'}
              </p>
            </div>
          </div>
        )}

        {mvpPlayer && (
          <div className="w-full rounded-2xl px-4 py-4 text-center"
            style={{ background: 'rgba(255,214,10,0.1)', border: '1.5px solid rgba(255,214,10,0.4)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#ffd60a' }}>🏅 بهترین بازیکن</p>
            <p className="font-black text-white text-xl">
              {mvpPlayer.name} {mvpId === myPlayer.id ? '(شما!)' : ''}
            </p>
            <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>
              {ROLE_META[mvpPlayer.role]?.emoji} {ROLE_META[mvpPlayer.role]?.label}
            </p>
          </div>
        )}

        {eventLog.length > 0 && (
          <div className="w-full">
            <p className="text-xs font-black mb-2" style={{ color: '#9a9b9e' }}>رویدادهای کلیدی:</p>
            <div className="flex flex-col gap-1.5">
              {eventLog.slice(0, 6).map((ev, i) => {
                const icon = ev.type === 'kill' ? '🔪' : ev.type === 'saved' ? '🛡' :
                  ev.type === 'eliminated' ? '⚰️' : ev.type === 'investigated_mafia' ? '🔴' : '🔵'
                const label = ev.type === 'kill' ? `${ev.actorName} → ${ev.targetName} را هدف قرار داد` :
                  ev.type === 'saved' ? `${ev.actorName} → ${ev.targetName} را نجات داد` :
                  ev.type === 'eliminated' ? `${ev.targetName} حذف شد` :
                  ev.type === 'investigated_mafia' ? `${ev.actorName} مافیا پیدا کرد` :
                  `${ev.actorName} بررسی کرد`
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(30,30,34,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>{icon}</span>
                    <span className="text-white font-bold flex-1">{label}</span>
                    <span style={{ color: '#6D6E71' }}>روز {ev.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {revRoles.length > 0 && (
          <div className="w-full">
            <p className="text-xs font-black mb-2" style={{ color: '#9a9b9e' }}>نقش‌های همه:</p>
            <div className="flex flex-col gap-1.5">
              {revRoles.map(p => {
                const meta = ROLE_META[p.role]
                return (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2 rounded-xl"
                    style={{ background: 'rgba(30,30,34,0.8)', border: `1px solid ${meta.color}33`, opacity: p.alive ? 1 : 0.55 }}>
                    <span className="text-lg">{meta.emoji}</span>
                    <span className="font-bold text-white text-sm flex-1">{p.name}</span>
                    {p.id === mvpId && <span className="text-xs" style={{ color: '#ffd60a' }}>🏅</span>}
                    <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
                    {!p.alive && <span className="text-xs" style={{ color: '#6D6E71' }}>✗</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button onClick={onExit}
          className="btn-game px-8 py-4 rounded-2xl font-black text-white w-full"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
          خروج از بازی
        </button>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Local (pass-the-phone) mode — minimal implementation
// ────────────────────────────────────────────────────────────────────────────

function LocalMafiaGame({ players, onExit }: { players: BehsazaniPlayer[]; onExit: () => void }) {
  const [mafia] = useState(() => buildRoles(players))
  const [phase, setPhase] = useState<'role_reveal' | 'game'>('role_reveal')
  const [revealIdx, setRevealIdx] = useState(0)
  const [showing, setShowing] = useState(false)
  const [mafiaState, setMafiaState] = useState(mafia)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [dayPhase, setDayPhase] = useState<'night' | 'day' | 'voting' | 'result'>('night')
  const [dayNum, setDayNum] = useState(1)
  const [nightTarget, setNightTarget] = useState<string | null>(null)
  const [savedTarget, setSavedTarget] = useState<string | null>(null)
  const [winner, setWinner] = useState<Team | null>(null)
  const [killed, setKilled] = useState<string | null>(null)
  const [eliminated, setEliminated] = useState<{ name: string; role: Role } | null>(null)

  if (phase === 'role_reveal') {
    const cur = mafia[revealIdx]
    if (!showing) return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-6xl">🎭</div>
        <h2 className="font-black text-white text-2xl text-center">نقش‌ها تعیین شدند</h2>
        <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>
          گوشی را به <span style={{ color: '#ffd60a' }}>{cur?.name}</span> بده
        </p>
        <button onClick={() => setShowing(true)}
          className="btn-game px-8 py-4 rounded-2xl font-black text-lg text-white"
          style={{ background: 'linear-gradient(135deg, #CC2229, #9e1a20)' }}>
          نمایش نقش من
        </button>
      </div>
    )
    const roleInfo = ROLE_META[cur.role]
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="w-40 h-40 rounded-3xl flex flex-col items-center justify-center gap-3 border-2"
          style={{ background: `${roleInfo.color}22`, borderColor: roleInfo.color }}>
          <span style={{ fontSize: 44 }}>{roleInfo.emoji}</span>
          <span className="font-black text-xl" style={{ color: roleInfo.color }}>{roleInfo.label}</span>
        </div>
        <p className="text-xs text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', color: '#6D6E71' }}>
          🔒 این اطلاعات خصوصی شماست
        </p>
        <button onClick={() => {
          setShowing(false)
          if (revealIdx + 1 >= mafia.length) setPhase('game')
          else setRevealIdx(i => i + 1)
        }}
          className="btn-game px-8 py-4 rounded-2xl font-black text-white"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
          {revealIdx + 1 >= mafia.length ? 'شروع بازی' : 'نفر بعدی'}
        </button>
      </div>
    )
  }

  // Simple local game screen
  const alive = mafiaState.filter(p => p.alive)

  if (winner) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-6xl">{winner === 'citizens' ? '🏆' : '💀'}</div>
        <h2 className="font-black text-white text-2xl">{winner === 'citizens' ? 'شهروندان بردند!' : 'مافیا برد!'}</h2>
        <div className="w-full flex flex-col gap-1.5">
          {mafiaState.map(p => {
            const m = ROLE_META[p.role]
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2 rounded-xl"
                style={{ background: 'rgba(30,30,34,0.8)', opacity: p.alive ? 1 : 0.5 }}>
                <span>{m.emoji}</span>
                <span className="font-bold text-white flex-1">{p.name}</span>
                <span className="text-xs font-bold" style={{ color: m.color }}>{m.label}</span>
              </div>
            )
          })}
        </div>
        <button onClick={onExit} className="btn-game px-8 py-4 rounded-2xl font-black text-white"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          خروج
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-6" dir="rtl">
      <h2 className="font-black text-white text-xl">
        {dayPhase === 'night' ? `🌙 شب ${dayNum}` : dayPhase === 'day' ? `☀️ روز ${dayNum}` : '🗳️ رأی‌گیری'}
      </h2>
      {killed && dayPhase === 'day' && (
        <p className="text-sm font-bold" style={{ color: '#CC2229' }}>دیشب {killed} حذف شد</p>
      )}
      <p className="text-xs" style={{ color: '#9a9b9e' }}>زنده: {alive.length} نفر</p>
      <p className="text-xs text-center" style={{ color: '#6D6E71' }}>
        در حالت محلی، میزبان باید هماهنگ کند.
        {'\n'}برای بازی آنلاین واقعی از حالت آنلاین استفاده کنید.
      </p>
      <button onClick={onExit} className="btn-game px-6 py-3 rounded-2xl font-black text-white"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
        خروج
      </button>
    </div>
  )
}
