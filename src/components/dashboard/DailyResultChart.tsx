import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { getEdgeTicks, monthYearTickFormatter } from '@/lib/chartHelpers'

interface ResultBarProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: ComputedRecord
}

function ResultBar({ x, y, width, height, payload }: ResultBarProps) {
  if (x === undefined || y === undefined || width === undefined || height === undefined) {
    return null
  }
  const isPositive = (payload?.result ?? 0) >= 0
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={4}
      ry={4}
      fill={isPositive ? 'var(--color-positive-base)' : 'var(--color-negative-base)'}
    />
  )
}

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
    <div className="rounded-lg border border-[var(--color-card-border)] bg-white px-3 py-2 text-xs shadow-lg">
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
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={records} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            <ReferenceLine y={0} stroke="#cbd5e1" />
            <Tooltip content={<TooltipContent />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="result" maxBarSize={18} isAnimationActive={false} shape={<ResultBar />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
