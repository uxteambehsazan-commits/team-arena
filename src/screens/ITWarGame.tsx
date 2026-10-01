import { useState, useEffect, useRef } from 'react'
import { useITWarOnline } from '../lib/itwar/useITWarOnline'
import artItWar from '../imports/art-it-war.png'

// ── Types ─────────────────────────────────────────────────────────────────────
const GS = 8
type Phase = 'mode' | 'diff' | 'online_lobby' | 'place_p1' | 'hand_p2' | 'place_p2' | 'hand_start' | 'battle' | 'hand_turn' | 'result'
type Mark  = 'empty' | 'bug' | 'hit' | 'miss' | 'sunk'
type Dir   = 'h' | 'v'
type Mode  = 'cpu' | 'local' | 'online'
type Diff  = 'easy' | 'med' | 'hard'

interface BugDef { id: string; emoji: string; name: string; size: number; color: string }
interface Bug    { def: BugDef; cells: number[]; sunk: boolean }

const BUG_DEFS: BugDef[] = [
  { id: 'nano1',  emoji: '🐛', name: 'نانو‌باگ آلفا', size: 2, color: '#22c55e' },
  { id: 'nano2',  emoji: '🐛', name: 'نانو‌باگ بتا',  size: 2, color: '#4ade80' },
  { id: 'virus',  emoji: '🦠', name: 'ویروس',          size: 3, color: '#f97316' },
  { id: 'trojan', emoji: '☠️', name: 'تروجان',          size: 4, color: '#ef4444' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function emptyGrid(): Mark[] { return Array(GS * GS).fill('empty') }

function tryPlace(start: number, size: number, dir: Dir, grid: Mark[]): number[] | null {
  const r = Math.floor(start / GS), c = start % GS
  const cells: number[] = []
  for (let i = 0; i < size; i++) {
    const cell = dir === 'h' ? r * GS + c + i : (r + i) * GS + c
    if (dir === 'h' && c + i >= GS) return null
    if (dir === 'v' && r + i >= GS) return null
    if (grid[cell] === 'bug') return null
    cells.push(cell)
  }
  return cells
}

function autoPlaceBugs(): { bugs: Bug[]; grid: Mark[] } {
  const grid = emptyGrid()
  const bugs: Bug[] = []
  for (const def of BUG_DEFS) {
    let placed = false
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const start = Math.floor(Math.random() * GS * GS)
      const dir: Dir = Math.random() < 0.5 ? 'h' : 'v'
      const cells = tryPlace(start, def.size, dir, grid)
      if (cells) {
        cells.forEach(c => { grid[c] = 'bug' })
        bugs.push({ def, cells, sunk: false })
        placed = true
      }
    }
  }
  return { bugs, grid }
}

function allSunk(bugs: Bug[]) { return bugs.length > 0 && bugs.every(b => b.sunk) }

function applyAttack(
  cell: number, defGrid: Mark[], defBugs: Bug[], atkSet: Set<number>
): { grid: Mark[]; bugs: Bug[]; attacked: Set<number>; hit: boolean; sunk: boolean } {
  const grid = [...defGrid], bugs = defBugs.map(b => ({ ...b }))
  const attacked = new Set(atkSet)
  attacked.add(cell)
  let hit = false, sunk = false
  for (let i = 0; i < bugs.length; i++) {
    if (bugs[i].cells.includes(cell)) {
      hit = true
      grid[cell] = 'hit'
      const allHit = bugs[i].cells.every(c => grid[c] === 'hit' || grid[c] === 'sunk')
      if (allHit) {
        bugs[i].cells.forEach(c => { grid[c] = 'sunk' })
        bugs[i] = { ...bugs[i], sunk: true }
        sunk = true
      }
      break
    }
  }
  if (!hit) grid[cell] = 'miss'
  return { grid, bugs, attacked, hit, sunk }
}

interface CpuAI { mode: 'hunt' | 'target'; targetQueue: number[]; lastHit: number | null }

function cpuPick(ai: CpuAI, atkSet: Set<number>, diff: Diff): { cell: number; newAI: CpuAI } {
  const avail = Array.from({ length: GS * GS }, (_, i) => i).filter(c => !atkSet.has(c))
  if (!avail.length) return { cell: 0, newAI: ai }

  if (diff === 'easy') {
    return { cell: avail[Math.floor(Math.random() * avail.length)], newAI: ai }
  }

  if (ai.mode === 'target' && ai.targetQueue.length > 0) {
    const validQ = ai.targetQueue.filter(c => !atkSet.has(c))
    if (validQ.length) {
      const cell = validQ[0]
      return { cell, newAI: { ...ai, targetQueue: validQ.slice(1) } }
    }
  }

  let candidates = avail
  if (diff === 'hard') {
    const checker = avail.filter(c => (Math.floor(c / GS) + c % GS) % 2 === 0)
    if (checker.length) candidates = checker
  }
  const cell = candidates[Math.floor(Math.random() * candidates.length)]
  return { cell, newAI: { ...ai, mode: 'hunt', targetQueue: [], lastHit: null } }
}

function aiAfterHit(ai: CpuAI, cell: number, wasSunk: boolean): CpuAI {
  if (wasSunk) return { mode: 'hunt', targetQueue: [], lastHit: null }
  const r = Math.floor(cell / GS), c = cell % GS
  const adj: number[] = []
  if (r > 0) adj.push((r - 1) * GS + c)
  if (r < GS - 1) adj.push((r + 1) * GS + c)
  if (c > 0) adj.push(r * GS + c - 1)
  if (c < GS - 1) adj.push(r * GS + c + 1)
  return { mode: 'target', targetQueue: adj, lastHit: cell }
}

// ── Sub-components ────────────────────────────────────────────────────────────
const COL_LABELS = ['A','B','C','D','E','F','G','H']
const ROW_LABELS = ['۱','۲','۳','۴','۵','۶','۷','۸']

function GridCell({
  mark, preview, onClick, onHover, onLeave, interactive, isMine, size
}: {
  mark: Mark; preview: boolean; onClick?: () => void; onHover?: () => void
  onLeave?: () => void; interactive: boolean; isMine: boolean; size: number
}) {
  let bg = '#0a0a12', border = '#10b98120', content: React.ReactNode = null
  const fs = Math.max(9, Math.round(size * 0.38))

  if (mark === 'bug' && isMine) {
    bg = '#10b98118'; border = '#10b98150'
    content = <span style={{ fontSize: fs, opacity: 0.85, color: '#10b981' }}>■</span>
  } else if (mark === 'hit') {
    bg = '#ef444430'; border = '#ef4444'
    content = <span style={{ color: '#ef4444', fontSize: fs, fontWeight: 900 }}>✕</span>
  } else if (mark === 'miss') {
    bg = '#1e3a5f30'; border = '#3b82f660'
    content = <span style={{ color: '#3b82f680', fontSize: Math.max(7, fs - 2) }}>·</span>
  } else if (mark === 'sunk') {
    bg = '#ef444445'; border = '#ef4444cc'
    content = <span style={{ color: '#ff6b6b', fontSize: fs }}>☠</span>
  }
  if (preview) { bg = '#10b98135'; border = '#10b981' }

  return (
    <div
      style={{
        width: size, height: size, borderRadius: Math.max(2, Math.round(size * 0.1)),
        cursor: interactive ? 'pointer' : 'default',
        border: `1px solid ${border}`,
        background: bg,
        transition: 'background 0.12s, border-color 0.12s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {content}
    </div>
  )
}

function Grid({
  grid, bugs, previewCells, onCellClick, onCellHover, onCellLeave, isMine, interactive, cellSize
}: {
  grid: Mark[]; bugs: Bug[]; previewCells: number[]
  onCellClick?: (i: number) => void; onCellHover?: (i: number) => void
  onCellLeave?: () => void; isMine: boolean; interactive: boolean; cellSize: number
}) {
  const bugGrid = (() => {
    const g = emptyGrid()
    bugs.forEach(b => b.cells.forEach(c => { g[c] = 'bug' }))
    return g
  })()

  const LABEL = Math.round(cellSize * 0.55)
  const GAP = cellSize >= 24 ? 2 : 1
  const labelFs = Math.max(7, Math.round(cellSize * 0.28))

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: GAP }}>
      {/* Column labels */}
      <div style={{ display: 'flex', gap: GAP, paddingRight: LABEL + GAP }}>
        {COL_LABELS.map(l => (
          <div key={l} style={{
            width: cellSize, textAlign: 'center', fontSize: labelFs,
            color: '#ffffff35', fontFamily: 'monospace', flexShrink: 0,
          }}>{l}</div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: GS }, (_, row) => (
        <div key={row} style={{ display: 'flex', gap: GAP, alignItems: 'center' }}>
          <div style={{
            width: LABEL, textAlign: 'center', fontSize: labelFs,
            color: '#ffffff35', fontFamily: 'monospace', flexShrink: 0,
          }}>
            {ROW_LABELS[row]}
          </div>
          {Array.from({ length: GS }, (_, col) => {
            const i = row * GS + col
            const effectiveMark = isMine ? (bugGrid[i] !== 'empty' ? bugGrid[i] : grid[i]) : grid[i]
            return (
              <GridCell
                key={i}
                mark={effectiveMark}
                preview={previewCells.includes(i)}
                onClick={() => onCellClick?.(i)}
                onHover={() => onCellHover?.(i)}
                onLeave={onCellLeave}
                interactive={interactive}
                isMine={isMine}
                size={cellSize}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function useGridCellSize(paddingH = 24, rowLabelFraction = 0.55) {
  const [cellSize, setCellSize] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 375
    const available = w - paddingH * 2
    const labelW = Math.round(40 * rowLabelFraction)
    return Math.floor((available - labelW - 16) / GS)
  })
  useEffect(() => {
    function calc() {
      const available = window.innerWidth - paddingH * 2
      const labelW = Math.round(40 * rowLabelFraction)
      setCellSize(Math.min(52, Math.floor((available - labelW - 16) / GS)))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [paddingH, rowLabelFraction])
  return cellSize
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: '#060610',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }} dir="rtl">
      {children}
    </div>
  )
}

function Btn({ onClick, children, accent = '#10b981', disabled }: {
  onClick: () => void; children: React.ReactNode; accent?: string; disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '14px 28px', borderRadius: 14, fontWeight: 900, fontSize: 16,
      color: disabled ? '#555' : '#fff',
      background: disabled ? '#1a1a2a' : `${accent}22`,
      border: `2px solid ${disabled ? '#333' : accent}`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%', transition: 'all 0.15s',
    }}>
      {children}
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ITWarGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('mode')
  const [mode, setMode] = useState<Mode>('cpu')
  const [diff, setDiff] = useState<Diff>('med')
  const [p1Name] = useState('بازیکن ۱')
  const [p2Name, setP2Name] = useState('CPU')
  const [onlineName, setOnlineName] = useState('')

  const [p1Grid, setP1Grid] = useState<Mark[]>(emptyGrid())
  const [p2Grid, setP2Grid] = useState<Mark[]>(emptyGrid())
  const [p1Bugs, setP1Bugs] = useState<Bug[]>([])
  const [p2Bugs, setP2Bugs] = useState<Bug[]>([])

  const [p1Attacked, setP1Attacked] = useState<Set<number>>(new Set())
  const [p2Attacked, setP2Attacked] = useState<Set<number>>(new Set())
  const [attacker, setAttacker] = useState<1 | 2>(1)
  const [cpuAI, setCpuAI] = useState<CpuAI>({ mode: 'hunt', targetQueue: [], lastHit: null })
  const [feedback, setFeedback] = useState<{ text: string; type: 'hit' | 'miss' | 'sunk' } | null>(null)
  const [winner, setWinner] = useState<1 | 2 | null>(null)

  const [bugQueue, setBugQueue] = useState<BugDef[]>([...BUG_DEFS])
  const [orientation, setOrientation] = useState<Dir>('h')
  const [hovered, setHovered] = useState<number | null>(null)

  const cellSize = useGridCellSize(12)

  const p1GridRef = useRef(p1Grid)
  const p2GridRef = useRef(p2Grid)
  const p1BugsRef = useRef(p1Bugs)
  const p2BugsRef = useRef(p2Bugs)
  const p1AttRef  = useRef(p1Attacked)
  const p2AttRef  = useRef(p2Attacked)
  const cpuAIRef  = useRef(cpuAI)

  p1GridRef.current = p1Grid
  p2GridRef.current = p2Grid
  p1BugsRef.current = p1Bugs
  p2BugsRef.current = p2Bugs
  p1AttRef.current  = p1Attacked
  p2AttRef.current  = p2Attacked
  cpuAIRef.current  = cpuAI

  const cpuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearFeedback() { setTimeout(() => setFeedback(null), 1800) }

  const placingGrid = phase === 'place_p1' ? p1Grid : p2Grid
  const previewCells = hovered !== null && bugQueue.length > 0
    ? (tryPlace(hovered, bugQueue[0].size, orientation, placingGrid)
      ?? tryPlace(hovered, bugQueue[0].size, orientation === 'h' ? 'v' : 'h', placingGrid)
      ?? [])
    : []

  function handlePlaceClick(cell: number) {
    if (bugQueue.length === 0) return
    const def = bugQueue[0]
    const cells = tryPlace(cell, def.size, orientation, placingGrid)
      ?? tryPlace(cell, def.size, orientation === 'h' ? 'v' : 'h', placingGrid)
    if (!cells) return

    const newGrid = [...placingGrid]
    cells.forEach(c => { newGrid[c] = 'bug' })
    const newBug: Bug = { def, cells, sunk: false }
    const newQueue = bugQueue.slice(1)

    if (phase === 'place_p1') {
      setP1Grid(newGrid)
      setP1Bugs(prev => [...prev, newBug])
    } else {
      setP2Grid(newGrid)
      setP2Bugs(prev => [...prev, newBug])
    }
    setBugQueue(newQueue)

    if (newQueue.length === 0) {
      if (phase === 'place_p1') {
        if (mode === 'cpu') {
          const { bugs: cpuBugs, grid: cpuGrid } = autoPlaceBugs()
          setP2Bugs(cpuBugs)
          setP2Grid(cpuGrid)
          setTimeout(() => setPhase('battle'), 50)
        } else {
          setPhase('hand_p2')
          setBugQueue([...BUG_DEFS])
          setOrientation('h')
          setHovered(null)
        }
      } else {
        setPhase('hand_start')
      }
    }
  }

  function showFeedback(hit: boolean, sunk: boolean) {
    setFeedback(sunk
      ? { text: '💥 باگ از بین رفت!', type: 'sunk' }
      : hit ? { text: '🎯 هدف زده شد!', type: 'hit' }
              : { text: '💧 خطا!', type: 'miss' })
    clearFeedback()
  }

  function handleHumanAttack(cell: number) {
    if (phase !== 'battle' || attacker !== 1) return
    if (p1AttRef.current.has(cell)) return

    const result = applyAttack(cell, p2GridRef.current, p2BugsRef.current, p1AttRef.current)
    setP2Grid(result.grid)
    setP2Bugs(result.bugs)
    setP1Attacked(result.attacked)
    showFeedback(result.hit, result.sunk)

    if (allSunk(result.bugs)) { setWinner(1); setPhase('result'); return }

    if (mode === 'cpu') {
      cpuTimerRef.current = setTimeout(() => doCpuAttack(), 900)
    } else {
      setAttacker(2)
      setPhase('hand_turn')
    }
  }

  function handleLocalP2Attack(cell: number) {
    if (phase !== 'battle' || attacker !== 2) return
    if (p2AttRef.current.has(cell)) return

    const result = applyAttack(cell, p1GridRef.current, p1BugsRef.current, p2AttRef.current)
    setP1Grid(result.grid)
    setP1Bugs(result.bugs)
    setP2Attacked(result.attacked)
    showFeedback(result.hit, result.sunk)

    if (allSunk(result.bugs)) { setWinner(2); setPhase('result'); return }
    setAttacker(1)
    setPhase('hand_turn')
  }

  function doCpuAttack() {
    const ai = cpuAIRef.current
    const { cell, newAI } = cpuPick(ai, p2AttRef.current, diff)
    const result = applyAttack(cell, p1GridRef.current, p1BugsRef.current, p2AttRef.current)

    setCpuAI(result.sunk ? { mode: 'hunt', targetQueue: [], lastHit: null }
      : result.hit ? aiAfterHit(newAI, cell, false) : newAI)
    setP1Grid(result.grid)
    setP1Bugs(result.bugs)
    setP2Attacked(result.attacked)
    showFeedback(result.hit, result.sunk)

    if (allSunk(result.bugs)) { setWinner(2); setPhase('result') }
  }

  useEffect(() => () => { if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current) }, [])

  const accent = '#10b981'
  const panelStyle: React.CSSProperties = {
    background: '#0d0d1a', border: `1px solid ${accent}22`,
    borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 360,
  }

  // Online lobby
  if (phase === 'online_lobby') {
    return (
      <OnlineLobby
        displayName={onlineName}
        onChangeName={setOnlineName}
        onExit={() => setPhase('mode')}
      />
    )
  }

  // Mode select
  if (phase === 'mode') {
    return (
      <Screen>
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <img src={artItWar} alt="جنگ IT" style={{ width: 200, height: 'auto', objectFit: 'contain', marginBottom: 8 }} />
            <h1 style={{ color: accent, fontSize: 24, fontWeight: 900, margin: '0 0 4px', fontFamily: 'monospace' }}>جنگ IT</h1>
            <p style={{ color: '#ffffff60', fontSize: 13, margin: 0 }}>باگ‌های سرور حریف رو شکار کن!</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            <Btn onClick={() => { setMode('cpu'); setP2Name('CPU'); setPhase('diff') }} accent={accent}>
              🤖 بازی با CPU
            </Btn>
            <Btn onClick={() => { setMode('local'); setP2Name('بازیکن ۲'); setPhase('place_p1') }} accent="#6366f1">
              👥 بازی محلی (یک دستگاه)
            </Btn>
            <Btn onClick={() => { setMode('online'); setPhase('online_lobby') }} accent="#f59e0b">
              🌐 بازی آنلاین (دو دستگاه)
            </Btn>
          </div>
          <button onClick={onExit} style={{ color: '#ffffff40', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
            بازگشت
          </button>
        </div>
      </Screen>
    )
  }

  // Difficulty select
  if (phase === 'diff') {
    const diffs: { id: Diff; label: string; desc: string; color: string }[] = [
      { id: 'easy', label: 'آسان',   desc: 'حمله تصادفی',       color: '#22c55e' },
      { id: 'med',  label: 'متوسط', desc: 'سیستم هدف‌گیری',    color: '#ffd60a' },
      { id: 'hard', label: 'سخت',   desc: 'الگوریتم شبکه‌ای',  color: '#ef4444' },
    ]
    return (
      <Screen>
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <img src={artItWar} alt="" style={{ width: 120, height: 'auto', objectFit: 'contain' }} />
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, margin: 0 }}>سطح دشواری CPU</h2>
          {diffs.map(d => (
            <button key={d.id} onClick={() => { setDiff(d.id); setPhase('place_p1') }}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 14,
                background: diff === d.id ? `${d.color}22` : '#12121f',
                border: `2px solid ${diff === d.id ? d.color : '#ffffff15'}`,
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
              <span style={{ color: d.color, fontWeight: 900 }}>{d.label}</span>
              <span style={{ color: '#ffffff50', fontSize: 12 }}>{d.desc}</span>
            </button>
          ))}
          <button onClick={() => setPhase('mode')} style={{ color: '#ffffff40', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            بازگشت
          </button>
        </div>
      </Screen>
    )
  }

  // Placement phase
  if (phase === 'place_p1' || phase === 'place_p2') {
    const isP1 = phase === 'place_p1'
    const currentBug = bugQueue[0]
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 500, background: '#060610',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflowY: 'auto', padding: '16px 12px',
      }} dir="rtl">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%', maxWidth: 480 }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: accent, fontSize: 16, fontWeight: 900, margin: '0 0 4px' }}>
              {isP1 ? p1Name : p2Name} — باگ‌ها رو بچین
            </h2>
            {currentBug && (
              <p style={{ color: '#ffffff60', fontSize: 13, margin: 0 }}>
                {currentBug.emoji} {currentBug.name} ({currentBug.size} خانه)
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setOrientation(o => o === 'h' ? 'v' : 'h')}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 10, fontWeight: 700, fontSize: 13,
                background: `${accent}15`, border: `1px solid ${accent}44`, color: accent, cursor: 'pointer',
              }}>
              {orientation === 'h' ? '↔ افقی' : '↕ عمودی'}
            </button>
            <button onClick={() => {
              const { bugs, grid } = autoPlaceBugs()
              if (phase === 'place_p1') { setP1Bugs(bugs); setP1Grid(grid) }
              else { setP2Bugs(bugs); setP2Grid(grid) }
              setBugQueue([])
              setTimeout(() => {
                if (phase === 'place_p1') {
                  if (mode === 'cpu') {
                    const { bugs: cb, grid: cg } = autoPlaceBugs()
                    setP2Bugs(cb); setP2Grid(cg)
                    setPhase('battle')
                  } else setPhase('hand_p2')
                } else setPhase('hand_start')
              }, 50)
            }} style={{
              flex: 1, padding: '8px 12px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              background: '#6366f115', border: '1px solid #6366f144', color: '#818cf8', cursor: 'pointer',
            }}>
              🎲 خودکار
            </button>
          </div>
          <Grid
            grid={isP1 ? p1Grid : p2Grid}
            bugs={isP1 ? p1Bugs : p2Bugs}
            previewCells={previewCells}
            onCellClick={handlePlaceClick}
            onCellHover={i => setHovered(i)}
            onCellLeave={() => setHovered(null)}
            isMine
            interactive={bugQueue.length > 0}
            cellSize={cellSize}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {BUG_DEFS.map(d => {
              const placed = !(bugQueue.find(b => b.id === d.id))
              return (
                <span key={d.id} style={{
                  fontSize: 12, padding: '3px 8px', borderRadius: 8,
                  background: placed ? `${d.color}15` : `${d.color}30`,
                  border: `1px solid ${placed ? d.color + '40' : d.color}`,
                  color: placed ? '#ffffff40' : d.color,
                  textDecoration: placed ? 'line-through' : 'none',
                }}>
                  {d.emoji} {d.name}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Pass-device screens
  if (phase === 'hand_p2') {
    return (
      <Screen>
        <div style={{ ...panelStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: 48 }}>📱</div>
          <h2 style={{ color: accent, fontSize: 18, fontWeight: 900, margin: 0 }}>دستگاه رو بده به {p2Name}</h2>
          <p style={{ color: '#ffffff50', fontSize: 13, margin: 0 }}>بازیکن ۱ صفحه رو نبینه!</p>
          <Btn onClick={() => { setBugQueue([...BUG_DEFS]); setOrientation('h'); setHovered(null); setPhase('place_p2') }} accent="#6366f1">
            آماده‌ام ← بگذار باگ‌هامو بچینم
          </Btn>
        </div>
      </Screen>
    )
  }

  if (phase === 'hand_start') {
    return (
      <Screen>
        <div style={{ ...panelStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <img src={artItWar} alt="" style={{ width: 160, height: 'auto', objectFit: 'contain' }} />
          <h2 style={{ color: '#ffd60a', fontSize: 20, fontWeight: 900, margin: 0 }}>همه آماده‌اند!</h2>
          <p style={{ color: '#ffffff60', fontSize: 13, margin: 0 }}>دستگاه رو در وسط بذارید — {p1Name} شروع می‌کند</p>
          <Btn onClick={() => { setPhase('battle'); setAttacker(1) }} accent={accent}>
            🎯 شروع نبرد!
          </Btn>
        </div>
      </Screen>
    )
  }

  if (phase === 'hand_turn') {
    const nextName = attacker === 1 ? p1Name : p2Name
    return (
      <Screen>
        <div style={{ ...panelStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: 40 }}>🔄</div>
          <h2 style={{ color: accent, fontSize: 18, fontWeight: 900, margin: 0 }}>نوبت {nextName}</h2>
          <p style={{ color: '#ffffff50', fontSize: 13, margin: 0 }}>دستگاه رو بده — بقیه صفحه رو نبینن!</p>
          <Btn onClick={() => setPhase('battle')} accent={accent}>آماده‌ام ← نوبت منه</Btn>
        </div>
      </Screen>
    )
  }

  if (phase === 'result') {
    const winName = winner === 1 ? p1Name : p2Name
    const sunkByP1 = p2Bugs.filter(b => b.sunk).length
    const sunkByP2 = p1Bugs.filter(b => b.sunk).length
    return (
      <Screen>
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
          <img src={artItWar} alt="" style={{ width: 160, height: 'auto', objectFit: 'contain' }} />
          <div style={{ fontSize: 44 }}>{winner === 1 ? '🏆' : '💀'}</div>
          <h2 style={{ color: winner === 1 ? '#ffd60a' : '#ef4444', fontSize: 22, fontWeight: 900, margin: 0 }}>
            {winName} برنده شد!
          </h2>
          <div style={{ display: 'flex', gap: 16, width: '100%' }}>
            {[{ name: p1Name, sunk: sunkByP1 }, { name: p2Name, sunk: sunkByP2 }].map((p, i) => (
              <div key={i} style={{
                flex: 1, background: '#12121f', borderRadius: 12, padding: '12px 8px',
                border: `1px solid ${winner === i + 1 ? '#ffd60a44' : '#ffffff10'}`,
              }}>
                <p style={{ color: '#ffffff60', fontSize: 11, margin: '0 0 4px' }}>{p.name}</p>
                <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: 0 }}>{p.sunk}</p>
                <p style={{ color: '#ffffff40', fontSize: 10, margin: 0 }}>باگ از بین برده</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <Btn onClick={() => {
              setPhase('mode'); setP1Grid(emptyGrid()); setP2Grid(emptyGrid())
              setP1Bugs([]); setP2Bugs([]); setP1Attacked(new Set()); setP2Attacked(new Set())
              setBugQueue([...BUG_DEFS]); setOrientation('h'); setHovered(null)
              setCpuAI({ mode: 'hunt', targetQueue: [], lastHit: null })
              setWinner(null); setAttacker(1)
            }} accent={accent}>بازی مجدد</Btn>
            <Btn onClick={onExit} accent="#6366f1">خروج</Btn>
          </div>
        </div>
      </Screen>
    )
  }

  // Battle phase
  const isP1Turn = attacker === 1
  const attackGrid = isP1Turn ? p2Grid : p1Grid
  const myBugs = isP1Turn ? p1Bugs : p2Bugs
  const attackerName = isP1Turn ? p1Name : p2Name

  const attackCellsForDisplay = emptyGrid()
  const myAttacked = isP1Turn ? p1Attacked : p2Attacked
  myAttacked.forEach(c => {
    if (attackGrid[c] === 'hit' || attackGrid[c] === 'sunk') attackCellsForDisplay[c] = attackGrid[c]
    else if (attackGrid[c] === 'miss') attackCellsForDisplay[c] = 'miss'
  })

  const sunkCount = (isP1Turn ? p2Bugs : p1Bugs).filter(b => b.sunk).length

  const miniCell = Math.max(14, Math.round(cellSize * 0.38))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500, background: '#060610',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }} dir="rtl">

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px 6px',
        borderBottom: '1px solid #ffffff08',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src={artItWar} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={{ color: accent, fontWeight: 900, fontSize: 14, fontFamily: 'monospace' }}>جنگ IT</span>
        </div>
        <div style={{
          color: accent, fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
          background: `${accent}15`, border: `1px solid ${accent}40`,
          padding: '3px 10px', borderRadius: 8,
        }}>
          ▶ {attackerName}
        </div>
        <button onClick={onExit} style={{ color: '#ffffff30', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
          خروج
        </button>
      </div>

      {/* Feedback bar */}
      {feedback ? (
        <div style={{
          textAlign: 'center', padding: '7px 12px',
          background: feedback.type === 'sunk' ? '#ef444428' : feedback.type === 'hit' ? '#ef444418' : '#1e3a5f25',
          borderBottom: `2px solid ${feedback.type === 'miss' ? '#3b82f650' : '#ef444460'}`,
          color: feedback.type === 'miss' ? '#60a5fa' : '#ef4444',
          fontWeight: 800, fontSize: 15,
        }}>
          {feedback.text}
        </div>
      ) : (
        <div style={{ height: 4, background: '#ffffff06' }} />
      )}

      {/* Attack grid — full width, main play area */}
      <div style={{ padding: '8px 12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ color: '#ffffff45', fontSize: 11, margin: '0 0 6px', fontFamily: 'monospace' }}>
          ⚔ گرید حریف — روی خانه کلیک کن
        </p>
        <Grid
          grid={attackCellsForDisplay}
          bugs={[]}
          previewCells={[]}
          onCellClick={isP1Turn ? handleHumanAttack : handleLocalP2Attack}
          isMine={false}
          interactive
          cellSize={cellSize}
        />
      </div>

      {/* Sunk progress + mini-map in one row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '10px 14px 6px', gap: 12,
      }}>
        {/* Bug sunk status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <p style={{ color: '#ffffff35', fontSize: 10, margin: 0, fontFamily: 'monospace' }}>باگ‌های حریف</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BUG_DEFS.map((def, i) => {
              const oppBugs = isP1Turn ? p2Bugs : p1Bugs
              const sunk = oppBugs[i]?.sunk ?? false
              return (
                <span key={def.id} style={{
                  fontSize: 12, padding: '3px 8px', borderRadius: 8, fontWeight: 700,
                  background: sunk ? '#ef444420' : '#ffffff08',
                  border: `1px solid ${sunk ? '#ef444460' : '#ffffff12'}`,
                  color: sunk ? '#ef4444' : '#ffffff30',
                }}>
                  {sunk ? '☠' : def.emoji} {def.name}
                </span>
              )
            })}
          </div>
          <p style={{ color: '#ffffff30', fontSize: 10, margin: 0 }}>{sunkCount}/{BUG_DEFS.length} از بین رفته</p>
        </div>

        {/* Defense mini-map */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <p style={{ color: '#ffffff25', fontSize: 9, margin: 0, fontFamily: 'monospace' }}>گرید من</p>
          <Grid
            grid={isP1Turn ? p1Grid : p2Grid}
            bugs={myBugs}
            previewCells={[]}
            isMine
            interactive={false}
            cellSize={miniCell}
          />
        </div>
      </div>

      {/* My bug health */}
      <div style={{ padding: '0 14px 12px', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {myBugs.map(b => (
          <span key={b.def.id} style={{
            fontSize: 11, padding: '2px 7px', borderRadius: 6,
            background: b.sunk ? '#ffffff06' : `${b.def.color}15`,
            border: `1px solid ${b.sunk ? '#ffffff12' : b.def.color + '55'}`,
            color: b.sunk ? '#ffffff25' : b.def.color,
            textDecoration: b.sunk ? 'line-through' : 'none',
          }}>
            {b.def.emoji} {b.def.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Online Lobby ──────────────────────────────────────────────────────────────

function OnlineLobby({
  displayName, onChangeName, onExit,
}: {
  displayName: string
  onChangeName: (name: string) => void
  onExit: () => void
}) {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [joinCode, setJoinCode] = useState('')
  const [nameInput, setNameInput] = useState(displayName || 'بازیکن')
  const accent = '#f59e0b'

  const online = useITWarOnline(nameInput)
  const { state, createRoom, joinRoom, setReady, startMatch, leaveRoom } = online

  const panelStyle: React.CSSProperties = {
    background: '#0d0d1a',
    border: `1px solid ${accent}22`,
    borderRadius: 20,
    padding: '24px 20px',
    width: '100%',
    maxWidth: 380,
  }

  if (state.phase === 'playing' || state.phase === 'finished') {
    return <OnlineBattle online={online} accent={accent} onExit={() => { leaveRoom(); onExit() }} />
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500, background: '#060610',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }} dir="rtl">
      <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <img src={artItWar} alt="جنگ IT" style={{ width: 160, height: 'auto', objectFit: 'contain', marginBottom: 8 }} />
          <h2 style={{ color: accent, fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>بازی آنلاین</h2>
          <p style={{ color: '#ffffff40', fontSize: 12, margin: 0 }}>دو نفر از دو دستگاه مختلف</p>
        </div>

        <div>
          <label style={{ color: '#ffffff60', fontSize: 12, display: 'block', marginBottom: 6 }}>نام شما</label>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="نام بازیکن"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
              background: '#12121f', border: `1px solid ${accent}33`, color: '#fff',
              outline: 'none', boxSizing: 'border-box', textAlign: 'right',
            }}
          />
        </div>

        {state.phase === 'idle' && (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['create', 'join'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: 14,
                  background: tab === t ? `${accent}22` : 'transparent',
                  border: `2px solid ${tab === t ? accent : '#ffffff20'}`,
                  color: tab === t ? accent : '#ffffff60',
                  cursor: 'pointer',
                }}>
                  {t === 'create' ? '🏠 ساخت اتاق' : '🔑 ورود'}
                </button>
              ))}
            </div>

            {tab === 'create' && (
              <button onClick={() => { onChangeName(nameInput); createRoom() }} style={{
                padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 16,
                background: `${accent}22`, border: `2px solid ${accent}`,
                color: '#fff', cursor: 'pointer', width: '100%',
              }}>
                ساخت اتاق جدید
              </button>
            )}

            {tab === 'join' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="کد اتاق"
                  maxLength={6}
                  style={{
                    padding: '10px 12px', borderRadius: 10, fontSize: 18, fontFamily: 'monospace',
                    background: '#12121f', border: `1px solid ${accent}33`, color: '#fff',
                    outline: 'none', textAlign: 'center', letterSpacing: 6, width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <button onClick={() => { onChangeName(nameInput); joinRoom(joinCode.toUpperCase()) }}
                  disabled={joinCode.length < 6}
                  style={{
                    padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 16,
                    background: joinCode.length < 6 ? '#1a1a2a' : `${accent}22`,
                    border: `2px solid ${joinCode.length < 6 ? '#333' : accent}`,
                    color: joinCode.length < 6 ? '#555' : '#fff',
                    cursor: joinCode.length < 6 ? 'not-allowed' : 'pointer', width: '100%',
                  }}>
                  ورود به اتاق
                </button>
              </div>
            )}
          </>
        )}

        {(state.phase === 'creating' || state.phase === 'joining') && (
          <div style={{ textAlign: 'center', color: '#ffffff60', fontSize: 14 }}>⏳ در حال اتصال...</div>
        )}

        {state.phase === 'lobby' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {state.roomCode && (
              <div style={{
                background: '#12121f', borderRadius: 14, padding: '14px 12px', textAlign: 'center',
                border: `1px solid ${accent}33`,
              }}>
                <p style={{ color: '#ffffff50', fontSize: 11, margin: '0 0 4px' }}>کد اتاق — به دوستت بده</p>
                <p style={{ color: accent, fontSize: 28, fontWeight: 900, margin: 0, fontFamily: 'monospace', letterSpacing: 6 }}>
                  {state.roomCode}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {state.players.map(p => (
                <div key={p.playerId} style={{
                  background: '#0a0a15', borderRadius: 10, padding: '10px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: `1px solid ${p.ready ? '#10b98133' : '#ffffff10'}`,
                }}>
                  <span style={{ color: '#fff', fontSize: 14 }}>
                    {p.displayName}
                    {p.playerId === state.myPlayerId && <span style={{ color: '#ffffff40', fontSize: 11 }}> (شما)</span>}
                  </span>
                  <span style={{ color: p.ready ? '#10b981' : '#ffffff30', fontSize: 12, fontWeight: 700 }}>
                    {p.ready ? '✓ آماده' : 'در انتظار'}
                  </span>
                </div>
              ))}
              {state.players.length < 2 && (
                <div style={{
                  background: '#0a0a15', borderRadius: 10, padding: '10px 14px',
                  border: '1px dashed #ffffff15', color: '#ffffff30', fontSize: 13, textAlign: 'center',
                }}>
                  در انتظار بازیکن دوم...
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!state.players.find(p => p.playerId === state.myPlayerId)?.ready ? (
                <button onClick={() => setReady(true)} style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, fontWeight: 900, fontSize: 14,
                  background: '#10b98122', border: '2px solid #10b981', color: '#fff', cursor: 'pointer',
                }}>✓ آماده‌ام</button>
              ) : (
                <button onClick={() => setReady(false)} style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, fontWeight: 900, fontSize: 14,
                  background: '#ffffff10', border: '2px solid #ffffff20', color: '#fff', cursor: 'pointer',
                }}>انتظار...</button>
              )}
              {state.isHost && state.players.length >= 2 && state.players.every(p => p.ready) && (
                <button onClick={startMatch} style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, fontWeight: 900, fontSize: 14,
                  background: `${accent}22`, border: `2px solid ${accent}`, color: '#fff', cursor: 'pointer',
                }}>شروع ▶</button>
              )}
            </div>
          </div>
        )}

        <button onClick={() => { leaveRoom(); onExit() }} style={{
          color: '#ffffff40', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'center',
        }}>
          بازگشت
        </button>
      </div>
    </div>
  )
}

// ── Online Battle View ────────────────────────────────────────────────────────

function OnlineBattle({
  online, accent, onExit,
}: {
  online: ReturnType<typeof useITWarOnline>
  accent: string
  onExit: () => void
}) {
  const { state, scanNode, useRadar, requestHint } = online
  const pub = state.publicState
  const priv = state.privateState
  const myId = state.myPlayerId
  const iMyTurn = pub?.currentTurn === myId

  const COLS2 = ['A','B','C','D','E','F','G','H']
  const GS2 = 8

  function nodeId(col: number, row: number) { return `${COLS2[col]}${row + 1}` }

  const myScannedSet = new Set(myId && pub?.scannedNodes[myId] ? pub.scannedNodes[myId] : [])
  const oppScannedSet = new Set<string>()
  if (pub) {
    for (const [pid, nodes] of Object.entries(pub.scannedNodes)) {
      if (pid !== myId) nodes.forEach(n => oppScannedSet.add(n))
    }
  }
  const myBugCells = new Set<string>()
  if (priv?.myBugLayout) {
    for (const bug of Object.values(priv.myBugLayout)) {
      bug.cells.forEach(c => myBugCells.add(c))
    }
  }

  if (state.phase === 'finished' && state.matchFinished) {
    const mf = state.matchFinished
    const iWon = mf.winner === myId
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 500, background: '#060610',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }} dir="rtl">
        <div style={{
          background: '#0d0d1a', border: `1px solid ${accent}22`, borderRadius: 20,
          padding: 28, maxWidth: 360, width: '100%', textAlign: 'center',
          display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
        }}>
          <img src={artItWar} alt="" style={{ width: 160, height: 'auto', objectFit: 'contain' }} />
          <div style={{ fontSize: 48 }}>{iWon ? '🏆' : '💀'}</div>
          <h2 style={{ color: iWon ? '#ffd60a' : '#ef4444', fontSize: 22, fontWeight: 900, margin: 0 }}>
            {iWon ? 'برنده شدی!' : 'باختی!'}
          </h2>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            {Object.entries(mf.finalScores).map(([pid, score]) => (
              <div key={pid} style={{
                flex: 1, background: '#12121f', borderRadius: 12, padding: '12px 8px',
                border: `1px solid ${pid === mf.winner ? '#ffd60a44' : '#ffffff10'}`,
              }}>
                <p style={{ color: '#ffffff50', fontSize: 11, margin: '0 0 4px' }}>{pid === myId ? 'شما' : 'حریف'}</p>
                <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: 0 }}>{score}</p>
                <p style={{ color: '#ffffff40', fontSize: 10, margin: 0 }}>امتیاز</p>
              </div>
            ))}
          </div>
          <button onClick={onExit} style={{
            padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 15, width: '100%',
            background: `${accent}22`, border: `2px solid ${accent}`, color: '#fff', cursor: 'pointer',
          }}>خروج</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500, background: '#060610',
      overflowY: 'auto', padding: '8px 12px',
    }} dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src={artItWar} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <span style={{ color: accent, fontWeight: 900, fontSize: 13, fontFamily: 'monospace' }}>جنگ IT آنلاین</span>
        </div>
        <div style={{
          color: iMyTurn ? accent : '#ffffff50', fontWeight: 700, fontSize: 12,
          padding: '4px 10px', borderRadius: 8,
          background: iMyTurn ? `${accent}15` : 'transparent',
          border: `1px solid ${iMyTurn ? accent + '44' : 'transparent'}`,
        }}>
          {iMyTurn ? '▶ نوبت توست' : '⏳ نوبت حریف'}
        </div>
        <button onClick={onExit} style={{ color: '#ffffff30', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11 }}>
          خروج
        </button>
      </div>

      {pub && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px 8px', fontSize: 12 }}>
          {Object.entries(pub.scores).map(([pid, sc]) => (
            <span key={pid} style={{ color: pid === myId ? accent : '#ffffff60' }}>
              {pid === myId ? 'شما' : 'حریف'}: <strong style={{ color: '#fff' }}>{sc}</strong>
            </span>
          ))}
        </div>
      )}

      <p style={{ color: '#ffffff50', fontSize: 11, textAlign: 'center', margin: '0 0 4px' }}>گرید حریف</p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GS2}, 1fr)`, gap: 2, margin: '0 auto 12px', maxWidth: 320 }}>
        {Array.from({ length: GS2 * GS2 }, (_, i) => {
          const col = i % GS2, row = Math.floor(i / GS2)
          const nid = nodeId(col, row)
          const scanned = myScannedSet.has(nid)
          const isHit = state.lastScanResult?.nodeId === nid && state.lastScanResult.result === 'HIT'
          return (
            <div key={i}
              onClick={() => iMyTurn && !scanned && scanNode(nid)}
              style={{
                aspectRatio: '1', borderRadius: 3,
                background: scanned ? (isHit ? '#ef444425' : '#1e3a5f30') : '#0a0a12',
                border: `1px solid ${scanned ? (isHit ? '#ef4444' : '#3b82f660') : '#10b98120'}`,
                cursor: iMyTurn && !scanned ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}
            >
              {scanned && (isHit
                ? <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 900 }}>✕</span>
                : <span style={{ color: '#3b82f660', fontSize: 8 }}>·</span>)}
            </div>
          )
        })}
      </div>

      <p style={{ color: '#ffffff30', fontSize: 10, textAlign: 'center', margin: '0 0 4px' }}>گرید من</p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GS2}, 1fr)`, gap: 2, margin: '0 auto 8px', maxWidth: 240 }}>
        {Array.from({ length: GS2 * GS2 }, (_, i) => {
          const col = i % GS2, row = Math.floor(i / GS2)
          const nid = nodeId(col, row)
          const attacked = oppScannedSet.has(nid)
          const isBug = myBugCells.has(nid)
          return (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: 2,
              background: attacked ? '#ef444425' : isBug ? '#10b98115' : '#0a0a12',
              border: `1px solid ${attacked ? '#ef4444' : isBug ? '#10b98145' : '#10b98115'}`,
            }} />
          )
        })}
      </div>

      {iMyTurn && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          {(priv?.myRadarCount ?? 0) > 0 && (
            <button onClick={() => useRadar('AREA_A')} style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: '#6366f122', border: '1px solid #6366f1', color: '#a5b4fc', cursor: 'pointer',
            }}>
              📡 رادار ({priv?.myRadarCount})
            </button>
          )}
          {(priv?.myHintCount ?? 0) > 0 && (
            <button onClick={requestHint} style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: `${accent}22`, border: `1px solid ${accent}`, color: '#fcd34d', cursor: 'pointer',
            }}>
              💡 راهنما ({priv?.myHintCount})
            </button>
          )}
        </div>
      )}

      {state.lastScanResult && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: state.lastScanResult.result === 'HIT' ? '#ef4444' : '#3b82f6' }}>
          {state.lastScanResult.result === 'HIT' ? '🎯 هدف!' : '💧 خطا!'}
          {state.lastScanResult.scoreDelta > 0 && <span style={{ color: '#ffd60a', marginRight: 6 }}>+{state.lastScanResult.scoreDelta}</span>}
        </div>
      )}
      {state.lastHint && (
        <div style={{ textAlign: 'center', marginTop: 4, fontSize: 12, color: '#fcd34d' }}>
          💡 {state.lastHint.recommendedArea}
        </div>
      )}
    </div>
  )
}
