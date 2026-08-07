import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { NewProductModal } from '@/components/product/NewProductModal'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const products = useAppStore((state) => state.products)
  const recordsByProduct = useAppStore((state) => state.recordsByProduct)
  const selectedProductId = useAppStore((state) => state.selectedProductId)
  const selectProduct = useAppStore((state) => state.selectProduct)
  const logout = useAuthStore((state) => state.logout)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-shrink-0 flex-col bg-[var(--color-sidebar-bg)] transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-bold text-white">
            A
          </span>
          <span className="text-base font-bold text-white">AdMetrics</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {products.map((product) => {
            const isSelected = product.id === selectedProductId
            const totalRecords = recordsByProduct[product.id]?.length ?? 0
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  selectProduct(product.id)
                  onClose()
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                  isSelected
                    ? 'bg-[var(--color-sidebar-selected-bg)] text-[var(--color-sidebar-text-active)]'
                    : 'text-[var(--color-sidebar-text-inactive)] hover:bg-[var(--color-sidebar-selected-bg)]/60'
                }`}
              >
                <span className="truncate font-medium">{product.name}</span>
                <span className="ml-2 shrink-0 rounded-full bg-black/20 px-2 py-0.5 text-xs font-tabular">
                  {totalRecords}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="space-y-1.5 px-3 pb-5 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true)
              onClose()
            }}
            className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/5 active:scale-[0.98]"
          >
            + Novo produto
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-sidebar-text-inactive)] transition-colors duration-150 hover:bg-white/5 hover:text-white"
          >
            Sair
          </button>
        </div>

        {isModalOpen ? <NewProductModal onClose={() => setIsModalOpen(false)} /> : null}
      </aside>
    </>
  )
}
