import Dexie, { type Table } from 'dexie'
import type { EncryptedPayload } from '@/lib/crypto'

export interface EncryptedProductRow extends EncryptedPayload {
  id: string
}

export interface EncryptedRecordRow extends EncryptedPayload {
  id: string
  productId: string
}

export interface EncryptedPreferenceRow extends EncryptedPayload {
  id: string
}

export class AppDatabase extends Dexie {
  products!: Table<EncryptedProductRow, string>
  records!: Table<EncryptedRecordRow, string>
  preferences!: Table<EncryptedPreferenceRow, string>

  constructor() {
    super('admetrics')

    // v1 (pré-criptografia): tabelas em português, payload em texto claro.
    this.version(1).stores({
      produtos: 'id, nome',
      registros: 'id, produtoId, data, [produtoId+data]',
    })

    // v2: nomes em inglês e payload passa a ser um blob criptografado —
    // só `id`/`productId` seguem em claro, pois são necessários para
    // indexação/consulta no Dexie. Tabelas antigas são descartadas.
    this.version(2).stores({
      produtos: null,
      registros: null,
      products: 'id',
      records: 'id, productId',
    })

    // v3: tabela de preferências do usuário (ex.: colunas visíveis/ordem na
    // tabela de registros), mesmo padrão de payload criptografado.
    this.version(3).stores({
      preferences: 'id',
    })
  }
}

export const db = new AppDatabase()
