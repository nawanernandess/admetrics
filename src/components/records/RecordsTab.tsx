import { useMemo, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import type { ComputedRecord, DailyRecord, Product } from '@/types'
import { computeRecords } from '@/lib/calculations'
import { buttonDangerClass, buttonSecondaryClass } from '@/components/common/formStyles'
import {
  formatCurrency,
  formatDate,
  formatInt,
  formatPercent,
  formatPercentRaw,
  formatRatio,
  formatSignedCurrency,
} from '@/lib/format'
import { COLUMN_DEFS_BY_ID, getDefaultColumnWidth, type ColumnDef } from '@/lib/columns'
import { StrategyBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { RecordFormModal } from '@/components/records/RecordFormModal'
import { ColumnsPanel } from '@/components/records/ColumnsPanel'
import { ImportSpreadsheetModal } from '@/components/records/ImportSpreadsheetModal'
import { useAppStore } from '@/store/useAppStore'

const CHECKBOX_COLUMN_WIDTH = 40
const EDIT_COLUMN_WIDTH = 40
const MIN_COLUMN_WIDTH = 56
const MAX_COLUMN_WIDTH = 480
const CELL_HORIZONTAL_PADDING = 24 // px-3 nos dois lados
const RESIZE_HANDLE_WIDTH = 6
const AUTO_WIDTH_BUFFER = 6
const HEADER_FONT = '600 12px Manrope, system-ui, sans-serif'
const VALUE_FONT_MONO = '600 14px "IBM Plex Mono", ui-monospace, monospace'
const BADGE_FONT = '500 12px Manrope, system-ui, sans-serif'
const HEADER_TRACKING_EM = 0.025 // tracking-wide

let measureCanvasContext: CanvasRenderingContext2D | null = null

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (!measureCanvasContext) {
    measureCanvasContext = document.createElement('canvas').getContext('2d')
  }
  return measureCanvasContext
}

function measureTextWidth(text: string, font: string): number {
  const ctx = getMeasureContext()
  if (!ctx) return 0
  ctx.font = font
  return ctx.measureText(text).width
}

function measureHeaderWidth(label: string): number {
  const upper = label.toUpperCase()
  return measureTextWidth(upper, HEADER_FONT) + upper.length * HEADER_TRACKING_EM * 12
}

function measureValueWidth(column: ColumnDef, text: string): number {
  if (column.format === 'badge') {
    return measureTextWidth(text, BADGE_FONT) + 20 // badge tem seu próprio px-2.5 (10px de cada lado)
  }
  return measureTextWidth(text, VALUE_FONT_MONO)
}

/** Largura mínima que caberia o texto medido, já com padding/alça/margem de segurança. */
function widthFromMeasurements(headerWidth: number, maxValueWidth: number): number {
  const fit =
    Math.ceil(Math.max(headerWidth, maxValueWidth)) +
    CELL_HORIZONTAL_PADDING +
    RESIZE_HANDLE_WIDTH +
    AUTO_WIDTH_BUFFER
  return Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, fit))
}

/**
 * Largura padrão calculada a partir do conteúdo real (cabeçalho + valores
 * atuais dos registros) — garante que nada precise de reticências até que o
 * usuário redimensione a coluna manualmente.
 */
function computeColumnAutoFitWidth(column: ColumnDef, values: string[]): number {
  const headerWidth = measureHeaderWidth(column.label)
  const maxValueWidth = values.reduce(
    (max, text) => Math.max(max, measureValueWidth(column, text)),
    0,
  )
  return widthFromMeasurements(headerWidth, maxValueWidth)
}

const DATE_SORT_ICON_WIDTH = 16 // seta de ordenação (▲/▼) + espaçamento (gap-1)

/** Mesma ideia de `computeColumnAutoFitWidth`, mas para a coluna fixa de Data (fora do catálogo). */
function computeDateColumnAutoFitWidth(values: string[]): number {
  const headerWidth = measureHeaderWidth('Data') + DATE_SORT_ICON_WIDTH
  const maxValueWidth = values.reduce(
    (max, text) => Math.max(max, measureTextWidth(text, VALUE_FONT_MONO)),
    0,
  )
  return widthFromMeasurements(headerWidth, maxValueWidth)
}

function formatColumnValueText(column: ColumnDef, record: ComputedRecord): string {
  const value = record[column.key]
  switch (column.format) {
    case 'int':
      return formatInt(value as number)
    case 'currency':
      return formatCurrency(value as number)
    case 'currencySigned':
      return formatSignedCurrency(value as number)
    case 'percent':
      return formatPercent(value as number)
    case 'percentRaw':
      return formatPercentRaw(value as number)
    case 'ratio':
      return formatRatio(value as number)
    case 'badge':
      return value as string
    case 'text':
      return (value as string) || '—'
    default:
      return String(value)
  }
}

function dropoffRateClasses(dropoffRate: number): string {
  if (dropoffRate <= 0) return 'text-[var(--color-positive-text)]'
  if (dropoffRate < 0.2) return 'text-[var(--color-warning-text)]'
  return 'text-[var(--color-negative-text)]'
}

