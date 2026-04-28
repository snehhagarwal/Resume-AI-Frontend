import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: 'var(--color-depth)',
      padding: '6rem 2rem 3rem',
      marginTop: 'auto',
      borderTop: '1px solid var(--glass-border)',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.02)',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr',
        gap: '4rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ 
            fontFamily: 'Outfit, sans-serif', 
            fontSize: '1.8rem', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            letterSpacing: '-0.5px'
          }}>
            <span style={{ color: 'var(--color-harbor)', fontWeight: 800 }}>Next</span>
            <span style={{ color: 'var(--color-depth)', opacity: 0.6, fontWeight: 500 }}>Hire</span>
          </h3>
          <p style={{ 
            color: 'var(--color-marine)', 
            fontSize: '1rem', 
            lineHeight: '1.7', 
            maxWidth: '380px',
            margin: 0
          }}>
            NextHire is your AI-powered resume builder, designed to elevate your professional profile with data-driven job matching and expert templates.
          </p>
        </div>

        <div>
          <h4 style={{ 
            color: 'var(--color-depth)', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem', 
            fontWeight: 800, 
            fontFamily: 'Outfit, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            opacity: 0.9
          }}>Platform</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FooterLink to="/templates">Templates</FooterLink>
            <FooterLink to="/resume">Resume Builder</FooterLink>
            <FooterLink to="/jobmatch">Job Match</FooterLink>
          </ul>
        </div>

        <div>
          <h4 style={{ 
            color: 'var(--color-depth)', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem', 
            fontWeight: 800, 
            fontFamily: 'Outfit, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            opacity: 0.9
          }}>Management</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FooterLink to="/exports">My Exports</FooterLink>
            <FooterLink to="/dashboard">User Dashboard</FooterLink>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '5rem auto 0',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        textAlign: 'center',
        color: 'var(--color-marine)',
        fontSize: '0.85rem',
        fontWeight: 500
      }}>
        © {new Date().getFullYear()} NextHire. All professional rights reserved.
      </div>
    </footer>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        to={to} 
        onClick={() => window.scrollTo(0, 0)}
        style={{
          color: 'var(--color-marine)',
          textDecoration: 'none',
          fontSize: '0.95rem',
          fontWeight: 600,
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-harbor)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-marine)'}
      >
        {children}
      </Link>
    </li>
  )
}
