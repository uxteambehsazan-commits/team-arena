import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'
import { supabase } from '../../lib/supabase'
import { usePrivateChannel } from '../../lib/multiplayer/usePrivateChannel'

// ─── WORD DATA ────────────────────────────────────────────────────────────────

interface WordEntry { word: string; difficulty: 'easy' | 'medium' | 'hard'; points: number }
interface Category { id: string; name: string; emoji: string; words: WordEntry[] }

const CATEGORIES: Category[] = [
  { id: 'animals', name: 'حیوانات', emoji: '🐾', words: [
    { word: 'سگ', difficulty: 'easy', points: 50 },
    { word: 'گربه', difficulty: 'easy', points: 50 },
    { word: 'اسب', difficulty: 'medium', points: 100 },
    { word: 'فیل', difficulty: 'medium', points: 100 },
    { word: 'عقاب', difficulty: 'hard', points: 150 },
    { word: 'کانگورو', difficulty: 'hard', points: 150 },
  ]},
  { id: 'food', name: 'غذاها', emoji: '🍕', words: [
    { word: 'پیتزا', difficulty: 'easy', points: 50 },
    { word: 'کباب', difficulty: 'easy', points: 50 },
    { word: 'سوشی', difficulty: 'medium', points: 100 },
    { word: 'رامن', difficulty: 'medium', points: 100 },
    { word: 'تیرامیسو', difficulty: 'hard', points: 150 },
    { word: 'لازانیا', difficulty: 'hard', points: 150 },
  ]},
  { id: 'sports', name: 'ورزش‌ها', emoji: '⚽', words: [
    { word: 'فوتبال', difficulty: 'easy', points: 50 },
    { word: 'شنا', difficulty: 'easy', points: 50 },
    { word: 'والیبال', difficulty: 'medium', points: 100 },
    { word: 'تنیس', difficulty: 'medium', points: 100 },
    { word: 'ژیمناستیک', difficulty: 'hard', points: 150 },
    { word: 'کشتی آزاد', difficulty: 'hard', points: 150 },
  ]},
  { id: 'vehicles', name: 'وسایل نقلیه', emoji: '🚗', words: [
    { word: 'ماشین', difficulty: 'easy', points: 50 },
    { word: 'قطار', difficulty: 'easy', points: 50 },
    { word: 'هواپیما', difficulty: 'medium', points: 100 },
    { word: 'زیردریایی', difficulty: 'medium', points: 100 },
    { word: 'کشتی بادبانی', difficulty: 'hard', points: 150 },
    { word: 'هلیکوپتر', difficulty: 'hard', points: 150 },
  ]},
  { id: 'professions', name: 'مشاغل', emoji: '👨‍💼', words: [
    { word: 'دکتر', difficulty: 'easy', points: 50 },
    { word: 'معلم', difficulty: 'easy', points: 50 },
    { word: 'آتشنشان', difficulty: 'medium', points: 100 },
    { word: 'خلبان', difficulty: 'medium', points: 100 },
    { word: 'جراح مغز', difficulty: 'hard', points: 150 },
    { word: 'باستان‌شناس', difficulty: 'hard', points: 150 },
  ]},
  { id: 'tech', name: 'فناوری', emoji: '💻', words: [
    { word: 'موبایل', difficulty: 'easy', points: 50 },
    { word: 'لپ‌تاپ', difficulty: 'easy', points: 50 },
    { word: 'پرینتر', difficulty: 'medium', points: 100 },
    { word: 'روتر', difficulty: 'medium', points: 100 },
    { word: 'پردازنده', difficulty: 'hard', points: 150 },
    { word: 'هدست واقعیت مجازی', difficulty: 'hard', points: 150 },
  ]},
  { id: 'emotions', name: 'احساسات', emoji: '😊', words: [
    { word: 'خوشحال', difficulty: 'easy', points: 50 },
    { word: 'غمگین', difficulty: 'easy', points: 50 },
    { word: 'ترسیده', difficulty: 'medium', points: 100 },
    { word: 'حسادت', difficulty: 'medium', points: 100 },
    { word: 'نوستالژی', difficulty: 'hard', points: 150 },
    { word: 'سرگشتگی', difficulty: 'hard', points: 150 },
  ]},
  { id: 'nature', name: 'طبیعت', emoji: '🌿', words: [
    { word: 'کوه', difficulty: 'easy', points: 50 },
    { word: 'دریا', difficulty: 'easy', points: 50 },
    { word: 'آبشار', difficulty: 'medium', points: 100 },
    { word: 'بیابان', difficulty: 'medium', points: 100 },
    { word: 'یخچال طبیعی', difficulty: 'hard', points: 150 },
    { word: 'آتشفشان', difficulty: 'hard', points: 150 },
  ]},
  { id: 'office', name: 'محیط کار', emoji: '🏢', words: [
    { word: 'میز', difficulty: 'easy', points: 50 },
    { word: 'صندلی', difficulty: 'easy', points: 50 },
    { word: 'جلسه', difficulty: 'medium', points: 100 },
    { word: 'پروژه', difficulty: 'medium', points: 100 },
    { word: 'مصاحبه شغلی', difficulty: 'hard', points: 150 },
    { word: 'ارزیابی عملکرد', difficulty: 'hard', points: 150 },
  ]},
  { id: 'behsazan', name: 'بهسازانی', emoji: '👑', words: [
    { word: 'نرم‌افزار', difficulty: 'easy', points: 50 },
    { word: 'بانک', difficulty: 'easy', points: 50 },
    { word: 'برنامه‌نویس', difficulty: 'medium', points: 100 },
    { word: 'سیستم', difficulty: 'medium', points: 100 },
    { word: 'تحول دیجیتال', difficulty: 'hard', points: 150 },
    { word: 'معماری سازمانی', difficulty: 'hard', points: 150 },
  ]},
]

