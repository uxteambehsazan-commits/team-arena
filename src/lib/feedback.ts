export type ReplayIntent = 'definitely' | 'probably' | 'neutral' | 'prefer-other'
export type FeedbackStatus = 'new' | 'reviewing' | 'implementing' | 'done' | 'rejected'

export const REPLAY_INTENT_LABELS: Record<ReplayIntent, string> = {
  definitely: '😍 حتماً',
  probably: '🙂 احتمالاً',
  neutral: '😐 فرقی نداره',
  'prefer-other': '🙃 ترجیح می‌دم بازی دیگه‌ای باشه',
}

export const FEEDBACK_TAGS = [
  'خیلی سرگرم‌کننده بود',
  'رقابتش جذاب بود',
  'خیلی سریع بود',
  'قوانینش واضح نبود',
  'سخت بود',
  'آسان بود',
  'دوست داشتم دوباره بازی کنم',
  'نیاز به بهبود دارد',
  'بیشتر از این بازی بگذارید',
  'ایده بازی جدید دارم',
]

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'جدید',
  reviewing: 'در حال بررسی',
  implementing: 'در حال اجرا',
  done: 'اعمال شد',
  rejected: 'فعلاً امکان اجرا ندارد',
}

export interface FeedbackEntry {
  id: string
  playerId: string
  playerName: string
  gameId: string
  gameName: string
  sessionId: string
  rating: number
  replayIntent: ReplayIntent | null
  selectedTags: string[]
  comment: string
  isBugReport: boolean
  bugDescription: string
  createdAt: string
  status: FeedbackStatus
}

const KEY = 'mission256_feedback'

export function saveFeedback(entry: Omit<FeedbackEntry, 'id' | 'createdAt' | 'status'>): FeedbackEntry {
  const full: FeedbackEntry = {
    ...entry,
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'new',
  }
  const existing = loadFeedback()
  localStorage.setItem(KEY, JSON.stringify([full, ...existing].slice(0, 200)))
  return full
}

export function loadFeedback(): FeedbackEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as FeedbackEntry[]
  } catch {
    return []
  }
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  const all = loadFeedback().map(f => f.id === id ? { ...f, status } : f)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function clearFeedback() {
  localStorage.removeItem(KEY)
}
