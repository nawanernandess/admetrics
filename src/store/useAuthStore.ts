import { create } from 'zustand'
import { deriveEncryptionKey, getOrCreateSalt, hashPassword } from '@/lib/crypto'
import { clearEncryptionKey, setEncryptionKey } from '@/lib/authSession'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD_HASH } from '@/lib/testUser'
import { useAppStore } from '@/store/useAppStore'

interface AuthState {
  isAuthenticated: boolean
  isSubmitting: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isSubmitting: false,
  error: null,

  login: async (email, password) => {
    set({ isSubmitting: true, error: null })

    const passwordHash = await hashPassword(password)
    const isValid =
      email.trim().toLowerCase() === TEST_USER_EMAIL && passwordHash === TEST_USER_PASSWORD_HASH

    if (!isValid) {
      set({ isSubmitting: false, error: 'E-mail ou senha inválidos.' })
      return false
    }

    // A chave é derivada da senha só agora, em memória — nunca persistida.
    // Isso é o que torna a criptografia real: sem senha, sem chave, sem dados.
    const salt = getOrCreateSalt()
    const key = await deriveEncryptionKey(password, salt)
    setEncryptionKey(key)

    set({ isAuthenticated: true, isSubmitting: false, error: null })
    return true
  },

  logout: () => {
    clearEncryptionKey()
    useAppStore.getState().reset()
    set({ isAuthenticated: false })
  },
}))
