import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'
import { NewProductModal } from '@/components/product/NewProductModal'
import { BrandMark } from '@/components/common/BrandMark'
import { TEST_USER_EMAIL } from '@/lib/testUser'
import type { Strategy } from '@/types'

const DOT_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-red-500',
  'bg-indigo-500',
]

const COMPACT_BADGE_CLASSES: Record<Strategy, string> = {
  Portfólio: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  CPA: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  ROAS: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  'Maximizar cliques': 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'Maximizar conversões': 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  'CPC manual': 'bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
}

function CompactBadge({ strategy }: { strategy: Strategy }) {
  return (
    <span
      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${COMPACT_BADGE_CLASSES[strategy]}`}
    >
      {strategy}
    </span>
  )
}

function dotColorForProduct(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return DOT_COLORS[hash % DOT_COLORS.length]
}

function initialsFromEmail(email: string) {
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.slice(0, 2).toUpperCase() || '?'
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 7.5 5 5 5-5"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4 shrink-0 text-[var(--color-sidebar-text-inactive)]"
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="m17 17-3.5-3.5" />
    </svg>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`h-4 w-4 shrink-0 ${className}`}>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 10 4 4 8-8"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M10 2.5v1.667M10 15.833V17.5M17.5 10h-1.667M4.167 10H2.5M15.303 4.697l-1.179 1.179M5.876 14.124l-1.179 1.179M15.303 15.303l-1.179-1.179M5.876 5.876 4.697 4.697"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0">
      <path
        fill="currentColor"
        d="M17.5 11.917A7.5 7.5 0 0 1 8.083 2.5a7.083 7.083 0 1 0 9.417 9.417Z"
      />
    </svg>
  )
}

function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="6.667" r="3.333" stroke="currentColor" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M3.333 17.083c0-3.226 2.985-5.833 6.667-5.833s6.667 2.607 6.667 5.833"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 17.5H4.167a1.667 1.667 0 0 1-1.667-1.667V4.167A1.667 1.667 0 0 1 4.167 2.5H7.5M13.333 14.167 17.5 10l-4.167-4.167M17.5 10H7.5"
      />
    </svg>
  )
}

export function ProductSwitcher({ className = '' }: { className?: string }) {
  const products = useAppStore((state) => state.products)
  const selectedProductId = useAppStore((state) => state.selectedProductId)
  const selectProduct = useAppStore((state) => state.selectProduct)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const [query, setQuery] = useState('')
  const switcherRef = useRef<HTMLDivElement>(null)

  const selectedProduct = products.find((product) => product.id === selectedProductId)

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((product) => product.name.toLowerCase().includes(q))
  }, [products, query])

  useEffect(() => {
    if (!isSwitcherOpen) return
    function onPointerDown(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsSwitcherOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isSwitcherOpen])

  useEffect(() => {
    if (!isSwitcherOpen) setQuery('')
  }, [isSwitcherOpen])

  return (
    <div className={`relative min-w-0 ${className}`} ref={switcherRef}>
      <button
        type="button"
        onClick={() => setIsSwitcherOpen((open) => !open)}
        className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg bg-[var(--color-sidebar-hover)] px-4 py-2 text-sm transition-colors duration-150 hover:bg-[var(--color-sidebar-selected-bg)] sm:justify-start sm:py-1.5 sm:pl-3 sm:pr-2"
      >
        {selectedProduct ? (
          <>
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${dotColorForProduct(selectedProduct.id)}`}
                aria-hidden="true"
              />
              <span className="min-w-0 truncate font-medium text-[var(--color-sidebar-text-active)] sm:max-w-[10rem] lg:max-w-[16rem]">
                {selectedProduct.name}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <CompactBadge strategy={selectedProduct.strategy} />
              <ChevronDownIcon
                className={`h-3.5 w-3.5 text-[var(--color-sidebar-text-inactive)] transition-transform duration-150 ${
                  isSwitcherOpen ? 'rotate-180' : ''
                }`}
              />
            </span>
          </>
        ) : (
          <>
            <span className="text-[var(--color-sidebar-text-inactive)]">Selecionar produto</span>
            <ChevronDownIcon
              className={`h-3.5 w-3.5 text-[var(--color-sidebar-text-inactive)] transition-transform duration-150 ${
                isSwitcherOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {isSwitcherOpen ? (
        <div className="animate-fade-in absolute left-0 right-0 top-[calc(100%+8px)] z-20 w-auto overflow-hidden rounded-xl border border-[var(--color-sidebar-panel-border)] bg-[var(--color-sidebar-panel-bg)] shadow-2xl sm:right-auto sm:w-64">
          <div className="border-b border-[var(--color-sidebar-panel-border)] p-1.5">
            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--color-sidebar-hover)] px-2 py-1.5">
              <SearchIcon />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar produto..."
                className="w-full bg-transparent text-sm text-[var(--color-sidebar-text-active)] placeholder:text-[var(--color-sidebar-text-inactive)] focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {filteredProducts.length === 0 ? (
              <p className="px-2 py-2.5 text-center text-sm text-[var(--color-sidebar-text-inactive)]">
                Nenhum produto encontrado
              </p>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = product.id === selectedProductId
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      selectProduct(product.id)
                      setIsSwitcherOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[var(--color-sidebar-selected-bg)]'
                        : 'hover:bg-[var(--color-sidebar-hover)]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColorForProduct(product.id)}`}
                      aria-hidden="true"
                    />
                    <span
                      className={`flex-1 truncate font-medium ${
                        isSelected
                          ? 'text-[var(--color-sidebar-text-active)]'
                          : 'text-[var(--color-sidebar-text-inactive)]'
                      }`}
                    >
                      {product.name}
                    </span>
                    <CompactBadge strategy={product.strategy} />
                    {isSelected ? <CheckIcon className="text-[var(--color-accent)]" /> : null}
                  </button>
                )
              })
            )}
          </div>

          <div className="border-t border-[var(--color-sidebar-panel-border)] p-1">
            <button
              type="button"
              onClick={() => {
                setIsSwitcherOpen(false)
                setIsModalOpen(true)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-[var(--color-accent)] transition-colors duration-150 hover:bg-[var(--color-sidebar-hover)]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs">
                +
              </span>
              Adicionar novo produto
            </button>
          </div>
        </div>
      ) : null}

      {isModalOpen ? <NewProductModal onClose={() => setIsModalOpen(false)} /> : null}
    </div>
  )
}

