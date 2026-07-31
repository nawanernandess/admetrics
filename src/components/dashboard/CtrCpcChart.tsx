import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ComputedRecord } from '@/types'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'
import { getEdgeTicks, monthYearTickFormatter } from '@/lib/chartHelpers'

function TooltipContent({
  active,
  payload,
  metric,
}: {
  active?: boolean
  payload?: Array<{ payload: ComputedRecord }>
  metric: 'ctr' | 'cpc'
}) {
  if (!active || !payload?.length) return null
  const record = payload[0].payload
  return (
    <div className="rounded-lg border border-[var(--color-card-border)] bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-[var(--color-text-primary)]">{formatDate(record.date)}</p>
      <p className="font-tabular text-[var(--color-text-secondary)]">
        {metric === 'ctr' ? 'CTR' : 'CPC'}:{' '}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {metric === 'ctr' ? formatPercent(record.ctr) : formatCurrency(record.averageCpc)}
        </span>
      </p>
    </div>
  )
}

/**
 * CTR (%) e CPC (R$) têm escalas incompatíveis — em vez de um gráfico com
 * dois eixos Y (anti-padrão de leitura), usamos dois painéis com eixo único
 * cada, sincronizados por syncId para que o tooltip mostre ambos ao passar
 * o mouse em qualquer um dos dois.
 */
export function CtrCpcChart({ records }: { records: ComputedRecord[] }) {
  const ticks = getEdgeTicks(records)

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">CTR × CPC</h3>
      <div className="mt-3 space-y-2">
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-series-cliques)]" />
            CTR
          </p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={records}
                syncId="ctr-cpc"
                margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#eef0f3" />
                <XAxis
                  dataKey="date"
                  ticks={ticks}
                  tickFormatter={monthYearTickFormatter}
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                  axisLine={{ stroke: '#eef0f3' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value: number) => formatPercent(value, 0)}
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  content={<TooltipContent metric="ctr" />}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="ctr"
                  stroke="var(--color-series-cliques)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-series-cpc)]" />
            CPC
          </p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={records}
                syncId="ctr-cpc"
                margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#eef0f3" />
                <XAxis
                  dataKey="date"
                  ticks={ticks}
                  tickFormatter={monthYearTickFormatter}
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                  axisLine={{ stroke: '#eef0f3' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value: number) => formatCurrency(value)}
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  content={<TooltipContent metric="cpc" />}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="averageCpc"
                  stroke="var(--color-series-cpc)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
