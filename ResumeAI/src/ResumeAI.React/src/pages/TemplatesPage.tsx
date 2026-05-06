import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { templateApi } from '../api'
import { useAuth } from '../context/AuthContext'
import type { Template, TemplatePreview, TemplateCategory } from '../types'
import { card, btn, C, errBox, pill } from '../styles'

const CATEGORIES: TemplateCategory[] = [
  'PROFESSIONAL', 'CREATIVE', 'MODERN', 'MINIMALIST',
]

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const { user } = useAuth()
  const [selected,  setSelected]  = useState<Template | null>(null)
  const [preview,   setPreview]   = useState<TemplatePreview | null>(null)
  const [tab,       setTab]       = useState<'all' | 'free' | 'premium' | 'popular' | TemplateCategory>('all')
  const [loading,   setLoading]   = useState(false)
  const [prevLoading, setPrevLoad] = useState(false)
  const [err,       setErr]       = useState('')

  const load = async (t: typeof tab) => {
    setLoading(true); setTab(t); setErr('')
    try {
      let data: Template[]
      if      (t === 'all')     data = await templateApi.getAll()
      else if (t === 'free')    data = await templateApi.getFree()
      else if (t === 'premium') data = await templateApi.getPremium()
      else if (t === 'popular') data = await templateApi.getPopular(12)
      else                      data = await templateApi.getByCategory(t)
      setTemplates(data)
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? 'Failed to load templates')
    } finally { setLoading(false) }
  }

  useEffect(() => { load('all') }, [])

  const selectTemplate = async (t: Template) => {
    setSelected(t); setPreview(null); setPrevLoad(true)
    try {
      const p = await templateApi.getPreview(t.templateId)
      setPreview(p)
    } catch { /* preview may not exist */ }
    finally { setPrevLoad(false) }
  }

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 800, 
          color: 'var(--color-depth)', 
          marginBottom: '1rem',
          fontFamily: "'Outfit', sans-serif"
        }}>
          Resume Templates
        </h1>
        <p style={{ color: 'var(--color-marine)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
          Elevate your application with precision-engineered layouts designed by industry experts.
        </p>
      </header>

      {/* Modern Filter Interface */}
      <div style={{ 
        background: 'white',
        padding: '2rem',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '3.5rem',
        border: '1.5px solid var(--color-frost)'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '1.5px solid var(--color-frost)', paddingBottom: '1.5rem' }}>
          {(['all', 'free', 'premium', 'popular'] as const).map(t => (
            <button 
              key={t} 
              style={{
                background: tab === t ? 'var(--color-harbor)' : 'transparent',
                color: tab === t ? 'white' : 'var(--color-marine)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => load(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-harbor)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '0.5rem' }}>Categories</span>
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              style={{
                background: tab === cat ? 'var(--color-glacier)' : 'var(--color-frost)',
                color: tab === cat ? 'white' : 'var(--color-harbor)',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => load(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {err && <div style={{ ...errBox, marginBottom: '2rem' }}>{err}</div>}

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        {/* Template Grid */}
        <div style={{ 
          flex: 1, 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: '2rem' 
        }}>
          {loading ? (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--color-marine)' }}>
               <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading collection...</div>
             </div>
          ) : templates.map(t => (
            <TemplateCard
              key={t.templateId}
              template={t}
              isSelected={selected?.templateId === t.templateId}
              onClick={() => selectTemplate(t)}
            />
          ))}
          {!loading && templates.length === 0 && (
            <div style={{ color: 'var(--color-marine)', gridColumn: '1/-1', textAlign: 'center', padding: '6rem', background: 'white', borderRadius: '24px', border: '1.5px dashed var(--color-frost)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No templates found in this category.</div>
              <button style={{ ...linkButtonStyle, marginTop: '1rem' }} onClick={() => load('all')}>View All Templates</button>
            </div>
          )}
        </div>

        {/* Dynamic Detail Panel */}
        {selected && (
          <aside style={{ 
            width: '560px', 
            position: 'sticky', 
            top: '100px',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{...card, padding: '2rem', borderRadius: '24px', border: '1.5px solid var(--color-glacier)'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: 'var(--color-depth)', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{selected.name}</h2>
                <button 
                  onClick={() => { setSelected(null); setPreview(null) }}
                  style={{ background: 'var(--color-frost)', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 800, color: 'var(--color-harbor)' }}
                >✕</button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ ...pill(selected.isPremium ? 'var(--color-harbor)' : '#10b981'), fontSize: '10px' }}>
                  {selected.isPremium ? 'PREMIUM' : 'FREE'}
                </span>
                <span style={{ ...pill('var(--color-frost)', 'var(--color-harbor)'), fontSize: '10px' }}>{selected.category}</span>
              </div>

              <p style={{ color: 'var(--color-marine)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {selected.description}
              </p>

              <div style={{ borderTop: '1.5px solid var(--color-frost)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-depth)', fontWeight: 800 }}>Live Preview</h4>
                  {prevLoading && <span style={{ fontSize: '0.8rem', color: 'var(--color-marine)', fontWeight: 600 }}>Rendering...</span>}
                </div>
                
                  <div style={{ 
                    background: 'white', 
                    border: '1.5px solid var(--color-frost)', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    height: '700px',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.03)'
                  }}>
                  {preview ? (
                    <iframe
                      title="Template Preview"
                      srcDoc={`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>html,body{margin:0;padding:0;font-family:sans-serif;overflow:hidden;scrollbar-width:none;-ms-overflow-style:none;}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;}body{padding:20px;transform:scale(0.7);transform-origin:top center;}${preview.cssStyles}</style></head><body>${preview.htmlLayout}</body></html>`}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      sandbox="allow-same-origin"
                    />
                  ) : !prevLoading && (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-marine)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                      Initializing live preview module...
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                style={{ 
                  ...btn(selected.isPremium && user?.subscriptionPlan !== 'PREMIUM' ? 'var(--color-frost)' : 'var(--color-harbor)'), 
                  width: '100%', 
                  marginTop: '2rem', 
                  padding: '1rem',
                  color: selected.isPremium && user?.subscriptionPlan !== 'PREMIUM' ? 'var(--color-marine)' : 'white',
                  cursor: selected.isPremium && user?.subscriptionPlan !== 'PREMIUM' ? 'not-allowed' : 'pointer'
                }}
                disabled={selected.isPremium && user?.subscriptionPlan !== 'PREMIUM'}
                onClick={() => navigate('/resume')}
              >
                {selected.isPremium && user?.subscriptionPlan !== 'PREMIUM' ? 'Premium Required 🔒' : 'Use This Layout'}
              </button>
              {selected.isPremium && user?.subscriptionPlan !== 'PREMIUM' && (
                <p style={{ color: 'var(--color-harbor)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center', fontWeight: 600 }}>
                  This layout is exclusive to Premium members.
                </p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

function TemplateCard({ template: t, isSelected, onClick }: {
  template: Template; isSelected: boolean; onClick: () => void
}) {
  return (
    <div 
      onClick={onClick} 
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '1.25rem',
        cursor: 'pointer',
        border: `2px solid ${isSelected ? 'var(--color-glacier)' : 'var(--color-frost)'}`,
        boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseOver={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(-6px)'
          e.currentTarget.style.borderColor = 'var(--color-glacier)'
        }
      }}
      onMouseOut={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = 'var(--color-frost)'
        }
      }}
    >
      {/* Visual Mockup Area */}
      <div style={{
        height: '180px',
        background: 'var(--color-frost)',
        borderRadius: '16px',
        marginBottom: '1.25rem',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        position: 'relative'
      }}>
        {/* Document Mockup Elements */}
        <div style={{ height: '12px', width: '60%', background: 'white', borderRadius: '6px' }} />
        <div style={{ height: '8px', width: '40%', background: 'white', borderRadius: '4px', opacity: 0.6 }} />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
             <div style={{ height: '6px', width: '100%', background: 'white', borderRadius: '3px' }} />
             <div style={{ height: '6px', width: '80%', background: 'white', borderRadius: '3px' }} />
          </div>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
           <div style={{ height: '6px', width: '100%', background: 'white', borderRadius: '3px', opacity: 0.4 }} />
           <div style={{ height: '6px', width: '90%', background: 'white', borderRadius: '3px', opacity: 0.4 }} />
           <div style={{ height: '6px', width: '95%', background: 'white', borderRadius: '3px', opacity: 0.4 }} />
        </div>
        
        {/* Category Badge overlay */}
        <div style={{ 
          position: 'absolute', 
          bottom: '1rem', 
          right: '1rem', 
          fontSize: '0.6rem', 
          fontWeight: 900, 
          color: 'var(--color-marine)', 
          letterSpacing: '1px' 
        }}>
          {t.category}
        </div>
      </div>
      
      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-depth)', marginBottom: '0.25rem' }}>
        {t.name}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-marine)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {t.category}
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 800,
          color: t.isPremium ? 'white' : '#10b981',
          background: t.isPremium ? 'var(--color-harbor)' : '#ecfdf5',
          padding: '4px 10px',
          borderRadius: '8px'
        }}>
          {t.isPremium ? 'PREMIUM' : 'FREE'}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-marine)', fontWeight: 600 }}>
          #{t.templateId}
        </span>
      </div>
    </div>
  )
}

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-harbor)',
  fontWeight: 800,
  fontSize: '0.9rem',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline'
}
