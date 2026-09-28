// ── PHASE 3+4: Shared game types used by all multiplayer games ──

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'error'

export type PlayMode = 'ONLINE_MULTIPLAYER' | 'SINGLE_DEVICE' | 'CPU' | 'HYBRID'

export type GameStatusLevel = 'ready' | 'improving' | 'developing' | 'coming_soon'

// Full capability manifest for every game (PHASE 1)
export interface GameCapabilityManifest {
  gameId: string
  title: string
  titleEn: string
  description: string
  icon: string
  color: string
  theme: 'behsazan' | 'general'
  category: string
  modes: PlayMode[]
  minPlayers: number
  maxPlayers: number
  estimatedMinutes: number
  requiresRoom: boolean
  requiresRealtime: boolean
  supportsSingleDevice: boolean
  supportsOnlineMultiplayer: boolean
  supportsCPU: boolean
  supportsReconnect: boolean
  status: GameStatusLevel
  version: string
}

// Generic command envelope (client → host)
export interface GameCommand<T = unknown> {
  cmdId: string
  type: string
  playerId: string
  payload: T
  timestamp: number
}

// Generic event envelope (host → all clients)
export interface GameEvent<T = unknown> {
  eventId: string
  eventType: string
  stateVersion: number
  timestamp: number
  payload: T
}

// Per-player session info
export interface PlayerSession {
  playerId: string
  playerName: string
  avatar: string
  colorIndex: number
  isHost: boolean
  isConnected: boolean
  joinedAt: number
}

// Generic game state envelope
export interface GameStateEnvelope<P, R> {
  publicState: P
  privateState?: R
  stateVersion: number
  gameId: string
  sessionId: string
}

// Utility: generate a short idempotency key
export function genId(prefix = ''): string {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`
}
