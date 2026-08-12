/**
 * Catálogo de todos os gráficos disponíveis no dashboard — o usuário decide
 * quais exibir, em que ordem e se ocupam linha inteira ou meia linha (ver
 * `DashboardChartsPanel`), no mesmo espírito da personalização de colunas da
 * tabela de registros (`columns.ts`).
 *
 * `fullWidth` aqui é só o valor inicial sugerido (Taxa de fuga e Parcela de
 * impressões nascem como linha inteira) — o usuário pode mudar cada gráfico
 * individualmente, e a escolha dele é o que fica salvo.
 */
export interface DashboardChartDef {
  id: string
  label: string
  group: string
  fullWidth?: boolean
}

export const DASHBOARD_CHART_GROUPS = ['Visão geral', 'Funil', 'Financeiro', 'Leilão'] as const

export const DASHBOARD_CHART_DEFS: DashboardChartDef[] = [
  { id: 'dailyResult', label: 'Resultado diário', group: 'Visão geral' },
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

/** Ordem/visibilidade padrão. */
export const DEFAULT_VISIBLE_DASHBOARD_CHART_IDS: string[] = [
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

/** Largura padrão (antes de qualquer escolha do usuário) — só as duas âncoras nascem em linha inteira. */
export const DEFAULT_FULL_WIDTH_DASHBOARD_CHART_IDS: string[] = DASHBOARD_CHART_DEFS.filter(
  (chart) => chart.fullWidth,
).map((chart) => chart.id)

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

/** Mesma limpeza de `sanitizeDashboardChartIds`, para o conjunto de ids marcados como linha inteira. */
export function sanitizeFullWidthChartIds(ids: string[]): string[] {
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
 * Largura de cada gráfico visível na grade de 2 colunas — decidida pelo
 * usuário (`fullWidthChartIds`), sem nenhum ajuste automático por
 * quantidade. Se sobrar um gráfico de meia linha sozinho num trecho, o
 * espaço ao lado fica vazio em vez de o gráfico virar linha inteira.
 */
export function computeDashboardChartLayout(
  chartIds: string[],
  fullWidthChartIds: string[],
): DashboardChartLayoutItem[] {
  const fullWidthSet = new Set(fullWidthChartIds)
  return chartIds
    .filter((id) => DASHBOARD_CHART_DEFS_BY_ID[id])
    .map((id) => ({ id, fullWidth: fullWidthSet.has(id) }))
}
