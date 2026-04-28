import { useState, useCallback, useEffect } from 'react'
import { resumeApi, sectionApi, aiApi, exportApi, templateApi } from '../api'
import { useAuth } from '../context/AuthContext'
import type { Resume, Section, AiRequest, ExportJob, Template } from '../types'
import { card, btn, input, textarea, select, C, errBox, pre, scoreColor } from '../styles'

const SECTION_TYPES = ['SUMMARY','EXPERIENCE','EDUCATION','SKILLS','CERTIFICATIONS','PROJECTS','LANGUAGES','CUSTOM']
const LANGUAGES = ['English','Spanish','French','German','Portuguese','Chinese','Arabic','Hindi','Japanese']

type Tab = 'resumes' | 'sections' | 'ai' | 'export'

export default function ResumeFlowPage() {
  const [tab, setTab] = useState<Tab>('resumes')
  const [activeResume, setActive] = useState<Resume | null>(null)
  const [resumes,  setResumes]  = useState<Resume[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [aiResult, setAiResult] = useState<AiRequest | null>(null)
  const [expJob,   setExpJob]   = useState<ExportJob | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setErr(''); setBusy(true)
    try { return await fn() }
    catch (e: any) { setErr(e?.response?.data?.error ?? e?.message ?? 'Error'); return null }
    finally { setBusy(false) }
  }, [])

  const loadResumes  = useCallback(() => run(async () => { const d = await resumeApi.getAll(); setResumes(d); return d }), [run])
  const loadSections = useCallback(() => run(async () => { if (!activeResume) return; const d = await sectionApi.getByResume(activeResume.resumeId); setSections(d); return d }), [run, activeResume])
  const loadTemplates = useCallback(() => run(async () => { const d = await templateApi.getAll(); setTemplates(d); return d }), [run])

  useEffect(() => { loadTemplates() }, [loadTemplates])

  const tabs: { key: Tab; label: string; step: number }[] = [
    { key: 'resumes',  label: 'Resumes',  step: 1 },
    { key: 'sections', label: 'Sections', step: 2 },
    { key: 'ai',       label: 'AI Tools', step: 3 },
    { key: 'export',   label: 'Export',   step: 4 },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-depth)', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
          Resume Builder
        </h1>
        {activeResume ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'var(--color-frost)', padding: '0.5rem 1.25rem', borderRadius: '30px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--color-marine)', fontWeight: 600 }}>Active Resume:</span>
            <span style={{ fontWeight: 800, color: 'var(--color-harbor)' }}>{activeResume.title}</span>
            <span style={{ width: '1px', height: '14px', background: 'var(--color-marine)', opacity: 0.3 }}></span>
            <span style={{ color: scoreColor(activeResume.atsScore), fontWeight: 800 }}>ATS {activeResume.atsScore}%</span>
          </div>
        ) : (
          <p style={{ color: 'var(--color-marine)', fontSize: '1rem', fontWeight: 500 }}>
            Start by selecting or creating a resume below.
          </p>
        )}
      </header>

      {/* Stepped Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '3rem',
        position: 'relative',
        padding: '0 1rem'
      }}>
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '2rem',
          right: '2rem',
          height: '2px',
          background: 'var(--color-frost)',
          zIndex: 0
        }} />

        {tabs.map((t, i) => {
          const isActive = tab === t.key
          const isCompleted = tabs.findIndex(curr => curr.key === tab) > i
          return (
            <button 
              key={t.key} 
              onClick={() => setTab(t.key)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                zIndex: 1,
                minWidth: '100px'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isActive ? 'var(--color-harbor)' : isCompleted ? 'var(--color-glacier)' : 'white',
                border: `2px solid ${isActive ? 'var(--color-harbor)' : isCompleted ? 'var(--color-glacier)' : 'var(--color-frost)'}`,
                color: isActive || isCompleted ? 'white' : 'var(--color-marine)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : t.step}
              </div>
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: isActive ? 800 : 600, 
                color: isActive ? 'var(--color-depth)' : 'var(--color-marine)',
                transition: 'all 0.3s ease'
              }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>



      <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
        {tab === 'resumes'  && <ResumesTab  run={run} busy={busy} resumes={resumes} active={activeResume} setActive={setActive} load={loadResumes} templates={templates} />}
        {tab === 'sections' && <SectionsTab run={run} busy={busy} sections={sections} active={activeResume} load={loadSections} setSections={setSections} />}
        {tab === 'ai'       && <AiTab       run={run} busy={busy} active={activeResume} sections={sections} result={aiResult} setResult={setAiResult} loadSections={loadSections} />}
        {tab === 'export'   && <ExportTab   run={run} busy={busy} active={activeResume} job={expJob} setJob={setExpJob} />}
      </div>
    </div>
  )
}

// ── Tab 1: Resumes ─────────────────────────────────────────────────────────────
function ResumesTab({ run, busy, resumes, active, setActive, load, templates }: any) {
  const [title, setTitle] = useState('My Software Engineer Resume')
  const [job,   setJob]   = useState('Senior Software Engineer')
  const [tmpl,  setTmpl]  = useState('1')
  const { user } = useAuth()
  const [editId, setEditId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editJob,   setEditJob]   = useState('')

  const create = () => run(async () => {
    const selectedTemplate = templates.find((t: any) => t.templateId === Number(tmpl))
    if (selectedTemplate?.isPremium && user?.subscriptionPlan !== 'PREMIUM') {
      throw new Error(`The '${selectedTemplate.name}' layout is a Premium feature. Please upgrade your plan to use it.`)
    }
    const r = await resumeApi.create({ title, targetJobTitle: job, templateId: Number(tmpl) })
    setActive(r); await load()
  })
  const duplicate = (r: Resume) => run(async () => { const c = await resumeApi.duplicate(r.resumeId); setActive(c); await load() })
  const publish   = (r: Resume) => run(async () => { const u = await (r.isPublic ? resumeApi.unpublish : resumeApi.publish)(r.resumeId); if (active?.resumeId === u.resumeId) setActive(u); await load() })
  const del       = (r: Resume) => run(async () => { await resumeApi.delete(r.resumeId); if (active?.resumeId === r.resumeId) setActive(null); await load() })
  const saveEdit  = (r: Resume) => run(async () => { const u = await resumeApi.update(r.resumeId, { title: editTitle, targetJobTitle: editJob }); if (active?.resumeId === u.resumeId) setActive(u); setEditId(null); await load() })

  return (
    <div style={card}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem', color: 'var(--color-depth)', fontWeight: 800 }}>Create New Resume</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <input style={input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Resume Name (e.g. Frontend Specialist)" />
          <input style={input} value={job}   onChange={e => setJob(e.target.value)}   placeholder="Target Position" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
          <select style={select} value={tmpl} onChange={e => setTmpl(e.target.value)}>
            <option value="">Select a Template...</option>
            {templates.map((t: any) => (
              <option key={t.templateId} value={t.templateId} disabled={t.isPremium && user?.subscriptionPlan !== 'PREMIUM'}>
                {t.name} {t.isPremium ? '(PREMIUM)' : '(FREE)'} {t.isPremium && user?.subscriptionPlan !== 'PREMIUM' ? '🔒' : ''}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={btn()} onClick={create} disabled={busy}>Create</button>
            <button style={btn('var(--color-frost)', 'var(--color-harbor)')} onClick={load} disabled={busy}>Load Existing</button>
          </div>
        </div>
      </div>

      {resumes.length > 0 && (
        <>
          <div style={{ margin: '2.5rem 0 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-depth)', fontWeight: 800, whiteSpace: 'nowrap' }}>Your Resumes</h3>
            <div style={{ height: '1.5px', background: 'var(--color-frost)', flex: 1 }}></div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resumes.map((r: Resume) => (
              <div 
                key={r.resumeId} 
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: '16px', 
                  border: `1.5px solid ${active?.resumeId === r.resumeId ? 'var(--color-glacier)' : 'var(--color-frost)'}`,
                  background: active?.resumeId === r.resumeId ? 'var(--color-frost)' : 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                {editId === r.resumeId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input style={{ ...input, marginBottom: 0 }} value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                    <input style={{ ...input, marginBottom: 0 }} value={editJob}   onChange={e => setEditJob(e.target.value)}   />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={btn('var(--color-glacier)')} onClick={() => saveEdit(r)} disabled={busy}>Save Changes</button>
                      <button style={btn('transparent', 'var(--color-marine)')}  onClick={() => setEditId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--color-depth)' }}>{r.title}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-marine)', fontWeight: 700, padding: '2px 6px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                          ID: {r.resumeId}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-marine)', fontWeight: 500 }}>
                        {r.targetJobTitle} · <span style={{ color: scoreColor(r.atsScore), fontWeight: 700 }}>ATS {r.atsScore}%</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        style={btn(active?.resumeId === r.resumeId ? 'var(--color-harbor)' : 'white', active?.resumeId === r.resumeId ? '#fff' : 'var(--color-harbor)')} 
                        onClick={() => setActive(r)}
                        disabled={active?.resumeId === r.resumeId}
                      >
                        {active?.resumeId === r.resumeId ? 'Active' : 'Select'}
                      </button>
                      <button style={btn('white', 'var(--color-marine)')} onClick={() => { setEditId(r.resumeId); setEditTitle(r.title); setEditJob(r.targetJobTitle) }}>Edit</button>
                      <button style={btn('white', 'var(--color-marine)')} onClick={() => duplicate(r)} disabled={busy}>Duplicate</button>
                      <button style={btn('white', r.isPublic ? 'var(--color-marine)' : 'var(--color-glacier)')} onClick={() => publish(r)} disabled={busy}>
                        {r.isPublic ? 'Make Private' : 'Make Public'}
                      </button>
                      <button style={btn('rgba(239, 68, 68, 0.1)', '#ef4444')} onClick={() => del(r)} disabled={busy}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Tab 2: Sections ────────────────────────────────────────────────────────────
function SectionsTab({ run, busy, sections, active, load, setSections }: any) {
  const [sType,    setSType]   = useState('SUMMARY')
  const [sTitle,   setSTitle]  = useState('Professional Summary')
  const [sContent, setSContent]= useState('')
  const [editId,   setEditId]  = useState<number | null>(null)
  const [editData, setEditData]= useState({ title: '', content: '', isVisible: true })

  if (!active) return <div style={card}><p style={{ color: 'var(--color-marine)', fontWeight: 600, textAlign: 'center', padding: '2rem' }}>Please select a resume in the first tab to continue.</p></div>

  const addSection = () => run(async () => {
    await sectionApi.add({ resumeId: active.resumeId, sectionType: sType, title: sTitle, content: sContent, displayOrder: sections.length + 1 })
    setSContent(''); await load()
  })
  const del      = (id: number) => run(async () => { await sectionApi.delete(id); await load() })
  const toggle   = (id: number) => run(async () => { await sectionApi.toggleVisibility(id); await load() })
  const saveEdit = (id: number) => run(async () => { await sectionApi.update(id, editData); setEditId(null); await load() })
  const moveUp   = (i: number) => run(async () => {
    if (i === 0) return
    const ids = sections.map((s: Section) => s.sectionId)
    ;[ids[i-1], ids[i]] = [ids[i], ids[i-1]]
    await sectionApi.reorder(active.resumeId, ids); await load()
  })
  const moveDown = (i: number) => run(async () => {
    if (i === sections.length - 1) return
    const ids = sections.map((s: Section) => s.sectionId)
    ;[ids[i], ids[i+1]] = [ids[i+1], ids[i]]
    await sectionApi.reorder(active.resumeId, ids); await load()
  })

  return (
    <div style={card}>
      <header style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-depth)', fontWeight: 800 }}>Manage Sections</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-marine)' }}>Configuring components for {active.title}</p>
      </header>

      <div style={{ background: 'var(--color-frost)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
          <select style={{ ...select, marginBottom: 0 }} value={sType} onChange={e => setSType(e.target.value)}>
            {SECTION_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input style={{ ...input, marginBottom: 0 }} value={sTitle} onChange={e => setSTitle(e.target.value)} placeholder="Display Title" />
        </div>
        <textarea 
          style={{ ...textarea, height: '120px' }} 
          value={sContent} 
          onChange={e => setSContent(e.target.value)} 
          placeholder="Detailed section content... (Tip: use AI tools in the next tab to generate this!)" 
        />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button style={btn()} onClick={addSection} disabled={busy}>Add Component</button>
          <button style={btn('white', 'var(--color-marine)')} onClick={load} disabled={busy}>Refresh List</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sections.map((s: Section, i: number) => (
          <div 
            key={s.sectionId} 
            style={{ 
              padding: '1.25rem', 
              borderRadius: '16px', 
              border: '1.5px solid var(--color-frost)',
              background: s.isVisible ? 'white' : 'rgba(0,0,0,0.02)',
              opacity: s.isVisible ? 1 : 0.7
            }}
          >
            {editId === s.sectionId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input    style={{ ...input, marginBottom: 0 }}    value={editData.title}   onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} />
                <textarea style={{ ...textarea, marginBottom: 0 }} value={editData.content} onChange={e => setEditData(d => ({ ...d, content: e.target.value }))} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={btn()} onClick={() => saveEdit(s.sectionId)} disabled={busy}>Save Changes</button>
                  <button style={btn('transparent', 'var(--color-marine)')}  onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button style={navBtnStyle} onClick={() => moveUp(i)} disabled={i===0 || busy}>▲</button>
                  <button style={navBtnStyle} onClick={() => moveDown(i)} disabled={i===sections.length-1 || busy}>▼</button>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-depth)' }}>{s.title}</strong>
                    <span style={badgeStyle}>{s.sectionType}</span>
                    {s.isAiGenerated && <span style={{ ...badgeStyle, background: '#f3e8ff', color: '#7c3aed' }}>AI Enhanced</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-marine)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {s.content.slice(0, 150)}{s.content.length > 150 ? '...' : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={btn('white', 'var(--color-marine)')}  onClick={() => { setEditId(s.sectionId); setEditData({ title: s.title, content: s.content, isVisible: s.isVisible }) }}>Edit</button>
                  <button style={btn('white', s.isVisible ? 'var(--color-marine)' : 'var(--color-glacier)')} onClick={() => toggle(s.sectionId)} disabled={busy}>{s.isVisible ? 'Hide' : 'Show'}</button>
                  <button style={btn('rgba(239, 68, 68, 0.1)', '#ef4444')} onClick={() => del(s.sectionId)} disabled={busy}>Remove</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab 3: AI ──────────────────────────────────────────────────────────────────
function AiTab({ run, busy, active, sections, result, setResult, loadSections }: any) {
  const [jobTitle, setJobTitle]   = useState('Senior Software Engineer')
  const [skills,   setSkills]     = useState('C#, .NET, React, PostgreSQL')
  const [yoe,      setYoe]        = useState('5')
  const [company,  setCompany]    = useState('Acme Corp')
  const [resps,    setResps]      = useState('Design scalable microservices, lead code reviews')
  const [jobDesc,  setJobDesc]    = useState('')
  const [sectionId,setSectionId]  = useState('')
  const [impGoal,  setImpGoal]    = useState('Make it more impactful and metrics-driven')
  const [lang,     setLang]       = useState('Spanish')

  if (!active) return <div style={card}><p style={{ color: 'var(--color-marine)', fontWeight: 600, textAlign: 'center', padding: '2rem' }}>Please select a resume in the first tab to continue.</p></div>

  const ai = async (fn: () => Promise<AiRequest>) => {
    const r = await run(fn)
    if (r) setResult(r)
  }

  return (
    <div style={card}>
      <header style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-depth)', fontWeight: 800 }}>Intelligence Hub</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-marine)' }}>Generate and optimize professional content</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div style={inputGroupStyle}><label style={labelStyle}>Target Role</label><input style={{ ...input, marginBottom: 0 }} value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></div>
        <div style={inputGroupStyle}><label style={labelStyle}>Years Experience</label><input style={{ ...input, marginBottom: 0 }} value={yoe} onChange={e => setYoe(e.target.value)} /></div>
        <div style={inputGroupStyle}><label style={labelStyle}>Primary Skills</label><input style={{ ...input, marginBottom: 0 }} value={skills} onChange={e => setSkills(e.target.value)} /></div>
        <div style={inputGroupStyle}><label style={labelStyle}>Target Company</label><input style={{ ...input, marginBottom: 0 }} value={company} onChange={e => setCompany(e.target.value)} /></div>
      </div>
      
      <div style={inputGroupStyle}><label style={labelStyle}>Job Description (Optional)</label><textarea style={{ ...textarea, height: '80px' }} value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Paste JD for tailored results..." /></div>
      <div style={inputGroupStyle}><label style={labelStyle}>Your Responsibilities</label><textarea style={{ ...textarea, height: '80px' }} value={resps} onChange={e => setResps(e.target.value)} placeholder="Briefly list what you did..." /></div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '2rem 0' }}>
        <button style={btn()} onClick={() => ai(() => aiApi.generateSummary({ resumeId: active.resumeId, jobTitle, yearsOfExperience: Number(yoe), keySkills: skills }))} disabled={busy}>Generate Summary</button>
        <button style={btn('var(--color-glacier)')} onClick={() => ai(() => aiApi.generateBullets({ resumeId: active.resumeId, jobTitle, companyName: company, responsibilities: resps }))} disabled={busy}>Write Bullets</button>
        <button style={btn('var(--color-glacier)')} onClick={() => ai(() => aiApi.checkAts({ resumeId: active.resumeId, jobDescription: jobDesc }))} disabled={busy}>Analyze ATS</button>
        <button style={btn('var(--color-glacier)')} onClick={() => ai(() => aiApi.suggestSkills({ resumeId: active.resumeId, targetJobTitle: jobTitle }))} disabled={busy}>Suggest Skills</button>
      </div>

      <div style={{ padding: '1.5rem', background: 'var(--color-frost)', borderRadius: '16px', marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--color-harbor)' }}>Premium Power-ups</h4>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button style={btn('var(--color-harbor)')} onClick={() => ai(() => aiApi.generateCoverLetter({ resumeId: active.resumeId, jobDescription: jobDesc, companyName: company }))} disabled={busy}>Draft Cover Letter</button>
          <button style={btn('var(--color-harbor)')} onClick={() => ai(() => aiApi.tailorForJob({ resumeId: active.resumeId, jobTitle, jobDescription: jobDesc }))} disabled={busy}>Tailor Everything</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Component</label>
            <select style={{ ...select, marginBottom: 0 }} value={sectionId} onChange={e => setSectionId(e.target.value)}>
              <option value="">Choose...</option>
              {sections.map((s: Section) => <option key={s.sectionId} value={s.sectionId}>{s.title}</option>)}
            </select>
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Goal</label>
            <input style={{ ...input, marginBottom: 0 }} value={impGoal} onChange={e => setImpGoal(e.target.value)} placeholder="e.g. make it more technical" />
          </div>
          <button style={btn('var(--color-marine)')} onClick={() => {
            const sec = sections.find((s: Section) => s.sectionId === Number(sectionId));
            if (!sec) return;
            ai(() => aiApi.improveSection({ resumeId: active.resumeId, sectionId: Number(sectionId), currentContent: sec.content, improvementHint: impGoal }));
          }} disabled={busy || !sectionId}>Improve</button>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '2px solid var(--color-frost)', paddingTop: '2rem' }}>
          <div style={{ fontWeight: 800, color: 'var(--color-depth)', marginBottom: '1rem' }}>Generated: {result.requestType}</div>
          <pre style={{ ...pre, background: 'var(--color-frost)', color: 'var(--color-depth)', border: 'none', borderRadius: '16px' }}>{result.aiResponse}</pre>
        </div>
      )}
    </div>
  )
}

// ── Tab 4: Export ──────────────────────────────────────────────────────────────
function ExportTab({ run, busy, active, job, setJob }: any) {
  const [polling, setPolling] = useState(false)

  if (!active) return <div style={card}><p style={{ color: 'var(--color-marine)', fontWeight: 600, textAlign: 'center', padding: '2rem' }}>Please select a resume in the first tab to continue.</p></div>

  const doExport = async (fn: () => Promise<ExportJob>) => {
    const j = await run(fn); if (j) { setJob(j); autoPoll(j) }
  }

  const autoPoll = async (j: ExportJob) => {
    if (j.status === 'COMPLETED' || j.status === 'FAILED') return
    setPolling(true)
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 2000))
      const fresh = await exportApi.getStatus(j.jobId).catch(() => null)
      if (!fresh) break
      setJob(fresh)
      if (fresh.status === 'COMPLETED' || fresh.status === 'FAILED') break
    }
    setPolling(false)
  }

  return (
    <div style={card}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-depth)', fontWeight: 800, fontSize: '1.5rem' }}>Finalize & Download</h3>
        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--color-marine)' }}>Get your resume ready for applications</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
        <ExportCard type="PDF" color="#ef4444" desc="Universal standard format" onClick={() => doExport(() => exportApi.exportPdf(active.resumeId))} busy={busy} />
        <ExportCard type="DOCX" color="#3b82f6" desc="Editable Microsoft Word" onClick={() => doExport(() => exportApi.exportDocx(active.resumeId))} busy={busy} />
        <ExportCard type="JSON" color="#10b981" desc="Raw data for porting" onClick={() => doExport(() => exportApi.exportJson(active.resumeId))} busy={busy} />
      </div>

      {job && (
        <div style={{ background: 'var(--color-frost)', borderRadius: '24px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-depth)', marginBottom: '0.5rem' }}>
            Status: {job.status}
          </div>
          {polling && <p style={{ color: 'var(--color-marine)', fontSize: '0.9rem' }}>Preparing your file, please wait...</p>}
          {job.status === 'COMPLETED' && (
            <div style={{ marginTop: '1.5rem' }}>
              <a href={exportApi.downloadUrl(job.jobId)}
                style={{ ...btn(), padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-block' }}>
                Download {job.format} File
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ExportCard({ type, color, desc, onClick, busy }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={busy}
      style={{
        background: 'white',
        border: '1.5px solid var(--color-frost)',
        borderRadius: '20px',
        padding: '2rem',
        width: '200px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'var(--color-frost)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: '2.5rem', fontWeight: 900, color }}>{type}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-marine)', fontWeight: 600 }}>{desc}</div>
    </button>
  )
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

const navBtnStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid var(--color-frost)',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '10px',
  cursor: 'pointer',
  color: 'var(--color-marine)'
}

const badgeStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  background: '#e0e7ff',
  color: '#4338ca',
  borderRadius: '6px',
  padding: '2px 8px',
  fontWeight: 700
}

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem'
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: 'var(--color-marine)',
  marginLeft: '0.2rem'
}
