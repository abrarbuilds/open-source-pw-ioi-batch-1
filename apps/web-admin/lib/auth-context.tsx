'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse, PublicUser } from '@repo/validation/auth'
import { ADMIN_PORTAL_ROLES } from '@repo/validation/enums'
import { api } from './api-client'

/**
 * LOCKED FILE — Team 03 (Auth & Identity).
 *
 * Same shape as the student provider, with two deliberate differences:
 *
 *  1. There is no `register` — admin and faculty accounts are created by an
 *     existing admin, never self-served.
 *  2. `status` becomes `anonymous` for anyone whose role is not ADMIN or
 *     FACULTY, so a student who somehow obtains a session still sees the login
 *     screen. This is a second line of defence; the real gate is `api-admin`
 *     rejecting the token server-side.
 */

interface AuthState {
  user: PublicUser | null
  status: 'loading' | 'authenticated' | 'anonymous'
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function canUseAdminPortal(user: PublicUser | null): boolean {
  return user !== null && ADMIN_PORTAL_ROLES.includes(user.role)
}

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

        if (!canUseAdminPortal(me)) {
          setStatus('anonymous')
          return
        }

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

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      api.setAccessToken(null)
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
