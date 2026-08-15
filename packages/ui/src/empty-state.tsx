import type { ReactNode } from 'react'

/**
 * Every list in this app must render one of three states: loading, empty, or
 * data. Reach for this rather than shipping a blank screen — "is it broken or is
 * there nothing here?" is the most common complaint in student demos.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-12 text-center">
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
