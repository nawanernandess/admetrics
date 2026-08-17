import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatDate, formatInt } from '@/lib/format'
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
      <p className="font-tabular text-[var(--color-accent)]">
        Impressões: <span className="font-semibold">{formatInt(record.impressions)}</span>
      </p>
      <p className="font-tabular text-[var(--color-series-cliques)]">
        Cliques: <span className="font-semibold">{formatInt(record.clicks)}</span>
      </p>
      <p className="font-tabular text-[var(--color-positive-base)]">
        Conversões: <span className="font-semibold">{formatInt(record.conversions)}</span>
      </p>
    </div>
  )
}

/**
 * Condensa impressões, cliques e conversões num único gráfico — impressões
 * em barra (fundo, volume bem maior) no eixo esquerdo, cliques e conversões
 * em linha no eixo direito, já que as duas ficam achatadas perto de zero se
 * dividirem a escala linear com as impressões.
 */
export function ImpressionsClicksConversionsChart({ records }: { records: ComputedRecord[] }) {
  const ticks = getEdgeTicks(records)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        Impressões, Cliques e Conversões
      </h3>
      <div className="mt-3 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={records} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
              yAxisId="volume"
              tickFormatter={(value: number) => formatInt(value)}
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <YAxis
              yAxisId="funnel"
              orientation="right"
              tickFormatter={(value: number) => formatInt(value)}
              tick={{ fontSize: 10, fill: 'var(--color-series-cliques)' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--color-hover-bg)' }} />
            <Legend
              verticalAlign="top"
              align="right"
              height={24}
              iconType="line"
              wrapperStyle={{ fontSize: 11 }}
            />
            <Bar
              yAxisId="volume"
              dataKey="impressions"
              name="Impressões"
              fill="var(--color-accent)"
              fillOpacity={0.25}
              radius={3}
              maxBarSize={18}
              isAnimationActive={false}
            />
            <Line
              yAxisId="funnel"
              type="monotone"
              dataKey="clicks"
              name="Cliques"
              stroke="var(--color-series-cliques)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-series-cliques)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
            <Line
              yAxisId="funnel"
              type="monotone"
              dataKey="conversions"
              name="Conversões"
              stroke="var(--color-positive-base)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-positive-base)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
