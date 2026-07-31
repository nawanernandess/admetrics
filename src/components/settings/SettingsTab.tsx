import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAppStore } from '@/store/useAppStore'
import { STRATEGIES, type Product, type Strategy } from '@/types'
import { buttonDangerClass, inputClass, labelClass } from '@/components/common/formStyles'
import { parseDecimal } from '@/lib/format'

interface SettingsFormValues {
  name: string
  strategy: Strategy
  dailyBudget: string
  maxCpcCpa: string
  targetConversionValue: string
  account: string
  page: string
}

function toFormValues(product: Product): SettingsFormValues {
  return {
    name: product.name,
    strategy: product.strategy,
    dailyBudget: product.dailyBudget === 0 ? '' : String(product.dailyBudget).replace('.', ','),
    maxCpcCpa: product.maxCpcCpa === 0 ? '' : String(product.maxCpcCpa).replace('.', ','),
    targetConversionValue:
      product.targetConversionValue === 0
        ? ''
        : String(product.targetConversionValue).replace('.', ','),
    account: product.account,
    page: product.page,
  }
}

const AUTOSAVE_DELAY_MS = 700

export function SettingsTab({
  product,
  totalProducts,
}: {
  product: Product
  totalProducts: number
}) {
  const updateProduct = useAppStore((state) => state.updateProduct)
  const deleteProduct = useAppStore((state) => state.deleteProduct)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { register, watch, reset } = useForm<SettingsFormValues>({
    defaultValues: toFormValues(product),
  })

  useEffect(() => {
    reset(toFormValues(product))
    // Reidratar apenas ao trocar de produto — incluir `product` faria o
    // form resetar a cada autosave, perdendo o foco/digitação em curso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, reset])

  useEffect(() => {
    const subscription = watch((values) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setStatus('saving')
      timeoutRef.current = setTimeout(async () => {
        await updateProduct(product.id, {
          name: values.name?.trim() || product.name,
          strategy: values.strategy ?? product.strategy,
          dailyBudget: parseDecimal(values.dailyBudget ?? ''),
          maxCpcCpa: parseDecimal(values.maxCpcCpa ?? ''),
          targetConversionValue: parseDecimal(values.targetConversionValue ?? ''),
          account: values.account?.trim() ?? '',
          page: values.page?.trim() ?? '',
        })
        setStatus('saved')
      }, AUTOSAVE_DELAY_MS)
    })
    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  async function onDeleteProduct() {
    if (totalProducts <= 1) return
    if (
      !window.confirm(
        `Excluir "${product.name}" e todos os seus registros? Esta ação não pode ser desfeita.`,
      )
    ) {
      return
    }
    await deleteProduct(product.id)
  }

  return (
    <div className="animate-fade-in-up max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Valores globais do produto
        </h2>
        <span className="text-xs text-[var(--color-text-secondary)] transition-opacity duration-150">
          {status === 'saving' ? 'Salvando…' : status === 'saved' ? 'Salvo' : ''}
        </span>
      </div>

      <div className="mt-4 space-y-4 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-5">
        <div>
          <label className={labelClass}>Nome do produto</label>
          <input className={inputClass} {...register('name')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Estratégia de lance</label>
            <select className={inputClass} {...register('strategy')}>
              {STRATEGIES.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Orçamento diário (R$)</label>
            <input className={inputClass} inputMode="decimal" {...register('dailyBudget')} />
          </div>
          <div>
            <label className={labelClass}>CPC/CPA máx (R$)</label>
            <input className={inputClass} inputMode="decimal" {...register('maxCpcCpa')} />
          </div>
          <div>
            <label className={labelClass}>Valor de conversão definido (R$)</label>
            <input
              className={inputClass}
              inputMode="decimal"
              {...register('targetConversionValue')}
            />
          </div>
          <div>
            <label className={labelClass}>Conta de anúncios</label>
            <input className={inputClass} {...register('account')} />
          </div>
          <div>
            <label className={labelClass}>Página / URL de destino</label>
            <input className={inputClass} {...register('page')} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-[var(--color-negative-base)]/30 bg-[var(--color-negative-bg)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-negative-text)]">Excluir produto</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Remove permanentemente o produto e todos os seus registros diários.
          {totalProducts <= 1 ? ' Não é possível excluir o último produto.' : ''}
        </p>
        <button
          type="button"
          onClick={onDeleteProduct}
          disabled={totalProducts <= 1}
          className={`mt-3 ${buttonDangerClass}`}
        >
          Excluir produto
        </button>
      </div>
    </div>
  )
}
