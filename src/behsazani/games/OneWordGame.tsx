import { useState } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'

const SECRET_WORDS = [
  'دریا', 'کوه', 'آفتاب', 'ماه', 'ستاره', 'باران', 'برف', 'باد', 'آتش', 'ابر',
  'پزشک', 'معلم', 'هنرمند', 'ورزشکار', 'دانشمند', 'کشاورز', 'آشپز', 'موسیقی‌دان',
  'سینما', 'رستوران', 'بیمارستان', 'مدرسه', 'دانشگاه', 'فرودگاه', 'بازار',
  'فوتبال', 'شنا', 'دویدن', 'شطرنج', 'کوه‌نوردی', 'تنیس', 'بسکتبال',
  'گربه', 'سگ', 'خرگوش', 'شیر', 'پرنده', 'ماهی', 'اسب', 'فیل', 'پلنگ',
  'کتاب', 'موسیقی', 'نقاشی', 'شعر', 'داستان', 'فیلم', 'تئاتر',
  'کیک', 'پیتزا', 'سوپ', 'نان', 'قهوه', 'شیر', 'عسل', 'شکلات',
]

type Phase = 'pick_guesser' | 'give_clues' | 'reveal' | 'guess' | 'result'

interface Props { players: BehsazaniPlayer[]; myPlayer?: BehsazaniPlayer; isHost?: boolean; isOnline?: boolean; roomCode?: string; hostPlayerId?: string; onExit: () => void }

