import type { DailyRecordInput, Strategy } from '@/types'
import { STRATEGIES } from '@/types'

export type ImportableField = keyof DailyRecordInput

const PT_MONTHS: Record<string, number> = {
  jan: 1,
  fev: 2,
  mar: 3,
  abr: 4,
  mai: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  set: 9,
  out: 10,
  nov: 11,
  dez: 12,
}

/**
 * Dicionário de nomes EXATOS (após normalização) que cada campo pode assumir
 * numa planilha real. Nada de comparação por similaridade/prefixo aqui — se o
 * cabeçalho do arquivo não bater com nenhuma dessas formas, o campo fica sem
 * coluna candidata e nunca é adivinhado.
 */

/** Campos que o app calcula automaticamente — nunca são lidos do arquivo. */
const COMPUTED_FIELD_ALIASES = new Set(['ctr', 'cpc medio', 'custo por clique', 'cpc'])

const FIELD_ALIASES: Record<ImportableField, string[]> = {
  date: ['data', 'date', 'dia', 'dt'],
  impressions: ['impressoes', 'impressions', 'impr', 'impressao', 'qtd impressoes'],
  clicks: ['cliques', 'clicks', 'clique', 'qtd cliques'],
  visitors: ['visitors', 'visitantes', 'visitas', 'visits'],
  checkouts: ['checkouts', 'checkout', 'carrinhos'],
  conversions: ['conversoes', 'conversions', 'conversao', 'vendas'],
  cost: ['custo', 'cost', 'gasto', 'investimento', 'valor gasto', 'custo total'],
  convertedValue: [
    'valor convertido',
    'valor conv',
    'valor de conversao',
    'receita',
    'faturamento',
    'valor de venda',
    'valor vendido',
  ],
  maxCpcCpa: [
    'cpc cpa max',
    'cpc max',
    'cpa max',
    'lance maximo',
    'max cpc cpa',
    'cpc cpa maximo',
    'cpc/cpa max',
  ],
  dailyBudget: ['orcamento diario', 'orcam diario', 'budget', 'orcamento', 'orcamento do dia'],
  bidStrategy: [
    'estrategia de lance',
    'estrategia',
    'strategy',
    'tipo de lance',
    'estrategia lance',
  ],
  topShare: [
    'parc superior',
    'perc superior',
    'parcela superior',
    'parc sup',
    'perc sup',
    'impr abs topo',
  ],
  firstAboveShare: [
    'perc 1 ad',
    'parc 1 ad',
    'perc 1o ad',
    'parc 1o ad',
    '1o ad',
    'primeiro acima',
    'parc 1 anuncio',
    'perc 1 anuncio',
  ],
  impressionShare: [
    'parc impressoes',
    'perc impressoes',
    'parcela de impressoes',
    'parc impress',
    'perc impress',
    'parc impres',
    'perc impres',
    'parcela impressao',
    'impression share',
  ],
  account: ['conta', 'account'],
  page: ['pagina', 'page'],
  note: ['anotacao', 'nota', 'observacao', 'obs', 'notas', 'comentario', 'alteracoes', 'alteracao'],
}

export const FIELD_LABELS: Record<ImportableField, string> = {
  date: 'Data',
  impressions: 'Impressões',
  clicks: 'Cliques',
  visitors: 'Visitors',
  checkouts: 'Checkouts',
  conversions: 'Conversões',
  cost: 'Custo',
  convertedValue: 'Valor convertido',
  maxCpcCpa: 'CPC/CPA máx',
  dailyBudget: 'Orçam. diário',
  bidStrategy: 'Estratégia de lance',
  topShare: 'Parc. superior',
  firstAboveShare: 'Parc. 1º acima',
  impressionShare: 'Parc. impressões',
  account: 'Conta',
  page: 'Página',
  note: 'Anotação',
}

