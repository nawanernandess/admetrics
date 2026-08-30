import { exportKeyToBase64, importKeyFromBase64 } from '@/lib/crypto'

/**
 * Guarda a chave de criptografia em memória e, em paralelo, na sessionStorage
 * — sobrevive a F5/recarregar a página, mas é limpa ao fechar a aba/navegador
 * (comportamento nativo da sessionStorage) ou ao deslogar explicitamente.
 * Quando o usuário marca "Lembrar" no login, a chave também vai para a
 * localStorage com uma data de expiração — sobrevive a fechar o navegador,
 * por até `REMEMBER_DURATION_MS` (7 dias).
 * Módulo plano (sem Zustand/React) para que `repo.ts` possa usá-lo sem
 * depender da camada de UI.
 */
const SESSION_STORAGE_KEY = 'admetrics.sessionKey'
const REMEMBER_STORAGE_KEY = 'admetrics.rememberKey'
export const REMEMBER_DURATION_MS = 7 * 24 * 60 * 60 * 1000

interface RememberedKey {
  key: string
  expiresAt: number
}

let currentKey: CryptoKey | null = null

export async function setEncryptionKey(key: CryptoKey, remember: boolean): Promise<void> {
  currentKey = key
  const base64 = await exportKeyToBase64(key)
  sessionStorage.setItem(SESSION_STORAGE_KEY, base64)

  if (remember) {
    const payload: RememberedKey = { key: base64, expiresAt: Date.now() + REMEMBER_DURATION_MS }
    localStorage.setItem(REMEMBER_STORAGE_KEY, JSON.stringify(payload))
  } else {
    localStorage.removeItem(REMEMBER_STORAGE_KEY)
  }
}

export function clearEncryptionKey(): void {
  currentKey = null
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
  localStorage.removeItem(REMEMBER_STORAGE_KEY)
}

export function getEncryptionKey(): CryptoKey {
  if (!currentKey) {
    throw new Error('Nenhuma chave de criptografia disponível — usuário não autenticado.')
  }
  return currentKey
}

/**
 * Tenta restaurar a chave após um F5 (sessionStorage) ou, se o usuário marcou
 * "Lembrar" numa sessão anterior e ainda não passaram 7 dias, da localStorage.
 * Retorna se conseguiu.
 */
export async function restoreEncryptionKeyFromSession(): Promise<boolean> {
  const sessionStored = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (sessionStored) {
    try {
      currentKey = await importKeyFromBase64(sessionStored)
      return true
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }

  const rememberedRaw = localStorage.getItem(REMEMBER_STORAGE_KEY)
  if (!rememberedRaw) return false

  try {
    const remembered = JSON.parse(rememberedRaw) as RememberedKey
    if (Date.now() >= remembered.expiresAt) {
      localStorage.removeItem(REMEMBER_STORAGE_KEY)
      return false
    }

    currentKey = await importKeyFromBase64(remembered.key)
    sessionStorage.setItem(SESSION_STORAGE_KEY, remembered.key)
    return true
  } catch {
    localStorage.removeItem(REMEMBER_STORAGE_KEY)
    return false
  }
}
