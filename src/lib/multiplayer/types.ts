export type Visibility = 'public' | 'player' | 'role' | 'team' | 'host' | 'hidden'

export interface GameCapabilityMetadata {
  gameId: string
  name: string
  minPlayers: number
  maxPlayers: number
  supportsSinglePlayer: boolean
  supportsOnline: boolean
  supportsRoomCode: boolean
  supportsHiddenRoles: boolean
  supportsPrivateInformation: boolean
  supportsTeams: boolean
  requiresHost: boolean
  requiresRealtimeSync: boolean
  roles?: string[]
  winConditions?: string[]
}

export interface PrivateMessage<T = unknown> {
  type: string
  data: T
  fromPlayerId?: string
  timestamp: number
}

export interface OnlineGameProps {
  myPlayer: { id: string; name: string; avatar: string; colorIndex: number }
  isHost: boolean
  isOnline: boolean
  roomCode?: string
}
