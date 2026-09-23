import { useState, useRef, useEffect, useCallback } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'
import { avatarSrc } from '../../lib/avatars'
import artBDesigner from '../../imports/art-b-designer.png'
import { supabase } from '../../lib/supabase'
import { usePrivateChannel } from '../../lib/multiplayer/usePrivateChannel'

// ── Word bank with categories ────────────────────────────────────────────────
const WORD_BANK: { word: string; category: string }[] = [
  { word: 'گربه',      category: 'حیوانات' },  { word: 'سگ',         category: 'حیوانات' },
  { word: 'فیل',       category: 'حیوانات' },  { word: 'زرافه',      category: 'حیوانات' },
  { word: 'لاک‌پشت',  category: 'حیوانات' },  { word: 'طاووس',      category: 'حیوانات' },
  { word: 'اژدها',     category: 'فانتزی' },   { word: 'روبات',      category: 'فناوری' },
  { word: 'فضانورد',   category: 'علم' },      { word: 'کامپیوتر',   category: 'فناوری' },
  { word: 'تلفن',      category: 'فناوری' },   { word: 'هواپیما',    category: 'وسایل نقلیه' },
  { word: 'دوچرخه',    category: 'وسایل نقلیه' }, { word: 'قایق',    category: 'وسایل نقلیه' },
  { word: 'ماشین',     category: 'وسایل نقلیه' }, { word: 'کیک تولد', category: 'غذا' },
  { word: 'پیتزا',     category: 'غذا' },      { word: 'بستنی',      category: 'غذا' },
  { word: 'تاج',       category: 'اشیاء' },    { word: 'شمشیر',      category: 'اشیاء' },
  { word: 'چتر',       category: 'اشیاء' },    { word: 'کتاب',       category: 'اشیاء' },
  { word: 'گیتار',     category: 'موزیک' },    { word: 'قلعه',       category: 'معماری' },
  { word: 'پل',        category: 'معماری' },   { word: 'کوه',        category: 'طبیعت' },
  { word: 'دریا',      category: 'طبیعت' },    { word: 'آتشفشان',    category: 'طبیعت' },
  { word: 'رنگین‌کمان', category: 'طبیعت' },  { word: 'کاکتوس',     category: 'طبیعت' },
]

function randomWord() { return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)] }

const ROUND_SECONDS = 60
const COLORS = ['#ffffff', '#CC2229', '#3b82f6', '#22c55e', '#f97316', '#ffd60a', '#a855f7', '#111111']

// ── Stroke types ─────────────────────────────────────────────────────────────
interface Stroke {
  x0: number; y0: number; x1: number; y1: number
  color: string; width: number
}

// ── Public game state (sent to ALL players — no secret word here) ────────────
interface DrawPublicState {
  phase: 'round_start' | 'drawing' | 'round_end' | 'game_end'
  roundNum: number
  drawerIdx: number
  drawerId: string
  drawerName: string
  category: string
  letterCount: number
  roundStartedAt: number   // epoch ms — clients compute remaining time from this
  roundDuration: number    // ms
  guesses: { playerId: string; name: string; correct: boolean }[]
  scores: Record<string, number>
  correctGuesserId?: string
  correctGuesserName?: string
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  players: BehsazaniPlayer[]
  myPlayer?: BehsazaniPlayer
  isHost?: boolean
  isOnline?: boolean
  roomCode?: string
  hostPlayerId?: string
  onExit: () => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  ctx.strokeStyle = s.color
  ctx.lineWidth = s.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(s.x0, s.y0)
  ctx.lineTo(s.x1, s.y1)
  ctx.stroke()
}

function fillCanvas(canvas: HTMLCanvasElement | null, bg = '#1a1a1c') {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height),
  }
}

