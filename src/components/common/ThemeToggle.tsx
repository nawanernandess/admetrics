import { useThemeStore } from '@/store/useThemeStore'

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M10 2.5v1.667M10 15.833V17.5M17.5 10h-1.667M4.167 10H2.5M15.303 4.697l-1.179 1.179M5.876 14.124l-1.179 1.179M15.303 15.303l-1.179-1.179M5.876 5.876 4.697 4.697"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M17.5 11.917A7.5 7.5 0 0 1 8.083 2.5a7.083 7.083 0 1 0 9.417 9.417Z"
      />
    </svg>
  )
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 ${className}`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
