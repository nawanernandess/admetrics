import { useMemo, useState, type ReactNode } from 'react'
import type { ComputedRecord, DailyRecord, Product } from '@/types'
import { aggregateKpis, calculatePeriod, computeRecords, type PeriodInfo } from '@/lib/calculations'
import { useAppStore } from '@/store/useAppStore'
import {
  computeDashboardChartLayout,
  sanitizeDashboardChartIds,
  sanitizeFullWidthChartIds,
} from '@/lib/dashboardCharts'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { DashboardChartsPanel } from '@/components/dashboard/DashboardChartsPanel'
import { CtrCpcChart } from '@/components/dashboard/CtrCpcChart'
import { ImpressionsClicksConversionsChart } from '@/components/dashboard/ImpressionsClicksConversionsChart'
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
  period: PeriodInfo
}

const CHART_COMPONENTS: Record<string, (context: ChartContext) => ReactNode> = {
  clicksVisitorsConversions: ({ records }) => (
    <ImpressionsClicksConversionsChart records={records} />
  ),
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
  const dashboardFullWidthChartIds = useAppStore((state) => state.dashboardFullWidthChartIds)
  const setDashboardCharts = useAppStore((state) => state.setDashboardCharts)

  const computedRecords = useMemo(
    () => computeRecords(records, product.targetConversionValue),
    [records, product.targetConversionValue],
  )
  const kpis = useMemo(() => aggregateKpis(computedRecords), [computedRecords])
  const period = useMemo(() => calculatePeriod(computedRecords), [computedRecords])
  const chartIds = useMemo(() => sanitizeDashboardChartIds(dashboardChartIds), [dashboardChartIds])
  const fullWidthChartIds = useMemo(
    () => sanitizeFullWidthChartIds(dashboardFullWidthChartIds),
    [dashboardFullWidthChartIds],
  )
  const chartLayout = useMemo(
    () => computeDashboardChartLayout(chartIds, fullWidthChartIds),
    [chartIds, fullWidthChartIds],
  )
  const chartContext: ChartContext = { records: computedRecords, period }

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
          fullWidthChartIds={fullWidthChartIds}
          onApply={(newChartIds, newFullWidthChartIds) =>
            setDashboardCharts(newChartIds, newFullWidthChartIds)
          }
          onClose={() => setIsChartsPanelOpen(false)}
        />
      ) : null}
    </div>
  )
}
