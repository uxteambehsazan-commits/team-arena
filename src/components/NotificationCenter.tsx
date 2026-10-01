import { useState, useEffect } from 'react'
import {
  loadUserNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount,
  MESSAGE_TYPE_ICONS,
  type UserNotification, type MessageType,
} from '../lib/adminMessages'

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#f87171',
  high: '#ffd60a',
  normal: '#60a5fa',
  low: '#6D6E71',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'همین الان'
  if (m < 60) return `${m} دقیقه پیش`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ساعت پیش`
  return `${Math.floor(h / 24)} روز پیش`
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<UserNotification[]>(loadUserNotifications)
  const [unread, setUnread] = useState(getUnreadCount)

  useEffect(() => {
    const id = setInterval(() => {
      setNotifications(loadUserNotifications())
      setUnread(getUnreadCount())
    }, 8000)
    return () => clearInterval(id)
  }, [])

  function refresh() {
    setNotifications(loadUserNotifications())
    setUnread(getUnreadCount())
  }

  function handleMarkRead(id: string) {
    markNotificationRead(id)
    refresh()
  }

  function handleMarkAll() {
    markAllNotificationsRead()
    refresh()
  }

  if (notifications.length === 0 && !open) return null

  return (
    <>
      {/* Bell — fixed bottom-left */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="مرکز اعلان‌ها"
        style={{
          position: 'fixed', bottom: 24, left: 20, zIndex: 700,
          width: 46, height: 46, borderRadius: '50%',
          background: open ? 'rgba(204,34,41,0.2)' : 'rgba(255,255,255,0.07)',
          border: `1.5px solid ${open ? '#CC2229' : 'rgba(255,255,255,0.12)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: unread > 0 ? '0 0 12px rgba(204,34,41,0.4)' : 'none',
        }}
      >
        <span style={{ fontSize: 18 }}>🔔</span>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5,
            minWidth: 19, height: 19, borderRadius: 10,
            background: '#CC2229', color: '#fff',
            fontSize: 10, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', boxShadow: '0 0 8px #CC222988',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 800 }} onClick={() => setOpen(false)} />
          <div
            dir="rtl"
            style={{
              position: 'fixed', bottom: 80, left: 12, right: 12,
              zIndex: 900, maxWidth: 440, margin: '0 auto',
              background: 'rgba(12,12,14,0.98)',
              border: '1px solid #2a2a2e', borderRadius: 22,
              boxShadow: '0 12px 48px rgba(0,0,0,0.8)',
              maxHeight: '72vh', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px 12px',
              borderBottom: '1px solid #1e1e22',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>🔔</span>
              <span style={{ fontWeight: 900, color: '#fff', fontSize: 15, flex: 1 }}>
                اعلان‌ها
                {unread > 0 && (
                  <span style={{
                    marginRight: 8, fontSize: 11, fontWeight: 700,
                    background: '#CC222922', color: '#f87171',
                    border: '1px solid #CC222944', borderRadius: 999,
                    padding: '1px 7px',
                  }}>{unread} جدید</span>
                )}
              </span>
              {unread > 0 && (
                <button onClick={handleMarkAll} style={{
                  fontSize: 11, color: '#60a5fa', cursor: 'pointer',
                  background: 'none', border: 'none', padding: 0,
                }}>همه خوانده شد</button>
              )}
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', color: '#555',
                fontSize: 16, cursor: 'pointer', lineHeight: 1, marginRight: 4,
              }}>✕</button>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <p style={{ fontSize: 32, marginBottom: 10 }}>📭</p>
                  <p style={{ color: '#555', fontSize: 13 }}>هیچ اعلانی وجود ندارد</p>
                </div>
              ) : (
                notifications.map(n => (
                  <NotifCard
                    key={n.id}
                    n={n}
                    onRead={() => handleMarkRead(n.id)}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

function NotifCard({ n, onRead }: { n: UserNotification; onRead: () => void }) {
  const icon = MESSAGE_TYPE_ICONS[n.type as MessageType] ?? '📢'
  const priorityColor = PRIORITY_COLORS[n.priority] ?? '#60a5fa'
  const hasBullets = n.bullets && n.bullets.length > 0

  return (
    <div
      onClick={onRead}
      style={{
        padding: '14px 16px',
        borderBottom: '1px solid #18181c',
        cursor: 'pointer',
        background: n.read ? 'transparent' : 'rgba(204,34,41,0.04)',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Icon bubble */}
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, marginTop: 1,
        }}>{icon}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{
              fontSize: 13, fontWeight: 900,
              color: n.read ? '#9ca3af' : '#f3f4f6',
              flex: 1,
            }}>{n.title}</span>
            {!n.read && (
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#CC2229', flexShrink: 0,
                boxShadow: '0 0 6px #CC222988',
              }} />
            )}
          </div>

          {/* Body or bullets */}
          {hasBullets ? (
            <ul style={{
              margin: 0, padding: 0, listStyle: 'none',
              display: 'flex', flexDirection: 'column', gap: 3,
            }}>
              {(n.bullets ?? []).slice(0, 4).map((b, i) => (
                <li key={i} style={{
                  fontSize: 12, color: '#9ca3af', lineHeight: 1.5,
                  display: 'flex', gap: 6, alignItems: 'flex-start',
                }}>
                  <span style={{ color: '#4b5563', flexShrink: 0, marginTop: 2 }}>•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{
              fontSize: 12, color: '#9ca3af', marginBottom: 0,
              lineHeight: 1.55, display: '-webkit-box',
              overflow: 'hidden',
            }}>{n.body}</p>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 10, color: '#4b5563' }}>
              {relativeTime(n.createdAt)}
            </span>
            {n.priority !== 'normal' && n.priority !== 'low' && (
              <span style={{
                fontSize: 10, color: priorityColor,
                background: `${priorityColor}18`,
                border: `1px solid ${priorityColor}44`,
                borderRadius: 999, padding: '1px 6px', fontWeight: 700,
              }}>
                {n.priority === 'critical' ? 'مهم' : 'اولویت بالا'}
              </span>
            )}
          </div>

          {/* CTA */}
          {n.ctaLabel && (
            <button
              onClick={e => {
                e.stopPropagation()
                if (n.ctaLink) window.location.hash = n.ctaLink
              }}
              style={{
                marginTop: 8, fontSize: 11, fontWeight: 700,
                color: '#f3f4f6', background: 'rgba(204,34,41,0.15)',
                border: '1px solid rgba(204,34,41,0.4)',
                borderRadius: 10, padding: '5px 14px',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              {n.ctaLabel} ←
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
