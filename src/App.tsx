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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
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

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <AuthenticatedApp />
}

export default App
