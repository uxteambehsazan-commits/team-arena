import { useState, useEffect, useRef } from 'react'

const N = 13
const K = 5
const TOTAL = N * N

type Cell = 0 | 1 | 2
type Difficulty = 'easy' | 'hard'

function genWinLines(): number[][] {
  const lines: number[][] = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (c + K <= N) {
        const l: number[] = []
        for (let k = 0; k < K; k++) l.push(r * N + c + k)
        lines.push(l)
      }
      if (r + K <= N) {
        const l: number[] = []
        for (let k = 0; k < K; k++) l.push((r + k) * N + c)
        lines.push(l)
      }
      if (c + K <= N && r + K <= N) {
        const l: number[] = []
        for (let k = 0; k < K; k++) l.push((r + k) * N + c + k)
        lines.push(l)
      }
      if (c - K + 1 >= 0 && r + K <= N) {
        const l: number[] = []
        for (let k = 0; k < K; k++) l.push((r + k) * N + c - k)
        lines.push(l)
      }
    }
  }
  return lines
}

const WIN_LINES = genWinLines()

function checkWin(board: Cell[], player: Cell): boolean {
  return WIN_LINES.some(line => line.every(i => board[i] === player))
}

function scoreCell(board: Cell[], idx: number, player: Cell): number {
  const opp = player === 1 ? 2 : 1 as Cell
  const tempB = [...board]; tempB[idx] = player
  const tempO = [...board]; tempO[idx] = opp
  let score = 0

  for (const line of WIN_LINES) {
    if (!line.includes(idx)) continue
    const p = line.filter(i => tempB[i] === player).length
    const o = line.filter(i => board[i] === opp).length
    if (o === 0) score += p * p
    const op = line.filter(i => tempO[i] === opp).length
    const po = line.filter(i => board[i] === player).length
    if (po === 0) score += op * op * 0.9
  }

  return score
}

function getCpuMove(board: Cell[], difficulty: Difficulty): number {
  const empty = Array.from({ length: TOTAL }, (_, i) => i).filter(i => board[i] === 0)
  if (!empty.length) return -1

  if (difficulty === 'easy') {
    // Pick randomly from cells near existing pieces
    const withNeighbors = empty.filter(i => {
      const r = Math.floor(i / N), c = i % N
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < N && nc >= 0 && nc < N && board[nr * N + nc] !== 0) return true
      }
      return false
    })
    const pool = withNeighbors.length ? withNeighbors : empty
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // Win immediately if possible
  for (const i of empty) {
    const b2 = [...board] as Cell[]; b2[i] = 2
    if (checkWin(b2, 2)) return i
  }
  // Block opponent win
  for (const i of empty) {
    const b2 = [...board] as Cell[]; b2[i] = 1
    if (checkWin(b2, 1)) return i
  }

  let best = -1, bestScore = -1
  for (const i of empty) {
    const s = scoreCell(board, i, 2)
    if (s > bestScore) { bestScore = s; best = i }
  }
  return best !== -1 ? best : empty[Math.floor(Math.random() * empty.length)]
}