const DIFF_LABEL = { easy: 'آسان', medium: 'متوسط', hard: 'سخت' }
const DIFF_COLOR = { easy: '#22c55e', medium: '#ffd60a', hard: '#CC2229' }
const DIFF_STARS = { easy: '★☆☆', medium: '★★☆', hard: '★★★' }
const DRAW_COLORS = ['#000000', '#CC2229', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ffd60a', '#ffffff']
const DRAW_TOTAL_SECONDS = 90
const CANDIDATES_REVEAL_AT = 55  // seconds remaining when candidates show
const PUZZLE_PANELS = 6          // 2×3 fog grid

// ─── TYPES ───────────────────────────────────────────────────────────────────

type RoundPhase = 'lobby' | 'word_choice' | 'drawing' | 'guessing' | 'round_result' | 'game_over'

// Compact stroke event for efficient broadcast
type StrokeEv =
  | { t: 'ss'; x: number; y: number; c: string; w: number }
  | { t: 'sm'; x: number; y: number }
  | { t: 'se' }
  | { t: 'cl' }
  | { t: 'er'; x: number; y: number; r: number }

interface NaghPublicState {
  phase: RoundPhase
  round: number         // 1-indexed
  totalRounds: number
  painterIdx: number    // index into players array (host-tracked rotation)
  painterId: string
  painterName: string
  categoryId: string
  categoryName: string
  letterCount: number
  wordDifficulty: 'easy' | 'medium' | 'hard'
  basePoints: number
  drawingDeadline: number  // epoch ms
  candidatesRevealedAt: number  // epoch ms (0 = not yet)
  candidates: string[]
  guesses: Record<string, string>  // only in round_result
  roundScores: Record<string, number>
  totalScores: Record<string, number>
  correctWord: string   // only in round_result
  seq: number
}

interface Props {
  players?: BehsazaniPlayer[]
  myPlayer?: BehsazaniPlayer
  isHost?: boolean
  isOnline?: boolean
  roomCode?: string
  onExit: () => void
}

const DEFAULT_PLAYER: BehsazaniPlayer = { id: 'solo', name: 'بازیکن', avatar: '1', colorIndex: 0 }
const EMPTY_PUB: NaghPublicState = {
  phase: 'lobby', round: 0, totalRounds: 0, painterIdx: 0,
  painterId: '', painterName: '', categoryId: '', categoryName: '',
  letterCount: 0, wordDifficulty: 'easy', basePoints: 50,
  drawingDeadline: 0, candidatesRevealedAt: 0, candidates: [],
  guesses: {}, roundScores: {}, totalScores: {}, correctWord: '', seq: 0,
}

// ─── CANVAS HELPERS ──────────────────────────────────────────────────────────

function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
  const r = canvas.getBoundingClientRect()
  const sx = canvas.width / r.width, sy = canvas.height / r.height
  if ('touches' in e) {
    const t = e.touches[0]
    return { x: Math.round((t.clientX - r.left) * sx), y: Math.round((t.clientY - r.top) * sy) }
  }
  const m = e as React.MouseEvent
  return { x: Math.round((m.clientX - r.left) * sx), y: Math.round((m.clientY - r.top) * sy) }
}

