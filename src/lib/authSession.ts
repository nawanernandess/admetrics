/**
 * Guarda a chave de criptografia apenas em memória — nunca em localStorage,
 * sessionStorage ou IndexedDB. Isso é o que torna a criptografia real: ao
 * recarregar a página a chave desaparece e é preciso logar de novo para
 * derivá-la a partir da senha. Módulo plano (sem Zustand/React) para que
 * `repo.ts` possa usá-lo sem depender da camada de UI.
 */
let currentKey: CryptoKey | null = null

export function setEncryptionKey(key: CryptoKey): void {
  currentKey = key
}

export function clearEncryptionKey(): void {
  currentKey = null
}

export function getEncryptionKey(): CryptoKey {
  if (!currentKey) {
    throw new Error('Nenhuma chave de criptografia disponível — usuário não autenticado.')
  }
  return currentKey
}
