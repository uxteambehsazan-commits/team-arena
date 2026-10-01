// PHASE 3: Persistent broadcast channel for host — replaces subscribe-send-remove pattern
// Use for all host→all-clients broadcasts to avoid channel churn and reduce latency.

import { useEffect, useRef, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'

export function useHostBroadcast(channelName: string, enabled: boolean) {
  const chRef = useRef<RealtimeChannel | null>(null)
  const readyRef = useRef(false)

  useEffect(() => {
    if (!enabled) return
    readyRef.current = false
    const ch = supabase.channel(channelName, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.subscribe(s => {
      if (s === 'SUBSCRIBED') readyRef.current = true
    })
    chRef.current = ch
    return () => {
      supabase.removeChannel(ch)
      readyRef.current = false
      chRef.current = null
    }
  }, [channelName, enabled])

  const send = useCallback(async (event: string, payload: unknown): Promise<boolean> => {
    const ch = chRef.current
    if (!ch || !readyRef.current) return false
    try {
      await ch.send({ type: 'broadcast', event, payload })
      return true
    } catch {
      return false
    }
  }, [])

  return { send, isReady: () => readyRef.current }
}

// For non-host clients: subscribe to a broadcast channel and receive events
export function useBroadcastListener(
  channelName: string,
  enabled: boolean,
  handlers: Record<string, (payload: unknown) => void>,
) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!enabled) return
    const ch = supabase.channel(channelName, {
      config: { broadcast: { self: false, ack: false } },
    })
    Object.keys(handlers).forEach(event => {
      ch.on('broadcast', { event }, ({ payload }: any) => {
        handlersRef.current[event]?.(payload)
      })
    })
    ch.subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, enabled])
}
