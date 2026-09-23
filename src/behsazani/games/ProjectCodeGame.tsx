import { useState } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'

const WORD_BANK = [
  'آفتاب', 'ماه', 'ستاره', 'ابر', 'باد', 'باران', 'برف', 'رعد', 'صاعقه', 'طوفان',
  'کوه', 'دریا', 'رود', 'جنگل', 'صحرا', 'جزیره', 'آتشفشان', 'غار', 'دره', 'دشت',
  'سیب', 'پرتقال', 'انگور', 'هلو', 'توت', 'گیلاس', 'موز', 'انار', 'خرما', 'انجیر',
  'شیر', 'پلنگ', 'گرگ', 'روباه', 'خرس', 'فیل', 'زرافه', 'شتر', 'اسب', 'گاو',
]

type Phase = 'setup' | 'code_assign' | 'clue_phase' | 'guess_phase' | 'result'

interface TeamState {
  code: number[]        // 3 digits, each 1-4
  words: string[]       // 4 words shown on board
  clues: (string | null)[] // clue for each digit position
  guess: number[]
  score: number
  encoderIdx: number
}

function pickWords(n: number): string[] {
  return [...WORD_BANK].sort(() => Math.random() - 0.5).slice(0, n)
}

function genCode(): number[] {
  return [1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, 3)
}

interface Props { players: BehsazaniPlayer[]; myPlayer?: BehsazaniPlayer; isHost?: boolean; isOnline?: boolean; roomCode?: string; hostPlayerId?: string; onExit: () => void }