const PERCENT_RAW_FIELDS = new Set<ImportableField>([
  'topShare',
  'firstAboveShare',
  'impressionShare',
])
const CURRENCY_FIELDS = new Set<ImportableField>([
  'cost',
  'convertedValue',
  'maxCpcCpa',
  'dailyBudget',
])
const INT_FIELDS = new Set<ImportableField>([
  'impressions',
  'clicks',
  'visitors',
  'checkouts',
  'conversions',
])

export function normalizeHeader(value: string): string {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export type ColumnMapping = Partial<Record<ImportableField, number>>

/**
 * Casa cabeçalho com campo por igualdade exata (após normalizar acento,
 * caixa e pontuação) — nunca por "parece com" ou substring. Se duas colunas
 * batem no mesmo campo, ou o cabeçalho não bate com nada, o campo fica sem
 * candidato em vez de arriscar uma escolha.
 */
export function detectColumnMapping(headers: string[]): {
  mapping: ColumnMapping
  ignoredColumns: number[]
} {
  const normalized = headers.map(normalizeHeader)
  const mapping: ColumnMapping = {}
  const claimed = new Set<number>()
  const ignoredColumns: number[] = []

  normalized.forEach((header, index) => {
    if (header && COMPUTED_FIELD_ALIASES.has(header)) {
      ignoredColumns.push(index)
    }
  })

  const fields = Object.keys(FIELD_ALIASES) as ImportableField[]
  for (const field of fields) {
    const aliasSet = new Set(FIELD_ALIASES[field])
    const matches: number[] = []
    normalized.forEach((header, index) => {
      if (claimed.has(index) || ignoredColumns.includes(index)) return
      if (header && aliasSet.has(header)) matches.push(index)
    })
    // Exatamente uma coluna bateu com esse campo: aceita. Zero ou mais de uma:
    // não há candidato inequívoco, então não assume nenhuma.
    if (matches.length === 1) {
      mapping[field] = matches[0]
      claimed.add(matches[0])
    }
  }

  return { mapping, ignoredColumns }
}

function parseBrNumber(raw: unknown): number {
  if (typeof raw === 'number') return raw
  if (raw == null) return 0
  const stripped = String(raw).replace(/r\$/gi, '').replace(/%/g, '').replace(/\s/g, '').trim()
  if (!stripped) return 0

  let normalized = stripped
  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  }
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) ? value : 0
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function parseDateCell(raw: unknown, referenceYear: number): string | null {
  if (raw instanceof Date) {
    return `${raw.getFullYear()}-${pad2(raw.getMonth() + 1)}-${pad2(raw.getDate())}`
  }
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (!s) return null

  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (m) return `${m[1]}-${pad2(+m[2])}-${pad2(+m[3])}`

  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (m) return `${m[3]}-${pad2(+m[2])}-${pad2(+m[1])}`

  m = s.match(/^(\d{1,2})[/\-\s.]+([a-zç]{3})\.?$/)
  if (m && PT_MONTHS[m[2]]) return `${referenceYear}-${pad2(PT_MONTHS[m[2]])}-${pad2(+m[1])}`

  m = s.match(/^(\d{1,2})[/-](\d{1,2})$/)
  if (m) return `${referenceYear}-${pad2(+m[2])}-${pad2(+m[1])}`

  return null
}

function matchStrategy(raw: unknown): Strategy | null {
  if (!raw) return null
  const normalized = normalizeHeader(String(raw))
  const found = STRATEGIES.find((strategy) => normalizeHeader(strategy) === normalized)
  return found ?? null
}

/** Extrai até `limit` valores não vazios de uma coluna, para confirmar o tipo real dos dados. */
function sampleColumnValues(dataRows: unknown[][], columnIndex: number, limit = 12): string[] {
  const samples: string[] = []
  for (const row of dataRows) {
    const raw = row[columnIndex]
    const value = raw == null ? '' : String(raw).trim()
    if (value !== '') samples.push(value)
    if (samples.length >= limit) break
  }
  return samples
}