// ── Timer hook: computes seconds left from authoritative roundStartedAt ──────
function useRoundTimer(pub: DrawPublicState | null): number {
  const [secs, setSecs] = useState(ROUND_SECONDS)
  useEffect(() => {
    if (!pub || pub.phase !== 'drawing') { setSecs(ROUND_SECONDS); return }
    function tick() {
      const elapsed = Date.now() - pub.roundStartedAt
      const left = Math.max(0, Math.ceil((pub.roundDuration - elapsed) / 1000))
      setSecs(left)
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [pub])
  return secs
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL PASS-THE-PHONE MODE (unchanged original logic)
// ─────────────────────────────────────────────────────────────────────────────
function LocalDrawerGame({ players, onExit }: { players: BehsazaniPlayer[]; onExit: () => void }) {
  type Phase = 'pick_drawer' | 'drawing' | 'guessing' | 'reveal' | 'result'
  const [drawerIdx, setDrawerIdx] = useState(0)
  const [roundNum, setRoundNum] = useState(0)
  const [phase, setPhase] = useState<Phase>('pick_drawer')
  const [word, setWord] = useState('')
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(players.map(p => [p.id, 0])))
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [guesses, setGuesses] = useState<{ name: string; guess: string; correct: boolean }[]>([])
  const [guessInput, setGuessInput] = useState('')
  const [guesserIdx, setGuesserIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const [color, setColor] = useState('#ffffff')
  const [brushSize, setBrushSize] = useState(4)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const drawer = players[drawerIdx % players.length]
  const guessers = players.filter(p => p.id !== drawer.id)
  const currentGuesser = guessers[guesserIdx]

  useEffect(() => {
    if (phase === 'drawing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current!); setPhase('guessing'); return 0 } return t - 1 })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current; if (!canvas) return; e.preventDefault()
    drawing.current = true; lastPos.current = getPos(e, canvas)
  }
  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return
    const canvas = canvasRef.current; if (!canvas) return; e.preventDefault()
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    drawStroke(ctx, { x0: lastPos.current.x, y0: lastPos.current.y, x1: pos.x, y1: pos.y, color, width: brushSize })
    lastPos.current = pos
  }
  function stopDraw() { drawing.current = false }
  function clearCanvas() { fillCanvas(canvasRef.current) }

  useEffect(() => { if (phase === 'drawing') fillCanvas(canvasRef.current) }, [phase])

  function submitGuess(guess: string) {
    if (!guess.trim()) return
    const correct = guess.trim().toLowerCase() === word.toLowerCase()
    const pts = correct ? Math.ceil(timeLeft * 5) : 0
    setGuesses(prev => [...prev, { name: currentGuesser.name, guess: guess.trim(), correct }])
    if (correct) setScores(prev => ({ ...prev, [currentGuesser.id]: (prev[currentGuesser.id] || 0) + pts }))
    setGuessInput('')
    setGuesserIdx(i => i + 1)
  }

  if (phase === 'pick_drawer') return (
    <div className="h-full flex flex-col items-center justify-center gap-5 px-6 relative" dir="rtl"
      style={{ background: 'linear-gradient(135deg, #0e0e0f, #181618, #1a1010)' }}>
      <button onClick={onExit} className="btn-game absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white" style={{ background: 'rgba(255,255,255,0.07)' }}>→</button>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <img src={artBDesigner} alt="" className="w-28 h-28 object-contain rounded-2xl" style={{ filter: 'drop-shadow(0 4px 16px rgba(249,115,22,0.35))' }} />
          <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full overflow-hidden" style={{ border: '3px solid #f97316', boxShadow: '0 0 12px rgba(249,115,22,0.6)', background: '#1a1a1c' }}>
            <img src={avatarSrc(drawer.avatar)} alt={drawer.name} className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>دور {roundNum + 1} • نوبت طراح</p>
          <h2 className="font-black text-white text-2xl mt-0.5">{drawer.name}</h2>
          <p className="text-xs mt-1" style={{ color: '#f97316' }}>کلمه را انتخاب کن، بقیه حدس می‌زنند!</p>
        </div>
      </div>
      <input value={word} onChange={e => setWord(e.target.value)} placeholder="کلمه برای نقاشی..." className="w-full max-w-xs px-4 py-3 rounded-xl font-bold text-white" style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid #f97316', outline: 'none' }} />
      <button onClick={() => { setTimeLeft(ROUND_SECONDS); setGuesses([]); setGuesserIdx(0); setPhase('drawing') }} disabled={!word.trim()} className="btn-game px-8 py-4 rounded-2xl font-black text-white" style={{ background: word.trim() ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.07)' }}>شروع نقاشی!</button>
      <button onClick={() => setWord(randomWord().word)} className="btn-game px-4 py-2 rounded-xl text-xs font-bold" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid #f9731644' }}>🎲 کلمه تصادفی</button>
    </div>
  )

  if (phase === 'drawing') return (
    <div className="h-full flex flex-col" dir="rtl">
      <div className="flex-shrink-0 px-3 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-3 py-1.5 rounded-xl" style={{ background: 'rgba(249,115,22,0.15)', border: '1.5px solid #f97316' }}><span className="font-black text-white">{word}</span></div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ background: timeLeft > 20 ? '#22c55e' : timeLeft > 10 ? '#ffd60a' : '#CC2229', color: '#fff' }}>{timeLeft}</div>
      </div>
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        <canvas ref={canvasRef} width={800} height={600} className="w-full h-full" style={{ touchAction: 'none', cursor: 'crosshair' }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      </div>
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {COLORS.map(c => <button key={c} onClick={() => setColor(c)} className="btn-game w-7 h-7 rounded-full" style={{ background: c, border: `2.5px solid ${color === c ? '#fff' : 'transparent'}`, transform: color === c ? 'scale(1.2)' : 'scale(1)' }} />)}
        <select value={brushSize} onChange={e => setBrushSize(+e.target.value)} className="px-2 py-1 rounded-lg text-xs font-bold text-white" style={{ background: 'rgba(30,30,34,0.9)', border: '1px solid rgba(255,255,255,0.15)', outline: 'none' }}>
          {[2, 4, 8, 16].map(s => <option key={s} value={s}>{s}px</option>)}
        </select>
        <button onClick={clearCanvas} className="btn-game px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: 'rgba(255,255,255,0.07)' }}>پاک</button>
        <button onClick={() => { clearInterval(timerRef.current!); setPhase('guessing') }} className="btn-game px-3 py-1.5 rounded-lg text-xs font-black text-white mr-auto" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>حدس →</button>
      </div>
    </div>
  )

  if (phase === 'guessing') {
    if (!currentGuesser) { setPhase('reveal'); return null }
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <p className="text-xs" style={{ color: '#9a9b9e' }}>گوشی را به <span style={{ color: '#f97316' }}>{currentGuesser.name}</span> بده</p>
        <h2 className="font-black text-white text-xl">حدست چیه؟</h2>
        <div className="flex gap-2 w-full max-w-xs">
          <input value={guessInput} onChange={e => setGuessInput(e.target.value)} placeholder="حدس بزن..." onKeyDown={e => e.key === 'Enter' && submitGuess(guessInput)}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-white" style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.15)', outline: 'none' }} />
          <button disabled={!guessInput.trim()} onClick={() => submitGuess(guessInput)} className="btn-game px-4 py-3 rounded-xl font-black text-white" style={{ background: guessInput.trim() ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.07)' }}>حدس!</button>
        </div>
        <p className="text-xs" style={{ color: '#6D6E71' }}>{guesserIdx + 1} از {guessers.length}</p>
      </div>
    )
  }

  if (phase === 'reveal') return (
    <div className="h-full flex flex-col gap-5 px-6 py-8" dir="rtl">
      <div className="text-center"><p className="text-sm font-bold" style={{ color: '#9a9b9e' }}>کلمه بود:</p><p className="font-black text-3xl" style={{ color: '#ffd60a' }}>{word}</p></div>
      <div className="flex flex-col gap-2">
        {guesses.map((g, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: g.correct ? 'rgba(34,197,94,0.1)' : 'rgba(30,30,34,0.8)', border: `1.5px solid ${g.correct ? '#22c55e' : 'rgba(255,255,255,0.06)'}` }}>
            <span className="text-sm font-bold text-white">{g.name}:</span>
            <span className="text-sm font-bold" style={{ color: g.correct ? '#22c55e' : '#9a9b9e' }}>{g.correct ? '✅' : '❌'} {g.guess}</span>
          </div>
        ))}
        {guesses.length === 0 && <p className="text-center text-sm" style={{ color: '#CC2229' }}>کسی درست حدس نزد!</p>}
      </div>
      <button onClick={() => { if (roundNum + 1 >= players.length) setPhase('result'); else { setRoundNum(r => r + 1); setDrawerIdx(i => i + 1); setWord(''); setGuesses([]); setGuesserIdx(0); setPhase('pick_drawer') } }}
        className="btn-game py-4 rounded-2xl font-black text-white mt-auto" style={{ background: 'rgba(255,255,255,0.1)' }}>
        {roundNum + 1 >= players.length ? 'نتیجه نهایی' : 'دور بعد →'}
      </button>
    </div>
  )

  if (phase === 'result') {
    const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <div className="text-6xl">🎨</div>
        <h2 className="font-black text-white text-2xl">نتیجه نهایی</h2>
        <div className="w-full max-w-xs flex flex-col gap-2">
          {sorted.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl" style={{ background: i === 0 ? 'rgba(249,115,22,0.15)' : 'rgba(30,30,34,0.8)', border: `1.5px solid ${i === 0 ? '#f9731655' : 'rgba(255,255,255,0.06)'}` }}>
              <span className="font-black text-xl">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
              <span className="font-bold text-white flex-1">{p.name}</span>
              <span className="font-black" style={{ color: '#f97316' }}>{scores[p.id] || 0} امتیاز</span>
            </div>
          ))}
        </div>
        <button onClick={onExit} className="btn-game px-8 py-4 rounded-2xl font-black text-white" style={{ background: 'rgba(255,255,255,0.1)' }}>خروج</button>
      </div>
    )
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// ONLINE MULTIPLAYER MODE — Role-Based, Word-Isolated
// ─────────────────────────────────────────────────────────────────────────────
function OnlineDrawerGame({ players, myPlayer, isHost, roomCode, onExit }: {
  players: BehsazaniPlayer[]
  myPlayer: BehsazaniPlayer
  isHost: boolean
  roomCode: string
  onExit: () => void
}) {
  // ── My private role state (word ONLY exists here for drawer) ─────────────
  const [myWord, setMyWord] = useState<string | null>(null)
  const [myCategory, setMyCategory] = useState<string | null>(null)
  const [amIDrawer, setAmIDrawer] = useState(false)

  // ── Public game state (NO word field) ────────────────────────────────────
  const [pub, setPub] = useState<DrawPublicState | null>(null)
  const timeLeft = useRoundTimer(pub)

  // ── Canvas refs ───────────────────────────────────────────────────────────
  const drawerCanvasRef = useRef<HTMLCanvasElement>(null)
  const viewerCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const [color, setColor] = useState('#ffffff')
  const [brushSize, setBrushSize] = useState(4)
  const strokeBufRef = useRef<Stroke[]>([])
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Guesser state ─────────────────────────────────────────────────────────
  const [guessInput, setGuessInput] = useState('')
  const [myGuessResult, setMyGuessResult] = useState<'correct' | 'wrong' | null>(null)

  // ── Supabase channels ─────────────────────────────────────────────────────
  const pubChRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const strokeChRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // ── Private channel: receive secret word (drawer only) ───────────────────
  const { sendPrivate } = usePrivateChannel(
    roomCode,
    myPlayer.id,
    useCallback((msg) => {
      if (msg.type === 'draw_word') {
        const d = msg.data as { word: string; category: string }
        setMyWord(d.word)
        setMyCategory(d.category)
        setAmIDrawer(true)
      }
    }, []),
  )

  // ── Subscribe to public game state ────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel(`beh-${roomCode}-draw-pub`, {
      config: { broadcast: { self: true, ack: false } },
    })
    ch.on('broadcast', { event: 'draw_pub' }, ({ payload }: any) => {
      if (payload?.state) {
        const s = payload.state as DrawPublicState
        setPub(s)
        // Reset drawer state when drawer changes
        if (s.drawerId !== myPlayer.id) { setAmIDrawer(false); setMyWord(null); setMyCategory(null) }
        if (s.phase === 'round_start' || s.phase === 'round_end') {
          setMyGuessResult(null)
          setGuessInput('')
        }
      }
    }).subscribe()
    pubChRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [roomCode, myPlayer.id])

  // ── Subscribe to stroke events (guessers replay on viewer canvas) ─────────
  useEffect(() => {
    const ch = supabase.channel(`beh-${roomCode}-draw-strokes`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'stroke' }, ({ payload }: any) => {
      const canvas = amIDrawer ? drawerCanvasRef.current : viewerCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      if (payload.type === 'clear') { fillCanvas(canvas); return }
      if (payload.strokes) {
        for (const s of payload.strokes as Stroke[]) drawStroke(ctx, s)
      }
    }).subscribe()
    strokeChRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [roomCode, amIDrawer])

  // ── Flush stroke buffer every 40ms ────────────────────────────────────────
  useEffect(() => {
    if (!amIDrawer) return
    flushTimerRef.current = setInterval(async () => {
      if (strokeBufRef.current.length === 0) return
      const strokes = [...strokeBufRef.current]
      strokeBufRef.current = []
      const ch = supabase.channel(`beh-${roomCode}-draw-strokes`, {
        config: { broadcast: { self: false, ack: false } },
      })
      await new Promise<void>(res => {
        ch.subscribe(async s => {
          if (s === 'SUBSCRIBED') {
            await ch.send({ type: 'broadcast', event: 'stroke', payload: { strokes } }).catch(() => {})
            await supabase.removeChannel(ch)
            res()
          }
        })
      })
    }, 40)
    return () => { if (flushTimerRef.current) clearInterval(flushTimerRef.current) }
  }, [amIDrawer, roomCode])

  // ── Auto-end round when timer reaches 0 (host only) ──────────────────────
  useEffect(() => {
    if (!isHost || !pub || pub.phase !== 'drawing') return
    if (timeLeft === 0) { endRound(pub) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isHost])

  // ── Canvas fill on round start ────────────────────────────────────────────
  useEffect(() => {
    fillCanvas(drawerCanvasRef.current)
    fillCanvas(viewerCanvasRef.current)
  }, [pub?.roundNum])

  // ── Broadcast helpers ─────────────────────────────────────────────────────
  const broadcastPub = useCallback(async (state: DrawPublicState) => {
    // Host sets its own state immediately so it never waits for its own broadcast
    setPub(state)
    const ch = supabase.channel(`beh-${roomCode}-draw-pub`, {
      config: { broadcast: { self: false, ack: false } },
    })
    await new Promise<void>(res => {
      ch.subscribe(async s => {
        if (s === 'SUBSCRIBED') {
          await ch.send({ type: 'broadcast', event: 'draw_pub', payload: { state } }).catch(() => {})
          await supabase.removeChannel(ch)
          res()
        }
      })
    })
  }, [roomCode])

  const broadcastClear = useCallback(async () => {
    const ch = supabase.channel(`beh-${roomCode}-draw-strokes`, {
      config: { broadcast: { self: false, ack: false } },
    })
    await new Promise<void>(res => {
      ch.subscribe(async s => {
        if (s === 'SUBSCRIBED') {
          await ch.send({ type: 'broadcast', event: 'stroke', payload: { type: 'clear' } }).catch(() => {})
          await supabase.removeChannel(ch)
          res()
        }
      })
    })
  }, [roomCode])

  // ── Host: start first round on mount ─────────────────────────────────────
  useEffect(() => {
    if (!isHost) return
    startRound(0, Object.fromEntries(players.map(p => [p.id, 0])))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startRound(drawerIdx: number, scores: Record<string, number>) {
    const drawer = players[drawerIdx % players.length]
    const w = randomWord()

    // Send word ONLY to drawer via private channel (other clients never see this)
    await sendPrivate(drawer.id, { type: 'draw_word', data: { word: w.word, category: w.category } })

    // If host is the drawer, set own state too
    if (drawer.id === myPlayer.id) {
      setMyWord(w.word)
      setMyCategory(w.category)
      setAmIDrawer(true)
    }

    const state: DrawPublicState = {
      phase: 'drawing',
      roundNum: drawerIdx,
      drawerIdx,
      drawerId: drawer.id,
      drawerName: drawer.name,
      // category visible to all — word is NOT here
      category: w.category,
      letterCount: w.word.replace(/\s/g, '').length,
      roundStartedAt: Date.now(),
      roundDuration: ROUND_SECONDS * 1000,
      guesses: [],
      scores,
    }
    await broadcastPub(state)
    fillCanvas(drawerCanvasRef.current)
    fillCanvas(viewerCanvasRef.current)
  }

  async function endRound(currentPub: DrawPublicState) {
    const state: DrawPublicState = {
      ...currentPub,
      phase: 'round_end',
    }
    await broadcastPub(state)
  }

  // ── Host: handle correct guess ────────────────────────────────────────────
  async function handleGuess(guessText: string, guesser: BehsazaniPlayer) {
    if (!pub || !myWord || pub.phase !== 'drawing') return false

    const correct = guessText.trim().toLowerCase() === myWord.toLowerCase()
    const elapsed = Date.now() - pub.roundStartedAt
    const remainingSecs = Math.max(0, Math.ceil((pub.roundDuration - elapsed) / 1000))
    const pts = correct ? Math.max(10, Math.ceil(remainingSecs * 3)) : 0
    const drawerBonus = correct ? Math.max(5, Math.ceil(remainingSecs * 1.5)) : 0

    const newScores = { ...pub.scores }
    if (correct) {
      newScores[guesser.id] = (newScores[guesser.id] || 0) + pts
      newScores[pub.drawerId] = (newScores[pub.drawerId] || 0) + drawerBonus
    }

    const newGuesses = [
      ...pub.guesses,
      { playerId: guesser.id, name: guesser.name, correct },
    ]

    const state: DrawPublicState = {
      ...pub,
      guesses: newGuesses,
      scores: newScores,
      ...(correct ? {
        phase: 'round_end' as const,
        correctGuesserId: guesser.id,
        correctGuesserName: guesser.name,
      } : {}),
    }
    await broadcastPub(state)
    return correct
  }

  // ── Canvas drawing (drawer only) ──────────────────────────────────────────
  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = drawerCanvasRef.current; if (!canvas) return; e.preventDefault()
    drawing.current = true; lastPos.current = getPos(e, canvas)
  }
  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return
    const canvas = drawerCanvasRef.current; if (!canvas) return; e.preventDefault()
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    const s: Stroke = { x0: lastPos.current.x, y0: lastPos.current.y, x1: pos.x, y1: pos.y, color, width: brushSize }
    drawStroke(ctx, s)
    strokeBufRef.current.push(s)
    lastPos.current = pos
  }
  function stopDraw() { drawing.current = false }
  function clearDrawing() {
    fillCanvas(drawerCanvasRef.current)
    broadcastClear()
  }

  // ── Guesser submits guess ─────────────────────────────────────────────────
  async function submitGuess() {
    if (!guessInput.trim() || !pub || myGuessResult) return
    const guesser = myPlayer

    if (isHost) {
      // Host is always drawer, so this shouldn't happen — but handle anyway
      const correct = await handleGuess(guessInput, guesser)
      setMyGuessResult(correct ? 'correct' : 'wrong')
    } else {
      // Non-host: send guess action to host via action channel
      const ch = supabase.channel(`beh-${roomCode}-draw-actions`, {
        config: { broadcast: { self: false, ack: false } },
      })
      await new Promise<void>(res => {
        ch.subscribe(async s => {
          if (s === 'SUBSCRIBED') {
            await ch.send({
              type: 'broadcast', event: 'draw_action',
              payload: { type: 'guess', guess: guessInput.trim(), playerId: myPlayer.id, playerName: myPlayer.name },
            }).catch(() => {})
            await supabase.removeChannel(ch)
            res()
          }
        })
      })
      // Optimistically mark as submitted (result comes via pub state)
      setMyGuessResult('wrong') // will be corrected when pub updates
    }
    setGuessInput('')
  }

  // ── Host: listen for guess actions ────────────────────────────────────────
  useEffect(() => {
    if (!isHost) return
    const ch = supabase.channel(`beh-${roomCode}-draw-actions`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'draw_action' }, ({ payload }: any) => {
      if (payload.type === 'guess' && pub) {
        const guesser = players.find(p => p.id === payload.playerId)
        if (guesser) handleGuess(payload.guess, guesser)
      }
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, roomCode, pub, myWord])

  // ── Update guesser result when pub state updates ──────────────────────────
  useEffect(() => {
    if (!pub) return
    const myGuess = pub.guesses.find(g => g.playerId === myPlayer.id)
    if (myGuess) setMyGuessResult(myGuess.correct ? 'correct' : 'wrong')
  }, [pub, myPlayer.id])

  if (!pub) return (
    <div className="h-full flex flex-col items-center justify-center gap-4" dir="rtl">
      <div className="text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>🎨</div>
      <p className="font-black text-white text-xl">در حال آماده‌سازی...</p>
    </div>
  )

  // ── DRAWER VIEW ───────────────────────────────────────────────────────────
  if (amIDrawer && pub.phase === 'drawing') return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header: word visible to drawer only */}
      <div className="flex-shrink-0 px-3 pt-2 pb-2 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex flex-col min-w-0">
          <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>موضوع: {myCategory}</p>
          <div className="px-2 py-1 rounded-lg" style={{ background: 'rgba(249,115,22,0.2)', border: '1.5px solid #f97316' }}>
            <span className="font-black text-white text-sm">{myWord}</span>
          </div>
        </div>
        <p className="text-xs font-bold text-center" style={{ color: '#9a9b9e' }}>دور {pub.roundNum + 1}</p>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{ background: timeLeft > 20 ? '#22c55e' : timeLeft > 10 ? '#ffd60a' : '#CC2229', color: '#fff' }}>
          {timeLeft}
        </div>
      </div>

      {/* Canvas (interactive for drawer) */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        <canvas ref={drawerCanvasRef} width={800} height={600} className="w-full h-full"
          style={{ touchAction: 'none', cursor: 'crosshair' }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      </div>

      {/* Guess status sidebar */}
      <div className="flex-shrink-0 px-3 py-1.5 flex gap-2 overflow-x-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {pub.guesses.length === 0
          ? <p className="text-xs" style={{ color: '#6D6E71' }}>منتظر حدس بازیکنان...</p>
          : pub.guesses.map((g, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-lg font-bold flex-shrink-0"
              style={{ background: g.correct ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: g.correct ? '#22c55e' : '#9a9b9e' }}>
              {g.correct ? '✅' : '❌'} {g.name}
            </span>
          ))
        }
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-1.5 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {COLORS.map(c => <button key={c} onClick={() => setColor(c)} className="btn-game w-6 h-6 rounded-full flex-shrink-0"
          style={{ background: c, border: `2px solid ${color === c ? '#fff' : 'transparent'}`, transform: color === c ? 'scale(1.2)' : 'scale(1)' }} />)}
        <select value={brushSize} onChange={e => setBrushSize(+e.target.value)} className="px-1.5 py-1 rounded-lg text-xs font-bold text-white"
          style={{ background: 'rgba(30,30,34,0.9)', border: '1px solid rgba(255,255,255,0.15)', outline: 'none' }}>
          {[2, 4, 8, 16].map(s => <option key={s} value={s}>{s}px</option>)}
        </select>
        <button onClick={clearDrawing} className="btn-game px-2 py-1 rounded-lg text-xs font-bold text-white" style={{ background: 'rgba(255,255,255,0.07)' }}>پاک</button>
      </div>
    </div>
  )

  // ── ROUND END VIEW ────────────────────────────────────────────────────────
  if (pub.phase === 'round_end') {
    const isLastRound = pub.roundNum + 1 >= players.length
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <div className="text-5xl">{pub.correctGuesserId ? '🎉' : '⏰'}</div>
        <h2 className="font-black text-white text-2xl text-center">
          {pub.correctGuesserId ? `${pub.correctGuesserName} درست حدس زد!` : 'زمان تمام شد!'}
        </h2>
        {amIDrawer && myWord && (
          <div className="px-6 py-3 rounded-2xl text-center"
            style={{ background: 'rgba(255,214,10,0.1)', border: '1.5px solid rgba(255,214,10,0.4)' }}>
            <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>کلمه بود:</p>
            <p className="font-black text-2xl text-white">{myWord}</p>
          </div>
        )}
        {!amIDrawer && pub.correctGuesserName && (
          <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>کلمه پس از پایان Round برای همه نمایش داده خواهد شد</p>
        )}
        <div className="w-full max-w-xs flex flex-col gap-1.5">
          {players.map(p => (
            <div key={p.id} className="flex items-center justify-between px-4 py-2 rounded-xl" style={{ background: 'rgba(30,30,34,0.8)' }}>
              <span className="font-bold text-white text-sm">{p.name}</span>
              <span className="font-black text-sm" style={{ color: '#f97316' }}>{pub.scores[p.id] || 0}</span>
            </div>
          ))}
        </div>
        {isHost && (
          <button onClick={() => isLastRound ? broadcastPub({ ...pub, phase: 'game_end' }) : startRound(pub.drawerIdx + 1, pub.scores)}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            {isLastRound ? 'پایان بازی' : 'دور بعدی →'}
          </button>
        )}
        {!isHost && <p className="text-xs" style={{ color: '#9a9b9e' }}>میزبان دور بعد را شروع می‌کند...</p>}
      </div>
    )
  }

  // ── GAME END ──────────────────────────────────────────────────────────────
  if (pub.phase === 'game_end') {
    const sorted = [...players].sort((a, b) => (pub.scores[b.id] || 0) - (pub.scores[a.id] || 0))
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <div className="text-6xl">🎨</div>
        <h2 className="font-black text-white text-2xl">نتیجه نهایی</h2>
        <div className="w-full max-w-xs flex flex-col gap-2">
          {sorted.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl" style={{ background: i === 0 ? 'rgba(249,115,22,0.15)' : 'rgba(30,30,34,0.8)', border: `1.5px solid ${i === 0 ? '#f9731655' : 'rgba(255,255,255,0.06)'}` }}>
              <span className="font-black text-xl">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
              <span className="font-bold text-white flex-1">{p.name}</span>
              <span className="font-black" style={{ color: '#f97316' }}>{pub.scores[p.id] || 0} امتیاز</span>
            </div>
          ))}
        </div>
        <button onClick={onExit} className="btn-game px-8 py-4 rounded-2xl font-black text-white" style={{ background: 'rgba(255,255,255,0.1)' }}>خروج</button>
      </div>
    )
  }

  // ── GUESSER VIEW (drawing phase) ──────────────────────────────────────────
  // Word is NOT in this state — only category + letterCount
  const alreadyGuessed = pub.guesses.some(g => g.playerId === myPlayer.id)
  const blanks = '_ '.repeat(pub.letterCount).trim()

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header: category + letter count visible; word NEVER here */}
      <div className="flex-shrink-0 px-3 pt-2 pb-2 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex flex-col min-w-0">
          <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>موضوع: {pub.category}</p>
          <p className="text-xs font-mono tracking-widest" style={{ color: '#ffd60a' }}>{blanks}</p>
          <p className="text-xs" style={{ color: '#6D6E71' }}>{pub.letterCount} حرف</p>
        </div>
        <div className="text-center">
          <p className="text-xs" style={{ color: '#9a9b9e' }}>طراح: {pub.drawerName}</p>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>دور {pub.roundNum + 1}</p>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{ background: timeLeft > 20 ? '#22c55e' : timeLeft > 10 ? '#ffd60a' : '#CC2229', color: '#fff' }}>
          {timeLeft}
        </div>
      </div>

      {/* Live drawing — read-only viewer canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        <canvas ref={viewerCanvasRef} width={800} height={600} className="w-full h-full"
          style={{ touchAction: 'none', cursor: 'default', pointerEvents: 'none' }} />
        {pub.drawerId === myPlayer.id && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-black text-white text-lg" style={{ textShadow: '0 2px 8px #000' }}>شما طراح هستید</p>
          </div>
        )}
      </div>

      {/* Guess input */}
      <div className="flex-shrink-0 px-3 py-3 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Guess results so far */}
        {pub.guesses.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {pub.guesses.map((g, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg font-bold"
                style={{ background: g.correct ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: g.correct ? '#22c55e' : '#9a9b9e' }}>
                {g.correct ? '✅' : '❌'} {g.name}
              </span>
            ))}
          </div>
        )}

        {alreadyGuessed ? (
          <div className="text-center py-2">
            {myGuessResult === 'correct'
              ? <p className="font-black text-lg" style={{ color: '#22c55e' }}>✅ درست حدس زدید!</p>
              : <p className="text-sm" style={{ color: '#9a9b9e' }}>حدس شما ثبت شد — منتظر بمانید</p>}
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={guessInput} onChange={e => setGuessInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitGuess()}
              placeholder="حدس خود را وارد کنید..."
              className="flex-1 px-4 py-3 rounded-xl font-bold text-white"
              style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.15)', outline: 'none' }} />
            <button disabled={!guessInput.trim()} onClick={submitGuess}
              className="btn-game px-4 py-3 rounded-xl font-black text-white flex-shrink-0"
              style={{ background: guessInput.trim() ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.07)' }}>
              حدس!
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT — routes to local or online
// ─────────────────────────────────────────────────────────────────────────────
export default function AnonymousDrawerGame({ players, myPlayer, isHost, isOnline, roomCode, onExit }: Props) {
  if (isOnline && myPlayer && roomCode) {
    return (
      <OnlineDrawerGame
        players={players}
        myPlayer={myPlayer}
        isHost={isHost ?? false}
        roomCode={roomCode}
        onExit={onExit}
      />
    )
  }
  return <LocalDrawerGame players={players} onExit={onExit} />
}
