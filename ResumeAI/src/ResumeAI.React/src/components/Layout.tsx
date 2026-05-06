import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ToastContainer from './ToastContainer'

export default function Layout() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      fontFamily: 'system-ui, sans-serif',
      background: 'var(--color-frost)'
    }}>
      {/* Top Navigation */}
      <Navbar />

      {/* Main content area */}
      <main style={{ 
        flex: 1, 
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        <Outlet />
      </main>

      {/* Application Footer */}
      <Footer />

      {/* Toast portal — always on top */}
      <ToastContainer />
    </div>
  )
}

