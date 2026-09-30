import { useState, useEffect } from 'react'
import {
  loadUserNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount,
  MESSAGE_TYPE_ICONS, PRIORITY_LABELS,
} from '../lib/adminMessages'

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<UserNotification[]>(loadUserNotifications)
  const [unread, setUnread] = useState(getUnreadCount)

  // Poll for new notifications every 8 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setNotifications(loadUserNotifications())
      setUnread(getUnreadCount())
    }, 8000)
    return () => clearInterval(id)
  }, [])

  function handleMarkRead(id: string) {
    markNotificationRead(id)
    setNotifications(loadUserNotifications())
    setUnread(getUnreadCount())
  }

  function handleMarkAll() {
    markAllNotificationsRead()
    setNotifications(loadUserNotifications())
    setUnread(0)
  }

  if (notifications.length === 0 && !open) return null

  return (
    <>
      {/* Bell button — fixed bottom-right */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="مرکز اعلان‌ها"
        style={{
          position: 'fixed',
          bottom: 24, left: 20,
          zIndex: 700,
          width: 44, height: 44,
          borderRadius: '50%',
          background: open ? 'rgba(204,34,41,0.18)' : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${open ? '#CC2229' : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 17 }}>🔔</span>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 18, height: 18,
            borderRadius: 9,
            background: '#CC2229',
            color: '#fff',
            fontSize: 10, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 0 6px #CC222988',
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
              position: 'fixed',
              bottom: 76, left: 12, right: 12,
              zIndex: 900,
              maxWidth: 420,
              margin: '0 auto',
              background: 'rgba(14,14,16,0.97)',
              border: '1px solid #2e2e32',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
              maxHeight: '70vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px 10px',
              borderBottom: '1px solid #1e1e20',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontWeight: 900, color: '#fff', fontSize: 14, flex: 1 }}>اعلان‌ها</span>
              {unread > 0 && (
                <button onClick={handleMarkAll} style={{
                  fontSize: 11, color: '#60a5fa', cursor: 'pointer',
                  background: 'none', border: 'none', padding: 0,
                }}>
                  همه را خواندم
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', color: '#6D6E71',
                fontSize: 16, cursor: 'pointer', lineHeight: 1,
              }}>✕</button>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <p style={{ fontSize: 28, marginBottom: 8 }}>📭</p>
                  <p style={{ color: '#6D6E71', fontSize: 13 }}>هیچ اعلانی وجود ندارد</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #1a1a1c',
                      cursor: 'pointer',
                      background: n.read ? 'transparent' : 'rgba(204,34,41,0.05)',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 18, marginTop: 1, flexShrink: 0 }}>
                      {MESSAGE_TYPE_ICONS[n.type]}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 900,
                          color: n.read ? '#c5c5c9' : '#fff',
                        }}>{n.title}</span>
                        {!n.read && (
                          <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: '#CC2229', flexShrink: 0,
                          }} />
                        )}
                      </div>
                      <p className="notif-body-clamp" style={{
                        fontSize: 12, color: '#6D6E71', marginTop: 3,
                        lineHeight: 1.5,
                      }}>{n.body}</p>
                      <p style={{ fontSize: 10, color: '#444', marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {n.priority !== 'normal' && (
                          <span style={{ marginRight: 6, color: n.priority === 'critical' ? '#f87171' : '#ffd60a' }}>
                            · {PRIORITY_LABELS[n.priority]}
                          </span>
                        )}
                      </p>
                      {n.ctaLabel && (
                        <button style={{
                          marginTop: 6, fontSize: 11, fontWeight: 700,
                          color: '#e84249', background: '#CC222915',
                          border: '1px solid #CC222944',
                          borderRadius: 8, padding: '3px 10px',
                          cursor: 'pointer',
                        }}>{n.ctaLabel}</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
