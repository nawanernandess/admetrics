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
      <p className="mb-1 font-medium text-[var(--color-text-primary)]">{formatDate(record.date)}</p>
      <p className="font-tabular text-[var(--color-accent)]">
        Parc. impressões:{' '}
        <span className="font-semibold">{formatPercentRaw(record.impressionShare)}</span>
      </p>
      <p className="font-tabular text-[var(--color-accent-cyan)]">
        Parc. superior: <span className="font-semibold">{formatPercentRaw(record.topShare)}</span>
      </p>
      <p className="font-tabular text-[var(--color-accent-deep)]">
        Parc. 1º acima:{' '}
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
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={records} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#eef0f3" />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={monthYearTickFormatter}
              tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
              axisLine={{ stroke: '#eef0f3' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value: number) => formatPercentRaw(value, 0)}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<TooltipContent />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
            <Legend verticalAlign="top" align="right" height={32} iconType="line" />
            <Line
              type="monotone"
              dataKey="impressionShare"
              name="Parc. impressões"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-accent)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="topShare"
              name="Parc. superior"
              stroke="var(--color-accent-cyan)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-accent-cyan)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="firstAboveShare"
              name="Parc. 1º acima"
              stroke="var(--color-accent-deep)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-accent-deep)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
