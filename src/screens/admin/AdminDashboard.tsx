import { useState, useMemo } from 'react'
import { adminLogout } from '../../lib/adminAuth'
import {
  loadFeedback, updateFeedbackStatus, clearFeedback,
  FEEDBACK_STATUS_LABELS, REPLAY_INTENT_LABELS, FEEDBACK_TAGS,
  type FeedbackEntry, type FeedbackStatus, type ReplayIntent,
} from '../../lib/feedback'
import { loadScores } from '../../lib/scores'
import {
  loadAdminSettings, saveAdminSettings, ALL_GAMES,
  type AdminSettings,
} from '../../lib/adminSettings'
import bmLogo from '../../imports/03-BMC-Right_FA-EN_1.png'

interface Props { onClose: () => void }

type NavSection = 'dashboard' | 'players' | 'games' | 'feedback' | 'suggestions' | 'bugs' | 'insights' | 'settings'

const NAV_ITEMS: { id: NavSection; label: string; icon: string }[] = [
  { id: 'dashboard',   label: 'داشبورد',             icon: '📊' },
  { id: 'settings',    label: 'تنظیمات بازی',        icon: '⚙️' },
  { id: 'players',     label: 'عملکرد بازیکنان',     icon: '👥' },
  { id: 'games',       label: 'سوابق جلسات',          icon: '🎮' },
  { id: 'feedback',    label: 'بازخوردها',            icon: '💬' },
  { id: 'suggestions', label: 'پیشنهادات',            icon: '💡' },
  { id: 'bugs',        label: 'گزارش مشکلات',         icon: '🐛' },
  { id: 'insights',    label: 'بینش‌ها',              icon: '🔍' },
]

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  new: '#3b82f6', reviewing: '#ffd60a', implementing: '#f97316', done: '#22c55e', rejected: '#6D6E71',
}

function KpiCard({ label, value, sub, color = '#CC2229' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col gap-1" style={{ border: '1px solid #2e2e32' }}>
      <div className="text-xs font-bold" style={{ color: '#6D6E71' }}>{label}</div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: '#555' }}>{sub}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ background: `${STATUS_COLORS[status]}22`, color: STATUS_COLORS[status], border: `1px solid ${STATUS_COLORS[status]}55` }}>
      {FEEDBACK_STATUS_LABELS[status]}
    </span>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ color: n <= rating ? '#ffd60a' : '#2e2e32' }}>★</span>
      ))}
    </span>
  )
}

function ReplayBar({ entries }: { entries: FeedbackEntry[] }) {
  const withIntent = entries.filter(e => e.replayIntent)
  if (withIntent.length === 0) return <p className="text-xs" style={{ color: '#6D6E71' }}>هنوز داده‌ای ثبت نشده</p>
  const counts: Record<ReplayIntent, number> = { definitely: 0, probably: 0, neutral: 0, 'prefer-other': 0 }
  withIntent.forEach(e => { if (e.replayIntent) counts[e.replayIntent]++ })
  const total = withIntent.length
  const items: { key: ReplayIntent; label: string; color: string }[] = [
    { key: 'definitely',   label: '😍 حتماً',                      color: '#22c55e' },
    { key: 'probably',     label: '🙂 احتمالاً',                   color: '#ffd60a' },
    { key: 'neutral',      label: '😐 فرقی نداره',                  color: '#6D6E71' },
    { key: 'prefer-other', label: '🙃 ترجیح می‌دم بازی دیگه',      color: '#CC2229' },
  ]
  return (
    <div className="flex flex-col gap-2">
      {items.map(({ key, label, color }) => {
        const pct = total ? Math.round((counts[key] / total) * 100) : 0
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs w-40 flex-shrink-0" style={{ color: '#c0c0c0' }}>{label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1e1e20' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="text-xs w-8 text-left" style={{ color }}>{pct}%</span>
          </div>
        )
      })}
      <p className="text-xs mt-1" style={{ color: '#555' }}>{total} پاسخ</p>
    </div>
  )
}

