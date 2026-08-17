import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/common/Modal'
import { useRequestClose } from '@/components/common/modalContext'
import { Field } from '@/components/common/Field'
import {
  buttonDangerGhostClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
  sectionTitleClass,
} from '@/components/common/formStyles'
import { useAppStore } from '@/store/useAppStore'
import { STRATEGIES, type DailyRecord, type Product, type Strategy } from '@/types'
import { getTodayIso, parseDecimal } from '@/lib/format'

interface RecordFormValues {
  date: string
  impressions: string
  clicks: string
  visitors: string
  checkouts: string
  conversions: string
  cost: string
  convertedValue: string
  maxCpcCpa: string
  dailyBudget: string
  bidStrategy: Strategy
  topShare: string
  firstAboveShare: string
  impressionShare: string
  note: string
}

function toFormValue(value: number): string {
  return value === 0 ? '' : String(value).replace('.', ',')
}

function buildDefaultValues(product: Product, existingRecord?: DailyRecord): RecordFormValues {
  if (existingRecord) {
    return {
      date: existingRecord.date,
      impressions: toFormValue(existingRecord.impressions),
      clicks: toFormValue(existingRecord.clicks),
      visitors: toFormValue(existingRecord.visitors),
      checkouts: toFormValue(existingRecord.checkouts),
      conversions: toFormValue(existingRecord.conversions),
      cost: toFormValue(existingRecord.cost),
      convertedValue: toFormValue(existingRecord.convertedValue),
      maxCpcCpa: toFormValue(existingRecord.maxCpcCpa),
      dailyBudget: toFormValue(existingRecord.dailyBudget),
      bidStrategy: existingRecord.bidStrategy,
      topShare: toFormValue(existingRecord.topShare),
      firstAboveShare: toFormValue(existingRecord.firstAboveShare),
      impressionShare: toFormValue(existingRecord.impressionShare),
      note: existingRecord.note,
    }
  }
  return {
    date: getTodayIso(),
    impressions: '',
    clicks: '',
    visitors: '',
    checkouts: '',
    conversions: '',
    cost: '',
    convertedValue: '',
    maxCpcCpa: toFormValue(product.maxCpcCpa),
    dailyBudget: toFormValue(product.dailyBudget),
    bidStrategy: product.strategy,
    topShare: '',
    firstAboveShare: '',
    impressionShare: '',
    note: '',
  }
}

interface RecordFormProps {
  product: Product
  existingRecord?: DailyRecord
}

