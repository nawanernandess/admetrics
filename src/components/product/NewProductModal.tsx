import { useForm } from 'react-hook-form'
import { Modal } from '@/components/common/Modal'
import { useRequestClose } from '@/components/common/modalContext'
import { Field } from '@/components/common/Field'
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputClass,
} from '@/components/common/formStyles'
import { useAppStore } from '@/store/useAppStore'
import { STRATEGIES, type Strategy } from '@/types'
import { parseDecimal } from '@/lib/format'

interface NewProductFormValues {
  name: string
  dailyBudget: string
  strategy: Strategy
}

function NewProductForm() {
  const createProduct = useAppStore((state) => state.createProduct)
  const requestClose = useRequestClose()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewProductFormValues>({
    defaultValues: { name: '', dailyBudget: '', strategy: 'Portfólio' },
  })

  async function onSubmit(values: NewProductFormValues) {
    await createProduct({
      name: values.name.trim(),
      strategy: values.strategy,
      dailyBudget: parseDecimal(values.dailyBudget),
      maxCpcCpa: 0,
      targetConversionValue: 0,
      account: '',
      page: '',
    })
    requestClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Nome do produto" error={errors.name?.message}>
        <input
          className={inputClass}
          placeholder="Ex.: Hume Band"
          autoFocus
          {...register('name', { required: 'Informe o nome do produto' })}
        />
      </Field>

      <Field label="Orçamento diário (R$)" error={errors.dailyBudget?.message}>
        <input
          className={inputClass}
          inputMode="decimal"
          placeholder="0,00"
          {...register('dailyBudget')}
        />
      </Field>

      <Field label="Estratégia de lance">
        <select className={inputClass} {...register('strategy')}>
          {STRATEGIES.map((strategy) => (
            <option key={strategy} value={strategy}>
              {strategy}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={requestClose} className={buttonSecondaryClass}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className={buttonPrimaryClass}>
          Criar produto
        </button>
      </div>
    </form>
  )
}

export function NewProductModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Novo produto" onClose={onClose}>
      <NewProductForm />
    </Modal>
  )
}