function Toggle({ on, onToggle, label, sub }: { on: boolean; onToggle: () => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: '#1e1e20' }}>
      <div className="flex-1">
        <div className="text-sm font-bold text-white">{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>{sub}</div>}
      </div>
      <button
        onClick={onToggle}
        className="relative flex-shrink-0 transition-all"
        style={{ width: 44, height: 24 }}
        aria-checked={on}
        role="switch"
      >
        <div className="absolute inset-0 rounded-full transition-all"
          style={{ background: on ? '#CC2229' : '#2e2e32', boxShadow: on ? '0 0 10px #CC222955' : 'none', transition: 'background 0.2s' }} />
        <div className="absolute top-0.5 rounded-full transition-all"
          style={{ width: 20, height: 20, background: '#fff', left: on ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
      </button>
    </div>
  )
}

export default function AdminDashboard({ onClose }: Props) {
  const [section, setSection] = useState<NavSection>('dashboard')
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null)
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(loadFeedback)
  const [filterRating, setFilterRating] = useState(0)
  const [filterGame, setFilterGame] = useState('')
  const [sortFeedback, setSortFeedback] = useState<'newest' | 'oldest' | 'high' | 'low'>('newest')
  const [playerSearch, setPlayerSearch] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(loadAdminSettings)

  const scores = useMemo(() => loadScores(), [])

  function updateSettings(patch: Partial<AdminSettings>) {
    setAdminSettings(prev => {
      const next = { ...prev, ...patch }
      saveAdminSettings(next)
      return next
    })
  }

  function toggleGame(key: string) {
    const disabled = adminSettings.disabledGames.includes(key)
      ? adminSettings.disabledGames.filter(k => k !== key)
      : [...adminSettings.disabledGames, key]
    updateSettings({ disabledGames: disabled })
  }

  function logout() { adminLogout(); onClose() }

  function refreshFeedback() { setFeedbackList(loadFeedback()) }

  function changeStatus(id: string, status: FeedbackStatus) {
    updateFeedbackStatus(id, status)
    refreshFeedback()
    if (selectedFeedback?.id === id) setSelectedFeedback(prev => prev ? { ...prev, status } : null)
  }

  /* ─── Derived metrics ─── */
  const totalFeedback = feedbackList.length
  const avgRating = totalFeedback ? (feedbackList.reduce((s, f) => s + f.rating, 0) / totalFeedback).toFixed(1) : '—'
  const bugs = feedbackList.filter(f => f.isBugReport)
  const suggestions = feedbackList.filter(f => f.comment.trim().length > 10 && !f.isBugReport)

  /* ─── Score-based player stats ─── */
  const playerMap = useMemo(() => {
    const m = new Map<string, { name: string; games: number; wins: number; totalScore: number; bestScore: number }>()
    for (const s of scores) {
      const existing = m.get(s.playerName) ?? { name: s.playerName, games: 0, wins: 0, totalScore: 0, bestScore: 0 }
      existing.games++
      if (s.rank === 1) existing.wins++
      existing.totalScore += s.score
      existing.bestScore = Math.max(existing.bestScore, s.score)
      m.set(s.playerName, existing)
    }
    return Array.from(m.values()).sort((a, b) => b.totalScore - a.totalScore)
  }, [scores])

  /* ─── Game stats from scores ─── */
  const sessionMap = useMemo(() => {
    const m = new Map<string, { id: string; players: number; winner: string; date: string }>()
    for (const s of scores) {
      if (!m.has(s.gameId)) m.set(s.gameId, { id: s.gameId, players: s.totalPlayers, winner: '', date: s.date })
      if (s.rank === 1) m.get(s.gameId)!.winner = s.playerName
    }
    return Array.from(m.values())
  }, [scores])

  /* ─── Filtered feedback ─── */
  const filteredFeedback = useMemo(() => {
    let list = [...feedbackList]
    if (filterRating) list = list.filter(f => f.rating === filterRating)
    if (filterGame)   list = list.filter(f => f.gameName.includes(filterGame))
    if (section === 'suggestions') list = list.filter(f => f.comment.trim().length > 0 && !f.isBugReport)
    if (section === 'bugs')        list = list.filter(f => f.isBugReport)
    if (sortFeedback === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sortFeedback === 'oldest') list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    if (sortFeedback === 'high')   list.sort((a, b) => b.rating - a.rating)
    if (sortFeedback === 'low')    list.sort((a, b) => a.rating - b.rating)
    return list
  }, [feedbackList, filterRating, filterGame, sortFeedback, section])

  const filteredPlayers = useMemo(
    () => playerMap.filter(p => !playerSearch || p.name.includes(playerSearch)),
    [playerMap, playerSearch]
  )

  const gameNames = [...new Set(feedbackList.map(f => f.gameName))]

  function formatDate(iso: string) {
    try { return new Date(iso).toLocaleDateString('fa-IR') } catch { return iso }
  }

  /* ─── Feedback detail drawer ─── */
  const FeedbackDetail = () => selectedFeedback ? (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedFeedback(null)}>
      <div className="glass-panel rounded-t-3xl md:rounded-3xl p-5 w-full max-w-lg flex flex-col gap-4 animate-slide-up"
        style={{ border: '1px solid #2e2e32', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-black text-white">{selectedFeedback.playerName}</p>
            <p className="text-xs" style={{ color: '#6D6E71' }}>{selectedFeedback.gameName} · {formatDate(selectedFeedback.createdAt)}</p>
          </div>
          <StatusBadge status={selectedFeedback.status} />
          <button onClick={() => setSelectedFeedback(null)} className="btn-game text-xl" style={{ color: '#6D6E71' }}>✕</button>
        </div>
        <div className="flex items-center gap-3">
          <StarRow rating={selectedFeedback.rating} />
          {selectedFeedback.replayIntent && (
            <span className="text-xs" style={{ color: '#9a9b9e' }}>{REPLAY_INTENT_LABELS[selectedFeedback.replayIntent]}</span>
          )}
        </div>
        {selectedFeedback.selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedFeedback.selectedTags.map(t => (
              <span key={t} className="px-2 py-1 rounded-lg text-xs" style={{ background: '#CC222915', color: '#e84249', border: '1px solid #CC222933' }}>{t}</span>
            ))}
          </div>
        )}
        {selectedFeedback.comment && (
          <div className="rounded-2xl p-3" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#6D6E71' }}>پیشنهاد:</p>
            <p className="text-sm text-white leading-6">{selectedFeedback.comment}</p>
          </div>
        )}
        {selectedFeedback.isBugReport && (
          <div className="rounded-2xl p-3" style={{ background: '#CC222910', border: '1px solid #CC222933' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#CC2229' }}>🐛 گزارش مشکل:</p>
            <p className="text-sm text-white leading-6">{selectedFeedback.bugDescription || '—'}</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold" style={{ color: '#6D6E71' }}>تغییر وضعیت:</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FEEDBACK_STATUS_LABELS) as FeedbackStatus[]).map(s => (
              <button key={s} onClick={() => changeStatus(selectedFeedback.id, s)}
                className="btn-game px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: selectedFeedback.status === s ? `${STATUS_COLORS[s]}22` : '#1a1a1c',
                  border: `1px solid ${selectedFeedback.status === s ? STATUS_COLORS[s] : '#2e2e32'}`,
                  color: selectedFeedback.status === s ? STATUS_COLORS[s] : '#9a9b9e',
                }}>
                {FEEDBACK_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null

  const empty = (label: string) => (
    <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
      <div className="text-5xl">📭</div>
      <p className="text-white font-bold">{label}</p>
    </div>
  )

  const FeedbackCard = ({ f }: { f: FeedbackEntry }) => (
    <button onClick={() => setSelectedFeedback(f)} className="btn-game glass-panel rounded-2xl p-4 text-right w-full flex flex-col gap-2"
      style={{ border: '1px solid #2e2e32', transition: 'border-color 0.2s' }}>
      <div className="flex items-center gap-2 w-full">
        <span className="font-black text-white text-sm flex-1 truncate">{f.playerName}</span>
        <StatusBadge status={f.status} />
        {f.isBugReport && <span className="text-xs">🐛</span>}
      </div>
      <div className="flex items-center gap-2">
        <StarRow rating={f.rating} />
        <span className="text-xs" style={{ color: '#6D6E71' }}>· {f.gameName}</span>
        <span className="text-xs mr-auto" style={{ color: '#555' }}>{formatDate(f.createdAt)}</span>
      </div>
      {f.replayIntent && (
        <p className="text-xs" style={{ color: '#9a9b9e' }}>{REPLAY_INTENT_LABELS[f.replayIntent]}</p>
      )}
      {f.comment && <p className="text-xs leading-5 text-right" style={{ color: '#9a9b9e', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{f.comment}</p>}
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0b0b0d' }} dir="rtl">
      <FeedbackDetail />

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #1e1e20', background: '#111113' }}>
        <button onClick={() => setNavOpen(v => !v)} className="btn-game w-9 h-9 rounded-xl flex items-center justify-center md:hidden"
          style={{ background: '#1e1e20', border: '1px solid #2e2e32', color: '#9a9b9e' }}>☰</button>
        <img src={bmLogo} alt="" className="h-6 object-contain opacity-70" />
        <div className="flex-1">
          <h1 className="text-sm font-black text-white">داشبورد مدیریت</h1>
          <p className="text-xs" style={{ color: '#6D6E71' }}>گزارش عملکرد و بازخورد هم‌تیمی‌ها</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#CC222915', color: '#CC2229', border: '1px solid #CC222933' }}>
            نمایش دموی داده
          </span>
          <button onClick={logout} className="btn-game px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#1e1e20', border: '1px solid #2e2e32', color: '#6D6E71' }}>
            خروج
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar nav ─── */}
        <div className={`flex-shrink-0 flex flex-col py-3 gap-1 overflow-y-auto transition-all ${navOpen ? 'w-48' : 'hidden md:flex md:w-48'}`}
          style={{ borderLeft: '1px solid #1e1e20', background: '#0e0e10' }}>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => { setSection(n.id); setNavOpen(false) }}
              className="btn-game flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold transition-all text-right"
              style={{
                background: section === n.id ? '#CC222918' : 'transparent',
                color: section === n.id ? '#e84249' : '#9a9b9e',
                borderRight: `3px solid ${section === n.id ? '#CC2229' : 'transparent'}`,
              }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={logout} className="btn-game flex items-center gap-2.5 px-4 py-2.5 text-sm mx-2 mb-2 rounded-xl"
            style={{ color: '#6D6E71', border: '1px solid #2e2e32' }}>
            <span>🚪</span><span>خروج</span>
          </button>
        </div>

        {/* ─── Main content ─── */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* DASHBOARD */}
          {section === 'dashboard' && (
            <div className="flex flex-col gap-5 max-w-3xl mx-auto">
              <h2 className="text-lg font-black text-white">داشبورد</h2>

              {/* Active settings status banner */}
              <div className="rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3"
                style={{ background: 'rgba(204,34,41,0.06)', border: '1px solid rgba(204,34,41,0.18)' }}>
                <span className="text-xs font-bold" style={{ color: '#6D6E71' }}>وضعیت تنظیمات:</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: adminSettings.feedbackEnabled ? '#22c55e22' : '#2e2e3255', color: adminSettings.feedbackEnabled ? '#4ade80' : '#6D6E71', border: `1px solid ${adminSettings.feedbackEnabled ? '#22c55e44' : '#2e2e32'}` }}>
                  {adminSettings.feedbackEnabled ? '✓ نظرسنجی فعال' : '✗ نظرسنجی غیرفعال'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: '#3b82f622', color: '#60a5fa', border: '1px solid #3b82f644' }}>
                  {ALL_GAMES.length - adminSettings.disabledGames.length} از {ALL_GAMES.length} بازی فعال
                </span>
                <button onClick={() => setSection('settings')} className="btn-game text-xs mr-auto px-3 py-1 rounded-xl"
                  style={{ background: '#CC222918', color: '#e84249', border: '1px solid #CC222933' }}>
                  تغییر تنظیمات →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <KpiCard label="تعداد بازیکنان" value={playerMap.length || '—'} sub="از سوابق بازی" />
                <KpiCard label="دورهمی‌های انجام‌شده" value={sessionMap.length || '—'} sub="جلسه بازی" />
                <KpiCard label="کل شرکت‌کنندگان" value={scores.length || '—'} sub="ورودی آنلاین + آفلاین" color="#a855f7" />
                <KpiCard label="بازخوردهای دریافتی" value={totalFeedback || '—'} sub="نظر ثبت‌شده" color="#3b82f6" />
                <KpiCard label="میانگین رضایت" value={avgRating} sub="از ۵" color="#ffd60a" />
                <KpiCard label="گزارش مشکل" value={bugs.length || '—'} sub="باگ گزارش‌شده" color="#f97316" />
              </div>

              {/* Replay intent overview */}
              <div className="glass-panel rounded-2xl p-4" style={{ border: '1px solid #2e2e32' }}>
                <h3 className="font-black text-white text-sm mb-3">📊 تمایل به بازی مجدد</h3>
                <ReplayBar entries={feedbackList} />
              </div>

              {/* Recent feedback */}
              <div className="flex flex-col gap-2">
                <h3 className="font-black text-white text-sm">آخرین بازخوردها</h3>
                {feedbackList.length === 0 ? empty('هنوز بازخوردی ثبت نشده') : feedbackList.slice(0, 5).map(f => <FeedbackCard key={f.id} f={f} />)}
              </div>

              {/* Deployment fingerprint */}
              <div className="rounded-2xl px-4 py-3" style={{ background: '#0e0e10', border: '1px solid #2e2e32' }}>
                <div className="text-xs font-black mb-2" style={{ color: '#6D6E71', letterSpacing: '0.08em' }}>اطلاعات استقرار</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {([
                    ['نسخه', import.meta.env.VITE_APP_VERSION ?? '2.0.0'],
                    ['Build ID', import.meta.env.VITE_BUILD_ID ?? 'FIGMA-CURRENT'],
                    ['زمان Build', import.meta.env.VITE_BUILD_TIME ?? new Date().toISOString().slice(0, 16).replace('T', ' ')],
                    ['محیط', import.meta.env.PROD ? 'GitHub Pages' : 'Figma Make Dev'],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k} className="flex gap-2 items-baseline">
                      <span className="text-xs" style={{ color: '#444', minWidth: 70 }}>{k}:</span>
                      <span className="text-xs font-mono font-bold" style={{ color: '#888' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PLAYERS */}
          {section === 'players' && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-white flex-1">عملکرد بازیکنان</h2>
                <input value={playerSearch} onChange={e => setPlayerSearch(e.target.value)}
                  placeholder="جستجو..." dir="rtl"
                  className="rounded-xl px-3 py-2 text-sm text-white outline-none"
                  style={{ background: '#1e1e20', border: '1px solid #2e2e32', width: 140 }} />
              </div>
              {filteredPlayers.length === 0 ? empty('هنوز داده‌ای ثبت نشده') : (
                <div className="flex flex-col gap-2">
                  {filteredPlayers.map((p, i) => (
                    <div key={p.name} className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3"
                      style={{ border: '1px solid #2e2e32' }}>
                      <div className="text-base w-6 text-center" style={{ color: i < 3 ? '#ffd60a' : '#6D6E71' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-white text-sm">{p.name}</div>
                        <div className="text-xs" style={{ color: '#6D6E71' }}>{p.games} بازی · {p.wins} برد</div>
                      </div>
                      <div className="text-left">
                        <div className="font-black text-sm" style={{ color: '#CC2229' }}>{p.totalScore.toLocaleString('fa-IR')}</div>
                        <div className="text-xs" style={{ color: '#555' }}>مجموع</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GAMES */}
          {section === 'games' && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              <h2 className="text-lg font-black text-white">عملکرد بازی‌ها</h2>
              {sessionMap.length === 0 ? empty('هنوز داده‌ای ثبت نشده') : (
                <div className="flex flex-col gap-2">
                  {sessionMap.slice(0, 20).map((s, i) => (
                    <div key={s.id} className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3"
                      style={{ border: '1px solid #2e2e32' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: '#CC222920', color: '#e84249' }}>{i + 1}</div>
                      <div className="flex-1">
                        <div className="font-black text-white text-sm">🏆 {s.winner || '—'}</div>
                        <div className="text-xs" style={{ color: '#6D6E71' }}>{s.date} · {s.players} نفر</div>
                      </div>
                      <div className="text-xs" style={{ color: '#6D6E71' }}>
                        {(() => {
                          const fb = feedbackList.filter(f => f.sessionId === s.id)
                          if (!fb.length) return 'بدون بازخورد'
                          const avg = (fb.reduce((a, f) => a + f.rating, 0) / fb.length).toFixed(1)
                          return `⭐ ${avg}`
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FEEDBACK / SUGGESTIONS / BUGS — shared list UI */}
          {(section === 'feedback' || section === 'suggestions' || section === 'bugs') && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-white flex-1">
                  {section === 'feedback' ? 'بازخوردها' : section === 'suggestions' ? 'پیشنهادات' : 'گزارش مشکلات'}
                </h2>
                <select value={filterRating} onChange={e => setFilterRating(Number(e.target.value))}
                  className="rounded-xl px-2 py-1.5 text-xs text-white outline-none"
                  style={{ background: '#1e1e20', border: '1px solid #2e2e32' }}>
                  <option value={0}>همه امتیازها</option>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ستاره</option>)}
                </select>
                {gameNames.length > 0 && (
                  <select value={filterGame} onChange={e => setFilterGame(e.target.value)}
                    className="rounded-xl px-2 py-1.5 text-xs text-white outline-none"
                    style={{ background: '#1e1e20', border: '1px solid #2e2e32' }}>
                    <option value="">همه بازی‌ها</option>
                    {gameNames.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                )}
                <select value={sortFeedback} onChange={e => setSortFeedback(e.target.value as typeof sortFeedback)}
                  className="rounded-xl px-2 py-1.5 text-xs text-white outline-none"
                  style={{ background: '#1e1e20', border: '1px solid #2e2e32' }}>
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="high">بیشترین امتیاز</option>
                  <option value="low">کمترین امتیاز</option>
                </select>
              </div>
              {filteredFeedback.length === 0 ? empty('هیچ موردی پیدا نشد') : (
                <div className="flex flex-col gap-2">
                  {filteredFeedback.map(f => <FeedbackCard key={f.id} f={f} />)}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {section === 'settings' && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              <h2 className="text-lg font-black text-white">⚙️ تنظیمات بازی</h2>

              {/* Feedback settings */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col" style={{ border: '1px solid #2e2e32' }}>
                <h3 className="font-black text-white text-sm mb-1">📝 نظرسنجی بازیکنان</h3>
                <p className="text-xs mb-3" style={{ color: '#6D6E71' }}>کنترل نمایش فرم نظرسنجی پس از پایان هر دورهمی</p>
                <Toggle
                  on={adminSettings.feedbackEnabled}
                  onToggle={() => updateSettings({ feedbackEnabled: !adminSettings.feedbackEnabled })}
                  label="نمایش فرم نظرسنجی"
                  sub={adminSettings.feedbackEnabled ? 'دکمه «📝 نظرسنجی» در پایان بازی نمایش داده می‌شود' : 'فرم نظرسنجی برای بازیکنان مخفی است'}
                />
                {adminSettings.feedbackEnabled && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-xs font-bold" style={{ color: '#6D6E71' }}>زمان نمایش:</p>
                    <div className="flex gap-2 flex-wrap">
                      {([
                        { value: 'end',   label: 'انتهای بازی', icon: '🏁' },
                        { value: 'start', label: 'ابتدای بازی', icon: '🚀' },
                        { value: 'both',  label: 'ابتدا و انتها', icon: '🔄' },
                      ] as const).map(opt => (
                        <button key={opt.value}
                          onClick={() => updateSettings({ feedbackTiming: opt.value })}
                          className="btn-game px-4 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: adminSettings.feedbackTiming === opt.value ? '#CC222920' : '#1a1a1c',
                            border: `1.5px solid ${adminSettings.feedbackTiming === opt.value ? '#CC2229' : '#2e2e32'}`,
                            color: adminSettings.feedbackTiming === opt.value ? '#e84249' : '#9a9b9e',
                          }}>
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Games list */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col" style={{ border: '1px solid #2e2e32' }}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-black text-white text-sm flex-1">🎮 لیست بازی‌ها</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: '#3b82f622', color: '#60a5fa', border: '1px solid #3b82f644' }}>
                    {ALL_GAMES.length - adminSettings.disabledGames.length}/{ALL_GAMES.length} فعال
                  </span>
                  <button onClick={() => updateSettings({ disabledGames: [] })}
                    className="btn-game text-xs px-2 py-1 rounded-lg"
                    style={{ color: '#22c55e', border: '1px solid #22c55e33', background: '#22c55e10' }}>
                    فعال‌کردن همه
                  </button>
                </div>

                {/* General tab games */}
                <p className="text-xs font-black mb-1 pb-1" style={{ color: '#6D6E71', borderBottom: '1px solid #1e1e20' }}>🎮 بازی‌های عمومی</p>
                {ALL_GAMES.filter(g => g.tab === 'general').map(g => (
                  <Toggle
                    key={g.key}
                    on={!adminSettings.disabledGames.includes(g.key)}
                    onToggle={() => toggleGame(g.key)}
                    label={g.name}
                  />
                ))}

                <p className="text-xs font-black mt-4 mb-1 pb-1" style={{ color: '#6D6E71', borderBottom: '1px solid #1e1e20' }}>👑 بازی‌های بهسازانی</p>
                {ALL_GAMES.filter(g => g.tab === 'behsazan').map(g => (
                  <Toggle
                    key={g.key}
                    on={!adminSettings.disabledGames.includes(g.key)}
                    onToggle={() => toggleGame(g.key)}
                    label={g.name}
                  />
                ))}
              </div>

              {/* Participant stats */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3" style={{ border: '1px solid #2e2e32' }}>
                <h3 className="font-black text-white text-sm">👥 شرکت‌کنندگان بازی آنلاین</h3>
                {sessionMap.length === 0 ? (
                  <p className="text-xs" style={{ color: '#6D6E71' }}>هنوز هیچ جلسه بازی‌ای ثبت نشده</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl p-3" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
                        <div className="text-xl font-black" style={{ color: '#a855f7' }}>{scores.length}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>کل ورودی‌های ثبت‌شده</div>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
                        <div className="text-xl font-black" style={{ color: '#22c55e' }}>{sessionMap.length}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>جلسه بازی انجام‌شده</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                      {sessionMap.slice(0, 10).map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2 rounded-xl px-3 py-2"
                          style={{ background: '#1a1a1c', border: '1px solid #2e2e32' }}>
                          <span className="text-xs font-black w-5" style={{ color: '#6D6E71' }}>{i + 1}</span>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">🏆 {s.winner || '—'}</div>
                            <div className="text-xs" style={{ color: '#6D6E71' }}>{s.date}</div>
                          </div>
                          <span className="text-xs font-black px-2 py-0.5 rounded-full"
                            style={{ background: '#a855f722', color: '#c084fc', border: '1px solid #a855f744' }}>
                            {s.players} نفر
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* INSIGHTS */}
          {section === 'insights' && (
            <div className="flex flex-col gap-5 max-w-3xl mx-auto">
              <h2 className="text-lg font-black text-white">بینش‌های کلیدی</h2>

              {feedbackList.length < 3 ? (
                <div className="glass-panel rounded-2xl p-6 text-center" style={{ border: '1px solid #2e2e32' }}>
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-white font-bold">هنوز داده کافی برای ارائه این بینش وجود ندارد.</p>
                  <p className="text-sm mt-2" style={{ color: '#6D6E71' }}>بعد از ثبت چند بازخورد، بینش‌ها اینجا نمایش داده می‌شوند.</p>
                </div>
              ) : (
                <>
                  {/* Top rated games */}
                  {(() => {
                    const byGame = new Map<string, number[]>()
                    feedbackList.forEach(f => { if (!byGame.has(f.gameName)) byGame.set(f.gameName, []); byGame.get(f.gameName)!.push(f.rating) })
                    const sorted = Array.from(byGame.entries())
                      .map(([name, ratings]) => ({ name, avg: ratings.reduce((a, b) => a + b) / ratings.length, count: ratings.length }))
                      .sort((a, b) => b.avg - a.avg)
                    if (!sorted.length) return null
                    return (
                      <div className="glass-panel rounded-2xl p-4" style={{ border: '1px solid #2e2e32' }}>
                        <h3 className="font-black text-white text-sm mb-3">🏆 محبوب‌ترین بازی‌ها</h3>
                        <div className="flex flex-col gap-2">
                          {sorted.map((g, i) => (
                            <div key={g.name} className="flex items-center gap-3">
                              <span className="text-sm w-4" style={{ color: '#6D6E71' }}>{i + 1}</span>
                              <span className="flex-1 text-sm text-white">{g.name}</span>
                              <StarRow rating={Math.round(g.avg)} />
                              <span className="text-xs w-8 text-left" style={{ color: '#ffd60a' }}>{g.avg.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Replay intent summary */}
                  <div className="glass-panel rounded-2xl p-4" style={{ border: '1px solid #2e2e32' }}>
                    <h3 className="font-black text-white text-sm mb-3">🔄 تمایل به بازی مجدد</h3>
                    <ReplayBar entries={feedbackList} />
                  </div>

                  {/* Top tags */}
                  {(() => {
                    const tagCount = new Map<string, number>()
                    feedbackList.forEach(f => f.selectedTags.forEach(t => tagCount.set(t, (tagCount.get(t) ?? 0) + 1)))
                    const sorted = Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
                    if (!sorted.length) return null
                    return (
                      <div className="glass-panel rounded-2xl p-4" style={{ border: '1px solid #2e2e32' }}>
                        <h3 className="font-black text-white text-sm mb-3">💬 پرتکرارترین بازخوردها</h3>
                        <div className="flex flex-wrap gap-2">
                          {sorted.map(([tag, count]) => (
                            <span key={tag} className="px-3 py-1.5 rounded-xl text-xs font-bold"
                              style={{ background: '#CC222915', color: '#e84249', border: '1px solid #CC222933' }}>
                              {tag} <span style={{ color: '#555' }}>({count})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </>
              )}

              {/* Clear all data */}
              <div className="mt-4">
                <button onClick={() => { clearFeedback(); refreshFeedback() }}
                  className="btn-game text-xs py-2 px-4 rounded-xl"
                  style={{ border: '1px solid #2e2e32', color: '#6D6E71' }}>
                  🗑️ پاک کردن تمام بازخوردها
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
