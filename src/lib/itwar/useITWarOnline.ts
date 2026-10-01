import { useState, useRef, useCallback, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export type RoomPhase =
  | 'idle' | 'creating' | 'joining' | 'lobby'
  | 'starting' | 'playing' | 'finished' | 'error'

interface LobbyPlayer { playerId: string; displayName: string; ready: boolean }

interface PublicMatchState {
  currentTurn: string
  scannedNodes: Record<string, string[]>
  scores: Record<string, number>
  turnNumber: number
}

interface PrivatePlayerState {
  myBugLayout: Record<string, { id: string; cells: string[] }>
  myRadarCount: number
  myHintCount: number
  scannedNodes: string[]
}

interface ScanResult { nodeId: string; result: 'HIT' | 'MISS'; scoreDelta: number }
interface HintResult  { recommendedArea: string }
interface MatchFinished { winner: string; finalScores: Record<string, number> }

export interface ITWarOnlineState {
  phase: RoomPhase
  roomCode: string | null
  players: LobbyPlayer[]
  myPlayerId: string | null
  isHost: boolean
  publicState: PublicMatchState | null
  privateState: PrivatePlayerState | null
  lastScanResult: ScanResult | null
  lastHint: HintResult | null
  matchFinished: MatchFinished | null
  error: string | null
}

const INITIAL: ITWarOnlineState = {
  phase: 'idle', roomCode: null, players: [], myPlayerId: null, isHost: false,
  publicState: null, privateState: null, lastScanResult: null, lastHint: null,
  matchFinished: null, error: null,
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function randomId() { return Math.random().toString(36).slice(2, 10) }

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useITWarOnline(displayName: string) {
  const [state, setState] = useState<ITWarOnlineState>(INITIAL)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const myIdRef = useRef<string>(randomId())
  const stateRef = useRef(state)
  stateRef.current = state

  function updateState(patch: Partial<ITWarOnlineState>) {
    setState(prev => ({ ...prev, ...patch }))
  }

  function broadcast(msg: object) {
    channelRef.current?.postMessage(msg)
  }

  const createRoom = useCallback(async () => {
    const myId = myIdRef.current
    const code = randomCode()
    updateState({ phase: 'creating' })

    const ch = new BroadcastChannel(`itwar:${code}`)
    channelRef.current = ch

    ch.onmessage = (ev) => handleMessage(ev.data)

    const me: LobbyPlayer = { playerId: myId, displayName, ready: false }
    updateState({
      phase: 'lobby',
      roomCode: code,
      myPlayerId: myId,
      isHost: true,
      players: [me],
    })
  }, [displayName])

  const joinRoom = useCallback(async (code: string) => {
    const myId = myIdRef.current
    updateState({ phase: 'joining' })

    const ch = new BroadcastChannel(`itwar:${code}`)
    channelRef.current = ch
    ch.onmessage = (ev) => handleMessage(ev.data)

    updateState({ phase: 'lobby', roomCode: code, myPlayerId: myId, isHost: false })

    // announce join
    ch.postMessage({ type: 'PLAYER_JOIN', playerId: myId, displayName })
  }, [displayName])

  const setReady = useCallback((ready: boolean) => {
    const myId = myIdRef.current
    const { players } = stateRef.current
    const next = players.map(p => p.playerId === myId ? { ...p, ready } : p)
    setState(prev => ({ ...prev, players: next }))
    broadcast({ type: 'PLAYER_READY', playerId: myId, ready })
  }, [])

  const startMatch = useCallback(() => {
    const { players } = stateRef.current
    const [p1, p2] = players
    if (!p1 || !p2) return
    const initialPub: PublicMatchState = {
      currentTurn: p1.playerId,
      scannedNodes: { [p1.playerId]: [], [p2.playerId]: [] },
      scores: { [p1.playerId]: 0, [p2.playerId]: 0 },
      turnNumber: 1,
    }
    broadcast({ type: 'MATCH_START', publicState: initialPub })
    setState(prev => ({ ...prev, phase: 'playing', publicState: initialPub }))
  }, [])

  const scanNode = useCallback((nodeId: string) => {
    const myId = myIdRef.current
    broadcast({ type: 'SCAN_NODE', playerId: myId, nodeId })
  }, [])

  const useRadar = useCallback((areaId: string) => {
    const myId = myIdRef.current
    broadcast({ type: 'USE_RADAR', playerId: myId, areaId })
  }, [])

  const requestHint = useCallback(() => {
    const myId = myIdRef.current
    broadcast({ type: 'REQUEST_HINT', playerId: myId })
  }, [])

  const requestResync = useCallback(() => {
    broadcast({ type: 'RESYNC_REQUEST', playerId: myIdRef.current })
  }, [])

  const leaveRoom = useCallback(() => {
    channelRef.current?.close()
    channelRef.current = null
    setState(INITIAL)
    myIdRef.current = randomId()
  }, [])

  function handleMessage(msg: any) {
    const myId = myIdRef.current
    const cur = stateRef.current

    if (msg.type === 'PLAYER_JOIN') {
      if (!cur.isHost) {
        // As guest, track received players
        const exists = cur.players.find(p => p.playerId === msg.playerId)
        if (!exists) {
          const guestMe: LobbyPlayer = { playerId: myId, displayName, ready: false }
          const them: LobbyPlayer = { playerId: msg.playerId, displayName: msg.displayName, ready: false }
          setState(prev => {
            const myEntry = prev.players.find(p => p.playerId === myId)
            return {
              ...prev,
              players: myEntry ? [myEntry, them] : [guestMe, them],
            }
          })
        }
        // Host sends back current player list
        broadcast({ type: 'LOBBY_SYNC', players: cur.players })
      }
    }

    if (msg.type === 'LOBBY_SYNC' && !cur.isHost) {
      const syncedPlayers: LobbyPlayer[] = msg.players
      const meEntry = syncedPlayers.find(p => p.playerId === myId)
      if (!meEntry) {
        const guestMe: LobbyPlayer = { playerId: myId, displayName, ready: false }
        setState(prev => ({ ...prev, players: [...syncedPlayers, guestMe] }))
      } else {
        setState(prev => ({ ...prev, players: syncedPlayers }))
      }
    }

    if (msg.type === 'PLAYER_READY') {
      setState(prev => ({
        ...prev,
        players: prev.players.map(p =>
          p.playerId === msg.playerId ? { ...p, ready: msg.ready } : p
        ),
      }))
    }

    if (msg.type === 'MATCH_START') {
      setState(prev => ({
        ...prev, phase: 'playing', publicState: msg.publicState,
      }))
    }

    if (msg.type === 'SCAN_RESULT' && msg.targetPlayerId === myId) {
      setState(prev => ({
        ...prev,
        publicState: msg.publicState,
        lastScanResult: msg.scanResult,
      }))
    }

    if (msg.type === 'MATCH_FINISHED') {
      setState(prev => ({
        ...prev, phase: 'finished', matchFinished: msg.result,
      }))
    }
  }

  useEffect(() => () => { channelRef.current?.close() }, [])

  return {
    state,
    createRoom,
    joinRoom,
    setReady,
    startMatch,
    scanNode,
    useRadar,
    requestHint,
    requestResync,
    leaveRoom,
  }
}