function RecordForm({ product, existingRecord }: RecordFormProps) {
  const createRecord = useAppStore((state) => state.createRecord)
  const updateRecord = useAppStore((state) => state.updateRecord)
  const deleteRecords = useAppStore((state) => state.deleteRecords)
  const requestClose = useRequestClose()
  const isEditing = Boolean(existingRecord)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormValues>({
    defaultValues: buildDefaultValues(product, existingRecord),
  })

  const conversions = watch('conversions')
  const skipNextAutoFill = useRef(true)

  // Identifica o valor convertido a partir do valor de conversão definido no
  // produto assim que "Conversões" muda — não roda na carga inicial pra não
  // sobrescrever o valor já salvo de um registro existente.
  useEffect(() => {
    if (skipNextAutoFill.current) {
      skipNextAutoFill.current = false
      return
    }
    if (product.targetConversionValue <= 0) return
    const count = parseDecimal(conversions)
    if (count > 0) {
      setValue('convertedValue', toFormValue(count * product.targetConversionValue))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversions])

  async function onSubmit(values: RecordFormValues) {
    const payload = {
      date: values.date,
      impressions: parseDecimal(values.impressions),
      clicks: parseDecimal(values.clicks),
      visitors: parseDecimal(values.visitors),
      checkouts: parseDecimal(values.checkouts),
      conversions: parseDecimal(values.conversions),
      cost: parseDecimal(values.cost),
      convertedValue: parseDecimal(values.convertedValue),
      maxCpcCpa: parseDecimal(values.maxCpcCpa),
      dailyBudget: parseDecimal(values.dailyBudget),
      bidStrategy: values.bidStrategy,
      topShare: parseDecimal(values.topShare),
      firstAboveShare: parseDecimal(values.firstAboveShare),
      impressionShare: parseDecimal(values.impressionShare),
      account: existingRecord?.account ?? product.account,
      page: existingRecord?.page ?? product.page,
      note: values.note.trim(),
    }

    if (existingRecord) {
      await updateRecord(existingRecord.id, product.id, payload)
    } else {
      await createRecord(product.id, payload)
    }
    requestClose()
  }

  async function onDelete() {
    if (!existingRecord) return
    if (!window.confirm('Excluir este registro? Esta ação não pode ser desfeita.')) {
      return
    }
    await deleteRecords([existingRecord.id], product.id)
    requestClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section>
        <h3 className={sectionTitleClass}>Informações gerais</h3>
        <Field label="Data" error={errors.date?.message}>
          <input
            type="date"
            className={inputClass}
            {...register('date', { required: 'Informe a data' })}
          />
        </Field>
      </section>

      <section>
        <h3 className={sectionTitleClass}>Tráfego</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Impressões">
            <input className={inputClass} inputMode="decimal" {...register('impressions')} />
          </Field>
          <Field label="Cliques">
            <input className={inputClass} inputMode="decimal" {...register('clicks')} />
          </Field>
          <Field label="Visitors">
            <input className={inputClass} inputMode="decimal" {...register('visitors')} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className={sectionTitleClass}>Funil</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Checkouts">
            <input className={inputClass} inputMode="decimal" {...register('checkouts')} />
          </Field>
          <Field label="Conversões">
            <input className={inputClass} inputMode="decimal" {...register('conversions')} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className={sectionTitleClass}>Financeiro</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Custo (R$)">
            <input className={inputClass} inputMode="decimal" {...register('cost')} />
          </Field>
          <Field label="Valor convertido (R$)">
            <input className={inputClass} inputMode="decimal" {...register('convertedValue')} />
          </Field>
          <Field label="CPC/CPA máx (R$)">
            <input className={inputClass} inputMode="decimal" {...register('maxCpcCpa')} />
          </Field>
          <Field label="Orçam. diário (R$)">
            <input className={inputClass} inputMode="decimal" {...register('dailyBudget')} />
          </Field>
          <Field label="Estratégia de lance" className="sm:col-span-2">
            <select className={inputClass} {...register('bidStrategy')}>
              {STRATEGIES.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section>
        <h3 className={sectionTitleClass}>Controle</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Parc. superior (%)">
            <input className={inputClass} inputMode="decimal" {...register('topShare')} />
          </Field>
          <Field label="Parc. 1º acima (%)">
            <input className={inputClass} inputMode="decimal" {...register('firstAboveShare')} />
          </Field>
          <Field label="Parc. impressões (%)">
            <input className={inputClass} inputMode="decimal" {...register('impressionShare')} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className={sectionTitleClass}>Anotação</h3>
        <Field label="Observação do dia">
          <textarea
            className={inputClass}
            rows={2}
            placeholder="Ex.: Aumentei R$20,10 CPA"
            {...register('note')}
          />
        </Field>
      </section>

      <div className="flex items-center justify-between border-t border-[var(--color-card-border)] pt-4">
        <div>
          {isEditing ? (
            <button type="button" onClick={onDelete} className={buttonDangerGhostClass}>
              Excluir
            </button>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={requestClose} className={buttonSecondaryClass}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className={buttonPrimaryClass}>
            Salvar
          </button>
        </div>
      </div>
    </form>
  )
}

interface RecordFormModalProps {
  product: Product
  existingRecord?: DailyRecord
  onClose: () => void
}

export function RecordFormModal({ product, existingRecord, onClose }: RecordFormModalProps) {
  return (
    <Modal
      title={existingRecord ? 'Editar registro diário' : 'Registrar dia'}
      subtitle={product.name}
      onClose={onClose}
      widthClassName="max-w-2xl"
    >
      <RecordForm product={product} existingRecord={existingRecord} />
    </Modal>
  )
}
