import { useEffect, useState } from 'react'
import { exportApi } from '../api'
import type { ExportJob } from '../types'
import { card, btn, C, errBox, tabBtn } from '../styles'

type Filter = 'all' | 'PDF' | 'DOCX' | 'JSON'

export default function ExportsPage() {
  const [exports,  setExports]  = useState<ExportJob[]>([])
  const [stats,    setStats]    = useState<Record<string, number> | null>(null)
  const [filter,   setFilter]   = useState<Filter>('all')
  const [err,      setErr]      = useState('')
  const [busy,     setBusy]     = useState(false)

  const run = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setErr(''); setBusy(true)
    try { return await fn() }
    catch (e: any) { 
      const status = e?.response?.status
      if (status === 403) {
        setErr('DOCX and JSON exports are reserved for Premium members. Upgrade to unlock all formats!')
      } else {
        setErr(e?.response?.data?.error ?? e?.message ?? 'An error occurred') 
      }
      return null 
    }
    finally { setBusy(false) }
  }

  const load = () => run(async () => {
    const [e, s] = await Promise.all([exportApi.getMyExports(), exportApi.getStats()])
    setExports(e); setStats(s)
    return e
  })

  useEffect(() => { load() }, [])

  const del = (jobId: string) => run(async () => {
    await exportApi.delete(jobId)
    setExports(prev => prev.filter(e => e.jobId !== jobId))
  })

  const visible = filter === 'all' ? exports : exports.filter(e => e.format === filter)

  const fmtColor = (f: string) => {
    switch (f) {
      case 'PDF': return '#ef4444'
      case 'DOCX': return '#3b82f6'
      case 'JSON': return '#10b981'
      default: return 'var(--color-harbor)'
    }
  }

  const formatDate = (dateInput: any) => {
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-depth)', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
            Export History
          </h1>
          <p style={{ color: 'var(--color-marine)', fontSize: '1rem', fontWeight: 500, margin: 0 }}>
            Manage and download your generated resumes in all professional formats.
          </p>
        </div>
        <button 
          style={{ ...btn('var(--color-frost)', 'var(--color-harbor)'), fontWeight: 700 }} 
          onClick={load} 
          disabled={busy}
        >
          Sync Data
        </button>
      </header>

      {err && <div style={{ ...errBox, marginBottom: '2rem' }}>{err}</div>}

      {/* Stats Dashboard */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          <StatMini label="Total Files" value={exports.length} color="var(--color-depth)" />
          {Object.entries(stats).map(([k, v]) => (
            <StatMini key={k} label={`${k} Format`} value={v} color={fmtColor(k)} />
          ))}
        </div>
      )}

      {/* Navigation & Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', background: 'white', padding: '0.5rem', borderRadius: '16px', border: '1.5px solid var(--color-frost)', width: 'fit-content' }}>
        {(['all', 'PDF', 'DOCX', 'JSON'] as Filter[]).map(f => (
          <button 
            key={f} 
            style={{
              ...tabBtn(filter === f),
              padding: '0.6rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: filter === f ? 'var(--color-harbor)' : 'transparent',
              color: filter === f ? 'white' : 'var(--color-marine)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }} 
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Formats' : f}
          </button>
        ))}
      </div>

      {/* Export Items Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '24px', border: '1.5px dashed var(--color-frost)' }}>
            <p style={{ color: 'var(--color-marine)', fontWeight: 600, fontSize: '1.1rem' }}>
              {busy ? 'Retrieving your files...' : 'No export history found.'}
            </p>
            {!busy && (
              <button 
                style={{ ...btn('var(--color-glacier)'), marginTop: '1rem' }} 
                onClick={() => window.location.href = '/resume'}
              >
                Create First Export
              </button>
            )}
          </div>
        ) : (
          visible.map(e => (
            <div key={e.jobId} style={{ 
              background: 'white',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1.5px solid var(--color-frost)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Format Badge */}
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: `${fmtColor(e.format)}15`,
                color: fmtColor(e.format),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 900,
                border: `2px solid ${fmtColor(e.format)}30`
              }}>
                {e.format}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-depth)' }}>Resume #{e.resumeId}</strong>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    color: e.status === 'COMPLETED' ? '#10b981' : e.status === 'FAILED' ? '#ef4444' : '#f59e0b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {e.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-marine)', fontWeight: 500 }}>
                  Generated on {formatDate(e.createdAt)} · Job ID: {e.jobId.slice(0, 8)}
                </div>
                {e.status === 'FAILED' && e.errorMessage && (
                  <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                    Error: {e.errorMessage}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {e.status === 'COMPLETED' && (
                  <button 
                    onClick={() => exportApi.download(e.jobId)}
                    style={{ ...btn('var(--color-harbor)'), padding: '0.6rem 1.25rem' }}
                  >
                    Download
                  </button>
                )}
                <button 
                  style={btn('rgba(239, 68, 68, 0.1)', '#ef4444')} 
                  onClick={() => del(e.jobId)} 
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function StatMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '1.5rem', 
      borderRadius: '20px', 
      border: '1.5px solid var(--color-frost)',
      textAlign: 'center',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 900, color, marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-marine)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  )
}
