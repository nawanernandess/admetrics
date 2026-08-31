import { CHART_PERIOD_OPTIONS, type ChartPeriod } from '@/lib/chartHelpers'

/** Filtro de janela de exibição (dia/semana/mês) — usado no rodapé de cada gráfico do dashboard. */
export function ChartPeriodFilter({
  value,
  onChange,
}: {
  value: ChartPeriod
  onChange: (period: ChartPeriod) => void
}) {
  return (
    <div className="mt-3 flex justify-center">
      <div
        className="inline-flex overflow-hidden rounded-full border border-[var(--color-card-border)]"
        role="group"
        aria-label="Período do gráfico"
      >
        {CHART_PERIOD_OPTIONS.map((option, index) => {
          const isActive = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={`px-3.5 py-1 text-xs font-medium transition-colors duration-150 ${
                index > 0 ? 'border-l border-[var(--color-card-border)]' : ''
              } ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-bg)]'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
