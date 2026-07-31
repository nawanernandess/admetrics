import type { ComputedRecord } from '@/types'
import { formatMonthYear } from '@/lib/format'

/** Garante que o eixo temporal mostre o mês inicial à esquerda e o mês final à direita. */
export function getEdgeTicks(records: ComputedRecord[]): string[] {
  if (records.length === 0) return []
  const first = records[0].date
  const last = records[records.length - 1].date
  return first === last ? [first] : [first, last]
}

export function monthYearTickFormatter(date: string): string {
  return formatMonthYear(date)
}
