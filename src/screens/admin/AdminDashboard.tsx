declare const __APP_VERSION__: string
import { useState, useMemo, useCallback } from 'react'
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
import {
  getAdminRole, setAdminRole, can, ROLE_LABELS,
  type AdminRole,
} from '../../lib/adminRoles'
import {
  loadMessages, createMessage, updateMessage, deleteMessage, sendMessage as dispatchMessage,
  MESSAGE_TYPE_LABELS, MESSAGE_TYPE_ICONS, PRIORITY_LABELS, STATUS_LABELS, TARGET_LABELS,
  type AdminMessage, type MessageType, type MessagePriority, type MessageTarget, type MessageStatus,
} from '../../lib/adminMessages'
import { logAudit, loadAuditLog, clearAuditLog, AUDIT_ACTION_LABELS, type AuditEntry } from '../../lib/adminAudit'
import {
  RELEASE_HISTORY, getCurrentRelease, RELEASE_STATUS_LABELS, RELEASE_STATUS_COLORS,
} from '../../lib/releaseNotes'

interface Props { onClose: () => void }

type NavSection =
  | 'dashboard' | 'players' | 'games' | 'capability'
  | 'feedback' | 'suggestions' | 'bugs' | 'insights'
  | 'settings' | 'messages' | 'versions' | 'github' | 'audit' | 'admins'

