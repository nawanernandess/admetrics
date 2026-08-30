import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAppStore, type MainTab } from '@/store/useAppStore'
import { RecordFormModal } from '@/components/records/RecordFormModal'
import { ProductSwitcher } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/types'

function DashboardIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2.5" y="2.5" width="6.25" height="6.25" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.25" y="2.5" width="6.25" height="6.25" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11.25" width="6.25" height="6.25" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.25" y="11.25" width="6.25" height="6.25" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function RecordsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.833 2.5h5l3.334 3.333v10.834a.833.833 0 0 1-.834.833H5.833A.833.833 0 0 1 5 16.667V3.333a.833.833 0 0 1 .833-.833Z"
      />
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M7.5 11.667h5M7.5 14.167h3.333" />
    </svg>
  )
}

const GEAR_TOOTH_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      {GEAR_TOOTH_ANGLES.map((angle) => (
        <line
          key={angle}
          x1="10"
          y1="4.3"
          x2="10"
          y2="2.5"
          stroke="currentColor"
          strokeWidth="2.2"
          transform={`rotate(${angle} 10 10)`}
        />
      ))}
      <circle cx="10" cy="10" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ProductsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m10 2.5 6.667 3.333v8.334L10 17.5l-6.667-3.333V5.833L10 2.5Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.333 5.833 10 9.167l6.667-3.334M10 9.167V17.5"
      />
    </svg>
  )
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m7.5 5 5 5-5 5"
      />
    </svg>
  )
}

const TABS: Array<{ id: MainTab; label: string; Icon: (props: { className?: string }) => JSX.Element }> = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'records', label: 'Registro', Icon: RecordsIcon },
  { id: 'settings', label: 'Configurações', Icon: SettingsIcon },
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

