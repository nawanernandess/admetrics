import {
  CartesianGrid,
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
  const ticks = getEdgeTicks(records)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">CTR × CPC</h3>
      <div className="mt-3 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={records} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            <Tooltip content={<TooltipContent />} cursor={{ stroke: 'var(--color-chart-cursor)', strokeWidth: 1 }} />
            <Legend verticalAlign="top" align="right" height={24} iconType="line" wrapperStyle={{ fontSize: 11 }} />
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
            />
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
