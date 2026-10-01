import { useState, useEffect, useRef, useMemo } from 'react'
import { loadProfile } from '../lib/playerProfile'

// ── Win detection ────────────────────────────────────────────────────────────
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],          // diagonals
]

type Cell = 'X' | 'O' | null
type Phase = 'playing' | 'win' | 'draw'
type Turn  = 'player' | 'cpu'
type Difficulty = 'easy' | 'medium' | 'hard'

interface WinResult { winner: Cell; line: number[] }

function checkWin(board: Cell[]): WinResult | null {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Cell, line: [a,b,c] }
    }
  }
  return null
}

function isDraw(board: Cell[]): boolean {
  return board.every(c => c !== null) && !checkWin(board)
}

// ── Minimax (used by HARD) ────────────────────────────────────────────────────
function minimax(board: Cell[], depth: number, isMax: boolean, cpu: Cell, player: Cell): number {
  const win = checkWin(board)
  if (win) return win.winner === cpu ? 10 - depth : depth - 10
  if (board.every(c => c !== null)) return 0

  const empty = board.map((c,i) => c === null ? i : -1).filter(i => i >= 0)
  if (isMax) {
    let best = -Infinity
    for (const i of empty) {
      board[i] = cpu
      best = Math.max(best, minimax(board, depth+1, false, cpu, player))
      board[i] = null
    }
    return best
  } else {
    let best = Infinity
    for (const i of empty) {
      board[i] = player
      best = Math.min(best, minimax(board, depth+1, true, cpu, player))
      board[i] = null
    }
    return best
  }
}

function getCpuMove(board: Cell[], cpu: Cell, player: Cell, difficulty: Difficulty): number {
  const empty = board.map((c,i) => c === null ? i : -1).filter(i => i >= 0)
  if (!empty.length) return -1

  if (difficulty === 'easy') {
    if (Math.random() > 0.7) {
      for (const i of empty) {
        const t = [...board]; t[i] = player
        if (checkWin(t)) return i
      }
    }
    return empty[Math.floor(Math.random() * empty.length)]
  }

  if (difficulty === 'medium') {
    for (const i of empty) { const t=[...board];t[i]=cpu; if(checkWin(t)) return i }
    for (const i of empty) { const t=[...board];t[i]=player; if(checkWin(t)) return i }
    if (board[4]===null) return 4
    const corners = [0,2,6,8].filter(i => board[i]===null)
    if (corners.length) return corners[Math.floor(Math.random()*corners.length)]
    return empty[Math.floor(Math.random()*empty.length)]
  }

  // HARD: minimax
  let bestScore = -Infinity, bestMove = empty[0]
  const b = [...board]
  for (const i of empty) {
    b[i] = cpu
    const score = minimax(b, 0, false, cpu, player)
    b[i] = null
    if (score > bestScore) { bestScore = score; bestMove = i }
  }
  return bestMove
}

// ── Component ────────────────────────────────────────────────────────────────
interface Props { onExit: () => void }

const CPU_AVATARS = ['🤖','🎯','⚡','🦊','👾']
const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: 'آسان', medium: 'متوسط', hard: 'سخت' }
const DIFFICULTY_COLORS: Record<Difficulty, string> = { easy: '#22c55e', medium: '#ffd60a', hard: '#CC2229' }

const PLAYER_SYMBOL: Cell = 'X'
const CPU_SYMBOL: Cell = 'O'