function isNumericLike(value: string): boolean {
  const cleaned = value.replace(/r\$/gi, '').replace(/%/g, '').replace(/\s/g, '').trim()
  if (!cleaned) return false
  // Planilhas em formato contábil BR usam "R$ -" para representar zero.
  if (cleaned === '-') return true
  return /^-?[\d.,]+$/.test(cleaned) && Number.isFinite(parseBrNumber(value))
}

function ratio(samples: string[], predicate: (value: string) => boolean): number {
  if (samples.length === 0) return -1 // sem dados para confirmar nem contradizer
  return samples.filter(predicate).length / samples.length
}

const CONFIDENCE_THRESHOLD = 0.8

/**
 * Confirma cada candidato de mapeamento contra os valores reais da coluna —
 * o nome do cabeçalho é só uma hipótese; os dados são a evidência. Um campo
 * só é aceito se a maioria dos valores amostrados tiver o formato esperado
 * (data parece data, moeda parece número sem "%", percentual tem "%" ou está
 * entre 0-100 etc.). Coluna sem nenhum dado amostrado é aceita no limite da
 * dúvida (não há evidência contra), mas qualquer contradição rejeita.
 */
export interface ValidatedMapping {
  confirmed: ColumnMapping
  rejected: Array<{ field: ImportableField; columnIndex: number; reason: string }>
}

export function validateMappingAgainstData(
  mapping: ColumnMapping,
  dataRows: unknown[][],
  referenceYear: number,
): ValidatedMapping {
  const confirmed: ColumnMapping = {}
  const rejected: ValidatedMapping['rejected'] = []

  for (const [field, columnIndex] of Object.entries(mapping) as Array<[ImportableField, number]>) {
    const samples = sampleColumnValues(dataRows, columnIndex)

    let score: number
    let reason = ''

    if (field === 'date') {
      score = ratio(samples, (value) => parseDateCell(value, referenceYear) !== null)
      reason = 'os valores da coluna não parecem datas'
    } else if (INT_FIELDS.has(field)) {
      score = ratio(
        samples,
        (value) => isNumericLike(value) && !value.includes('%') && !/r\$/i.test(value),
      )
      reason = 'os valores da coluna não parecem números inteiros'
    } else if (CURRENCY_FIELDS.has(field)) {
      score = ratio(samples, (value) => isNumericLike(value) && !value.includes('%'))
      reason = 'os valores da coluna não parecem valores monetários'
    } else if (PERCENT_RAW_FIELDS.has(field)) {
      score = ratio(samples, (value) => {
        if (value.includes('%')) return true
        if (!isNumericLike(value)) return false
        const n = parseBrNumber(value)
        return n >= 0 && n <= 100
      })
      reason = 'os valores da coluna não parecem percentuais'
    } else if (field === 'bidStrategy') {
      score = ratio(samples, (value) => matchStrategy(value) !== null)
      reason = 'os valores da coluna não correspondem a nenhuma estratégia conhecida'
    } else {
      score = 1 // account, page, note: texto livre, sem formato específico a confirmar
    }

    if (score < 0 || score >= CONFIDENCE_THRESHOLD) {
      confirmed[field] = columnIndex
    } else {
      rejected.push({ field, columnIndex, reason })
    }
  }

  return { confirmed, rejected }
}

export interface ParsedImportRow {
  rowNumber: number
  record: DailyRecordInput
  warnings: string[]
}

export interface ImportResult {
  rows: ParsedImportRow[]
  skipped: Array<{ rowNumber: number; reason: string }>
  trimmedBefore: number
  trimmedAfter: number
}

/** Campos de atividade real do dia — usados só para achar onde os dados de fato começam/acabam. */
const ACTIVITY_FIELDS: ImportableField[] = [
  'impressions',
  'clicks',
  'visitors',
  'checkouts',
  'conversions',
  'cost',
  'convertedValue',
]

