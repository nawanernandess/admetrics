import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { FunnelStage, PeriodInfo } from '@/lib/calculations'
import { formatInt, formatMonthYear } from '@/lib/format'

const STAGE_COLORS = [
  'var(--color-accent-cyan)',
  'var(--color-series-cliques)',
  'var(--color-accent)',
  'var(--color-accent-deep)',
  'var(--color-positive-base)',
]

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: FunnelStage }>
}) {
  if (!active || !payload?.length) return null
  const stage = payload[0].payload
  return (
    <div className="rounded-lg border border-[var(--color-card-border)] bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-[var(--color-text-primary)]">{stage.stage}</p>
      <p className="font-tabular text-[var(--color-text-secondary)]">{formatInt(stage.value)}</p>
    </div>
  )
}

export function FunnelChart({ stages, period }: { stages: FunnelStage[]; period: PeriodInfo }) {
  const subtitle =
    period.start && period.end
      ? `Consolidado de ${formatMonthYear(period.start)} a ${formatMonthYear(period.end)}`
      : null

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Funil de conversão</h3>
      {subtitle ? <p className="text-xs text-[var(--color-text-secondary)]">{subtitle}</p> : null}
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stages}
            layout="vertical"
            margin={{ top: 8, right: 48, left: 8, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="stage"
              width={90}
              tick={{ fontSize: 12, fill: 'var(--color-text-primary)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28} isAnimationActive={false}>
              {stages.map((stage, index) => (
                <Cell key={stage.stage} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
              ))}
              <LabelList
                position="right"
                dataKey={(entry: FunnelStage) => formatInt(entry.value)}
                fill="var(--color-text-primary)"
                fontSize={12}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
