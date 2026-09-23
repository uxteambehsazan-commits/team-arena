import { useEffect, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { MISSIONS, NAME_FAMILY_CATEGORIES, ONE_WORD_QUESTIONS } from '../constants'

const AI_NAME = 'هوش مصنوعی'

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

// Persian answers per letter for NAME_FAMILY hard mode [name, family, city, food, animal, job]
const AI_NF: Record<string, string[]> = {
  'آ': ['آرش',    'آقایی',    'آبادان',      'آبگوشت',    'آهو',       'آشپز'        ],
  'ب': ['بهنام',  'بهرامی',   'بوشهر',       'برنج',      'ببر',       'بنا'         ],
  'پ': ['پریسا',  'پورمند',   'پیرانشهر',    'پلو',       'پلنگ',      'پزشک'        ],
  'ت': ['تارا',   'تهرانی',   'تبریز',       'تخم‌مرغ',   'تمساح',     'تعمیرکار'    ],
  'ج': ['جواد',   'جعفری',    'جهرم',        'جوجه',      'جغد',       'جراح'        ],
  'چ': ['چیستا',  'چراغی',    'چابهار',      'چلوکباب',   'چرخ‌بال',   'چوپان'       ],
  'خ': ['خسرو',   'خدایی',    'خرمشهر',      'خورشت',     'خرگوش',     'خلبان'       ],
  'د': ['داریوش', 'دهقانی',   'دزفول',       'دلمه',      'دلفین',     'دندانپزشک'   ],
  'ر': ['رضا',    'رحیمی',    'رشت',         'رشته',      'روباه',     'راننده'      ],
  'ز': ['زهرا',   'زارعی',    'زاهدان',      'زرشک‌پلو',  'زرافه',     'زبان‌شناس'   ],
  'س': ['سارا',   'صادقی',    'ساری',        'سوپ',       'سگ',        'سرباز'       ],
  'ش': ['شیما',   'شریفی',    'شیراز',       'شیرینی',    'شغال',      'شاعر'        ],
  'ف': ['فرید',   'فراهانی',  'فسا',         'فسنجان',    'فیل',       'فروشنده'     ],
  'ق': ['قاسم',   'قاضی',     'قم',          'قیمه',      'قناری',     'قناد'        ],
  'ک': ['کامران', 'کریمی',    'کرمانشاه',    'کباب',      'کبک',       'کارمند'      ],
  'گ': ['گلناز',  'گودرزی',   'گرگان',       'گوجه',      'گرگ',       'گچکار'       ],
  'ل': ['لیلا',   'لطفی',     'لنگرود',      'لوبیا',     'لاکپشت',    'لوله‌کش'     ],
  'م': ['محمد',   'محمدی',    'مشهد',        'ماهیچه',    'میمون',     'معلم'        ],
  'ن': ['نیلوفر', 'نجفی',     'نوشهر',       'نان',       'نهنگ',      'نقاش'        ],
  'و': ['ویدا',   'وزیری',    'ورامین',      'ویچ',       'وزغ',       'وکیل'        ],
  'ه': ['هانیه',  'هاشمی',    'همدان',       'هویج',      'هدهد',      'هنرمند'      ],
  'ی': ['یاسمن',  'یوسفی',    'یزد',         'یخنی',      'یوزپلنگ',   'یه‌چیز'      ],
}

export function useAI(state: GameState, dispatch: React.Dispatch<GameAction>, isOnline: boolean) {
  // Stable refs so timer callbacks always see latest values without stale closures
  const stateRef = useRef(state)
  stateRef.current = state
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  const isOnlineRef = useRef(isOnline)
  isOnlineRef.current = isOnline

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const prevKeyRef = useRef<string>('')

  // Compute a key that changes only when the AI needs to reschedule.
  // Does NOT include timeLeft so TIMER_TICK doesn't retrigger the effect.
  const aiPlayer = state.players.find(p => p.name === AI_NAME && p.connected)
  const aiId = aiPlayer?.id ?? ''
  const enabledList = MISSIONS.filter(m => (state.enabledMissions ?? []).includes(m.id))
  const mId = enabledList[state.currentMissionIndex]?.id ?? ''
  const missionKey = [
    isOnline ? 'online' : 'offline',
    state.phase,
    state.currentMissionIndex,
    state.currentTurnIndex,
    aiId ? (state.submitted[aiId] ? '1' : '0') : 'no-ai',
    mId === 'TEAM' ? (state.teamState?.activated?.length ?? 0) : '',
    mId === 'ONE_WORD' ? ((state.oneWordState?.wrongGuesses ?? {})[aiId] ?? 0) : '',
    mId === 'NAME_FAMILY' ? (state.nameFamilyState?.locked[aiId] ? '1' : '0') : '',
  ].join('|')

  useEffect(() => {
    function clearTimers() {
      const ts = timersRef.current
      if (Array.isArray(ts)) ts.forEach(clearTimeout)
      timersRef.current = []
    }

    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(() => {
        // Guard: only fire if still offline and still playing
        if (isOnlineRef.current) return
        if (stateRef.current.phase !== 'PLAYING') return
        fn()
      }, delay)
      if (!Array.isArray(timersRef.current)) timersRef.current = []
      timersRef.current.push(id)
    }

    clearTimers()

    if (isOnline || state.phase !== 'PLAYING' || !aiPlayer) return

    const hard = state.aiDifficulty === 'hard'

    // ── TEAM ─────────────────────────────────────────────────────────────
    if (mId === 'TEAM') {
      const ts = state.teamState
      if (!ts || ts.success || ts.failed) return
      const activated = ts.activated ?? []
      const nextId = ts.sequence[activated.length]
      if (nextId === undefined) return
      schedule(() => dispatchRef.current({ type: 'TEAM_CLICK', componentId: nextId }),
        hard ? rand(600, 1200) : rand(1200, 2500))
      return
    }

    // ── SPEED ─────────────────────────────────────────────────────────────
    if (mId === 'SPEED') {
      const currentId = (state.turnOrder ?? [])[state.currentTurnIndex]
      if (currentId !== aiId || state.submitted[aiId]) return
      const delay = hard ? rand(700, 1400) : rand(1500, 3000)
      schedule(() => {
        dispatchRef.current({ type: 'SPEED_HIT', playerId: aiId, isCorrect: Math.random() < (hard ? 0.82 : 0.48), responseTime: delay / 1000 })
      }, delay)
      return
    }

    // ── MEMORY ────────────────────────────────────────────────────────────
    if (mId === 'MEMORY') {
      const currentId = (state.turnOrder ?? [])[state.currentTurnIndex]
      if (currentId !== aiId || state.submitted[aiId]) return
      const delay = hard ? rand(2500, 4000) : rand(4000, 6500)
      schedule(() => {
        const pairs = hard ? Math.floor(rand(2, 6)) : Math.floor(rand(0, 3))
        dispatchRef.current({ type: 'PLAYER_SUBMIT', playerId: aiId, answer: pairs * 100, responseTime: delay / 1000 })
      }, delay)
      return
    }

    // ── LOGIC ─────────────────────────────────────────────────────────────
    if (mId === 'LOGIC') {
      const currentIdLogic = (state.turnOrder ?? [])[state.currentTurnIndex]
      if (currentIdLogic !== aiId || state.submitted[aiId]) return
      const delay = hard ? rand(2000, 3500) : rand(3500, 6000)
      schedule(() => {
        const s = stateRef.current
        let answer: number
        if (hard && Math.random() < 0.75 && s.logicQuestion?.answer !== undefined) {
          answer = s.logicQuestion.answer
        } else {
          const wrong = [0, 1, 2, 3].filter(x => x !== s.logicQuestion?.answer)
          answer = wrong[Math.floor(Math.random() * wrong.length)] ?? Math.floor(Math.random() * 4)
        }
        dispatchRef.current({ type: 'PLAYER_SUBMIT', playerId: aiId, answer, responseTime: delay / 1000 })
      }, delay)
      return
    }

    // ── FASTEST ───────────────────────────────────────────────────────────
    if (mId === 'FASTEST') {
      if (state.submitted[aiId]) return
      const delay = hard ? rand(400, 1000) : rand(1500, 3500)
      schedule(() => dispatchRef.current({ type: 'FASTEST_PRESS', playerId: aiId, timestamp: Date.now() }), delay)
      return
    }

    // ── FINAL (دوز) ─── AI logic is handled entirely within FinalMission component

    // ── NAME_FAMILY ───────────────────────────────────────────────────────
    if (mId === 'NAME_FAMILY') {
      const nf = state.nameFamilyState
      if (!nf || nf.locked[aiId]) return
      if (hard) {
        const answers = AI_NF[nf.letter] ?? []
        NAME_FAMILY_CATEGORIES.forEach((cat, idx) => {
          const word = answers[idx] ?? ''
          if (!word) return
          schedule(() => dispatchRef.current({ type: 'NAME_FAMILY_TYPE', playerId: aiId, categoryId: cat.id, value: word }),
            rand(500, 1500) + idx * rand(200, 500))
        })
      }
      schedule(() => dispatchRef.current({ type: 'NAME_FAMILY_SUBMIT', playerId: aiId }),
        hard ? rand(3500, 5500) : rand(6000, 9000))
      return
    }

    // ── ONE_WORD ──────────────────────────────────────────────────────────
    if (mId === 'ONE_WORD') {
      if (state.submitted[aiId]) return
      const ow = state.oneWordState
      if (!ow) return
      const wrongCount = (ow.wrongGuesses ?? {})[aiId] ?? 0
      if (wrongCount >= 3) return
      schedule(() => {
        const s = stateRef.current
        const owNow = s.oneWordState
        if (!owNow) return
        const guess = hard && owNow.revealedClues >= 2 && Math.random() < 0.65
          ? (ONE_WORD_QUESTIONS[owNow.questionIndex]?.answer ?? '...')
          : '...'
        dispatchRef.current({ type: 'ONE_WORD_GUESS', playerId: aiId, guess })
      }, hard ? rand(3000, 5000) : rand(5000, 8000))
    }

    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionKey])
}
