import { useEffect, useRef, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import type { PrivateMessage } from './types'

/**
 * Per-player private messaging over Supabase Realtime.
 *
 * Each player subscribes to channel `beh-{roomCode}-pvt-{myPlayerId}`.
 * The host (or any authorized sender) can send a private message to a specific
 * player by calling `sendPrivate(targetPlayerId, message)`.
 *
 * This gives us true per-device private state: roles, night-action results,
 * secret words, etc. are delivered only to the intended recipient.
 */
export function usePrivateChannel(
  roomCode: string,
  myPlayerId: string,
  onMessage: (msg: PrivateMessage) => void,
) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const onMsgRef = useRef(onMessage)
  onMsgRef.current = onMessage

  useEffect(() => {
    if (!roomCode || !myPlayerId) return
    const ch = supabase.channel(`beh-${roomCode}-pvt-${myPlayerId}`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'private' }, ({ payload }: any) => {
      if (payload?.msg) onMsgRef.current(payload.msg as PrivateMessage)
    }).subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [roomCode, myPlayerId])

  const sendPrivate = useCallback(
    async (targetPlayerId: string, msg: Omit<PrivateMessage, 'timestamp'>) => {
      const full: PrivateMessage = { ...msg, timestamp: Date.now() }
      const targetCh = supabase.channel(`beh-${roomCode}-pvt-${targetPlayerId}`, {
        config: { broadcast: { self: false, ack: false } },
      })
      await new Promise<void>(res => {
        targetCh.subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            await targetCh.send({ type: 'broadcast', event: 'private', payload: { msg: full } }).catch(() => {})
            await supabase.removeChannel(targetCh)
            res()
          }
        })
      })
    },
    [roomCode],
  )

  return { sendPrivate }
}
