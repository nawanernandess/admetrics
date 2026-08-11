import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import { decryptJson, encryptJson } from '@/lib/crypto'
import { getEncryptionKey } from '@/lib/authSession'
import { DEFAULT_VISIBLE_COLUMN_IDS, sanitizeColumnIds } from '@/lib/columns'
import {
  DEFAULT_VISIBLE_DASHBOARD_CHART_IDS,
  sanitizeDashboardChartIds,
} from '@/lib/dashboardCharts'
import type { DailyRecord, DailyRecordInput, Product, ProductInput } from '@/types'

/**
 * Camada de acesso a dados isolada da UI. Na Fase 1 a implementação é
 * baseada em IndexedDB (Dexie), com o payload criptografado com a chave da
 * sessão atual (ver `authSession.ts`). Se e quando a Fase 4 (SaaS) começar,
 * uma implementação baseada em API REST/Postgres pode substituir a Dexie
 * sem que os consumidores (store, componentes) precisem mudar.
 */
export interface ProductRepository {
  list(): Promise<Product[]>
  create(input: ProductInput): Promise<Product>
  update(id: string, input: Partial<ProductInput>): Promise<void>
  remove(id: string): Promise<void>
}

export interface RecordRepository {
  listByProduct(productId: string): Promise<DailyRecord[]>
  create(productId: string, input: DailyRecordInput): Promise<DailyRecord>
  update(id: string, input: Partial<DailyRecordInput>): Promise<void>
  removeMany(ids: string[]): Promise<void>
}

class DexieProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    const rows = await db.products.toArray()
    const key = getEncryptionKey()
    return Promise.all(rows.map((row) => decryptJson<Product>(key, row)))
  }

  async create(input: ProductInput): Promise<Product> {
    const product: Product = { id: uuidv4(), ...input }
    const key = getEncryptionKey()
    const payload = await encryptJson(key, product)
    await db.products.add({ id: product.id, ...payload })
    return product
  }

  async update(id: string, input: Partial<ProductInput>): Promise<void> {
    const key = getEncryptionKey()
    const row = await db.products.get(id)
    if (!row) return
    const current = await decryptJson<Product>(key, row)
    const updated: Product = { ...current, ...input }
    const payload = await encryptJson(key, updated)
    await db.products.put({ id, ...payload })
  }

  async remove(id: string): Promise<void> {
    await db.transaction('rw', db.products, db.records, async () => {
      await db.records.where('productId').equals(id).delete()
      await db.products.delete(id)
    })
  }
}

class DexieRecordRepository implements RecordRepository {
  async listByProduct(productId: string): Promise<DailyRecord[]> {
    const rows = await db.records.where('productId').equals(productId).toArray()
    const key = getEncryptionKey()
    return Promise.all(rows.map((row) => decryptJson<DailyRecord>(key, row)))
  }

  async create(productId: string, input: DailyRecordInput): Promise<DailyRecord> {
    const record: DailyRecord = { id: uuidv4(), productId, ...input }
    const key = getEncryptionKey()
    const payload = await encryptJson(key, record)
    await db.records.add({ id: record.id, productId, ...payload })
    return record
  }

  async update(id: string, input: Partial<DailyRecordInput>): Promise<void> {
    const key = getEncryptionKey()
    const row = await db.records.get(id)
    if (!row) return
    const current = await decryptJson<DailyRecord>(key, row)
    const updated: DailyRecord = { ...current, ...input }
    const payload = await encryptJson(key, updated)
    await db.records.put({ id, productId: current.productId, ...payload })
  }

  async removeMany(ids: string[]): Promise<void> {
    await db.records.bulkDelete(ids)
  }
}

export const productRepository: ProductRepository = new DexieProductRepository()
export const recordRepository: RecordRepository = new DexieRecordRepository()

const RECORDS_COLUMNS_PREFERENCE_ID = 'records-table-columns'

const RECORDS_DATE_SORT_PREFERENCE_ID = 'records-table-date-sort'

const DASHBOARD_CHARTS_PREFERENCE_ID = 'dashboard-charts'

export interface RecordsColumnsPreference {
  visibleColumnIds: string[]
}

/** dateSortAsc=true → do dia que iniciou para o dia que finalizou (crescente), o padrão. */
export interface RecordsDateSortPreference {
  dateSortAsc: boolean
}

export interface DashboardChartsPreference {
  visibleChartIds: string[]
}

export interface PreferenceRepository {
  getRecordsColumns(): Promise<RecordsColumnsPreference>
  setRecordsColumns(preference: RecordsColumnsPreference): Promise<void>
  getRecordsDateSort(): Promise<RecordsDateSortPreference>
  setRecordsDateSort(preference: RecordsDateSortPreference): Promise<void>
  getDashboardCharts(): Promise<DashboardChartsPreference>
  setDashboardCharts(preference: DashboardChartsPreference): Promise<void>
}

class DexiePreferenceRepository implements PreferenceRepository {
  async getRecordsColumns(): Promise<RecordsColumnsPreference> {
    const row = await db.preferences.get(RECORDS_COLUMNS_PREFERENCE_ID)
    if (!row) return { visibleColumnIds: DEFAULT_VISIBLE_COLUMN_IDS }

    const key = getEncryptionKey()
    const preference = await decryptJson<RecordsColumnsPreference>(key, row)
    const visibleColumnIds = sanitizeColumnIds(preference.visibleColumnIds)
    return {
      visibleColumnIds: visibleColumnIds.length > 0 ? visibleColumnIds : DEFAULT_VISIBLE_COLUMN_IDS,
    }
  }

  async setRecordsColumns(preference: RecordsColumnsPreference): Promise<void> {
    const key = getEncryptionKey()
    const payload = await encryptJson(key, preference)
    await db.preferences.put({ id: RECORDS_COLUMNS_PREFERENCE_ID, ...payload })
  }

  async getRecordsDateSort(): Promise<RecordsDateSortPreference> {
    const row = await db.preferences.get(RECORDS_DATE_SORT_PREFERENCE_ID)
    if (!row) return { dateSortAsc: true }

    const key = getEncryptionKey()
    return decryptJson<RecordsDateSortPreference>(key, row)
  }

  async setRecordsDateSort(preference: RecordsDateSortPreference): Promise<void> {
    const key = getEncryptionKey()
    const payload = await encryptJson(key, preference)
    await db.preferences.put({ id: RECORDS_DATE_SORT_PREFERENCE_ID, ...payload })
  }

  async getDashboardCharts(): Promise<DashboardChartsPreference> {
    const row = await db.preferences.get(DASHBOARD_CHARTS_PREFERENCE_ID)
    if (!row) return { visibleChartIds: DEFAULT_VISIBLE_DASHBOARD_CHART_IDS }

    const key = getEncryptionKey()
    const preference = await decryptJson<DashboardChartsPreference>(key, row)
    const visibleChartIds = sanitizeDashboardChartIds(preference.visibleChartIds)
    return {
      visibleChartIds:
        visibleChartIds.length > 0 ? visibleChartIds : DEFAULT_VISIBLE_DASHBOARD_CHART_IDS,
    }
  }

  async setDashboardCharts(preference: DashboardChartsPreference): Promise<void> {
    const key = getEncryptionKey()
    const payload = await encryptJson(key, preference)
    await db.preferences.put({ id: DASHBOARD_CHARTS_PREFERENCE_ID, ...payload })
  }
}

export const preferenceRepository: PreferenceRepository = new DexiePreferenceRepository()
