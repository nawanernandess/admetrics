import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { getEdgeTicks, monthYearTickFormatter } from '@/lib/chartHelpers'

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
    <div className="rounded-lg border border-[var(--color-card-border)] bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-[var(--color-text-primary)]">{formatDate(record.date)}</p>
      <p className="mt-1 font-tabular text-[var(--color-text-secondary)]">
        Acumulado:{' '}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {formatCurrency(record.cumulativeResult)}
        </span>
      </p>
      <p className="font-tabular text-[var(--color-text-secondary)]">
        Resultado do dia:{' '}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {formatCurrency(record.result)}
        </span>
      </p>
    </div>
  )
}

export function CumulativeResultChart({ records }: { records: ComputedRecord[] }) {
  const ticks = getEdgeTicks(records)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        Resultado acumulado
      </h3>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={records} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cumulativeResultFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eef0f3" />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={monthYearTickFormatter}
              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
              axisLine={{ stroke: '#eef0f3' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<TooltipContent />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="cumulativeResult"
              stroke="none"
              fill="url(#cumulativeResultFill)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="cumulativeResult"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
