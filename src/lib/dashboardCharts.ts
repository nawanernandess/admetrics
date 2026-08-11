/**
 * Catálogo de todos os gráficos disponíveis no dashboard — o usuário decide
 * quais exibir e em que ordem (ver `DashboardChartsPanel`), no mesmo espírito
 * da personalização de colunas da tabela de registros (`columns.ts`).
 *
 * `fullWidth` marca os gráficos de maior importância (Taxa de fuga e Parcela
 * de impressões) — eles sempre ocupam a linha inteira, onde quer que apareçam
 * na ordem escolhida; os demais fluem em pares numa grade de 2 colunas.
 */
export interface DashboardChartDef {
  id: string
  label: string
  group: string
  fullWidth?: boolean
}

export const DASHBOARD_CHART_GROUPS = ['Visão geral', 'Funil', 'Financeiro', 'Leilão'] as const

export const DASHBOARD_CHART_DEFS: DashboardChartDef[] = [
  { id: 'cumulativeResult', label: 'Resultado acumulado', group: 'Visão geral' },
  { id: 'dailyResult', label: 'Resultado diário', group: 'Visão geral' },
  { id: 'funnel', label: 'Funil de conversão', group: 'Funil' },
  { id: 'ctrCpc', label: 'CTR × CPC', group: 'Funil' },
  { id: 'conversionRate', label: 'Taxa de conversão', group: 'Funil' },
  { id: 'dropoffRate', label: 'Taxa de fuga', group: 'Funil', fullWidth: true },
  { id: 'costRevenue', label: 'Custo × Valor convertido', group: 'Financeiro' },
  { id: 'roas', label: 'ROAS', group: 'Financeiro' },
  { id: 'cpa', label: 'CPA vs. meta', group: 'Financeiro' },
  { id: 'budgetPacing', label: 'Orçamento × custo real', group: 'Financeiro' },
  { id: 'impressionShare', label: 'Parcela de impressões', group: 'Leilão', fullWidth: true },
]

export const DASHBOARD_CHART_DEFS_BY_ID: Record<string, DashboardChartDef> = Object.fromEntries(
  DASHBOARD_CHART_DEFS.map((chart) => [chart.id, chart]),
)

/**
 * Ordem/visibilidade padrão — com as duas âncoras de linha inteira nas
 * posições certas. Funil de conversão fica disponível na galeria mas fora
 * do padrão (o usuário liga se quiser).
 */
export const DEFAULT_VISIBLE_DASHBOARD_CHART_IDS: string[] = [
  'cumulativeResult',
  'ctrCpc',
  'dropoffRate',
  'conversionRate',
  'roas',
  'cpa',
  'costRevenue',
  'impressionShare',
  'budgetPacing',
  'dailyResult',
]

/** Remove ids que não existem mais no catálogo e ids duplicados, preservando a ordem. */
export function sanitizeDashboardChartIds(ids: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const id of ids) {
    if (seen.has(id) || !DASHBOARD_CHART_DEFS_BY_ID[id]) continue
    seen.add(id)
    result.push(id)
  }
  return result
}

export interface DashboardChartLayoutItem {
  id: string
  fullWidth: boolean
}

/**
 * Decide a largura de cada gráfico visível na grade de 2 colunas: as âncoras
 * (`fullWidth` no catálogo) sempre ocupam a linha inteira; entre elas, os
 * gráficos normais fluem em pares — mas se um trecho tiver número ímpar de
 * gráficos, o último desse trecho também vira linha inteira, para nunca
 * sobrar um gráfico sozinho com espaço vazio ao lado.
 */
export function computeDashboardChartLayout(chartIds: string[]): DashboardChartLayoutItem[] {
  const result: DashboardChartLayoutItem[] = []
  let run: string[] = []

  function flushRun() {
    run.forEach((id, index) => {
      const isLastOfOddRun = run.length % 2 === 1 && index === run.length - 1
      result.push({ id, fullWidth: isLastOfOddRun })
    })
    run = []
  }

  for (const id of chartIds) {
    const def = DASHBOARD_CHART_DEFS_BY_ID[id]
    if (!def) continue
    if (def.fullWidth) {
      flushRun()
      result.push({ id, fullWidth: true })
    } else {
      run.push(id)
    }
  }
  flushRun()

  return result
}
