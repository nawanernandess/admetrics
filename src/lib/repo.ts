import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import { decryptJson, encryptJson } from '@/lib/crypto'
import { getEncryptionKey } from '@/lib/authSession'
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
  remove(id: string): Promise<void>
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

  async remove(id: string): Promise<void> {
    await db.records.delete(id)
  }
}

export const productRepository: ProductRepository = new DexieProductRepository()
export const recordRepository: RecordRepository = new DexieRecordRepository()
