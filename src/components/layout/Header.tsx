import { useState } from 'react'
import { useAppStore, type MainTab } from '@/store/useAppStore'
import { StrategyBadge } from '@/components/common/Badge'
import { RecordFormModal } from '@/components/records/RecordFormModal'
import { buttonPrimaryClass } from '@/components/common/formStyles'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/types'

const TABS: Array<{ id: MainTab; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'records', label: 'Registros' },
  { id: 'settings', label: 'Configurações' },
]

export function Header({ product, totalDays }: { product: Product; totalDays: number }) {
  const selectedTab = useAppStore((state) => state.selectedTab)
  const selectTab = useAppStore((state) => state.selectTab)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)

  return (
    <header className="border-b border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-8 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{product.name}</h1>
            <StrategyBadge strategy={product.strategy} />
          </div>
          <p className="mt-1 font-tabular text-sm text-[var(--color-text-secondary)]">
            {totalDays} {totalDays === 1 ? 'dia' : 'dias'} · {formatCurrency(product.dailyBudget)}
            /dia · CPC/CPA máx {formatCurrency(product.maxCpcCpa)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => selectTab('settings')}
            className="rounded-lg border border-[var(--color-card-border)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-150 hover:bg-slate-50 active:scale-[0.98]"
          >
            Editar produto
          </button>
          <button
            type="button"
            onClick={() => setIsRecordModalOpen(true)}
            className={buttonPrimaryClass}
          >
            + Registrar dia
          </button>
        </div>
      </div>

      <div className="mt-5 flex gap-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors duration-150 ${
              selectedTab === tab.id
                ? 'border-[var(--color-accent)] text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isRecordModalOpen ? (
        <RecordFormModal product={product} onClose={() => setIsRecordModalOpen(false)} />
      ) : null}
    </header>
  )
}
