import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { blankTickFormatter, getEdgeTicks, shouldShowDataLabels } from '@/lib/chartHelpers'

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ComputedRecord }>
}) {
  if (!active || !payload?.length) return null
  const record = payload[0].payload
  return (
    <div className="rounded-lg border border-[var(--color-card-border)] bg-[var(--color-tooltip-bg)] px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-[var(--color-text-primary)]">{formatDate(record.date)}</p>
      <p className="font-tabular text-[var(--color-text-secondary)]">
        Custo:{' '}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {formatCurrency(record.cost)}
        </span>
      </p>
      <p className="font-tabular text-[var(--color-text-secondary)]">
        Valor convertido:{' '}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {formatCurrency(record.convertedValue)}
        </span>
      </p>
    </div>
  )
}

export function CostRevenueChart({ records }: { records: ComputedRecord[] }) {
  const ticks = getEdgeTicks(records)
  const showLabels = shouldShowDataLabels(records)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        Custo × Valor convertido
      </h3>
      <div className="mt-3 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={records} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={blankTickFormatter}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={{ stroke: 'var(--color-chart-grid)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--color-hover-bg)' }} />
            <Legend
              formatter={(value: string) => (
                <span className="text-[11px] text-[var(--color-text-secondary)]">{value}</span>
              )}
            />
            <Bar
              dataKey="cost"
              name="Custo"
              fill="#64748b"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
              isAnimationActive={false}
            >
              {showLabels ? (
                <LabelList
                  dataKey="cost"
                  position="top"
                  formatter={(value: number) => formatCurrency(value)}
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fill: '#64748b',
                    stroke: 'var(--color-card-bg)',
                    strokeWidth: 3,
                    paintOrder: 'stroke',
                  }}
                />
              ) : null}
            </Bar>
            <Bar
              dataKey="convertedValue"
              name="Valor convertido"
              fill="var(--color-accent)"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
              isAnimationActive={false}
            >
              {showLabels ? (
                <LabelList
                  dataKey="convertedValue"
                  position="top"
                  formatter={(value: number) => formatCurrency(value)}
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fill: 'var(--color-accent)',
                    stroke: 'var(--color-card-bg)',
                    strokeWidth: 3,
                    paintOrder: 'stroke',
                  }}
                />
              ) : null}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
