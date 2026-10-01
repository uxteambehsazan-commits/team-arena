import { useState } from 'react'
import DozGame from './DozGame'
import GomokuGame from './GomokuGame'

type SubGame = null | 'classic' | 'advanced' | '5x5' | 'gomoku'

// ── 5×5 Doz inline ───────────────────────────────────────────────────────────
const N5 = 5, K5 = 4

function gen5x5WinLines(): number[][] {
  const lines: number[][] = []
  for (let r = 0; r < N5; r++) {
    for (let c = 0; c < N5; c++) {
      if (c + K5 <= N5) {
        const l: number[] = []; for (let k = 0; k < K5; k++) l.push(r * N5 + c + k); lines.push(l)
      }
      if (r + K5 <= N5) {
        const l: number[] = []; for (let k = 0; k < K5; k++) l.push((r + k) * N5 + c); lines.push(l)
      }
      if (c + K5 <= N5 && r + K5 <= N5) {
        const l: number[] = []; for (let k = 0; k < K5; k++) l.push((r + k) * N5 + c + k); lines.push(l)
      }
      if (c - K5 + 1 >= 0 && r + K5 <= N5) {
        const l: number[] = []; for (let k = 0; k < K5; k++) l.push((r + k) * N5 + c - k); lines.push(l)
      }
    }
  }
  return lines
}
const WIN5 = gen5x5WinLines()

type Cell5 = 0 | 1 | 2
function checkWin5(b: Cell5[], p: Cell5) { return WIN5.some(l => l.every(i => b[i] === p)) }

function scoreCell5(b: Cell5[], idx: number, p: Cell5): number {
  const opp = p === 1 ? 2 : 1 as Cell5
  const tempB = [...b]; tempB[idx] = p
  const tempO = [...b]; tempO[idx] = opp
  let s = 0
  for (const line of WIN5) {
    if (!line.includes(idx)) continue
    const pc = line.filter(i => tempB[i] === p).length
    const oc = line.filter(i => b[i] === opp).length
    if (oc === 0) s += pc * pc
    const oc2 = line.filter(i => tempO[i] === opp).length
    const pc2 = line.filter(i => b[i] === p).length
    if (pc2 === 0) s += oc2 * oc2 * 0.9
  }
  return s
}

function getCpu5Move(b: Cell5[]): number {
  const empty = Array.from({ length: N5 * N5 }, (_, i) => i).filter(i => b[i] === 0)
  if (!empty.length) return -1
  for (const i of empty) { const nb = [...b] as Cell5[]; nb[i] = 2; if (checkWin5(nb, 2)) return i }
  for (const i of empty) { const nb = [...b] as Cell5[]; nb[i] = 1; if (checkWin5(nb, 1)) return i }
  let best = -1, bs = -1
  for (const i of empty) { const s = scoreCell5(b, i, 2); if (s > bs) { bs = s; best = i } }
  return best !== -1 ? best : empty[Math.floor(Math.random() * empty.length)]
}

