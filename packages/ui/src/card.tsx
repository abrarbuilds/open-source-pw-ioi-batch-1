import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-line bg-surface p-5 shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-fg">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-fg-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
