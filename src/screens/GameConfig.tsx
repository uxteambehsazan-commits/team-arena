import { useState, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { MISSIONS } from '../constants'
import type { OnlineSession } from '../App'
import MobileHeader from '../components/MobileHeader'
import { MISSION_ART } from '../lib/missionArt'

const CARD_INFO: Record<string, { desc: string; players: string; time: string; type: string; typeColor: string }> = {
  SPEED:       { desc: 'سریع‌ترین هدف رو بزن!',           players: '۲–۸', time: '~۲ دقیقه', type: 'نوبتی',     typeColor: '#f97316' },
  MEMORY:      { desc: 'جفت‌های یکسان رو پیدا کن!',       players: '۲–۸', time: '~۳ دقیقه', type: 'نوبتی',     typeColor: '#a855f7' },
  LOGIC:       { desc: 'الگو رو کشف کن، زودتر جواب بده!',  players: '۲–۸', time: '~۲ دقیقه', type: 'نوبتی',     typeColor: '#3b82f6' },
  FASTEST:     { desc: 'وقتی GO! اومد اولین نفر باش!',     players: '۲–۸', time: '~۱ دقیقه', type: 'همزمان',    typeColor: '#ef4444' },
  TEAM:        { desc: 'با هم ماشین رو روشن کنید!',         players: '۲–۸', time: '~۲ دقیقه', type: 'تیمی',      typeColor: '#22c55e' },
  FINAL:       { desc: 'سه‌تایی بچین، حریف رو شکست بده!', players: '۲',   time: '~۲ دقیقه', type: 'استراتژیک', typeColor: '#CC2229' },
  NAME_FAMILY: { desc: 'جاهای خالی رو با حرف داده‌شده پر کن!', players: '۲–۸', time: '~۳ دقیقه', type: 'همزمان',    typeColor: '#06b6d4' },
  ONE_WORD:    { desc: 'هرچه زودتر سرنخ رو حدس بزنی!',    players: '۲–۸', time: '~۲ دقیقه', type: 'همزمان',    typeColor: '#ffd60a' },
}

const ACCENT: Record<string, string> = {
  SPEED: '#f97316', MEMORY: '#a855f7', LOGIC: '#3b82f6',
  FASTEST: '#ef4444', TEAM: '#22c55e', FINAL: '#CC2229',
  NAME_FAMILY: '#06b6d4', ONE_WORD: '#ffd60a',
}

function toPersian(n: number) {
  return n.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
}

interface Props {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  session?: OnlineSession
}

const MAX_GAMES = 4

export default function GameConfig({ state, dispatch, session }: Props) {
  const isHost = !session || session.isHost
  const isOffline = !session

  const playerCount = Math.max(2, state.players.filter(p => p.connected).length)

  // All missions shown; compute per-mission compatibility reason
  const allMissions = isOffline
    ? MISSIONS.filter(m => m.id !== 'TEAM') // TEAM has no offline AI support
    : MISSIONS

  function incompatibleReason(m: typeof MISSIONS[0]): string | null {
    if (isOffline) {
      if (m.minPlayers > 2) return `نیاز به ${m.minPlayers}+ بازیکن`
      return null
    }
    if (playerCount < m.minPlayers) return `نیاز به حداقل ${m.minPlayers} نفر`
    if (playerCount > m.maxPlayers) return `حداکثر ${m.maxPlayers} نفر`
    return null
  }

  const availableMissions = allMissions

  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const chipBarRef = useRef<HTMLDivElement>(null)

  const stateEnabledMissions = MISSIONS.filter(m => state.enabledMissions.includes(m.id))

  function toggleMission(id: string) {
    setSelectedOrder(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= MAX_GAMES) return prev
      return [...prev, id]
    })
  }

  function startGame() {
    if (selectedOrder.length === 0) return
    dispatch({ type: 'SET_ENABLED_MISSIONS', ids: selectedOrder })
    dispatch({ type: 'CONFIRM_CONFIG' })
  }

  // ── Non-host waiting screen ──────────────────────────────────────────
  if (!isHost) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 game-bg" dir="rtl">
        <div className="text-6xl animate-spin" style={{ animationDuration: '2s' }}>⚙️</div>
        <div className="text-center px-6">
          <p className="font-display text-xl font-black text-white">میزبان داره بازی‌ها رو انتخاب می‌کنه</p>
          <p className="text-sm mt-2" style={{ color: '#6D6E71' }}>منتظر بمون هم‌تیمی...</p>
        </div>
        {stateEnabledMissions.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-center px-6">
            {stateEnabledMissions.map(m => (
              <div key={m.id} className="glass-panel rounded-xl px-3 py-2 text-center"
                style={{ border: `1px solid ${ACCENT[m.id]}44` }}>
                <div className="text-2xl">{m.emoji}</div>
                <div className="text-xs mt-0.5 font-bold" style={{ color: ACCENT[m.id] }}>{m.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const atMax = selectedOrder.length >= MAX_GAMES

  // ── Host: Grid-based Game Hub ──────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden" dir="rtl"
      style={{ background: 'linear-gradient(180deg,#0d0d0f 0%,#12101a 100%)' }}>

      {/* ── Header ── */}
      <MobileHeader
        title="انتخاب بازی‌ها"
        action={
          <div className="flex items-center gap-2">
            {!isOffline && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1e1e22', color: '#6D6E71', border: '1px solid #2e2e32' }}>
                👥 {toPersian(playerCount)}
              </span>
            )}
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: selectedOrder.length >= MAX_GAMES ? '#f9731618' : selectedOrder.length > 0 ? '#CC222918' : '#1e1e20',
                color: selectedOrder.length >= MAX_GAMES ? '#f97316' : selectedOrder.length > 0 ? '#e84249' : '#6D6E71',
                border: `1px solid ${selectedOrder.length >= MAX_GAMES ? '#f9731644' : selectedOrder.length > 0 ? '#CC222944' : '#2e2e32'}`,
              }}>
              {toPersian(selectedOrder.length)}/{toPersian(MAX_GAMES)}
            </span>
          </div>
        }
      />

      {/* ── Selected order chips ── */}
      <div className="flex-shrink-0 px-4 py-2" style={{ minHeight: 44 }}>
        {selectedOrder.length > 0 ? (
          <div ref={chipBarRef} className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {selectedOrder.map((id, orderIdx) => {
              const m = availableMissions.find(x => x.id === id)!
              const col = ACCENT[m.id] ?? '#CC2229'
              return (
                <div key={m.id}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 btn-game"
                  style={{ background: `${col}18`, border: `1.5px solid ${col}55` }}>
                  <span className="text-xs font-black" style={{ color: `${col}99` }}>{toPersian(orderIdx + 1)}</span>
                  <span className="text-sm">{m.emoji}</span>
                  <span className="text-xs font-bold text-white">{m.name}</span>
                  <button onClick={() => toggleMission(m.id)}
                    className="btn-game w-4 h-4 flex items-center justify-center rounded-full text-xs"
                    style={{ color: '#6D6E71' }} aria-label="حذف">×</button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs py-1.5" style={{ color: '#3a3a3e' }}>حداقل یک بازی انتخاب کن</p>
        )}
      </div>

      {/* ── Game Cards Grid ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {availableMissions.map(mission => {
            const info = CARD_INFO[mission.id]
            const accent = ACCENT[mission.id] ?? '#CC2229'
            const art = MISSION_ART[mission.id]
            const isSelected = selectedOrder.includes(mission.id)
            const orderIdx = selectedOrder.indexOf(mission.id)
            const reason = incompatibleReason(mission)
            const incompatible = !!reason
            const disabled = (atMax && !isSelected) || incompatible

            return (
              <button
                key={mission.id}
                onClick={() => !disabled && toggleMission(mission.id)}
                disabled={disabled}
                className="btn-game rounded-3xl flex flex-col overflow-hidden text-right transition-all select-none relative"
                style={{
                  background: isSelected
                    ? `linear-gradient(160deg, ${accent}28, ${accent}12)`
                    : incompatible ? '#111113' : '#161618',
                  border: `2px solid ${isSelected ? accent : incompatible ? '#1e1e20' : '#2a2a2e'}`,
                  boxShadow: isSelected ? `0 4px 24px ${accent}33` : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  opacity: incompatible ? 0.45 : disabled ? 0.4 : 1,
                }}
              >
                {/* Artwork area */}
                <div className="w-full flex items-center justify-center relative overflow-hidden"
                  style={{ height: 100, background: `radial-gradient(ellipse at 50% 60%, ${accent}20 0%, transparent 75%)` }}>
                  <img src={art} alt={mission.name}
                    className="object-contain transition-transform duration-300"
                    style={{ height: 80, width: 'auto', maxWidth: '90%',
                      filter: `drop-shadow(0 4px 12px ${accent}55)`,
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    }} />

                  {/* Order badge when selected */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black"
                      style={{ background: accent, boxShadow: `0 0 8px ${accent}88` }}>
                      {toPersian(orderIdx + 1)}
                    </div>
                  )}

                  {/* Game type badge */}
                  <div className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: `${info.typeColor}22`, color: info.typeColor, border: `1px solid ${info.typeColor}44` }}>
                    {info.type}
                  </div>
                </div>

                {/* Info area */}
                <div className="flex flex-col gap-1 p-3 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{mission.emoji}</span>
                    <span className="font-display font-black text-white text-sm leading-tight line-clamp-1">
                      {mission.name}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#7a7a85' }}>
                    {info.desc}
                  </p>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs" style={{ color: '#5a5a65' }}>
                      👥 {mission.minPlayers === mission.maxPlayers ? toPersian(mission.minPlayers) : `${toPersian(mission.minPlayers)}–${toPersian(mission.maxPlayers)}`}
                    </span>
                    <span className="text-xs" style={{ color: '#5a5a65' }}>⏱ {info.time}</span>
                  </div>

                  {/* Select indicator / incompatibility reason */}
                  <div className="mt-1.5 rounded-xl py-1.5 text-center text-xs font-black transition-all"
                    style={incompatible
                      ? { background: '#1a1010', color: '#e84249aa', border: '1px solid #e8424922' }
                      : isSelected
                        ? { background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }
                        : { background: '#1e1e22', color: '#4a4a55', border: '1px solid #2e2e35' }
                    }>
                    {incompatible ? `⛔ ${reason}` : isSelected ? '✓ انتخاب شد' : '+ انتخاب'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {atMax && (
          <p className="text-center text-xs mt-3 pb-1" style={{ color: '#f97316' }}>
            ⛔ سقف {toPersian(MAX_GAMES)} بازی — یکی رو حذف کن تا بتونی بازی جدید اضافه کنی
          </p>
        )}
      </div>

      {/* ── Start button ── */}
      <div className="flex-shrink-0 px-4 pb-5 pt-3" style={{ borderTop: '1px solid #1e1e22' }}>
        <button
          onClick={startGame}
          disabled={selectedOrder.length === 0}
          className="btn-game w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-30 transition-all"
          style={{
            background: selectedOrder.length > 0
              ? 'linear-gradient(135deg,#CC2229,#e84249)'
              : '#1e1e20',
            boxShadow: selectedOrder.length > 0 ? '0 4px 24px #CC222966' : 'none',
          }}>
          {selectedOrder.length === 0
            ? 'انتخاب کن تا شروع کنیم'
            : `🚀 بزن بریم! (${toPersian(selectedOrder.length)} بازی)`}
        </button>
      </div>
    </div>
  )
}