export function TopBar({
  centerSlot,
  mobileActions,
  children,
}: {
  centerSlot?: ReactNode
  mobileActions?: ReactNode
  children?: ReactNode
}) {
  const logout = useAuthStore((state) => state.logout)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const isDark = theme === 'dark'
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement>(null)

  const userInitials = initialsFromEmail(TEST_USER_EMAIL)

  useEffect(() => {
    if (!isAvatarMenuOpen) return
    function onPointerDown(event: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsAvatarMenuOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isAvatarMenuOpen])

  return (
    <header className="flex shrink-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] px-4">
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
            <BrandMark className="h-4 w-4" />
          </span>
          <span className="text-base font-bold text-[var(--color-sidebar-text-active)]">AdMetrics</span>
        </div>

        <span
          className="hidden h-6 w-px shrink-0 bg-[var(--color-sidebar-border)] sm:block"
          aria-hidden="true"
        />

        <div className="hidden sm:block sm:shrink">
          <ProductSwitcher />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden">
          <div className="hidden xl:flex">{centerSlot}</div>
        </div>

        <div className="shrink-0 sm:hidden">{mobileActions}</div>

        <div className="relative shrink-0" ref={avatarMenuRef}>
          <button
            type="button"
            onClick={() => setIsAvatarMenuOpen((open) => !open)}
            aria-label="Conta"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-white transition-opacity duration-150 hover:opacity-90"
          >
            {userInitials}
          </button>

          {isAvatarMenuOpen ? (
            <div className="animate-fade-in absolute right-0 top-[calc(100%+8px)] z-20 w-56 overflow-hidden rounded-xl border border-[var(--color-sidebar-panel-border)] bg-[var(--color-sidebar-panel-bg)] shadow-2xl">
              <div className="flex items-center gap-2 border-b border-[var(--color-sidebar-panel-border)] px-3 py-2.5">
                <UserIcon className="h-4 w-4 shrink-0 text-[var(--color-sidebar-text-inactive)]" />
                <p className="truncate text-sm font-medium text-[var(--color-sidebar-text-active)]">
                  {TEST_USER_EMAIL}
                </p>
              </div>

              <div className="border-b border-[var(--color-sidebar-panel-border)] p-1">
                <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--color-sidebar-text-inactive)]">
                  <span className="flex items-center gap-2">
                    {isDark ? <MoonIcon /> : <SunIcon />}
                    {isDark ? 'Modo escuro' : 'Modo claro'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDark}
                    aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    onClick={toggleTheme}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ${
                      isDark ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-sidebar-border)]'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-150 ${
                        isDark ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarMenuOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-red-400 transition-colors duration-150 hover:bg-[var(--color-sidebar-hover)]"
                >
                  <LogoutIcon />
                  Sair
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {children}
    </header>
  )
}