export function Header({ product }: { product: Product }) {
  const selectedTab = useAppStore((state) => state.selectedTab)
  const selectTab = useAppStore((state) => state.selectTab)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)

  return (
    <>
      <div className="flex h-16 items-stretch justify-between border-b border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] px-4 sm:h-11 sm:px-8">
        <div className="flex shrink-0 items-stretch gap-3 sm:gap-6 md:gap-10 xl:gap-16">
          <div className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-sm sm:flex">
            <ProductsIcon className="h-4 w-4 text-[var(--color-sidebar-text-inactive)]" />
            <span className="text-[var(--color-sidebar-text-inactive)]">Produtos</span>
            <ChevronRightIcon className="h-3.5 w-3.5 text-[var(--color-sidebar-text-inactive)]" />
            <span className="font-medium text-[var(--color-accent)]">{product.name}</span>
          </div>

          <nav className="hidden shrink-0 items-stretch gap-3 sm:flex sm:gap-5">
            {TABS.map(({ id, label, Icon }) => {
              const isActive = selectedTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectTab(id)}
                  className={`flex items-center gap-1.5 border-b-2 pb-px text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                      : 'border-transparent text-[var(--color-sidebar-text-inactive)] hover:text-[var(--color-sidebar-text-active)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => selectTab('settings')}
            className="flex items-center gap-1.5 rounded-md border border-[var(--color-sidebar-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-sidebar-text-inactive)] transition-colors duration-150 hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-active)] active:scale-[0.98]"
          >
            <EditIcon className="h-3.5 w-3.5 shrink-0" />
            Editar produto
          </button>
          <button
            type="button"
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold text-white transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]"
          >
            <PlusCircleIcon className="h-3.5 w-3.5 shrink-0" />
            Registrar dia
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center sm:hidden">
          <ProductSwitcher className="w-full" />
        </div>

        {isRecordModalOpen ? (
          <RecordFormModal product={product} onClose={() => setIsRecordModalOpen(false)} />
        ) : null}
      </div>

      <MobileTabBar selectedTab={selectedTab} onSelectTab={selectTab} />
    </>
  )
}

function MobileTabBar({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: MainTab
  onSelectTab: (tab: MainTab) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex justify-center sm:hidden">
      <div className="flex items-center gap-1 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-1.5 shadow-lg">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = selectedTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[11px] font-semibold ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function EllipsisIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  )
}

function EditIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.167 3.333H4.167a1.667 1.667 0 0 0-1.667 1.667v10.833a1.667 1.667 0 0 0 1.667 1.667H15a1.667 1.667 0 0 0 1.667-1.667v-5"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.375 2.125a1.591 1.591 0 0 1 2.25 2.25L9.583 12.5l-3 .833.834-3 8.958-8.208Z"
      />
    </svg>
  )
}

function PlusCircleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M10 6.667v6.666M6.667 10h6.666" />
    </svg>
  )
}

export function ProductActionsMenu({ product }: { product: Product }) {
  const selectTab = useAppStore((state) => state.selectTab)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMenuOpen])

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label="Mais ações"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-sidebar-text-inactive)] transition-colors duration-150 hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-active)]"
      >
        <EllipsisIcon />
      </button>

      {isMenuOpen ? (
        <div className="animate-fade-in absolute right-0 top-[calc(100%+8px)] z-20 w-48 overflow-hidden rounded-xl border border-[var(--color-sidebar-panel-border)] bg-[var(--color-sidebar-panel-bg)] shadow-2xl">
          <div className="p-1">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false)
                selectTab('settings')
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-[var(--color-sidebar-text-inactive)] transition-colors duration-150 hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-active)]"
            >
              <EditIcon className="h-4 w-4 shrink-0" />
              Editar produto
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false)
                setIsRecordModalOpen(true)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-[var(--color-accent)] transition-colors duration-150 hover:bg-[var(--color-sidebar-hover)]"
            >
              <PlusCircleIcon className="h-4 w-4 shrink-0" />
              Registrar dia
            </button>
          </div>
        </div>
      ) : null}

      {isRecordModalOpen ? (
        <RecordFormModal product={product} onClose={() => setIsRecordModalOpen(false)} />
      ) : null}
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[var(--color-accent)]">
      <rect x="3.333" y="4.167" width="13.334" height="12.5" rx="1.667" stroke="currentColor" strokeWidth="1.5" />
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M3.333 7.5h13.334M6.667 2.5v3.333M13.333 2.5v3.333" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[var(--color-accent)]">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.333 6.667a1.667 1.667 0 0 1 1.667-1.667h10a1.667 1.667 0 0 1 1.667 1.667v7.5a1.667 1.667 0 0 1-1.667 1.666H5a1.667 1.667 0 0 1-1.667-1.666v-7.5Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M13.333 10.833h2.5M3.333 6.667V5a1.667 1.667 0 0 1 1.667-1.667h7.5"
      />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[var(--color-accent)]">
      <circle cx="10" cy="10" r="6.667" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3.333" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="0.833" fill="currentColor" />
    </svg>
  )
}

function CoinsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[var(--color-accent)]">
      <ellipse cx="7.5" cy="5.833" rx="4.167" ry="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M3.333 5.833v3.334c0 1.38 1.866 2.5 4.167 2.5s4.167-1.12 4.167-2.5V5.833"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M3.333 9.167V12.5c0 1.38 1.866 2.5 4.167 2.5.821 0 1.587-.14 2.232-.385M11.667 8.512c1.895.246 3.333 1.216 3.333 2.321 0 1.38-1.866 2.5-4.167 2.5-.755 0-1.462-.12-2.07-.332M11.667 12.5v.833c0 1.157-1.556 2.135-3.652 2.437"
      />
    </svg>
  )
}

interface StatEntry {
  key: string
  icon: ReactNode
  label: string
  value: string
}

function buildStatItems(product: Product, totalDays: number): StatEntry[] {
  return [
    totalDays > 0
      ? {
          key: 'dias',
          icon: <CalendarIcon />,
          label: totalDays === 1 ? 'Dia' : 'Dias',
          value: String(totalDays),
        }
      : null,
    product.maxCpcCpa > 0
      ? {
          key: 'cpc',
          icon: <TargetIcon />,
          label: 'CPC/CPA máx',
          value: formatCurrency(product.maxCpcCpa),
        }
      : null,
    product.targetConversionValue > 0
      ? {
          key: 'conv',
          icon: <CoinsIcon />,
          label: 'Valor de conversão',
          value: formatCurrency(product.targetConversionValue),
        }
      : null,
    product.dailyBudget > 0
      ? {
          key: 'budget',
          icon: <WalletIcon />,
          label: 'Orçamento diário',
          value: formatCurrency(product.dailyBudget),
        }
      : null,
  ].filter((item): item is StatEntry => item !== null)
}

function StatItem({
  icon,
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  icon: ReactNode
  label: string
  value: string
  labelClassName: string
  valueClassName: string
}) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      {icon}
      <span className="flex items-baseline gap-1.5 font-tabular">
        <span className={labelClassName}>{label}</span>
        <span className={valueClassName}>{value}</span>
      </span>
    </div>
  )
}

function StatDivider({ className }: { className: string }) {
  return <span className={`w-px shrink-0 ${className}`} aria-hidden="true" />
}

function PresellLink({ page }: { page: string }) {
  return (
    <a
      href={page}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir página do produto em outra aba"
      className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-[var(--color-accent)] transition-opacity duration-150 hover:opacity-70"
    >
      Presell
      <ExternalLinkIcon />
    </a>
  )
}

export function ProductStatsBar({ product, totalDays }: { product: Product; totalDays: number }) {
  const items = buildStatItems(product, totalDays)
  if (items.length === 0 && !product.page) return null

  return (
    <div className="flex items-center gap-3 overflow-hidden">
      {product.page ? (
        <>
          <PresellLink page={product.page} />
          {items.length > 0 ? <StatDivider className="h-3.5 bg-[var(--color-sidebar-border)]" /> : null}
        </>
      ) : null}
      {items.map((item, index) => (
        <div key={item.key} className="flex items-center gap-3">
          {index > 0 ? <StatDivider className="h-3.5 bg-[var(--color-sidebar-border)]" /> : null}
          <StatItem
            icon={item.icon}
            label={item.label}
            value={item.value}
            labelClassName="text-[11px] text-[var(--color-sidebar-text-inactive)]"
            valueClassName="text-xs font-semibold text-[var(--color-sidebar-text-active)]"
          />
        </div>
      ))}
    </div>
  )
}

export function ProductStatsCard({ product, totalDays }: { product: Product; totalDays: number }) {
  const items = buildStatItems(product, totalDays)
  if (items.length === 0 && !product.page) return null

  return (
    <div className="mb-5 flex justify-center xl:hidden">
      <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm shadow-sm">
        {product.page ? (
          <>
            <PresellLink page={product.page} />
            {items.length > 0 ? <StatDivider className="h-4 bg-[var(--color-card-border)]" /> : null}
          </>
        ) : null}
        {items.map((item, index) => (
          <div key={item.key} className="flex items-center gap-3">
            {index > 0 ? <StatDivider className="h-4 bg-[var(--color-card-border)]" /> : null}
            <StatItem
              icon={item.icon}
              label={item.label}
              value={item.value}
              labelClassName="text-[var(--color-text-secondary)]"
              valueClassName="font-semibold text-[var(--color-text-primary)]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
