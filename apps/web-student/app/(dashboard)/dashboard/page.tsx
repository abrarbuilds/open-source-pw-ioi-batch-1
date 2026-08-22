'use client'

import { Card, CardHeader } from '@repo/ui/card'
import { EmptyState } from '@repo/ui/empty-state'
import { useAuth } from '@/lib/auth-context'

/**
 * Owner: Team 09 — Student Dashboard & Progress.
 *
 * Placeholder. Team 09 replaces this with the real home screen: attendance
 * summary, what is due this week, recent materials, and the announcement feed —
 * each fed by the API another team owns.
 */
export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-fg">Hi {user?.name?.split(' ')[0]}</h1>
        <p className="mt-0.5 text-sm text-fg-muted">
          Signed in as {user?.email} · {user?.role}
        </p>
      </div>

      <Card>
        <CardHeader
          title="Nothing here yet"
          description="This is the scaffold. Feature teams build on top of it."
        />
        <EmptyState
          title="Team 09 owns this screen"
          description="Attendance summary, upcoming assignments, recent materials and announcements land here as each team's API goes live."
        />
      </Card>
    </div>
  )
}
