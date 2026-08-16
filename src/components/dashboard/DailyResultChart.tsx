import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { blankTickFormatter, getEdgeTicks } from '@/lib/chartHelpers'

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ComputedRecord }>
}) {
  if (!active || !payload?.length) return null
  const record = payload[0].payload
  const isPositive = record.result >= 0
  return (
    <div className="rounded-lg border border-[var(--color-card-border)] bg-[var(--color-tooltip-bg)] px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-[var(--color-text-primary)]">{formatDate(record.date)}</p>
      <p
        className={`font-tabular font-semibold ${
          isPositive ? 'text-[var(--color-positive-text)]' : 'text-[var(--color-negative-text)]'
        }`}
      >
        {isPositive ? '+' : ''}
        {formatCurrency(record.result)}
      </p>
    </div>
  )
}

export function DailyResultChart({ records }: { records: ComputedRecord[] }) {
  const ticks = getEdgeTicks(records)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Resultado diário</h3>
      <div className="mt-3 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={records} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            <ReferenceLine y={0} stroke="var(--color-text-secondary-2)" strokeWidth={1.5} />
            <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--color-hover-bg)' }} />
            <Bar dataKey="result" radius={4} maxBarSize={18} isAnimationActive={false}>
              {records.map((record) => (
                <Cell
                  key={record.id}
                  fill={
                    record.result >= 0 ? 'var(--color-positive-base)' : 'var(--color-negative-base)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