function resultClasses(result: number): string {
  return result >= 0 ? 'text-[var(--color-positive-text)]' : 'text-[var(--color-negative-text)]'
}

const TH_CLASS =
  'truncate px-3 py-2.5 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-white/80'
const TD_BASE_CLASS = 'px-3 py-2.5 align-top font-tabular text-sm'
const TD_CLASS = `whitespace-nowrap ${TD_BASE_CLASS}`

/**
 * Alça de redimensionamento nativa (sem lib) — arrasta a borda direita do
 * cabeçalho para ajustar a largura da coluna, com o mouse/touch preso via
 * Pointer Events enquanto durar o arraste.
 */
function ColumnResizeHandle({
  width,
  onResize,
}: {
  width: number
  onResize: (width: number) => void
}) {
  function onPointerDown(event: ReactPointerEvent<HTMLSpanElement>) {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startWidth = width
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    function onPointerMove(moveEvent: PointerEvent) {
      const next = startWidth + (moveEvent.clientX - startX)
      onResize(Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, next)))
    }

    function onPointerUp() {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return (
    <span
      onPointerDown={onPointerDown}
      className="absolute right-0 top-0 h-full w-1.5 touch-none cursor-col-resize select-none hover:bg-white/30 active:bg-white/40"
    />
  )
}

function columnToneClass(column: ColumnDef, record: ComputedRecord): string {
  if (column.tone === 'signed') return resultClasses(record[column.key] as number)
  if (column.tone === 'dropoff') return dropoffRateClasses(record[column.key] as number)
  return ''
}

function renderColumnCell(column: ColumnDef, record: ComputedRecord): ReactNode {
  if (column.format === 'badge') {
    return <StrategyBadge strategy={record[column.key] as DailyRecord['bidStrategy']} />
  }
  return formatColumnValueText(column, record)
}

