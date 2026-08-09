const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const integerFormatter = new Intl.NumberFormat('pt-BR')

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const monthYearFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatInt(value: number): string {
  return integerFormatter.format(Math.round(value))
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`
}

/** Para campos que o usuário já digita em unidades de porcentagem (ex.: parcela de impressões). */
export function formatPercentRaw(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatRatio(value: number, digits = 2): string {
  return `${value.toFixed(digits)}x`
}

export function formatSignedCurrency(value: number): string {
  return `${value >= 0 ? '+' : ''}${formatCurrency(value)}`
}

function toLocalDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

export function formatDate(iso: string): string {
  return dateFormatter.format(toLocalDate(iso))
}

export function formatMonthYear(iso: string): string {
  const label = monthYearFormatter.format(toLocalDate(iso))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Aceita vírgula ou ponto como separador decimal, conforme exigido pelo formulário. */
export function parseDecimal(input: string): number {
  if (!input) return 0
  const normalized = input.replace(',', '.').trim()
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) ? value : 0
}

export function getTodayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 10)
}
