import type { ComputedRecord, DailyRecord } from '@/types'

const RESULT_7D_WINDOW = 7

export function calculateCtr(record: DailyRecord): number {
  return record.impressions > 0 ? record.clicks / record.impressions : 0
}

export function calculateAverageCpc(record: DailyRecord): number {
  return record.clicks > 0 ? record.cost / record.clicks : 0
}

export function calculateResult(record: DailyRecord): number {
  return record.convertedValue - record.cost
}

/** Fuga entre checkout iniciado e conversão concluída — a etapa final do funil. */
export function calculateDropoffRate(record: DailyRecord): number {
  if (record.checkouts <= 0) return 0
  return (record.checkouts - record.conversions) / record.checkouts
}

export function calculateConversionRate(record: DailyRecord): number {
  return record.clicks > 0 ? record.conversions / record.clicks : 0
}

export function calculateCostPerConversion(record: DailyRecord): number {
  return record.conversions > 0 ? record.cost / record.conversions : 0
}

export function calculateRoas(record: DailyRecord): number {
  return record.cost > 0 ? record.convertedValue / record.cost : 0
}

export function calculateCpm(record: DailyRecord): number {
  return record.impressions > 0 ? (record.cost / record.impressions) * 1000 : 0
}

/**
 * Deriva todos os indicadores calculados a partir dos registros brutos.
 * Result7d e cumulativeResult dependem da ordem cronológica dos registros
 * já lançados (não de dias de calendário), refletindo o mesmo comportamento
 * da planilha original.
 */
export function computeRecords(records: DailyRecord[]): ComputedRecord[] {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))

  let cumulativeResult = 0
  const recentResults: number[] = []

  return sorted.map((record) => {
    const result = calculateResult(record)
    recentResults.push(result)
    if (recentResults.length > RESULT_7D_WINDOW) {
      recentResults.shift()
    }
    cumulativeResult += result

    return {
      ...record,
      ctr: calculateCtr(record),
      averageCpc: calculateAverageCpc(record),
      result,
      result7d: recentResults.reduce((sum, value) => sum + value, 0),
      cumulativeResult,
      dropoffRate: calculateDropoffRate(record),
      conversionRate: calculateConversionRate(record),
      costPerConversion: calculateCostPerConversion(record),
      roas: calculateRoas(record),
      cpm: calculateCpm(record),
    }
  })
}

export interface AggregatedKpis {
  impressions: number
  clicks: number
  visitors: number
  conversions: number
  totalCost: number
  cumulativeResult: number
}

export function aggregateKpis(records: ComputedRecord[]): AggregatedKpis {
  return records.reduce<AggregatedKpis>(
    (acc, r) => ({
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
      visitors: acc.visitors + r.visitors,
      conversions: acc.conversions + r.conversions,
      totalCost: acc.totalCost + r.cost,
      cumulativeResult: acc.cumulativeResult + r.result,
    }),
    { impressions: 0, clicks: 0, visitors: 0, conversions: 0, totalCost: 0, cumulativeResult: 0 },
  )
}

export interface FunnelStage {
  stage: string
  value: number
  percentage: number
}

export function aggregateFunnel(records: ComputedRecord[]): FunnelStage[] {
  const totals = records.reduce(
    (acc, r) => ({
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
      visitors: acc.visitors + r.visitors,
      checkouts: acc.checkouts + r.checkouts,
      conversions: acc.conversions + r.conversions,
    }),
    { impressions: 0, clicks: 0, visitors: 0, checkouts: 0, conversions: 0 },
  )

  const base = totals.impressions
  const stages: Array<[string, number]> = [
    ['Impressões', totals.impressions],
    ['Cliques', totals.clicks],
    ['Visitors', totals.visitors],
    ['Checkouts', totals.checkouts],
    ['Conversões', totals.conversions],
  ]

  return stages.map(([stage, value]) => ({
    stage,
    value,
    percentage: base > 0 ? value / base : 0,
  }))
}

export interface PeriodInfo {
  totalDays: number
  start: string | null
  end: string | null
}

export function calculatePeriod(records: ComputedRecord[]): PeriodInfo {
  if (records.length === 0) {
    return { totalDays: 0, start: null, end: null }
  }
  return {
    totalDays: records.length,
    start: records[0].date,
    end: records[records.length - 1].date,
  }
}
