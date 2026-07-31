import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
