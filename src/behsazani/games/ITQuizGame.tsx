import { useState, useEffect, useRef } from 'react'
import type { BehsazaniPlayer } from '../BehsazaniHub'

interface Question {
  q: string
  options: string[]
  answer: number
  category: string
}

const QUESTIONS: Question[] = [
  { q: 'مخفف CPU چیست؟', options: ['Central Processing Unit', 'Computer Power Unit', 'Central Power Unit', 'Core Processing Unit'], answer: 0, category: 'سخت‌افزار' },
  { q: 'کدام زبان برنامه‌نویسی برای توسعه وب استفاده می‌شود؟', options: ['Python', 'JavaScript', 'C++', 'Assembly'], answer: 1, category: 'برنامه‌نویسی' },
  { q: 'HTTP مخفف چیست؟', options: ['HyperText Transfer Protocol', 'High Transfer Text Process', 'HyperText Transport Processor', 'Hosting Text Transfer Protocol'], answer: 0, category: 'شبکه' },
  { q: 'RAM مخفف چیست؟', options: ['Read Access Memory', 'Random Access Memory', 'Rapid Access Module', 'Remote Access Mode'], answer: 1, category: 'سخت‌افزار' },
  { q: 'کدام شرکت سیستم‌عامل Android را توسعه داده؟', options: ['Apple', 'Microsoft', 'Google', 'Samsung'], answer: 2, category: 'فناوری' },
  { q: 'SQL برای چه کاربردی است؟', options: ['طراحی گرافیک', 'مدیریت پایگاه داده', 'توسعه بازی', 'امنیت شبکه'], answer: 1, category: 'پایگاه داده' },
  { q: 'کدام پروتکل برای ارسال ایمیل استفاده می‌شود؟', options: ['HTTP', 'FTP', 'SMTP', 'SSH'], answer: 2, category: 'شبکه' },
  { q: 'IP مخفف چیست؟', options: ['Internet Protocol', 'Internal Process', 'Input Parameter', 'Integrated Program'], answer: 0, category: 'شبکه' },
  { q: 'کدام شرکت پردازنده‌های Intel را می‌سازد؟', options: ['AMD', 'Qualcomm', 'Intel Corporation', 'NVIDIA'], answer: 2, category: 'سخت‌افزار' },
  { q: 'Git برای چه استفاده می‌شود؟', options: ['طراحی پایگاه داده', 'مدیریت نسخه کد', 'تست نرم‌افزار', 'مانیتورینگ سرور'], answer: 1, category: 'ابزار' },
  { q: 'LAN مخفف چیست؟', options: ['Long Area Network', 'Local Area Network', 'Large Access Node', 'Light Area Network'], answer: 1, category: 'شبکه' },
  { q: 'کدام زبان برنامه‌نویسی برای هوش مصنوعی محبوب‌ترین است؟', options: ['Java', 'C#', 'Python', 'Ruby'], answer: 2, category: 'هوش مصنوعی' },
  { q: 'SSL/TLS برای چه استفاده می‌شود؟', options: ['سرعت شبکه', 'رمزنگاری ارتباطات', 'مدیریت سرور', 'ذخیره‌سازی داده'], answer: 1, category: 'امنیت' },
  { q: 'کدام ساختار داده LIFO است؟', options: ['Queue', 'Stack', 'Array', 'Tree'], answer: 1, category: 'الگوریتم' },
  { q: 'DNS چه کاربردی دارد؟', options: ['مدیریت فایل', 'تبدیل نام دامنه به IP', 'رمزنگاری', 'پشتیبان‌گیری'], answer: 1, category: 'شبکه' },
  { q: 'کدام شرکت سیستم‌عامل macOS را می‌سازد؟', options: ['Google', 'Microsoft', 'Apple', 'IBM'], answer: 2, category: 'سیستم‌عامل' },
  { q: 'کلمه Algorithm از چه زبانی آمده؟', options: ['یونانی', 'لاتین', 'فارسی/عربی', 'آلمانی'], answer: 2, category: 'اطلاعات عمومی' },
  { q: 'کدام نوع حمله سایبری با ایمیل‌های جعلی انجام می‌شود؟', options: ['DDoS', 'Phishing', 'SQL Injection', 'Ransomware'], answer: 1, category: 'امنیت' },
  { q: 'API مخفف چیست؟', options: ['Application Programming Interface', 'Automatic Process Integration', 'Advanced Programming Index', 'Application Process Input'], answer: 0, category: 'برنامه‌نویسی' },
  { q: 'کدام شرکت موتور جستجوی Google را ارائه می‌دهد؟', options: ['Microsoft', 'Meta', 'Alphabet (Google)', 'Amazon'], answer: 2, category: 'فناوری' },
]

const TIMER = 15

interface Props { players: BehsazaniPlayer[]; myPlayer?: BehsazaniPlayer; isHost?: boolean; isOnline?: boolean; roomCode?: string; hostPlayerId?: string; onExit: () => void }

