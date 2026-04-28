import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'

const STATUS_DOT: Record<string, { color: string; label: string }> = {
  connected:    { color: '#22c55e', label: 'Live' },
  connecting:   { color: '#f59e0b', label: 'Connecting...' },
  reconnecting: { color: '#f59e0b', label: 'Reconnecting...' },
  disconnected: { color: '#ef4444', label: 'Offline' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount, connectionStatus } = useNotifications()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const dot = STATUS_DOT[connectionStatus]

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '0.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <NavLink to="/" style={{ 
          fontSize: '1.5rem', 
          fontWeight: 700, 
          textDecoration: 'none',
          fontFamily: 'Outfit, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ color: 'var(--color-harbor)' }}>Next</span>
          <span style={{ color: 'var(--color-glacier)' }}>Hire</span>
        </NavLink>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <NavAnchor to="/" label="Home" end />
          <NavAnchor to="/dashboard" label="Dashboard" />
          <NavAnchor to="/templates" label="Templates" />
          <NavAnchor to="/resume" label="Builder" />
          <NavAnchor to="/jobmatch" label="Job Match" />
          <NavAnchor to="/exports" label="Exports" />
          <NavAnchor to="/profile" label="Profile" />
          {user?.role === 'ADMIN' && <NavAnchor to="/users" label="Users" />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* SignalR Status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          background: 'var(--color-frost)',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-marine)'
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: dot.color,
            boxShadow: `0 0 8px ${dot.color}`
          }} />
          {dot.label}
        </div>

        {/* Notifications */}
        <NavLink to="/notifications" style={{ position: 'relative', textDecoration: 'none', color: 'var(--color-harbor)' }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -5,
              right: -8,
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              fontSize: '10px',
              fontWeight: 700,
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>

        {/* User Profile Dropdown Placeholder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-depth)' }}>{user?.fullName}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-marine)', textTransform: 'uppercase' }}>{user?.subscriptionPlan}</div>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid var(--color-harbor)',
              color: 'var(--color-harbor)',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--color-harbor)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--color-harbor)'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

function NavAnchor({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink 
      to={to} 
      end={end}
      style={({ isActive }) => ({
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: isActive ? 'var(--color-harbor)' : 'var(--color-marine)',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        background: isActive ? 'var(--color-frost)' : 'transparent',
        borderBottom: isActive ? '2px solid var(--color-harbor)' : '2px solid transparent'
      })}
    >
      {label}
    </NavLink>
  )
}
