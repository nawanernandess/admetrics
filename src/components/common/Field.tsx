import type { ReactNode } from 'react'
import { errorClass, labelClass } from '@/components/common/formStyles'

interface FieldProps {
  label: string
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, error, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
      {error ? <p className={errorClass}>{error}</p> : null}
    </div>
  )
}
