const PBKDF2_ITERATIONS = 150_000
const AES_KEY_LENGTH = 256
const SALT_STORAGE_KEY = 'admetrics.cryptoSalt'

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return btoa(String.fromCharCode(...view))
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

export async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * O salt não precisa ser secreto — só precisa ser único e estável para que a
 * mesma senha sempre derive a mesma chave. Por isso pode ficar em texto claro
 * no localStorage, ao lado dos dados já criptografados no IndexedDB.
 */
export function getOrCreateSalt(): Uint8Array {
  const stored = localStorage.getItem(SALT_STORAGE_KEY)
  if (stored) return fromBase64(stored)

  const salt = crypto.getRandomValues(new Uint8Array(16))
  localStorage.setItem(SALT_STORAGE_KEY, toBase64(salt))
  return salt
}

export async function deriveEncryptionKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt'],
  )
}

/** Exporta/reimporta a chave para poder guardá-la na sessionStorage entre reloads — ver `authSession.ts`. */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key)
  return toBase64(raw)
}

export async function importKeyFromBase64(base64: string): Promise<CryptoKey> {
  const raw = fromBase64(base64)
  return crypto.subtle.importKey('raw', raw as BufferSource, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ])
}

export interface EncryptedPayload {
  iv: string
  cipherText: string
}

export async function encryptJson(key: CryptoKey, value: unknown): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plainText = new TextEncoder().encode(JSON.stringify(value))
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainText)
  return { iv: toBase64(iv), cipherText: toBase64(cipherBuffer) }
}

export async function decryptJson<T>(key: CryptoKey, payload: EncryptedPayload): Promise<T> {
  const iv = fromBase64(payload.iv)
  const cipherBytes = fromBase64(payload.cipherText)
  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    cipherBytes as BufferSource,
  )
  return JSON.parse(new TextDecoder().decode(plainBuffer)) as T
}
