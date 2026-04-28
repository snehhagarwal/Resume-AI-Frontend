import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'
import { card, btn, input, C, errBox, successBox, tabBtn } from '../styles'

type Tab = 'profile' | 'password' | 'subscription' | 'danger'

export default function ProfilePage() {
  const { user, logout, updateSession } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [tab, setTab] = useState<Tab>(params.get('upgrade') ? 'subscription' : 'profile')
  const [err, setErr] = useState('')
  const [ok,  setOk]  = useState('')
  const [busy, setBusy] = useState(false)

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone,    setPhone]    = useState(user?.phone ?? '')

  // Password form
  const [curPwd,  setCurPwd]  = useState('')
  const [newPwd,  setNewPwd]  = useState('')
  const [confPwd, setConfPwd] = useState('')

  useEffect(() => {
    if (user) { setFullName(user.fullName); setPhone(user.phone ?? '') }
  }, [user])

  const run = async (fn: () => Promise<void>, successMsg: string) => {
    setErr(''); setOk(''); setBusy(true)
    try { await fn(); setOk(successMsg) }
    catch (e: any) { 
      const status = e?.response?.status
      if (status === 403) {
        setErr('This action is restricted. You may need a Premium plan or higher permissions.')
      } else {
        setErr(e?.response?.data?.error ?? e?.message ?? 'Error') 
      }
    }
    finally { setBusy(false) }
  }

  const saveProfile = () => run(async () => {
    await authApi.updateProfile({ fullName, phone })
    window.location.reload()
  }, 'Profile updated successfully.')

  const changePassword = () => {
    if (newPwd !== confPwd) { setErr('Passwords do not match'); return }
    if (newPwd.length < 6)  { setErr('Password must be at least 6 characters'); return }
    run(async () => {
      await authApi.changePassword({ currentPassword: curPwd, newPassword: newPwd })
      setCurPwd(''); setNewPwd(''); setConfPwd('')
    }, 'Password changed successfully!')
  }

  const upgrade = () => run(async () => {
    const response = await authApi.updateSubscription('PREMIUM')
    updateSession(response)
  }, 'Upgraded to PREMIUM plan!')

  const downgrade = () => run(async () => {
    const response = await authApi.updateSubscription('FREE')
    updateSession(response)
  }, 'Successfully returned to the FREE plan.')

  const deactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? This cannot be undone.')) return
    await run(async () => {
      await authApi.deactivate()
      logout(); navigate('/auth')
    }, '')
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile',      label: 'Account Info' },
    { key: 'password',     label: 'Security'     },
    { key: 'subscription', label: 'Membership'    },
    { key: 'danger',       label: 'Account Access' },
  ]

  const isPremium = user?.subscriptionPlan === 'PREMIUM'
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NH'

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Profile Header */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '2rem', 
        marginBottom: '3.5rem',
        background: 'white',
        padding: '2.5rem',
        borderRadius: '30px',
        boxShadow: 'var(--shadow-sm)',
        border: '1.5px solid var(--color-frost)'
      }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          background: 'var(--color-harbor)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          fontWeight: 800,
          fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 10px 20px rgba(54, 86, 95, 0.2)'
        }}>
          {initials}
        </div>
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-depth)', fontFamily: "'Outfit', sans-serif" }}>
            {user?.fullName}
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-marine)', fontWeight: 600 }}>{user?.email}</span>
            <span style={{ width: '1px', height: '12px', background: 'var(--color-marine)', opacity: 0.3 }}></span>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              color: isPremium ? 'var(--color-harbor)' : 'var(--color-marine)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {user?.subscriptionPlan} PLAN
            </span>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2.5rem', 
        background: 'var(--color-frost)', 
        padding: '0.5rem', 
        borderRadius: '16px',
      }}>
        {tabs.map(t => (
          <button 
            key={t.key} 
            style={{
              ...tabBtn(tab === t.key),
              flex: 1,
              padding: '0.8rem',
              borderRadius: '12px',
              border: 'none',
              background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? 'var(--color-depth)' : 'var(--color-marine)',
              boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }} 
            onClick={() => { setTab(t.key); setErr(''); setOk('') }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {err && <div style={{ ...errBox, marginBottom: '2rem' }}>{err}</div>}
      {ok  && <div style={{ ...successBox, marginBottom: '2rem' }}>{ok}</div>}

      <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
        {/* Profile tab */}
        {tab === 'profile' && (
          <div style={card}>
            <h3 style={{ margin: '0 0 2rem', color: 'var(--color-depth)', fontWeight: 800 }}>Account Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Full Name</label>
                <input style={{ ...input, marginBottom: 0 }} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Email Address (Protected)</label>
                <input style={{ ...input, background: 'var(--color-frost)', color: 'var(--color-marine)', marginBottom: 0 }} value={user?.email ?? ''} disabled />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Phone Number</label>
                <input style={{ ...input, marginBottom: 0 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 000 000 0000" />
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <button style={{ ...btn(), padding: '1rem 2rem' }} onClick={saveProfile} disabled={busy}>Save Profile Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Password tab */}
        {tab === 'password' && (
          <div style={card}>
            <h3 style={{ margin: '0 0 2rem', color: 'var(--color-depth)', fontWeight: 800 }}>Security Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Current Password</label>
                <input style={{ ...input, marginBottom: 0 }} type="password" value={curPwd}  onChange={e => setCurPwd(e.target.value)}  placeholder="Enter current password" />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>New Password</label>
                <input style={{ ...input, marginBottom: 0 }} type="password" value={newPwd}  onChange={e => setNewPwd(e.target.value)}  placeholder="Minimum 6 characters" />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Confirm New Password</label>
                <input style={{ ...input, marginBottom: 0 }} type="password" value={confPwd} onChange={e => setConfPwd(e.target.value)} placeholder="Repeat new password" />
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <button style={{ ...btn(), padding: '1rem 2rem' }} onClick={changePassword} disabled={busy || !curPwd || !newPwd || !confPwd}>Update Security Access</button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription tab */}
        {tab === 'subscription' && (
          <div style={card}>
            <h3 style={{ margin: '0 0 2rem', color: 'var(--color-depth)', fontWeight: 800 }}>Membership & Plans</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <PlanCard
                name="Free Tier"
                price="$0"
                features={['Up to 3 Professional Resumes', 'Standard AI Components', 'High-Quality PDF Exports', 'Access to Standard Templates']}
                current={!isPremium}
                color="var(--color-marine)"
              />
              <PlanCard
                name="Premium Access"
                price="$12"
                features={['Unlimited Resume Storage', 'Advanced AI Tailoring Tools', 'All Export Formats (PDF, DOCX, JSON)', 'Exclusive Premium Templates', 'Deep Job Match Analysis']}
                current={isPremium}
                color="var(--color-harbor)"
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              {!isPremium
                ? <button style={{ ...btn('var(--color-harbor)'), padding: '1.25rem 3rem', fontSize: '1.1rem' }} onClick={upgrade} disabled={busy}>Elevate to Premium Plan</button>
                : <button style={{ ...btn('var(--color-frost)', 'var(--color-marine)'), padding: '1rem 2rem' }} onClick={downgrade} disabled={busy}>Cancel Premium Subscription</button>}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {tab === 'danger' && (
          <div style={{ ...card, border: '2px solid #ef4444', background: '#fff' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#ef4444', fontWeight: 800 }}>Account Deactivation</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-marine)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Warning: Deactivating your account will permanently erase your professional profile, all resumes, and export history. This action is irreversible.
            </p>
            <button style={{ ...btn('rgba(239, 68, 68, 0.1)', '#ef4444'), padding: '1rem 2rem' }} onClick={deactivate} disabled={busy}>
              Permanently Delete Account
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PlanCard({ name, price, features, current, color }: any) {
  return (
    <div style={{
      flex: 1, 
      minWidth: '280px',
      borderRadius: '24px', 
      padding: '2rem',
      border: `2px solid ${current ? color : 'var(--color-frost)'}`,
      background: current ? `${color}05` : 'white',
      position: 'relative',
      transition: 'all 0.3s ease'
    }}>
      {current && (
        <div style={{ 
          position: 'absolute', 
          top: '-12px', 
          right: '20px', 
          background: color, 
          color: 'white', 
          padding: '4px 12px', 
          borderRadius: '20px', 
          fontSize: '0.7rem', 
          fontWeight: 800,
          letterSpacing: '1px'
        }}>
          ACTIVE PLAN
        </div>
      )}
      <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-marine)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{name}</h4>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 900, color }}>{price}</span>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-marine)', fontWeight: 600 }}>/ month</span>
      </div>
      <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {features.map((f: string, i: number) => (
          <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-depth)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ color, fontWeight: 900 }}>•</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 800,
  color: 'var(--color-depth)',
  marginLeft: '0.25rem'
}
