import { useState } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'

const WORD_POOL = [
  'سیب', 'ماه', 'دریا', 'کوه', 'باد', 'آتش', 'برگ', 'رود', 'ابر', 'برف',
  'شب', 'روز', 'ستاره', 'خورشید', 'زمین', 'گل', 'درخت', 'پرنده', 'ماهی', 'گرگ',
  'شیر', 'فیل', 'اسب', 'گاو', 'خرس', 'روباه', 'عقاب', 'مار', 'لاک‌پشت', 'پلنگ',
  'کتاب', 'قلم', 'میز', 'صندلی', 'در', 'پنجره', 'آینه', 'ساعت', 'چراغ', 'دیوار',
  'نان', 'آب', 'شیر', 'چای', 'قهوه', 'برنج', 'سبزی', 'میوه', 'ماست', 'تخم‌مرغ',
]
type Color = 'A' | 'B' | 'black' | 'neutral'
type Phase = 'setup' | 'play' | 'result'

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

function generateGrid() {
  const words = shuffle(WORD_POOL).slice(0, 25)
  const colors: Color[] = [
    ...Array(9).fill('A'), ...Array(8).fill('B'),
    'black', ...Array(7).fill('neutral'),
  ]
  const shuffledColors = shuffle(colors) as Color[]
  return words.map((word, i) => ({ word, color: shuffledColors[i], revealed: false }))
}

interface Props { players: BehsazaniPlayer[]; myPlayer?: BehsazaniPlayer; isHost?: boolean; isOnline?: boolean; roomCode?: string; hostPlayerId?: string; onExit: () => void }

