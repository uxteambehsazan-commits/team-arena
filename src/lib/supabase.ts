import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../../utils/supabase/info.tsx'

const G = globalThis as any
if (!G.__sbClient) {
  G.__sbClient = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    { realtime: { params: { eventsPerSecond: 20 } } }
  )
}
export const supabase: ReturnType<typeof createClient> = G.__sbClient

function makeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s.slice(0, 2) + '-' + s.slice(2)
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

// Room management is fully client-side via Supabase Realtime Broadcast.
// No Edge Function or database writes needed.
export const api = {
  createRoom: (_n: string, _a: string, _c: number) =>
    Promise.resolve({ code: makeCode(), playerId: makeId() }),

  joinRoom: (_code: string, _n: string, _a: string, _c: number) =>
    Promise.resolve({ playerId: makeId(), roomState: null as any }),

  // No-ops — useOnlineRoom handles sync via broadcast channel
  pushState: (_code: string, _state: any) => Promise.resolve(),
  sendAction: (_code: string, _action: any) => Promise.resolve(),
  pollActions: (_code: string) => Promise.resolve({ actions: [] as any[] }),
  toggleReady: (_code: string, _playerId: string) => Promise.resolve(),
  deleteRoom: (_code: string) => Promise.resolve(),
}
