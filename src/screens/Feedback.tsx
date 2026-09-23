import { useState } from 'react'
import { saveFeedback, FEEDBACK_TAGS, REPLAY_INTENT_LABELS, type ReplayIntent } from '../lib/feedback'
import MobileHeader from '../components/MobileHeader'

interface Props {
  playerName: string
  playerId: string
  gameName: string
  gameId: string
  sessionId: string
  onDone: () => void
}

type Stage = 'rating' | 'replay' | 'tags' | 'comment' | 'success'

const REPLAY_OPTIONS: { value: ReplayIntent; emoji: string; label: string }[] = [
  { value: 'definitely',    emoji: '😍', label: 'حتماً' },
  { value: 'probably',      emoji: '🙂', label: 'احتمالاً' },
  { value: 'neutral',       emoji: '😐', label: 'فرقی نداره' },
  { value: 'prefer-other',  emoji: '🙃', label: 'ترجیح می‌دم بازی دیگه‌ای' },
]

export default function Feedback({ playerName, playerId, gameName, gameId, sessionId, onDone }: Props) {
  const [stage, setStage] = useState<Stage>('rating')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [replayIntent, setReplayIntent] = useState<ReplayIntent | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [isBugReport, setIsBugReport] = useState(false)
  const [bugDesc, setBugDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function skip() { onDone() }

  async function submit() {
    setSubmitting(true)
    saveFeedback({
      playerId,
      playerName,
      gameId,
      gameName,
      sessionId,
      rating,
      replayIntent,
      selectedTags: tags,
      comment: comment.trim(),
      isBugReport,
      bugDescription: bugDesc.trim(),
    })
    await new Promise(r => setTimeout(r, 600))
    setStage('success')
  }

  /* ─── Success ─── */
  if (stage === 'success') return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6" style={{ background: '#0e0e0f' }} dir="rtl">
      <div className="text-7xl animate-pop-in">💜</div>
      <div className="text-center animate-slide-up">
        <h2 className="text-2xl font-black text-white mb-2">مرسی هم‌تیمی!</h2>
        <p className="text-sm leading-6" style={{ color: '#9a9b9e' }}>
          بازخوردت ثبت شد و در بهتر شدن دورهمی‌های بعدی به ما کمک می‌کنه.
        </p>
      </div>
      <button onClick={onDone}
        className="btn-game mt-2 px-8 py-3.5 rounded-2xl font-black text-white"
        style={{ background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 4px 20px #CC222955' }}>
        ادامه بازی 🚀
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0e0e0f' }} dir="rtl">
      <MobileHeader
        title={`بازخورد — ${gameName}`}
        action={
          <button onClick={skip} className="btn-game text-xs py-1.5 px-3 rounded-xl"
            style={{ color: '#6D6E71', border: '1px solid #2e2e32' }}>
            رد کردن
          </button>
        }
      />

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center py-2.5 flex-shrink-0">
        {(['rating','replay','tags','comment'] as Stage[]).map((s, i) => (
          <div key={s} className="h-1 rounded-full transition-all"
            style={{
              width: stage === s ? 20 : 6,
              background: ['rating','replay','tags','comment'].indexOf(stage) >= i ? '#CC2229' : '#2e2e32',
            }} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 p-5 max-w-md mx-auto w-full">

          {/* ── Stage: Rating ── */}
          {stage === 'rating' && (
            <div className="flex flex-col items-center gap-6 animate-pop-in">
              <div className="text-center">
                <h2 className="text-xl font-black text-white">چقدر از این بازی لذت بردی؟</h2>
                <p className="text-sm mt-1" style={{ color: '#6D6E71' }}>نظر تو کمک می‌کنه دورهمی‌های بعدی بهتر بشن</p>
              </div>
              <div className="flex gap-3">
                {[1,2,3,4,5].map(n => (
                  <button key={n}
                    onClick={() => { setRating(n); setTimeout(() => setStage('replay'), 300) }}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    className="btn-game transition-all"
                    style={{ transform: (hovered || rating) >= n ? 'scale(1.3)' : 'scale(1)' }}>
                    <span className="text-4xl" style={{
                      filter: (hovered || rating) >= n ? 'none' : 'grayscale(1) opacity(0.35)',
                      transition: 'filter 0.15s, transform 0.15s',
                    }}>⭐</span>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm animate-pop-in" style={{ color: '#ffd60a' }}>
                  {rating === 5 ? 'عالی! 🎉' : rating >= 4 ? 'خوب بود 👍' : rating >= 3 ? 'متوسط 🙂' : rating >= 2 ? 'می‌شد بهتر باشه 😕' : 'ضعیف بود 😔'}
                </p>
              )}
            </div>
          )}

          {/* ── Stage: Replay Intent ── */}
          {stage === 'replay' && (
            <div className="flex flex-col gap-5 animate-pop-in">
              <div className="text-center">
                <h2 className="text-lg font-black text-white">دوست داری دوباره این بازی رو بازی کنی؟</h2>
                <p className="text-xs mt-1" style={{ color: '#6D6E71' }}>این شاخص به ما کمک می‌کنه بازی‌های بهتری بسازیم</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {REPLAY_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => { setReplayIntent(opt.value); setTimeout(() => setStage('tags'), 200) }}
                    className="btn-game flex items-center gap-4 rounded-2xl px-5 py-4 text-right transition-all"
                    style={{
                      background: replayIntent === opt.value ? '#CC222920' : '#1a1a1c',
                      border: `1.5px solid ${replayIntent === opt.value ? '#CC2229' : '#2e2e32'}`,
                    }}>
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-bold text-white text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStage('tags')} className="btn-game text-xs text-center py-2"
                style={{ color: '#6D6E71' }}>رد کردن این سوال</button>
            </div>
          )}

          {/* ── Stage: Tags ── */}
          {stage === 'tags' && (
            <div className="flex flex-col gap-5 animate-pop-in">
              <div className="text-center">
                <h2 className="text-lg font-black text-white">کدوم گزینه بهتر توصیفش می‌کنه؟</h2>
                <p className="text-xs mt-1" style={{ color: '#6D6E71' }}>می‌تونی چند تا انتخاب کنی — اختیاریه</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="btn-game px-3 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: tags.includes(tag) ? '#CC222920' : '#1a1a1c',
                      border: `1.5px solid ${tags.includes(tag) ? '#CC2229' : '#2e2e32'}`,
                      color: tags.includes(tag) ? '#e84249' : '#9a9b9e',
                    }}>
                    {tag}
                  </button>
                ))}
              </div>
              <button onClick={() => setStage('comment')}
                className="btn-game w-full py-4 rounded-2xl font-black text-white"
                style={{ background: 'linear-gradient(135deg,#CC2229,#e84249)' }}>
                ادامه →
              </button>
            </div>
          )}

          {/* ── Stage: Comment ── */}
          {stage === 'comment' && (
            <div className="flex flex-col gap-4 animate-pop-in">
              <div className="text-center">
                <h2 className="text-lg font-black text-white">پیشنهادی داری؟</h2>
                <p className="text-xs mt-1" style={{ color: '#6D6E71' }}>اختیاریه — ولی خیلی ارزشمنده</p>
              </div>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value.slice(0, 500))}
                  placeholder="مثلاً دوست داشتم زمان این راند کمی بیشتر باشد..."
                  rows={4}
                  dir="rtl"
                  className="w-full rounded-2xl px-4 py-3.5 text-white outline-none text-sm resize-none"
                  style={{ background: '#1e1e20', border: '1.5px solid #2e2e32' }}
                />
                <span className="absolute bottom-3 left-4 text-xs" style={{ color: '#555' }}>
                  {comment.length}/۵۰۰
                </span>
              </div>

              {/* Bug report toggle */}
              <button onClick={() => setIsBugReport(v => !v)}
                className="btn-game flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: isBugReport ? '#CC222915' : '#1a1a1c', border: `1.5px solid ${isBugReport ? '#CC222955' : '#2e2e32'}` }}>
                <span className="text-lg">{isBugReport ? '🐛' : '🐛'}</span>
                <span className="text-sm font-bold" style={{ color: isBugReport ? '#e84249' : '#9a9b9e' }}>گزارش مشکل فنی</span>
                <span className="mr-auto text-xs" style={{ color: '#555' }}>{isBugReport ? '✓ فعال' : 'اختیاری'}</span>
              </button>

              {isBugReport && (
                <textarea
                  value={bugDesc}
                  onChange={e => setBugDesc(e.target.value.slice(0, 300))}
                  placeholder="چه مشکلی دیدی؟ توضیح بده..."
                  rows={3}
                  dir="rtl"
                  className="w-full rounded-2xl px-4 py-3 text-white outline-none text-sm resize-none animate-slide-up"
                  style={{ background: '#1e1e20', border: '1.5px solid #CC222955' }}
                />
              )}

              <button onClick={submit} disabled={submitting}
                className="btn-game w-full py-4 rounded-2xl font-black text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 4px 20px #CC222944' }}>
                {submitting ? '⏳ در حال ثبت...' : 'ثبت بازخورد 💜'}
              </button>
              <button onClick={skip} className="btn-game text-xs text-center py-1"
                style={{ color: '#555' }}>فعلاً رد می‌کنم</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
