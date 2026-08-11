import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatDate, formatPercent } from '@/lib/format'

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
      <p className="font-tabular font-semibold text-[var(--color-negative-text)]">
        {formatPercent(record.dropoffRate)}
      </p>
    </div>
  )
}

/**
 * Fuga entre o clique e a chegada na página de destino (ver
 * `calculateDropoffRate`). A linha de referência em 20% acompanha o mesmo
 * limiar usado para colorir a coluna "Taxa de fuga" na tabela de registros.
 */
export function DropoffRateChart({ records }: { records: ComputedRecord[] }) {
  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Taxa de fuga</h3>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={records} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#eef0f3" />
            <XAxis dataKey="date" hide />
            <YAxis
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <ReferenceLine y={0.2} stroke="var(--color-warning-text)" strokeDasharray="4 4" />
            <Tooltip content={<TooltipContent />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="dropoffRate"
              stroke="var(--color-negative-base)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-negative-base)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