export default function GomokuGame({ onExit }: { onExit: () => void }) {
  const [board, setBoard] = useState<Cell[]>(Array(TOTAL).fill(0))
  const [turn, setTurn] = useState<1 | 2>(1)
  const [winner, setWinner] = useState<0 | 1 | 2>(0)
  const [isDraw, setIsDraw] = useState(false)
  const [mode, setMode] = useState<'select' | 'cpu' | 'local'>('select')
  const [difficulty, setDifficulty] = useState<Difficulty>('hard')
  const [lastMove, setLastMove] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  const boardRef = useRef(board)
  const turnRef  = useRef(turn)
  boardRef.current = board
  turnRef.current  = turn

  const cpuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function reset() {
    setBoard(Array(TOTAL).fill(0))
    setTurn(1); setWinner(0); setIsDraw(false); setLastMove(null)
  }

  function handleClick(i: number) {
    if (winner || isDraw || board[i] !== 0) return
    if (mode === 'cpu' && turn !== 1) return
    placeStone(i)
  }

  function placeStone(i: number) {
    const cur = turnRef.current
    const nb = [...boardRef.current] as Cell[]
    nb[i] = cur
    setBoard(nb)
    setLastMove(i)

    if (checkWin(nb, cur)) { setWinner(cur); return }
    if (nb.every(c => c !== 0)) { setIsDraw(true); return }

    const next = cur === 1 ? 2 : 1
    setTurn(next as 1 | 2)

    if (mode === 'cpu' && next === 2) {
      cpuTimer.current = setTimeout(() => {
        const m = getCpuMove(boardRef.current, difficulty)
        if (m !== -1) placeCpu(m)
      }, 300)
    }
  }

  function placeCpu(i: number) {
    const nb = [...boardRef.current] as Cell[]
    nb[i] = 2
    setBoard(nb)
    setLastMove(i)

    if (checkWin(nb, 2)) { setWinner(2); return }
    if (nb.every(c => c !== 0)) { setIsDraw(true); return }
    setTurn(1)
  }

  useEffect(() => () => { if (cpuTimer.current) clearTimeout(cpuTimer.current) }, [])

  const CELL = 26

  if (mode === 'select') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 600, background: '#060610',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: 24,
      }} dir="rtl">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>⚫⚪</div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 4px' }}>گوموکو</h2>
          <p style={{ color: '#ffffff50', fontSize: 13, margin: 0 }}>تخته ۱۳×۱۳ — ۵ تا پشت سر هم</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
          <button onClick={() => { setMode('cpu'); reset() }} style={{
            padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 15,
            background: '#10b98122', border: '2px solid #10b981', color: '#fff', cursor: 'pointer',
          }}>🤖 بازی با CPU</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['easy', 'hard'] as const).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                flex: 1, padding: '8px 0', borderRadius: 10, fontWeight: 700, fontSize: 13,
                background: difficulty === d ? '#10b98122' : 'transparent',
                border: `2px solid ${difficulty === d ? '#10b981' : '#ffffff20'}`,
                color: difficulty === d ? '#10b981' : '#ffffff60', cursor: 'pointer',
              }}>
                {d === 'easy' ? 'آسان' : 'سخت'}
              </button>
            ))}
          </div>
          <button onClick={() => { setMode('local'); reset() }} style={{
            padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 15,
            background: '#6366f122', border: '2px solid #6366f1', color: '#fff', cursor: 'pointer',
          }}>👥 دو نفره محلی</button>
        </div>
        <button onClick={onExit} style={{
          color: '#ffffff40', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginTop: 4,
        }}>بازگشت</button>
      </div>
    )
  }

  const STONE_COLORS = { 1: '#f8f8f8', 2: '#1a1a1a' }
  const TURN_NAMES = { 1: 'بازیکن ۱ (سفید)', 2: mode === 'cpu' ? 'CPU (مشکی)' : 'بازیکن ۲ (مشکی)' }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600, background: '#060610',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      padding: '12px 8px', overflowY: 'auto',
    }} dir="rtl">
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', maxWidth: 360, marginBottom: 8,
      }}>
        <button onClick={() => setMode('select')} style={{
          color: '#ffffff40', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
        }}>← بازگشت</button>
        <span style={{ color: '#10b981', fontWeight: 900, fontSize: 14 }}>گوموکو ۱۳×۱۳</span>
        <button onClick={onExit} style={{
          color: '#ffffff30', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11,
        }}>خروج</button>
      </div>

      {/* Status */}
      {!winner && !isDraw && (
        <div style={{
          color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 8,
          padding: '6px 14px', borderRadius: 10,
          background: '#ffffff10', border: '1px solid #ffffff20',
        }}>
          نوبت: {TURN_NAMES[turn]}
          <span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
            background: STONE_COLORS[turn], border: '1px solid #ffffff40',
            marginRight: 6, verticalAlign: 'middle',
          }} />
        </div>
      )}
      {(winner > 0 || isDraw) && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 14, marginBottom: 10,
          background: '#0d0d1a', border: '1px solid #ffd60a44',
        }}>
          <span style={{ color: '#ffd60a', fontSize: 20, fontWeight: 900 }}>
            {isDraw ? '🤝 مساوی!' : `🏆 ${TURN_NAMES[winner as 1 | 2]} برنده شد!`}
          </span>
          <button onClick={reset} style={{
            padding: '8px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13,
            background: '#10b98122', border: '2px solid #10b981', color: '#fff', cursor: 'pointer',
          }}>بازی مجدد</button>
        </div>
      )}

      {/* Board */}
      <div style={{
        position: 'relative',
        background: '#c8955c',
        borderRadius: 8,
        padding: CELL / 2,
        boxShadow: '0 4px 24px #00000060',
        touchAction: 'none',
        overflowX: 'auto',
      }}>
        {/* Grid lines */}
        <svg
          width={(N - 1) * CELL}
          height={(N - 1) * CELL}
          style={{ position: 'absolute', top: CELL / 2, left: CELL / 2, pointerEvents: 'none' }}
        >
          {Array.from({ length: N }, (_, i) => (
            <g key={i}>
              <line x1={i * CELL} y1={0} x2={i * CELL} y2={(N - 1) * CELL} stroke="#5a3a1a" strokeWidth={0.8} />
              <line x1={0} y1={i * CELL} x2={(N - 1) * CELL} y2={i * CELL} stroke="#5a3a1a" strokeWidth={0.8} />
            </g>
          ))}
          {/* Star points */}
          {[3, 9].flatMap(r => [3, 9].map(c => (
            <circle key={`${r}-${c}`} cx={c * CELL} cy={r * CELL} r={3} fill="#5a3a1a" />
          )))}
          <circle cx={6 * CELL} cy={6 * CELL} r={3} fill="#5a3a1a" />
        </svg>

        {/* Cells */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${N}, ${CELL}px)`,
          gridTemplateRows: `repeat(${N}, ${CELL}px)`,
          width: N * CELL,
          height: N * CELL,
        }}>
          {board.map((cell, i) => {
            const isLast = i === lastMove
            const isHov = i === hovered && cell === 0 && !winner && !isDraw
            return (
              <div
                key={i}
                onClick={() => handleClick(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: cell === 0 && !winner && !isDraw ? 'pointer' : 'default',
                  width: CELL, height: CELL,
                }}
              >
                {cell !== 0 && (
                  <div style={{
                    width: CELL * 0.82, height: CELL * 0.82, borderRadius: '50%',
                    background: cell === 1
                      ? 'radial-gradient(circle at 35% 35%, #ffffff, #d0d0d0)'
                      : 'radial-gradient(circle at 35% 35%, #555, #111)',
                    boxShadow: isLast
                      ? `0 0 0 2px #ffd60a, 0 2px 6px #00000080`
                      : '0 1px 4px #00000060',
                    transition: 'transform 0.1s',
                    transform: 'scale(1)',
                  }} />
                )}
                {cell === 0 && isHov && (
                  <div style={{
                    width: CELL * 0.82, height: CELL * 0.82, borderRadius: '50%',
                    background: STONE_COLORS[turn],
                    opacity: 0.35,
                    boxShadow: '0 1px 4px #00000040',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
