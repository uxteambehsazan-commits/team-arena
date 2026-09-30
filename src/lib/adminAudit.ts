// Admin audit log — localStorage-based
// Sensitive values (tokens, passwords) MUST NEVER be passed to these functions.

export type AuditAction =
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'TOKEN_VALIDATED'
  | 'TOKEN_COPIED'
  | 'TOKEN_ROTATED'
  | 'TOKEN_REVOKED'
  | 'TOKEN_ENTERED'
  | 'TOKEN_CLEARED'
  | 'GITHUB_CONNECTION_TESTED'
  | 'MESSAGE_CREATED'
  | 'MESSAGE_UPDATED'
  | 'MESSAGE_SENT'
  | 'MESSAGE_DELETED'
  | 'MESSAGE_CANCELLED'
  | 'RELEASE_VIEWED'
  | 'RELEASE_ANNOUNCEMENT_SENT'
  | 'ADMIN_ROLE_CHANGED'
  | 'SETTINGS_CHANGED'

export interface AuditEntry {
  id: string
  action: AuditAction
  actor: string          // admin username (not credential)
  target?: string        // e.g. message id, "github", "release:3.8.0"
  result: 'success' | 'failure' | 'info'
  detail?: string        // human-readable, never contains secrets
  timestamp: string
}

const AUDIT_KEY = 'ta_admin_audit'
const MAX_ENTRIES = 200

export function logAudit(
  action: AuditAction,
  result: AuditEntry['result'],
  opts: { actor?: string; target?: string; detail?: string } = {}
): void {
  const entry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    action,
    actor: opts.actor ?? 'admin',
    target: opts.target,
    result,
    detail: opts.detail,
    timestamp: new Date().toISOString(),
  }
  const entries = loadAuditLog()
  entries.unshift(entry)
  // Keep only the last MAX_ENTRIES entries
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
}

export function loadAuditLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) ?? '[]')
  } catch { return [] }
}

export function clearAuditLog(): void {
  localStorage.removeItem(AUDIT_KEY)
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  ADMIN_LOGIN: 'ورود مدیر',
  ADMIN_LOGOUT: 'خروج مدیر',
  TOKEN_VALIDATED: 'اعتبارسنجی توکن',
  TOKEN_COPIED: 'کپی توکن',
  TOKEN_ROTATED: 'تعویض توکن',
  TOKEN_REVOKED: 'لغو توکن',
  TOKEN_ENTERED: 'ورود توکن',
  TOKEN_CLEARED: 'پاک‌سازی توکن',
  GITHUB_CONNECTION_TESTED: 'بررسی اتصال GitHub',
  MESSAGE_CREATED: 'ایجاد پیام',
  MESSAGE_UPDATED: 'ویرایش پیام',
  MESSAGE_SENT: 'ارسال پیام',
  MESSAGE_DELETED: 'حذف پیام',
  MESSAGE_CANCELLED: 'لغو پیام',
  RELEASE_VIEWED: 'مشاهده نسخه',
  RELEASE_ANNOUNCEMENT_SENT: 'ارسال اطلاع‌رسانی نسخه',
  ADMIN_ROLE_CHANGED: 'تغییر نقش مدیر',
  SETTINGS_CHANGED: 'تغییر تنظیمات',
}
