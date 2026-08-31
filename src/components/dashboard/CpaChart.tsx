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
    <div className="rounded-lg border border-[var(--color-card-border)] bg-[var(--color-tooltip-bg)] px-3 py-2 text-xs shadow-lg">
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
  const [period, setPeriod] = useState<ChartPeriod>('mes')
  const filteredRecords = useMemo(() => filterByPeriod(records, period), [records, period])
  const ticks = getEdgeTicks(filteredRecords)
  const showLabels = shouldShowDataLabels(filteredRecords)
  const data = useMemo<CpaPoint[]>(
    () =>
      filteredRecords.map((record) => ({
        ...record,
        costPerConversionOrNull: record.conversions > 0 ? record.costPerConversion : null,
      })),
    [filteredRecords],
  )

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">CPA vs. meta</h3>
      <div className="mt-3 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
              dataKey="costPerConversionOrNull"
              name="CPA do dia"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
              isAnimationActive={false}
            >
              {showLabels ? (
                <LabelList
                  dataKey="costPerConversionOrNull"
                  position="top"
                  formatter={(value) => (value == null ? '' : formatCurrency(Number(value)))}
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
      <ChartPeriodFilter value={period} onChange={setPeriod} />
    </div>
  )
}
