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
import { formatDate, formatPercentRaw } from '@/lib/format'
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
        Parc. de impr. da rede de pesquisa:{' '}
        <span className="font-semibold">{formatPercentRaw(record.impressionShare)}</span>
      </p>
      <p className="font-tabular text-[var(--color-accent-cyan)]">
        % de impr. (parte sup.):{' '}
        <span className="font-semibold">{formatPercentRaw(record.topShare)}</span>
      </p>
      <p className="font-tabular text-[var(--color-series-cpc)]">
        % de impr. (1ª posição):{' '}
        <span className="font-semibold">{formatPercentRaw(record.firstAboveShare)}</span>
      </p>
    </div>
  )
}

/**
 * Parcela do leilão que a conta está ganhando (métricas do Google Ads) — só
 * é útil se esses campos estiverem sendo preenchidos nos registros diários.
 */
export function ImpressionShareChart({ records }: { records: ComputedRecord[] }) {
  const ticks = getEdgeTicks(records)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        Parcela de impressões
      </h3>
      <div className="mt-3 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={records} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--color-chart-grid)" />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={blankTickFormatter}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={{ stroke: 'var(--color-chart-grid)' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value: number) => formatPercentRaw(value, 0)}
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip
              content={<TooltipContent />}
              cursor={{ stroke: 'var(--color-chart-cursor)', strokeWidth: 1 }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={24}
              iconType="line"
              wrapperStyle={{ fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="impressionShare"
              name="Parc. de impr. da rede de pesquisa"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-accent)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="topShare"
              name="% de impr. (parte sup.)"
              stroke="var(--color-accent-cyan)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-accent-cyan)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="firstAboveShare"
              name="% de impr. (1ª posição)"
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
