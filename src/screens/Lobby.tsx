import { useState, useEffect, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS, generateRoomCode, GAME_NAME, MISSIONS } from '../constants'
import { AVATAR_IMGS, AVATAR_NAMES } from '../lib/avatars'
import type { OnlineSession } from '../App'

interface Props {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  session?: OnlineSession
  onExit?: () => void
}

const LOCAL_ROOM_CODE = generateRoomCode()

function buildInviteText(code: string): string {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  return `🎮 بیا یه دور بازی کنیم!\n\nیه دورهمی در «${GAME_NAME}» در انتظارته!\n\n۱. این لینک رو باز کن:\n${url}\n\n۲. روی «ورود با کد» بزن\n۳. کد دورهمی رو وارد کن:\n\n   ${code}\n\nبهسازان ملت | TEAMMATES ARENA`
}

async function shareInvite(code: string, onDone: () => void) {
  const text = buildInviteText(code)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  if (navigator.share) {
    try { await navigator.share({ title: GAME_NAME, text, url }); onDone(); return } catch { /**/ }
  }
  try { await navigator.clipboard.writeText(text); onDone() } catch { /**/ }
}

function toFarsiNum(n: number): string {
  return n.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸'[+d] ?? d)
}

function LobbyCountdownOverlay({ value }: { value: number }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(6,6,8,0.92)', backdropFilter: 'blur(10px)' }}>
      <div key={value} className="font-black text-center"
        style={{
          fontSize: 'clamp(80px,25vw,130px)',
          color: value === 1 ? '#CC2229' : '#fff',
          textShadow: `0 0 60px ${value === 1 ? '#CC2229' : '#ffffff55'}`,
          lineHeight: 1,
          animation: 'countdownPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
        {value}
      </div>
      <p className="font-black mt-4" style={{ color: '#CC2229', fontSize: 13, letterSpacing: '0.25em' }}>
        آماده باش!
      </p>
    </div>
  )
}

export default function Lobby({ state, dispatch, session, onExit }: Props) {
  const roomCode  = session?.code ?? LOCAL_ROOM_CODE
  const isOnline  = !!session
  const isHost    = !isOnline || !!session?.isHost

  const [name,   setName]   = useState('')
  const [avatar, setAvatar] = useState(0)
  const [color,  setColor]  = useState(1)
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [startErr, setStartErr] = useState('')

  const activePlayers = state.players.filter(p => p.connected)
  const minRequired   = state.enabledMissions.length > 0
    ? Math.max(...MISSIONS.filter(m => state.enabledMissions.includes(m.id)).map(m => m.minPlayers))
    : 2
  const allReady      = activePlayers.length >= minRequired && activePlayers.every(p => p.ready)
  const canStart      = activePlayers.length >= minRequired
  const usedColors    = state.players.map(p => p.colorIndex)
  const isFull        = activePlayers.length >= 8
  const countdown     = state.lobbyCountdown ?? 0
  const readyCount    = activePlayers.filter(p => p.ready).length

  const errTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    if (startErr) {
      clearTimeout(errTimerRef.current)
      errTimerRef.current = setTimeout(() => setStartErr(''), 3000)
    }
  }, [startErr])

  function toggleReady(id: string) { dispatch({ type: 'TOGGLE_READY', id }) }

  function tryStart() {
    if (!canStart) { setStartErr(`برای شروع این بازی حداقل ${minRequired} بازیکن لازم است.`); return }
    dispatch({ type: 'START_GAME' })
  }

  function addPlayer() {
    if (!name.trim() || state.players.length >= 8) return
    dispatch({ type: 'ADD_PLAYER', name: name.trim(), avatar: String(avatar), colorIndex: color })
    setName('')
    setAdding(false)
    const next = [0,1,2,3,4,5,6,7].find(c => !usedColors.includes(c) && c !== color) ?? 2
    setColor(next)
    setAvatar(prev => (prev + 1) % 10)
  }

  function handleShare() {
    shareInvite(roomCode, () => {
      setShared(true)
      setCopied(true)
      setTimeout(() => { setShared(false); setCopied(false) }, 2500)
    })
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative" dir="rtl"
      style={{
        background: 'linear-gradient(160deg, #0e0e0f 0%, #16101a 50%, #0e1214 100%)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>

      {/* Countdown overlay */}
      {countdown > 0 && (
        <div className="fixed inset-0 z-50">
          <LobbyCountdownOverlay value={countdown} />
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => {
            if (onExit) { onExit() } else { dispatch({ type: 'NEW_PLAYERS' }) }
          }}
            className="btn-game w-9 h-9 rounded-xl flex items-center justify-center font-black text-white"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            →
          </button>
          <div className="text-center">
            <p className="text-2xl">🎮</p>
            <h1 className="font-black text-white text-sm">اتاق انتظار</h1>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>{GAME_NAME}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="px-2 py-1 rounded-lg text-xs font-bold"
              style={{
                background: isOnline ? 'rgba(34,197,94,0.15)' : 'rgba(255,214,10,0.15)',
                color: isOnline ? '#22c55e' : '#ffd60a',
                border: `1px solid ${isOnline ? '#22c55e44' : '#ffd60a44'}`,
              }}>
              {isOnline ? '🟢 آنلاین' : '🟡 محلی'}
            </div>
            {isHost && <span className="text-xs" style={{ color: '#6D6E71' }}>میزبان</span>}
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

        {/* Room code card */}
        <div className="rounded-2xl p-4 text-center"
          style={{ background: 'rgba(168,85,247,0.07)', border: '1.5px solid rgba(168,85,247,0.25)' }}>
          <p className="text-xs font-bold mb-2" style={{ color: '#9a9b9e' }}>کد اتاق</p>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="font-black text-3xl tracking-widest"
              style={{ color: '#a855f7', letterSpacing: '0.18em', fontFamily: 'monospace' }}>
              {roomCode}
            </span>
            <button onClick={copyCode}
              className="btn-game px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{
                background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(168,85,247,0.2)',
                color: copied ? '#22c55e' : '#a855f7',
                border: `1px solid ${copied ? '#22c55e44' : 'rgba(168,85,247,0.3)'}`,
              }}>
              {copied ? '✓ کپی شد' : 'کپی'}
            </button>
          </div>
          <button onClick={handleShare}
            className="btn-game w-full py-2 rounded-xl text-sm font-bold"
            style={{
              background: shared ? 'rgba(34,197,94,0.15)' : 'rgba(168,85,247,0.1)',
              color: shared ? '#22c55e' : '#c084fc',
              border: `1px solid ${shared ? '#22c55e33' : 'rgba(168,85,247,0.2)'}`,
            }}>
            {shared ? '✓ لینک ارسال شد' : '🔗 دعوت از دوستان'}
          </button>
        </div>

        {/* Player list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black" style={{ color: '#9a9b9e' }}>
              بازیکنان ({toFarsiNum(activePlayers.length)}/{toFarsiNum(8)})
            </p>
            {activePlayers.length >= minRequired && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: allReady ? 'rgba(34,197,94,0.15)' : 'rgba(255,214,10,0.12)',
                  color: allReady ? '#22c55e' : '#ffd60a',
                }}>
                {allReady ? '✓ همه آماده' : `${toFarsiNum(readyCount)}/${toFarsiNum(activePlayers.length)} آماده`}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {activePlayers.map((p) => {
              const pc      = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
              const pIsHost = p.id === state.hostId
              return (
                <div key={p.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all animate-fade-up"
                  style={{
                    background: p.ready ? `${pc.bg}11` : 'rgba(26,26,28,0.85)',
                    border: `1.5px solid ${p.ready ? pc.bg + '44' : pc.bg + '22'}`,
                  }}>
                  {/* Circle avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                      style={{ background: pc.bg + '33', color: pc.bg }}>
                      {p.name[0]}
                    </div>
                    {p.ready && (
                      <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">✅</span>
                    )}
                  </div>
                  {/* Name + status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white text-sm truncate">{p.name}</span>
                      {pIsHost && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: '#ffd60a18', color: '#ffd60a', border: '1px solid #ffd60a33', fontSize: 9 }}>
                          👑 میزبان
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: p.ready ? '#22c55e' : '#6D6E71' }}>
                      {p.ready ? 'آماده' : 'در انتظار...'}
                    </span>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleReady(p.id)} disabled={countdown > 0}
                      className="btn-game text-xs px-2 py-1 rounded-lg font-bold"
                      style={{
                        background: p.ready ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)',
                        color: p.ready ? '#22c55e' : '#9a9b9e',
                        border: `1px solid ${p.ready ? '#22c55e33' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      {p.ready ? '✓' : '○'}
                    </button>
                    {isHost && !pIsHost && (
                      <button onClick={() => dispatch({ type: 'REMOVE_PLAYER', id: p.id })} disabled={countdown > 0}
                        className="btn-game w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: 'rgba(204,34,41,0.2)', color: '#CC2229' }}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Empty slots to fill up to minRequired */}
            {Array.from({ length: Math.max(0, minRequired - activePlayers.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-sm" style={{ color: '#3a3a3e' }}>?</span>
                </div>
                <span className="text-sm" style={{ color: '#3a3a3e' }}>منتظر بازیکن...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add player — local mode */}
        {!isOnline && !isFull && !adding && (
          <button onClick={() => setAdding(true)}
            className="btn-game flex items-center justify-center gap-2 rounded-2xl px-4 py-3"
            style={{ border: '1.5px dashed #CC222940', color: '#CC2229', background: '#CC222908' }}>
            <span className="text-lg font-black">+</span>
            <span className="font-bold text-sm">افزودن بازیکن</span>
          </button>
        )}

        {/* Add player form */}
        {adding && !isOnline && (
          <div className="rounded-2xl p-4 flex flex-col gap-3 animate-slide-up"
            style={{ background: '#111116', border: '1px solid #CC222940' }}>
            <p className="font-black text-sm" style={{ color: '#CC2229' }}>بازیکن جدید</p>
            <input
              className="w-full rounded-xl px-4 py-3 text-white outline-none text-sm"
              style={{ background: '#1a1a20', border: '1.5px solid #CC222966', fontFamily: "'IranSans', sans-serif" }}
              placeholder="اسم بازیکن..." value={name} maxLength={14}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
              autoFocus
            />
            <div>
              <p className="text-xs mb-2" style={{ color: '#6D6E71' }}>آواتار</p>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_IMGS.slice(0, 10).map((src, i) => (
                  <button key={i} onClick={() => setAvatar(i)}
                    className="btn-game rounded-xl overflow-hidden"
                    style={{
                      width: 44, height: 44,
                      border: `2px solid ${avatar === i ? '#CC2229' : '#2e2e38'}`,
                      background: avatar === i ? '#CC222918' : '#111116',
                      opacity: avatar === i ? 1 : 0.55,
                    }}>
                    <img src={src} alt={AVATAR_NAMES[i]} className="w-full h-full" style={{ objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs mb-2" style={{ color: '#6D6E71' }}>رنگ</p>
              <div className="flex gap-2 flex-wrap">
                {PLAYER_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setColor(i)} disabled={usedColors.includes(i)}
                    className="btn-game w-8 h-8 rounded-full disabled:opacity-25"
                    style={{
                      background: c.bg,
                      border: `3px solid ${color === i ? '#fff' : 'transparent'}`,
                      transform: color === i ? 'scale(1.2)' : 'scale(1)',
                    }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setAdding(false)}
                className="btn-game flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#1a1a20', border: '1.5px solid #2e2e38', color: '#6D6E71' }}>
                لغو
              </button>
              <button onClick={addPlayer} disabled={!name.trim()}
                className="btn-game py-3 px-5 rounded-xl font-black text-white text-sm disabled:opacity-35"
                style={{ flex: 2, background: 'linear-gradient(135deg,#CC2229,#e84249)' }}>
                اضافه کن
              </button>
            </div>
          </div>
        )}

        {/* Selected missions summary */}
        {isHost && state.enabledMissions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {state.enabledMissions.map(id => {
              const isFinalGame = id === 'FINAL'
              const tooMany     = isFinalGame && activePlayers.length > 2
              return (
                <span key={id}
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: tooMany ? '#CC222918' : '#ffffff0a',
                    border: `1px solid ${tooMany ? '#CC222955' : '#ffffff18'}`,
                    color: tooMany ? '#e84249' : '#6D6E71',
                  }}
                  title={tooMany ? 'دوز فقط ۲ نفره — اولین ۲ بازیکن بازی می‌کنند' : undefined}>
                  {isFinalGame ? '♟️ دوز' : id}
                  {tooMany ? ' ⚠️' : ''}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="flex-shrink-0 px-4 pb-6 pt-2 flex flex-col gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

        {startErr && (
          <div className="px-3 py-2 rounded-xl text-center text-xs font-bold animate-slide-up"
            style={{ background: '#CC222918', border: '1px solid #CC222955', color: '#e84249' }}>
            {startErr}
          </div>
        )}

        {isHost ? (
          <>
            {!canStart && (
              <p className="text-center text-xs" style={{ color: '#9a9b9e' }}>
                برای شروع حداقل {minRequired} بازیکن نیاز است
              </p>
            )}
            <button
              onClick={tryStart}
              disabled={!canStart || countdown > 0}
              className="btn-game w-full py-4 rounded-2xl font-black text-xl text-white transition-all"
              style={canStart
                ? {
                    background: 'linear-gradient(135deg, #CC2229, #e84249)',
                    boxShadow: '0 8px 32px #CC222966',
                    animation: allReady ? 'ctaBreathe 2s ease-in-out infinite' : undefined,
                    opacity: countdown > 0 ? 0.5 : 1,
                  }
                : { background: 'rgba(255,255,255,0.06)', opacity: 0.45 }}>
              {countdown > 0
                ? `${countdown}...`
                : !canStart
                  ? `منتظر ${minRequired - activePlayers.length} بازیکن...`
                  : '🚀 شروع بازی!'}
            </button>
          </>
        ) : (
          <div className="text-center py-3 rounded-2xl"
            style={{ background: 'rgba(26,26,28,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-sm font-black" style={{ color: 'rgba(255,255,255,0.6)' }}>
              ⏳ منتظر شروع بازی توسط میزبان...
            </div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
              آماده شدنت رو اعلام کن
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
