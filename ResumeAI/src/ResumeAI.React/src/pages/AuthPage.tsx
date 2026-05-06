import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(fullName, email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-gradient)',
      padding: '1.5rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '3rem',
        width: '100%',
        maxWidth: '450px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontFamily: "'Outfit', sans-serif", 
            fontSize: '2.5rem', 
            fontWeight: 700,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ color: 'var(--color-harbor)' }}>Next</span>
            <span style={{ color: 'var(--color-glacier)' }}>Hire</span>
          </h1>
          <p style={{ color: 'var(--color-marine)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Welcome back! Please enter your details.' : 'Start your professional journey today.'}
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fff1f2',
            border: '1px solid #fda4af',
            color: '#be123c',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input 
                style={inputStyle} 
                placeholder="Enter your name" 
                value={fullName}
                onChange={e => setFullName(e.target.value)} 
                required 
              />
            </div>
          )}
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input 
              style={inputStyle} 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input 
              style={inputStyle} 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPass(e.target.value)} 
              required 
            />
          </div>

          <button 
            style={{
              ...buttonStyle,
              background: loading ? 'var(--color-marine)' : 'var(--color-harbor)',
              marginTop: '0.5rem'
            }} 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-marine)', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-frost)' }}></div>
          OR CONTINUE WITH
          <div style={{ flex: 1, height: '1px', background: 'var(--color-frost)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={authApi.googleLogin}
            style={{ ...socialButtonStyle, flex: 1 }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--color-frost)'}
            onMouseOut={e => e.currentTarget.style.background = 'white'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-marine)', marginTop: '0.5rem' }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-harbor)', 
              cursor: 'pointer', 
              fontWeight: 700,
              textDecoration: 'underline'
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem'
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--color-depth)',
  marginLeft: '0.2rem'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: '12px',
  border: '1.5px solid var(--color-frost)',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s',
  background: 'white'
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem',
  borderRadius: '12px',
  border: 'none',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: 'var(--shadow-md)'
}

const socialButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.8rem',
  borderRadius: '12px',
  border: '1.5px solid var(--color-frost)',
  background: 'white',
  color: 'var(--color-depth)',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  transition: 'all 0.2s ease'
}
