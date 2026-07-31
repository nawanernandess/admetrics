import { create } from 'zustand'
import { productRepository, recordRepository } from '@/lib/repo'
import type { DailyRecord, DailyRecordInput, Product, ProductInput } from '@/types'

export type MainTab = 'dashboard' | 'records' | 'settings'

interface AppState {
  products: Product[]
  recordsByProduct: Record<string, DailyRecord[]>
  selectedProductId: string | null
  selectedTab: MainTab
  loading: boolean

  loadData: () => Promise<void>
  selectProduct: (productId: string) => void
  selectTab: (tab: MainTab) => void
  reset: () => void

  createProduct: (input: ProductInput) => Promise<Product>
  updateProduct: (id: string, input: Partial<ProductInput>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  createRecord: (productId: string, input: DailyRecordInput) => Promise<void>
  updateRecord: (id: string, productId: string, input: Partial<DailyRecordInput>) => Promise<void>
  deleteRecord: (id: string, productId: string) => Promise<void>
}

const INITIAL_STATE = {
  products: [] as Product[],
  recordsByProduct: {} as Record<string, DailyRecord[]>,
  selectedProductId: null as string | null,
  selectedTab: 'dashboard' as MainTab,
  loading: true,
}

export const useAppStore = create<AppState>((set, get) => ({
  ...INITIAL_STATE,

  loadData: async () => {
    const products = await productRepository.list()
    const lists = await Promise.all(
      products.map((product) => recordRepository.listByProduct(product.id)),
    )
    const recordsByProduct: Record<string, DailyRecord[]> = {}
    products.forEach((product, index) => {
      recordsByProduct[product.id] = lists[index]
    })

    const currentProductId = get().selectedProductId
    const selectedProductId =
      currentProductId && products.some((p) => p.id === currentProductId)
        ? currentProductId
        : (products[0]?.id ?? null)

    set({ products, recordsByProduct, selectedProductId, loading: false })
  },

  selectProduct: (productId) => {
    set({ selectedProductId: productId, selectedTab: 'dashboard' })
  },

  selectTab: (tab) => set({ selectedTab: tab }),

  reset: () => set({ ...INITIAL_STATE }),

  createProduct: async (input) => {
    const product = await productRepository.create(input)
    set((state) => ({
      products: [...state.products, product],
      recordsByProduct: { ...state.recordsByProduct, [product.id]: [] },
      selectedProductId: product.id,
      selectedTab: 'dashboard',
    }))
    return product
  },

  updateProduct: async (id, input) => {
    await productRepository.update(id, input)
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...input } : product,
      ),
    }))
  },

  deleteProduct: async (id) => {
    await productRepository.remove(id)
    set((state) => {
      const products = state.products.filter((product) => product.id !== id)
      const { [id]: _removed, ...recordsByProduct } = state.recordsByProduct
      const selectedProductId =
        state.selectedProductId === id ? (products[0]?.id ?? null) : state.selectedProductId
      return { products, recordsByProduct, selectedProductId }
    })
  },

  createRecord: async (productId, input) => {
    const record = await recordRepository.create(productId, input)
    set((state) => ({
      recordsByProduct: {
        ...state.recordsByProduct,
        [productId]: [...(state.recordsByProduct[productId] ?? []), record],
      },
    }))
  },

  updateRecord: async (id, productId, input) => {
    await recordRepository.update(id, input)
    set((state) => ({
      recordsByProduct: {
        ...state.recordsByProduct,
        [productId]: (state.recordsByProduct[productId] ?? []).map((record) =>
          record.id === id ? { ...record, ...input } : record,
        ),
      },
    }))
  },

  deleteRecord: async (id, productId) => {
    await recordRepository.remove(id)
    set((state) => ({
      recordsByProduct: {
        ...state.recordsByProduct,
        [productId]: (state.recordsByProduct[productId] ?? []).filter((record) => record.id !== id),
      },
    }))
  },
}))
