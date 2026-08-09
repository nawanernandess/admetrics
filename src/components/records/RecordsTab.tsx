import { useMemo, useState, type ReactNode } from 'react'
import type { ComputedRecord, DailyRecord, Product } from '@/types'
import { computeRecords } from '@/lib/calculations'
import { buttonPrimaryClass, buttonSecondaryClass } from '@/components/common/formStyles'
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

  const recordsColumnIds = useAppStore((state) => state.recordsColumnIds)
  const setRecordsColumnIds = useAppStore((state) => state.setRecordsColumnIds)

  const computedRecords = useMemo(() => [...computeRecords(records)].reverse(), [records])

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
    </>
  )

  if (computedRecords.length === 0) {
    return (
      <div>
        <EmptyState
          title="Nenhum registro ainda"
          description={`Clique em "+ Registrar dia" para lançar o primeiro dia de "${product.name}".`}
          action={newRecordButton}
        />
        {modals}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        {columnsButton}
        {newRecordButton}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-card-border)]">
        <table className="w-full border-collapse">
          <thead style={{ backgroundColor: 'var(--color-header-dark)' }}>
            <tr>
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
              <tr key={record.id} className="transition-colors duration-150 hover:bg-slate-50">
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

      {modals}
    </div>
  )
}
