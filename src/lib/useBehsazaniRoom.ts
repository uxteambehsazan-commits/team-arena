import { useEffect, useRef, useCallback, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { BehsazaniPlayer } from '../behsazani/BehsazaniHub'

export type BehsazaniRoomStatus = 'connecting' | 'connected' | 'error'

interface PresenceEntry {
  player: BehsazaniPlayer
  isHost: boolean
  gameId?: string
}

interface Options {
  code: string
  isHost: boolean
  myPlayer: BehsazaniPlayer
  gameId?: string
  onPlayersChange: (players: BehsazaniPlayer[]) => void
  onGameStart: (players: BehsazaniPlayer[], gameId: string, hostId?: string) => void
  onGameIdDiscovered?: (gameId: string) => void
}

export function generateBehsazaniCode(): string {
  const chars = 'CDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = 'B'
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s.slice(0, 2) + '-' + s.slice(2)
}

export function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function isBehsazaniCode(code: string): boolean {
  const raw = code.replace('-', '').toUpperCase()
  return raw.length === 6 && raw.startsWith('B')
}

export function useBehsazaniRoom({
  code, isHost, myPlayer, gameId,
  onPlayersChange, onGameStart, onGameIdDiscovered,
}: Options) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [status, setStatus] = useState<BehsazaniRoomStatus>('connecting')
  const onPlayersRef = useRef(onPlayersChange)
  const onStartRef = useRef(onGameStart)
  const onDiscoverRef = useRef(onGameIdDiscovered)
  onPlayersRef.current = onPlayersChange
  onStartRef.current = onGameStart
  onDiscoverRef.current = onGameIdDiscovered

  useEffect(() => {
    const channel = supabase.channel(`beh-${code}`, {
      config: {
        presence: { key: myPlayer.id },
        broadcast: { self: false, ack: false },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceEntry>()
        const players: BehsazaniPlayer[] = []
        let discoveredGameId: string | undefined

        Object.values(state).forEach((entries: any[]) => {
          entries.forEach((entry: PresenceEntry) => {
            players.push(entry.player)
            if (entry.isHost && entry.gameId) discoveredGameId = entry.gameId
          })
        })

        // Deduplicate by player id (presence may stack)
        const seen = new Set<string>()
        const unique = players.filter(p => {
          if (seen.has(p.id)) return false
          seen.add(p.id)
          return true
        })

        onPlayersRef.current(unique)
        if (!isHost && discoveredGameId) {
          onDiscoverRef.current?.(discoveredGameId)
        }
      })
      .on('broadcast', { event: 'game_start' }, ({ payload }: any) => {
        if (payload?.players && payload?.gameId) {
          onStartRef.current(payload.players, payload.gameId, payload.hostId)
        }
      })
      .subscribe(async (s) => {
        if (s !== 'SUBSCRIBED') {
          if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('error')
          return
        }
        setStatus('connected')
        const entry: PresenceEntry = { player: myPlayer, isHost, gameId }
        await channel.track(entry).catch(() => {})
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isHost, myPlayer.id])

  const startGame = useCallback((players: BehsazaniPlayer[], gId: string, hostId?: string) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'game_start',
      payload: { players, gameId: gId, hostId },
    }).catch(() => {})
  }, [])

  return { status, startGame }
}
