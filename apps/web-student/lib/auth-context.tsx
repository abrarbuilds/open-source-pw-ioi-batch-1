'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse, PublicUser } from '@repo/validation/auth'
import { api } from './api-client'

/**
 * LOCKED FILE — Team 03 (Auth & Identity).
 *
 * ## Why the route guard is here and not in `middleware.ts`
 *
 * The refresh cookie is set by `api-student`, which is on a different domain to
 * this app. Next.js middleware runs on *this* domain and therefore cannot see
 * that cookie — a middleware guard would either always pass or always fail.
 *
 * So the guard is client-side: on mount we try a silent refresh, and
 * `RequireAuth` renders a skeleton until we know the answer. If you ever put the
 * API behind this app's own domain via a rewrite, revisit this.
 */

interface AuthState {
  user: PublicUser | null
  status: 'loading' | 'authenticated' | 'anonymous'
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [status, setStatus] = useState<AuthState['status']>('loading')

  useEffect(() => {
    let cancelled = false

    async function restore() {
      const ok = await api.refreshAccessToken()
      if (cancelled) return

      if (!ok) {
        setStatus('anonymous')
        return
      }

      try {
        const { user: me } = await api.get<{ user: PublicUser }>('/api/auth/me')
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      } catch {
        if (!cancelled) setStatus('anonymous')
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/login', { email, password })
    api.setAccessToken(res.accessToken)
    setUser(res.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/register', { name, email, password })
    api.setAccessToken(res.accessToken)
    setUser(res.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      api.setAccessToken(null)
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
