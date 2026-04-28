import { useState, useEffect } from 'react'
import { resumeApi, jobMatchApi } from '../api'
import type { Resume, JobMatch } from '../types'
import { card, btn, input, select, C, errBox, scoreColor, tabBtn } from '../styles'

type Tab = 'find' | 'history' | 'top'

export default function JobMatchPage() {
  const [tab, setTab] = useState<Tab>('find')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [resumeId, setResumeId] = useState('')
  const [keywords, setKeywords] = useState('Software Engineer')
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [activeMatch, setActiveMatch] = useState<JobMatch | null>(null)
  const [recs, setRecs] = useState<string>('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [pendingJob, setPendingJob] = useState<JobMatch | null>(null)

  const run = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setErr(''); setBusy(true)
    try { return await fn() }
    catch (e: any) { 
      const status = e?.response?.status
      if (status === 403) {
        setErr('This feature requires a Premium subscription. Unlock full access to analyze your fit for every job!')
      } else {
        setErr(e?.response?.data?.error ?? e?.message ?? 'An error occurred') 
      }
      return null 
    }
    finally { setBusy(false) }
  }

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = () => run(async () => { 
    const d = await resumeApi.getAll(); 
    setResumes(d); 
    if (d.length > 0 && !resumeId) setResumeId(d[0].resumeId.toString())
    return d 
  })

  const fetchJobs = () => run(async () => {
    if (!resumeId) { setErr('Please select a base resume for keywords.'); return }
    const results = await jobMatchApi.fetchLinkedIn(Number(resumeId), keywords)
    setJobs(results)
    return results
  })

  const loadHistory = () => run(async () => { const d = await jobMatchApi.getMyMatches(); setMatches(d); return d })
  const loadTop = () => run(async () => { const d = await jobMatchApi.getTop(75); setMatches(d); return d })

  const startAnalysis = (job: JobMatch) => {
    setPendingJob(job)
    setShowModal(true)
  }

  const confirmAnalysis = (selectedResumeId: number) => run(async () => {
    if (!pendingJob) return
    const m = await jobMatchApi.analyze({
      resumeId: selectedResumeId,
      jobTitle: pendingJob.jobTitle,
      jobDescription: pendingJob.jobDescription,
      companyName: pendingJob.companyName,
      location: pendingJob.location,
      source: 'LINKEDIN'
    })
    setShowModal(false)
    setTab('history')
    setMatches(prev => [m, ...prev])
    return m
  })

  const loadRecs = (m: JobMatch) => run(async () => {
    setActiveMatch(m); setRecs('')
    const r = await jobMatchApi.getRecommendations(m.matchId)
    setRecs(r)
    return r
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'find',    label: 'Find Opportunities' },
    { key: 'history', label: 'My Analyses' },
    { key: 'top',     label: 'Top Matches' },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-depth)', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
          NextHire JobMatch AI
        </h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: 'var(--color-harbor)', borderRadius: '20px', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
          PREMIUM SUITE
        </div>
        <p style={{ marginTop: '1rem', color: 'var(--color-marine)', fontSize: '1rem', fontWeight: 500 }}>
          Discover and analyze your fit for the latest professional roles.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', background: 'white', padding: '0.5rem', borderRadius: '16px', border: '1.5px solid var(--color-frost)' }}>
        {tabs.map(t => (
          <button 
            key={t.key} 
            style={{
              ...tabBtn(tab === t.key),
              flex: 1,
              padding: '0.75rem',
              borderRadius: '12px',
              border: 'none',
              background: tab === t.key ? 'var(--color-harbor)' : 'transparent',
              color: tab === t.key ? 'white' : 'var(--color-marine)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }} 
            onClick={() => { 
              setTab(t.key)
              if (t.key === 'history') loadHistory()
              if (t.key === 'top') loadTop()
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {err && <div style={{ ...errBox, marginBottom: '2rem' }}>{err}</div>}

      <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
        {tab === 'find' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 1.5rem', color: 'var(--color-depth)', fontWeight: 800 }}>Search LinkedIn Jobs</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <label style={labelStyle}>Base Resume (for keywords)</label>
                  <select style={{ ...select, marginTop: '0.5rem' }} value={resumeId} onChange={e => setResumeId(e.target.value)}>
                    {resumes.map(r => <option key={r.resumeId} value={r.resumeId}>{r.title}</option>)}
                  </select>
                </div>
                <div style={{ flex: 2, minWidth: '300px' }}>
                  <label style={labelStyle}>Search Keywords</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <input style={{ ...input, marginBottom: 0, flex: 1 }} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. Frontend Developer Remote" />
                    <button style={{ ...btn(), padding: '0 2rem' }} onClick={fetchJobs} disabled={busy}>
                      {busy ? 'Searching...' : 'Find Jobs'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {jobs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {jobs.map((j, idx) => (
                  <JobCard key={idx} job={j} onAnalyze={() => startAnalysis(j)} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab !== 'find' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {matches.map(m => (
              <MatchItem key={m.matchId} match={m} active={activeMatch} busy={busy} recs={recs} onRecs={loadRecs} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ResumeSelectModal 
          resumes={resumes} 
          onClose={() => setShowModal(false)} 
          onSelect={confirmAnalysis} 
          busy={busy}
        />
      )}
    </div>
  )
}

function JobCard({ job, onAnalyze }: { job: JobMatch, onAnalyze: () => void }) {
  return (
    <div style={{ ...card, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem', color: 'var(--color-depth)', fontWeight: 800 }}>{job.jobTitle}</h4>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-marine)', fontSize: '0.85rem', fontWeight: 600 }}>
          <span>{job.companyName || 'Unknown Company'}</span>
          <span>•</span>
          <span>{job.location || 'Remote'}</span>
        </div>
      </div>
      <button style={{ ...btn('var(--color-glacier)'), padding: '0.75rem 1.5rem' }} onClick={onAnalyze}>
        Analyze Job-Fit
      </button>
    </div>
  )
}

function MatchItem({ match, active, busy, recs, onRecs }: any) {
  const m = match
  return (
    <div style={{ ...card, padding: '1.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ 
          width: '70px', height: '70px', borderRadius: '50%', background: 'var(--color-frost)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `4px solid ${scoreColor(m.matchScore)}`,
          fontWeight: 900, color: 'var(--color-depth)', fontSize: '1.25rem'
        }}>
          {m.matchScore}%
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.25rem', fontWeight: 800 }}>{m.jobTitle}</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-marine)', fontWeight: 600 }}>
            {m.companyName} · {m.location} · Resume #{m.resumeId}
          </p>
        </div>
        <button 
          style={btn(active?.matchId === m.matchId ? 'var(--color-harbor)' : 'var(--color-frost)', active?.matchId === m.matchId ? 'white' : 'var(--color-harbor)')}
          onClick={() => onRecs(m)}
          disabled={busy}
        >
          {active?.matchId === m.matchId ? 'Hide Analysis' : 'View AI Analysis'}
        </button>
      </div>

      {active?.matchId === m.matchId && (
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--color-frost)', borderRadius: '12px' }}>
          <h5 style={{ margin: '0 0 1rem', fontWeight: 800 }}>Tailoring Recommendations</h5>
          {recs ? <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>{recs}</div> : 'Loading AI insights...'}
        </div>
      )}
    </div>
  )
}

function ResumeSelectModal({ resumes, onClose, onSelect, busy }: any) {
  const [sid, setSid] = useState(resumes[0]?.resumeId || '')
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ ...card, width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <h3 style={{ margin: '0 0 1rem' }}>Analyze This Role</h3>
        <p style={{ color: 'var(--color-marine)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Select which resume you'd like to compare against this job description.
        </p>
        <select 
          style={{ ...select, width: '100%', marginBottom: '2rem' }} 
          value={sid} 
          onChange={e => setSid(e.target.value)}
        >
          {resumes.map((r: Resume) => <option key={r.resumeId} value={r.resumeId}>{r.title}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ ...btn(), flex: 1 }} onClick={() => onSelect(Number(sid))} disabled={busy}>
            {busy ? 'Analyzing...' : 'Confirm & Analyze'}
          </button>
          <button style={{ ...btn('white', 'var(--color-marine)'), flex: 1 }} onClick={onClose} disabled={busy}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 800,
  color: 'var(--color-depth)',
  marginLeft: '0.25rem'
}