export function RecordsTab({ product, records }: { product: Product; records: DailyRecord[] }) {
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null)
  const [isColumnsPanelOpen, setIsColumnsPanelOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dateColumnWidthOverride, setDateColumnWidthOverride] = useState<number | null>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})

  const recordsColumnIds = useAppStore((state) => state.recordsColumnIds)
  const setRecordsColumnIds = useAppStore((state) => state.setRecordsColumnIds)
  const dateSortAsc = useAppStore((state) => state.recordsDateSortAsc)
  const setRecordsDateSortAsc = useAppStore((state) => state.setRecordsDateSortAsc)
  const deleteRecords = useAppStore((state) => state.deleteRecords)

  const computedRecords = useMemo(() => {
    const sorted = computeRecords(records, product.targetConversionValue)
    return dateSortAsc ? sorted : sorted.reverse()
  }, [records, dateSortAsc, product.targetConversionValue])

  const columns = useMemo(
    () =>
      recordsColumnIds
        .map((id) => COLUMN_DEFS_BY_ID[id])
        .filter((column): column is ColumnDef => Boolean(column)),
    [recordsColumnIds],
  )

  const autoFitWidths = useMemo(() => {
    const widths: Record<string, number> = {}
    for (const column of columns) {
      if (column.truncate) continue
      const values = computedRecords.map((record) => formatColumnValueText(column, record))
      widths[column.id] = computeColumnAutoFitWidth(column, values)
    }
    return widths
  }, [columns, computedRecords])

  const dateAutoFitWidth = useMemo(() => {
    const values = computedRecords.map((record) => formatDate(record.date))
    return computeDateColumnAutoFitWidth(values)
  }, [computedRecords])

  const dateColumnWidth = dateColumnWidthOverride ?? dateAutoFitWidth

  function getColumnWidth(column: ColumnDef): number {
    return columnWidths[column.id] ?? autoFitWidths[column.id] ?? getDefaultColumnWidth(column)
  }

  function resizeColumn(columnId: string, width: number) {
    setColumnWidths((current) => ({ ...current, [columnId]: width }))
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((current) =>
      current.size === computedRecords.length
        ? new Set()
        : new Set(computedRecords.map((record) => record.id)),
    )
  }

  async function handleDeleteSelected() {
    const count = selectedIds.size
    if (count === 0) return
    const confirmed = window.confirm(
      `Excluir ${count} registro${count === 1 ? '' : 's'} selecionado${count === 1 ? '' : 's'}? Esta ação não pode ser desfeita.`,
    )
    if (!confirmed) return
    await deleteRecords(Array.from(selectedIds), product.id)
    setSelectedIds(new Set())
  }

  // table-layout:fixed só respeita as larguras das colunas à risca quando a
  // própria <table> tem uma largura explícita (não "auto") igual à soma das
  // colunas — do contrário o navegador redistribui o espaço por conta própria.
  const totalTableWidth =
    CHECKBOX_COLUMN_WIDTH +
    EDIT_COLUMN_WIDTH +
    dateColumnWidth +
    columns.reduce((sum, column) => sum + getColumnWidth(column), 0)

  const columnsButton = (
    <button
      type="button"
      onClick={() => setIsColumnsPanelOpen(true)}
      className={buttonSecondaryClass}
    >
      ⚙ Colunas
    </button>
  )

  const importButton = (
    <button
      type="button"
      onClick={() => setIsImportModalOpen(true)}
      className={buttonSecondaryClass}
    >
      ⭱ Importar planilha
    </button>
  )

  const modals = (
    <>
      {editingRecord ? (
        <RecordFormModal
          product={product}
          existingRecord={editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      ) : null}

      {isColumnsPanelOpen ? (
        <ColumnsPanel
          visibleColumnIds={recordsColumnIds}
          onApply={(columnIds) => setRecordsColumnIds(columnIds)}
          onClose={() => setIsColumnsPanelOpen(false)}
        />
      ) : null}

      {isImportModalOpen ? (
        <ImportSpreadsheetModal
          product={product}
          existingRecords={records}
          onClose={() => setIsImportModalOpen(false)}
        />
      ) : null}
    </>
  )

  return (
    <div>
      {computedRecords.length === 0 ? (
        <EmptyState
          title="Nenhum registro ainda"
          description={`Clique em "+ Registrar dia" para lançar o primeiro dia de "${product.name}", ou importe o histórico de uma planilha.`}
          action={<div className="flex flex-wrap justify-center gap-2">{importButton}</div>}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.size > 0 ? (
                <>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {selectedIds.size} selecionado{selectedIds.size === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className={buttonDangerClass}
                  >
                    Excluir selecionados
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className={buttonSecondaryClass}
                  >
                    Cancelar seleção
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {importButton}
              {columnsButton}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--color-card-border)]">
            <table
              className="border-collapse"
              style={{ tableLayout: 'fixed', width: totalTableWidth }}
            >
              <thead style={{ backgroundColor: 'var(--color-header-dark)' }}>
                <tr>
                  <th
                    className={`${TH_CLASS} text-center`}
                    style={{ width: CHECKBOX_COLUMN_WIDTH }}
                  >
                    <input
                      type="checkbox"
                      aria-label="Selecionar todos os registros"
                      checked={
                        computedRecords.length > 0 && selectedIds.size === computedRecords.length
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-[var(--color-card-border)]"
                    />
                  </th>
                  <th className={TH_CLASS} style={{ width: EDIT_COLUMN_WIDTH }}></th>
                  <th className={`${TH_CLASS} relative`} style={{ width: dateColumnWidth }}>
                    <button
                      type="button"
                      onClick={() => setRecordsDateSortAsc(!dateSortAsc)}
                      className="flex items-center gap-1 text-white/80 hover:text-white"
                    >
                      Data
                      <span aria-hidden="true">{dateSortAsc ? '▲' : '▼'}</span>
                    </button>
                    <ColumnResizeHandle
                      width={dateColumnWidth}
                      onResize={setDateColumnWidthOverride}
                    />
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className={`${TH_CLASS} relative`}
                      style={{ width: getColumnWidth(column) }}
                      title={column.label}
                    >
                      {column.label}
                      <ColumnResizeHandle
                        width={getColumnWidth(column)}
                        onResize={(width) => resizeColumn(column.id, width)}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-card-border)] bg-[var(--color-card-bg)]">
                {computedRecords.map((record: ComputedRecord) => (
                  <tr
                    key={record.id}
                    className={`transition-colors duration-150 hover:bg-[var(--color-hover-bg)] ${
                      selectedIds.has(record.id)
                        ? 'bg-[var(--color-accent-light)]/20'
                        : record.conversions > 0
                          ? 'bg-[var(--color-positive-bg)]'
                          : ''
                    }`}
                  >
                    <td className={`${TD_CLASS} text-center`}>
                      <input
                        type="checkbox"
                        aria-label={`Selecionar registro de ${formatDate(record.date)}`}
                        checked={selectedIds.has(record.id)}
                        onChange={() => toggleSelected(record.id)}
                        className="h-4 w-4 rounded border-[var(--color-card-border)]"
                      />
                    </td>
                    <td className={`${TD_CLASS} text-center`}>
                      <button
                        type="button"
                        aria-label="Editar registro"
                        onClick={() => setEditingRecord(record)}
                        className="rounded-md p-1 text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-hover-bg-strong)]"
                      >
                        ✎
                      </button>
                    </td>
                    <td className={TD_CLASS}>{formatDate(record.date)}</td>
                    {columns.map((column) => {
                      const isBadge = column.format === 'badge'
                      const toneClass = columnToneClass(column, record)
                      const cellClass = [
                        TD_BASE_CLASS,
                        'whitespace-normal break-words',
                        isBadge ? 'font-sans' : '',
                        toneClass ? `font-semibold ${toneClass}` : '',
                        column.truncate ? 'font-sans text-[var(--color-text-secondary)]' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')

                      return (
                        <td key={column.id} className={cellClass}>
                          {renderColumnCell(column, record)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modals}
    </div>
  )
}
