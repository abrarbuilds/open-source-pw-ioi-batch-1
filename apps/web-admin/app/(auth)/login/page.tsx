'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@repo/ui/button'
import { Card } from '@repo/ui/card'
import { Input } from '@repo/ui/input'
import { ApiRequestError } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

/**
 * Owner: Team 03 — Auth & Identity.
 *
 * No "create an account" link, on purpose: privileged accounts are only ever
 * created by an existing admin through Team 11's user management.
 */
export default function AdminLoginPage() {
  const { login, status } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') router.replace('/overview')
  }, [status, router])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(email, password)
      router.replace('/overview')
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : 'Could not sign in. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <h1 className="text-lg font-semibold text-fg">Admin sign in</h1>
      <p className="mt-0.5 text-sm text-fg-muted">Faculty and administrators only.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>
    </Card>
  )
}
