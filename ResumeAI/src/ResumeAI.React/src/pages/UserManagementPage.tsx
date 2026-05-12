import { useEffect, useState, useCallback } from 'react'
import { authApi } from '../api'
import type { User } from '../types'
import { card, btn, C, errBox, pill } from '../styles'

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const data = await authApi.getAllUsers()
      setUsers(data)
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSuspend = async (user: User) => {
    if (user.role === 'ADMIN') return alert('Safety Check: You cannot suspend another admin.')
    if (!confirm(`Suspend account for ${user.fullName}?`)) return
    try {
      await authApi.suspendUser(user.userId)
      fetchUsers()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Action failed')
    }
  }

  const handleReactivate = async (userId: number) => {
    try {
      await authApi.reactivateUser(userId)
      fetchUsers()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Action failed')
    }
  }

  const handleDelete = async (user: User) => {
    if (user.role === 'ADMIN') return alert('Safety Check: Admin accounts cannot be deleted from the dashboard.')
    if (!confirm(`CRITICAL: Permanently delete ${user.fullName}? This cannot be undone.`)) return
    try {
      await authApi.deleteUser(user.userId)
      fetchUsers()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed')
    }
  }

  const handleUpdatePlan = async (user: User) => {
    if (user.role === 'ADMIN') return alert('Security Policy: Admin subscription plans cannot be modified.')
    
    const currentPlan = user.subscriptionPlan
    const newPlan = currentPlan === 'FREE' ? 'PREMIUM' : 'FREE'
    const msg = currentPlan === 'FREE' 
      ? `Upgrade ${user.fullName} to PREMIUM?` 
      : `Downgrade ${user.fullName} to FREE?`
    
    if (!confirm(msg)) return

    try {
      await authApi.adminUpdateSubscription(user.userId, newPlan)
      fetchUsers()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Plan update failed')
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'ALL' || u.role === filter
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || 
                         u.email.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>User Management</h1>
          <p style={{ color: 'var(--color-marine)', fontSize: '1.1rem' }}>Manage account lifecycle, roles, and premium subscriptions.</p>
        </div>
        <button className="premium-btn" onClick={fetchUsers} style={{ padding: '0.75rem 1.5rem' }}>Refresh Directory</button>
      </header>

      {err && <div style={errBox}>{err}</div>}

      <div style={{...card, padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem'}}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-harbor)', marginRight: '0.5rem', fontSize: '0.9rem' }}>ROLE:</span>
            {(['ALL', 'USER', 'ADMIN'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '10px',
                  background: filter === f ? 'var(--color-harbor)' : 'var(--color-frost)',
                  color: filter === f ? 'white' : 'var(--color-harbor)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid var(--color-frost)',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>
        </div>
        <div style={{ color: 'var(--color-marine)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          Showing: <span style={{ color: 'var(--color-harbor)', fontWeight: 700 }}>{filteredUsers.length}</span> / {users.length}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="loader" style={{ marginBottom: '1rem' }}></div>
          <p style={{ color: 'var(--color-marine)' }}>Synchronizing user database...</p>
        </div>
      ) : (
        <div style={{...card, overflow: 'hidden', padding: 0}}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--color-frost)', color: 'var(--color-harbor)' }}>
              <tr>
                <th style={thStyle}>Identity</th>
                <th style={thStyle}>Access Level</th>
                <th style={thStyle}>Subscription</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.userId} style={{ borderBottom: '1px solid var(--color-frost)', transition: 'background 0.2s' }} className="user-row">
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-depth)', fontSize: '1rem' }}>{u.fullName}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-marine)' }}>{u.email}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>UID: #{u.userId}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      ...pill(u.role === 'ADMIN' ? 'var(--color-harbor)' : 'var(--color-frost)'),
                      color: u.role === 'ADMIN' ? 'white' : 'var(--color-harbor)',
                      padding: '4px 12px'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={pill(u.subscriptionPlan === 'PREMIUM' ? 'var(--color-glacier)' : '#f3f4f6', u.subscriptionPlan === 'PREMIUM' ? 'white' : '#6b7280')}>
                        {u.subscriptionPlan}
                      </span>
                      <button 
                        onClick={() => handleUpdatePlan(u)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-glacier)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {u.subscriptionPlan === 'FREE' ? 'Upgrade' : 'Downgrade'}
                      </button>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button 
                        style={actionBtn('#f59e0b', u.role === 'ADMIN')} 
                        onClick={() => handleSuspend(u)}
                        disabled={u.role === 'ADMIN'}
                      >
                        Suspend
                      </button>
                      <button 
                        style={actionBtn('#22c55e', false)} 
                        onClick={() => handleReactivate(u.userId)}
                      >
                        Reactivate
                      </button>
                      <button 
                        style={actionBtn('#ef4444', u.role === 'ADMIN')} 
                        onClick={() => handleDelete(u)}
                        disabled={u.role === 'ADMIN'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '1.25rem 1.5rem',
  fontSize: '0.8rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  opacity: 0.8
}

const tdStyle: React.CSSProperties = {
  padding: '1.5rem',
  fontSize: '0.95rem'
}

function actionBtn(color: string, disabled: boolean): React.CSSProperties {
  return {
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 700,
    background: 'white',
    border: `1px solid ${disabled ? '#e5e7eb' : color}`,
    color: disabled ? '#9ca3af' : color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1
  }
}
