// PHASE 14: Universal GameEngine contract interface
// Every multiplayer game must satisfy this contract to integrate with BehsazaniHub.

import type { PlayMode } from '../lib/gameTypes'

// ── State types ──────────────────────────────────────────────────────────────

export interface BasePublicState {
  phase: string
  seq: number
}

export interface BasePrivateState {
  playerId: string
}

// ── Per-player role (what the game assigns) ──────────────────────────────────

export interface PlayerRole {
  playerId: string
  roleName: string
  roleTeam?: string
  privateData?: unknown
}

// ── Command / Event envelopes ────────────────────────────────────────────────

export interface EngineCommand<T = unknown> {
  cmdId: string
  type: string
  senderId: string
  round?: number
  payload: T
  ts: number
}

export interface EngineEvent<T = unknown> {
  eventId: string
  type: string
  seq: number
  payload: T
  ts: number
}

// ── The contract every game engine must implement ─────────────────────────────

export interface GameEngineContract<
  PubState extends BasePublicState,
  PrivState extends BasePrivateState = BasePrivateState,
> {
  /** Unique game identifier matching GameCapabilityManifest.gameId */
  readonly gameId: string

  /** Which play modes this engine supports */
  readonly supportedModes: PlayMode[]

  /** True if private state must never appear in public broadcasts */
  readonly hasPrivateState: boolean

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /** Called by host once when the game starts. Returns initial public state. */
  initState(players: { id: string; name: string }[], options?: Record<string, unknown>): PubState

  /** Called by host to assign private roles. Returns map of playerId → private state. */
  assignRoles?(players: { id: string; name: string }[]): Record<string, PrivState>

  // ── Command handling (host-side) ─────────────────────────────────────────

  /** Validate an incoming command before applying it */
  validateCommand(cmd: EngineCommand, state: PubState): { valid: boolean; reason?: string }

  /** Apply a command to produce the next public state. Must be deterministic. */
  applyCommand(cmd: EngineCommand, state: PubState): PubState

  // ── Phase transitions ────────────────────────────────────────────────────

  /** Returns the next phase name given the current state */
  nextPhase(state: PubState): string | null

  /** True if the game is over */
  isGameOver(state: PubState): boolean

  // ── Scoring ──────────────────────────────────────────────────────────────

  /** Compute final scores. Returns map of playerId → score. */
  computeScores(state: PubState, events?: EngineEvent[]): Record<string, number>

  // ── Security ─────────────────────────────────────────────────────────────

  /**
   * Strip any private/secret fields before broadcasting publicly.
   * MUST be called on every state before broadcastPub().
   */
  sanitizeForBroadcast(state: PubState): PubState
}

// ── Helper: enforce sanitization ─────────────────────────────────────────────

export function assertNoPrivateFields<T extends object>(
  state: T,
  privateFields: (keyof T)[],
): void {
  const leaks = privateFields.filter(f => f in state && state[f] !== undefined && state[f] !== '')
  if (leaks.length > 0) {
    throw new Error(`[GameEngine] Private field(s) detected in public state: ${leaks.join(', ')}`)
  }
}
