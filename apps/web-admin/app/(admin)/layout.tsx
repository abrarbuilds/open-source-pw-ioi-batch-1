'use client'

import { Badge } from '@repo/ui/badge'
import { Button } from '@repo/ui/button'
import { Sidebar } from '@/components/nav/sidebar'
import { RequireAdmin } from '@/components/require-admin'
import { useAuth } from '@/lib/auth-context'

/** LOCKED FILE — Team 02 (Design System). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <Shell>{children}</Shell>
    </RequireAdmin>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-fg">Program Tracker</span>
            <Badge tone="info">Admin</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-fg-muted sm:inline">
              {user?.name} · {user?.role}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 md:flex-row">
        <aside className="md:w-52 md:shrink-0">
          <Sidebar role={user?.role ?? 'FACULTY'} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
