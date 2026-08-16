import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'admetrics-theme'

function getPreferredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// Aplicado assim que o módulo é importado (antes do primeiro paint, já que
// App.tsx importa a cadeia que leva até aqui antes de createRoot().render).
const initialTheme = getPreferredTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark')
  },
}))