export default function DozGame({ onExit }: Props) {
  const profile = loadProfile()

  const [difficulty, setDifficulty] = useState<Difficulty>(
    () => (localStorage.getItem('ta_cpu_difficulty') as Difficulty | null) ?? 'medium'
  )
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [turn, setTurn]   = useState<Turn>('player')
  const [phase, setPhase] = useState<Phase>('playing')
  const [winResult, setWinResult] = useState<WinResult | null>(null)
  const [lastMove, setLastMove]   = useState<number | null>(null)
  const [thinking, setThinking]   = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [cpuScore, setCpuScore]       = useState(0)
  const [draws, setDraws]             = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  // Stable avatar for the session
  const cpuAvatar = useMemo(
    () => CPU_AVATARS[Math.floor(Math.random() * CPU_AVATARS.length)],
    []
  )

  // roundId guards against stale timeouts firing after restart
  const roundIdRef = useRef(0)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  // boardRef always holds the latest board — prevents stale closure in the CPU timeout
  const boardRef   = useRef<Cell[]>(Array(9).fill(null))
  boardRef.current = board

  // ── CPU turn via effect — fires whenever turn becomes 'cpu' ──────────────
  useEffect(() => {
    if (turn !== 'cpu' || phase !== 'playing') return

    const myRound = roundIdRef.current
    setThinking(true)

    const delay = 400 + Math.random() * 600
    timerRef.current = setTimeout(() => {
      if (roundIdRef.current !== myRound) return

      // Always read from ref so we never act on a stale board snapshot
      const currentBoard = boardRef.current
      const move = getCpuMove(currentBoard, CPU_SYMBOL, PLAYER_SYMBOL, difficulty)
      if (move === -1) { setThinking(false); return }

      const next = [...currentBoard]
      next[move] = CPU_SYMBOL
      setBoard(next)
      setLastMove(move)
      setThinking(false)

      const win = checkWin(next)
      if (win) {
        setPhase('win')
        setWinResult(win)
        setCpuScore(s => s + 1)
      } else if (isDraw(next)) {
        setPhase('draw')
        setDraws(d => d + 1)
      } else {
        setTurn('player')
      }
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, phase])

  // ── Player move ───────────────────────────────────────────────────────────
  function handleCellClick(idx: number) {
    if (phase !== 'playing' || turn !== 'player' || board[idx] || thinking) return

    const next = [...board]
    next[idx] = PLAYER_SYMBOL
    setBoard(next)
    setLastMove(idx)

    const win = checkWin(next)
    if (win) {
      setPhase('win')
      setWinResult(win)
      setPlayerScore(s => s + 1)
    } else if (isDraw(next)) {
      setPhase('draw')
      setDraws(d => d + 1)
    } else {
      setTurn('cpu')
      // CPU turn is handled by the useEffect above
    }
  }

  // ── Restart round ─────────────────────────────────────────────────────────
  function restartRound() {
    roundIdRef.current += 1          // invalidate any in-flight CPU timeout
    if (timerRef.current) clearTimeout(timerRef.current)
    setBoard(Array(9).fill(null))
    setTurn('player')
    setPhase('playing')
    setWinResult(null)
    setLastMove(null)
    setThinking(false)
  }

  function newGame() {
    restartRound()
    setPlayerScore(0)
    setCpuScore(0)
    setDraws(0)
  }

  // ── Setup screen ──────────────────────────────────────────────────────────
  if (!gameStarted) {
    return (
      <div dir="rtl" style={{
        position:'fixed',inset:0,zIndex:500,
        background:'#050304',
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        padding:24,gap:28,
      }}>
        <button onClick={onExit} style={{
          position:'absolute',top:20,right:20,
          background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',
          color:'#9a9b9e',borderRadius:12,padding:'8px 14px',cursor:'pointer',fontSize:13,
        }}>← خروج</button>

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:60,marginBottom:8}}>🎮</div>
          <h1 style={{color:'#fff',fontSize:28,fontWeight:900,margin:0}}>دوز</h1>
          <p style={{color:'#6D6E71',fontSize:14,margin:'8px 0 0'}}>نبرد با هوش مصنوعی</p>
        </div>

        <div style={{width:'100%',maxWidth:320}}>
          <p style={{color:'#6D6E71',fontSize:12,fontWeight:700,marginBottom:12,textAlign:'center'}}>سطح دشواری</p>
          <div style={{display:'flex',gap:10}}>
            {(['easy','medium','hard'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => { setDifficulty(d); localStorage.setItem('ta_cpu_difficulty', d) }}
                style={{
                  flex:1,padding:'12px 8px',borderRadius:14,cursor:'pointer',
                  fontWeight:900,fontSize:14,transition:'all 0.2s',
                  background: difficulty===d ? `${DIFFICULTY_COLORS[d]}20` : '#1a1a1c',
                  border: `2px solid ${difficulty===d ? DIFFICULTY_COLORS[d] : '#2e2e32'}`,
                  color: difficulty===d ? DIFFICULTY_COLORS[d] : '#555',
                }}>
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setGameStarted(true)}
          style={{
            padding:'16px 48px',borderRadius:18,
            background:'linear-gradient(135deg,#CC2229,#e84249)',
            color:'#fff',fontWeight:900,fontSize:18,cursor:'pointer',
            border:'none',boxShadow:'0 4px 24px #CC222955',
            letterSpacing:'-0.01em',
          }}>
          شروع بازی
        </button>
      </div>
    )
  }

  // ── Game screen ───────────────────────────────────────────────────────────
  const isPlayerWin = phase === 'win' && winResult?.winner === PLAYER_SYMBOL
  const isCpuWin    = phase === 'win' && winResult?.winner === CPU_SYMBOL

  return (
    <div dir="rtl" style={{
      position:'fixed',inset:0,zIndex:500,
      background:'#050304',
      display:'flex',flexDirection:'column',
      overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{
        display:'flex',alignItems:'center',gap:12,
        padding:'16px 20px',
        borderBottom:'1px solid #1e1e20',
        flexShrink:0,
      }}>
        <button onClick={onExit} style={{
          background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',
          color:'#9a9b9e',borderRadius:10,padding:'6px 12px',cursor:'pointer',fontSize:12,
        }}>← خروج</button>
        <div style={{flex:1,textAlign:'center'}}>
          <p style={{color:'#fff',fontWeight:900,fontSize:16,margin:0}}>دوز</p>
          <p style={{
            fontSize:12,margin:'2px 0 0',
            color: phase==='playing'
              ? (thinking ? '#ffd60a' : turn==='player' ? '#4ade80' : '#ffd60a')
              : phase==='win'
                ? (isPlayerWin ? '#4ade80' : '#e84249')
                : '#9a9b9e',
          }}>
            {phase==='playing'
              ? (thinking ? `${cpuAvatar} CPU در حال فکر کردن...` : '✅ نوبت شما')
              : phase==='win'
                ? (isPlayerWin ? '🎉 شما بردید!' : '🤖 CPU برد!')
                : '🤝 بازی مساوی شد'}
          </p>
        </div>
        <span style={{
          fontSize:11,padding:'4px 10px',borderRadius:999,fontWeight:700,
          background:`${DIFFICULTY_COLORS[difficulty]}18`,
          color:DIFFICULTY_COLORS[difficulty],
          border:`1px solid ${DIFFICULTY_COLORS[difficulty]}44`,
        }}>{DIFFICULTY_LABELS[difficulty]}</span>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'16px 20px 24px',gap:16,overflow:'auto'}}>

        {/* Players row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:12,width:'100%',maxWidth:380}}>
          {/* Human player */}
          <div style={{
            display:'flex',flexDirection:'column',alignItems:'center',gap:6,
            padding:'12px 16px',borderRadius:16,
            background: turn==='player' && phase==='playing' ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
            border:`1.5px solid ${turn==='player' && phase==='playing' ? '#4ade8055' : '#2e2e32'}`,
            transition:'all 0.25s',minWidth:90,justifySelf:'end',
          }}>
            <div style={{fontSize:36}}>😊</div>
            <p style={{color:'#fff',fontWeight:900,fontSize:13,margin:0,textAlign:'center',maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {profile.name || 'شما'}
            </p>
            <div style={{
              fontSize:11,padding:'2px 8px',borderRadius:999,fontWeight:900,
              background:'rgba(74,222,128,0.1)',color:'#4ade80',border:'1px solid #4ade8033',
            }}>X</div>
          </div>

          {/* Score */}
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:28,fontWeight:900,color:'#4ade80'}}>{playerScore}</span>
              <span style={{color:'#333',fontSize:18}}>:</span>
              <span style={{fontSize:28,fontWeight:900,color:'#e84249'}}>{cpuScore}</span>
            </div>
            {draws > 0 && (
              <p style={{color:'#555',fontSize:11,margin:0}}>{draws} مساوی</p>
            )}
          </div>

          {/* CPU player */}
          <div style={{
            display:'flex',flexDirection:'column',alignItems:'center',gap:6,
            padding:'12px 16px',borderRadius:16,
            background: turn==='cpu' && phase==='playing' ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.03)',
            border:`1.5px solid ${turn==='cpu' && phase==='playing' ? '#f8717155' : '#2e2e32'}`,
            transition:'all 0.25s',minWidth:90,justifySelf:'start',
          }}>
            <div style={{fontSize:36,position:'relative'}}>
              {cpuAvatar}
              {thinking && (
                <span style={{position:'absolute',top:-4,right:-4,fontSize:14,
                  animation:'spin 1s linear infinite'}}>⚙️</span>
              )}
            </div>
            <p style={{color:'#fff',fontWeight:900,fontSize:13,margin:0}}>CPU</p>
            <div style={{
              fontSize:11,padding:'2px 8px',borderRadius:999,fontWeight:900,
              background:'rgba(248,113,113,0.1)',color:'#f87171',border:'1px solid #f8717133',
            }}>O</div>
          </div>
        </div>

        {/* Board */}
        <div style={{
          display:'grid',gridTemplateColumns:'repeat(3,1fr)',
          gap:8,
          width:'min(100%,360px)',
        }}>
          {board.map((cell, idx) => {
            const isWinCell = winResult?.line.includes(idx)
            const isLast = lastMove === idx
            const canClick = phase==='playing' && turn==='player' && !cell && !thinking

            return (
              <button key={idx} onClick={() => handleCellClick(idx)}
                disabled={!canClick}
                style={{
                  aspectRatio:'1',
                  borderRadius:16,
                  border:`2px solid ${isWinCell ? '#ffd60a' : '#2e2e32'}`,
                  background: isWinCell ? 'rgba(255,214,10,0.1)'
                    : isLast ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.02)',
                  cursor: canClick ? 'pointer' : 'default',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'clamp(36px,10vw,64px)',
                  fontWeight:900,
                  color: cell==='X' ? '#4ade80' : '#f87171',
                  transition:'all 0.15s',
                  boxShadow: isWinCell ? '0 0 20px #ffd60a33' : 'none',
                  transform: isLast ? 'scale(1.04)' : 'scale(1)',
                }}>
                {cell === 'X' ? '✕' : cell === 'O' ? '○' : ''}
              </button>
            )
          })}
        </div>

        {/* Result overlay or action buttons */}
        <div style={{width:'100%',maxWidth:380}}>
          {phase !== 'playing' ? (
            <div style={{
              padding:'20px',borderRadius:20,textAlign:'center',
              background: isPlayerWin ? 'rgba(74,222,128,0.08)'
                : isCpuWin ? 'rgba(248,113,113,0.08)'
                : 'rgba(255,255,255,0.04)',
              border:`1px solid ${isPlayerWin ? '#4ade8044' : isCpuWin ? '#f8717144' : '#2e2e32'}`,
            }}>
              <p style={{
                fontSize:22,fontWeight:900,margin:'0 0 4px',
                color: isPlayerWin ? '#4ade80' : isCpuWin ? '#f87171' : '#9a9b9e',
              }}>
                {isPlayerWin ? '🎉 شما بردید!' : isCpuWin ? '🤖 CPU برد!' : '🤝 مساوی'}
              </p>
              <div style={{display:'flex',gap:10,marginTop:14}}>
                <button onClick={restartRound}
                  style={{
                    flex:1,padding:'12px',borderRadius:14,cursor:'pointer',
                    background:'rgba(204,34,41,0.15)',border:'1.5px solid #CC2229',
                    color:'#e84249',fontWeight:900,fontSize:14,
                  }}>
                  🔄 دور مجدد
                </button>
                <button onClick={newGame}
                  style={{
                    flex:1,padding:'12px',borderRadius:14,cursor:'pointer',
                    background:'rgba(255,255,255,0.04)',border:'1px solid #2e2e32',
                    color:'#9a9b9e',fontWeight:700,fontSize:13,
                  }}>
                  بازی جدید
                </button>
              </div>
            </div>
          ) : (
            <div style={{display:'flex',gap:10}}>
              <button onClick={newGame}
                style={{
                  flex:1,padding:'12px',borderRadius:14,cursor:'pointer',
                  background:'rgba(255,255,255,0.03)',border:'1px solid #2e2e32',
                  color:'#555',fontWeight:700,fontSize:13,
                }}>
                🔄 شروع مجدد
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
