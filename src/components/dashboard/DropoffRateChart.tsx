import {
  CartesianGrid,
  LabelList,
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
import { blankTickFormatter, getEdgeTicks, shouldShowDataLabels } from '@/lib/chartHelpers'

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
  const ticks = getEdgeTicks(records)
  const showLabels = shouldShowDataLabels(records)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Taxa de fuga</h3>
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
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <ReferenceLine y={0.2} stroke="var(--color-warning-text)" strokeDasharray="4 4" />
            <Tooltip
              content={<TooltipContent />}
              cursor={{ stroke: 'var(--color-chart-cursor)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="dropoffRate"
              stroke="var(--color-negative-base)"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-negative-base)' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive={false}
            >
              {showLabels ? (
                <LabelList
                  dataKey="dropoffRate"
                  position="top"
                  formatter={(value: number) => formatPercent(value, 0)}
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fill: 'var(--color-negative-text)',
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
    </div>
  )
}
