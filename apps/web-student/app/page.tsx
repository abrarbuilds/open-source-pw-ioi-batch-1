'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

/** Sends people to the right place depending on whether they have a session. */
export default function IndexPage() {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard')
    if (status === 'anonymous') router.replace('/login')
  }, [status, router])

  return null
}
