import {
  Funnel,
  FunnelChart as RechartsFunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { FunnelStage, PeriodInfo } from '@/lib/calculations'
import { formatInt, formatMonthYear, formatPercent } from '@/lib/format'

const STAGE_COLORS = ['#0d9488', '#0ea5e9', '#6366f1', '#8b5cf6', '#14b8a6']

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
      <p className="font-tabular text-[var(--color-text-secondary)]">
        {formatInt(stage.value)} · {formatPercent(stage.percentage)} das impressões
      </p>
    </div>
  )
}

export function FunnelChart({ stages, period }: { stages: FunnelStage[]; period: PeriodInfo }) {
  const subtitle =
    period.start && period.end
      ? `Consolidado de ${formatMonthYear(period.start)} a ${formatMonthYear(period.end)}`
      : null

  const coloredStages = stages.map((stage, index) => ({
    ...stage,
    fill: STAGE_COLORS[index % STAGE_COLORS.length],
  }))

  return (
    <div className="animate-fade-in-up rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Funil de conversão</h3>
      {subtitle ? <p className="text-xs text-[var(--color-text-secondary)]">{subtitle}</p> : null}
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsFunnelChart>
            <Tooltip content={<TooltipContent />} />
            <Funnel dataKey="value" data={coloredStages} isAnimationActive={false}>
              <LabelList
                position="right"
                dataKey="stage"
                fill="var(--color-text-primary)"
                stroke="none"
                fontSize={12}
              />
              <LabelList
                position="center"
                dataKey={(entry: FunnelStage) =>
                  `${formatInt(entry.value)} (${formatPercent(entry.percentage)})`
                }
                fill="#ffffff"
                stroke="none"
                fontSize={11}
                fontWeight={600}
              />
            </Funnel>
          </RechartsFunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