function applyStroke(ctx: CanvasRenderingContext2D, ev: StrokeEv, pathOpen: React.MutableRefObject<boolean>) {
  if (ev.t === 'ss') {
    ctx.beginPath(); ctx.strokeStyle = ev.c; ctx.lineWidth = ev.w
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.moveTo(ev.x, ev.y); pathOpen.current = true
  } else if (ev.t === 'sm' && pathOpen.current) {
    ctx.lineTo(ev.x, ev.y); ctx.stroke()
  } else if (ev.t === 'se') {
    pathOpen.current = false
  } else if (ev.t === 'cl') {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    pathOpen.current = false
  } else if (ev.t === 'er') {
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath(); ctx.arc(ev.x, ev.y, ev.r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fill(); ctx.restore()
    pathOpen.current = false
  }
}

function generateCandidates(categoryId: string, correctWord: string): string[] {
  const cat = CATEGORIES.find(c => c.id === categoryId)
  if (!cat) return [correctWord]
  const catWords = cat.words.map(w => w.word).filter(w => w !== correctWord)
  const otherWords: string[] = []
  CATEGORIES.filter(c => c.id !== categoryId).forEach(c => {
    c.words.forEach(w => otherWords.push(w.word))
  })
  const shuffledOthers = otherWords.sort(() => Math.random() - 0.5).slice(0, 12 - catWords.length - 1)
  return [correctWord, ...catWords, ...shuffledOthers].sort(() => Math.random() - 0.5).slice(0, 12)
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function NaghghashbashiGame({
  players: pp, myPlayer: mp, isHost = false, isOnline = false, roomCode: rcp, onExit,
}: Props) {
  const players = pp ?? [DEFAULT_PLAYER]
  const myPlayer = mp ?? DEFAULT_PLAYER
  const roomCode = rcp ?? 'LOCAL'

  const [pub, setPub] = useState<NaghPublicState>(EMPTY_PUB)
  const [myWord, setMyWord] = useState('')
  const [myChoices, setMyChoices] = useState<WordEntry[]>([])
  const [myGuess, setMyGuess] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(DRAW_TOTAL_SECONDS)
  const [drawColor, setDrawColor] = useState('#000000')
  const [lineW, setLineW] = useState(4)
  const [eraseMode, setEraseMode] = useState(false)

  const paintCanvasRef = useRef<HTMLCanvasElement>(null)
  const viewCanvasRef = useRef<HTMLCanvasElement>(null)
  const painting = useRef(false)
  const pathOpen = useRef(false)
  const viewPathOpen = useRef(false)
  const seqRef = useRef(0)
  const lastSeqRef = useRef(-1)
  const guessSubmitTime = useRef<Record<string, number>>({})
  const hostWordRef = useRef('')  // host only: the selected word

  // Stroke throttle
  const lastStrokeMs = useRef(0)
  const pendingMove = useRef<{ x: number; y: number } | null>(null)

  // ── Persistent channel refs ──────────────────────────────────────────────
  const strokeChRef = useRef<import('@supabase/supabase-js').RealtimeChannel | null>(null)
  const strokeReadyRef = useRef(false)
  const pubChRef = useRef<import('@supabase/supabase-js').RealtimeChannel | null>(null)
  const pubReadyRef = useRef(false)
  const cmdChRef = useRef<import('@supabase/supabase-js').RealtimeChannel | null>(null)
  const cmdReadyRef = useRef(false)

  const amIPainter = pub.painterId === myPlayer.id

  // ── Canvas init on phase change ──────────────────────────────────────────
  useEffect(() => {
    if (pub.phase !== 'drawing') return
    const canvasEl = amIPainter ? paintCanvasRef.current : viewCanvasRef.current
    if (!canvasEl) return
    const ctx = canvasEl.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)
    pathOpen.current = false
    viewPathOpen.current = false
  }, [pub.phase, amIPainter])

  // ── Reset per-round state ────────────────────────────────────────────────
  useEffect(() => {
    setMyGuess('')
    setSubmitted(false)
    setMyWord('')
    setMyChoices([])
    guessSubmitTime.current = {}
  }, [pub.round, pub.painterId])

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (pub.phase !== 'drawing' || !pub.drawingDeadline) return
    const tick = () => setTimeLeft(t => {
      const left = Math.max(0, Math.round((pub.drawingDeadline - Date.now()) / 1000))
      return left !== t ? left : t
    })
    tick()
    const id = setInterval(tick, 400)
    return () => clearInterval(id)
  }, [pub.phase, pub.drawingDeadline])

  // ── Host: auto-advance when timer expires ────────────────────────────────
  useEffect(() => {
    if (!isHost || pub.phase !== 'drawing' || !pub.drawingDeadline) return
    const remaining = pub.drawingDeadline - Date.now()
    if (remaining <= 0) return
    const id = setTimeout(() => {
      hostMoveToGuessing(pub)
    }, remaining + 500)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pub.phase, pub.drawingDeadline, isHost])

  // ── Host: reveal candidates mid-drawing ──────────────────────────────────
  useEffect(() => {
    if (!isHost || pub.phase !== 'drawing' || pub.candidatesRevealedAt !== 0) return
    const revealAt = pub.drawingDeadline - CANDIDATES_REVEAL_AT * 1000
    const delay = revealAt - Date.now()
    if (delay <= 0) {
      if (pub.candidatesRevealedAt === 0) {
        const candidates = generateCandidates(pub.categoryId, hostWordRef.current)
        broadcastPub({ ...pub, candidates, candidatesRevealedAt: Date.now() })
      }
      return
    }
    const id = setTimeout(async () => {
      const candidates = generateCandidates(pub.categoryId, hostWordRef.current)
      await broadcastPub({ ...pub, candidates, candidatesRevealedAt: Date.now() })
    }, delay)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pub.phase, pub.drawingDeadline, pub.candidatesRevealedAt, isHost])

  // ── Host: persistent pub channel ─────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !isHost) return
    const ch = supabase.channel(`beh-${roomCode}-nagh-pub`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.subscribe(s => { if (s === 'SUBSCRIBED') pubReadyRef.current = true })
    pubChRef.current = ch
    return () => { supabase.removeChannel(ch); pubReadyRef.current = false; pubChRef.current = null }
  }, [isOnline, isHost, roomCode])

  // ── Guests: listen to pub channel ────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || isHost) return
    const ch = supabase.channel(`beh-${roomCode}-nagh-pub`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'nagh_state' }, ({ payload }: any) => {
      if (!payload?.state) return
      const s = payload.state as NaghPublicState
      if (s.seq <= lastSeqRef.current) return
      lastSeqRef.current = s.seq
      setPub(s)
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [isOnline, isHost, roomCode])

  // ── Stroke channel: painter sends, all receive ────────────────────────────
  useEffect(() => {
    if (!isOnline || pub.phase !== 'drawing') return

    const ch = supabase.channel(`beh-${roomCode}-nagh-strokes-r${pub.round}`, {
      config: { broadcast: { self: false, ack: false } },
    })
    if (amIPainter) {
      ch.subscribe(s => { if (s === 'SUBSCRIBED') strokeReadyRef.current = true })
    } else {
      ch.on('broadcast', { event: 'stroke' }, ({ payload }: any) => {
        const ev = payload?.ev as StrokeEv
        if (!ev) return
        const ctx = viewCanvasRef.current?.getContext('2d')
        if (!ctx) return
        applyStroke(ctx, ev, viewPathOpen)
      }).subscribe()
    }
    strokeChRef.current = ch
    return () => { supabase.removeChannel(ch); strokeReadyRef.current = false; strokeChRef.current = null }
  }, [isOnline, pub.phase, pub.round, amIPainter, roomCode])

  // ── Host: command channel (receives painter word pick + guesser guesses) ──
  useEffect(() => {
    if (!isOnline || !isHost) return
    const ch = supabase.channel(`beh-${roomCode}-nagh-cmd`, {
      config: { broadcast: { self: false, ack: false } },
    })
    ch.on('broadcast', { event: 'word_pick' }, ({ payload }: any) => {
      const { word, difficulty, points, categoryId } = payload as { word: string; difficulty: string; points: number; categoryId: string }
      hostWordRef.current = word
      const candidates = generateCandidates(categoryId, word)
      const deadline = Date.now() + DRAW_TOTAL_SECONDS * 1000
      broadcastPub({
        ...pub,
        phase: 'drawing',
        wordDifficulty: difficulty as 'easy' | 'medium' | 'hard',
        basePoints: points,
        letterCount: word.length,
        drawingDeadline: deadline,
        candidatesRevealedAt: 0,
        candidates,
        guesses: {},
        roundScores: {},
        correctWord: '',
      })
    })
    ch.on('broadcast', { event: 'guess' }, ({ payload }: any) => {
      const { playerId, word, timestamp } = payload as { playerId: string; word: string; timestamp: number }
      if (guessSubmitTime.current[playerId]) return  // already guessed
      guessSubmitTime.current[playerId] = timestamp
      setPub(prev => {
        const newGuesses = { ...prev.guesses, [playerId]: word }
        // Check if all non-painters have guessed
        const guessers = players.filter(p => p.id !== prev.painterId)
        const allGuessed = guessers.every(p => newGuesses[p.id])
        if (allGuessed && isHost) {
          setTimeout(() => hostReveal(), 500)
        }
        return { ...prev, guesses: newGuesses }
      })
    })
    .subscribe(s => { if (s === 'SUBSCRIBED') cmdReadyRef.current = true })
    cmdChRef.current = ch
    return () => { supabase.removeChannel(ch); cmdReadyRef.current = false; cmdChRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, isHost, roomCode, pub.round])

  // ── Private channel: receive word choices ────────────────────────────────
  const { sendPrivate } = usePrivateChannel(
    roomCode, myPlayer.id,
    useCallback((msg) => {
      if (msg.type === 'nagh_choices') {
        setMyChoices((msg.data as { choices: WordEntry[] }).choices)
      }
    }, [])
  )

  // ── Broadcast pub (host) ─────────────────────────────────────────────────
  const broadcastPub = useCallback(async (state: NaghPublicState) => {
    seqRef.current += 1
    const s = { ...state, seq: seqRef.current }
    setPub(s)
    if (!isOnline) return
    const ch = pubChRef.current
    if (!ch || !pubReadyRef.current) return
    await ch.send({ type: 'broadcast', event: 'nagh_state', payload: { state: s } }).catch(() => {})
  }, [isOnline])

  // ── Send stroke (painter) ────────────────────────────────────────────────
  const sendStroke = useCallback((ev: StrokeEv) => {
    if (!isOnline) return
    const ch = strokeChRef.current
    if (!ch || !strokeReadyRef.current) return
    ch.send({ type: 'broadcast', event: 'stroke', payload: { ev } }).catch(() => {})
  }, [isOnline])

  // ── Send command (non-host clients) ─────────────────────────────────────
  const sendCmd = useCallback(async (event: string, payload: unknown) => {
    if (!isOnline) return
    const ch = supabase.channel(`beh-${roomCode}-nagh-cmd`, {
      config: { broadcast: { self: false, ack: false } },
    })
    await new Promise<void>(res => {
      ch.subscribe(async s => {
        if (s === 'SUBSCRIBED') {
          await ch.send({ type: 'broadcast', event, payload }).catch(() => {})
          await supabase.removeChannel(ch); res()
        }
      })
    })
  }, [isOnline, roomCode])

  // ── Host: start game ─────────────────────────────────────────────────────
  const hostStartGame = useCallback(async () => {
    const painterIdx = 0
    const painter = players[painterIdx]
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    // Send painter their choices (2 per difficulty)
    const choices = ['easy', 'medium', 'hard'].flatMap(d =>
      cat.words.filter(w => w.difficulty === d).slice(0, 2)
    )
    await sendPrivate(painter.id, { type: 'nagh_choices', data: { choices, categoryId: cat.id, categoryName: cat.name } })
    if (painter.id === myPlayer.id) {
      setMyChoices(choices)
    }
    await broadcastPub({
      ...EMPTY_PUB,
      phase: 'word_choice',
      round: 1,
      totalRounds: players.length,
      painterIdx,
      painterId: painter.id,
      painterName: painter.name,
      categoryId: cat.id,
      categoryName: cat.name,
    })
  }, [players, myPlayer.id, sendPrivate, broadcastPub])

  // ── Host: start next round ────────────────────────────────────────────────
  const hostNextRound = useCallback(async (currentPub: NaghPublicState) => {
    const nextIdx = currentPub.painterIdx + 1
    if (nextIdx >= players.length) {
      await broadcastPub({ ...currentPub, phase: 'game_over' })
      return
    }
    const painter = players[nextIdx]
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    const choices = ['easy', 'medium', 'hard'].flatMap(d =>
      cat.words.filter(w => w.difficulty === d).slice(0, 2)
    )
    await sendPrivate(painter.id, { type: 'nagh_choices', data: { choices, categoryId: cat.id, categoryName: cat.name } })
    if (painter.id === myPlayer.id) setMyChoices(choices)
    await broadcastPub({
      ...currentPub,
      phase: 'word_choice',
      round: currentPub.round + 1,
      painterIdx: nextIdx,
      painterId: painter.id,
      painterName: painter.name,
      categoryId: cat.id,
      categoryName: cat.name,
      drawingDeadline: 0,
      candidatesRevealedAt: 0,
      candidates: [],
      guesses: {},
      roundScores: {},
      correctWord: '',
    })
  }, [players, myPlayer.id, sendPrivate, broadcastPub])

  // ── Host: move to guessing phase ──────────────────────────────────────────
  const hostMoveToGuessing = useCallback(async (currentPub: NaghPublicState) => {
    const candidates = currentPub.candidates.length > 0
      ? currentPub.candidates
      : generateCandidates(currentPub.categoryId, hostWordRef.current)
    await broadcastPub({ ...currentPub, phase: 'guessing', candidates })
  }, [broadcastPub])

  // ── Host: reveal result ───────────────────────────────────────────────────
  const hostReveal = useCallback(() => {
    setPub(current => {
      const correctWord = hostWordRef.current
      const deadline = current.drawingDeadline
      const roundScores: Record<string, number> = {}
      const guessers = players.filter(p => p.id !== current.painterId)
      let correctCount = 0
      let painterBonus = 0

      guessers.forEach((p, rank) => {
        const guess = current.guesses[p.id] ?? ''
        if (guess === correctWord) {
          correctCount++
          const speedBonus = Math.max(0, Math.round(50 * (1 - (guessSubmitTime.current[p.id] ?? deadline) / deadline)))
          roundScores[p.id] = current.basePoints + speedBonus
          painterBonus += Math.round(roundScores[p.id] / 2)
        } else {
          roundScores[p.id] = 0
        }
      })
      roundScores[current.painterId] = painterBonus

      const totalScores = { ...current.totalScores }
      Object.entries(roundScores).forEach(([pid, pts]) => {
        totalScores[pid] = (totalScores[pid] ?? 0) + pts
      })

      const newState: NaghPublicState = {
        ...current,
        phase: 'round_result',
        guesses: current.guesses,
        roundScores,
        totalScores,
        correctWord,
      }
      // Async broadcast
      ;(async () => {
        seqRef.current += 1
        const s = { ...newState, seq: seqRef.current }
        if (isOnline && pubChRef.current && pubReadyRef.current) {
          await pubChRef.current.send({ type: 'broadcast', event: 'nagh_state', payload: { state: s } }).catch(() => {})
        }
      })()
      return newState
    })
  }, [players, isOnline])

  // ── Canvas: painter draw ──────────────────────────────────────────────────
  const onPainterDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const c = paintCanvasRef.current; if (!c) return
    painting.current = true
    const p = getPos(e, c)
    if (eraseMode) {
      const ctx = c.getContext('2d')!
      applyStroke(ctx, { t: 'er', x: p.x, y: p.y, r: lineW * 3 }, pathOpen)
      sendStroke({ t: 'er', x: p.x, y: p.y, r: lineW * 3 })
      return
    }
    const ev: StrokeEv = { t: 'ss', x: p.x, y: p.y, c: drawColor, w: lineW }
    const ctx = c.getContext('2d')!
    applyStroke(ctx, ev, pathOpen)
    sendStroke(ev)
  }, [eraseMode, drawColor, lineW, sendStroke])

  const onPainterMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!painting.current) return
    const c = paintCanvasRef.current; if (!c) return
    const p = getPos(e, c)
    if (eraseMode) {
      const ctx = c.getContext('2d')!
      applyStroke(ctx, { t: 'er', x: p.x, y: p.y, r: lineW * 3 }, pathOpen)
      const now = Date.now()
      if (now - lastStrokeMs.current >= 50) {
        lastStrokeMs.current = now
        sendStroke({ t: 'er', x: p.x, y: p.y, r: lineW * 3 })
      }
      return
    }
    const ctx = c.getContext('2d')!
    const ev: StrokeEv = { t: 'sm', x: p.x, y: p.y }
    applyStroke(ctx, ev, pathOpen)
    pendingMove.current = p
    const now = Date.now()
    if (now - lastStrokeMs.current >= 40) {
      lastStrokeMs.current = now
      sendStroke(ev)
      pendingMove.current = null
    }
  }, [eraseMode, lineW, sendStroke])

  const onPainterUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!painting.current) return
    painting.current = false
    if (pendingMove.current) {
      const ev: StrokeEv = { t: 'sm', ...pendingMove.current }
      sendStroke(ev)
      pendingMove.current = null
    }
    const ev: StrokeEv = { t: 'se' }
    const ctx = paintCanvasRef.current?.getContext('2d')
    if (ctx) applyStroke(ctx, ev, pathOpen)
    sendStroke(ev)
  }, [sendStroke])

  const clearCanvas = useCallback(() => {
    const c = paintCanvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    applyStroke(ctx, { t: 'cl' }, pathOpen)
    sendStroke({ t: 'cl' })
  }, [sendStroke])

  // ── Painter: pick word ────────────────────────────────────────────────────
  const painterPickWord = useCallback(async (w: WordEntry) => {
    setMyWord(w.word)
    if (isHost) {
      // Host is painter: directly handle word pick
      hostWordRef.current = w.word
      const deadline = Date.now() + DRAW_TOTAL_SECONDS * 1000
      const candidates = generateCandidates(pub.categoryId, w.word)
      await broadcastPub({
        ...pub,
        phase: 'drawing',
        wordDifficulty: w.difficulty,
        basePoints: w.points,
        letterCount: w.word.length,
        drawingDeadline: deadline,
        candidatesRevealedAt: 0,
        candidates,
        guesses: {},
        roundScores: {},
        correctWord: '',
      })
    } else {
      // Non-host painter sends pick to host
      await sendCmd('word_pick', {
        word: w.word, difficulty: w.difficulty, points: w.points, categoryId: pub.categoryId,
      })
    }
  }, [isHost, pub, broadcastPub, sendCmd])

  // ── Guesser: submit guess ─────────────────────────────────────────────────
  const submitGuess = useCallback(async (word: string) => {
    if (myGuess || amIPainter) return
    setMyGuess(word)
    guessSubmitTime.current[myPlayer.id] = Date.now()
    if (isHost) {
      setPub(prev => {
        const newGuesses = { ...prev.guesses, [myPlayer.id]: word }
        const guessers = players.filter(p => p.id !== prev.painterId)
        const allGuessed = guessers.every(p => newGuesses[p.id])
        if (allGuessed) setTimeout(() => hostReveal(), 500)
        return { ...prev, guesses: newGuesses }
      })
    } else {
      await sendCmd('guess', { playerId: myPlayer.id, word, timestamp: Date.now() })
    }
  }, [myGuess, amIPainter, myPlayer.id, isHost, players, hostReveal, sendCmd])

  // ─── Puzzle fog panels ─────────────────────────────────────────────────────
  const piecesRevealed = useMemo(() => {
    if (pub.phase !== 'drawing') return PUZZLE_PANELS
    const elapsed = Math.max(0, DRAW_TOTAL_SECONDS - timeLeft)
    return Math.min(PUZZLE_PANELS, Math.floor(elapsed / (DRAW_TOTAL_SECONDS / PUZZLE_PANELS)))
  }, [pub.phase, timeLeft])

  // Fixed panel reveal order (seeded by round for consistency)
  const revealOrder = useMemo(() => {
    const arr = [0, 1, 2, 3, 4, 5]
    // deterministic shuffle by round seed
    for (let i = 5; i > 0; i--) {
      const j = (pub.round * 7 + i * 3) % (i + 1)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [pub.round])

  const candidatesVisible = pub.candidatesRevealedAt > 0 && Date.now() >= pub.candidatesRevealedAt

  // ─── RENDERS ─────────────────────────────────────────────────────────────

  if (!isOnline) return (
    <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
      <div className="text-6xl">🖌️</div>
      <h2 className="font-black text-white text-2xl text-center">نقاش‌باشی</h2>
      <div className="px-5 py-4 rounded-2xl text-center max-w-xs"
        style={{ background: 'rgba(124,58,237,0.12)', border: '1.5px solid rgba(124,58,237,0.3)' }}>
        <p className="text-sm font-bold" style={{ color: '#c084fc' }}>این بازی فقط آنلاین است.</p>
        <p className="text-xs mt-2" style={{ color: '#9a9b9e' }}>
          از لابی آنلاین وارد شوید تا همه بازیکنان روی دستگاه جداگانه بازی کنند.
        </p>
      </div>
      <button onClick={onExit} className="btn-game px-6 py-3 rounded-2xl font-black text-white"
        style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}>بازگشت</button>
    </div>
  )

  // ── Lobby ─────────────────────────────────────────────────────────────────
  if (pub.phase === 'lobby') {
    return (
      <div className="h-full flex flex-col" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-5 pb-3 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-3xl">🖌️</p>
          <h1 className="font-black text-white text-xl mt-1">نقاش‌باشی</h1>
          <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>{players.length} بازیکن — {players.length} دور</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="px-5 py-4 rounded-2xl text-center w-full max-w-xs"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <p className="text-sm font-bold text-white mb-3">چطور بازی می‌کنیم؟</p>
            <div className="flex flex-col gap-2 text-xs text-right" style={{ color: '#9a9b9e' }}>
              <p>🖊️ هر بازیکن یک بار نقاش می‌شود</p>
              <p>🎨 نقاش یک کلمه سری انتخاب می‌کند</p>
              <p>👀 بقیه نقاشی را زنده می‌بینند</p>
              <p>🎯 ۱۲ گزینه برای حدس — سریع‌تر = بیشتر امتیاز</p>
            </div>
          </div>
          {isHost ? (
            <button onClick={hostStartGame}
              className="btn-game w-full max-w-xs py-4 rounded-2xl font-black text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
              🚀 شروع بازی
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full"
                    style={{ background: '#7c3aed', animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite` }} />
                ))}
              </div>
              <p className="text-sm" style={{ color: '#9a9b9e' }}>منتظر میزبان...</p>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 px-4 pb-4">
          <button onClick={onExit} className="btn-game w-full py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>بازگشت</button>
        </div>
      </div>
    )
  }

  // ── Word Choice ───────────────────────────────────────────────────────────
  if (pub.phase === 'word_choice') {
    if (!amIPainter) return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <div className="text-5xl" style={{ animation: 'pulse 2s ease-in-out infinite' }}>🎨</div>
        <h2 className="font-black text-white text-xl text-center">
          {pub.painterName} دارد کلمه انتخاب می‌کند...
        </h2>
        <div className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#c084fc' }}>
          دور {pub.round} از {pub.totalRounds}
        </div>
        <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>
          دسته‌بندی: {pub.categoryName}
        </p>
      </div>
    )

    return (
      <div className="h-full flex flex-col" dir="rtl">
        <div className="flex-shrink-0 px-4 pt-4 pb-3 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold" style={{ color: '#c084fc' }}>دور {pub.round} — شما نقاش هستید!</p>
          <h2 className="font-black text-white text-lg mt-0.5">یک کلمه انتخاب کنید</h2>
          <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>دسته‌بندی: {pub.categoryName}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {(['easy', 'medium', 'hard'] as const).map(diff => {
            const diffWords = myChoices.filter(w => w.difficulty === diff)
            if (!diffWords.length) return null
            return (
              <div key={diff}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black" style={{ color: DIFF_COLOR[diff] }}>
                    {DIFF_STARS[diff]} {DIFF_LABEL[diff]}
                  </span>
                  <span className="text-xs" style={{ color: '#6D6E71' }}>({diff === 'easy' ? 50 : diff === 'medium' ? 100 : 150} امتیاز)</span>
                </div>
                <div className="flex flex-col gap-2">
                  {diffWords.map(w => (
                    <button key={w.word} onClick={() => painterPickWord(w)}
                      className="btn-game w-full py-4 rounded-2xl font-black text-white text-lg text-right px-5"
                      style={{
                        background: `${DIFF_COLOR[diff]}18`,
                        border: `1.5px solid ${DIFF_COLOR[diff]}55`,
                        boxShadow: `0 4px 16px ${DIFF_COLOR[diff]}22`,
                      }}>
                      {w.word}
                      <span className="text-xs font-bold mr-2" style={{ color: DIFF_COLOR[diff] }}>
                        {w.word.length} حرف
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Drawing ───────────────────────────────────────────────────────────────
  if (pub.phase === 'drawing' || pub.phase === 'guessing') {
    const isDrawingPhase = pub.phase === 'drawing'
    const showCandidates = candidatesVisible || pub.phase === 'guessing'

    if (amIPainter) return (
      <div className="h-full flex flex-col" dir="rtl" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
        {/* Header */}
        <div className="flex-shrink-0 px-3 pt-3 pb-2 flex items-center justify-between gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>کلمه شما:</p>
            <p className="font-black text-white text-2xl">{myWord || '...'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center px-3 py-1.5 rounded-xl"
              style={{ background: timeLeft <= 15 ? 'rgba(204,34,41,0.15)' : 'rgba(255,214,10,0.1)' }}>
              <div className="font-black text-2xl" style={{ color: timeLeft <= 15 ? '#CC2229' : '#ffd60a', fontFamily: 'monospace' }}>
                {timeLeft}
              </div>
            </div>
            {pub.phase === 'guessing' && (
              <div className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                رأی‌گیری...
              </div>
            )}
          </div>
        </div>

        {!submitted ? (
          <>
            <div className="flex-1 relative overflow-hidden m-2 rounded-2xl"
              style={{ background: '#f9f9f9', border: '1.5px solid rgba(255,255,255,0.1)', touchAction: 'none' }}>
              <canvas ref={paintCanvasRef} width={560} height={380}
                className="w-full h-full" style={{ touchAction: 'none', display: 'block', cursor: eraseMode ? 'cell' : 'crosshair' }}
                onMouseDown={onPainterDown} onMouseMove={onPainterMove} onMouseUp={onPainterUp} onMouseLeave={onPainterUp}
                onTouchStart={onPainterDown} onTouchMove={onPainterMove} onTouchEnd={onPainterUp} />
            </div>

            {/* Toolbar */}
            <div className="flex-shrink-0 px-3 py-2 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {DRAW_COLORS.map(c => (
                  <button key={c} onClick={() => { setDrawColor(c); setEraseMode(false) }}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      background: c, borderColor: (!eraseMode && drawColor === c) ? '#c084fc' : 'rgba(255,255,255,0.15)',
                      transform: (!eraseMode && drawColor === c) ? 'scale(1.3)' : 'scale(1)',
                    }} />
                ))}
                <button onClick={() => setEraseMode(e => !e)}
                  className="px-2 py-1 rounded-lg text-xs font-black mr-1"
                  style={{ background: eraseMode ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)', color: eraseMode ? '#c084fc' : '#9a9b9e' }}>
                  🧹 پاک‌کن
                </button>
                <button onClick={clearCanvas} className="px-2 py-1 rounded-lg text-xs font-black"
                  style={{ background: 'rgba(204,34,41,0.12)', color: '#CC2229' }}>پاک همه</button>
              </div>
              <div className="flex gap-1.5 items-center">
                {[2, 4, 8, 14].map(w => (
                  <button key={w} onClick={() => setLineW(w)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ background: lineW === w ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.07)' }}>
                    <div className="rounded-full bg-white" style={{ width: Math.min(w, 14), height: Math.min(w, 14) }} />
                  </button>
                ))}
                <p className="text-xs flex-1 text-left" style={{ color: '#6D6E71' }}>
                  {Object.keys(pub.guesses).length > 0 && `${Object.keys(pub.guesses).length} حدس رسید`}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-5xl">⏳</div>
            <p className="font-black text-white">منتظر حدس بازیکنان...</p>
          </div>
        )}
      </div>
    )

    // Guesser view
    return (
      <div className="h-full flex flex-col" dir="rtl">
        {/* Header */}
        <div className="flex-shrink-0 px-3 pt-3 pb-2 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>نقاش: <span style={{ color: '#c084fc', fontWeight: 700 }}>{pub.painterName}</span></p>
            <p className="text-xs mt-0.5" style={{ color: '#9a9b9e' }}>
              دسته‌بندی: {pub.categoryName} • {pub.letterCount} حرف •&nbsp;
              <span style={{ color: DIFF_COLOR[pub.wordDifficulty] }}>{DIFF_LABEL[pub.wordDifficulty]}</span>
            </p>
          </div>
          {isDrawingPhase && (
            <div className="text-center px-3 py-1.5 rounded-xl"
              style={{ background: timeLeft <= 15 ? 'rgba(204,34,41,0.15)' : 'rgba(255,214,10,0.1)' }}>
              <div className="font-black text-2xl" style={{ color: timeLeft <= 15 ? '#CC2229' : '#ffd60a', fontFamily: 'monospace' }}>
                {timeLeft}
              </div>
            </div>
          )}
        </div>

        {/* Canvas with fog panels */}
        <div className="relative mx-2 mt-2 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ background: '#f9f9f9', border: '1.5px solid rgba(124,58,237,0.3)', aspectRatio: '560/380' }}>
          <canvas ref={viewCanvasRef} width={560} height={380}
            className="w-full h-full" style={{ display: 'block' }} />
          {/* Fog panels 2×3 */}
          {isDrawingPhase && (
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', pointerEvents: 'none' }}>
              {[0, 1, 2, 3, 4, 5].map(idx => {
                const revealed = revealOrder.slice(0, piecesRevealed).includes(idx)
                return (
                  <div key={idx} style={{
                    background: revealed ? 'transparent' : 'rgba(10,10,14,0.7)',
                    backdropFilter: revealed ? 'none' : 'blur(8px)',
                    transition: 'all 0.8s ease',
                    border: revealed ? 'none' : '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!revealed && <span style={{ fontSize: 18, opacity: 0.3 }}>🔒</span>}
                  </div>
                )
              })}
            </div>
          )}
          {/* Candidates reveal progress bar */}
          {isDrawingPhase && !showCandidates && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (piecesRevealed / PUZZLE_PANELS) * 100)}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                }} />
            </div>
          )}
        </div>

        {/* Guess area */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {!showCandidates ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>
                در حال نقاشی... گزینه‌ها به زودی نمایش داده می‌شود
              </p>
              <div className="flex gap-1">
                {Array.from({ length: PUZZLE_PANELS }).map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded"
                    style={{ background: i < piecesRevealed ? '#7c3aed' : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </div>
          ) : myGuess ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="text-4xl">✅</div>
              <p className="font-black text-white">حدس شما: <span style={{ color: '#c084fc' }}>{myGuess}</span></p>
              <p className="text-xs" style={{ color: '#9a9b9e' }}>منتظر نتیجه...</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-center mb-3 font-bold" style={{ color: '#c084fc' }}>
                کدام کلمه کشیده شده؟
              </p>
              <div className="grid grid-cols-2 gap-2">
                {pub.candidates.map(opt => (
                  <button key={opt} onClick={() => submitGuess(opt)}
                    className="btn-game p-3 rounded-2xl font-bold text-white text-sm transition-all"
                    style={{ background: 'rgba(26,26,28,0.9)', border: '1.5px solid rgba(124,58,237,0.3)' }}>
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Host can advance manually */}
        {isHost && isDrawingPhase && (
          <div className="flex-shrink-0 px-3 pb-3">
            <button onClick={() => hostMoveToGuessing(pub)}
              className="btn-game w-full py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9b9e' }}>
              رد کردن — رأی‌گیری
            </button>
          </div>
        )}
        {isHost && pub.phase === 'guessing' && (
          <div className="flex-shrink-0 px-3 pb-3">
            <button onClick={() => hostReveal()}
              className="btn-game w-full py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(204,34,41,0.12)', color: '#CC2229' }}>
              نمایش نتیجه ({Object.keys(pub.guesses).length}/{players.filter(p => p.id !== pub.painterId).length})
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Round Result ──────────────────────────────────────────────────────────
  if (pub.phase === 'round_result') {
    const myRoundScore = pub.roundScores[myPlayer.id] ?? 0
    const sortedThisRound = [...players].sort((a, b) => (pub.roundScores[b.id] ?? 0) - (pub.roundScores[a.id] ?? 0))
    const painterBonus = pub.roundScores[pub.painterId] ?? 0

    return (
      <div className="h-full overflow-y-auto" dir="rtl">
      <div className="min-h-full flex flex-col items-center gap-5 px-4 py-6">
        <div className="text-5xl">🎨</div>
        <div className="text-center">
          <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>کلمه مخفی بود:</p>
          <h2 className="font-black text-white text-3xl mt-1">{pub.correctWord}</h2>
          <p className="text-xs mt-1" style={{ color: DIFF_COLOR[pub.wordDifficulty] }}>
            {DIFF_STARS[pub.wordDifficulty]} {DIFF_LABEL[pub.wordDifficulty]} — {pub.basePoints} امتیاز پایه
          </p>
        </div>

        {/* My result */}
        {!amIPainter && (
          <div className="px-5 py-3 rounded-2xl text-center"
            style={{
              background: myRoundScore > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(204,34,41,0.08)',
              border: `1.5px solid ${myRoundScore > 0 ? '#22c55e44' : '#CC222933'}`,
            }}>
            <p className="text-xs" style={{ color: '#9a9b9e' }}>حدس شما: <span style={{ color: '#fff', fontWeight: 700 }}>{pub.guesses[myPlayer.id] || 'ندادید'}</span></p>
            <p className="font-black text-2xl mt-1" style={{ color: myRoundScore > 0 ? '#22c55e' : '#CC2229' }}>
              {myRoundScore > 0 ? `+${myRoundScore}` : '۰'} {myRoundScore > 0 ? '✓' : '✗'}
            </p>
          </div>
        )}

        {/* Painter bonus */}
        <div className="px-4 py-2 rounded-xl text-center"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>نقاش: {pub.painterName}</p>
          <p className="font-black text-sm" style={{ color: '#c084fc' }}>+{painterBonus} امتیاز</p>
        </div>

        {/* Round scores */}
        <div className="w-full max-w-xs flex flex-col gap-2">
          <p className="text-xs font-black" style={{ color: '#9a9b9e' }}>این دور:</p>
          {sortedThisRound.map((p, i) => {
            const rs = pub.roundScores[p.id] ?? 0
            const ts = pub.totalScores[p.id] ?? 0
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(30,30,34,0.9)', border: `1px solid ${rs > 0 ? '#22c55e22' : 'rgba(255,255,255,0.05)'}` }}>
                <span className="font-black text-xs w-4" style={{ color: i === 0 ? '#ffd60a' : '#6D6E71' }}>#{i+1}</span>
                <span className="font-bold text-white text-sm flex-1 truncate">{p.name}</span>
                {p.id === pub.painterId && <span className="text-xs" style={{ color: '#c084fc' }}>🖌</span>}
                <span className="font-black text-sm" style={{ color: rs > 0 ? '#22c55e' : '#6D6E71' }}>+{rs}</span>
                <span className="text-xs" style={{ color: '#9a9b9e' }}>({ts})</span>
              </div>
            )
          })}
        </div>

        {pub.round < pub.totalRounds ? (
          isHost && (
            <button onClick={() => hostNextRound(pub)}
              className="btn-game px-8 py-4 rounded-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 6px 20px rgba(124,58,237,0.35)' }}>
              دور بعدی ({pub.round + 1}/{pub.totalRounds}) ➜
            </button>
          )
        ) : (
          isHost && (
            <button onClick={() => broadcastPub({ ...pub, phase: 'game_over' })}
              className="btn-game px-8 py-4 rounded-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #ffd60a, #f59e0b)', color: '#000' }}>
              🏆 نمایش نتایج نهایی
            </button>
          )
        )}
        {!isHost && (
          <p className="text-xs" style={{ color: '#6D6E71' }}>میزبان دور بعدی را شروع می‌کند...</p>
        )}
      </div>
      </div>
    )
  }

  // ── Game Over ─────────────────────────────────────────────────────────────
  if (pub.phase === 'game_over') {
    const sortedFinal = [...players].sort((a, b) => (pub.totalScores[b.id] ?? 0) - (pub.totalScores[a.id] ?? 0))
    const winner = sortedFinal[0]
    const myTotal = pub.totalScores[myPlayer.id] ?? 0
    const myRank = sortedFinal.findIndex(p => p.id === myPlayer.id) + 1

    return (
      <div className="h-full overflow-y-auto" dir="rtl">
      <div className="min-h-full flex flex-col items-center gap-6 px-4 py-8">
        <div className="text-6xl">🏆</div>
        <div className="w-full rounded-3xl py-5 text-center"
          style={{ background: 'rgba(255,214,10,0.1)', border: '2px solid rgba(255,214,10,0.4)' }}>
          <p className="text-sm font-bold" style={{ color: '#ffd60a' }}>برنده بازی</p>
          <h2 className="font-black text-white text-2xl mt-1">{winner?.name}</h2>
          <p className="font-black text-3xl mt-1" style={{ color: '#ffd60a' }}>{pub.totalScores[winner?.id ?? ''] ?? 0} امتیاز</p>
        </div>

        <div className="px-4 py-3 rounded-2xl text-center"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
          <p className="text-xs" style={{ color: '#9a9b9e' }}>جایگاه شما</p>
          <p className="font-black text-white text-xl">#{myRank}</p>
          <p className="font-black" style={{ color: '#c084fc' }}>{myTotal} امتیاز</p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-2">
          <p className="text-xs font-black" style={{ color: '#9a9b9e' }}>جدول نهایی:</p>
          {sortedFinal.map((p, i) => {
            const ts = pub.totalScores[p.id] ?? 0
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: i === 0 ? 'rgba(255,214,10,0.08)' : 'rgba(30,30,34,0.9)',
                  border: `1px solid ${i === 0 ? 'rgba(255,214,10,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <span className="font-black text-sm w-5"
                  style={{ color: i === 0 ? '#ffd60a' : i === 1 ? '#9a9b9e' : i === 2 ? '#f97316' : '#6D6E71' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                </span>
                <span className="font-bold text-white text-sm flex-1 truncate">{p.name}</span>
                <span className="font-black text-sm" style={{ color: i === 0 ? '#ffd60a' : '#9a9b9e' }}>{ts}</span>
              </div>
            )
          })}
        </div>

        <button onClick={onExit}
          className="btn-game px-8 py-4 rounded-2xl font-black text-white w-full max-w-xs"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
          خروج
        </button>
      </div>
      </div>
    )
  }

  return null
}
