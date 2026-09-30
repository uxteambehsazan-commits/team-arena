// Admin messaging system — localStorage-based (no backend available)
// Messages are stored locally; in a production system these would go through a real push service.

export type MessageType =
  | 'info'
  | 'version_update'
  | 'maintenance'
  | 'event'
  | 'new_game'
  | 'disruption'
  | 'general'

export type MessagePriority = 'low' | 'normal' | 'high' | 'critical'

export type MessageTarget =
  | 'all'
  | 'active'
  | 'online'
  | 'offline'

export type MessageStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'partially_delivered'
  | 'failed'
  | 'cancelled'

export interface AdminMessage {
  id: string
  title: string
  body: string
  type: MessageType
  priority: MessagePriority
  target: MessageTarget
  ctaLabel?: string
  ctaLink?: string
  scheduledAt?: string   // ISO date or undefined for immediate
  expiresAt?: string
  status: MessageStatus
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
  type: MessageType
  priority: MessagePriority
  ctaLabel?: string
  ctaLink?: string
  createdAt: string
  read: boolean
}

const MESSAGES_KEY = 'ta_admin_messages'
const NOTIFICATIONS_KEY = 'ta_user_notifications'

// ── Admin: message management ────────────────────────────────────────────────

export function loadMessages(): AdminMessage[] {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) ?? '[]')
  } catch { return [] }
}

function saveMessages(msgs: AdminMessage[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs))
}

export function createMessage(msg: Omit<AdminMessage, 'id' | 'createdAt' | 'status'>): AdminMessage {
  const m: AdminMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'draft',
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

export function sendMessage(id: string): void {
  const msgs = loadMessages()
  const msg = msgs.find(m => m.id === id)
  if (!msg) return

  // Deliver to user notification queue
  const notification: UserNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    messageId: id,
    title: msg.title,
    body: msg.body,
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

  // Update message status
  updateMessage(id, {
    status: 'sent',
    sentAt: new Date().toISOString(),
    recipientCount: 1, // local only — single-device
    deliveredCount: 1,
  })
}

// ── User: notification management ────────────────────────────────────────────

export function loadUserNotifications(): UserNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) ?? '[]')
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

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  info: 'اطلاع‌رسانی',
  version_update: 'به‌روزرسانی نسخه',
  maintenance: 'نگهداری سیستم',
  event: 'رویداد',
  new_game: 'بازی جدید',
  disruption: 'اختلال',
  general: 'پیام عمومی',
}

export const MESSAGE_TYPE_ICONS: Record<MessageType, string> = {
  info: 'ℹ️',
  version_update: '🚀',
  maintenance: '🔧',
  event: '🎉',
  new_game: '🎮',
  disruption: '⚠️',
  general: '📢',
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
}

export const TARGET_LABELS: Record<MessageTarget, string> = {
  all: 'همه کاربران',
  active: 'کاربران فعال',
  online: 'کاربران آنلاین',
  offline: 'کاربران آفلاین',
}
