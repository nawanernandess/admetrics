import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { DashboardTab } from '@/components/dashboard/DashboardTab'
import { RecordsTab } from '@/components/records/RecordsTab'
import { SettingsTab } from '@/components/settings/SettingsTab'
import { EmptyState } from '@/components/common/EmptyState'
import { NewProductModal } from '@/components/product/NewProductModal'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { buttonPrimaryClass } from '@/components/common/formStyles'
import { BrandMark } from '@/components/common/BrandMark'
import { ThemeToggle } from '@/components/common/ThemeToggle'

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M3 5.833h14M3 10h14M3 14.167h14"
      />
    </svg>
  )
}

function EmptyWorkspace() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--color-bg)] p-8">
      <div className="w-full max-w-md">
        <EmptyState
          title="Comece cadastrando seu primeiro produto"
          description="Cadastre um produto, registre os dias e acompanhe os indicadores automaticamente."
          action={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className={buttonPrimaryClass}
            >
              + Novo produto
            </button>
          }
        />
      </div>
      {isModalOpen ? <NewProductModal onClose={() => setIsModalOpen(false)} /> : null}
    </div>
  )
}

function AuthenticatedApp() {
  const loading = useAppStore((state) => state.loading)
  const products = useAppStore((state) => state.products)
  const selectedProductId = useAppStore((state) => state.selectedProductId)
  const recordsByProduct = useAppStore((state) => state.recordsByProduct)
  const selectedTab = useAppStore((state) => state.selectedTab)
  const loadData = useAppStore((state) => state.loadData)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-[var(--color-text-secondary)]">
        Carregando…
      </div>
    )
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const records = selectedProduct ? (recordsByProduct[selectedProduct.id] ?? []) : []

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu"
            className="rounded-md p-1.5 text-[var(--color-text-primary)] transition-colors duration-150 hover:bg-[var(--color-hover-bg)]"
          >
            <MenuIcon />
          </button>
          <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-text-primary)]">
            <BrandMark className="h-4 w-4 text-[var(--color-accent)]" />
            AdMetrics
          </span>
          <ThemeToggle className="ml-auto text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-bg)]" />
        </div>
        {selectedProduct ? (
          <>
            <Header product={selectedProduct} totalDays={records.length} />
            <main
              key={selectedTab}
              className="animate-fade-in flex-1 overflow-y-auto bg-[var(--color-bg)] px-8 py-6"
            >
              {selectedTab === 'dashboard' ? (
                <DashboardTab product={selectedProduct} records={records} />
              ) : null}
              {selectedTab === 'records' ? (
                <RecordsTab product={selectedProduct} records={records} />
              ) : null}
              {selectedTab === 'settings' ? (
                <SettingsTab product={selectedProduct} totalProducts={products.length} />
              ) : null}
            </main>
          </>
        ) : (
          <EmptyWorkspace />
        )}
      </div>
    </div>
  )
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isRestoring = useAuthStore((state) => state.isRestoring)
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  if (isRestoring) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-[var(--color-text-secondary)]">
        Carregando…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <AuthenticatedApp />
}

export default App
