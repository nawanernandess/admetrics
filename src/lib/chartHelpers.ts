import type { ComputedRecord } from '@/types'

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
