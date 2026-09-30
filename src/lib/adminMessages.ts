// Admin messaging system — localStorage-based (no backend available)

export type MessageType =
  | 'new_game'
  | 'game_improvement'
  | 'new_feature'
  | 'game_fix'
  | 'event'
  | 'mission'
  | 'achievement'
  | 'profile'
  | 'social'
  | 'important_user_update'
  // Admin-only (isInternal = true):
  | 'system_log'
  | 'deployment'
  | 'admin_internal'

export type MessagePriority = 'low' | 'normal' | 'high' | 'critical'
export type MessageTarget = 'all' | 'active' | 'online' | 'offline'
export type MessageStatus =
  | 'draft' | 'scheduled' | 'sending' | 'sent'
  | 'partially_delivered' | 'failed' | 'cancelled' | 'blocked'

export interface AdminMessage {
  id: string
  title: string
  body: string
  bullets?: string[]         // user-friendly bullet points
  type: MessageType
  priority: MessagePriority
  target: MessageTarget
  isInternal: boolean        // true = admin-only, never shown to users
  ctaLabel?: string
  ctaLink?: string
  scheduledAt?: string
  expiresAt?: string
  status: MessageStatus
  filterWarning?: string     // set when technical content detected
  createdAt: string
  sentAt?: string
  createdBy: string
  recipientCount?: number
  deliveredCount?: number
  readCount?: number
}

export interface UserNotification {
  id: string
  messageId: string
  title: string
  body: string
  bullets?: string[]
  type: MessageType
  priority: MessagePriority
  ctaLabel?: string
  ctaLink?: string
  createdAt: string
  read: boolean
}

const MESSAGES_KEY = 'ta_admin_messages'
const NOTIFICATIONS_KEY = 'ta_user_notifications'

// ── Technical content filter ─────────────────────────────────────────────────

const TECHNICAL_KEYWORDS = [
  'git', 'github', 'commit', 'push', 'branch', 'repository', 'repo',
  'token', 'secret', 'deploy', 'deployment', 'build', 'pipeline',
  'ci', 'cd', 'actions', 'sha', 'server', 'backend', 'api', 'database',
  'cache', 'service worker', 'debug', 'stack trace', 'internal',
  'credential', 'merge', 'pull request', 'npm', 'vite', 'webpack',
  'bundle', 'dockerfile', 'kubernetes', 'infrastructure',
]

const INTERNAL_TYPES: MessageType[] = ['system_log', 'deployment', 'admin_internal']

export function detectTechnicalContent(text: string): string | null {
  const lower = text.toLowerCase()
  const found = TECHNICAL_KEYWORDS.find(k => lower.includes(k))
  if (found) return found
  return null
}

export function isUserFacingType(type: MessageType): boolean {
  return !INTERNAL_TYPES.includes(type)
}

// ── Admin: message management ────────────────────────────────────────────────

export function loadMessages(): AdminMessage[] {
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY) ?? '[]') }
  catch { return [] }
}

function saveMessages(msgs: AdminMessage[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs))
}

export function createMessage(
  msg: Omit<AdminMessage, 'id' | 'createdAt' | 'status' | 'filterWarning'>
): AdminMessage {
  // Check for technical content in user-facing messages
  let filterWarning: string | undefined
  let status: MessageStatus = 'draft'
  if (!msg.isInternal) {
    const hit = detectTechnicalContent(msg.title + ' ' + msg.body)
    if (hit) {
      filterWarning = `این پیام حاوی اطلاعات فنی («${hit}») است و برای نمایش به کاربران مناسب نیست. پیام در حالت Draft نگه داشته شد.`
      status = 'blocked'
    }
  }

  const m: AdminMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status,
    filterWarning,
  }
  const msgs = loadMessages()
  msgs.unshift(m)
  saveMessages(msgs)
  return m
}

export function updateMessage(id: string, patch: Partial<AdminMessage>): void {
  const msgs = loadMessages().map(m => m.id === id ? { ...m, ...patch } : m)
  saveMessages(msgs)
}

export function deleteMessage(id: string): void {
  saveMessages(loadMessages().filter(m => m.id !== id))
}

