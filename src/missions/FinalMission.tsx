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
const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

// ── CPU AI for the FINAL (Doz) mission ───────────────────────────────────────
// Uses medium-strength heuristic: win → block → center → corner → random.
// Board cells contain player IDs (not 'X'/'O'), so we pass cpuId/humanId.
function cpuPickCell(board: (string | null)[], cpuId: string, humanId: string): number {
  const empty = board.map((c, i) => c === null ? i : -1).filter(i => i >= 0)
  if (!empty.length) return -1

  const wins = (id: string) => {
    for (const [a, b, c] of WIN_LINES) {
      if (board[a] === id && board[b] === id && board[c] === id) return true
    }
    return false
  }

  // Winning move
  for (const i of empty) {
    const b = [...board]; b[i] = cpuId
    let win = false
    for (const [a, bv, c] of WIN_LINES) { if (b[a] === cpuId && b[bv] === cpuId && b[c] === cpuId) { win = true; break } }
    if (win) return i
  }
  // Block human win
  for (const i of empty) {
    const b = [...board]; b[i] = humanId
    let win = false
    for (const [a, bv, c] of WIN_LINES) { if (b[a] === humanId && b[bv] === humanId && b[c] === humanId) { win = true; break } }
    if (win) return i
  }
  // Center
  if (board[4] === null) return 4
  // Corners
  const corners = [0, 2, 6, 8].filter(i => board[i] === null)
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]
  // Random
  return empty[Math.floor(Math.random() * empty.length)]
}

export default function DozMission({ state, dispatch, localPlayerId }: Props) {
  const doz = state.dozState
  const activePlayers = state.players.filter(p => p.connected)
  const ended = state.timeLeft === 0 || state.phase !== 'PLAYING'

  const cpuPlayer = activePlayers.find(p => p.isCPU)
  const humanPlayer = activePlayers.find(p => !p.isCPU)

  // Stable ref so the CPU timeout always reads the latest state
  const dozRef = useRef(doz)
  dozRef.current = doz

  // ── CPU AI turn ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cpuPlayer || !doz) return
    if (doz.currentPlayerId !== cpuPlayer.id) return
    if (doz.roundWinner !== null || ended) return

    const cpuId = cpuPlayer.id
    const humanId = humanPlayer?.id ?? ''

    const delay = 450 + Math.random() * 550
    const timer = setTimeout(() => {
      const currentDoz = dozRef.current
      if (!currentDoz || currentDoz.currentPlayerId !== cpuId) return
      if (currentDoz.roundWinner !== null) return
      const move = cpuPickCell(currentDoz.board, cpuId, humanId)
      if (move === -1) return
      dispatch({ type: 'DOZ_PLACE_CELL', playerId: cpuId, cellIndex: move })
    }, delay)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doz?.currentPlayerId, doz?.roundWinner, ended])

  // ── Auto-reset board after a round ends ───────────────────────────────────
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    if (!doz || doz.roundWinner === null) return
    const topWins = Math.max(...Object.values(doz.scores))
    if (topWins >= 2 || ended) return
    clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
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
    // Block human from placing when it is the CPU's turn or cell is taken
    if (!isMyTurn || board[idx] !== null || doz!.roundWinner !== null || ended) return
    if (currentPlayer?.isCPU) return
    const pid = localPlayerId ?? (activePlayers.find(p => !p.isCPU)?.id ?? activePlayers[0]?.id ?? '')
    dispatch({ type: 'DOZ_PLACE_CELL', playerId: pid, cellIndex: idx })
  }

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

  // p1 = right side (index 0), p2 = left side (index 1) — RTL layout
  const p1 = activePlayers[0]
  const p2 = activePlayers[1]

  function PlayerCard({ player, symIdx }: { player: typeof p1; symIdx: number }) {
    if (!player) return <div />
    const pc = PLAYER_COLORS[player.colorIndex % PLAYER_COLORS.length]
    const isActive = doz!.currentPlayerId === player.id && doz!.roundWinner === null
    const sym = SYMBOLS[symIdx] ?? '?'
    const wins = doz!.scores[player.id] ?? 0
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <img src={avatarSrc(player.avatar)} alt=""
            className="w-12 h-12 rounded-full object-cover transition-all"
            style={{
              border: `3px solid ${isActive ? pc.bg : pc.bg + '44'}`,
              boxShadow: isActive ? `0 0 14px ${pc.bg}88` : 'none',
            }} />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
            style={{ background: pc.bg }}>{sym}</span>
        </div>
        <span className="text-xs font-bold text-white truncate max-w-[72px] text-center">{player.name}</span>
        <span className="font-display text-3xl font-black" style={{ color: pc.light }}>{wins}</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <GameHUD state={state} />

      <div className="flex-1 flex flex-col items-center justify-between p-4 gap-3 overflow-hidden">

        {/* Score header — grid keeps VS centred regardless of name lengths */}
        <div className="w-full max-w-sm flex-shrink-0" style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 8,
        }}>
          {/* In RTL grid: column 1 = rightmost → p1 */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <PlayerCard player={p1} symIdx={0} />
          </div>

          {/* Centre column: VS + draws */}
          <div className="flex flex-col items-center gap-1">
            {doz.draws > 0 && (
              <span className="text-xs font-bold" style={{ color: '#6D6E71' }}>مساوی: {doz.draws}</span>
            )}
            <span className="font-display text-2xl font-black" style={{ color: '#3a3a3e' }}>VS</span>
          </div>

          {/* Column 3 = leftmost → p2 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <PlayerCard player={p2} symIdx={1} />
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
            const isCpuTurn = currentPlayer?.isCPU
            const canClick = isMyTurn && !isCpuTurn && cell === null && doz.roundWinner === null && !ended
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
            currentPlayer?.isCPU ? (
              <p className="text-sm font-bold animate-pulse" style={{ color: '#ffd60a' }}>
                🤖 CPU در حال فکر کردن...
              </p>
            ) : (
              <p className="text-sm font-bold transition-colors" style={{ color: currentColor.light }}>
                {isMyTurn ? '→ نوبت توئه' : `⏳ نوبت ${currentPlayer?.name ?? '...'}`}
              </p>
            )
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