function countActiveFields(row: unknown[], mapping: ColumnMapping): number {
  let count = 0
  for (const field of ACTIVITY_FIELDS) {
    const columnIndex = mapping[field]
    if (columnIndex == null) continue
    const raw = row[columnIndex]
    if (raw == null) continue
    const value = String(raw).trim()
    if (value !== '' && parseBrNumber(value) !== 0) count++
  }
  return count
}

/**
 * Um valor isolado (ex.: só "Cliques" preenchido, sem impressões/custo) costuma
 * ser ruído — teste manual da planilha, clique orgânico avulso etc. Um dia real
 * de atividade de anúncio quase sempre move mais de uma métrica ao mesmo tempo.
 * Por isso, quando há pelo menos 2 campos de atividade mapeados, exige-se que
 * pelo menos 2 estejam preenchidos simultaneamente para contar como "dia real".
 */
function rowHasActivity(
  row: unknown[],
  mapping: ColumnMapping,
  minFieldsRequired: number,
): boolean {
  if (countActiveFields(row, mapping) >= minFieldsRequired) return true
  // Uma anotação preenchida também é sinal de dia real, mesmo com métricas zeradas
  // (ex.: "pausei a campanha nesse dia").
  const noteIndex = mapping.note
  if (noteIndex != null) {
    const noteValue = row[noteIndex]
    if (noteValue != null && String(noteValue).trim() !== '') return true
  }
  return false
}

/**
 * Planilhas reais costumam ter linhas de "molde" no início/fim sem nenhuma
 * atividade real (dias futuros ainda não preenchidos, linhas de template).
 * Corta essas bordas — do primeiro ao último dia com algum dado de verdade —
 * sem tocar em dias zerados que estejam NO MEIO do período (esses são reais,
 * só um dia sem atividade).
 */
function trimEdgeRowsWithoutActivity(
  dataRows: unknown[][],
  mapping: ColumnMapping,
): { rows: unknown[][]; trimmedBefore: number; trimmedAfter: number } {
  const mappedActivityFieldCount = ACTIVITY_FIELDS.filter((field) => mapping[field] != null).length
  if (mappedActivityFieldCount === 0) return { rows: dataRows, trimmedBefore: 0, trimmedAfter: 0 }
  const minFieldsRequired = mappedActivityFieldCount >= 2 ? 2 : 1

  let first = -1
  let last = -1
  dataRows.forEach((row, index) => {
    if (rowHasActivity(row, mapping, minFieldsRequired)) {
      if (first === -1) first = index
      last = index
    }
  })

  if (first === -1) return { rows: dataRows, trimmedBefore: 0, trimmedAfter: 0 }

  return {
    rows: dataRows.slice(first, last + 1),
    trimmedBefore: first,
    trimmedAfter: dataRows.length - 1 - last,
  }
}