export function sendMessage(id: string): { ok: boolean; reason?: string } {
  const msgs = loadMessages()
  const msg = msgs.find(m => m.id === id)
  if (!msg) return { ok: false, reason: 'پیام یافت نشد' }
  if (msg.status === 'blocked') return { ok: false, reason: msg.filterWarning }
  if (msg.isInternal) return { ok: false, reason: 'پیام‌های داخلی به کاربران ارسال نمی‌شوند' }
  if (!isUserFacingType(msg.type)) return { ok: false, reason: 'این نوع پیام فقط برای ادمین است' }

  // Re-check content at send time
  const hit = detectTechnicalContent(msg.title + ' ' + msg.body + (msg.bullets || []).join(' '))
  if (hit) {
    updateMessage(id, {
      status: 'blocked',
      filterWarning: `پیام حاوی کلمه فنی «${hit}» است. قبل از ارسال ویرایش کنید.`,
    })
    return { ok: false, reason: `پیام حاوی اطلاعات فنی است («${hit}»)` }
  }

  const notification: UserNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    messageId: id,
    title: msg.title,
    body: msg.body,
    bullets: msg.bullets,
    type: msg.type,
    priority: msg.priority,
    ctaLabel: msg.ctaLabel,
    ctaLink: msg.ctaLink,
    createdAt: new Date().toISOString(),
    read: false,
  }
  const notifs = loadUserNotifications()
  notifs.unshift(notification)
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs))

  updateMessage(id, {
    status: 'sent',
    sentAt: new Date().toISOString(),
    recipientCount: 1,
    deliveredCount: 1,
  })
  return { ok: true }
}

// ── User: notification management ────────────────────────────────────────────

export function loadUserNotifications(): UserNotification[] {
  try {
    const all: UserNotification[] = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) ?? '[]')
    // Guard: never show internal/technical types to user
    return all.filter(n => isUserFacingType(n.type as MessageType))
  } catch { return [] }
}

export function markNotificationRead(id: string): void {
  const notifs = loadUserNotifications().map(n => n.id === id ? { ...n, read: true } : n)
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs))
}

export function markAllNotificationsRead(): void {
  const notifs = loadUserNotifications().map(n => ({ ...n, read: true }))
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs))
}

export function getUnreadCount(): number {
  return loadUserNotifications().filter(n => !n.read).length
}

// ── Constants ────────────────────────────────────────────────────────────────

export const USER_FACING_TYPES: MessageType[] = [
  'new_game', 'game_improvement', 'new_feature', 'game_fix',
  'event', 'mission', 'achievement', 'profile', 'social', 'important_user_update',
]

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  new_game: 'بازی جدید',
  game_improvement: 'بهبود بازی',
  new_feature: 'قابلیت جدید',
  game_fix: 'رفع مشکل',
  event: 'رویداد',
  mission: 'مأموریت',
  achievement: 'دستاورد',
  profile: 'پروفایل',
  social: 'اجتماعی',
  important_user_update: 'بروزرسانی مهم',
  system_log: 'لاگ سیستم (داخلی)',
  deployment: 'استقرار (داخلی)',
  admin_internal: 'پیام داخلی',
}

export const MESSAGE_TYPE_ICONS: Record<MessageType, string> = {
  new_game: '🎮',
  game_improvement: '✨',
  new_feature: '🚀',
  game_fix: '🔧',
  event: '🎉',
  mission: '🎯',
  achievement: '🏆',
  profile: '👤',
  social: '👥',
  important_user_update: '📢',
  system_log: '🖥️',
  deployment: '🚢',
  admin_internal: '🔒',
}

export const PRIORITY_LABELS: Record<MessagePriority, string> = {
  low: 'کم',
  normal: 'معمولی',
  high: 'بالا',
  critical: 'بحرانی',
}

export const STATUS_LABELS: Record<MessageStatus, string> = {
  draft: 'پیش‌نویس',
  scheduled: 'زمان‌بندی شده',
  sending: 'در حال ارسال',
  sent: 'ارسال شده',
  partially_delivered: 'ارسال ناقص',
  failed: 'ناموفق',
  cancelled: 'لغو شده',
  blocked: 'مسدود (محتوای فنی)',
}

export const TARGET_LABELS: Record<MessageTarget, string> = {
  all: 'همه کاربران',
  active: 'کاربران فعال',
  online: 'کاربران آنلاین',
  offline: 'کاربران آفلاین',
}
