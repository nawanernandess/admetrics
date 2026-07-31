import { useMemo } from 'react'
import type { DailyRecord, Product } from '@/types'
import { aggregateFunnel, aggregateKpis, calculatePeriod, computeRecords } from '@/lib/calculations'
import { PeriodBanner } from '@/components/dashboard/PeriodBanner'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { CumulativeResultChart } from '@/components/dashboard/CumulativeResultChart'
import { FunnelChart } from '@/components/dashboard/FunnelChart'
import { CtrCpcChart } from '@/components/dashboard/CtrCpcChart'
import { CostRevenueChart } from '@/components/dashboard/CostRevenueChart'
import { DailyResultChart } from '@/components/dashboard/DailyResultChart'
import { EmptyState } from '@/components/common/EmptyState'

export function DashboardTab({ product, records }: { product: Product; records: DailyRecord[] }) {
  const computedRecords = useMemo(() => computeRecords(records), [records])
  const kpis = useMemo(() => aggregateKpis(computedRecords), [computedRecords])
  const funnel = useMemo(() => aggregateFunnel(computedRecords), [computedRecords])
  const period = useMemo(() => calculatePeriod(computedRecords), [computedRecords])

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
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CumulativeResultChart records={computedRecords} />
        <FunnelChart stages={funnel} period={period} />
        <CtrCpcChart records={computedRecords} />
        <CostRevenueChart records={computedRecords} />
        <div className="lg:col-span-2">
          <DailyResultChart records={computedRecords} />
        </div>
      </div>
    </div>
  )
}
