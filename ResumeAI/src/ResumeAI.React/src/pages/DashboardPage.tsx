import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { aiApi, resumeApi, exportApi, jobMatchApi } from '../api'
import type { Resume, AiRequest, AiQuota, ExportJob, JobMatch } from '../types'
import { card, btn, C, errBox, pill } from '../styles'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quota, setQuota] = useState<AiQuota | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [history, setHistory] = useState<AiRequest[]>([])
  const [exports, setExports] = useState<ExportJob[]>([])
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const [q, r, h, e, m] = await Promise.allSettled([
        aiApi.getQuota(),
        resumeApi.getAll(),
        aiApi.getHistory(),
        exportApi.getMyExports(),
        jobMatchApi.getMyMatches(),
      ])
      if (q.status === 'fulfilled') setQuota(q.value)
      if (r.status === 'fulfilled') setResumes(r.value)
      if (h.status === 'fulfilled') setHistory(h.value)
      if (e.status === 'fulfilled') setExports(e.value)
      if (m.status === 'fulfilled') setMatches(m.value)
    } catch {
      setErr('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isPremium = user?.subscriptionPlan === 'PREMIUM'

  // Calculate Best Score: max of current resume scores OR past job match scores
  const allScores = [
    ...resumes.map(r => r.atsScore),
    ...matches.map(m => m.matchScore)
  ]
  const bestScore = allScores.length ? Math.max(...allScores) : 0

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* Header Section */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '2.5rem',
        borderBottom: '1.5px solid var(--color-frost)',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.25rem', 
            fontWeight: 800, 
            color: 'var(--color-depth)',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Welcome back, <span style={{ color: 'var(--color-harbor)' }}>{user?.fullName?.split(' ')[0]}</span>!
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--color-marine)', fontSize: '1rem', fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            style={{ ...btn('white', 'var(--color-harbor)'), border: '1.5px solid var(--color-frost)' }} 
            onClick={load}
          >
            Refresh
          </button>
          <button 
            style={btn('var(--color-harbor)')} 
            onClick={() => navigate('/resume')}
          >
            Create New Resume
          </button>
        </div>
      </header>



      {/* Stats Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2.5rem' 
      }}>
        <StatCard label="My Resumes" value={resumes.length} color="#3b82f6" />
        <StatCard label="Total Exports" value={exports.length} color="#10b981" />
        <StatCard label="AI Requests" value={history.length} color="#8b5cf6" />
        <StatCard 
          label="Best ATS Score" 
          value={bestScore ? bestScore + '%' : '—'} 
          color="#f59e0b" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        {/* Main Resumes List */}
        <section style={dashboardCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>My Resumes</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-marine)' }}>{resumes.length} Total</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p style={emptyStateStyle}>Loading resumes...</p>
            ) : resumes.length === 0 ? (
              <p style={emptyStateStyle}>You haven't created any resumes yet.</p>
            ) : (
              resumes.slice(0, 5).map(r => (
                <div 
                  key={r.resumeId} 
                  style={listItemStyle}
                  onClick={() => navigate('/resume')}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-glacier)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-depth)', marginBottom: '4px' }}>{r.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-marine)' }}>
                      Target: {r.targetJobTitle || 'Not specified'} · {r.isPublic ? 'Public' : 'Private'}
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'right',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '10px',
                    background: r.atsScore >= 80 ? '#ecfdf5' : r.atsScore >= 60 ? '#fffbeb' : '#fef2f2',
                    color: r.atsScore >= 80 ? '#059669' : r.atsScore >= 60 ? '#d97706' : '#dc2626',
                    fontWeight: 800,
                    fontSize: '0.9rem'
                  }}>
                    {r.atsScore}% <span style={{ fontSize: '0.65rem', display: 'block', fontWeight: 600 }}>ATS</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {resumes.length > 5 && (
            <button style={linkButtonStyle} onClick={() => navigate('/resume')}>View All Resumes</button>
          )}
        </section>

        {/* Right Column Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Account & Quota */}
          <section style={dashboardCardStyle}>
            <h3 style={cardTitleStyle}>Platform Status</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Account Plan</span>
                  <span style={{ ...pill(isPremium ? 'var(--color-harbor)' : 'var(--color-marine)'), fontSize: '10px' }}>
                    {user?.subscriptionPlan}
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Member Since</span>
                  <span style={{ fontWeight: 600 }}>{user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                {quota ? (
                  <>
                    <QuotaMini 
                      label="AI Content" 
                      used={quota.maxContentCalls - quota.remainingContentCalls} 
                      max={quota.maxContentCalls} 
                      isPremium={isPremium}
                    />
                    <QuotaMini 
                      label="ATS Analysis" 
                      used={quota.maxAtsCalls - quota.remainingAtsCalls} 
                      max={quota.maxAtsCalls} 
                      isPremium={isPremium}
                    />
                  </>
                ) : <p style={emptyStateStyle}>Quota loading...</p>}
              </div>
            </div>
          </section>

          {/* Quick Actions Grid */}
          <section style={dashboardCardStyle}>
            <h3 style={cardTitleStyle}>Quick Access</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <ActionButton label="Templates" onClick={() => navigate('/templates')} />
              <ActionButton label="Builder" onClick={() => navigate('/resume')} />
              <ActionButton label="Job Match" onClick={() => navigate('/jobmatch')} />
              <ActionButton label="Exports" onClick={() => navigate('/exports')} />
            </div>
          </section>

          {/* Recent Exports */}
          <section style={dashboardCardStyle}>
            <h3 style={cardTitleStyle}>Recent Exports</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loading ? (
                <p style={emptyStateStyle}>...</p>
              ) : exports.length === 0 ? (
                <p style={emptyStateStyle}>No exports found.</p>
              ) : (
                exports.slice(0, 3).map(e => (
                  <div key={e.jobId} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    padding: '0.75rem',
                    background: 'var(--color-frost)',
                    borderRadius: '12px',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: '8px', 
                      background: e.format === 'PDF' ? '#ef4444' : '#3b82f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '10px'
                    }}>
                      {e.format}
                    </div>
                    <div style={{ flex: 1, fontWeight: 600 }}>Resume #{e.resumeId}</div>
                    <div style={{ color: e.status === 'COMPLETED' ? '#10b981' : '#f59e0b', fontWeight: 700, fontSize: '11px' }}>
                      {e.status}
                    </div>
                    {e.status === 'COMPLETED' && (
                      <a href={exportApi.downloadUrl(e.jobId)} style={{ 
                        textDecoration: 'none', 
                        color: 'var(--color-harbor)', 
                        fontWeight: 700,
                        padding: '4px 8px',
                        border: '1.5px solid var(--color-harbor)',
                        borderRadius: '6px'
                      }}>Download</a>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

// ── Styled Components (as objects) ──────────────────────────────────────────

const dashboardCardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '24px',
  padding: '2rem',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-frost)',
}

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem'
}

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'var(--color-depth)',
  fontFamily: "'Outfit', sans-serif"
}

const listItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  padding: '1rem',
  borderRadius: '16px',
  background: '#fff',
  border: '1.5px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
}

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.75rem',
  fontSize: '0.9rem'
}

const infoLabelStyle: React.CSSProperties = {
  color: 'var(--color-marine)',
  fontWeight: 500
}

const emptyStateStyle: React.CSSProperties = {
  color: 'var(--color-marine)',
  fontSize: '0.9rem',
  textAlign: 'center',
  padding: '2rem 0'
}

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-harbor)',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  marginTop: '1.5rem',
  padding: 0
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{
      ...dashboardCardStyle,
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem'
    }}>
      <div style={{
        width: '8px',
        height: '40px',
        borderRadius: '4px',
        background: color,
      }} />
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-depth)' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-marine)', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  )
}

function QuotaMini({ label, used, max, isPremium }: { label: string; used: number; max: number; isPremium: boolean }) {
  const pct = Math.min(100, Math.round((used / max) * 100))
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', fontWeight: 700 }}>
        <span>{label}</span>
        {isPremium ? (
          <span style={{ color: 'var(--color-harbor)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unlimited</span>
        ) : (
          <span>{used}/{max}</span>
        )}
      </div>
      <div style={{ height: '6px', background: 'var(--color-frost)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ 
          width: isPremium ? '100%' : `${pct}%`, 
          background: isPremium ? 'var(--color-harbor)' : (pct > 85 ? '#ef4444' : 'var(--color-harbor)'), 
          height: '100%', 
          borderRadius: '3px',
          transition: 'width 0.6s ease',
          opacity: isPremium ? 0.3 : 1
        }} />
      </div>
    </div>
  )
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'white',
        border: '1.5px solid var(--color-frost)',
        borderRadius: '16px',
        fontWeight: 700,
        color: 'var(--color-harbor)',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = 'var(--color-frost)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = 'white'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {label}
    </button>
  )
}
