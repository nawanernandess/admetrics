import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Modal } from '@/components/common/Modal'
import { useRequestClose } from '@/components/common/modalContext'
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  labelClass,
} from '@/components/common/formStyles'
import { useAppStore } from '@/store/useAppStore'
import type { DailyRecord, DailyRecordInput, Product } from '@/types'
import { formatCurrency, formatDate, formatInt, formatPercentRaw } from '@/lib/format'
import {
  CURRENCY_FIELDS,
  FIELD_LABELS,
  INT_FIELDS,
  PERCENT_RAW_FIELDS,
  buildRecordsFromRows,
  detectColumnMapping,
  readSpreadsheetFile,
  splitByExistingDates,
  validateMappingAgainstData,
  type ColumnMapping,
  type ImportableField,
  type ValidatedMapping,
} from '@/lib/spreadsheetImport'

const FIELD_ORDER: ImportableField[] = [
  'date',
  'impressions',
  'clicks',
  'visitors',
  'checkouts',
  'conversions',
  'cost',
  'convertedValue',
  'maxCpcCpa',
  'dailyBudget',
  'bidStrategy',
  'topShare',
  'firstAboveShare',
  'impressionShare',
  'account',
  'page',
  'note',
]

const NONE_VALUE = '__none__'

function formatFieldValue(field: ImportableField, record: DailyRecordInput): string {
  const value = record[field]
  if (field === 'date') return formatDate(value as string)
  if (INT_FIELDS.has(field)) return formatInt(value as number)
  if (CURRENCY_FIELDS.has(field)) return formatCurrency(value as number)
  if (PERCENT_RAW_FIELDS.has(field)) return formatPercentRaw(value as number)
  return (value as string) || '—'
}

