import { useEffect, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'
import GameHUD from '../components/GameHUD'

interface Props {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  localPlayerId?: string
}

const SYMBOLS = ['X', 'O', '△', '□', '★', '◆', '♠', '♣']

export default function DozMission({ state, dispatch, localPlayerId }: Props) {
  const doz = state.dozState
  const activePlayers = state.players.filter(p => p.connected)
  const ended = state.timeLeft === 0 || state.phase !== 'PLAYING'

  // Auto-reset board after a round ends (roundWinner set but game not over)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    if (!doz || doz.roundWinner === null) return
    // Check if game is over (a player has 2+ wins)
    const topWins = Math.max(...Object.values(doz.scores))
    if (topWins >= 2 || ended) return
    clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      // Reset board for next round by dispatching a reset action
      dispatch({ type: 'DOZ_RESET_ROUND' } as any)
    }, 1800)
    return () => clearTimeout(resetTimerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doz?.roundWinner])

  if (!doz) {
    return (
      <div className="h-full flex flex-col items-center justify-center" dir="rtl">
        <GameHUD state={state} />
        <p className="text-gray-400">در حال آماده‌سازی...</p>
      </div>
    )
  }

  const board = doz.board
  const currentPlayer = activePlayers.find(p => p.id === doz.currentPlayerId)
  const currentColor = currentPlayer ? PLAYER_COLORS[currentPlayer.colorIndex % PLAYER_COLORS.length] : PLAYER_COLORS[0]
  const isMyTurn = localPlayerId ? doz.currentPlayerId === localPlayerId : true

  function handleCellClick(idx: number) {
    if (!isMyTurn || board[idx] !== null || doz!.roundWinner !== null || ended) return
    const pid = localPlayerId ?? (activePlayers[0]?.id ?? '')
    dispatch({ type: 'DOZ_PLACE_CELL', playerId: pid, cellIndex: idx })
  }

  // Player display order: first 2 active players
  const p1 = activePlayers[0]
  const p2 = activePlayers[1]
  const p1Color = p1 ? PLAYER_COLORS[p1.colorIndex % PLAYER_COLORS.length] : PLAYER_COLORS[0]
  const p2Color = p2 ? PLAYER_COLORS[p2.colorIndex % PLAYER_COLORS.length] : PLAYER_COLORS[1]

  // Assign symbols per player index
  function symbolFor(playerId: string) {
    const idx = activePlayers.findIndex(p => p.id === playerId)
    return SYMBOLS[idx] ?? '?'
  }

  function colorFor(playerId: string) {
    const p = activePlayers.find(x => x.id === playerId)
    return p ? PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length] : PLAYER_COLORS[0]
  }

  const roundWinnerPlayer = doz.roundWinner && doz.roundWinner !== 'draw'
    ? activePlayers.find(p => p.id === doz.roundWinner)
    : null

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <GameHUD state={state} />

      <div className="flex-1 flex flex-col items-center justify-between p-4 gap-3 overflow-hidden">

        {/* Score header — show all players */}
        <div className="w-full max-w-sm flex items-center justify-between flex-shrink-0">
          {activePlayers.slice(0, 2).map((p, i) => {
            const pc = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
            const isActive = doz.currentPlayerId === p.id && doz.roundWinner === null
            const sym = SYMBOLS[i] ?? '?'
            const wins = doz.scores[p.id] ?? 0
            return (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <img src={avatarSrc(p.avatar)} alt=""
                    className="w-12 h-12 rounded-full object-cover transition-all"
                    style={{
                      border: `3px solid ${isActive ? pc.bg : pc.bg + '44'}`,
                      boxShadow: isActive ? `0 0 14px ${pc.bg}88` : 'none',
                    }} />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: pc.bg }}>{sym}</span>
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[72px]">{p.name}</span>
                <span className="font-display text-3xl font-black" style={{ color: pc.light }}>{wins}</span>
              </div>
            )
          })}

          {/* Center VS + draws */}
          <div className="flex flex-col items-center gap-1">
            {doz.draws > 0 && (
              <span className="text-xs font-bold" style={{ color: '#6D6E71' }}>مساوی: {doz.draws}</span>
            )}
            <span className="font-display text-2xl font-black" style={{ color: '#3a3a3e' }}>VS</span>
          </div>
        </div>

        {/* Round result banner */}
        {doz.roundWinner !== null && (
          <div className="flex-shrink-0 text-center animate-pop-in">
            {doz.roundWinner === 'draw'
              ? <p className="font-display text-xl font-black text-yellow-400">🤝 مساوی!</p>
              : roundWinnerPlayer
                ? <p className="font-display text-xl font-black" style={{ color: colorFor(roundWinnerPlayer.id).light }}>
                    🎉 {roundWinnerPlayer.name} برد!
                  </p>
                : null
            }
          </div>
        )}

        {/* 3×3 Board */}
        <div className="flex-shrink-0" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          width: 'min(calc(100vw - 4rem), 280px)',
        }}>
          {board.map((cell, idx) => {
            const isWinCell = doz.winLine?.includes(idx) ?? false
            const cellColor = cell ? colorFor(cell) : null
            const canClick = isMyTurn && cell === null && doz.roundWinner === null && !ended
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={!canClick}
                className="rounded-2xl flex items-center justify-center transition-all duration-200 select-none"
                style={{
                  aspectRatio: '1',
                  background: isWinCell
                    ? `${cellColor?.bg}44`
                    : cell ? `${cellColor!.bg}22` : canClick ? '#1e1e24' : '#1a1a1e',
                  border: `2.5px solid ${isWinCell ? cellColor?.bg : cell ? cellColor!.bg + '66' : canClick ? '#3a3a44' : '#242428'}`,
                  boxShadow: isWinCell ? `0 0 20px ${cellColor?.bg}77` : 'none',
                  transform: isWinCell ? 'scale(1.06)' : 'scale(1)',
                  cursor: canClick ? 'pointer' : 'default',
                }}
              >
                {cell && (
                  <span className="font-display font-black" style={{ fontSize: 36, color: colorFor(cell).light }}>
                    {symbolFor(cell)}
                  </span>
                )}
                {!cell && canClick && (
                  <span className="text-2xl opacity-15 text-white">+</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Status */}
        <div className="flex-shrink-0 text-center" style={{ minHeight: 28 }}>
          {ended ? (
            <p className="text-sm font-bold" style={{ color: '#6D6E71' }}>
              {(() => {
                const topWins = Math.max(...activePlayers.map(p => doz.scores[p.id] ?? 0))
                const winner = activePlayers.find(p => (doz.scores[p.id] ?? 0) === topWins)
                return winner ? `🏆 ${winner.name} برنده شد!` : '🤝 مساوی!'
              })()}
            </p>
          ) : doz.roundWinner === null ? (
            <p className="text-sm font-bold transition-colors" style={{ color: currentColor.light }}>
              {isMyTurn ? '→ نوبت توئه' : `⏳ نوبت ${currentPlayer?.name ?? '...'}`}
            </p>
          ) : (
            <p className="text-xs" style={{ color: '#6D6E71' }}>⏳ آماده برای دور بعد...</p>
          )}
        </div>

        <p className="flex-shrink-0 text-xs" style={{ color: '#2e2e38' }}>
          اول به ۲ برد برسی می‌بری
        </p>
      </div>
    </div>
  )
}
