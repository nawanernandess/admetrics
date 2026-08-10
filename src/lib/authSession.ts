import { exportKeyToBase64, importKeyFromBase64 } from '@/lib/crypto'

/**
 * Guarda a chave de criptografia em memória e, em paralelo, na sessionStorage
 * — sobrevive a F5/recarregar a página, mas é limpa ao fechar a aba/navegador
 * (comportamento nativo da sessionStorage) ou ao deslogar explicitamente.
 * Módulo plano (sem Zustand/React) para que `repo.ts` possa usá-lo sem
 * depender da camada de UI.
 */
const SESSION_STORAGE_KEY = 'admetrics.sessionKey'

let currentKey: CryptoKey | null = null

export async function setEncryptionKey(key: CryptoKey): Promise<void> {
  currentKey = key
  sessionStorage.setItem(SESSION_STORAGE_KEY, await exportKeyToBase64(key))
}

export function clearEncryptionKey(): void {
  currentKey = null
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

export function getEncryptionKey(): CryptoKey {
  if (!currentKey) {
    throw new Error('Nenhuma chave de criptografia disponível — usuário não autenticado.')
  }
  return currentKey
}

/** Tenta restaurar a chave da sessionStorage após um F5. Retorna se conseguiu. */
export async function restoreEncryptionKeyFromSession(): Promise<boolean> {
  const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!stored) return false

  try {
    currentKey = await importKeyFromBase64(stored)
    return true
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return false
  }
}
