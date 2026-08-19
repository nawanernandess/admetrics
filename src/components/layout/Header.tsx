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

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.333 4.167H5a1.667 1.667 0 0 0-1.667 1.666v9.167A1.667 1.667 0 0 0 5 16.667h9.167A1.667 1.667 0 0 0 15.833 15v-3.333M11.667 3.333h5v5M16.25 3.75l-6.667 6.667"
      />
    </svg>
  )
}

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
          <p className="mt-1 flex flex-wrap items-center gap-1.5 font-tabular text-sm text-[var(--color-text-secondary)]">
            <span>
              {totalDays} {totalDays === 1 ? 'dia' : 'dias'}
            </span>
            <span aria-hidden="true">|</span>
            <span>Orçamento diário: {formatCurrency(product.dailyBudget)}</span>
            <span aria-hidden="true">|</span>
            <span>CPC/CPA máx: {formatCurrency(product.maxCpcCpa)}</span>
            <span aria-hidden="true">|</span>
            <span>Valor de conversão: {formatCurrency(product.targetConversionValue)}</span>
            {product.page ? (
              <>
                <span aria-hidden="true">|</span>
                <a
                  href={product.page}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir página do produto em outra aba"
                  className="inline-flex items-center gap-1 font-medium text-[var(--color-accent)] transition-opacity duration-150 hover:opacity-70"
                >
                  Presell
                  <ExternalLinkIcon />
                </a>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => selectTab('settings')}
            className="rounded-lg border border-[var(--color-card-border)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-150 hover:bg-[var(--color-hover-bg)] active:scale-[0.98]"
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
