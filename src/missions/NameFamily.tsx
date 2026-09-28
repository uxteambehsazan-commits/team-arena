import { useRef, useState } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS, NAME_FAMILY_CATEGORIES } from '../constants'
import GameHUD from '../components/GameHUD'
import { avatarSrc } from '../lib/avatars'

interface Props {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  localPlayerId?: string
}

export default function NameFamily({ state, dispatch, localPlayerId }: Props) {
  const nf = state.nameFamilyState
  // In online mode localPlayerId is set; in local mode we show a player picker
  const activePlayers = state.players.filter(p => p.connected)
  const [localTab, setLocalTab] = useState<string>(activePlayers[0]?.id ?? '')
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  if (!nf) return null

  // Which player "I" am — online uses session playerId, local uses the selected tab
  const myId = localPlayerId ?? localTab
  const myAnswers = nf.answers[myId] ?? {}
  const myLocked = nf.locked[myId] ?? false
  const lockedCount = activePlayers.filter(p => nf.locked[p.id]).length

  function typeAnswer(categoryId: string, value: string) {
    if (myLocked) return
    dispatch({ type: 'NAME_FAMILY_TYPE', playerId: myId, categoryId, value })
  }

  function submit() {
    if (myLocked) return
    dispatch({ type: 'NAME_FAMILY_SUBMIT', playerId: myId })
  }

  const filledCount = Object.values(myAnswers).filter(v => v.trim()).length
  const isLocalMode = !localPlayerId

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <GameHUD state={state} />

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">

        {/* Letter hero */}
        <div className="flex items-center justify-center gap-4">
          <div className="glass-panel rounded-3xl px-8 py-4 text-center">
            <p className="text-xs mb-1" style={{ color: '#6D6E71' }}>حرف این دور</p>
            <div className="font-display text-6xl font-black"
              style={{ color: '#06b6d4', textShadow: '0 0 30px #06b6d488' }}>
              {nf.letter}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">{lockedCount}/{activePlayers.length}</p>
            <p className="text-xs" style={{ color: '#6D6E71' }}>تموم کردن</p>
          </div>
        </div>

        {/* In local mode — player picker tabs */}
        {isLocalMode && activePlayers.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {activePlayers.map(p => {
              const c = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
              const done = nf.locked[p.id]
              const isMe = myId === p.id
              return (
                <button key={p.id}
                  onClick={() => !done && setLocalTab(p.id)}
                  className="btn-game flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
                  style={{
                    background: isMe ? `${c.bg}33` : '#1a1a1c',
                    border: `2px solid ${isMe ? c.bg : done ? '#22c55e44' : '#2e2e32'}`,
                    color: isMe ? c.light : done ? '#22c55e' : '#6D6E71',
                    opacity: done && !isMe ? 0.6 : 1,
                  }}>
                  <img src={avatarSrc(p.avatar)} alt="" className="w-4 h-4 rounded-full object-cover" />
                  {p.name}
                  {done && <span>✓</span>}
                </button>
              )
            })}
            <p className="w-full text-xs text-center" style={{ color: '#6D6E71' }}>
              دستگاه رو دست {activePlayers.find(p => p.id === myId)?.name} بده
            </p>
          </div>
        )}

        {/* Answer inputs */}
        <div className="flex flex-col gap-2.5">
          {NAME_FAMILY_CATEGORIES.map(cat => {
            const val = myAnswers[cat.id] ?? ''
            return (
              <div key={cat.id} className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-16 flex-shrink-0">
                  <p className="font-bold text-sm text-white">{cat.label}</p>
                  <p className="text-xs" style={{ color: '#6D6E71' }}>با {nf.letter} شروع بشه</p>
                </div>
                <input
                  ref={el => { inputRefs.current[cat.id] = el }}
                  value={val}
                  onChange={e => typeAnswer(cat.id, e.target.value)}
                  disabled={myLocked}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const idx = NAME_FAMILY_CATEGORIES.findIndex(c => c.id === cat.id)
                      const next = NAME_FAMILY_CATEGORIES[idx + 1]
                      if (next) inputRefs.current[next.id]?.focus()
                      else submit()
                    }
                  }}
                  placeholder={`${nf.letter}...`}
                  dir="rtl"
                  className="flex-1 rounded-xl px-3 py-2 text-white outline-none text-sm transition-all"
                  style={{
                    background: myLocked ? '#111112' : '#1e1e20',
                    border: `1.5px solid ${val.trim() ? '#06b6d4' : '#2e2e32'}`,
                    opacity: myLocked ? 0.6 : 1,
                  }}
                />
                {val.trim() && (
                  <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: '#06b6d4' }}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Submit */}
        {!myLocked ? (
          <button
            onClick={submit}
            className="btn-game w-full py-4 rounded-2xl font-black text-lg text-white"
            style={{
              background: filledCount > 0
                ? 'linear-gradient(135deg,#06b6d4,#0891b2)'
                : '#1e1e20',
              border: filledCount > 0 ? 'none' : '1.5px solid #2e2e32',
              boxShadow: filledCount > 0 ? '0 4px 20px #06b6d444' : 'none',
            }}>
            {filledCount > 0 ? `✓ تموم شد! (${filledCount}/${NAME_FAMILY_CATEGORIES.length})` : 'هیچ جوابی نداری؟'}
          </button>
        ) : (
          <div className="glass-panel rounded-2xl px-6 py-4 text-center">
            <div className="text-3xl mb-1">⏳</div>
            <p className="font-bold text-white">جواب‌هات ثبت شد!</p>
            <p className="text-sm mt-1" style={{ color: '#6D6E71' }}>
              منتظر {activePlayers.length - lockedCount} نفر دیگه...
            </p>
          </div>
        )}

        {/* Player status row */}
        <div className="flex gap-2 flex-wrap justify-center pb-2">
          {activePlayers.map(p => {
            const c = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            const done = nf.locked[p.id]
            return (
              <div key={p.id} className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: done ? `${c.bg}22` : '#1a1a1c',
                  border: `1px solid ${done ? c.bg : '#2e2e32'}`,
                }}>
                <img src={avatarSrc(p.avatar)} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="text-xs font-bold" style={{ color: done ? c.light : '#6D6E71' }}>{p.name}</span>
                {done && <span className="text-green-400 text-xs">✓</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