export function buildRecordsFromRows(
  dataRows: unknown[][],
  mapping: ColumnMapping,
  options: { referenceYear: number; defaultStrategy: Strategy },
): ImportResult {
  const {
    rows: trimmedDataRows,
    trimmedBefore,
    trimmedAfter,
  } = trimEdgeRowsWithoutActivity(dataRows, mapping)

  const rows: ParsedImportRow[] = []
  const skipped: ImportResult['skipped'] = []

  trimmedDataRows.forEach((row, index) => {
    const rowNumber = index + trimmedBefore + 2 // +1 for 0-index, +1 for header row
    const isEmpty = row.every((cell) => cell == null || String(cell).trim() === '')
    if (isEmpty) return

    const get = (field: ImportableField): unknown => {
      const columnIndex = mapping[field]
      return columnIndex == null ? null : row[columnIndex]
    }

    const date = mapping.date != null ? parseDateCell(get('date'), options.referenceYear) : null
    if (!date) {
      skipped.push({ rowNumber, reason: 'data ausente ou não reconhecida' })
      return
    }

    const warnings: string[] = []
    const strategy = matchStrategy(get('bidStrategy'))
    if (mapping.bidStrategy != null && get('bidStrategy') && !strategy) {
      warnings.push(
        `estratégia "${String(get('bidStrategy'))}" não reconhecida, usando "${options.defaultStrategy}"`,
      )
    }

    const record: DailyRecordInput = {
      date,
      impressions: Math.round(parseBrNumber(get('impressions'))),
      clicks: Math.round(parseBrNumber(get('clicks'))),
      visitors: Math.round(parseBrNumber(get('visitors'))),
      checkouts: Math.round(parseBrNumber(get('checkouts'))),
      conversions: Math.round(parseBrNumber(get('conversions'))),
      cost: parseBrNumber(get('cost')),
      convertedValue: parseBrNumber(get('convertedValue')),
      maxCpcCpa: parseBrNumber(get('maxCpcCpa')),
      dailyBudget: parseBrNumber(get('dailyBudget')),
      bidStrategy: strategy ?? options.defaultStrategy,
      topShare: parseBrNumber(get('topShare')),
      firstAboveShare: parseBrNumber(get('firstAboveShare')),
      impressionShare: parseBrNumber(get('impressionShare')),
      account: get('account') ? String(get('account')).trim() : '',
      page: get('page') ? String(get('page')).trim() : '',
      note: get('note') ? String(get('note')).trim() : '',
    }

    rows.push({ rowNumber, record, warnings })
  })

  return { rows, skipped, trimmedBefore, trimmedAfter }
}

export { PERCENT_RAW_FIELDS, CURRENCY_FIELDS, INT_FIELDS }

export interface ParsedSheet {
  headers: string[]
  dataRows: unknown[][]
}

const HEADER_SCAN_LIMIT = 15

/** Planilhas reais costumam ter títulos/linhas em branco antes do cabeçalho real. */
function pickHeaderRowIndex(rows: unknown[][]): number {
  let bestIndex = 0
  let bestScore = -1
  for (let i = 0; i < Math.min(rows.length, HEADER_SCAN_LIMIT); i++) {
    const candidate = rows[i].map((cell) => String(cell ?? ''))
    if (candidate.every((cell) => cell.trim() === '')) continue
    const { mapping } = detectColumnMapping(candidate)
    const score = Object.keys(mapping).length
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }
  return bestIndex
}

export async function readSpreadsheetFile(file: File): Promise<ParsedSheet> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()

  // .xlsx/.xls/.ods são um ZIP binário (assinatura "PK"); .csv é texto puro. Para
  // texto, decodificamos como UTF-8 nós mesmos antes de entregar à lib — do
  // contrário ela assume um codepage (ex.: Latin-1) e corrompe acentos como
  // "Impressões" → "ImpressÃµes", quebrando a detecção de colunas por nome.
  const signature = new Uint8Array(buffer.slice(0, 2))
  const isZip = signature[0] === 0x50 && signature[1] === 0x4b
  const input: ArrayBuffer | string = isZip ? buffer : new TextDecoder('utf-8').decode(buffer)

  // cellStyles:true é necessário para a lib preencher `!rows[].hidden` — sem essa
  // opção linhas ocultas no Excel/Sheets são lidas normalmente, ignorando o oculto.
  const workbook = XLSX.read(input, {
    type: isZip ? 'array' : 'string',
    cellDates: true,
    cellStyles: true,
  })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]

  // blankrows:true preserva o índice 1:1 com a linha real da planilha, necessário
  // para casar cada linha com `!rows` (metadados de linhas ocultas do Excel).
  const allRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: true,
  })

  const rowMeta = worksheet['!rows'] as Array<{ hidden?: boolean } | undefined> | undefined
  const rows = allRows.filter((_, index) => !rowMeta?.[index]?.hidden)

  if (rows.length === 0) {
    return { headers: [], dataRows: [] }
  }

  const headerRowIndex = pickHeaderRowIndex(rows)
  const headerRow = rows[headerRowIndex]
  const dataRows = rows.slice(headerRowIndex + 1)
  return { headers: headerRow.map((cell) => String(cell ?? '')), dataRows }
}
