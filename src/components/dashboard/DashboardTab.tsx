import { useMemo, useState, type ReactNode } from 'react'
import type { ComputedRecord, DailyRecord, Product } from '@/types'
import {
  aggregateFunnel,
  aggregateKpis,
  calculatePeriod,
  computeRecords,
  type FunnelStage,
  type PeriodInfo,
} from '@/lib/calculations'
import { useAppStore } from '@/store/useAppStore'
import { computeDashboardChartLayout, sanitizeDashboardChartIds } from '@/lib/dashboardCharts'
import { PeriodBanner } from '@/components/dashboard/PeriodBanner'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { DashboardChartsPanel } from '@/components/dashboard/DashboardChartsPanel'
import { CumulativeResultChart } from '@/components/dashboard/CumulativeResultChart'
import { FunnelChart } from '@/components/dashboard/FunnelChart'
import { CtrCpcChart } from '@/components/dashboard/CtrCpcChart'
import { ConversionRateChart } from '@/components/dashboard/ConversionRateChart'
import { RoasChart } from '@/components/dashboard/RoasChart'
import { CpaChart } from '@/components/dashboard/CpaChart'
import { CostRevenueChart } from '@/components/dashboard/CostRevenueChart'
import { BudgetPacingChart } from '@/components/dashboard/BudgetPacingChart'
import { DropoffRateChart } from '@/components/dashboard/DropoffRateChart'
import { ImpressionShareChart } from '@/components/dashboard/ImpressionShareChart'
import { DailyResultChart } from '@/components/dashboard/DailyResultChart'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonSecondaryClass } from '@/components/common/formStyles'

interface ChartContext {
  records: ComputedRecord[]
  funnel: FunnelStage[]
  period: PeriodInfo
}

const CHART_COMPONENTS: Record<string, (context: ChartContext) => ReactNode> = {
  cumulativeResult: ({ records }) => <CumulativeResultChart records={records} />,
  funnel: ({ funnel, period }) => <FunnelChart stages={funnel} period={period} />,
  ctrCpc: ({ records }) => <CtrCpcChart records={records} />,
  conversionRate: ({ records }) => <ConversionRateChart records={records} />,
  roas: ({ records }) => <RoasChart records={records} />,
  cpa: ({ records }) => <CpaChart records={records} />,
  costRevenue: ({ records }) => <CostRevenueChart records={records} />,
  budgetPacing: ({ records }) => <BudgetPacingChart records={records} />,
  dropoffRate: ({ records }) => <DropoffRateChart records={records} />,
  impressionShare: ({ records }) => <ImpressionShareChart records={records} />,
  dailyResult: ({ records }) => <DailyResultChart records={records} />,
}

export function DashboardTab({ product, records }: { product: Product; records: DailyRecord[] }) {
  const [isChartsPanelOpen, setIsChartsPanelOpen] = useState(false)
  const dashboardChartIds = useAppStore((state) => state.dashboardChartIds)
  const setDashboardChartIds = useAppStore((state) => state.setDashboardChartIds)

  const computedRecords = useMemo(() => computeRecords(records), [records])
  const kpis = useMemo(() => aggregateKpis(computedRecords), [computedRecords])
  const funnel = useMemo(() => aggregateFunnel(computedRecords), [computedRecords])
  const period = useMemo(() => calculatePeriod(computedRecords), [computedRecords])
  const chartIds = useMemo(() => sanitizeDashboardChartIds(dashboardChartIds), [dashboardChartIds])
  const chartLayout = useMemo(() => computeDashboardChartLayout(chartIds), [chartIds])
  const chartContext: ChartContext = { records: computedRecords, funnel, period }

  if (computedRecords.length === 0) {
    return (
      <EmptyState
        title="Nenhum registro ainda"
        description={`Registre o primeiro dia de "${product.name}" para ver o dashboard.`}
      />
    )
  }

  return (
    <div>
      <PeriodBanner period={period} />
      <KpiCards kpis={kpis} />

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setIsChartsPanelOpen(true)}
          className={buttonSecondaryClass}
        >
          ⚙ Gráficos
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {chartLayout.map(({ id, fullWidth }) => {
          const chart = CHART_COMPONENTS[id]?.(chartContext)
          if (!chart) return null
          return fullWidth ? (
            <div key={id} className="lg:col-span-2">
              {chart}
            </div>
          ) : (
            <div key={id}>{chart}</div>
          )
        })}
      </div>

      {isChartsPanelOpen ? (
        <DashboardChartsPanel
          visibleChartIds={chartIds}
          onApply={(newChartIds) => setDashboardChartIds(newChartIds)}
          onClose={() => setIsChartsPanelOpen(false)}
        />
      ) : null}
    </div>
  )
}