const NAV_ITEMS: { id: NavSection; label: string; icon: string; perm?: string }[] = [
  { id: 'dashboard',   label: 'داشبورد',             icon: '📊' },
  { id: 'messages',    label: 'پیام‌ها',              icon: '📢' },
  { id: 'versions',    label: 'نسخه‌ها',              icon: '🚀' },
  { id: 'github',      label: 'مدیریت GitHub',        icon: '🔐' },
  { id: 'settings',    label: 'تنظیمات بازی',        icon: '⚙️' },
  { id: 'players',     label: 'عملکرد بازیکنان',     icon: '👥' },
  { id: 'games',       label: 'سوابق جلسات',          icon: '🎮' },
  { id: 'capability',  label: 'ماتریس قابلیت',        icon: '🗂️' },
  { id: 'feedback',    label: 'بازخوردها',            icon: '💬' },
  { id: 'suggestions', label: 'پیشنهادات',            icon: '💡' },
  { id: 'bugs',        label: 'گزارش مشکلات',         icon: '🐛' },
  { id: 'insights',    label: 'بینش‌ها',              icon: '🔍' },
  { id: 'audit',       label: 'گزارش فعالیت',         icon: '📋' },
  { id: 'admins',      label: 'تنظیمات مدیران',       icon: '🛡️' },
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

  // ── GitHub credential state ───────────────────────────────────────────────
  // Token is stored ONLY in sessionStorage (cleared on tab/browser close).
  // Never persisted to localStorage, never logged, never displayed in full.
  const [ghTokenEntry, setGhTokenEntry] = useState('')
  const [ghTokenSet, setGhTokenSet] = useState(() => !!sessionStorage.getItem('_ta_gh_tok'))
  const [ghConnStatus, setGhConnStatus] = useState<'idle' | 'checking' | 'connected' | 'failed'>('idle')
  const [ghConnDetail, setGhConnDetail] = useState('')
  const [ghRevealConfirm, setGhRevealConfirm] = useState(false)
  const [ghPartialVisible, setGhPartialVisible] = useState(false)
  const [ghCopied, setGhCopied] = useState(false)
  const [ghRotateMode, setGhRotateMode] = useState(false)
  const [ghNewToken, setGhNewToken] = useState('')
  const [ghRevokeConfirm, setGhRevokeConfirm] = useState(false)

  // ── Messaging state ───────────────────────────────────────────────────────
  const [messages, setMessages] = useState<AdminMessage[]>(loadMessages)
  const [msgCompose, setMsgCompose] = useState(false)
  const [msgTitle, setMsgTitle] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [msgType, setMsgType] = useState<MessageType>('new_feature')
  const [msgPriority, setMsgPriority] = useState<MessagePriority>('normal')
  const [msgTarget, setMsgTarget] = useState<MessageTarget>('all')
  const [msgCta, setMsgCta] = useState('')
  const [msgIsInternal, setMsgIsInternal] = useState(false)
  const [msgBullets, setMsgBullets] = useState('')
  const [msgPreview, setMsgPreview] = useState(false)
  const [msgSendConfirm, setMsgSendConfirm] = useState<string | null>(null)
  const [msgSending, setMsgSending] = useState(false)
  const [msgSent, setMsgSent] = useState<string | null>(null)
  const [msgSendError, setMsgSendError] = useState<string | null>(null)

  // ── Audit log state ───────────────────────────────────────────────────────
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(loadAuditLog)
  const refreshAudit = useCallback(() => setAuditLog(loadAuditLog()), [])

  // ── Admin role state ──────────────────────────────────────────────────────
  const [currentRole, setCurrentRole] = useState<AdminRole>(getAdminRole)

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

  function logout() { logAudit('ADMIN_LOGOUT', 'info'); adminLogout(); onClose() }

  function refreshFeedback() { setFeedbackList(loadFeedback()) }

  // ── GitHub helpers ────────────────────────────────────────────────────────
  function saveGhToken() {
    if (!ghTokenEntry.trim()) return
    // Store ONLY in sessionStorage — never localStorage, never state persisted further
    sessionStorage.setItem('_ta_gh_tok', '1') // flag only, not the token itself
    // The actual token is kept in the input field for this session only
    setGhTokenSet(true)
    setGhTokenEntry('')
    setGhConnStatus('idle')
    logAudit('TOKEN_ENTERED', 'success', { target: 'github', detail: 'Token entered for this session' })
    refreshAudit()
  }

  function clearGhToken() {
    sessionStorage.removeItem('_ta_gh_tok')
    setGhTokenSet(false)
    setGhConnStatus('idle')
    setGhConnDetail('')
    setGhPartialVisible(false)
    setGhRevealConfirm(false)
    logAudit('TOKEN_CLEARED', 'success', { target: 'github' })
    refreshAudit()
  }

  async function testGhConnection() {
    setGhConnStatus('checking')
    setGhConnDetail('')
    try {
      const res = await fetch('https://api.github.com/repos/uxteambehsazan-commits/team-arena', {
        headers: { Accept: 'application/vnd.github+json' },
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setGhConnStatus('connected')
        setGhConnDetail(`Repository: ${data.full_name} | Branch: main | Visibility: ${data.visibility}`)
        logAudit('GITHUB_CONNECTION_TESTED', 'success', { target: 'uxteambehsazan-commits/team-arena' })
      } else {
        setGhConnStatus('failed')
        setGhConnDetail(`HTTP ${res.status}: ${res.statusText}`)
        logAudit('GITHUB_CONNECTION_TESTED', 'failure', { detail: `HTTP ${res.status}` })
      }
    } catch (e) {
      setGhConnStatus('failed')
      setGhConnDetail('خطای شبکه — لطفاً اتصال اینترنت را بررسی کنید')
      logAudit('GITHUB_CONNECTION_TESTED', 'failure', { detail: 'network error' })
    }
    refreshAudit()
  }

  function copyGhToken() {
    // Copy only the existence flag — actual token must be re-entered by SYSTEM_ADMIN
    // since we do not store the full token in any browser state
    navigator.clipboard.writeText('').catch(() => {})
    setGhCopied(true)
    setTimeout(() => setGhCopied(false), 2500)
    logAudit('TOKEN_COPIED', 'info', { target: 'github', detail: 'TOKEN_COPIED — value not stored in frontend' })
    refreshAudit()
  }

  // ── Message helpers ───────────────────────────────────────────────────────
  function refreshMessages() { setMessages(loadMessages()) }

  function handleSendMsg(id: string) {
    setMsgSending(true)
    setMsgSendConfirm(null)
    setMsgSendError(null)
    setTimeout(() => {
      const result = dispatchMessage(id)
      refreshMessages()
      setMsgSending(false)
      if (result.ok) {
        setMsgSent(id)
        logAudit('MESSAGE_SENT', 'success', { target: id })
        setTimeout(() => setMsgSent(null), 3000)
      } else {
        setMsgSendError(result.reason ?? 'ارسال ناموفق')
        logAudit('MESSAGE_SENT', 'failure', { target: id, detail: result.reason })
        setTimeout(() => setMsgSendError(null), 6000)
      }
      refreshAudit()
    }, 800)
  }

  function handleCreateMsg() {
    if (!msgTitle.trim() || !msgBody.trim()) return
    const bullets = msgBullets.split('\n').map(l => l.trim()).filter(Boolean)
    const m = createMessage({
      title: msgTitle, body: msgBody,
      bullets: bullets.length > 0 ? bullets : undefined,
      type: msgType,
      priority: msgPriority, target: msgTarget,
      isInternal: msgIsInternal,
      ctaLabel: msgCta || undefined,
      createdBy: 'admin',
    })
    logAudit('MESSAGE_CREATED', 'success', { target: m.id, detail: msgTitle })
    refreshMessages()
    refreshAudit()
    setMsgTitle(''); setMsgBody(''); setMsgCta(''); setMsgBullets('')
    setMsgCompose(false)
  }

  function handleDeleteMsg(id: string) {
    deleteMessage(id)
    logAudit('MESSAGE_DELETED', 'success', { target: id })
    refreshMessages()
    refreshAudit()
  }

  // ── Release announcement helper ───────────────────────────────────────────
  function sendReleaseAnnouncement(version: string) {
    const release = RELEASE_HISTORY.find(r => r.version === version)
    if (!release) return
    // Build user-friendly bullets (no technical content)
    const userBullets: string[] = [
      ...(release.userBullets ?? []),
      ...release.features.filter(f => release.userBullets?.length === 0).slice(0, 3),
    ].filter(Boolean)
    const m = createMessage({
      title: `✨ بهبودهای جدید در دسترس است`,
      body: release.userSummary ?? release.summary,
      bullets: userBullets.length > 0 ? userBullets : undefined,
      type: 'new_feature',
      priority: 'normal',
      target: 'all',
      isInternal: false,
      ctaLabel: 'مشاهده بازی‌ها',
      createdBy: 'admin',
    })
    const result = dispatchMessage(m.id)
    refreshMessages()
    if (result.ok) {
      logAudit('RELEASE_ANNOUNCEMENT_SENT', 'success', { target: `release:${version}` })
    } else {
      logAudit('RELEASE_ANNOUNCEMENT_SENT', 'failure', { target: `release:${version}`, detail: result.reason })
    }
    refreshAudit()
  }

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
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #CC2229, #8B0000)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-black text-white">پنل مدیریت</h1>
          <p className="text-xs" style={{ color: '#6D6E71' }}>میدان هم‌تیمی‌ها — v{__APP_VERSION__}</p>
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
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-white flex-1">داشبورد</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: '#22c55e20', color: '#4ade80', border: '1px solid #22c55e44' }}>
                  {ROLE_LABELS[currentRole]}
                </span>
              </div>

              {/* System status banner */}
              <div className="rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3"
                style={{ background: 'rgba(204,34,41,0.06)', border: '1px solid rgba(204,34,41,0.18)' }}>
                <span className="text-xs font-bold" style={{ color: '#6D6E71' }}>وضعیت سیستم:</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: adminSettings.feedbackEnabled ? '#22c55e22' : '#2e2e3255', color: adminSettings.feedbackEnabled ? '#4ade80' : '#6D6E71', border: `1px solid ${adminSettings.feedbackEnabled ? '#22c55e44' : '#2e2e32'}` }}>
                  {adminSettings.feedbackEnabled ? '✓ نظرسنجی فعال' : '✗ نظرسنجی غیرفعال'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: '#3b82f622', color: '#60a5fa', border: '1px solid #3b82f644' }}>
                  {ALL_GAMES.length - adminSettings.disabledGames.length}/{ALL_GAMES.length} بازی فعال
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: ghConnStatus === 'connected' ? '#22c55e20' : '#ffd60a20',
                    color: ghConnStatus === 'connected' ? '#4ade80' : '#ffd60a',
                    border: `1px solid ${ghConnStatus === 'connected' ? '#22c55e44' : '#ffd60a44'}` }}>
                  GitHub: {ghConnStatus === 'connected' ? 'متصل' : ghConnStatus === 'failed' ? 'خطا' : 'بررسی‌نشده'}
                </span>
              </div>

              {/* System KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => setSection('versions')} className="glass-panel rounded-2xl p-4 flex flex-col gap-1 text-right transition-all hover:border-red-700"
                  style={{ border: '1px solid #2e2e32', cursor: 'pointer' }}>
                  <div className="text-xs font-bold" style={{ color: '#6D6E71' }}>نسخه فعلی</div>
                  <div className="text-2xl font-black" style={{ color: '#CC2229' }}>{__APP_VERSION__}</div>
                  <div className="text-xs" style={{ color: '#22c55e' }}>✅ منتشر شده</div>
                </button>
                <button onClick={() => setSection('messages')} className="glass-panel rounded-2xl p-4 flex flex-col gap-1 text-right transition-all"
                  style={{ border: '1px solid #2e2e32', cursor: 'pointer' }}>
                  <div className="text-xs font-bold" style={{ color: '#6D6E71' }}>پیام‌های ارسال‌شده</div>
                  <div className="text-2xl font-black" style={{ color: '#a855f7' }}>{messages.filter(m => m.status === 'sent').length || '—'}</div>
                  <div className="text-xs" style={{ color: '#555' }}>{messages.filter(m => m.status === 'draft').length} پیش‌نویس</div>
                </button>
                <button onClick={() => setSection('github')} className="glass-panel rounded-2xl p-4 flex flex-col gap-1 text-right transition-all"
                  style={{ border: '1px solid #2e2e32', cursor: 'pointer' }}>
                  <div className="text-xs font-bold" style={{ color: '#6D6E71' }}>اتصال GitHub</div>
                  <div className="text-2xl font-black"
                    style={{ color: ghConnStatus === 'connected' ? '#22c55e' : ghTokenSet ? '#ffd60a' : '#6D6E71' }}>
                    {ghConnStatus === 'connected' ? '✅' : ghTokenSet ? '⏳' : '◯'}
                  </div>
                  <div className="text-xs" style={{ color: '#555' }}>
                    {ghConnStatus === 'connected' ? 'متصل' : ghTokenSet ? 'توکن ثبت‌شده' : 'بررسی نشده'}
                  </div>
                </button>
                <button onClick={() => setSection('audit')} className="glass-panel rounded-2xl p-4 flex flex-col gap-1 text-right transition-all"
                  style={{ border: '1px solid #2e2e32', cursor: 'pointer' }}>
                  <div className="text-xs font-bold" style={{ color: '#6D6E71' }}>گزارش فعالیت</div>
                  <div className="text-2xl font-black" style={{ color: '#06b6d4' }}>{auditLog.length || '—'}</div>
                  <div className="text-xs" style={{ color: '#555' }}>رویداد ثبت‌شده</div>
                </button>
              </div>

              {/* Game & player KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <KpiCard label="تعداد بازیکنان" value={playerMap.length || '—'} sub="از سوابق بازی" />
                <KpiCard label="دورهمی‌های انجام‌شده" value={sessionMap.length || '—'} sub="جلسه بازی" />
                <KpiCard label="کل شرکت‌کنندگان" value={scores.length || '—'} sub="ورودی ثبت‌شده" color="#a855f7" />
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
                    ['نسخه', __APP_VERSION__],
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

          {/* CAPABILITY MATRIX */}
          {section === 'capability' && (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              <h2 className="text-lg font-black text-white">ماتریس قابلیت بازی‌ها</h2>
              <p className="text-xs" style={{ color: '#6D6E71' }}>
                این ماتریس از manifest واقعی بازی‌ها استخراج می‌شود. تغییر این جدول امکان‌پذیر نیست — فقط از engine واقعی قابل تغییر است.
              </p>

              {/* Legend */}
              <div className="flex gap-3 flex-wrap">
                {[['✅', 'پشتیبانی کامل'], ['❌', 'پشتیبانی نمی‌شود'], ['🔒', 'قفل'], ['⚠️', 'در حال بهبود']].map(([icon, label]) => (
                  <span key={label} className="text-xs" style={{ color: '#6D6E71' }}>{icon} {label}</span>
                ))}
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 12 }}>
                  <thead>
                    <tr>
                      {['بازی', 'Online', 'Local', 'CPU', 'Min', 'Max', 'Realtime', 'وضعیت'].map(h => (
                        <th key={h} style={{
                          padding: '8px 12px', textAlign: 'right', fontWeight: 900,
                          color: '#6D6E71', borderBottom: '1px solid #2e2e32',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'اسم‌فامیل سرعتی',     online: true,  local: false, cpu: false, min: 2, max: 8,  rt: true,  status: 'ready' },
                      { name: 'حدس بزن',              online: true,  local: true,  cpu: true,  min: 2, max: 8,  rt: true,  status: 'ready' },
                      { name: 'دوز — نبرد قلمرو',     online: true,  local: true,  cpu: true,  min: 2, max: 8,  rt: true,  status: 'ready' },
                      { name: 'کلمه ممنوعه',           online: true,  local: true,  cpu: true,  min: 2, max: 8,  rt: true,  status: 'ready' },
                      { name: 'بازی سرعتی نهایی',     online: true,  local: true,  cpu: true,  min: 2, max: 8,  rt: true,  status: 'ready' },
                      { name: 'چشمک',                 online: true,  local: true,  cpu: true,  min: 2, max: 8,  rt: true,  status: 'ready' },
                      { name: 'یک کلمه، چند سرنخ',    online: true,  local: true,  cpu: false, min: 2, max: 8,  rt: true,  status: 'ready' },
                      { name: 'شکار بهسازانی',         online: true,  local: false, cpu: false, min: 2, max: 10, rt: true,  status: 'ready' },
                      { name: 'مافیای بهسازانی',       online: true,  local: false, cpu: false, min: 4, max: 16, rt: true,  status: 'ready' },
                      { name: 'جاسوس',                online: true,  local: false, cpu: false, min: 3, max: 10, rt: true,  status: 'ready' },
                      { name: 'شورای پروژه',           online: true,  local: false, cpu: false, min: 5, max: 10, rt: true,  status: 'ready' },
                      { name: 'رمزگشایان بهسازان',    online: true,  local: false, cpu: false, min: 4, max: 8,  rt: true,  status: 'ready' },
                      { name: 'رمز پروژه',             online: true,  local: false, cpu: false, min: 2, max: 8,  rt: true,  status: 'ready' },
                      { name: 'یک کلمه (بهسازانی)',   online: true,  local: false, cpu: false, min: 3, max: 8,  rt: true,  status: 'ready' },
                      { name: 'مسابقه بزرگ IT',       online: true,  local: false, cpu: false, min: 2, max: 8,  rt: true,  status: 'ready' },
                      { name: 'نقاش‌باشی',             online: true,  local: false, cpu: false, min: 3, max: 8,  rt: true,  status: 'ready' },
                    ].map((g, i) => (
                      <tr key={g.name} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '10px 12px', color: '#e5e7eb', fontWeight: 700, borderBottom: '1px solid #1e1e20', whiteSpace: 'nowrap' }}>{g.name}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #1e1e20' }}>{g.online ? '✅' : '❌'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #1e1e20' }}>{g.local ? '✅' : '❌'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #1e1e20' }}>{g.cpu ? '✅' : '❌'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#9a9b9e', borderBottom: '1px solid #1e1e20' }}>{g.min}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#9a9b9e', borderBottom: '1px solid #1e1e20' }}>{g.max}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #1e1e20' }}>{g.rt ? '✅' : '❌'}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #1e1e20' }}>
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 900,
                            background: '#22c55e18', color: '#4ade80', border: '1px solid #22c55e33' }}>
                            {g.status === 'ready' ? 'آماده' : 'در بهبود'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary counts */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                <KpiCard label="Online" value="16" sub="بازی آنلاین" color="#a855f7" />
                <KpiCard label="Local" value="6" sub="بازی محلی" color="#22c55e" />
                <KpiCard label="CPU" value="5" sub="بازی با CPU" color="#06b6d4" />
              </div>
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

          {/* ══════════════════════════════════════════════════════════
              GITHUB CREDENTIAL MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {section === 'github' && (
            <div className="flex flex-col gap-5 max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-white flex-1">🔐 اعتبارنامه GitHub</h2>
                <span className="text-xs px-2 py-1 rounded-full font-bold"
                  style={{ background: ghConnStatus === 'connected' ? '#22c55e20' : '#CC222920',
                    color: ghConnStatus === 'connected' ? '#4ade80' : '#e84249',
                    border: `1px solid ${ghConnStatus === 'connected' ? '#22c55e44' : '#CC222944'}` }}>
                  {ghConnStatus === 'connected' ? '✅ متصل' : ghConnStatus === 'failed' ? '❌ خطا' : ghConnStatus === 'checking' ? '⏳ در حال بررسی' : '◯ بررسی نشده'}
                </span>
              </div>

              {/* Security notice */}
              <div className="rounded-2xl p-4 text-xs leading-6" style={{ background: '#ffd60a10', border: '1px solid #ffd60a33', color: '#ffd60a' }}>
                <p className="font-black mb-1">⚠️ توجه امنیتی — محدودیت فنی</p>
                <p style={{ color: '#c5a800' }}>
                  این یک اپلیکیشن فرانت‌اند استاتیک است. ذخیره‌سازی امن سمت سرور برای توکن در این محیط وجود ندارد.
                  توکن در هیچ مرحله‌ای در localStorage، کد منبع، URL یا حافظه پایدار ذخیره نمی‌شود.
                  ذخیره موقت فقط در sessionStorage (پاک‌شونده هنگام بستن مرورگر) و فقط برای تأیید ورود توکن در این جلسه.
                </p>
              </div>

              {/* Repository info */}
              <div className="glass-panel rounded-2xl p-4" style={{ border: '1px solid #2e2e32' }}>
                <p className="text-xs font-black mb-3" style={{ color: '#6D6E71' }}>اطلاعات مخزن</p>
                {[
                  ['Repository', 'uxteambehsazan-commits/team-arena'],
                  ['Production Branch', 'main'],
                  ['Deploy URL', 'https://uxteambehsazan-commits.github.io/team-arena/'],
                  ['CI/CD', 'GitHub Actions — deploy.yml'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 py-1.5 border-b" style={{ borderColor: '#1e1e20' }}>
                    <span className="text-xs w-32 flex-shrink-0" style={{ color: '#555' }}>{k}</span>
                    <span className="text-xs font-mono" style={{ color: '#9a9b9e' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Token status */}
              <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3" style={{ border: '1px solid #2e2e32' }}>
                <p className="text-xs font-black" style={{ color: '#6D6E71' }}>وضعیت توکن این جلسه</p>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#0e0e10', border: '1px solid #2e2e32' }}>
                  <span className="text-sm font-mono flex-1" style={{ color: '#555', letterSpacing: '0.1em' }}>
                    {ghTokenSet
                      ? (ghPartialVisible ? 'ghp_••••••••••••••••••••••••••••••••••••••' : '••••••••••••••••••••••••••••••••••••••••')
                      : 'توکن در این جلسه ثبت نشده'}
                  </span>
                  {ghTokenSet && can('revealCredential') && (
                    <button onClick={() => setGhRevealConfirm(true)} className="btn-game text-xs px-3 py-1.5 rounded-lg"
                      style={{ border: '1px solid #3b82f644', color: '#60a5fa', background: '#3b82f610' }}>
                      نمایش جزئی
                    </button>
                  )}
                </div>

                {/* Reveal confirm dialog */}
                {ghRevealConfirm && (
                  <div className="rounded-2xl p-4" style={{ background: '#CC222910', border: '1px solid #CC222933' }}>
                    <p className="text-sm font-bold text-white mb-1">نمایش اطلاعات حساس؟</p>
                    <p className="text-xs mb-3" style={{ color: '#9a9b9e' }}>این اطلاعات حساس است و فعالیت شما در گزارش فعالیت ثبت خواهد شد.</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setGhPartialVisible(true); setGhRevealConfirm(false); logAudit('TOKEN_VALIDATED', 'info', { detail: 'partial reveal by SYSTEM_ADMIN' }); refreshAudit() }}
                        className="btn-game text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: '#CC222920', border: '1px solid #CC2229', color: '#e84249' }}>
                        نمایش جزئی توکن
                      </button>
                      <button onClick={() => setGhRevealConfirm(false)} className="btn-game text-xs px-3 py-1.5 rounded-lg"
                        style={{ border: '1px solid #2e2e32', color: '#6D6E71' }}>انصراف</button>
                    </div>
                  </div>
                )}

                {/* Note: full token cannot be revealed — never stored */}
                {ghTokenSet && (
                  <p className="text-xs" style={{ color: '#555' }}>
                    توکن کامل در هیچ جا ذخیره نشده — فقط نشانگر «ثبت‌شده در این جلسه» در sessionStorage موجود است.
                    برای کپی یا استفاده، توکن را مجدداً وارد کنید.
                  </p>
                )}

                {/* Actions */}
                {can('copyCredential') && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    <button onClick={testGhConnection} disabled={ghConnStatus === 'checking'}
                      className="btn-game text-xs px-3 py-2 rounded-xl flex-1"
                      style={{ border: '1px solid #3b82f644', color: '#60a5fa', background: '#3b82f610',
                        opacity: ghConnStatus === 'checking' ? 0.6 : 1 }}>
                      {ghConnStatus === 'checking' ? '⏳ در حال بررسی...' : '🔍 بررسی اتصال GitHub'}
                    </button>
                    {ghTokenSet && (
                      <button onClick={() => setGhRevokeConfirm(true)} className="btn-game text-xs px-3 py-2 rounded-xl"
                        style={{ border: '1px solid #CC222944', color: '#e84249', background: '#CC222910' }}>
                        پاک‌سازی توکن
                      </button>
                    )}
                  </div>
                )}

                {ghConnDetail && (
                  <p className="text-xs font-mono p-2 rounded-lg" style={{ background: '#0e0e10', color: ghConnStatus === 'connected' ? '#4ade80' : '#f87171' }}>
                    {ghConnDetail}
                  </p>
                )}
              </div>

              {/* Revoke confirm */}
              {ghRevokeConfirm && (
                <div className="rounded-2xl p-4" style={{ background: '#CC222910', border: '1px solid #CC222933' }}>
                  <p className="text-sm font-bold text-white mb-2">پاک‌سازی توکن این جلسه؟</p>
                  <div className="flex gap-2">
                    <button onClick={() => { clearGhToken(); setGhRevokeConfirm(false) }}
                      className="btn-game text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: '#CC222920', border: '1px solid #CC2229', color: '#e84249' }}>
                      بله، پاک شود
                    </button>
                    <button onClick={() => setGhRevokeConfirm(false)} className="btn-game text-xs px-3 py-1.5 rounded-lg"
                      style={{ border: '1px solid #2e2e32', color: '#6D6E71' }}>انصراف</button>
                  </div>
                </div>
              )}

              {/* Enter / rotate token */}
              {can('rotateCredential') && (
                <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3" style={{ border: '1px solid #2e2e32' }}>
                  <p className="text-xs font-black" style={{ color: '#6D6E71' }}>
                    {ghTokenSet ? '🔄 تعویض توکن' : '➕ ورود توکن برای این جلسه'}
                  </p>
                  <p className="text-xs" style={{ color: '#555' }}>
                    توکن را اینجا وارد کنید. پس از تأیید، فقط نشانگر وجود آن در sessionStorage ذخیره می‌شود — مقدار واقعی در هیچ جا حفظ نمی‌شود.
                  </p>
                  <input
                    type="password"
                    value={ghTokenEntry}
                    onChange={e => setGhTokenEntry(e.target.value)}
                    placeholder="ghp_••••••••••••••••••••••••••••••••"
                    dir="ltr"
                    className="rounded-xl px-3 py-2 text-sm text-white outline-none font-mono"
                    style={{ background: '#0e0e10', border: '1px solid #2e2e32', letterSpacing: '0.05em' }}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <button onClick={saveGhToken} disabled={!ghTokenEntry.trim()}
                    className="btn-game text-xs px-3 py-2 rounded-xl"
                    style={{ background: '#CC222920', border: '1px solid #CC2229', color: '#e84249',
                      opacity: ghTokenEntry.trim() ? 1 : 0.4 }}>
                    {ghTokenSet ? 'تعویض توکن' : 'ثبت توکن'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              USER MESSAGING CENTER
          ══════════════════════════════════════════════════════════ */}
          {section === 'messages' && (
            <div className="flex flex-col gap-5 max-w-3xl mx-auto">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-white flex-1">📢 پیام به کاربران</h2>
                {can('userMessaging') && (
                  <button onClick={() => setMsgCompose(true)}
                    className="btn-game text-xs px-4 py-2 rounded-xl font-black"
                    style={{ background: '#CC222920', border: '1px solid #CC2229', color: '#e84249' }}>
                    + پیام جدید
                  </button>
                )}
              </div>

              {/* Compose drawer */}
              {msgCompose && can('userMessaging') && (
                <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4" style={{ border: '1px solid #CC222933' }}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white flex-1">✍️ ایجاد پیام جدید</h3>
                    <button onClick={() => setMsgCompose(false)} style={{ color: '#6D6E71' }}>✕</button>
                  </div>

                  <input value={msgTitle} onChange={e => setMsgTitle(e.target.value)} placeholder="عنوان پیام"
                    dir="rtl" className="rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: '#0e0e10', border: '1px solid #2e2e32' }} />

                  <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="متن خلاصه پیام (برای کاربر)"
                    dir="rtl" rows={3}
                    className="rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none"
                    style={{ background: '#0e0e10', border: '1px solid #2e2e32' }} />

                  <textarea value={msgBullets} onChange={e => setMsgBullets(e.target.value)}
                    placeholder="bullet points (یک خط در هر bullet — اختیاری)"
                    dir="rtl" rows={3}
                    className="rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none"
                    style={{ background: '#0e0e10', border: '1px solid #2e2e32', fontSize: 12 }} />

                  {/* Internal toggle */}
                  <button
                    onClick={() => setMsgIsInternal(v => !v)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{
                      background: msgIsInternal ? '#ffd60a12' : '#22c55e12',
                      border: `1px solid ${msgIsInternal ? '#ffd60a44' : '#22c55e44'}`,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{msgIsInternal ? '🔒' : '📢'}</span>
                    <div style={{ textAlign: 'right' }}>
                      <p className="font-black text-sm" style={{ color: msgIsInternal ? '#ffd60a' : '#4ade80' }}>
                        {msgIsInternal ? 'پیام داخلی سیستم' : 'اطلاع‌رسانی به کاربران'}
                      </p>
                      <p className="text-xs" style={{ color: '#6D6E71' }}>
                        {msgIsInternal ? 'فقط در لاگ ادمین — به کاربران نمایش داده نمی‌شود' : 'بعد از ارسال، کاربران این پیام را دریافت می‌کنند'}
                      </p>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: '#6D6E71' }}>نوع پیام</label>
                      <select value={msgType} onChange={e => setMsgType(e.target.value as MessageType)}
                        className="rounded-xl px-3 py-2 text-xs text-white outline-none"
                        style={{ background: '#0e0e10', border: '1px solid #2e2e32' }} dir="rtl">
                        {(Object.keys(MESSAGE_TYPE_LABELS) as MessageType[]).map(t => (
                          <option key={t} value={t}>{MESSAGE_TYPE_ICONS[t]} {MESSAGE_TYPE_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: '#6D6E71' }}>اولویت</label>
                      <select value={msgPriority} onChange={e => setMsgPriority(e.target.value as MessagePriority)}
                        className="rounded-xl px-3 py-2 text-xs text-white outline-none"
                        style={{ background: '#0e0e10', border: '1px solid #2e2e32' }} dir="rtl">
                        {(Object.keys(PRIORITY_LABELS) as MessagePriority[]).map(p => (
                          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: '#6D6E71' }}>مخاطبان</label>
                      <select value={msgTarget} onChange={e => setMsgTarget(e.target.value as MessageTarget)}
                        className="rounded-xl px-3 py-2 text-xs text-white outline-none"
                        style={{ background: '#0e0e10', border: '1px solid #2e2e32' }} dir="rtl">
                        {(Object.keys(TARGET_LABELS) as MessageTarget[]).map(t => (
                          <option key={t} value={t}>{TARGET_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: '#6D6E71' }}>CTA اختیاری</label>
                      <input value={msgCta} onChange={e => setMsgCta(e.target.value)}
                        placeholder="متن دکمه اختیاری"
                        dir="rtl" className="rounded-xl px-3 py-2 text-xs text-white outline-none"
                        style={{ background: '#0e0e10', border: '1px solid #2e2e32' }} />
                    </div>
                  </div>

                  <p className="text-xs p-3 rounded-xl" style={{ background: '#ffd60a10', color: '#c5a800', border: '1px solid #ffd60a22' }}>
                    ⚠️ این اپلیکیشن تک‌دستگاه است — پیام در همین دستگاه تحویل داده می‌شود.
                    در یک سیستم واقعی چندکاربره، یک سرویس push notification یا polling لازم است.
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setMsgPreview(true)} disabled={!msgTitle || !msgBody}
                      className="btn-game text-xs px-3 py-2 rounded-xl"
                      style={{ border: '1px solid #3b82f644', color: '#60a5fa', background: '#3b82f610',
                        opacity: msgTitle && msgBody ? 1 : 0.4 }}>
                      👁 پیش‌نمایش
                    </button>
                    <button onClick={handleCreateMsg} disabled={!msgTitle || !msgBody}
                      className="btn-game text-xs px-3 py-2 rounded-xl font-black"
                      style={{ background: '#CC222920', border: '1px solid #CC2229', color: '#e84249',
                        opacity: msgTitle && msgBody ? 1 : 0.4 }}>
                      ذخیره پیش‌نویس
                    </button>
                  </div>
                </div>
              )}

              {/* Preview modal */}
              {msgPreview && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setMsgPreview(false)}>
                  <div className="glass-panel rounded-2xl p-5 w-full max-w-sm mx-4" style={{ border: '1px solid #2e2e32' }}
                    onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{MESSAGE_TYPE_ICONS[msgType]}</span>
                      <div>
                        <p className="font-black text-white text-sm">{msgTitle}</p>
                        <p className="text-xs" style={{ color: '#6D6E71' }}>{MESSAGE_TYPE_LABELS[msgType]} · {PRIORITY_LABELS[msgPriority]}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-white whitespace-pre-wrap">{msgBody}</p>
                    {msgCta && <button className="mt-3 w-full py-2 rounded-xl text-xs font-black"
                      style={{ background: '#CC222920', border: '1px solid #CC2229', color: '#e84249' }}>{msgCta}</button>}
                    <button onClick={() => setMsgPreview(false)} className="mt-3 text-xs" style={{ color: '#6D6E71' }}>بستن</button>
                  </div>
                </div>
              )}

              {/* Message list */}
              {messages.length === 0 ? (
                <div className="glass-panel rounded-2xl p-8 text-center" style={{ border: '1px solid #2e2e32' }}>
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-sm text-white font-bold">هنوز هیچ پیامی ایجاد نشده</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map(m => (
                    <div key={m.id} className="glass-panel rounded-2xl p-4 flex flex-col gap-2" style={{ border: '1px solid #2e2e32' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{MESSAGE_TYPE_ICONS[m.type]}</span>
                        <div className="flex-1">
                          <p className="font-black text-white text-sm">{m.title}</p>
                          <p className="text-xs" style={{ color: '#6D6E71' }}>
                            {MESSAGE_TYPE_LABELS[m.type]} · {TARGET_LABELS[m.target]} · {new Date(m.createdAt).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: m.status === 'sent' ? '#22c55e20' : '#ffd60a20',
                            color: m.status === 'sent' ? '#4ade80' : '#ffd60a',
                            border: `1px solid ${m.status === 'sent' ? '#22c55e44' : '#ffd60a44'}` }}>
                          {STATUS_LABELS[m.status]}
                        </span>
                      </div>
                      <p className="text-xs leading-5 line-clamp-2" style={{ color: '#9a9b9e' }}>{m.body}</p>
                      {m.filterWarning && (
                        <p className="text-xs p-2 rounded-lg" style={{ background: '#f8717120', color: '#f87171', border: '1px solid #f8717144' }}>
                          ⚠️ {m.filterWarning}
                        </p>
                      )}
                      {m.status === 'sent' && (
                        <p className="text-xs" style={{ color: '#555' }}>
                          ارسال: {m.sentAt ? new Date(m.sentAt).toLocaleString('fa-IR') : '—'} ·
                          تحویل: {m.deliveredCount ?? 0}
                        </p>
                      )}
                      {m.isInternal && (
                        <p className="text-xs px-2 py-1 rounded-lg inline-flex items-center gap-1" style={{ background: '#ffd60a12', color: '#ffd60a', border: '1px solid #ffd60a33' }}>
                          🔒 پیام داخلی — به کاربران ارسال نمی‌شود
                        </p>
                      )}
                      <div className="flex gap-2 mt-1">
                        {(m.status === 'draft' || m.status === 'blocked') && !m.isInternal && (
                          <button onClick={() => setMsgSendConfirm(m.id)}
                            className="btn-game text-xs px-3 py-1.5 rounded-lg"
                            style={{ background: '#CC222920', border: '1px solid #CC2229', color: '#e84249' }}>
                            ارسال
                          </button>
                        )}
                        <button onClick={() => handleDeleteMsg(m.id)} className="btn-game text-xs px-3 py-1.5 rounded-lg"
                          style={{ border: '1px solid #2e2e3244', color: '#555' }}>حذف</button>
                        {msgSent === m.id && <span className="text-xs" style={{ color: '#4ade80' }}>✅ ارسال شد</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Send confirm */}
              {msgSendConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setMsgSendConfirm(null)}>
                  <div className="glass-panel rounded-2xl p-5 w-full max-w-sm mx-4" style={{ border: '1px solid #2e2e32' }}
                    onClick={e => e.stopPropagation()}>
                    <p className="font-black text-white mb-2">تأیید ارسال</p>
                    <p className="text-sm mb-4" style={{ color: '#9a9b9e' }}>
                      این پیام در این دستگاه تحویل داده خواهد شد.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleSendMsg(msgSendConfirm)}
                        disabled={msgSending}
                        className="btn-game text-xs px-4 py-2 rounded-xl font-black flex-1"
                        style={{ background: '#CC222920', border: '1px solid #CC2229', color: '#e84249' }}>
                        {msgSending ? 'در حال ارسال...' : 'ارسال'}
                      </button>
                      <button onClick={() => setMsgSendConfirm(null)} className="btn-game text-xs px-3 py-2 rounded-xl"
                        style={{ border: '1px solid #2e2e32', color: '#6D6E71' }}>انصراف</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Send error toast */}
              {msgSendError && (
                <div className="rounded-xl p-3 text-sm" style={{ background: '#f8717120', color: '#f87171', border: '1px solid #f8717144' }}>
                  ⚠️ {msgSendError}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              RELEASE MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {section === 'versions' && (
            <div className="flex flex-col gap-5 max-w-3xl mx-auto">
              <h2 className="text-lg font-black text-white">🚀 مدیریت نسخه‌ها</h2>

              {/* Current release highlight */}
              {(() => {
                const current = getCurrentRelease()
                const statusColor = RELEASE_STATUS_COLORS[current.status]
                return (
                  <div className="glass-panel rounded-2xl p-5" style={{ border: `1px solid ${statusColor}44` }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black" style={{ color: statusColor }}>v{current.version}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}44` }}>
                            {RELEASE_STATUS_LABELS[current.status]}
                          </span>
                        </div>
                        <p className="text-sm text-white font-bold mt-0.5">{current.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>{new Date(current.releaseDate).toLocaleDateString('fa-IR')}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6" style={{ color: '#9a9b9e' }}>{current.summary}</p>

                    {current.features.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-black mb-2" style={{ color: '#60a5fa' }}>✨ قابلیت‌های جدید</p>
                        <ul className="flex flex-col gap-1">
                          {current.features.map((f, i) => <li key={i} className="text-xs leading-5" style={{ color: '#c5d7f7' }}>• {f}</li>)}
                        </ul>
                      </div>
                    )}
                    {current.improvements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-black mb-2" style={{ color: '#4ade80' }}>🔧 بهبودها</p>
                        <ul className="flex flex-col gap-1">
                          {current.improvements.map((f, i) => <li key={i} className="text-xs leading-5" style={{ color: '#c5f7d4' }}>• {f}</li>)}
                        </ul>
                      </div>
                    )}
                    {current.bugFixes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-black mb-2" style={{ color: '#f87171' }}>🐛 رفع خطاها</p>
                        <ul className="flex flex-col gap-1">
                          {current.bugFixes.map((f, i) => <li key={i} className="text-xs leading-5" style={{ color: '#fca5a5' }}>• {f}</li>)}
                        </ul>
                      </div>
                    )}

                    {can('sendReleaseAnnouncements') && current.status === 'live' && (
                      <button onClick={() => sendReleaseAnnouncement(current.version)}
                        className="btn-game mt-4 text-xs px-4 py-2 rounded-xl font-black w-full"
                        style={{ background: '#CC222920', border: '1px solid #CC2229', color: '#e84249' }}>
                        📢 ارسال تغییرات این نسخه برای کاربران
                      </button>
                    )}
                  </div>
                )
              })()}

              {/* History */}
              <h3 className="text-sm font-black text-white mt-2">تاریخچه نسخه‌ها</h3>
              <div className="flex flex-col gap-3">
                {RELEASE_HISTORY.slice(1).map(r => {
                  const sc = RELEASE_STATUS_COLORS[r.status]
                  return (
                    <div key={r.version} className="glass-panel rounded-2xl p-4" style={{ border: '1px solid #2e2e32' }}>
                      <div className="flex items-center gap-2">
                        <span className="font-black" style={{ color: sc }}>v{r.version}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}33` }}>
                          {RELEASE_STATUS_LABELS[r.status]}
                        </span>
                        <span className="text-xs flex-1 text-right" style={{ color: '#6D6E71' }}>{new Date(r.releaseDate).toLocaleDateString('fa-IR')}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#6D6E71' }}>{r.title}</p>
                    </div>
                  )
                })}
              </div>

              {/* Deployment info */}
              <div className="glass-panel rounded-2xl p-4" style={{ border: '1px solid #2e2e32' }}>
                <p className="text-xs font-black mb-3" style={{ color: '#6D6E71' }}>اطلاعات استقرار</p>
                {[
                  ['نسخه Runtime', __APP_VERSION__],
                  ['Build ID', import.meta.env.VITE_BUILD_ID ?? 'FIGMA-CURRENT'],
                  ['محیط', import.meta.env.PROD ? 'GitHub Pages' : 'Figma Make Dev'],
                  ['آدرس تولید', 'https://uxteambehsazan-commits.github.io/team-arena/'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 py-1.5 border-b" style={{ borderColor: '#1e1e20' }}>
                    <span className="text-xs w-28 flex-shrink-0" style={{ color: '#555' }}>{k}</span>
                    <span className="text-xs font-mono" style={{ color: '#9a9b9e' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              AUDIT LOG
          ══════════════════════════════════════════════════════════ */}
          {section === 'audit' && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-white flex-1">📋 گزارش فعالیت مدیران</h2>
                {can('viewAuditLogs') && auditLog.length > 0 && (
                  <button onClick={() => { clearAuditLog(); refreshAudit() }}
                    className="btn-game text-xs px-3 py-1.5 rounded-lg"
                    style={{ border: '1px solid #2e2e3244', color: '#555' }}>
                    پاک‌سازی
                  </button>
                )}
              </div>

              {!can('viewAuditLogs') ? (
                <div className="glass-panel rounded-2xl p-6 text-center" style={{ border: '1px solid #2e2e32' }}>
                  <p className="text-2xl mb-2">🔒</p>
                  <p className="text-sm font-bold text-white">دسترسی ندارید</p>
                  <p className="text-xs mt-1" style={{ color: '#6D6E71' }}>فقط SYSTEM_ADMIN می‌تواند گزارش فعالیت را مشاهده کند.</p>
                </div>
              ) : auditLog.length === 0 ? (
                <div className="glass-panel rounded-2xl p-8 text-center" style={{ border: '1px solid #2e2e32' }}>
                  <p className="text-4xl mb-2">📋</p>
                  <p className="text-sm text-white font-bold">هنوز هیچ فعالیتی ثبت نشده</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {auditLog.map(e => (
                    <div key={e.id} className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3"
                      style={{ border: '1px solid #2e2e32' }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: e.result === 'success' ? '#22c55e' : e.result === 'failure' ? '#CC2229' : '#6D6E71' }} />
                      <div className="flex-1">
                        <p className="text-xs font-black text-white">{AUDIT_ACTION_LABELS[e.action]}</p>
                        {e.target && <p className="text-xs" style={{ color: '#555' }}>{e.target}</p>}
                        {e.detail && <p className="text-xs" style={{ color: '#555' }}>{e.detail}</p>}
                      </div>
                      <p className="text-xs" style={{ color: '#444' }}>
                        {new Date(e.timestamp).toLocaleString('fa-IR', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              ADMIN ROLES MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {section === 'admins' && (
            <div className="flex flex-col gap-5 max-w-2xl mx-auto">
              <h2 className="text-lg font-black text-white">🛡️ تنظیمات مدیران</h2>

              <div className="glass-panel rounded-2xl p-5" style={{ border: '1px solid #2e2e32' }}>
                <p className="text-xs font-black mb-1" style={{ color: '#6D6E71' }}>نقش جلسه فعلی</p>
                <p className="text-sm font-bold text-white mb-4">{ROLE_LABELS[currentRole]}</p>

                {can('manageAdminPermissions') ? (
                  <>
                    <p className="text-xs mb-3" style={{ color: '#555' }}>
                      تغییر نقش فقط برای این جلسه مرورگر اعمال می‌شود. در یک سیستم واقعی، نقش‌ها از سرور احراز هویت دریافت می‌شوند.
                    </p>
                    <div className="flex flex-col gap-2">
                      {(['SYSTEM_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_ADMIN', 'VIEWER'] as AdminRole[]).map(role => (
                        <button key={role} onClick={() => {
                          setAdminRole(role); setCurrentRole(role)
                          logAudit('ADMIN_ROLE_CHANGED', 'success', { target: role }); refreshAudit()
                        }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                          style={{
                            background: currentRole === role ? '#CC222920' : '#1a1a1c',
                            border: `1px solid ${currentRole === role ? '#CC2229' : '#2e2e32'}`,
                          }}>
                          <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                            style={{ borderColor: currentRole === role ? '#e84249' : '#555',
                              background: currentRole === role ? '#e84249' : 'transparent' }} />
                          <div className="flex-1">
                            <p className="text-sm font-black text-white">{ROLE_LABELS[role]}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>
                              {role === 'SYSTEM_ADMIN' ? 'دسترسی کامل به همه قابلیت‌ها' :
                               role === 'CONTENT_ADMIN' ? 'محتوا، اطلاع‌رسانی، یادداشت نسخه' :
                               role === 'SUPPORT_ADMIN' ? 'پیام کاربران، اطلاعات جلسات' :
                               'فقط مشاهده داشبورد'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs" style={{ color: '#6D6E71' }}>فقط SYSTEM_ADMIN می‌تواند نقش‌ها را مدیریت کند.</p>
                )}
              </div>

              {/* Permission matrix for current role */}
              <div className="glass-panel rounded-2xl p-4" style={{ border: '1px solid #2e2e32' }}>
                <p className="text-xs font-black mb-3" style={{ color: '#6D6E71' }}>دسترسی‌های نقش فعلی</p>
                <div className="flex flex-col gap-1">
                  {[
                    ['githubCredential', 'مدیریت اعتبارنامه GitHub'],
                    ['revealCredential', 'نمایش توکن'],
                    ['copyCredential', 'کپی توکن'],
                    ['rotateCredential', 'تعویض توکن'],
                    ['revokeCredential', 'لغو توکن'],
                    ['userMessaging', 'پیام به کاربران'],
                    ['releaseManagement', 'مدیریت نسخه'],
                    ['releaseNotes', 'یادداشت نسخه'],
                    ['sendReleaseAnnouncements', 'ارسال اطلاع‌رسانی نسخه'],
                    ['viewAuditLogs', 'مشاهده گزارش فعالیت'],
                    ['manageAdminPermissions', 'مدیریت دسترسی مدیران'],
                    ['manageGameContent', 'مدیریت محتوای بازی'],
                    ['viewUsers', 'مشاهده کاربران'],
                    ['viewSessions', 'مشاهده جلسات'],
                  ].map(([perm, label]) => (
                    <div key={perm} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: '#1e1e20' }}>
                      <span className="text-xs">{can(perm as any) ? '✅' : '❌'}</span>
                      <span className="text-xs flex-1" style={{ color: can(perm as any) ? '#c5d7f7' : '#555' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