export default function ITQuizGame({ players, onExit }: Props) {
  const [questions] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10))
  const [qIdx, setQIdx] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(players.map(p => [p.id, 0])))
  const [answered, setAnswered] = useState<Record<string, number>>({})  // playerId -> selected option
  const [timeLeft, setTimeLeft] = useState(TIMER)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [answererIdx, setAnswererIdx] = useState(0)

  const q = questions[qIdx]
  const currentAnswerer = players[answererIdx % players.length]
  const allAnswered = Object.keys(answered).length >= players.length

  useEffect(() => {
    setTimeLeft(TIMER)
    setAnswered({})
    setRevealed(false)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setRevealed(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [qIdx])

  useEffect(() => {
    if (allAnswered) {
      clearInterval(timerRef.current!)
      setTimeLeft(0)
      // Score
      const updates: Record<string, number> = {}
      Object.entries(answered).forEach(([pid, choice]) => {
        if (choice === q.answer) updates[pid] = (scores[pid] || 0) + 100 + timeLeft * 5
      })
      if (Object.keys(updates).length > 0) setScores(prev => ({ ...prev, ...updates }))
      setRevealed(true)
    }
  }, [allAnswered])

  if (done) {
    const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 px-6" dir="rtl">
        <div className="text-6xl">💻</div>
        <h2 className="font-black text-white text-2xl">نتیجه مسابقه IT</h2>
        <div className="w-full max-w-xs flex flex-col gap-2">
          {sorted.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: i === 0 ? 'rgba(139,92,246,0.15)' : 'rgba(30,30,34,0.8)', border: `1.5px solid ${i === 0 ? '#8b5cf655' : 'rgba(255,255,255,0.06)'}` }}>
              <span className="font-black text-xl">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
              <span className="font-bold text-white flex-1">{p.name}</span>
              <span className="font-black" style={{ color: '#8b5cf6' }}>{scores[p.id] || 0}</span>
            </div>
          ))}
        </div>
        <button onClick={onExit} className="btn-game px-8 py-4 rounded-2xl font-black text-white"
          style={{ background: 'rgba(255,255,255,0.1)' }}>خروج</button>
      </div>
    )
  }

  // Multi-device: each player answers in turn
  if (!revealed) {
    const hasCurrentAnswered = answered[currentAnswerer.id] !== undefined

    if (hasCurrentAnswered && !allAnswered) {
      setAnswererIdx(i => i + 1)
      return null
    }

    return (
      <div className="h-full flex flex-col gap-4 px-4 py-5" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
            {q.category}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: '#9a9b9e' }}>سؤال {qIdx + 1}/{questions.length}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
              style={{ background: timeLeft > 8 ? '#22c55e' : timeLeft > 4 ? '#ffd60a' : '#CC2229', color: '#fff' }}>
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(timeLeft / TIMER) * 100}%`, background: timeLeft > 8 ? '#22c55e' : timeLeft > 4 ? '#ffd60a' : '#CC2229' }} />
        </div>

        <p className="text-sm font-bold text-center" style={{ color: '#9a9b9e' }}>
          گوشی را به <span style={{ color: '#8b5cf6' }}>{currentAnswerer.name}</span> بده
        </p>

        {/* Question */}
        <div className="px-4 py-4 rounded-2xl text-center flex-shrink-0"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1.5px solid rgba(139,92,246,0.3)' }}>
          <p className="font-black text-white text-base leading-relaxed">{q.q}</p>
        </div>

        {/* Options */}
        <div className="grid gap-2 flex-1" style={{ gridTemplateColumns: 'repeat(2, 1fr)', alignContent: 'start' }}>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => {
              if (answered[currentAnswerer.id] !== undefined) return
              const isCorrect = i === q.answer
              const pts = isCorrect ? 100 + timeLeft * 5 : 0
              setAnswered(prev => ({ ...prev, [currentAnswerer.id]: i }))
              if (isCorrect) setScores(prev => ({ ...prev, [currentAnswerer.id]: (prev[currentAnswerer.id] || 0) + pts }))
            }}
              disabled={answered[currentAnswerer.id] !== undefined}
              className="btn-game py-3 px-3 rounded-xl font-bold text-sm text-right text-white"
              style={{
                background: answered[currentAnswerer.id] === i ? 'rgba(139,92,246,0.4)' : 'rgba(30,30,34,0.9)',
                border: `1.5px solid ${answered[currentAnswerer.id] === i ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <span className="font-black" style={{ color: '#8b5cf6' }}>{['الف', 'ب', 'ج', 'د'][i]}. </span>{opt}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Revealed — show results
  return (
    <div className="h-full flex flex-col gap-4 px-4 py-5" dir="rtl">
      <h2 className="font-black text-white text-center">جواب صحیح</h2>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {q.options.map((opt, i) => (
          <div key={i} className="py-3 px-3 rounded-xl font-bold text-sm text-white"
            style={{
              background: i === q.answer ? 'rgba(34,197,94,0.25)' : 'rgba(204,34,41,0.1)',
              border: `1.5px solid ${i === q.answer ? '#22c55e' : 'rgba(255,255,255,0.05)'}`,
            }}>
            {i === q.answer && '✅ '}<span className="font-black" style={{ color: i === q.answer ? '#22c55e' : '#6D6E71' }}>{['الف', 'ب', 'ج', 'د'][i]}. </span>{opt}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {players.map(p => (
          <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl"
            style={{ background: 'rgba(30,30,34,0.8)' }}>
            <span className="text-sm font-bold text-white">{p.name}</span>
            <span className="text-sm font-bold" style={{ color: answered[p.id] === q.answer ? '#22c55e' : '#CC2229' }}>
              {answered[p.id] === undefined ? '—' : answered[p.id] === q.answer ? `✅ +${100 + (timeLeft) * 5}` : '❌'}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {players.map(p => (
          <div key={p.id} className="flex items-center justify-between px-3 py-1">
            <span className="text-xs" style={{ color: '#9a9b9e' }}>{p.name}</span>
            <span className="text-xs font-black" style={{ color: '#8b5cf6' }}>{scores[p.id] || 0}</span>
          </div>
        ))}
      </div>
      <button onClick={() => {
        if (qIdx + 1 >= questions.length) setDone(true)
        else { setQIdx(q => q + 1); setAnswererIdx(0) }
      }}
        className="btn-game py-3.5 rounded-2xl font-black text-white mt-auto"
        style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
        {qIdx + 1 >= questions.length ? '🏆 نتیجه نهایی' : 'سؤال بعدی →'}
      </button>
    </div>
  )
}
