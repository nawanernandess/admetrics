import { create } from 'zustand'
import { deriveEncryptionKey, getOrCreateSalt, hashPassword } from '@/lib/crypto'
import {
  clearEncryptionKey,
  restoreEncryptionKeyFromSession,
  setEncryptionKey,
} from '@/lib/authSession'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD_HASH } from '@/lib/testUser'
import { useAppStore } from '@/store/useAppStore'

interface AuthState {
  isAuthenticated: boolean
  isRestoring: boolean
  isSubmitting: boolean
  error: string | null
  restoreSession: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isRestoring: true,
  isSubmitting: false,
  error: null,

  restoreSession: async () => {
    const restored = await restoreEncryptionKeyFromSession()
    set({ isAuthenticated: restored, isRestoring: false })
  },

  login: async (email, password) => {
    set({ isSubmitting: true, error: null })

    const passwordHash = await hashPassword(password)
    const isValid =
      email.trim().toLowerCase() === TEST_USER_EMAIL && passwordHash === TEST_USER_PASSWORD_HASH

    if (!isValid) {
      set({ isSubmitting: false, error: 'E-mail ou senha inválidos.' })
      return false
    }

    // A chave só existe a partir daqui — nunca fica em localStorage nem é
    // enviada a lugar nenhum. Fica em memória e, para sobreviver a um F5,
    // também na sessionStorage (limpa ao fechar a aba/navegador — ver
    // `authSession.ts`).
    const salt = getOrCreateSalt()
    const key = await deriveEncryptionKey(password, salt)
    await setEncryptionKey(key)

    set({ isAuthenticated: true, isSubmitting: false, error: null })
    return true
  },

  logout: () => {
    clearEncryptionKey()
    useAppStore.getState().reset()
    set({ isAuthenticated: false })
  },
}))
