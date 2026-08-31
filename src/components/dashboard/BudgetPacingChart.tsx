import { useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import {
  blankTickFormatter,
  filterByPeriod,
  getEdgeTicks,
  shouldShowDataLabels,
  type ChartPeriod,
} from '@/lib/chartHelpers'
import { ChartPeriodFilter } from './ChartPeriodFilter'

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ComputedRecord }>
}) {
  if (!active || !payload?.length) return null
  const record = payload[0].payload
  const isOverBudget = record.cost > record.dailyBudget
  return (
    <div className="rounded-lg border border-[var(--color-card-border)] bg-[var(--color-tooltip-bg)] px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-[var(--color-text-primary)]">{formatDate(record.date)}</p>
      <p
        className={`font-tabular font-semibold ${
          isOverBudget ? 'text-[var(--color-negative-text)]' : 'text-[var(--color-positive-text)]'
        }`}
      >
        Custo: {formatCurrency(record.cost)}
      </p>
      <p className="font-tabular text-[var(--color-text-secondary)]">
        Orçamento diário:{' '}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {formatCurrency(record.dailyBudget)}
        </span>
      </p>
    </div>
  )
}

/** Ritmo de gasto — custo real do dia (barra) contra o orçamento diário definido (linha). */
export function BudgetPacingChart({ records }: { records: ComputedRecord[] }) {
  const [period, setPeriod] = useState<ChartPeriod>('mes')
  const filteredRecords = useMemo(() => filterByPeriod(records, period), [records, period])
  const ticks = getEdgeTicks(filteredRecords)
  const showLabels = shouldShowDataLabels(filteredRecords)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        Orçamento × custo real
      </h3>
      <div className="mt-3 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredRecords} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
              width={72}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--color-hover-bg)' }} />
            <Legend
              formatter={(value: string) => (
                <span className="text-[11px] text-[var(--color-text-secondary)]">{value}</span>
              )}
            />
            <Bar
              dataKey="cost"
              name="Custo do dia"
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
                    fill: 'var(--color-text-secondary)',
                    stroke: 'var(--color-card-bg)',
                    strokeWidth: 3,
                    paintOrder: 'stroke',
                  }}
                />
              ) : null}
              {filteredRecords.map((record) => (
                <Cell
                  key={record.id}
                  fill={
                    record.cost > record.dailyBudget
                      ? 'var(--color-negative-base)'
                      : 'var(--color-positive-base)'
                  }
                />
              ))}
            </Bar>
            <Line
              type="stepAfter"
              dataKey="dailyBudget"
              name="Orçamento diário"
              stroke="var(--color-warning-text)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ChartPeriodFilter value={period} onChange={setPeriod} />
    </div>
  )
}
