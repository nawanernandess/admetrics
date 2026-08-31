import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'
import { useIsMobile } from '@/lib/useIsMobile'
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
  return (
    <div className="rounded-lg border border-[var(--color-card-border)] bg-[var(--color-tooltip-bg)] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-[var(--color-text-primary)]">{formatDate(record.date)}</p>
      <p className="font-tabular text-[var(--color-series-cliques)]">
        CTR: <span className="font-semibold">{formatPercent(record.ctr)}</span>
      </p>
      <p className="font-tabular text-[var(--color-series-cpc)]">
        CPC: <span className="font-semibold">{formatCurrency(record.averageCpc)}</span>
      </p>
    </div>
  )
}

/**
 * CTR (%) e CPC (R$) têm escalas incompatíveis — por isso cada linha usa seu
 * próprio eixo Y (esquerdo para CTR, direito para CPC), coloridos igual à
 * linha correspondente, em vez de forçar as duas numa escala compartilhada.
 */
export function CtrCpcChart({ records }: { records: ComputedRecord[] }) {
  const [period, setPeriod] = useState<ChartPeriod>('mes')
  const filteredRecords = useMemo(() => filterByPeriod(records, period), [records, period])
  const ticks = getEdgeTicks(filteredRecords)
  const showLabels = shouldShowDataLabels(filteredRecords)
  const isMobile = useIsMobile()

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">CTR × CPC</h3>
      <div className="mt-3 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredRecords} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--color-chart-grid)" />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={blankTickFormatter}
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
              axisLine={{ stroke: 'var(--color-chart-grid)' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="ctr"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tick={{ fontSize: 10, fill: 'var(--color-series-cliques)' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <YAxis
              yAxisId="cpc"
              orientation="right"
              tickFormatter={(value: number) => formatCurrency(value)}
              tick={{ fontSize: 10, fill: 'var(--color-series-cpc)' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              content={<TooltipContent />}
              cursor={{ stroke: 'var(--color-chart-cursor)', strokeWidth: 1 }}
            />
            {isMobile ? (
              <Legend
                iconType="line"
                formatter={(value: string) => (
                  <span className="text-[11px] text-[var(--color-text-secondary)]">{value}</span>
                )}
              />
            ) : (
              <Legend verticalAlign="top" align="right" height={24} iconType="line" wrapperStyle={{ fontSize: 11 }} />
            )}
            <Line
              yAxisId="ctr"
              type="monotone"
              dataKey="ctr"
              name="CTR"
              stroke="var(--color-series-cliques)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-series-cliques)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            >
              {showLabels ? (
                <LabelList
                  dataKey="ctr"
                  position="top"
                  offset={6}
                  formatter={(value: number) => formatPercent(value, 0)}
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fill: 'var(--color-series-cliques)',
                    stroke: 'var(--color-card-bg)',
                    strokeWidth: 3,
                    paintOrder: 'stroke',
                  }}
                />
              ) : null}
            </Line>
            <Line
              yAxisId="cpc"
              type="monotone"
              dataKey="averageCpc"
              name="CPC"
              stroke="var(--color-series-cpc)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-series-cpc)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            >
              {showLabels ? (
                <LabelList
                  dataKey="averageCpc"
                  position="top"
                  offset={14}
                  formatter={(value: number) => formatCurrency(value)}
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fill: 'var(--color-series-cpc)',
                    stroke: 'var(--color-card-bg)',
                    strokeWidth: 3,
                    paintOrder: 'stroke',
                  }}
                />
              ) : null}
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartPeriodFilter value={period} onChange={setPeriod} />
    </div>
  )
}
