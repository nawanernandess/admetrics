import type { ComputedRecord } from '@/types'

export type ChartPeriod = 'dia' | 'semana' | 'mes'

export const CHART_PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: 'dia', label: 'Dia' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
]

const CHART_PERIOD_WINDOW: Record<ChartPeriod, number> = {
  dia: 1,
  semana: 7,
  mes: 30,
}

/**
 * Recorta os últimos N registros (relativo ao registro mais recente) conforme
 * o período escolhido no gráfico — não recalcula nem agrega métricas, só
 * decide quantos pontos do histórico já calculado ficam visíveis.
 */
export function filterByPeriod<T>(records: T[], period: ChartPeriod): T[] {
  const window = CHART_PERIOD_WINDOW[period]
  return records.length > window ? records.slice(-window) : records
}

/** Garante que o eixo temporal mostre o mês inicial à esquerda e o mês final à direita. */
export function getEdgeTicks(records: ComputedRecord[]): string[] {
  if (records.length === 0) return []
  const first = records[0].date
  const last = records[records.length - 1].date
  return first === last ? [first] : [first, last]
}

/** Mantém o espaço do eixo (mesmo layout de antes) sem exibir o texto da data. */
export function blankTickFormatter(): string {
  return ' '
}

/**
 * Acima de ~2 semanas de pontos, rótulos fixos por dia colidem entre si (mais
 * ainda em telas de celular) — nesse caso os valores continuam disponíveis
 * via tooltip ao tocar/passar o mouse, só não ficam sempre visíveis. Isso
 * deixa de ser necessário quando o gráfico tiver seu próprio filtro de
 * período (dia/semana/mês), já que agregar por semana/mês naturalmente
 * reduz a quantidade de pontos.
 */
export function shouldShowDataLabels(records: unknown[]): boolean {
  return records.length <= 14
}
