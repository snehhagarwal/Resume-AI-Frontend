import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 1rem',
        background: 'white',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          background: 'var(--color-frost)',
          borderRadius: '50%',
          zIndex: 0,
          opacity: 0.5
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Welcome to <span className="gradient-text">NextHire</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--color-marine)', 
            maxWidth: '700px', 
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            Your all-in-one AI-powered career assistant. Build stunning resumes, 
            get real-time job matching, and land your dream job with ease.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="premium-btn"
              onClick={() => navigate('/resume')}
              style={{ padding: '1rem 2rem', fontSize: '1rem' }}
            >
              Build My Resume
            </button>
            <button 
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                background: 'white',
                border: '1px solid var(--color-harbor)',
                color: 'var(--color-harbor)',
                borderRadius: '8px',
                fontWeight: 600
              }}
              onClick={() => navigate('/jobmatch')}
            >
              Explore Job Matches
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <FeatureCard 
          title="AI Resume Builder" 
          desc="Create professional resumes using state-of-the-art AI. Tailor your content for specific job descriptions automatically."
          color="var(--color-glacier)"
        />
        <FeatureCard 
          title="Smart Job Matching" 
          desc="Upload your resume and find matching jobs instantly using our JSearch integration. Get match scores and missing skill reports."
          color="var(--color-harbor)"
        />
        <FeatureCard 
          title="Live Notifications" 
          desc="Stay updated with real-time alerts. Get notified when your AI analysis is ready or when a new export is completed."
          color="var(--color-marine)"
        />
      </div>

      {/* Quick Links Section */}
      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--color-harbor)', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Quick Actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
          <QuickLink label="Choose Template" to="/templates" />
          <QuickLink label="Update Profile" to="/profile" />
          <QuickLink label="Recent Exports" to="/exports" />
        </div>
      </div>

      {/* NEW: How it Works Section */}
      <div style={{ 
        marginTop: '6rem', 
        padding: '5rem 2rem', 
        background: 'white', 
        borderRadius: '32px',
        border: '1.5px solid var(--color-frost)',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--color-depth)', fontWeight: 800, fontSize: '2.25rem', fontFamily: "'Outfit', sans-serif" }}>
          Your Path to Success
        </h2>
        <p style={{ color: 'var(--color-marine)', fontSize: '1.1rem', marginBottom: '4rem', fontWeight: 500 }}>
          Three simple steps to landing your next dream role.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2.5rem',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          <StepBox 
            num="01" 
            title="Select a Layout" 
            desc="Browse our gallery of expert-designed templates tailored for every industry." 
          />
          <StepBox 
            num="02" 
            title="Build with AI" 
            desc="Let our intelligence engine craft compelling summaries and impact-driven bullet points." 
          />
          <StepBox 
            num="03" 
            title="Land the Job" 
            desc="Download your high-ATS resume in multiple formats and start your applications." 
          />
        </div>
      </div>
    </div>
  )
}

function StepBox({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div style={{ textAlign: 'left', padding: '2rem', background: 'var(--color-frost)', borderRadius: '24px' }}>
      <div style={{ 
        fontSize: '3.5rem', 
        fontWeight: 900, 
        color: 'var(--color-harbor)', 
        opacity: 0.15, 
        lineHeight: 1,
        marginBottom: '-1.5rem',
        fontFamily: "'Outfit', sans-serif"
      }}>
        {num}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-depth)', marginBottom: '0.75rem', position: 'relative' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-marine)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
        {desc}
      </p>
    </div>
  )
}

function FeatureCard({ title, desc, color }: { title: string; desc: string; color: string }) {
  return (
    <div style={{
      background: 'white',
      padding: '2.5rem',
      borderRadius: '20px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--color-frost)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '1rem'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-10px)'
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
    }}>
      <div style={{ 
        height: '4px',
        width: '40px',
        background: color,
        borderRadius: '2px'
      }} />
      <h3 style={{ fontSize: '1.5rem', color: 'var(--color-depth)' }}>{title}</h3>
      <p style={{ color: 'var(--color-marine)', fontSize: '0.95rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

function QuickLink({ label, to }: { label: string; to: string }) {
  const navigate = useNavigate()
  return (
    <button 
      onClick={() => navigate(to)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        background: 'white',
        border: '1px solid var(--color-frost)',
        borderRadius: '12px',
        fontWeight: 600,
        color: 'var(--color-marine)',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-glacier)'
        e.currentTarget.style.color = 'var(--color-harbor)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-frost)'
        e.currentTarget.style.color = 'var(--color-marine)'
      }}
    >
      {label}
    </button>
  )
}
