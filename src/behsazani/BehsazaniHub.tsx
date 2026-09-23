import { useState } from 'react'
import { getBehsazaniGame } from './registry'
import { useBehsazaniRoom, generateBehsazaniCode, generatePlayerId } from '../lib/useBehsazaniRoom'
import MafiaGame from './games/MafiaGame'
import SpyGame from './games/SpyGame'
import ProjectCouncilGame from './games/ProjectCouncilGame'
import CodeBreakersGame from './games/CodeBreakersGame'
import ProjectCodeGame from './games/ProjectCodeGame'
import OneWordGame from './games/OneWordGame'
import AnonymousDrawerGame from './games/AnonymousDrawerGame'
import ITQuizGame from './games/ITQuizGame'
import BehsazanHuntGame from './games/BehsazanHuntGame'
import artBMafia      from '../imports/art-b-mafia.png'
import artBSpy        from '../imports/art-b-spy.png'
import artBCouncil    from '../imports/art-b-council.png'
import artBCodebreak  from '../imports/art-b-codebreak.png'
import artBSecretcode from '../imports/art-b-secretcode.png'
import artBOneword    from '../imports/art-b-oneword.png'
import artBDesigner   from '../imports/art-b-designer.png'
import artBBigrace    from '../imports/art-b-bigrace.png'

const GAME_ART: Record<string, string> = {
  behsazani_mafia:            artBMafia,
  behsazani_spy:              artBSpy,
  behsazani_project_council:  artBCouncil,
  behsazani_code_breakers:    artBCodebreak,
  behsazani_project_code:     artBSecretcode,
  behsazani_one_word:         artBOneword,
  behsazani_anonymous_drawer: artBDesigner,
  behsazani_it_quiz:          artBBigrace,
  behsazani_hunt:             artBBigrace,
}

const base = import.meta.env.BASE_URL ?? '/'
const castleBg = `${base}imgs/Bg-1.jpg`

export interface BehsazaniPlayer {
  id: string
  name: string
  avatar: string
  colorIndex: number
}

interface Props {
  /** Host flow: gameId is known upfront. Joiner flow: undefined (discovered from host) */
  gameId?: string
  hostPlayer: BehsazaniPlayer
  /** When defined, this client is a non-host joiner connecting to an existing online room */
  joinCode?: string
  onExit: () => void
}

type Phase =
  | 'mode-select'
  | 'local-lobby'
  | 'online-host'
  | 'online-joining'
  | 'playing'

const PLAYER_COLORS = [
  '#CC2229', '#3b82f6', '#22c55e', '#f97316', '#a855f7',
  '#ffd60a', '#06b6d4', '#ef4444', '#84cc16', '#ec4899',
]

function playerColor(p: BehsazaniPlayer): string {
  return PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
}

// ─── LOCAL LOBBY ─────────────────────────────────────────────────────────────

interface LocalLobbyProps {
  gameId: string
  hostPlayer: BehsazaniPlayer
  onBack: () => void
  onStart: (players: BehsazaniPlayer[]) => void
}