function Doz5x5({ onExit }: { onExit: () => void }) {
  const [board, setBoard] = useState<Cell5[]>(Array(N5 * N5).fill(0))
  const [turn, setTurn] = useState<1 | 2>(1)
  const [winner, setWinner] = useState<0 | 1 | 2>(0)
  const [isDraw, setIsDraw] = useState(false)
  const [mode, setMode] = useState<'select' | 'cpu' | 'local'>('select')
  const [busy, setBusy] = useState(false)

  function reset() { setBoard(Array(N5 * N5).fill(0)); setTurn(1); setWinner(0); setIsDraw(false); setBusy(false) }

  function handleClick(i: number) {
    if (winner || isDraw || board[i] !== 0 || busy) return
    if (mode === 'cpu' && turn !== 1) return

    const nb = [...board] as Cell5[]; nb[i] = turn
    setBoard(nb)
    if (checkWin5(nb, turn)) { setWinner(turn); return }
    if (nb.every(c => c !== 0)) { setIsDraw(true); return }

    if (mode === 'cpu') {
      setTurn(2); setBusy(true)
      setTimeout(() => {
        const m = getCpu5Move(nb)
        const nb2 = [...nb] as Cell5[]; if (m !== -1) nb2[m] = 2
        setBoard(nb2)
        if (m !== -1 && checkWin5(nb2, 2)) { setWinner(2); setBusy(false); return }
        if (nb2.every(c => c !== 0)) { setIsDraw(true); setBusy(false); return }
        setTurn(1); setBusy(false)
      }, 300)
    } else {
      setTurn(turn === 1 ? 2 : 1)
    }
  }

  const COLORS: Record<1 | 2, string> = { 1: '#f97316', 2: '#3b82f6' }
  const NAMES: Record<1 | 2, string> = { 1: 'بازیکن ۱ (نارنجی)', 2: mode === 'cpu' ? 'CPU (آبی)' : 'بازیکن ۲ (آبی)' }

  if (mode === 'select') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 700, background: '#060610',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: 24,
      }} dir="rtl">
        <div style={{ fontSize: 52, marginBottom: 4 }}>🎯</div>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>دوز ۵×۵</h2>
        <p style={{ color: '#ffffff50', fontSize: 13, margin: '0 0 12px' }}>۴ تا پشت سر هم برنده‌ است</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
          <button onClick={() => { setMode('cpu'); reset() }} style={{
            padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 15,
            background: '#10b98122', border: '2px solid #10b981', color: '#fff', cursor: 'pointer',
          }}>🤖 بازی با CPU</button>
          <button onClick={() => { setMode('local'); reset() }} style={{
            padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 15,
            background: '#6366f122', border: '2px solid #6366f1', color: '#fff', cursor: 'pointer',
          }}>👥 دو نفره</button>
        </div>
        <button onClick={onExit} style={{ color: '#ffffff40', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginTop: 4 }}>بازگشت</button>
      </div>
    )
  }

  const CELL = 64
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700, background: '#060610',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 16,
    }} dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: N5 * CELL }}>
        <button onClick={() => setMode('select')} style={{ color: '#ffffff40', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>← بازگشت</button>
        <span style={{ color: '#10b981', fontWeight: 900, fontSize: 14 }}>دوز ۵×۵</span>
        <button onClick={onExit} style={{ color: '#ffffff30', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11 }}>خروج</button>
      </div>

      {!winner && !isDraw && (
        <div style={{
          color: '#fff', fontSize: 13, fontWeight: 700,
          padding: '6px 14px', borderRadius: 10,
          background: '#ffffff10', border: '1px solid #ffffff20',
        }}>
          نوبت: {NAMES[turn]}
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[turn], marginRight: 6, verticalAlign: 'middle' }} />
        </div>
      )}
      {(winner > 0 || isDraw) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#ffd60a', fontSize: 20, fontWeight: 900 }}>
            {isDraw ? '🤝 مساوی!' : `🏆 ${NAMES[winner as 1 | 2]} برنده شد!`}
          </span>
          <button onClick={reset} style={{
            padding: '8px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13,
            background: '#10b98122', border: '2px solid #10b981', color: '#fff', cursor: 'pointer',
          }}>بازی مجدد</button>
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${N5}, ${CELL}px)`, gridTemplateRows: `repeat(${N5}, ${CELL}px)`,
        gap: 4, background: '#12121f', padding: 4, borderRadius: 12,
      }}>
        {board.map((cell, i) => (
          <div key={i} onClick={() => handleClick(i)} style={{
            width: CELL, height: CELL, borderRadius: 8,
            background: '#1a1a2e', border: `2px solid ${cell === 1 ? COLORS[1] : cell === 2 ? COLORS[2] : '#ffffff10'}`,
            cursor: cell === 0 && !winner && !isDraw ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: cell !== 0 ? 32 : 0, transition: 'all 0.12s',
          }}>
            {cell === 1 ? '◯' : cell === 2 ? '✕' : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Variant selector ──────────────────────────────────────────────────────────
interface Variant {
  id: SubGame
  emoji: string
  name: string
  desc: string
  color: string
}

const VARIANTS: Variant[] = [
  { id: 'classic',  emoji: '🎮', name: 'کلاسیک ۳×۳',  desc: 'دوز معمولی سه تا پشت سر هم',     color: '#10b981' },
  { id: 'advanced', emoji: '🧠', name: 'پیشرفته ۳×۳', desc: 'CPU سخت‌تر — دیفیکالتی ماکس',    color: '#f97316' },
  { id: '5x5',      emoji: '🎯', name: 'دوز ۵×۵',      desc: '۴ تا پشت سر هم روی صفحه ۵×۵', color: '#6366f1' },
  { id: 'gomoku',   emoji: '⚫', name: 'گوموکو ۱۳×۱۳', desc: '۵ تا پشت سر هم — استراتژیک',    color: '#a78bfa' },
]

export default function DozVariantSelector({ onExit }: { onExit: () => void }) {
  const [subGame, setSubGame] = useState<SubGame>(null)

  if (subGame === 'gomoku') return <GomokuGame onExit={() => setSubGame(null)} />
  if (subGame === '5x5')    return <Doz5x5 onExit={() => setSubGame(null)} />
  if (subGame === 'classic' || subGame === 'advanced') return (
    <DozGame onExit={() => setSubGame(null)} />
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500, background: '#060610',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', gap: 20,
    }} dir="rtl">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🎲</div>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 6px' }}>دوز — انتخاب حالت</h1>
        <p style={{ color: '#ffffff50', fontSize: 13, margin: 0 }}>یکی از حالت‌های بازی رو انتخاب کن</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
        {VARIANTS.map(v => (
          <button key={v.id} onClick={() => setSubGame(v.id)} style={{
            width: '100%', padding: '14px 18px',
            borderRadius: 16, cursor: 'pointer', textAlign: 'right',
            display: 'flex', alignItems: 'center', gap: 14,
            background: `${v.color}12`,
            border: `2px solid ${v.color}44`,
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 28 }}>{v.emoji}</span>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ color: v.color, fontWeight: 900, fontSize: 15, marginBottom: 2 }}>{v.name}</div>
              <div style={{ color: '#ffffff50', fontSize: 12 }}>{v.desc}</div>
            </div>
            <span style={{ color: v.color, fontSize: 18, opacity: 0.6 }}>›</span>
          </button>
        ))}
      </div>

      <button onClick={onExit} style={{
        color: '#ffffff40', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
      }}>بازگشت</button>
    </div>
  )
}
