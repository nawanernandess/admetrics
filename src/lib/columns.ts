import type { ComputedRecord } from '@/types'

/**
 * Catálogo de todas as colunas/métricas disponíveis para a tabela de registros,
 * no espírito das colunas que o Google Ads oferece (tráfego, funil, financeiro,
 * parcela de impressões, configuração). O usuário decide quais exibir e em que
 * ordem — ver `ColumnsPanel`. Nenhum campo aqui é obrigatório na tela.
 */
export type ColumnFormat =
  'int' | 'currency' | 'currencySigned' | 'percent' | 'percentRaw' | 'ratio' | 'badge' | 'text'

export type ColumnTone = 'signed' | 'dropoff'

export interface ColumnDef {
  id: string
  key: keyof ComputedRecord
  label: string
  group: string
  format: ColumnFormat
  tone?: ColumnTone
  truncate?: boolean
}

export const COLUMN_GROUPS = [
  'Tráfego',
  'Funil',
  'Financeiro',
  'Parcela de impressões',
  'Configuração',
  'Anotação',
] as const

export const COLUMN_DEFS: ColumnDef[] = [
  { id: 'impressions', key: 'impressions', label: 'Impressões', group: 'Tráfego', format: 'int' },
  { id: 'clicks', key: 'clicks', label: 'Cliques', group: 'Tráfego', format: 'int' },
  { id: 'visitors', key: 'visitors', label: 'Visitors', group: 'Tráfego', format: 'int' },
  { id: 'ctr', key: 'ctr', label: 'CTR', group: 'Tráfego', format: 'percent' },
  { id: 'averageCpc', key: 'averageCpc', label: 'CPC médio', group: 'Tráfego', format: 'currency' },
  { id: 'cpm', key: 'cpm', label: 'CPM médio', group: 'Tráfego', format: 'currency' },

  { id: 'checkouts', key: 'checkouts', label: 'Checkouts', group: 'Funil', format: 'int' },
  { id: 'conversions', key: 'conversions', label: 'Conversões', group: 'Funil', format: 'int' },
  {
    id: 'conversionRate',
    key: 'conversionRate',
    label: 'Taxa de conv.',
    group: 'Funil',
    format: 'percent',
  },
  {
    id: 'dropoffRate',
    key: 'dropoffRate',
    label: 'Taxa de fuga',
    group: 'Funil',
    format: 'percent',
    tone: 'dropoff',
  },

  { id: 'cost', key: 'cost', label: 'Custo', group: 'Financeiro', format: 'currency' },
  {
    id: 'convertedValue',
    key: 'convertedValue',
    label: 'Valor conv.',
    group: 'Financeiro',
    format: 'currency',
  },
  {
    id: 'costPerConversion',
    key: 'costPerConversion',
    label: 'Custo / conv.',
    group: 'Financeiro',
    format: 'currency',
  },
  {
    id: 'roas',
    key: 'roas',
    label: 'Valor conv. / custo',
    group: 'Financeiro',
    format: 'ratio',
  },
  {
    id: 'maxCpcCpa',
    key: 'maxCpcCpa',
    label: 'CPC/CPA máx',
    group: 'Financeiro',
    format: 'currency',
  },
  {
    id: 'dailyBudget',
    key: 'dailyBudget',
    label: 'Orçam. diário',
    group: 'Financeiro',
    format: 'currency',
  },
  {
    id: 'result',
    key: 'result',
    label: 'Resultado',
    group: 'Financeiro',
    format: 'currencySigned',
    tone: 'signed',
  },
  {
    id: 'result7d',
    key: 'result7d',
    label: 'Resultado 7d',
    group: 'Financeiro',
    format: 'currencySigned',
    tone: 'signed',
  },
  {
    id: 'cumulativeResult',
    key: 'cumulativeResult',
    label: 'Acumulado',
    group: 'Financeiro',
    format: 'currencySigned',
    tone: 'signed',
  },

  {
    id: 'topShare',
    key: 'topShare',
    label: 'Parc. superior',
    group: 'Parcela de impressões',
    format: 'percentRaw',
  },
  {
    id: 'firstAboveShare',
    key: 'firstAboveShare',
    label: 'Parc. 1º acima',
    group: 'Parcela de impressões',
    format: 'percentRaw',
  },
  {
    id: 'impressionShare',
    key: 'impressionShare',
    label: 'Parc. impressões',
    group: 'Parcela de impressões',
    format: 'percentRaw',
  },

  {
    id: 'bidStrategy',
    key: 'bidStrategy',
    label: 'Estratégia',
    group: 'Configuração',
    format: 'badge',
  },
  { id: 'account', key: 'account', label: 'Conta', group: 'Configuração', format: 'text' },
  { id: 'page', key: 'page', label: 'Página', group: 'Configuração', format: 'text' },

  { id: 'note', key: 'note', label: 'Anotação', group: 'Anotação', format: 'text', truncate: true },
]

export const COLUMN_DEFS_BY_ID: Record<string, ColumnDef> = Object.fromEntries(
  COLUMN_DEFS.map((column) => [column.id, column]),
)

/** Ordem/visibilidade padrão — reflete a tabela original antes da personalização. */
export const DEFAULT_VISIBLE_COLUMN_IDS: string[] = [
  'impressions',
  'clicks',
  'visitors',
  'checkouts',
  'conversions',
  'ctr',
  'averageCpc',
  'maxCpcCpa',
  'dailyBudget',
  'bidStrategy',
  'cost',
  'convertedValue',
  'result',
  'result7d',
  'cumulativeResult',
  'dropoffRate',
  'note',
]

const NOTE_COLUMN_WIDTH = 220
const FALLBACK_COLUMN_WIDTH = 120

/**
 * Largura de fallback — o RecordsTab calcula a largura real de cada coluna
 * pelo conteúdo (cabeçalho + valores atuais, ver `computeColumnAutoFitWidth`
 * em RecordsTab.tsx), então isto só é usado para a coluna de Anotação (texto
 * livre, largura fixa para poder quebrar linha) e como piso de segurança para
 * qualquer coluna ainda sem largura calculada.
 */
export function getDefaultColumnWidth(column: ColumnDef): number {
  return column.truncate ? NOTE_COLUMN_WIDTH : FALLBACK_COLUMN_WIDTH
}

/** Remove ids que não existem mais no catálogo e ids duplicados, preservando a ordem. */
export function sanitizeColumnIds(ids: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const id of ids) {
    if (seen.has(id) || !COLUMN_DEFS_BY_ID[id]) continue
    seen.add(id)
    result.push(id)
  }
  return result
}