function LocalLobby({ gameId, hostPlayer, onBack, onStart }: LocalLobbyProps) {
  const game = getBehsazaniGame(gameId)!
  const [players, setPlayers] = useState<BehsazaniPlayer[]>([hostPlayer])
  const [nameInput, setNameInput] = useState('')
  const [error, setError] = useState('')

  function addPlayer() {
    const name = nameInput.trim()
    if (!name) { setError('نام را وارد کن'); return }
    if (players.some(p => p.name === name)) { setError('این اسم تکراری است'); return }
    if (players.length >= game.maxPlayers) { setError(`حداکثر ${game.maxPlayers} بازیکن`); return }
    const p: BehsazaniPlayer = {
      id: generatePlayerId(),
      name,
      avatar: String(players.length % 7),
      colorIndex: players.length % PLAYER_COLORS.length,
    }
    setPlayers(prev => [...prev, p])
    setNameInput('')
    setError('')
  }

  return (
    <div className="h-full flex flex-col" dir="rtl"
      style={{ background: 'linear-gradient(135deg, #0e0e0f, #181618, #1a1010)' }}>
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="btn-game w-9 h-9 rounded-xl flex items-center justify-center font-black text-white"
            style={{ background: 'rgba(255,255,255,0.07)' }}>→</button>
          <div className="text-center">
            <p className="text-2xl">{game.icon}</p>
            <h1 className="font-black text-white text-base">{game.name}</h1>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>بازی محلی</p>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>
          {game.minPlayers}–{game.maxPlayers} بازیکن • {players.length} نفر آماده
        </p>
        <div className="flex flex-col gap-2">
          {players.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(26,26,28,0.85)', border: `1px solid ${playerColor(p)}33` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: playerColor(p) + '33', color: playerColor(p) }}>
                {p.name[0]}
              </div>
              <span className="flex-1 font-bold text-white text-sm">{p.name}</span>
              {p.id === hostPlayer.id
                ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#ffd60a22', color: '#ffd60a' }}>میزبان</span>
                : <button onClick={() => setPlayers(prev => prev.filter(x => x.id !== p.id))}
                    className="btn-game w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: 'rgba(204,34,41,0.2)', color: '#CC2229' }}>✕</button>
              }
            </div>
          ))}
        </div>
        {players.length < game.maxPlayers && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input value={nameInput}
                onChange={e => { setNameInput(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
                placeholder="نام بازیکن جدید..."
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white"
                style={{ background: 'rgba(20,20,22,0.9)', border: `1.5px solid ${error ? '#CC2229' : 'rgba(255,255,255,0.12)'}`, outline: 'none', fontFamily: "'IranSans', sans-serif" }} />
              <button onClick={addPlayer} className="btn-game px-4 py-3 rounded-xl font-black text-white"
                style={{ background: `linear-gradient(135deg, ${game.color}, ${game.color}cc)` }}>+</button>
            </div>
            {error && <p className="text-xs font-bold" style={{ color: '#CC2229' }}>{error}</p>}
          </div>
        )}
        <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(26,26,28,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-black mb-1" style={{ color: game.color }}>قوانین:</p>
          <p className="text-xs leading-relaxed" style={{ color: '#9a9b9e' }}>{getRules(gameId)}</p>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 pb-5 pt-2">
        <button disabled={players.length < game.minPlayers} onClick={() => onStart(players)}
          className="btn-game w-full py-4 rounded-2xl font-black text-white text-lg"
          style={{
            background: players.length >= game.minPlayers ? `linear-gradient(135deg, ${game.color}, ${game.color}cc)` : 'rgba(255,255,255,0.07)',
            opacity: players.length >= game.minPlayers ? 1 : 0.5,
          }}>
          {players.length < game.minPlayers ? `حداقل ${game.minPlayers} بازیکن لازم است` : `شروع بازی! ${game.icon}`}
        </button>
      </div>
    </div>
  )
}

// ─── TEAM ARENA WAITING ROOM (HOST) ──────────────────────────────────────────

interface OnlineHostLobbyProps {
  gameId: string
  hostPlayer: BehsazaniPlayer
  roomCode: string
  onBack: () => void
  onStart: (players: BehsazaniPlayer[]) => void
}

function OnlineHostLobby({ gameId, hostPlayer, roomCode, onBack, onStart }: OnlineHostLobbyProps) {
  const game = getBehsazaniGame(gameId)!
  const [players, setPlayers] = useState<BehsazaniPlayer[]>([hostPlayer])
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [readyIds, setReadyIds] = useState<Set<string>>(new Set([hostPlayer.id]))

  const { status, startGame } = useBehsazaniRoom({
    code: roomCode,
    isHost: true,
    myPlayer: hostPlayer,
    gameId,
    onPlayersChange: (ps) => {
      setPlayers(ps)
      setReadyIds(prev => {
        const next = new Set(prev)
        const ids = new Set(ps.map(p => p.id))
        next.forEach(id => { if (!ids.has(id)) next.delete(id) })
        return next
      })
    },
    onGameStart: (ps) => onStart(ps),
  })

  function copyCode() {
    navigator.clipboard.writeText(roomCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareRoom() {
    const text = `بیا بازی ${game.name} — کد اتاق: ${roomCode}`
    if (navigator.share) {
      navigator.share({ title: game.name, text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).catch(() => {})
    }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  function toggleReady(id: string) {
    setReadyIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function handleStart() {
    startGame(players, gameId, hostPlayer.id)
    onStart(players)
  }

  const canStart = players.length >= game.minPlayers && status === 'connected'
  const allReady = players.every(p => readyIds.has(p.id))

  return (
    <div className="h-full flex flex-col" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #0e0e0f 0%, #16101a 50%, #0e1214 100%)' }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="btn-game w-9 h-9 rounded-xl flex items-center justify-center font-black text-white"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>→</button>
          <div className="text-center">
            <p className="text-2xl">{game.icon}</p>
            <h1 className="font-black text-white text-sm">اتاق انتظار</h1>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>{game.name}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="px-2 py-1 rounded-lg text-xs font-bold"
              style={{
                background: status === 'connected' ? 'rgba(34,197,94,0.15)' : 'rgba(255,214,10,0.15)',
                color: status === 'connected' ? '#22c55e' : '#ffd60a',
                border: `1px solid ${status === 'connected' ? '#22c55e44' : '#ffd60a44'}`,
              }}>
              {status === 'connected' ? '🟢 آنلاین' : '⏳ اتصال...'}
            </div>
            <span className="text-xs" style={{ color: '#6D6E71' }}>میزبان</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

        {/* Room code + share */}
        <div className="rounded-2xl p-4 text-center"
          style={{ background: 'rgba(168,85,247,0.07)', border: '1.5px solid rgba(168,85,247,0.25)' }}>
          <p className="text-xs font-bold mb-2" style={{ color: '#9a9b9e' }}>کد اتاق</p>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="font-black text-3xl tracking-widest"
              style={{ color: '#a855f7', letterSpacing: '0.18em', fontFamily: 'monospace' }}>
              {roomCode}
            </span>
            <button onClick={copyCode} className="btn-game px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{
                background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(168,85,247,0.2)',
                color: copied ? '#22c55e' : '#a855f7',
                border: `1px solid ${copied ? '#22c55e44' : 'rgba(168,85,247,0.3)'}`,
              }}>
              {copied ? '✓ کپی شد' : 'کپی'}
            </button>
          </div>
          <button onClick={shareRoom} className="btn-game w-full py-2 rounded-xl text-sm font-bold"
            style={{
              background: shared ? 'rgba(34,197,94,0.15)' : 'rgba(168,85,247,0.1)',
              color: shared ? '#22c55e' : '#c084fc',
              border: `1px solid ${shared ? '#22c55e33' : 'rgba(168,85,247,0.2)'}`,
            }}>
            {shared ? '✓ لینک ارسال شد' : '🔗 دعوت از دوستان'}
          </button>
        </div>

        {/* Player list with readiness */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black" style={{ color: '#9a9b9e' }}>
              بازیکنان ({players.length}/{game.maxPlayers})
            </p>
            {players.length >= game.minPlayers && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: allReady ? 'rgba(34,197,94,0.15)' : 'rgba(255,214,10,0.12)',
                  color: allReady ? '#22c55e' : '#ffd60a',
                }}>
                {allReady ? '✓ همه آماده' : `${readyIds.size}/${players.length} آماده`}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {players.map((p) => {
              const isReady = readyIds.has(p.id)
              const isHost = p.id === hostPlayer.id
              return (
                <div key={p.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                  style={{
                    background: isReady ? `${playerColor(p)}11` : 'rgba(26,26,28,0.85)',
                    border: `1.5px solid ${isReady ? playerColor(p) + '44' : playerColor(p) + '22'}`,
                  }}>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                      style={{ background: playerColor(p) + '33', color: playerColor(p) }}>
                      {p.name[0]}
                    </div>
                    {isReady && (
                      <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">✅</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white text-sm block truncate">{p.name}</span>
                    <span className="text-xs" style={{ color: isReady ? '#22c55e' : '#6D6E71' }}>
                      {isReady ? 'آماده' : 'در انتظار...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isHost && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#ffd60a22', color: '#ffd60a' }}>
                        میزبان
                      </span>
                    )}
                    <button onClick={() => toggleReady(p.id)}
                      className="btn-game text-xs px-2 py-1 rounded-lg font-bold"
                      style={{
                        background: isReady ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)',
                        color: isReady ? '#22c55e' : '#9a9b9e',
                        border: `1px solid ${isReady ? '#22c55e33' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      {isReady ? '✓' : '○'}
                    </button>
                  </div>
                </div>
              )
            })}
            {Array.from({ length: Math.max(0, game.minPlayers - players.length) }).map((_, i) => (
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

        {/* Rules */}
        <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(26,26,28,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-black mb-1" style={{ color: game.color }}>قوانین بازی:</p>
          <p className="text-xs leading-relaxed" style={{ color: '#9a9b9e' }}>{getRules(gameId)}</p>
        </div>
      </div>

      {/* Start button */}
      <div className="flex-shrink-0 px-4 pb-6 pt-2 flex flex-col gap-2">
        {!canStart && players.length < game.minPlayers && (
          <p className="text-center text-xs" style={{ color: '#9a9b9e' }}>
            برای شروع حداقل {game.minPlayers} بازیکن نیاز است
          </p>
        )}
        <button disabled={!canStart} onClick={handleStart}
          className="btn-game w-full py-4 rounded-2xl font-black text-white text-lg transition-all"
          style={{
            background: canStart
              ? `linear-gradient(135deg, ${game.color}, ${game.color}bb)`
              : 'rgba(255,255,255,0.06)',
            opacity: canStart ? 1 : 0.45,
            boxShadow: canStart ? `0 8px 32px ${game.color}44` : 'none',
          }}>
          {status !== 'connected'
            ? '⏳ در حال اتصال...'
            : !canStart
            ? `منتظر ${game.minPlayers - players.length} بازیکن...`
            : `🚀 شروع بازی! ${game.icon}`}
        </button>
      </div>
    </div>
  )
}

// ─── TEAM ARENA WAITING ROOM (JOINER) ────────────────────────────────────────

interface OnlineJoinerProps {
  joinCode: string
  joinerPlayer: BehsazaniPlayer
  onGameStart: (players: BehsazaniPlayer[], gameId: string, hostId?: string) => void
  onExit: () => void
}

function OnlineJoiner({ joinCode, joinerPlayer, onGameStart, onExit }: OnlineJoinerProps) {
  const [players, setPlayers] = useState<BehsazaniPlayer[]>([])
  const [discoveredGameId, setDiscoveredGameId] = useState<string>('')
  const [started, setStarted] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const { status } = useBehsazaniRoom({
    code: joinCode,
    isHost: false,
    myPlayer: joinerPlayer,
    onPlayersChange: setPlayers,
    onGameStart: (ps, gid, hid) => {
      if (!started) { setStarted(true); onGameStart(ps, gid, hid) }
    },
    onGameIdDiscovered: setDiscoveredGameId,
  })

  const game = discoveredGameId ? getBehsazaniGame(discoveredGameId) : null

  if (status === 'connecting') {
    return (
      <div className="h-full overflow-y-auto" dir="rtl">
      <div className="min-h-full flex flex-col items-center justify-center gap-5 px-6 py-8"
        style={{ background: 'linear-gradient(160deg, #0e0e0f, #16101a, #0e1214)' }}>
        <div className="text-5xl" style={{ animation: 'spin 1.2s linear infinite' }}>⚙️</div>
        <p className="font-black text-white text-xl">در حال اتصال...</p>
        <p className="text-sm" style={{ color: '#9a9b9e' }}>
          کد: <span style={{ color: '#a855f7', fontFamily: 'monospace', letterSpacing: '0.12em' }}>{joinCode}</span>
        </p>
        <button onClick={onExit} className="btn-game px-5 py-2 rounded-xl text-sm font-bold mt-4"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>انصراف</button>
      </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="h-full overflow-y-auto" dir="rtl">
      <div className="min-h-full flex flex-col items-center justify-center gap-5 px-6 py-8"
        style={{ background: 'linear-gradient(160deg, #0e0e0f, #16101a, #0e1214)' }}>
        <div className="text-5xl">⚠️</div>
        <p className="font-black text-white text-xl">اتصال ناموفق</p>
        <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>
          کد اتاق را بررسی کنید یا دوباره تلاش کنید
        </p>
        <button onClick={onExit} className="btn-game px-6 py-3 rounded-xl font-black text-white"
          style={{ background: '#CC2229' }}>بازگشت</button>
      </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #0e0e0f 0%, #16101a 50%, #0e1214 100%)' }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <button onClick={onExit} className="btn-game w-9 h-9 rounded-xl flex items-center justify-center font-black text-white"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>→</button>
          <div className="text-center">
            {game ? (
              <>
                <p className="text-2xl">{game.icon}</p>
                <h1 className="font-black text-white text-sm">اتاق انتظار</h1>
                <p className="text-xs" style={{ color: '#9a9b9e' }}>{game.name}</p>
              </>
            ) : (
              <>
                <p className="text-2xl">🎮</p>
                <h1 className="font-black text-white text-sm">اتاق انتظار</h1>
              </>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="px-2 py-1 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid #22c55e44' }}>
              🟢 آنلاین
            </div>
            <span className="text-xs" style={{ color: '#6D6E71' }}>بازیکن</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

        {/* Room code */}
        <div className="rounded-2xl px-4 py-3 text-center"
          style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>
            کد اتاق: <span style={{ color: '#c084fc', fontFamily: 'monospace', letterSpacing: '0.12em', fontWeight: 900 }}>{joinCode}</span>
          </p>
        </div>

        {/* Waiting message */}
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid #22c55e33' }}>
          <span className="text-xl">⏳</span>
          <p className="text-sm font-bold" style={{ color: '#22c55e' }}>
            منتظر میزبان برای شروع بازی هستید...
          </p>
        </div>

        {/* Ready toggle */}
        <button onClick={() => setIsReady(r => !r)}
          className="btn-game w-full py-3 rounded-2xl font-black text-base transition-all"
          style={{
            background: isReady ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
            color: isReady ? '#22c55e' : '#9a9b9e',
            border: `1.5px solid ${isReady ? '#22c55e44' : 'rgba(255,255,255,0.1)'}`,
          }}>
          {isReady ? '✅ آماده‌ام!' : '○ اعلام آمادگی'}
        </button>

        {/* Player list */}
        <div>
          <p className="text-xs font-black mb-2" style={{ color: '#9a9b9e' }}>
            بازیکنان در اتاق ({players.length})
          </p>
          <div className="flex flex-col gap-2">
            {players.map((p) => {
              const isMe = p.id === joinerPlayer.id
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: isMe && isReady ? `${playerColor(p)}11` : 'rgba(26,26,28,0.85)',
                    border: `1.5px solid ${isMe && isReady ? playerColor(p) + '44' : playerColor(p) + '22'}`,
                  }}>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                      style={{ background: playerColor(p) + '33', color: playerColor(p) }}>
                      {p.name[0]}
                    </div>
                    {isMe && isReady && (
                      <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">✅</span>
                    )}
                  </div>
                  <span className="flex-1 font-bold text-white text-sm truncate">{p.name}</span>
                  <div className="flex items-center gap-2">
                    {isMe && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#a855f722', color: '#a855f7' }}>شما</span>}
                    <span className="text-xs" style={{ color: isMe && isReady ? '#22c55e' : '#6D6E71' }}>
                      {isMe ? (isReady ? 'آماده' : 'در انتظار') : '🟢 وصل'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Exit */}
      <div className="flex-shrink-0 px-4 pb-6 pt-2">
        <button onClick={onExit} className="btn-game w-full py-3 rounded-2xl font-bold text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e', border: '1px solid rgba(255,255,255,0.08)' }}>
          خروج از اتاق
        </button>
      </div>
    </div>
  )
}

// ─── MAIN HUB ────────────────────────────────────────────────────────────────

interface GameContext {
  isOnline: boolean
  isHost: boolean
  roomCode?: string
  hostPlayerId?: string
}

export default function BehsazaniHub({ gameId, hostPlayer, joinCode, onExit }: Props) {
  const isJoiner = !!joinCode
  const [phase, setPhase] = useState<Phase>(isJoiner ? 'online-joining' : 'mode-select')
  const [activePlayers, setActivePlayers] = useState<BehsazaniPlayer[]>([])
  const [activeGameId, setActiveGameId] = useState<string>(gameId ?? '')
  const [roomCode] = useState<string>(() => generateBehsazaniCode())
  const [showRules, setShowRules] = useState(false)
  const [gameCtx, setGameCtx] = useState<GameContext>({ isOnline: false, isHost: true })

  const resolvedGameId = activeGameId || gameId || ''

  if (phase === 'mode-select') {
    const g = getBehsazaniGame(gameId!)
    if (!g) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl"
          style={{ background: 'linear-gradient(135deg, #0e0e0f, #181618, #1a1010)' }}>
          <div className="text-5xl">⚠️</div>
          <p className="font-black text-white">بازی پیدا نشد</p>
          <button onClick={onExit} className="btn-game px-6 py-3 rounded-xl font-black text-white" style={{ background: '#CC2229' }}>بازگشت</button>
        </div>
      )
    }
    const artSrc = GAME_ART[gameId!]
    return (
      <div className="h-full overflow-y-auto" dir="rtl">
      <div className="min-h-full flex flex-col items-center justify-center gap-5 px-6 py-8 relative">
        {/* Castle background — no character overlay */}
        <img src={castleBg} alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
          style={{ zIndex: 0 }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1, background: 'linear-gradient(to bottom, rgba(17,17,18,0.5) 0%, rgba(17,17,18,0.15) 40%, rgba(17,17,18,0.88) 75%, #111112 100%)' }} />

        {/* Content */}
        <div className="relative flex flex-col items-center gap-5 w-full max-w-xs" style={{ zIndex: 10 }}>
          {/* Game artwork */}
          {artSrc && (
            <img src={artSrc} alt={g.name}
              className="object-contain rounded-2xl"
              style={{ width: 200, height: 200, filter: `drop-shadow(0 6px 24px ${g.color}55)` }} />
          )}

          <div className="text-center">
            <h1 className="font-black text-white text-2xl leading-tight">{g.name}</h1>
            <p className="text-sm mt-1" style={{ color: '#9a9b9e' }}>نحوه بازی را انتخاب کنید</p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button onClick={() => setPhase('online-host')}
              className="btn-game w-full flex flex-col items-start gap-1 px-5 py-4 rounded-2xl text-white"
              style={{ background: 'rgba(168,85,247,0.15)', border: '1.5px solid rgba(168,85,247,0.45)', backdropFilter: 'blur(8px)' }}>
              <span className="font-black text-lg">آنلاین — تحت شبکه</span>
              <p className="text-xs mt-0.5" style={{ color: '#9a9b9e' }}>
                کد اتاق بگیرید — دوستان از همه جا وارد شوند
              </p>
            </button>

            <button onClick={() => setPhase('local-lobby')}
              className="btn-game w-full flex flex-col items-start gap-1 px-5 py-4 rounded-2xl text-white"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.35)', backdropFilter: 'blur(8px)' }}>
              <span className="font-black text-lg">محلی — یک دستگاه</span>
              <p className="text-xs mt-0.5" style={{ color: '#9a9b9e' }}>
                همه بازیکنان دور هم — یک گوشی مشترک
              </p>
            </button>
          </div>

          <div className="flex gap-3 w-full">
            <button onClick={onExit}
              className="btn-game flex-1 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#9a9b9e', backdropFilter: 'blur(8px)' }}>
              بازگشت
            </button>
            <button onClick={() => setShowRules(true)}
              className="btn-game flex-1 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: `${g.color}18`, color: g.color, border: `1px solid ${g.color}44`, backdropFilter: 'blur(8px)' }}>
              راهنمای بازی
            </button>
          </div>
        </div>

        {/* Rules bottom sheet */}
        {showRules && (
          <div className="absolute inset-0 flex flex-col justify-end" style={{ zIndex: 50 }}
            onClick={() => setShowRules(false)}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div className="relative rounded-t-3xl px-6 pt-5 pb-8"
              style={{ background: '#1a1a1c', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.2)' }} />
              <div className="flex items-center gap-3 mb-4">
                {artSrc && <img src={artSrc} alt="" className="w-10 h-10 object-contain rounded-xl" />}
                <h2 className="font-black text-white text-lg">راهنمای {g.name}</h2>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#c8c8cc' }}>{getRules(gameId!)}</p>
              <button onClick={() => setShowRules(false)}
                className="btn-game w-full mt-6 py-3 rounded-2xl font-black text-white"
                style={{ background: g.color }}>
                متوجه شدم!
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    )
  }

  if (phase === 'local-lobby') {
    return (
      <LocalLobby
        gameId={gameId!}
        hostPlayer={hostPlayer}
        onBack={() => setPhase('mode-select')}
        onStart={players => {
          setActivePlayers(players)
          setActiveGameId(gameId!)
          setGameCtx({ isOnline: false, isHost: true })
          setPhase('playing')
        }}
      />
    )
  }

  if (phase === 'online-host') {
    return (
      <OnlineHostLobby
        gameId={gameId!}
        hostPlayer={hostPlayer}
        roomCode={roomCode}
        onBack={() => setPhase('mode-select')}
        onStart={players => {
          setActivePlayers(players)
          setActiveGameId(gameId!)
          setGameCtx({ isOnline: true, isHost: true, roomCode, hostPlayerId: hostPlayer.id })
          setPhase('playing')
        }}
      />
    )
  }

  if (phase === 'online-joining') {
    return (
      <OnlineJoiner
        joinCode={joinCode!}
        joinerPlayer={hostPlayer}
        onGameStart={(players, gid, hid) => {
          setActivePlayers(players)
          setActiveGameId(gid)
          setGameCtx({ isOnline: true, isHost: false, roomCode: joinCode!, hostPlayerId: hid })
          setPhase('playing')
        }}
        onExit={onExit}
      />
    )
  }

  if (phase === 'playing') {
    if (!resolvedGameId) return null
    const gameProps = {
      players: activePlayers,
      myPlayer: hostPlayer,
      isHost: gameCtx.isHost,
      isOnline: gameCtx.isOnline,
      roomCode: gameCtx.roomCode,
      hostPlayerId: gameCtx.hostPlayerId ?? hostPlayer.id,
      onExit: () => { setPhase(isJoiner ? 'online-joining' : 'mode-select'); setActivePlayers([]) },
    }
    return (
      <div className="h-full" style={{ background: 'linear-gradient(135deg, #0e0e0f, #181618, #1a1010)' }}>
        {resolvedGameId === 'behsazani_mafia'            && <MafiaGame {...gameProps} />}
        {resolvedGameId === 'behsazani_spy'              && <SpyGame {...gameProps} />}
        {resolvedGameId === 'behsazani_project_council'  && <ProjectCouncilGame {...gameProps} />}
        {resolvedGameId === 'behsazani_code_breakers'    && <CodeBreakersGame {...gameProps} />}
        {resolvedGameId === 'behsazani_project_code'     && <ProjectCodeGame {...gameProps} />}
        {resolvedGameId === 'behsazani_one_word'         && <OneWordGame {...gameProps} />}
        {resolvedGameId === 'behsazani_anonymous_drawer' && <AnonymousDrawerGame {...gameProps} />}
        {resolvedGameId === 'behsazani_it_quiz'          && <ITQuizGame {...gameProps} />}
        {resolvedGameId === 'behsazani_hunt'             && <BehsazanHuntGame {...gameProps} />}
      </div>
    )
  }

  return null
}

function getRules(gameId: string): string {
  const rules: Record<string, string> = {
    behsazani_mafia: 'بازیکنان نقش مخفی دارند. در شب مافیا هدف انتخاب می‌کند، کارآگاه بررسی می‌کند، دکتر نجات می‌دهد. در روز همه گفتگو و رأی‌گیری می‌کنند.',
    behsazani_spy: 'همه مکان را می‌دانند جز جاسوس. با سؤال و جواب جاسوس را پیدا کنید یا جاسوس مکان را حدس بزند.',
    behsazani_project_council: 'رهبر تیم پیشنهاد می‌دهد. رأی‌گیری برای تیم. در مأموریت اعضا مخفیانه موفقیت یا خرابکاری انتخاب می‌کنند.',
    behsazani_code_breakers: 'دو تیم. رمزگذار با یک کلمه سرنخ می‌دهد. تیم کلمات خودشان را روی صفحه پیدا می‌کند. از کلمه مرگ دوری کنید!',
    behsazani_project_code: 'هر تیم کد ۳ رقمی مخفی دارد. رمزگذار با سرنخ‌های کلمه‌ای کد را منتقل می‌کند.',
    behsazani_one_word: 'یک بازیکن حدس می‌زند. بقیه هر کدام یک کلمه سرنخ می‌دهند. سرنخ‌های تکراری حذف می‌شوند.',
    behsazani_anonymous_drawer: 'طراح کلمه را نقاشی می‌کند. بقیه حدس می‌زنند. هر چه سریع‌تر حدس درست = امتیاز بیشتر.',
    behsazani_it_quiz: 'سؤالات چهارگزینه‌ای در حوزه فناوری اطلاعات. هر پاسخ درست + سریع امتیاز می‌دهد.',
    behsazani_hunt: 'پیداکننده‌ها دنبال مخفی‌شونده‌ها می‌گردند. هر بازیکن با دستگاه مستقل خودش بازی می‌کند.',
  }
  return rules[gameId] || 'قوانین در بازی توضیح داده می‌شود.'
}
