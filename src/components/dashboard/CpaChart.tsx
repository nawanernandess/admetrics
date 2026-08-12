import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { blankTickFormatter, getEdgeTicks } from '@/lib/chartHelpers'

interface CpaPoint extends ComputedRecord {
  costPerConversionOrNull: number | null
}

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: CpaPoint }>
}) {
  if (!active || !payload?.length) return null
  const record = payload[0].payload
  return (
    <div className="rounded-lg border border-[var(--color-card-border)] bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-[var(--color-text-primary)]">{formatDate(record.date)}</p>
      <p className="font-tabular text-[var(--color-text-secondary)]">
        CPA do dia:{' '}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {record.costPerConversionOrNull == null
            ? 'sem conversão'
            : formatCurrency(record.costPerConversionOrNull)}
        </span>
      </p>
      <p className="font-tabular text-[var(--color-text-secondary)]">
        Meta (CPC/CPA máx):{' '}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {formatCurrency(record.maxCpcCpa)}
        </span>
      </p>
    </div>
  )
}

/**
 * Custo por conversão real vs. o teto definido no produto (CPC/CPA máx).
 * Dias sem conversão ficam sem barra (custo/0 não é "CPA de graça", é indefinido).
 */
export function CpaChart({ records }: { records: ComputedRecord[] }) {
  const ticks = getEdgeTicks(records)
  const data = useMemo<CpaPoint[]>(
    () =>
      records.map((record) => ({
        ...record,
        costPerConversionOrNull: record.conversions > 0 ? record.costPerConversion : null,
      })),
    [records],
  )

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">CPA vs. meta</h3>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#eef0f3" />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={blankTickFormatter}
              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
              axisLine={{ stroke: '#eef0f3' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: '#f1f5f9' }} />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-[var(--color-text-secondary)]">{value}</span>
              )}
            />
            <Bar
              dataKey="costPerConversionOrNull"
              name="CPA do dia"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
              isAnimationActive={false}
            >
              {data.map((point) => (
                <Cell
                  key={point.id}
                  fill={
                    point.costPerConversionOrNull != null &&
                    point.costPerConversionOrNull > point.maxCpcCpa
                      ? 'var(--color-negative-base)'
                      : 'var(--color-positive-base)'
                  }
                />
              ))}
            </Bar>
            <Line
              type="stepAfter"
              dataKey="maxCpcCpa"
              name="Meta (CPC/CPA máx)"
              stroke="var(--color-warning-text)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
