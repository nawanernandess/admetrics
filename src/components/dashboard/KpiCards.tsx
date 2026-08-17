import type { AggregatedKpis } from '@/lib/calculations'
import { formatCurrency, formatInt } from '@/lib/format'

function KpiCard({
  label,
  value,
  tone = 'neutral',
  delayMs = 0,
}: {
  label: string
  value: string
  tone?: 'neutral' | 'positive' | 'negative'
  delayMs?: number
}) {
  const toneClass =
    tone === 'positive'
      ? 'text-[var(--color-positive-text)]'
      : tone === 'negative'
        ? 'text-[var(--color-negative-text)]'
        : 'text-[var(--color-text-primary)]'

  return (
    <div
      className="animate-fade-in-up min-w-0 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-4 py-3.5"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <p className="truncate text-xs font-medium text-[var(--color-text-secondary)]">{label}</p>
      <p className={`mt-1.5 truncate font-tabular text-xl font-bold sm:text-2xl ${toneClass}`}>
        {value}
      </p>
    </div>
  )
}

export function KpiCards({ kpis }: { kpis: AggregatedKpis }) {
  const isPositiveResult = kpis.cumulativeResult >= 0
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-6">
      <KpiCard label="Impressões" value={formatInt(kpis.impressions)} delayMs={0} />
      <KpiCard label="Cliques" value={formatInt(kpis.clicks)} delayMs={40} />
      <KpiCard label="Visitors" value={formatInt(kpis.visitors)} delayMs={80} />
      <KpiCard label="Conversões" value={formatInt(kpis.conversions)} delayMs={120} />
      <KpiCard label="Custo total" value={formatCurrency(kpis.totalCost)} delayMs={160} />
      <KpiCard
        label="Resultado acumulado"
        value={`${isPositiveResult ? '+' : ''}${formatCurrency(kpis.cumulativeResult)}`}
        tone={isPositiveResult ? 'positive' : 'negative'}
        delayMs={200}
      />
    </div>
  )
}
