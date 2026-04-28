import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../api'
import type { User } from '../types'

interface AuthCtx {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateSession: (data: any) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  // Restore session on reload
  useEffect(() => {
    if (token && !user) {
      authApi.profile()
        .then(setUser)
        .catch(() => { localStorage.removeItem('token'); setToken(null) })
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const register = async (fullName: string, email: string, password: string) => {
    const data = await authApi.register({ fullName, email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const logout = async () => {
    try { await authApi.logout() } catch { /* ignore if already invalid */ }
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const updateSession = (data: any) => {
    if (data.token) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
    }
    if (data.user) {
      setUser(data.user)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateSession, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
