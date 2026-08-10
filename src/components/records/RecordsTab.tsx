import { useMemo, useState, type ReactNode } from 'react'
import type { ComputedRecord, DailyRecord, Product } from '@/types'
import { computeRecords } from '@/lib/calculations'
import {
  buttonDangerClass,
  buttonDangerGhostClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
} from '@/components/common/formStyles'
import {
  formatCurrency,
  formatDate,
  formatInt,
  formatPercent,
  formatPercentRaw,
  formatRatio,
  formatSignedCurrency,
} from '@/lib/format'
import { COLUMN_DEFS_BY_ID, type ColumnDef } from '@/lib/columns'
import { StrategyBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { RecordFormModal } from '@/components/records/RecordFormModal'
import { ColumnsPanel } from '@/components/records/ColumnsPanel'
import { ImportSpreadsheetModal } from '@/components/records/ImportSpreadsheetModal'
import { useAppStore } from '@/store/useAppStore'

function dropoffRateClasses(dropoffRate: number): string {
  if (dropoffRate <= 0) return 'text-[var(--color-positive-text)]'
  if (dropoffRate < 0.2) return 'text-[var(--color-warning-text)]'
  return 'text-[var(--color-negative-text)]'
}

function resultClasses(result: number): string {
  return result >= 0 ? 'text-[var(--color-positive-text)]' : 'text-[var(--color-negative-text)]'
}

const TH_CLASS =
  'whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white/80'
const TD_CLASS = 'whitespace-nowrap px-3 py-2.5 font-tabular text-sm'

function columnToneClass(column: ColumnDef, record: ComputedRecord): string {
  if (column.tone === 'signed') return resultClasses(record[column.key] as number)
  if (column.tone === 'dropoff') return dropoffRateClasses(record[column.key] as number)
  return ''
}

function renderColumnCell(column: ColumnDef, record: ComputedRecord): ReactNode {
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
      return <StrategyBadge strategy={value as DailyRecord['bidStrategy']} />
    case 'text':
      return (value as string) || '—'
    default:
      return String(value)
  }
}

export function RecordsTab({ product, records }: { product: Product; records: DailyRecord[] }) {
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null)
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false)
  const [isColumnsPanelOpen, setIsColumnsPanelOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const recordsColumnIds = useAppStore((state) => state.recordsColumnIds)
  const setRecordsColumnIds = useAppStore((state) => state.setRecordsColumnIds)
  const deleteRecord = useAppStore((state) => state.deleteRecord)

  const computedRecords = useMemo(() => [...computeRecords(records)].reverse(), [records])

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
    for (const id of selectedIds) {
      await deleteRecord(id, product.id)
    }
    setSelectedIds(new Set())
  }

  async function handleDeleteAll() {
    const count = computedRecords.length
    if (count === 0) return
    const confirmed = window.confirm(
      `Excluir todos os ${count} registros de "${product.name}"? Esta ação não pode ser desfeita.`,
    )
    if (!confirmed) return
    for (const record of computedRecords) {
      await deleteRecord(record.id, product.id)
    }
    setSelectedIds(new Set())
  }

  const columns = useMemo(
    () =>
      recordsColumnIds
        .map((id) => COLUMN_DEFS_BY_ID[id])
        .filter((column): column is ColumnDef => Boolean(column)),
    [recordsColumnIds],
  )

  const newRecordButton = (
    <button
      type="button"
      onClick={() => setIsNewRecordModalOpen(true)}
      className={buttonPrimaryClass}
    >
      + Registrar dia
    </button>
  )

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

  const deleteAllButton = (
    <button type="button" onClick={handleDeleteAll} className={buttonDangerGhostClass}>
      Excluir tudo
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

      {isNewRecordModalOpen ? (
        <RecordFormModal product={product} onClose={() => setIsNewRecordModalOpen(false)} />
      ) : null}

      {isColumnsPanelOpen ? (
        <ColumnsPanel
          visibleColumnIds={recordsColumnIds}
          onApply={(columnIds) => setRecordsColumnIds(columnIds)}
          onClose={() => setIsColumnsPanelOpen(false)}
        />
      ) : null}

      {isImportModalOpen ? (
        <ImportSpreadsheetModal product={product} onClose={() => setIsImportModalOpen(false)} />
      ) : null}
    </>
  )

  return (
    <div>
      {computedRecords.length === 0 ? (
        <EmptyState
          title="Nenhum registro ainda"
          description={`Clique em "+ Registrar dia" para lançar o primeiro dia de "${product.name}", ou importe o histórico de uma planilha.`}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {importButton}
              {newRecordButton}
            </div>
          }
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
              {columnsButton}
              {importButton}
              {deleteAllButton}
              {newRecordButton}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--color-card-border)]">
            <table className="w-full border-collapse">
              <thead style={{ backgroundColor: 'var(--color-header-dark)' }}>
                <tr>
                  <th className={`${TH_CLASS} text-center`}>
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
                  <th className={TH_CLASS}></th>
                  <th className={TH_CLASS}>Data</th>
                  {columns.map((column) => (
                    <th key={column.id} className={TH_CLASS}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-card-border)] bg-white">
                {computedRecords.map((record: ComputedRecord) => (
                  <tr
                    key={record.id}
                    className={`transition-colors duration-150 hover:bg-slate-50 ${
                      selectedIds.has(record.id) ? 'bg-[var(--color-accent-light)]/20' : ''
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
                        className="rounded-md p-1 text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-slate-200"
                      >
                        ✎
                      </button>
                    </td>
                    <td className={TD_CLASS}>{formatDate(record.date)}</td>
                    {columns.map((column) => {
                      const isBadge = column.format === 'badge'
                      const toneClass = columnToneClass(column, record)
                      const cellClass = [
                        TD_CLASS,
                        isBadge ? 'font-sans' : '',
                        toneClass ? `font-semibold ${toneClass}` : '',
                        column.truncate
                          ? 'max-w-[220px] truncate font-sans text-[var(--color-text-secondary)]'
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')

                      return (
                        <td
                          key={column.id}
                          className={cellClass}
                          title={column.truncate ? (record[column.key] as string) : undefined}
                        >
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