export default function CodeBreakersGame({ players, onExit }: Props) {
  const [grid] = useState(generateGrid)
  const [cells, setCells] = useState(grid)
  const [phase, setPhase] = useState<Phase>('setup')
  const [masterA, setMasterA] = useState<string>(players[0]?.id || '')
  const [masterB, setMasterB] = useState<string>(players[1]?.id || '')
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A')
  const [clue, setClue] = useState('')
  const [clueCount, setClueCount] = useState(1)
  const [guessesLeft, setGuessesLeft] = useState(0)
  const [cluePhase, setCluePhase] = useState<'give' | 'guess'>('give')
  const [winner, setWinner] = useState<'A' | 'B' | null>(null)

  const teamAWords = cells.filter(c => c.color === 'A')
  const teamBWords = cells.filter(c => c.color === 'B')
  const aFound = teamAWords.filter(c => c.revealed).length
  const bFound = teamBWords.filter(c => c.revealed).length
  const currentMaster = players.find(p => p.id === (currentTeam === 'A' ? masterA : masterB))

  function revealCell(idx: number) {
    if (guessesLeft <= 0 || cells[idx].revealed) return
    const newCells = cells.map((c, i) => i === idx ? { ...c, revealed: true } : c)
    setCells(newCells)
    const cell = cells[idx]

    if (cell.color === 'black') {
      setWinner(currentTeam === 'A' ? 'B' : 'A')
      setPhase('result')
      return
    }

    const aF = newCells.filter(c => c.color === 'A' && c.revealed).length
    const bF = newCells.filter(c => c.color === 'B' && c.revealed).length
    if (aF >= 9) { setWinner('A'); setPhase('result'); return }
    if (bF >= 8) { setWinner('B'); setPhase('result'); return }

    if (cell.color !== currentTeam) {
      setCurrentTeam(t => t === 'A' ? 'B' : 'A')
      setCluePhase('give')
      setGuessesLeft(0)
      return
    }
    const newLeft = guessesLeft - 1
    setGuessesLeft(newLeft)
    if (newLeft === 0) {
      setCurrentTeam(t => t === 'A' ? 'B' : 'A')
      setCluePhase('give')
    }
  }

  const isMasterView = phase === 'play'

  if (phase === 'setup') return (
    <div className="h-full flex flex-col gap-4 px-6 py-8" dir="rtl">
      <h2 className="font-black text-white text-xl text-center">رمزگشایان — تنظیمات</h2>
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: '#06b6d4' }}>رمزگذار تیم آبی (A):</p>
          <div className="flex flex-col gap-1.5">
            {players.map(p => (
              <button key={p.id} onClick={() => setMasterA(p.id)}
                className="btn-game px-4 py-2.5 rounded-xl font-bold text-sm text-white text-right"
                style={{ background: masterA === p.id ? 'rgba(6,182,212,0.25)' : 'rgba(30,30,34,0.9)', border: `1.5px solid ${masterA === p.id ? '#06b6d4' : 'rgba(255,255,255,0.1)'}` }}>
                {p.name} {masterA === p.id && '✓'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: '#CC2229' }}>رمزگذار تیم قرمز (B):</p>
          <div className="flex flex-col gap-1.5">
            {players.filter(p => p.id !== masterA).map(p => (
              <button key={p.id} onClick={() => setMasterB(p.id)}
                className="btn-game px-4 py-2.5 rounded-xl font-bold text-sm text-white text-right"
                style={{ background: masterB === p.id ? 'rgba(204,34,41,0.25)' : 'rgba(30,30,34,0.9)', border: `1.5px solid ${masterB === p.id ? '#CC2229' : 'rgba(255,255,255,0.1)'}` }}>
                {p.name} {masterB === p.id && '✓'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button disabled={!masterA || !masterB || masterA === masterB}
        onClick={() => setPhase('play')}
        className="btn-game py-4 rounded-2xl font-black text-white mt-auto"
        style={{ background: masterA && masterB && masterA !== masterB ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'rgba(255,255,255,0.07)' }}>
        شروع بازی!
      </button>
    </div>
  )

  if (phase === 'play') return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: currentTeam === 'A' ? '#06b6d4' : '#CC2229' }} />
            <span className="font-black text-white text-sm">تیم {currentTeam === 'A' ? 'آبی' : 'قرمز'}</span>
          </div>
          <div className="flex gap-3 text-xs font-bold">
            <span style={{ color: '#06b6d4' }}>آبی: {aFound}/9</span>
            <span style={{ color: '#CC2229' }}>قرمز: {bFound}/8</span>
          </div>
        </div>
        {cluePhase === 'guess' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: currentTeam === 'A' ? 'rgba(6,182,212,0.1)' : 'rgba(204,34,41,0.1)' }}>
            <span className="text-xs font-bold text-white">سرنخ:</span>
            <span className="text-sm font-black" style={{ color: currentTeam === 'A' ? '#06b6d4' : '#CC2229' }}>
              {clue} ({clueCount})
            </span>
            <span className="mr-auto text-xs" style={{ color: '#9a9b9e' }}>باقی: {guessesLeft}</span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {cells.map((cell, i) => {
            const showColor = cell.revealed || (isMasterView && (cell.color === (currentTeam === 'A' ? 'A' : 'B') || cell.color === 'black'))
            const bgColor = cell.color === 'A' ? '#06b6d4' : cell.color === 'B' ? '#CC2229' : cell.color === 'black' ? '#111' : '#6D6E71'
            return (
              <button key={i}
                onClick={() => cluePhase === 'guess' && revealCell(i)}
                disabled={cell.revealed || cluePhase === 'give'}
                className="btn-game py-2 px-1 rounded-xl font-bold text-center"
                style={{
                  fontSize: 10,
                  background: cell.revealed ? bgColor : showColor ? `${bgColor}44` : 'rgba(30,30,34,0.9)',
                  border: `1.5px solid ${cell.revealed ? bgColor : showColor ? bgColor + '88' : 'rgba(255,255,255,0.08)'}`,
                  color: cell.revealed ? '#fff' : showColor ? bgColor : '#fff',
                  opacity: cell.revealed ? 0.7 : 1,
                  cursor: cluePhase === 'give' || cell.revealed ? 'default' : 'pointer',
                }}>
                {cell.word}
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2 flex flex-col gap-2">
        {cluePhase === 'give' ? (
          <div>
            <p className="text-xs font-bold mb-2 text-center" style={{ color: '#9a9b9e' }}>
              {currentMaster?.name} — سرنخ بده
            </p>
            <div className="flex gap-2">
              <input value={clue} onChange={e => setClue(e.target.value)} placeholder="کلمه سرنخ..."
                className="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.15)', outline: 'none', fontFamily: "'IranSans', sans-serif" }} />
              <select value={clueCount} onChange={e => setClueCount(+e.target.value)}
                className="px-3 py-2 rounded-xl font-black text-white"
                style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.15)', outline: 'none' }}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button disabled={!clue.trim()} onClick={() => { setGuessesLeft(clueCount + 1); setCluePhase('guess') }}
                className="btn-game px-4 py-2 rounded-xl font-black text-white text-sm"
                style={{ background: clue.trim() ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(255,255,255,0.07)' }}>
                تأیید
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setCurrentTeam(t => t === 'A' ? 'B' : 'A'); setCluePhase('give'); setClue(''); setGuessesLeft(0) }}
            className="btn-game py-3 rounded-xl font-black text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            پاس دادن نوبت
          </button>
        )}
      </div>
    </div>
  )

  if (phase === 'result') return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <div className="text-7xl">🏆</div>
      <h2 className="font-black text-white text-2xl text-center">
        تیم {winner === 'A' ? 'آبی' : 'قرمز'} برد!
      </h2>
      <button onClick={onExit} className="btn-game px-8 py-4 rounded-2xl font-black text-white"
        style={{ background: 'rgba(255,255,255,0.1)' }}>خروج</button>
    </div>
  )

  return null
}