function ImportSpreadsheetContent({
  product,
  existingRecords,
}: {
  product: Product
  existingRecords: DailyRecord[]
}) {
  const createRecord = useAppStore((state) => state.createRecord)
  const requestClose = useRequestClose()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fileName, setFileName] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [dataRows, setDataRows] = useState<unknown[][]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [referenceYear, setReferenceYear] = useState(new Date().getFullYear())
  const [parseError, setParseError] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importedCount, setImportedCount] = useState<number | null>(null)
  const [showMappingEditor, setShowMappingEditor] = useState(false)
  const [rejected, setRejected] = useState<ValidatedMapping['rejected']>([])

  async function handleFile(file: File) {
    setParseError(null)
    setImportedCount(null)
    try {
      const parsed = await readSpreadsheetFile(file)
      if (parsed.headers.length === 0) {
        setParseError('Não encontrei uma linha de cabeçalho nesse arquivo.')
        return
      }
      const { mapping: candidate } = detectColumnMapping(parsed.headers)
      const { confirmed, rejected: rejectedFields } = validateMappingAgainstData(
        candidate,
        parsed.dataRows,
        referenceYear,
      )
      setFileName(file.name)
      setHeaders(parsed.headers)
      setDataRows(parsed.dataRows)
      setMapping(confirmed)
      setRejected(rejectedFields)
      setShowMappingEditor(Object.keys(confirmed).length === 0)
    } catch {
      setParseError(
        'Não consegui ler esse arquivo. Confira se é uma planilha válida (.xlsx, .xls ou .csv).',
      )
    }
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) void handleFile(file)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDraggingOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  function resetFile() {
    setHeaders([])
    setDataRows([])
    setMapping({})
    setRejected([])
    setFileName(null)
  }

  function setFieldMapping(field: ImportableField, columnIndexValue: string) {
    setMapping((current) => {
      const next = { ...current }
      if (columnIndexValue === NONE_VALUE) {
        delete next[field]
      } else {
        next[field] = Number(columnIndexValue)
      }
      return next
    })
  }

  const importResult = useMemo(() => {
    if (headers.length === 0) return null
    return buildRecordsFromRows(dataRows, mapping, {
      referenceYear,
      defaultStrategy: product.strategy,
    })
  }, [dataRows, mapping, referenceYear, headers.length, product.strategy])

  const existingDates = useMemo(
    () => new Set(existingRecords.map((record) => record.date)),
    [existingRecords],
  )

  const { newRows, duplicateRows } = useMemo(
    () =>
      importResult
        ? splitByExistingDates(importResult.rows, existingDates)
        : { newRows: [], duplicateRows: [] },
    [importResult, existingDates],
  )

  const mappedFields = FIELD_ORDER.filter((field) => mapping[field] != null)
  const rejectedFieldSet = new Set(rejected.map((r) => r.field))
  const unmappedFields = FIELD_ORDER.filter(
    (field) => mapping[field] == null && !rejectedFieldSet.has(field),
  )
  const totalWarnings = importResult
    ? importResult.rows.reduce((sum, row) => sum + row.warnings.length, 0)
    : 0

  async function handleImport() {
    if (newRows.length === 0) return
    setIsImporting(true)
    for (const row of newRows) {
      await createRecord(product.id, row.record)
    }
    setIsImporting(false)
    setImportedCount(newRows.length)
  }

  if (importedCount != null) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-[var(--color-text-primary)]">
          <strong>{importedCount}</strong>{' '}
          {importedCount === 1 ? 'registro importado' : 'registros importados'} para{' '}
          <strong>{product.name}</strong>.
        </p>
        <button type="button" onClick={requestClose} className={buttonPrimaryClass}>
          Concluir
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {headers.length === 0 ? (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDraggingOver(true)
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-150 ${
            isDraggingOver
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]/30'
              : 'border-[var(--color-card-border)] hover:bg-slate-50'
          }`}
        >
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Arraste a planilha aqui ou clique para escolher o arquivo
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Aceita .xlsx, .xls, .csv ou .ods — as colunas são identificadas automaticamente
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.ods"
            className="hidden"
            onChange={onFileInputChange}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="truncate font-medium text-[var(--color-text-primary)]">
              📄 {fileName}
            </span>
            <button
              type="button"
              onClick={resetFile}
              className="text-xs font-medium text-[var(--color-accent)] hover:underline"
            >
              Trocar arquivo
            </button>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)]">
            {mappedFields.length} de {FIELD_ORDER.length} colunas confirmadas (nome do cabeçalho +
            valores da coluna batem com o esperado)
            {unmappedFields.length > 0 ? (
              <>
                {' '}
                — não encontramos: {unmappedFields.map((field) => FIELD_LABELS[field]).join(', ')}
              </>
            ) : null}
            . Cabeçalho do arquivo: {headers.filter(Boolean).join(', ') || '(vazio)'}
          </p>

          {rejected.length > 0 ? (
            <p className="rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-xs text-[var(--color-warning-text)]">
              {rejected.length === 1 ? 'Uma coluna' : `${rejected.length} colunas`} tinha
              {rejected.length === 1 ? '' : 'm'} nome parecido com um campo conhecido, mas os
              valores não confirmaram — não foi importada automaticamente para evitar erro:{' '}
              {rejected
                .map(
                  (r) =>
                    `"${headers[r.columnIndex]}" parecia ${FIELD_LABELS[r.field]}, mas ${r.reason}`,
                )
                .join('; ')}
              . Ajuste manualmente abaixo se quiser forçar essa coluna.
            </p>
          ) : null}

          {mappedFields.length === 0 ? (
            <p className="rounded-lg bg-[var(--color-warning-bg)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
              Não identifiquei nenhuma coluna conhecida automaticamente com confiança. Confira o
              cabeçalho acima ou ajuste o mapeamento manualmente abaixo.
            </p>
          ) : (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  Pré-visualização
                  {newRows.length > 0
                    ? ` (${newRows.length} registro${newRows.length === 1 ? '' : 's'})`
                    : ''}
                </span>
              </div>
              <div className="max-h-[280px] overflow-auto rounded-lg border border-[var(--color-card-border)]">
                {newRows.length === 0 ? (
                  <p className="p-3 text-sm text-[var(--color-text-secondary)]">
                    {duplicateRows.length > 0
                      ? 'Todos os registros dessa planilha já foram importados antes — nada novo para adicionar.'
                      : 'Nenhuma linha de dados reconhecida nesse arquivo.'}
                  </p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-100">
                      <tr>
                        {mappedFields.map((field) => (
                          <th key={field} className="whitespace-nowrap px-2 py-1.5 text-left">
                            {FIELD_LABELS[field]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-card-border)]">
                      {newRows.map((row, index) => (
                        <tr key={index}>
                          {mappedFields.map((field) => (
                            <td key={field} className="whitespace-nowrap px-2 py-1.5 font-tabular">
                              {formatFieldValue(field, row.record)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {importResult && (importResult.trimmedBefore > 0 || importResult.trimmedAfter > 0) ? (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {importResult.trimmedBefore > 0
                ? `${importResult.trimmedBefore} linha${importResult.trimmedBefore === 1 ? '' : 's'} sem atividade no início`
                : ''}
              {importResult.trimmedBefore > 0 && importResult.trimmedAfter > 0 ? ' e ' : ''}
              {importResult.trimmedAfter > 0
                ? `${importResult.trimmedAfter} linha${importResult.trimmedAfter === 1 ? '' : 's'} sem atividade no final`
                : ''}{' '}
              do arquivo foram ignoradas automaticamente (tudo zerado, sem dado real).
            </p>
          ) : null}
          {duplicateRows.length > 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {duplicateRows.length}{' '}
              {duplicateRows.length === 1
                ? 'registro já havia sido importado'
                : 'registros já haviam sido importados'}{' '}
              (já existe um registro para essa data em &quot;{product.name}&quot;) — ignorado
              {duplicateRows.length === 1 ? '' : 's'} automaticamente.
            </p>
          ) : null}
          {importResult && importResult.skipped.length > 0 ? (
            <p className="text-xs text-[var(--color-warning-text)]">
              {importResult.skipped.length}{' '}
              {importResult.skipped.length === 1 ? 'linha ignorada' : 'linhas ignoradas'} (
              {importResult.skipped
                .slice(0, 3)
                .map((s) => `linha ${s.rowNumber}: ${s.reason}`)
                .join('; ')}
              {importResult.skipped.length > 3 ? '…' : ''})
            </p>
          ) : null}
          {totalWarnings > 0 ? (
            <p className="text-xs text-[var(--color-warning-text)]">
              {totalWarnings} aviso(s) — confira estratégias de lance não reconhecidas.
            </p>
          ) : null}

          <div>
            <button
              type="button"
              onClick={() => setShowMappingEditor((current) => !current)}
              className="text-xs font-medium text-[var(--color-accent)] hover:underline"
            >
              {showMappingEditor
                ? '▾ Ocultar mapeamento manual'
                : '▸ Ajustar mapeamento manualmente'}
            </button>

            {showMappingEditor ? (
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="max-h-[260px] space-y-2 overflow-y-auto rounded-lg border border-[var(--color-card-border)] p-3">
                  {FIELD_ORDER.map((field) => (
                    <div key={field} className="flex items-center gap-2">
                      <span className="w-32 shrink-0 text-xs text-[var(--color-text-secondary)]">
                        {FIELD_LABELS[field]}
                      </span>
                      <select
                        className={`${inputClass} py-1.5 text-xs`}
                        value={mapping[field] ?? NONE_VALUE}
                        onChange={(event) => setFieldMapping(field, event.target.value)}
                      >
                        <option value={NONE_VALUE}>Não importar</option>
                        {headers.map((header, index) => (
                          <option key={index} value={index}>
                            {header || `Coluna ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <label className="block">
                  <span className={labelClass}>Ano de referência (se a data não tiver ano)</span>
                  <input
                    type="number"
                    className={inputClass}
                    value={referenceYear}
                    onChange={(event) =>
                      setReferenceYear(Number(event.target.value) || referenceYear)
                    }
                  />
                </label>
              </div>
            ) : null}
          </div>
        </>
      )}

      {parseError ? (
        <p className="text-sm text-[var(--color-negative-text)]">{parseError}</p>
      ) : null}

      <div className="flex items-center justify-end gap-2 border-t border-[var(--color-card-border)] pt-4">
        <button type="button" onClick={requestClose} className={buttonSecondaryClass}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={newRows.length === 0 || isImporting}
          className={buttonPrimaryClass}
        >
          {isImporting
            ? 'Importando…'
            : `Importar ${newRows.length} registro${newRows.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  )
}

export function ImportSpreadsheetModal({
  product,
  existingRecords,
  onClose,
}: {
  product: Product
  existingRecords: DailyRecord[]
  onClose: () => void
}) {
  return (
    <Modal
      title="Importar planilha"
      subtitle={`Cria registros diários para "${product.name}" a partir de um arquivo`}
      onClose={onClose}
      widthClassName="max-w-4xl"
    >
      <ImportSpreadsheetContent product={product} existingRecords={existingRecords} />
    </Modal>
  )
}
