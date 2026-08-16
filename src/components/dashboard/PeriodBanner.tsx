import type { PeriodInfo } from '@/lib/calculations'
import { formatMonthYear } from '@/lib/format'

export function PeriodBanner({ period }: { period: PeriodInfo }) {
  if (period.totalDays === 0 || !period.start || !period.end) {
    return null
  }

  const startMonth = formatMonthYear(period.start)
  const endMonth = formatMonthYear(period.end)
  const rangeLabel = startMonth === endMonth ? startMonth : `${startMonth} a ${endMonth}`

  return (
    <div className="animate-fade-in-up mb-6 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-hover-bg)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)]">
      Consolidado de todos os dias registrados (100% do período) — os KPIs e gráficos somam{' '}
      <span className="font-tabular font-semibold text-[var(--color-text-primary)]">
        {period.totalDays} {period.totalDays === 1 ? 'dia' : 'dias'}
      </span>
      , de <span className="font-medium text-[var(--color-text-primary)]">{rangeLabel}</span>.
    </div>
  )
}
