import { create } from 'zustand'
import { preferenceRepository, productRepository, recordRepository } from '@/lib/repo'
import { DEFAULT_VISIBLE_COLUMN_IDS } from '@/lib/columns'
import type { DailyRecord, DailyRecordInput, Product, ProductInput } from '@/types'

export type MainTab = 'dashboard' | 'records' | 'settings'

interface AppState {
  products: Product[]
  recordsByProduct: Record<string, DailyRecord[]>
  selectedProductId: string | null
  selectedTab: MainTab
  loading: boolean
  recordsColumnIds: string[]
  recordsDateSortAsc: boolean

  loadData: () => Promise<void>
  selectProduct: (productId: string) => void
  selectTab: (tab: MainTab) => void
  setRecordsColumnIds: (columnIds: string[]) => Promise<void>
  setRecordsDateSortAsc: (asc: boolean) => Promise<void>
  reset: () => void

  createProduct: (input: ProductInput) => Promise<Product>
  updateProduct: (id: string, input: Partial<ProductInput>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  createRecord: (productId: string, input: DailyRecordInput) => Promise<void>
  updateRecord: (id: string, productId: string, input: Partial<DailyRecordInput>) => Promise<void>
  deleteRecords: (ids: string[], productId: string) => Promise<void>
}

const INITIAL_STATE = {
  products: [] as Product[],
  recordsByProduct: {} as Record<string, DailyRecord[]>,
  selectedProductId: null as string | null,
  selectedTab: 'dashboard' as MainTab,
  loading: true,
  recordsColumnIds: DEFAULT_VISIBLE_COLUMN_IDS,
  recordsDateSortAsc: true,
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

    const columnsPreference = await preferenceRepository.getRecordsColumns()
    const dateSortPreference = await preferenceRepository.getRecordsDateSort()

    set({
      products,
      recordsByProduct,
      selectedProductId,
      loading: false,
      recordsColumnIds: columnsPreference.visibleColumnIds,
      recordsDateSortAsc: dateSortPreference.dateSortAsc,
    })
  },

  selectProduct: (productId) => {
    set({ selectedProductId: productId, selectedTab: 'dashboard' })
  },

  selectTab: (tab) => set({ selectedTab: tab }),

  setRecordsColumnIds: async (columnIds) => {
    set({ recordsColumnIds: columnIds })
    await preferenceRepository.setRecordsColumns({ visibleColumnIds: columnIds })
  },

  setRecordsDateSortAsc: async (asc) => {
    set({ recordsDateSortAsc: asc })
    await preferenceRepository.setRecordsDateSort({ dateSortAsc: asc })
  },

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

  deleteRecords: async (ids, productId) => {
    await recordRepository.removeMany(ids)
    const idSet = new Set(ids)
    set((state) => ({
      recordsByProduct: {
        ...state.recordsByProduct,
        [productId]: (state.recordsByProduct[productId] ?? []).filter(
          (record) => !idSet.has(record.id),
        ),
      },
    }))
  },
}))
