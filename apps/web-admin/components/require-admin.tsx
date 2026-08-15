'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Skeleton } from '@repo/ui/skeleton'
import { useAuth } from '@/lib/auth-context'

/** LOCKED FILE — Team 03 (Auth & Identity). Wraps every admin screen. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'anonymous') router.replace('/login')
  }, [status, router])

  if (status !== 'authenticated') {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6" aria-busy="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return <>{children}</>
}
