import { useEffect, useRef, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { GameState, GameAction } from '../types'

export interface JoinInfo {
  name: string
  avatar: string
  colorIndex: number
}

interface Options {
  code: string
  isHost: boolean
  state: GameState
  dispatch: React.Dispatch<GameAction>
  onRemoteState: (s: GameState) => void
  joinInfo?: JoinInfo
}

export function useOnlineRoom({ code, isHost, state, dispatch, onRemoteState, joinInfo }: Options) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const subscribedRef = useRef(false)   // true only after SUBSCRIBED
  const lastStateRef = useRef<string>('')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    subscribedRef.current = false

    const channel = supabase.channel(`room-${code}`, {
      config: { broadcast: { self: false, ack: false } },
    })

    channel
      .on('broadcast', { event: 'state' }, ({ payload }: any) => {
        if (!mountedRef.current || isHost) return
        if (payload?.state) onRemoteState(payload.state as GameState)
      })
      .on('broadcast', { event: 'action' }, ({ payload }: any) => {
        if (!mountedRef.current || !isHost) return
        if (payload?.action) dispatch(payload.action as GameAction)
      })
      .subscribe(async (status) => {
        if (!mountedRef.current) return
        subscribedRef.current = status === 'SUBSCRIBED'
        if (status !== 'SUBSCRIBED') return

        // Non-host announces presence once WebSocket is confirmed open
        if (!isHost && joinInfo) {
          await channel.send({
            type: 'broadcast',
            event: 'action',
            payload: {
              action: {
                type: 'ADD_PLAYER',
                name: joinInfo.name,
                avatar: joinInfo.avatar,
                colorIndex: joinInfo.colorIndex,
              },
            },
          })
        }
      })

    channelRef.current = channel

    return () => {
      mountedRef.current = false
      subscribedRef.current = false
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isHost])

  // Host: push state to non-hosts only when WebSocket is open
  useEffect(() => {
    if (!isHost || !channelRef.current || !subscribedRef.current) return
    const str = JSON.stringify(state)
    if (str === lastStateRef.current) return
    lastStateRef.current = str
    channelRef.current.send({
      type: 'broadcast',
      event: 'state',
      payload: { state },
    }).catch(() => {})
  }, [state, isHost])

  const sendAction = useCallback((action: GameAction) => {
    if (isHost) {
      dispatch(action)
    } else if (channelRef.current && subscribedRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'action',
        payload: { action },
      }).catch(() => {})
    }
  }, [isHost, dispatch])

  return { sendAction }
}