export default function ProjectCodeGame({ players, onExit }: Props) {
  const half = Math.floor(players.length / 2)
  const teamAPlayers = players.slice(0, half)
  const teamBPlayers = players.slice(half)

  const [phase, setPhase] = useState<Phase>('setup')
  const [roundNum, setRoundNum] = useState(1)
  const [teamA, setTeamA] = useState<TeamState>({
    code: genCode(), words: pickWords(4), clues: [null, null, null],
    guess: [], score: 0, encoderIdx: 0,
  })
  const [teamB, setTeamB] = useState<TeamState>({
    code: genCode(), words: pickWords(4), clues: [null, null, null],
    guess: [], score: 0, encoderIdx: 0,
  })
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A')
  const [interceptGuess, setInterceptGuess] = useState<number[]>([])
  const [winner, setWinner] = useState<'A' | 'B' | null>(null)

  const team = activeTeam === 'A' ? teamA : teamB
  const setTeam = activeTeam === 'A' ? setTeamA : setTeamB
  const teamPlayers = activeTeam === 'A' ? teamAPlayers : teamBPlayers
  const encoder = teamPlayers[team.encoderIdx % teamPlayers.length]

  if (phase === 'setup') return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <div className="text-5xl">🗝️</div>
      <h2 className="font-black text-white text-xl text-center">رمز پروژه</h2>
      <div className="w-full max-w-xs flex flex-col gap-3">
        <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,214,10,0.1)', border: '1.5px solid #ffd60a44' }}>
          <p className="text-xs font-bold" style={{ color: '#ffd60a' }}>تیم آبی ({half} نفر):</p>
          <p className="text-sm text-white">{teamAPlayers.map(p => p.name).join('، ')}</p>
        </div>
        <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(204,34,41,0.1)', border: '1.5px solid #CC222944' }}>
          <p className="text-xs font-bold" style={{ color: '#CC2229' }}>تیم قرمز ({players.length - half} نفر):</p>
          <p className="text-sm text-white">{teamBPlayers.map(p => p.name).join('، ')}</p>
        </div>
      </div>
      <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>هر تیم ۴ کلمه و یک کد مخفی ۳ رقمی دارد</p>
      <button onClick={() => setPhase('code_assign')}
        className="btn-game px-8 py-4 rounded-2xl font-black text-white"
        style={{ background: 'linear-gradient(135deg, #ffd60a, #ca8a04)', color: '#111' }}>
        شروع بازی!
      </button>
    </div>
  )

  if (phase === 'code_assign') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <p className="text-sm font-bold" style={{ color: '#9a9b9e' }}>کد مخفی تیم {activeTeam === 'A' ? 'آبی' : 'قرمز'} (فقط رمزگذار ببیند):</p>
        <p className="text-sm font-bold" style={{ color: '#ffd60a' }}>{encoder?.name} — رمزگذار</p>
        <div className="flex gap-3">
          {team.code.map((digit, i) => (
            <div key={i} className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
              style={{ background: 'rgba(255,214,10,0.2)', border: '2px solid #ffd60a' }}>
              <span className="text-2xl font-black text-white">{digit}</span>
              <span className="text-xs" style={{ color: '#9a9b9e' }}>{team.words[digit - 1]}</span>
            </div>
          ))}
        </div>
        <div className="w-full max-w-xs flex flex-col gap-1">
          {team.words.map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(30,30,34,0.8)' }}>
              <span className="font-black text-white">{i + 1}.</span>
              <span className="text-sm text-white">{w}</span>
            </div>
          ))}
        </div>
        <button onClick={() => {
          if (activeTeam === 'A') { setActiveTeam('B'); }
          else { setActiveTeam('A'); setPhase('clue_phase'); }
        }}
          className="btn-game px-8 py-4 rounded-2xl font-black text-white"
          style={{ background: 'rgba(255,255,255,0.1)' }}>
          {activeTeam === 'A' ? 'نوبت تیم قرمز →' : 'شروع دادن سرنخ →'}
        </button>
      </div>
    )
  }

  if (phase === 'clue_phase') {
    const allCluesDone = (t: TeamState) => t.clues.every(c => c !== null)
    const clueIdx = team.clues.findIndex(c => c === null)

    if (clueIdx === -1 && activeTeam === 'A' && allCluesDone(teamB)) {
      setPhase('guess_phase')
      setActiveTeam('A')
      return null
    }
    if (clueIdx === -1) {
      setActiveTeam('B')
      return null
    }

    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <p className="text-xs font-bold" style={{ color: '#9a9b9e' }}>
          تیم {activeTeam === 'A' ? 'آبی' : 'قرمز'} — {encoder?.name} رمزگذار
        </p>
        <h2 className="font-black text-white text-xl text-center">
          کلمه {clueIdx + 1} — رقم "{team.code[clueIdx]}" = "{team.words[team.code[clueIdx] - 1]}"
        </h2>
        <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>یک سرنخ برای این کلمه بده</p>
        <ClueInput onSubmit={clue => {
          setTeam(prev => {
            const newClues = [...prev.clues]
            newClues[clueIdx] = clue
            return { ...prev, clues: newClues }
          })
          if (clueIdx === 2) {
            if (activeTeam === 'A' && !allCluesDone(teamB)) setActiveTeam('B')
            else { setPhase('guess_phase'); setActiveTeam('A') }
          }
        }} />
      </div>
    )
  }

  if (phase === 'guess_phase') {
    const guessingTeam = activeTeam
    const clueTeam = guessingTeam === 'A' ? teamA : teamB
    const otherClueTeam = guessingTeam === 'A' ? teamB : teamA
    const guessingPlayers = guessingTeam === 'A' ? teamAPlayers : teamBPlayers

    if (clueTeam.guess.length < 3) {
      return (
        <div className="h-full flex flex-col gap-4 px-6 py-6" dir="rtl">
          <p className="text-xs font-bold text-center" style={{ color: '#9a9b9e' }}>
            تیم {guessingTeam === 'A' ? 'آبی' : 'قرمز'} — سرنخ‌ها را ببینید و کد را حدس بزنید
          </p>
          <div className="flex flex-col gap-2">
            {clueTeam.clues.map((clue, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(30,30,34,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="font-black text-white text-lg">?</span>
                <span className="text-sm font-bold" style={{ color: '#ffd60a' }}>{clue}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {clueTeam.words.map((w, i) => (
              <div key={i} className="px-2 py-2 rounded-xl text-center text-xs font-bold text-white"
                style={{ background: 'rgba(30,30,34,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {i + 1}. {w}
              </div>
            ))}
          </div>
          <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>
            حدس شما تا اینجا: {clueTeam.guess.join(' - ') || '—'}
          </p>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[1, 2, 3, 4].map(n => {
              const alreadyGuessed = clueTeam.guess.includes(n)
              return (
                <button key={n} disabled={alreadyGuessed}
                  onClick={() => setTeam(prev => ({ ...prev, guess: [...prev.guess, n] }))}
                  className="btn-game py-3 rounded-xl font-black text-xl text-white"
                  style={{ background: alreadyGuessed ? 'rgba(255,255,255,0.05)' : 'rgba(255,214,10,0.2)', border: `1.5px solid ${alreadyGuessed ? 'rgba(255,255,255,0.05)' : '#ffd60a55'}`, opacity: alreadyGuessed ? 0.4 : 1 }}>
                  {n}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    // Tally
    const scoreA = teamA.guess.every((g, i) => g === teamA.code[i]) ? 1 : 0
    const scoreB = teamB.guess.every((g, i) => g === teamB.code[i]) ? 1 : 0

    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <h2 className="font-black text-white text-xl">نتیجه دور {roundNum}</h2>
        {[teamA, teamB].map((t, idx) => {
          const correct = t.guess.every((g, i) => g === t.code[i])
          return (
            <div key={idx} className="w-full max-w-xs px-4 py-3 rounded-2xl"
              style={{ background: correct ? 'rgba(34,197,94,0.15)' : 'rgba(204,34,41,0.15)', border: `1.5px solid ${correct ? '#22c55e' : '#CC2229'}` }}>
              <p className="font-black text-white">تیم {idx === 0 ? 'آبی' : 'قرمز'}: {correct ? '✅ درست' : '❌ اشتباه'}</p>
              <p className="text-xs mt-1" style={{ color: '#9a9b9e' }}>کد: {t.code.join('-')} | حدس: {t.guess.join('-')}</p>
            </div>
          )
        })}
        {roundNum >= 3 ? (
          <button onClick={() => {
            setWinner(teamA.score > teamB.score ? 'A' : 'B')
            setPhase('result')
          }}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #ffd60a, #ca8a04)', color: '#111' }}>
            نتیجه نهایی
          </button>
        ) : (
          <button onClick={() => {
            setTeamA(prev => ({ ...prev, code: genCode(), clues: [null, null, null], guess: [], score: prev.score + scoreA, encoderIdx: prev.encoderIdx + 1 }))
            setTeamB(prev => ({ ...prev, code: genCode(), clues: [null, null, null], guess: [], score: prev.score + scoreB, encoderIdx: prev.encoderIdx + 1 }))
            setRoundNum(r => r + 1)
            setActiveTeam('A')
            setPhase('code_assign')
          }}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            دور بعدی →
          </button>
        )}
      </div>
    )
  }

  if (phase === 'result') return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <div className="text-7xl">🗝️</div>
      <h2 className="font-black text-white text-2xl">تیم {winner === 'A' ? 'آبی' : 'قرمز'} برد!</h2>
      <div className="flex gap-4">
        <div className="px-4 py-3 rounded-xl text-center" style={{ background: 'rgba(255,214,10,0.1)' }}>
          <p className="text-xs" style={{ color: '#ffd60a' }}>آبی</p>
          <p className="font-black text-2xl text-white">{teamA.score}</p>
        </div>
        <div className="px-4 py-3 rounded-xl text-center" style={{ background: 'rgba(204,34,41,0.1)' }}>
          <p className="text-xs" style={{ color: '#CC2229' }}>قرمز</p>
          <p className="font-black text-2xl text-white">{teamB.score}</p>
        </div>
      </div>
      <button onClick={onExit} className="btn-game px-8 py-4 rounded-2xl font-black text-white"
        style={{ background: 'rgba(255,255,255,0.1)' }}>خروج</button>
    </div>
  )

  return null
}

function ClueInput({ onSubmit }: { onSubmit: (clue: string) => void }) {
  const [val, setVal] = useState('')
  return (
    <div className="flex gap-2 w-full max-w-xs">
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="سرنخ..."
        onKeyDown={e => e.key === 'Enter' && val.trim() && onSubmit(val.trim())}
        className="flex-1 px-4 py-3 rounded-xl font-bold text-white"
        style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.15)', outline: 'none', fontFamily: "'IranSans', sans-serif" }} />
      <button disabled={!val.trim()} onClick={() => onSubmit(val.trim())}
        className="btn-game px-4 py-3 rounded-xl font-black text-white"
        style={{ background: val.trim() ? 'linear-gradient(135deg, #ffd60a, #ca8a04)' : 'rgba(255,255,255,0.07)', color: val.trim() ? '#111' : '#fff' }}>
        تأیید
      </button>
    </div>
  )
}