export default function OneWordGame({ players, onExit }: Props) {
  const [roundNum, setRoundNum] = useState(0)
  const [guesserIdx, setGuesserIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('pick_guesser')
  const [secretWord, setSecretWord] = useState('')
  const [clues, setClues] = useState<Record<string, string>>({})  // playerId -> clue
  const [clueGiverIdx, setClueGiverIdx] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(players.map(p => [p.id, 0])))
  const [guessInput, setGuessInput] = useState('')
  const [guessResult, setGuessResult] = useState<'correct' | 'wrong' | null>(null)

  const guesser = players[guesserIdx % players.length]
  const clueGivers = players.filter(p => p.id !== guesser.id)
  const currentClueGiver = clueGivers[clueGiverIdx]

  function computeFinalClues(): { playerId: string; name: string; clue: string; duplicate: boolean }[] {
    const clueEntries = clueGivers.map(p => ({ playerId: p.id, name: p.name, clue: clues[p.id] || '' }))
    const clueTexts = clueEntries.map(e => e.clue.trim().toLowerCase())
    return clueEntries.map((e, i) => ({
      ...e,
      duplicate: clueTexts.filter(c => c === e.clue.trim().toLowerCase() && c !== '').length > 1,
    }))
  }

  const finalClues = phase === 'reveal' || phase === 'guess' ? computeFinalClues() : []
  const validClues = finalClues.filter(c => !c.duplicate && c.clue)

  if (phase === 'pick_guesser') return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
      <div className="text-5xl">💬</div>
      <h2 className="font-black text-white text-xl text-center">دور {roundNum + 1}</h2>
      <p className="text-sm text-center" style={{ color: '#9a9b9e' }}>
        حدس‌زننده: <span style={{ color: '#22c55e' }}>{guesser.name}</span>
        <br />بقیه سرنخ می‌دهند
      </p>
      <input value={secretWord} onChange={e => setSecretWord(e.target.value)}
        placeholder="کلمه مخفی را بنویس (دور از چشم {guesser.name})..."
        className="w-full max-w-xs px-4 py-3 rounded-xl font-bold text-white"
        style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid #22c55e44', outline: 'none', fontFamily: "'IranSans', sans-serif" }} />
      <button disabled={!secretWord.trim()} onClick={() => { setClues({}); setClueGiverIdx(0); setPhase('give_clues') }}
        className="btn-game px-8 py-4 rounded-2xl font-black text-white"
        style={{ background: secretWord.trim() ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.07)' }}>
        شروع دادن سرنخ →
      </button>
    </div>
  )

  if (phase === 'give_clues') {
    if (!currentClueGiver) {
      setPhase('reveal')
      return null
    }
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-4xl">💡</div>
        <h2 className="font-black text-white text-xl text-center">
          گوشی را به <span style={{ color: '#22c55e' }}>{currentClueGiver.name}</span> بده
        </h2>
        <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>
          کلمه مخفی: <span style={{ color: '#ffd60a' }}>{secretWord}</span>
          <br />فقط یک کلمه سرنخ بده!
        </p>
        <ClueInput
          onSubmit={clue => {
            setClues(prev => ({ ...prev, [currentClueGiver.id]: clue }))
            setClueGiverIdx(i => i + 1)
          }}
          placeholder={`سرنخ ${currentClueGiver.name}...`}
        />
        <p className="text-xs" style={{ color: '#6D6E71' }}>
          {clueGiverIdx + 1} از {clueGivers.length} نفر
        </p>
      </div>
    )
  }

  if (phase === 'reveal') return (
    <div className="h-full flex flex-col gap-5 px-6 py-8" dir="rtl">
      <h2 className="font-black text-white text-xl text-center">سرنخ‌های نهایی</h2>
      <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>سرنخ‌های تکراری حذف شده‌اند</p>
      <div className="flex flex-col gap-2">
        {finalClues.map(c => (
          <div key={c.playerId} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
            style={{ background: c.duplicate ? 'rgba(109,110,113,0.1)' : 'rgba(34,197,94,0.1)', border: `1.5px solid ${c.duplicate ? 'rgba(255,255,255,0.05)' : '#22c55e44'}` }}>
            <span className="text-xs font-bold" style={{ color: '#9a9b9e' }}>{c.name}:</span>
            <span className="font-black text-sm" style={{ color: c.duplicate ? '#6D6E71' : '#22c55e', textDecoration: c.duplicate ? 'line-through' : 'none' }}>
              {c.clue || '—'} {c.duplicate && '(تکراری)'}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-center" style={{ color: '#9a9b9e' }}>
        {validClues.length} سرنخ معتبر از {finalClues.length} سرنخ
      </p>
      <button onClick={() => setPhase('guess')}
        className="btn-game py-4 rounded-2xl font-black text-white mt-auto"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
        نوبت {guesser.name} →
      </button>
    </div>
  )

  if (phase === 'guess') return (
    <div className="h-full flex flex-col gap-5 px-6 py-8" dir="rtl">
      <h2 className="font-black text-white text-xl text-center">{guesser.name} — حدس بزن!</h2>
      <div className="flex flex-col gap-2">
        {validClues.map(c => (
          <div key={c.playerId} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid #22c55e44' }}>
            <span className="text-xs font-bold" style={{ color: '#9a9b9e' }}>{c.name}:</span>
            <span className="font-black text-sm" style={{ color: '#22c55e' }}>{c.clue}</span>
          </div>
        ))}
        {validClues.length === 0 && <p className="text-center text-sm" style={{ color: '#CC2229' }}>همه سرنخ‌ها تکراری بودند!</p>}
      </div>
      {guessResult ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl">{guessResult === 'correct' ? '🎉' : '😔'}</div>
          <p className="font-black text-xl text-white">{guessResult === 'correct' ? 'درست!' : 'اشتباه!'}</p>
          <p className="text-sm" style={{ color: '#9a9b9e' }}>کلمه: <span style={{ color: '#ffd60a' }}>{secretWord}</span></p>
          <button onClick={() => {
            if (roundNum + 1 >= players.length) setPhase('result')
            else {
              setRoundNum(r => r + 1)
              setGuesserIdx(i => i + 1)
              setSecretWord('')
              setGuessInput('')
              setGuessResult(null)
              setPhase('pick_guesser')
            }
          }}
            className="btn-game px-8 py-4 rounded-2xl font-black text-white"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            {roundNum + 1 >= players.length ? 'نتیجه نهایی' : 'دور بعد →'}
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-auto">
          <input value={guessInput} onChange={e => setGuessInput(e.target.value)}
            placeholder="کلمه مخفی چیست؟"
            onKeyDown={e => {
              if (e.key === 'Enter' && guessInput.trim()) {
                const correct = guessInput.trim().toLowerCase() === secretWord.toLowerCase()
                if (correct) setScores(prev => ({ ...prev, [guesser.id]: (prev[guesser.id] || 0) + 1 }))
                setGuessResult(correct ? 'correct' : 'wrong')
              }
            }}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-white"
            style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.15)', outline: 'none', fontFamily: "'IranSans', sans-serif" }} />
          <button disabled={!guessInput.trim()}
            onClick={() => {
              const correct = guessInput.trim().toLowerCase() === secretWord.toLowerCase()
              if (correct) setScores(prev => ({ ...prev, [guesser.id]: (prev[guesser.id] || 0) + 1 }))
              setGuessResult(correct ? 'correct' : 'wrong')
            }}
            className="btn-game px-4 py-3 rounded-xl font-black text-white"
            style={{ background: guessInput.trim() ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.07)' }}>
            حدس!
          </button>
        </div>
      )}
    </div>
  )

  if (phase === 'result') {
    const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <div className="text-6xl">🏆</div>
        <h2 className="font-black text-white text-2xl">نتیجه نهایی</h2>
        <div className="w-full max-w-xs flex flex-col gap-2">
          {sorted.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: i === 0 ? 'rgba(255,214,10,0.15)' : 'rgba(30,30,34,0.8)', border: `1.5px solid ${i === 0 ? '#ffd60a55' : 'rgba(255,255,255,0.06)'}` }}>
              <span className="font-black text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
              <span className="font-bold text-white flex-1">{p.name}</span>
              <span className="font-black" style={{ color: '#ffd60a' }}>{scores[p.id] || 0} امتیاز</span>
            </div>
          ))}
        </div>
        <button onClick={onExit} className="btn-game px-8 py-4 rounded-2xl font-black text-white"
          style={{ background: 'rgba(255,255,255,0.1)' }}>خروج</button>
      </div>
    )
  }

  return null
}

function ClueInput({ onSubmit, placeholder }: { onSubmit: (v: string) => void; placeholder: string }) {
  const [val, setVal] = useState('')
  return (
    <div className="flex gap-2 w-full max-w-xs">
      <input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
        onKeyDown={e => e.key === 'Enter' && val.trim() && onSubmit(val.trim())}
        className="flex-1 px-4 py-3 rounded-xl font-bold text-white"
        style={{ background: 'rgba(20,20,22,0.9)', border: '1.5px solid rgba(255,255,255,0.15)', outline: 'none', fontFamily: "'IranSans', sans-serif" }} />
      <button disabled={!val.trim()} onClick={() => { onSubmit(val.trim()) }}
        className="btn-game px-4 py-3 rounded-xl font-black text-white"
        style={{ background: val.trim() ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.07)' }}>
        ارسال
      </button>
    </div>
  )
}
