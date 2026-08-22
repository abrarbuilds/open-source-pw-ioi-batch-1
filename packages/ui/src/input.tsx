import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from './cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-fg">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-10 rounded-lg border bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle',
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand',
          error ? 'border-danger' : 'border-line',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
