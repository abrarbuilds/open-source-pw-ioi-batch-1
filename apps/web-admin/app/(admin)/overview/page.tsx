'use client'

import { Card, CardHeader } from '@repo/ui/card'
import { EmptyState } from '@repo/ui/empty-state'
import { useAuth } from '@/lib/auth-context'

/**
 * Owner: Team 10 — Admin Core & Batch Management.
 *
 * Placeholder. Team 10 replaces this with the batch overview: student count,
 * subjects, today's sessions, and quick links into each management screen.
 */
export default function OverviewPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-fg">Overview</h1>
        <p className="mt-0.5 text-sm text-fg-muted">Signed in as {user?.email}</p>
      </div>

      <Card>
        <CardHeader
          title="Nothing here yet"
          description="This is the scaffold. Feature teams build on top of it."
        />
        <EmptyState
          title="Team 10 owns this screen"
          description="Batch size, subject list, today's sessions and shortcuts into the management screens land here."
        />
      </Card>
    </div>
  )
}
