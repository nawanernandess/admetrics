import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { TopBar } from '@/components/layout/TopBar'
import { Header, ProductActionsMenu, ProductStatsBar, ProductStatsCard } from '@/components/layout/Header'
import { DashboardTab } from '@/components/dashboard/DashboardTab'
import { RecordsTab } from '@/components/records/RecordsTab'
import { SettingsTab } from '@/components/settings/SettingsTab'
import { EmptyState } from '@/components/common/EmptyState'
import { NewProductModal } from '@/components/product/NewProductModal'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { buttonPrimaryClass } from '@/components/common/formStyles'

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
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        centerSlot={
          selectedProduct ? (
            <ProductStatsBar product={selectedProduct} totalDays={records.length} />
          ) : null
        }
        mobileActions={selectedProduct ? <ProductActionsMenu product={selectedProduct} /> : null}
      >
        {selectedProduct ? <Header product={selectedProduct} /> : null}
      </TopBar>
      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedProduct ? (
          <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
            <div key={selectedTab} className="px-8 pb-20 pt-6 sm:pb-6">
            <ProductStatsCard product={selectedProduct} totalDays={records.length} />
            {selectedTab === 'dashboard' ? (
              <DashboardTab product={selectedProduct} records={records} />
            ) : null}
            {selectedTab === 'records' ? (
              <RecordsTab product={selectedProduct} records={records} />
            ) : null}
            {selectedTab === 'settings' ? (
              <SettingsTab product={selectedProduct} totalProducts={products.length} />
            ) : null}
            </div>
          </main>
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
