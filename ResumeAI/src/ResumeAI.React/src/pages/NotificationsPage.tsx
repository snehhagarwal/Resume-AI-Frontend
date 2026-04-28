import { useNotifications } from '../context/NotificationContext'
import { card, btn, C, tabBtn } from '../styles'

const TYPE_COLOR: Record<string, string> = {
  ATS_COMPLETE:  '#10b981',
  EXPORT_READY:  '#3b82f6',
  AI_DONE:       '#8b5cf6',
  JOB_MATCH:     '#f59e0b',
  PLAN_CHANGE:   '#6366f1',
  QUOTA_WARNING: '#ef4444',
}

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  connected:    { background: 'var(--color-frost)', color: 'var(--color-harbor)', border: '1.5px solid var(--color-glacier)' },
  connecting:   { background: '#fef9c3', color: '#713f12', border: '1px solid #fde047' },
  reconnecting: { background: '#fef9c3', color: '#713f12', border: '1px solid #fde047' },
  disconnected: { background: '#fef2f2', color: '#7f1d1d', border: '1px solid #fca5a5' },
}

const STATUS_LABEL: Record<string, string> = {
  connected:    'Real-time Connection Active',
  connecting:   'Connecting to Secure Feed...',
  reconnecting: 'Re-establishing Connection...',
  disconnected: 'Feed Offline — Historical View Only',
}

const stripEmoji = (str: string) => str.replace(/[\u2000-\u3300]|[\uD83C-\uDFFF][\uD83C-\uDFFF]/g, '').trim()

export default function NotificationsPage() {
  const {
    notifications, unreadCount, connectionStatus,
    markRead, markAll, remove, refresh,
  } = useNotifications()

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-depth)', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
          Notifications
        </h1>
        <p style={{ color: 'var(--color-marine)', fontSize: '1rem', fontWeight: 500, marginBottom: '1.5rem' }}>
          Your real-time stream of platform updates, AI results, and system alerts.
        </p>

        <div style={{ 
          ...STATUS_STYLE[connectionStatus],
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 1.25rem',
          borderRadius: '30px',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          {connectionStatus === 'connected' && (
            <div style={{ width: '8px', height: '8px', background: 'var(--color-harbor)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
          )}
          {STATUS_LABEL[connectionStatus]}
        </div>
      </header>

      {/* Actions & Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-depth)' }}>Inbox</h3>
          {unreadCount > 0 && (
            <span style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '2px 10px', borderRadius: '20px' }}>
              {unreadCount} UNREAD
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ ...btn('var(--color-frost)', 'var(--color-harbor)'), fontWeight: 700 }} onClick={refresh}>Refresh Feed</button>
          {unreadCount > 0 && (
            <button style={{ ...btn('transparent', 'var(--color-marine)'), border: '1.5px solid var(--color-frost)', fontWeight: 700 }} onClick={markAll}>Mark All Read</button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div style={{ ...card, padding: '0', overflow: 'hidden', border: '1.5px solid var(--color-frost)' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-marine)' }}>You're all caught up!</div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--color-marine)', opacity: 0.7 }}>
              New updates will appear here automatically as they arrive.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, i) => (
              <div key={n.notificationId} style={{
                display: 'flex',
                gap: '1.5rem',
                padding: '1.5rem',
                borderBottom: i === notifications.length - 1 ? 'none' : '1.5px solid var(--color-frost)',
                background: n.isRead ? 'transparent' : 'rgba(95, 129, 144, 0.03)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}>
                {/* Visual Indicator */}
                <div style={{
                  width: '4px',
                  height: '40px',
                  borderRadius: '2px',
                  background: n.isRead ? 'var(--color-frost)' : (TYPE_COLOR[n.type] ?? 'var(--color-harbor)'),
                  marginTop: '0.25rem'
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-depth)', opacity: n.isRead ? 0.7 : 1 }}>
                        {stripEmoji(n.title)}
                      </strong>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: n.isRead ? 'var(--color-frost)' : `${TYPE_COLOR[n.type] ?? 'var(--color-harbor)'}15`,
                        color: n.isRead ? 'var(--color-marine)' : (TYPE_COLOR[n.type] ?? 'var(--color-harbor)'),
                        letterSpacing: '0.5px'
                      }}>
                        {n.type}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-marine)', fontWeight: 600 }}>
                      {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p style={{ 
                    margin: '0 0 0.75rem', 
                    fontSize: '0.95rem', 
                    color: 'var(--color-marine)', 
                    lineHeight: 1.5,
                    opacity: n.isRead ? 0.6 : 1
                  }}>
                    {stripEmoji(n.message)}
                  </p>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-marine)', opacity: 0.5, fontWeight: 600 }}>
                    {new Date(n.sentAt).toLocaleDateString()} · Channel: {n.channel}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'center' }}>
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n.notificationId)}
                      style={{ ...smallBtnStyle, background: 'var(--color-frost)', color: 'var(--color-harbor)' }}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => remove(n.notificationId)}
                    style={{ ...smallBtnStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(0.95); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const smallBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}
