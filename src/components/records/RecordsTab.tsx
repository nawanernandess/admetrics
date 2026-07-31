import { useMemo, useState } from 'react'
import type { ComputedRecord, DailyRecord, Product } from '@/types'
import { computeRecords } from '@/lib/calculations'
import { buttonPrimaryClass } from '@/components/common/formStyles'
import { formatCurrency, formatDate, formatInt, formatPercent } from '@/lib/format'
import { StrategyBadge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { RecordFormModal } from '@/components/records/RecordFormModal'

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

export function RecordsTab({ product, records }: { product: Product; records: DailyRecord[] }) {
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null)
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false)

  const computedRecords = useMemo(() => [...computeRecords(records)].reverse(), [records])

  const newRecordButton = (
    <button
      type="button"
      onClick={() => setIsNewRecordModalOpen(true)}
      className={buttonPrimaryClass}
    >
      + Registrar dia
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
      <div className="mb-4 flex justify-end">{newRecordButton}</div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-card-border)]">
        <table className="w-full border-collapse">
          <thead style={{ backgroundColor: 'var(--color-header-dark)' }}>
            <tr>
              <th className={TH_CLASS}></th>
              <th className={TH_CLASS}>Data</th>
              <th className={TH_CLASS}>Impressões</th>
              <th className={TH_CLASS}>Cliques</th>
              <th className={TH_CLASS}>Visitors</th>
              <th className={TH_CLASS}>Checkouts</th>
              <th className={TH_CLASS}>Conversões</th>
              <th className={TH_CLASS}>CTR</th>
              <th className={TH_CLASS}>CPC médio</th>
              <th className={TH_CLASS}>CPC/CPA máx</th>
              <th className={TH_CLASS}>Orçam. diário</th>
              <th className={TH_CLASS}>Estratégia</th>
              <th className={TH_CLASS}>Custo</th>
              <th className={TH_CLASS}>Valor conv.</th>
              <th className={TH_CLASS}>Resultado</th>
              <th className={TH_CLASS}>Resultado 7d</th>
              <th className={TH_CLASS}>Acumulado</th>
              <th className={TH_CLASS}>Taxa de fuga</th>
              <th className={TH_CLASS}>Anotação</th>
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
                <td className={TD_CLASS}>{formatInt(record.impressions)}</td>
                <td className={TD_CLASS}>{formatInt(record.clicks)}</td>
                <td className={TD_CLASS}>{formatInt(record.visitors)}</td>
                <td className={TD_CLASS}>{formatInt(record.checkouts)}</td>
                <td className={TD_CLASS}>{formatInt(record.conversions)}</td>
                <td className={TD_CLASS}>{formatPercent(record.ctr)}</td>
                <td className={TD_CLASS}>{formatCurrency(record.averageCpc)}</td>
                <td className={TD_CLASS}>{formatCurrency(record.maxCpcCpa)}</td>
                <td className={TD_CLASS}>{formatCurrency(record.dailyBudget)}</td>
                <td className={`${TD_CLASS} font-sans`}>
                  <StrategyBadge strategy={record.bidStrategy} />
                </td>
                <td className={TD_CLASS}>{formatCurrency(record.cost)}</td>
                <td className={TD_CLASS}>{formatCurrency(record.convertedValue)}</td>
                <td className={`${TD_CLASS} font-semibold ${resultClasses(record.result)}`}>
                  {record.result >= 0 ? '+' : ''}
                  {formatCurrency(record.result)}
                </td>
                <td className={`${TD_CLASS} font-semibold ${resultClasses(record.result7d)}`}>
                  {record.result7d >= 0 ? '+' : ''}
                  {formatCurrency(record.result7d)}
                </td>
                <td
                  className={`${TD_CLASS} font-semibold ${resultClasses(record.cumulativeResult)}`}
                >
                  {record.cumulativeResult >= 0 ? '+' : ''}
                  {formatCurrency(record.cumulativeResult)}
                </td>
                <td
                  className={`${TD_CLASS} font-semibold ${dropoffRateClasses(record.dropoffRate)}`}
                >
                  {formatPercent(record.dropoffRate)}
                </td>
                <td
                  className={`${TD_CLASS} max-w-[220px] truncate font-sans text-[var(--color-text-secondary)]`}
                  title={record.note}
                >
                  {record.note || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modals}
    </div>
  )
}
