import { useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatDate, formatRatio } from '@/lib/format'
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
  const isProfitable = record.roas >= 1
  return (
    <div className="rounded-lg border border-[var(--color-card-border)] bg-[var(--color-tooltip-bg)] px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-[var(--color-text-primary)]">{formatDate(record.date)}</p>
      <p
        className={`font-tabular font-semibold ${
          isProfitable ? 'text-[var(--color-positive-text)]' : 'text-[var(--color-negative-text)]'
        }`}
      >
        ROAS: {formatRatio(record.roas)}
      </p>
    </div>
  )
}

/** Retorno sobre o investimento (valor convertido / custo) — abaixo de 1x, o dia deu prejuízo. */
export function RoasChart({ records }: { records: ComputedRecord[] }) {
  const [period, setPeriod] = useState<ChartPeriod>('mes')
  const filteredRecords = useMemo(() => filterByPeriod(records, period), [records, period])
  const ticks = getEdgeTicks(filteredRecords)
  const showLabels = shouldShowDataLabels(filteredRecords)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">ROAS</h3>
      <div className="mt-3 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredRecords} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="roasFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-positive-base)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--color-positive-base)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value: number) => formatRatio(value, 1)}
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <ReferenceLine
              y={1}
              stroke="var(--color-text-secondary-2)"
              strokeDasharray="4 4"
              label={{
                value: 'Ponto de equilíbrio',
                position: 'insideTopRight',
                fontSize: 10,
                fill: 'var(--color-text-secondary)',
              }}
            />
            <Tooltip
              content={<TooltipContent />}
              cursor={{ stroke: 'var(--color-chart-cursor)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="roas"
              stroke="none"
              fill="url(#roasFill)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="roas"
              stroke="var(--color-positive-base)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-positive-base)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            >
              {showLabels ? (
                <LabelList
                  dataKey="roas"
                  position="top"
                  formatter={(value: number) => formatRatio(value)}
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fill: 'var(--color-positive-text)',
                    stroke: 'var(--color-card-bg)',
                    strokeWidth: 3,
                    paintOrder: 'stroke',
                  }}
                />
              ) : null}
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ChartPeriodFilter value={period} onChange={setPeriod} />
    </div>
  )
}
