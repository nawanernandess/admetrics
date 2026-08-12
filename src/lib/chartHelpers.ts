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
